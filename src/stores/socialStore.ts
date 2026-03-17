import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Notification, 
  FollowedCreator, 
  SocialPost, 
  ForumThread, 
  JobPost 
} from '@/types';
import { 
  getGlobalFeed, 
  createPost as serviceCreatePost,
  toggleLike,
  addPostComment
} from '@/services/socialService';
import { getThreads, getJobs } from '@/services/communityService';

interface SocialState {
  // Follow state
  followedCreators: FollowedCreator[];

  // Notification state
  notifications: Notification[];
  unreadCount: number;

  // Social Feed state
  globalFeed: SocialPost[];
  
  // Community state
  threads: ForumThread[];
  jobs: JobPost[];

  // Actions
  refreshFeed: () => void;
  createPost: (userId: string, content: string, mediaUrls?: string[], tags?: string[]) => void;
  likePost: (postId: string, userId: string) => void;
  addComment: (postId: string, authorId: string, content: string) => void;
  refreshCommunity: () => void;

  // Follow actions
  followCreator: (userId: string, username: string, avatar?: string) => void;
  unfollowCreator: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
  getFollowedCreators: () => FollowedCreator[];

  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  removeNotification: (notificationId: string) => void;
}

export const useSocialStore = create<SocialState>()(
  persist(
    (set: any, get: () => SocialState) => ({
      followedCreators: [],
      notifications: [],
      unreadCount: 0,
      globalFeed: [],
      threads: [],
      jobs: [],

      refreshFeed: () => {
        set({ globalFeed: getGlobalFeed() });
      },

      createPost: (userId: string, content: string, mediaUrls = [], tags = []) => {
        serviceCreatePost(userId, content, mediaUrls, tags);
        get().refreshFeed();
      },

      likePost: (postId: string, userId: string) => {
        toggleLike(postId, userId);
        get().refreshFeed();
      },

      addComment: (postId: string, authorId: string, content: string) => {
        addPostComment(postId, authorId, content);
        get().refreshFeed();
      },

      refreshCommunity: () => {
        set({ 
          threads: getThreads(),
          jobs: getJobs()
        });
      },

      followCreator: (userId: string, username: string, avatar?: string) => {
        const { followedCreators, addNotification } = get();
        if (followedCreators.some((c: FollowedCreator) => c.userId === userId)) return;

        const newFollow: FollowedCreator = {
          userId,
          username,
          avatar,
          followedAt: new Date().toISOString(),
        };

        set({ followedCreators: [...followedCreators, newFollow] });

        addNotification({
          type: 'follow',
          title: `Following ${username}`,
          message: `You'll now receive updates when ${username} publishes new content.`,
          creatorId: userId,
          creatorUsername: username,
        });
      },

      unfollowCreator: (userId: string) => {
        const { followedCreators } = get();
        set({
          followedCreators: followedCreators.filter((c: FollowedCreator) => c.userId !== userId),
        });
      },

      isFollowing: (userId: string) => {
        return get().followedCreators.some((c: FollowedCreator) => c.userId === userId);
      },

      getFollowedCreators: () => {
        return get().followedCreators;
      },

      addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          read: false,
          createdAt: new Date().toISOString(),
        };

        const currentNotifications = get().notifications;
        const updated = [newNotification, ...currentNotifications].slice(0, 100);
        set({
          notifications: updated,
          unreadCount: updated.filter((n: Notification) => !n.read).length,
        });
      },

      markNotificationRead: (notificationId: string) => {
        const { notifications } = get();
        const updated = notifications.map((n: Notification) =>
          n.id === notificationId ? { ...n, read: true } : n
        );
        set({
          notifications: updated,
          unreadCount: updated.filter((n: Notification) => !n.read).length,
        });
      },

      markAllNotificationsRead: () => {
        const { notifications } = get();
        set({
          notifications: notifications.map((n: Notification) => ({ ...n, read: true })),
          unreadCount: 0,
        });
      },

      clearNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      removeNotification: (notificationId: string) => {
        const { notifications } = get();
        const updated = notifications.filter((n: Notification) => n.id !== notificationId);
        set({
          notifications: updated,
          unreadCount: updated.filter((n: Notification) => !n.read).length,
        });
      },
    }),
    {
      name: 'novaura-social',
      partialize: (state) => ({ 
        followedCreators: state.followedCreators,
        notifications: state.notifications,
        unreadCount: state.unreadCount
      }),
    }
  )
);
