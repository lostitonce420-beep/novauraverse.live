import type { Message, Conversation } from '@/types';

const STORAGE_KEYS = {
  messages: 'novaura_messages',
  conversations: 'novaura_conversations',
};

// Initialize storage
export const initializeMessageStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.messages)) {
    localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.conversations)) {
    localStorage.setItem(STORAGE_KEYS.conversations, JSON.stringify([]));
  }
};

// Get all messages
export const getAllMessages = (): Message[] => {
  const data = localStorage.getItem(STORAGE_KEYS.messages);
  return data ? JSON.parse(data) : [];
};

// Get messages between two users
export const getMessagesBetween = (userId1: string, userId2: string): Message[] => {
  const messages = getAllMessages();
  return messages.filter(
    (m) =>
      (m.senderId === userId1 && m.recipientId === userId2) ||
      (m.senderId === userId2 && m.recipientId === userId1)
  ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

// Get conversations for a user
export const getUserConversations = (userId: string): Conversation[] => {
  const messages = getAllMessages();
  const conversations: Map<string, Conversation> = new Map();

  messages.forEach((message) => {
    if (message.senderId === userId || message.recipientId === userId) {
      const otherUserId = message.senderId === userId ? message.recipientId : message.senderId;
      
      if (!conversations.has(otherUserId)) {
        conversations.set(otherUserId, {
          id: `conv_${userId}_${otherUserId}`,
          participants: [], // Will be populated when fetching
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

// Send a message
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
  localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));

  return newMessage;
};

// Mark messages as read
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
    localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
  }
};

// Get unread count for a user
export const getUnreadCount = (userId: string): number => {
  const messages = getAllMessages();
  return messages.filter((m) => m.recipientId === userId && m.status !== 'read').length;
};

// Send system message to all users
export const sendSystemMessageToAll = async (content: string): Promise<void> => {
  const { getAllUsers } = await import('./userStorage');
  const users = getAllUsers();
  
  users.forEach((user: { id: string }) => {
    sendMessage('system', user.id, content, 'system');
  });
};

// Send system message to specific user
export const sendSystemMessage = (recipientId: string, content: string): Message => {
  return sendMessage('system', recipientId, content, 'system');
};

// Add owner as contact for new user
export const addOwnerAsContact = (newUserId: string): void => {
  const OWNER_ID = 'owner_dillan'; // This would be the actual owner user ID
  
  // Send welcome message from owner
  sendMessage(
    OWNER_ID,
    newUserId,
    `Welcome to NovAura Market! I'm Dillan, the founder. If you have any questions or need help, feel free to reach out. Happy creating!`,
    'text'
  );
};

// Send a message to a room (Group Chat)
export const sendRoomMessage = (
  senderId: string,
  roomId: string,
  content: string
): Message => {
  const messages = getAllMessages();
  
  const newMessage: Message = {
    id: `msg_room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    senderId,
    recipientId: roomId, // Use roomId as recipientId for rooms
    type: 'text',
    content,
    status: 'sent',
    createdAt: new Date().toISOString(),
  };

  messages.push(newMessage);
  localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));

  return newMessage;
};

// Get messages for a specific room
export const getRoomMessages = (roomId: string): Message[] => {
  const messages = getAllMessages();
  return messages.filter(
    (m) => m.recipientId === roomId
  ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

// Delete a message
export const deleteMessage = (messageId: string): void => {
  const messages = getAllMessages();
  const filtered = messages.filter((m) => m.id !== messageId);
  localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(filtered));
};
