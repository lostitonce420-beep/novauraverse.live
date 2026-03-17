import type { ForumThread, ForumReply, JobPost, JobApplication, JobType } from '@/types';
import { getUserById } from './userStorage';

const STORAGE_KEYS = {
  threads: 'novaura_forum_threads',
  replies: 'novaura_forum_replies',
  jobs: 'novaura_jobs',
  applications: 'novaura_job_applications',
};

// Initialize storage
export const initializeCommunityStorage = () => {
  const keys = Object.values(STORAGE_KEYS);
  keys.forEach(key => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify([]));
    }
  });
};

// --- FORUM LOGIC ---

export const getThreads = (category?: ForumThread['category']): ForumThread[] => {
  const data = localStorage.getItem(STORAGE_KEYS.threads);
  let threads: ForumThread[] = data ? JSON.parse(data) : [];
  
  if (category) {
    threads = threads.filter(t => t.category === category);
  }
  
  return threads.map(t => ({
    ...t,
    author: getUserById(t.authorId)
  })).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.lastReplyAt || b.createdAt).getTime() - new Date(a.lastReplyAt || a.createdAt).getTime();
  });
};

export const getThreadById = (id: string): ForumThread | undefined => {
  const threads = getThreads();
  return threads.find(t => t.id === id);
};

export const createThread = (
  authorId: string,
  title: string,
  content: string,
  category: ForumThread['category'],
  tags: string[] = []
): ForumThread => {
  const threads = JSON.parse(localStorage.getItem(STORAGE_KEYS.threads) || '[]');
  
  const newThread: ForumThread = {
    id: `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    authorId,
    title,
    content,
    category,
    tags,
    views: 0,
    replyCount: 0,
    lastReplyAt: new Date().toISOString(),
    isPinned: false,
    isLocked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  threads.push(newThread);
  localStorage.setItem(STORAGE_KEYS.threads, JSON.stringify(threads));
  
  return { ...newThread, author: getUserById(authorId) };
};

export const getReplies = (threadId: string): ForumReply[] => {
  const data = localStorage.getItem(STORAGE_KEYS.replies);
  const replies: ForumReply[] = data ? JSON.parse(data) : [];
  
  return replies
    .filter(r => r.threadId === threadId)
    .map(r => ({
      ...r,
      author: getUserById(r.authorId)
    }))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

export const addReply = (
  threadId: string,
  authorId: string,
  content: string
): ForumReply => {
  const replies = JSON.parse(localStorage.getItem(STORAGE_KEYS.replies) || '[]');
  
  const newReply: ForumReply = {
    id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    threadId,
    authorId,
    content,
    likes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  replies.push(newReply);
  localStorage.setItem(STORAGE_KEYS.replies, JSON.stringify(replies));
  
  // Update thread stats
  const threads = JSON.parse(localStorage.getItem(STORAGE_KEYS.threads) || '[]');
  const threadIndex = threads.findIndex((t: ForumThread) => t.id === threadId);
  if (threadIndex !== -1) {
    threads[threadIndex].replyCount++;
    threads[threadIndex].lastReplyAt = newReply.createdAt;
    localStorage.setItem(STORAGE_KEYS.threads, JSON.stringify(threads));
  }
  
  return { ...newReply, author: getUserById(authorId) };
};

// --- JOB BOARD LOGIC ---

export const getJobs = (filters?: { category?: JobPost['category']; type?: JobType }): JobPost[] => {
  const data = localStorage.getItem(STORAGE_KEYS.jobs);
  let jobs: JobPost[] = data ? JSON.parse(data) : [];
  
  if (filters?.category) {
    jobs = jobs.filter(j => j.category === filters.category);
  }
  if (filters?.type) {
    jobs = jobs.filter(j => j.jobType === filters.type);
  }
  
  return jobs.map(j => ({
    ...j,
    recruiter: getUserById(j.recruiterId)
  })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const createJob = (
  recruiterId: string,
  data: Omit<JobPost, 'id' | 'recruiterId' | 'status' | 'applications' | 'createdAt'>
): JobPost => {
  const jobs = JSON.parse(localStorage.getItem(STORAGE_KEYS.jobs) || '[]');
  
  const newJob: JobPost = {
    ...data,
    id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    recruiterId,
    status: 'open',
    applications: 0,
    createdAt: new Date().toISOString(),
  };
  
  jobs.push(newJob);
  localStorage.setItem(STORAGE_KEYS.jobs, JSON.stringify(jobs));
  
  return { ...newJob, recruiter: getUserById(recruiterId) };
};

export const applyForJob = (
  jobId: string,
  applicantId: string,
  data: Omit<JobApplication, 'id' | 'jobId' | 'applicantId' | 'status' | 'createdAt'>
): JobApplication => {
  const applications = JSON.parse(localStorage.getItem(STORAGE_KEYS.applications) || '[]');
  
  const newApplication: JobApplication = {
    ...data,
    id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    jobId,
    applicantId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  
  applications.push(newApplication);
  localStorage.setItem(STORAGE_KEYS.applications, JSON.stringify(applications));
  
  // Update job application count
  const jobs = JSON.parse(localStorage.getItem(STORAGE_KEYS.jobs) || '[]');
  const jobIndex = jobs.findIndex((j: JobPost) => j.id === jobId);
  if (jobIndex !== -1) {
    jobs[jobIndex].applications++;
    localStorage.setItem(STORAGE_KEYS.jobs, JSON.stringify(jobs));
  }
  
  return { ...newApplication, applicant: getUserById(applicantId) };
};
