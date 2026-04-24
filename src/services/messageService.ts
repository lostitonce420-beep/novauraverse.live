import type { Message, Conversation } from '@/types';
import { db, isFirebaseConfigured } from '../config/firebase';
import { collection, addDoc, query, onSnapshot, orderBy, serverTimestamp, doc, setDoc, getDocs } from 'firebase/firestore';
import { kernelStorage } from '@/kernel/kernelStorage.js';

const STORAGE_KEYS = {
  messages: 'novaura_messages',
  conversations: 'novaura_conversations',
};

// Internal sync tracker
let _isListeningToFirebase = false;

// Initialize storage and start Firebase sync
export const initializeMessageStorage = () => {
  if (!kernelStorage.getItem(STORAGE_KEYS.messages)) {
    kernelStorage.setItem(STORAGE_KEYS.messages, JSON.stringify([]));
  }
  if (!kernelStorage.getItem(STORAGE_KEYS.conversations)) {
    kernelStorage.setItem(STORAGE_KEYS.conversations, JSON.stringify([]));
  }

  // Bind bidirectional Firestore sync if available
  if (isFirebaseConfigured && !_isListeningToFirebase) {
    _isListeningToFirebase = true;
    try {
      // Sync global chat rooms
      const rooms = ['ROOM_CREATORS', 'ROOM_DEVS'];
      rooms.forEach(roomId => {
        const q = query(collection(db as any, 'social_chat_rooms', roomId, 'messages'), orderBy('createdAt', 'asc'));
        onSnapshot(q, (snapshot) => {
          let messages = getAllMessages();
          let hasChanges = false;
          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            // Map Firestore data to Unified schema
            if (!messages.find(m => m.id === docSnap.id)) {
              messages.push({
                id: docSnap.id,
                senderId: data.authorId || data.senderId || 'unknown',
                recipientId: roomId,
                type: 'text',
                content: data.text || data.content || '',
                status: 'sent',
                createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString(),
              });
              hasChanges = true;
            }
          });
          if (hasChanges) kernelStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
        });
      });
      // NOTE: Direct messages require querying across social_dm_threads, which is complex locally. 
      // For immediate launch, we sync rooms perfectly.
    } catch (e) {
      console.warn('Firebase message sync error:', e);
    }
  }
};

// Get all messages synchronously (UI dependency)
export const getAllMessages = (): Message[] => {
  const data = kernelStorage.getItem(STORAGE_KEYS.messages);
  return data ? JSON.parse(data) : [];
};

export const getMessagesBetween = (userId1: string, userId2: string): Message[] => {
  const messages = getAllMessages();
  return messages.filter(
    (m) =>
      (m.senderId === userId1 && m.recipientId === userId2) ||
      (m.senderId === userId2 && m.recipientId === userId1)
  ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

export const getUserConversations = (userId: string): Conversation[] => {
  const messages = getAllMessages();
  const conversations: Map<string, Conversation> = new Map();

  messages.forEach((message) => {
    if (message.senderId === userId || message.recipientId === userId) {
      const otherUserId = message.senderId === userId ? message.recipientId : message.senderId;
      
      if (!conversations.has(otherUserId)) {
        conversations.set(otherUserId, {
          id: `conv_${userId}_${otherUserId}`,
          participants: [],
          lastMessage: message,
          unreadCount: message.recipientId === userId && message.status !== 'read' ? 1 : 0,
          updatedAt: message.createdAt,
        });
      } else {
        const conv = conversations.get(otherUserId)!;
        if (new Date(message.createdAt) > new Date(conv.updatedAt)) {
          conv.lastMessage = message;
          conv.updatedAt = message.createdAt;
        }
        if (message.recipientId === userId && message.status !== 'read') {
          conv.unreadCount++;
        }
      }
    }
  });

  return Array.from(conversations.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
};

// Push message to Firebase & Local Storage
export const sendMessage = (
  senderId: string,
  recipientId: string,
  content: string,
  type: Message['type'] = 'text',
  contractData?: Message['contractData']
): Message => {
  const messages = getAllMessages();
  
  const newMessage: Message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    senderId,
    recipientId,
    type,
    content,
    contractData,
    status: 'sent',
    createdAt: new Date().toISOString(),
  };

  messages.push(newMessage);
  kernelStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));

  // Push to Firebase for sync with WebOS
  if (isFirebaseConfigured) {
    try {
      const threadId = [senderId, recipientId].sort().join('_');
      addDoc(collection(db as any, 'social_dm_threads', threadId, 'messages'), {
        senderId,
        content,
        text: content, // WebOS uses 'text' field
        type,
        read: false,
        createdAt: Date.now()
      });
      setDoc(doc(db as any, 'social_dm_threads', threadId), {
        participants: [senderId, recipientId],
        lastMessage: content,
        lastAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('Failed to push DM to Firebase', e);
    }
  }

  return newMessage;
};

export const markMessagesAsRead = (userId: string, senderId: string): void => {
  const messages = getAllMessages();
  let updated = false;

  messages.forEach((message) => {
    if (message.recipientId === userId && message.senderId === senderId && message.status !== 'read') {
      message.status = 'read';
      message.readAt = new Date().toISOString();
      updated = true;
    }
  });

  if (updated) {
    kernelStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
  }
};

export const getUnreadCount = (userId: string): number => {
  const messages = getAllMessages();
  return messages.filter((m) => m.recipientId === userId && m.status !== 'read').length;
};

export const sendSystemMessageToAll = async (content: string): Promise<void> => {
  if (!db) return;
  const usersSnapshot = await getDocs(collection(db, 'users'));
  usersSnapshot.docs.forEach((userDoc) => {
    sendMessage('system', userDoc.id, content, 'system');
  });
};

export const sendSystemMessage = (recipientId: string, content: string): Message => {
  return sendMessage('system', recipientId, content, 'system');
};

export const addOwnerAsContact = (newUserId: string): void => {
  const OWNER_ID = 'owner_dillan';
  sendMessage(
    OWNER_ID,
    newUserId,
    `Welcome to NovAura Market! I'm Dillan, the founder. If you have any questions or need help, feel free to reach out. Happy creating!`,
    'text'
  );
};

// Send Room Message syncing to Firebase & Local Storage
export const sendRoomMessage = (
  senderId: string,
  roomId: string,
  content: string
): Message => {
  const messages = getAllMessages();
  
  const newMessage: Message = {
    id: `msg_room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    senderId,
    recipientId: roomId,
    type: 'text',
    content,
    status: 'sent',
    createdAt: new Date().toISOString(),
  };

  messages.push(newMessage);
  kernelStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));

  // Push to Firebase for cross-platform sync
  if (isFirebaseConfigured) {
    try {
      addDoc(collection(db as any, 'social_chat_rooms', roomId, 'messages'), {
        authorId: senderId,
        text: content, // WebOS expects 'text'
        content: content,
        createdAt: Date.now()
      });
    } catch (e) {
      console.warn('Failed to push room message to Firebase', e);
    }
  }

  return newMessage;
};

export const getRoomMessages = (roomId: string): Message[] => {
  const messages = getAllMessages();
  return messages.filter(
    (m) => m.recipientId === roomId
  ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

export const deleteMessage = (messageId: string): void => {
  const messages = getAllMessages();
  const filtered = messages.filter((m) => m.id !== messageId);
  kernelStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(filtered));
};
