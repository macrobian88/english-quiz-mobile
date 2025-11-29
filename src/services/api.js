import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    console.error('[API] Response Error:', message);
    return Promise.reject(new Error(message));
  }
);

// ==================== TOPICS API ====================

export const getTopics = async () => {
  const response = await api.get('/api/admin/topics');
  return response.data;
};

export const getTopic = async (topicId) => {
  const response = await api.get(`/api/admin/topics/${topicId}`);
  return response.data;
};

// ==================== QUIZ API ====================

export const startQuiz = async (userId, topicId, totalQuestions = 5) => {
  const response = await api.post('/api/quiz/start', {
    user_id: userId,
    topic_id: topicId,
    total_questions: totalQuestions,
  });
  return response.data;
};

export const submitAnswer = async (userId, topicId, answer) => {
  const response = await api.post('/api/quiz/answer', {
    user_id: userId,
    topic_id: topicId,
    answer,
  });
  return response.data;
};

export const getQuizStatus = async (userId, topicId) => {
  const response = await api.get(`/api/quiz/status`, {
    params: { user_id: userId, topic_id: topicId },
  });
  return response.data;
};

// ==================== CHAT API ====================

export const sendChatMessage = async (userId, topicId, message) => {
  const response = await api.post('/api/chat', {
    user_id: userId,
    topic_id: topicId,
    message,
  });
  return response.data;
};

// ==================== CONVERSATIONS API ====================

export const getConversations = async (userId) => {
  const response = await api.get('/api/conversations', {
    params: { user_id: userId },
  });
  return response.data;
};

export const getConversationDetails = async (userId, topicId, mode) => {
  const response = await api.get(`/api/conversations/${topicId}`, {
    params: { user_id: userId, mode },
  });
  return response.data;
};

export const deleteConversation = async (userId, topicId, mode) => {
  const response = await api.delete(`/api/conversations/${topicId}`, {
    params: { user_id: userId, mode },
  });
  return response.data;
};

export default api;
