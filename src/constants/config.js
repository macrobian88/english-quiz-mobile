// API Base URL - change this to your production URL
export const API_BASE_URL = 'http://localhost:3000';

// App Configuration
export const APP_CONFIG = {
  defaultQuestionsCount: 5,
  maxQuestionsCount: 10,
  minQuestionsCount: 1,
};

// Colors
export const COLORS = {
  // Primary colors
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  secondary: '#10B981',
  secondaryDark: '#059669',
  
  // Background colors
  background: '#111827',
  backgroundLight: '#1F2937',
  card: '#374151',
  cardLight: '#4B5563',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  
  // Score colors
  scorePerfect: '#10B981',    // Green (score 5)
  scoreGreat: '#34D399',      // Light green (score 4)
  scoreGood: '#FBBF24',       // Yellow (score 3)
  scoreNeedsWork: '#F97316',  // Orange (score 1-2)
  scoreIncorrect: '#EF4444', // Red (score 0)
  
  // Chat bubble colors
  userBubble: '#3B82F6',
  botBubble: '#374151',
  
  // Status colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Border colors
  border: '#374151',
  borderLight: '#4B5563',
  
  // Transparent
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// Grade Configuration
export const GRADES = {
  A: { min: 90, emoji: '🎉', label: 'Excellent!', color: COLORS.scorePerfect },
  B: { min: 80, emoji: '👍', label: 'Great job!', color: COLORS.scoreGreat },
  C: { min: 70, emoji: '😊', label: 'Good work!', color: COLORS.scoreGood },
  D: { min: 60, emoji: '💪', label: 'Keep practicing!', color: COLORS.scoreNeedsWork },
  F: { min: 0, emoji: '📚', label: 'More practice needed', color: COLORS.scoreIncorrect },
};

// Get score color based on score value (0-5)
export const getScoreColor = (score) => {
  if (score === 5) return COLORS.scorePerfect;
  if (score === 4) return COLORS.scoreGreat;
  if (score === 3) return COLORS.scoreGood;
  if (score >= 1) return COLORS.scoreNeedsWork;
  return COLORS.scoreIncorrect;
};

// Get grade info based on percentage
export const getGradeInfo = (percentage) => {
  if (percentage >= 90) return GRADES.A;
  if (percentage >= 80) return GRADES.B;
  if (percentage >= 70) return GRADES.C;
  if (percentage >= 60) return GRADES.D;
  return GRADES.F;
};
