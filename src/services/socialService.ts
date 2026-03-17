import type { SocialPost, SocialComment } from '@/types';
import { getUserById } from './userStorage';

const STORAGE_KEYS = {
  posts: 'novaura_social_posts',
  comments: 'novaura_social_comments',
};

// Initialize storage
export const initializeSocialStorage = () => {
  const existingPosts = localStorage.getItem(STORAGE_KEYS.posts);
  if (!existingPosts) {
    localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.comments)) {
    localStorage.setItem(STORAGE_KEYS.comments, JSON.stringify([]));
  }
};

// Get all posts (World Feed)
export const getGlobalFeed = (): SocialPost[] => {
  const data = localStorage.getItem(STORAGE_KEYS.posts);
  const posts: SocialPost[] = data ? JSON.parse(data) : [];
  
  // Enrich with creator data
  return posts.map(post => ({
    ...post,
    creator: getUserById(post.creatorId)
  })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Get posts for a specific user profile
export const getUserPosts = (userId: string): SocialPost[] => {
  const allPosts = getGlobalFeed();
  return allPosts.filter(post => post.creatorId === userId);
};

// Create a social post
export const createPost = (
  userId: string,
  content: string,
  mediaUrls: string[] = [],
  tags: string[] = []
): SocialPost => {
  const storedPosts = JSON.parse(localStorage.getItem(STORAGE_KEYS.posts) || '[]');
  
  const newPost: SocialPost = {
    id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    creatorId: userId,
    content,
    mediaUrls,
    likes: 0,
    comments: 0,
    likedBy: [],
    tags,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  storedPosts.push(newPost);
  localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(storedPosts));

  return { ...newPost, creator: getUserById(userId) };
};

// Like/Unlike a post
export const toggleLike = (postId: string, userId: string): boolean => {
  const data = localStorage.getItem(STORAGE_KEYS.posts);
  if (!data) return false;
  
  const posts: SocialPost[] = JSON.parse(data);
  const postIndex = posts.findIndex(p => p.id === postId);
  
  if (postIndex === -1) return false;
  
  const post = posts[postIndex];
  const likedBy = post.likedBy || [];
  const userIndex = likedBy.indexOf(userId);
  
  if (userIndex === -1) {
    // Like
    likedBy.push(userId);
    post.likes++;
  } else {
    // Unlike
    likedBy.splice(userIndex, 1);
    post.likes--;
  }
  
  post.likedBy = likedBy;
  localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(posts));
  return userIndex === -1; // returns true if liked, false if unliked
};

// Get comments for a post
export const getPostComments = (postId: string): SocialComment[] => {
  const data = localStorage.getItem(STORAGE_KEYS.comments);
  const comments: SocialComment[] = data ? JSON.parse(data) : [];
  
  return comments
    .filter(c => c.postId === postId)
    .map(c => ({
      ...c,
      author: getUserById(c.authorId)
    }))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

// Add a comment
export const addPostComment = (
  postId: string,
  authorId: string,
  content: string
): SocialComment => {
  const data = localStorage.getItem(STORAGE_KEYS.comments);
  const comments: SocialComment[] = data ? JSON.parse(data) : [];
  
  const newComment: SocialComment = {
    id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    postId,
    authorId,
    content,
    likes: 0,
    createdAt: new Date().toISOString(),
  };
  
  comments.push(newComment);
  localStorage.setItem(STORAGE_KEYS.comments, JSON.stringify(comments));
  
  // Update post comment count
  const postData = localStorage.getItem(STORAGE_KEYS.posts);
  if (postData) {
    const posts: SocialPost[] = JSON.parse(postData);
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex !== -1) {
      posts[postIndex].comments++;
      localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(posts));
    }
  }
  
  return { ...newComment, author: getUserById(authorId) };
};

// Delete a post
export const deletePost = (postId: string, userId: string): boolean => {
  const data = localStorage.getItem(STORAGE_KEYS.posts);
  if (!data) return false;
  
  const posts: SocialPost[] = JSON.parse(data);
  const filtered = posts.filter(p => !(p.id === postId && p.creatorId === userId));
  
  if (posts.length === filtered.length) return false;
  
  localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(filtered));
  return true;
};
