import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  Search, 
  MoreVertical, 
  Paperclip,
  Check,
  CheckCheck,
  ArrowLeft,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { 
  getUserConversations, 
  getMessagesBetween, 
  sendMessage, 
  markMessagesAsRead,
  getUnreadCount,
  initializeMessageStorage,
  getRoomMessages,
  sendRoomMessage
} from '@/services/messageService';
import { getUserById } from '@/services/userStorage';
import type { Message } from '@/types';

const CHANNELS = [
  { id: 'ROOM_CREATORS', name: 'Creators Hub', role: 'creator', description: 'Exclusive space for creative pros', icon: 'Sparkles' },
  { id: 'ROOM_DEVS', name: 'Dev Sanctuary', role: 'admin', description: 'Behind-the-scenes engineering talk', icon: 'Shield' },
];

export default function MessagesPage() {
  const { userId: conversationUserId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Define load functions with useCallback BEFORE useEffect hooks that use them
  const loadConversations = useCallback(() => {
    if (!currentUser) return;
    const convs = getUserConversations(currentUser.id);
    
    // Enrich with user data
    const enrichedConvs = convs.map((conv) => {
      const otherUserId = conv.lastMessage?.senderId === currentUser.id 
        ? conv.lastMessage?.recipientId 
        : conv.lastMessage?.senderId;
      const otherUser = getUserById(otherUserId || '');
      return { ...conv, otherUser };
    }).filter((conv) => conv.otherUser);

    setConversations(enrichedConvs);
  }, [currentUser]);

  const loadMessages = useCallback((otherUserId: string) => {
    if (!currentUser) return;
    if (otherUserId.startsWith('ROOM_')) {
      setMessages(getRoomMessages(otherUserId));
      return;
    }
    const msgs = getMessagesBetween(currentUser.id, otherUserId);
    setMessages(msgs);
    markMessagesAsRead(currentUser.id, otherUserId);
    setUnreadCount(getUnreadCount(currentUser.id));
    loadConversations();
  }, [currentUser, loadConversations]);

  useEffect(() => {
    if (!currentUser) return;
    initializeMessageStorage();
    loadConversations();
    setUnreadCount(getUnreadCount(currentUser.id));

    // If conversationUserId is provided, load that conversation
    if (conversationUserId) {
      if (conversationUserId.startsWith('ROOM_')) {
        const room = CHANNELS.find(c => c.id === conversationUserId);
        if (room) {
          setActiveRoomId(room.id);
          setActiveConversation(null);
          setMessages(getRoomMessages(room.id));
        }
      } else {
        const otherUser = getUserById(conversationUserId);
        if (otherUser) {
          setActiveRoomId(null);
          setActiveConversation(otherUser);
          loadMessages(otherUser.id);
        }
      }
    }
  }, [currentUser, conversationUserId, loadConversations, loadMessages]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !currentUser) return;

    if (activeRoomId) {
      sendRoomMessage(currentUser.id, activeRoomId, messageInput.trim());
      setMessageInput('');
      setMessages(getRoomMessages(activeRoomId));
    } else if (activeConversation) {
      sendMessage(currentUser.id, activeConversation.id, messageInput.trim());
      setMessageInput('');
      loadMessages(activeConversation.id);
      loadConversations();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectConversation = (conv: any) => {
    setActiveRoomId(null);
    setActiveConversation(conv.otherUser);
    loadMessages(conv.otherUser.id);
    navigate(`/messages/${conv.otherUser.id}`);
  };

  const handleSelectRoom = (roomId: string) => {
    setActiveConversation(null);
    setActiveRoomId(roomId);
    setMessages(getRoomMessages(roomId));
    navigate(`/messages/${roomId}`);
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.otherUser?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary">Please log in to view messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-void-light border border-white/5 rounded-2xl overflow-hidden h-[calc(100vh-12rem)]">
            <div className="grid grid-cols-1 md:grid-cols-3 h-full">
              {/* Conversations List */}
              <div className={`border-r border-white/5 ${activeConversation ? 'hidden md:block' : ''}`}>
                {/* Header */}
                <div className="p-4 border-b border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading text-xl font-bold text-text-primary">
                      Messages
                      {unreadCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-neon-magenta text-white text-xs rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </h2>
                  </div>

                  {/* Channels Section */}
                  <div className="mb-4">
                    <p className="text-[10px] uppercase font-bold text-text-muted px-2 mb-2 tracking-wider">Channels</p>
                    <div className="space-y-1">
                      {CHANNELS.filter(c => currentUser?.role === 'admin' || currentUser?.role === c.role).map((channel) => (
                        <button
                          key={channel.id}
                          onClick={() => handleSelectRoom(channel.id)}
                          className={`w-full p-2 flex items-center gap-3 hover:bg-white/5 transition-colors rounded-lg px-3 ${
                            activeRoomId === channel.id ? 'bg-white/5 text-neon-cyan' : 'text-text-secondary'
                          }`}
                        >
                          {channel.icon === 'Shield' ? <Shield className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                          <span className="text-sm font-medium">{channel.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-[10px] uppercase font-bold text-text-muted px-2 mb-2 tracking-wider">Direct Messages</p>
                  <div className="relative mb-4 px-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <Input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 py-2 bg-void border-white/10 text-text-primary placeholder:text-text-muted"
                    />
                  </div>
                </div>

                {/* Conversation List */}
                <div className="overflow-y-auto h-[calc(100%-6rem)]">
                  {filteredConversations.length === 0 ? (
                    <div className="text-center py-8 text-text-muted">
                      <MessageCircle className="w-10 h-10 mx-auto mb-2" />
                      <p className="text-sm">No conversations yet</p>
                    </div>
                  ) : (
                    filteredConversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => handleSelectConversation(conv)}
                        className={`w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5 ${
                          activeConversation?.id === conv.otherUser?.id ? 'bg-white/5' : ''
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={conv.otherUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.otherUser?.username}`}
                            alt={conv.otherUser?.username}
                            className="w-12 h-12 rounded-full bg-void"
                          />
                          {conv.unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-neon-magenta rounded-full text-xs flex items-center justify-center text-white">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex-grow text-left overflow-hidden">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-text-primary truncate">
                              {conv.otherUser?.username}
                            </span>
                            <span className="text-xs text-text-muted">
                              {conv.lastMessage && new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-text-primary' : 'text-text-muted'}`}>
                            {conv.lastMessage?.type === 'system' ? (
                              <span className="flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                System message
                              </span>
                            ) : (
                              conv.lastMessage?.content
                            )}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Message Area */}
              <div className={`md:col-span-2 flex flex-col ${!(activeConversation || activeRoomId) ? 'hidden md:flex' : ''}`}>
                {(activeConversation || activeRoomId) ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-white/5 flex items-center gap-4">
                      <button
                        onClick={() => {
                          setActiveConversation(null);
                          setActiveRoomId(null);
                          navigate('/messages');
                        }}
                        className="md:hidden p-2 text-text-muted hover:text-text-primary"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      {activeRoomId ? (
                        <div className="w-10 h-10 rounded-full bg-neon-cyan/20 flex items-center justify-center border border-neon-cyan/20">
                          <MessageCircle className="w-5 h-5 text-neon-cyan" />
                        </div>
                      ) : (
                        <img
                          src={activeConversation?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeConversation?.username}`}
                          alt={activeConversation?.username}
                          className="w-10 h-10 rounded-full bg-void"
                        />
                      )}
                      <div className="flex-grow">
                        <h3 className="font-medium text-text-primary">
                          {activeRoomId ? CHANNELS.find(c => c.id === activeRoomId)?.name : activeConversation?.username}
                        </h3>
                        <p className="text-xs text-text-muted">
                          {activeRoomId 
                            ? CHANNELS.find(c => c.id === activeRoomId)?.description 
                            : (activeConversation?.role === 'admin' ? 'Admin' : activeConversation?.role === 'creator' ? 'Creator' : 'Member')}
                        </p>
                      </div>
                      <button className="p-2 text-text-muted hover:text-text-primary">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-grow overflow-y-auto p-4 space-y-4">
                      {messages.map((message) => {
                        const isOwn = message.senderId === currentUser.id;
                        const isSystem = message.type === 'system';

                        return (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            {isSystem ? (
                              <div className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg">
                                <Shield className="w-4 h-4 text-neon-cyan" />
                                <span className="text-sm text-neon-cyan">{message.content}</span>
                              </div>
                            ) : (
                              <div
                                className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                                  isOwn
                                    ? 'bg-neon-cyan text-void rounded-br-md'
                                    : 'bg-void border border-white/10 rounded-bl-md'
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-void/60' : 'text-text-muted'}`}>
                                  <span className="text-xs">
                                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  {isOwn && (
                                    message.status === 'read' ? (
                                      <CheckCheck className="w-3 h-3" />
                                    ) : (
                                      <Check className="w-3 h-3" />
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-white/5">
                      <div className="flex items-center gap-3">
                        <button className="p-2 text-text-muted hover:text-text-primary transition-colors">
                          <Paperclip className="w-5 h-5" />
                        </button>
                        <Input
                          type="text"
                          placeholder="Type a message..."
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="flex-grow bg-void border-white/10 text-text-primary placeholder:text-text-muted"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!messageInput.trim()}
                          className="bg-neon-cyan text-void font-bold disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <MessageCircle className="w-20 h-20 text-text-muted mb-4" />
                    <h3 className="font-heading text-xl font-bold text-text-primary mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-text-secondary">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
