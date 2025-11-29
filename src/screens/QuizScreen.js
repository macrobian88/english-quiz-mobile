import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { getTopics, startQuiz, submitAnswer } from '../services/api';
import { COLORS, APP_CONFIG, getScoreColor, getGradeInfo } from '../constants/config';

// Quiz States
const STATES = {
  SETUP: 'setup',
  LOADING: 'loading',
  QUESTION: 'question',
  FEEDBACK: 'feedback',
  RESULTS: 'results',
};

export default function QuizScreen({ navigation }) {
  const { userId } = useUser();
  
  // Setup state
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [questionCount, setQuestionCount] = useState(APP_CONFIG.defaultQuestionsCount);
  const [showTopicPicker, setShowTopicPicker] = useState(false);
  
  // Quiz state
  const [quizState, setQuizState] = useState(STATES.SETUP);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [finalResults, setFinalResults] = useState(null);
  const [progress, setProgress] = useState({ current_score: 0, max_possible_score: 0 });
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await getTopics();
      setTopics(response.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStartQuiz = async () => {
    if (!selectedTopic) {
      alert('Please select a topic');
      return;
    }

    try {
      setQuizState(STATES.LOADING);
      setError(null);
      
      const response = await startQuiz(userId, selectedTopic.topic_id, questionCount);
      
      setCurrentQuestion(response.question);
      setQuestionNumber(response.question_number);
      setTotalQuestions(response.total_questions);
      setProgress({ current_score: 0, max_possible_score: 0 });
      setQuizState(STATES.QUESTION);
    } catch (err) {
      setError(err.message);
      setQuizState(STATES.SETUP);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      alert('Please enter an answer');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await submitAnswer(userId, selectedTopic.topic_id, answer);
      
      setEvaluation(response.evaluation);
      
      if (response.status === 'completed') {
        setFinalResults(response.final_results);
        setQuizState(STATES.FEEDBACK);
      } else {
        setProgress(response.progress);
        setQuizState(STATES.FEEDBACK);
        
        // Store next question for after feedback
        setCurrentQuestion(response.next_question);
        setQuestionNumber(response.question_number);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (finalResults) {
      setQuizState(STATES.RESULTS);
    } else {
      setAnswer('');
      setEvaluation(null);
      setQuizState(STATES.QUESTION);
    }
  };

  const handleRestart = () => {
    setQuizState(STATES.SETUP);
    setCurrentQuestion(null);
    setAnswer('');
    setEvaluation(null);
    setFinalResults(null);
    setProgress({ current_score: 0, max_possible_score: 0 });
  };

  // Render Setup Screen
  const renderSetup = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.setupCard}>
        <Text style={styles.setupTitle}>Quiz Setup</Text>
        
        {/* Topic Selection */}
        <Text style={styles.label}>Select Topic</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowTopicPicker(true)}
        >
          <Ionicons name="book-outline" size={20} color={COLORS.textSecondary} />
          <Text style={[styles.pickerText, !selectedTopic && styles.placeholder]}>
            {selectedTopic ? selectedTopic.title : 'Choose a topic'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {/* Question Count */}
        <Text style={styles.label}>Number of Questions</Text>
        <View style={styles.countContainer}>
          <TouchableOpacity
            style={styles.countButton}
            onPress={() => setQuestionCount(Math.max(APP_CONFIG.minQuestionsCount, questionCount - 1))}
          >
            <Ionicons name="remove" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.countText}>{questionCount}</Text>
          <TouchableOpacity
            style={styles.countButton}
            onPress={() => setQuestionCount(Math.min(APP_CONFIG.maxQuestionsCount, questionCount + 1))}
          >
            <Ionicons name="add" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.startButton, !selectedTopic && styles.startButtonDisabled]}
          onPress={handleStartQuiz}
          disabled={!selectedTopic}
        >
          <Ionicons name="play" size={24} color={COLORS.text} />
          <Text style={styles.startButtonText}>Start Quiz</Text>
        </TouchableOpacity>
      </View>

      {/* Topic Picker Modal */}
      <Modal
        visible={showTopicPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTopicPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Topic</Text>
              <TouchableOpacity onPress={() => setShowTopicPicker(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.topicList}>
              {topics.map((topic) => (
                <TouchableOpacity
                  key={topic.topic_id}
                  style={[
                    styles.topicItem,
                    selectedTopic?.topic_id === topic.topic_id && styles.topicItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedTopic(topic);
                    setShowTopicPicker(false);
                  }}
                >
                  <Text style={styles.topicItemText}>{topic.title}</Text>
                  {topic.metadata?.difficulty && (
                    <View style={[styles.difficultyBadge, styles[`difficulty${topic.metadata.difficulty}`]]}>
                      <Text style={styles.difficultyText}>{topic.metadata.difficulty}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );

  // Render Loading Screen
  const renderLoading = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Preparing your quiz...</Text>
    </View>
  );

  // Render Question Screen
  const renderQuestion = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((questionNumber - 1) / totalQuestions) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Question {questionNumber} of {totalQuestions}
        </Text>
      </View>

      {/* Score Display */}
      <View style={styles.scoreDisplay}>
        <Ionicons name="star" size={20} color={COLORS.scoreGood} />
        <Text style={styles.scoreText}>
          Score: {progress.current_score}/{progress.max_possible_score}
        </Text>
      </View>

      {/* Question Card */}
      <View style={styles.questionCard}>
        <View style={styles.questionBadge}>
          <Text style={styles.questionBadgeText}>Q{questionNumber}</Text>
        </View>
        <Text style={styles.questionText}>{currentQuestion}</Text>
      </View>

      {/* Answer Input */}
      <View style={styles.answerContainer}>
        <Text style={styles.label}>Your Answer</Text>
        <TextInput
          style={styles.answerInput}
          placeholder="Type your answer here..."
          placeholderTextColor={COLORS.textMuted}
          value={answer}
          onChangeText={setAnswer}
          multiline
          numberOfLines={3}
        />
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmitAnswer}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.text} />
        ) : (
          <>
            <Text style={styles.submitButtonText}>Submit Answer</Text>
            <Ionicons name="send" size={20} color={COLORS.text} />
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  // Render Feedback Screen
  const renderFeedback = () => {
    const scoreColor = getScoreColor(evaluation?.score || 0);
    
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Score Badge */}
        <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
          <Text style={styles.scoreBadgeText}>{evaluation?.score || 0}/5</Text>
        </View>

        {/* Feedback Card */}
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackSummary}>
            {evaluation?.feedback?.summary || 'Thanks for your answer!'}
          </Text>
          
          <Text style={styles.feedbackExplanation}>
            {evaluation?.feedback?.explanation || ''}
          </Text>

          {evaluation?.feedback?.correct_answer && (
            <View style={styles.feedbackSection}>
              <Text style={styles.feedbackLabel}>Correct Answer:</Text>
              <Text style={styles.feedbackValue}>{evaluation.feedback.correct_answer}</Text>
            </View>
          )}

          {evaluation?.feedback?.grammar_tip && (
            <View style={styles.feedbackSection}>
              <View style={styles.feedbackTipHeader}>
                <Ionicons name="bulb-outline" size={18} color={COLORS.scoreGood} />
                <Text style={styles.feedbackLabel}>Grammar Tip:</Text>
              </View>
              <Text style={styles.feedbackValue}>{evaluation.feedback.grammar_tip}</Text>
            </View>
          )}

          {evaluation?.feedback?.example && (
            <View style={styles.feedbackSection}>
              <Text style={styles.feedbackLabel}>Example:</Text>
              <Text style={styles.feedbackExample}>"{evaluation.feedback.example}"</Text>
            </View>
          )}
        </View>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>
            {finalResults ? 'See Results' : 'Next Question'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </ScrollView>
    );
  };

  // Render Results Screen
  const renderResults = () => {
    const gradeInfo = getGradeInfo(finalResults?.percentage || 0);
    
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Celebration */}
        <Text style={styles.celebrationEmoji}>{gradeInfo.emoji}</Text>
        
        {/* Grade Card */}
        <View style={[styles.gradeCard, { borderColor: gradeInfo.color }]}>
          <Text style={[styles.gradeText, { color: gradeInfo.color }]}>
            Grade: {finalResults?.grade}
          </Text>
          <Text style={styles.gradeLabel}>{gradeInfo.label}</Text>
        </View>

        {/* Score Circle */}
        <View style={styles.scoreCircle}>
          <Text style={styles.scorePercentage}>{finalResults?.percentage || 0}%</Text>
          <Text style={styles.scoreDetail}>
            {finalResults?.total_score}/{finalResults?.max_possible_score}
          </Text>
        </View>

        {/* Performance Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Performance</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Questions:</Text>
            <Text style={styles.statValue}>{finalResults?.performance?.total_questions}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Perfect Answers:</Text>
            <Text style={[styles.statValue, { color: COLORS.scorePerfect }]}>
              {finalResults?.performance?.perfect_answers}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Good Answers:</Text>
            <Text style={[styles.statValue, { color: COLORS.scoreGreat }]}>
              {finalResults?.performance?.good_answers}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.resultActions}>
          <TouchableOpacity style={styles.retryButton} onPress={handleRestart}>
            <Ionicons name="refresh" size={20} color={COLORS.primary} />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Ionicons name="home" size={20} color={COLORS.text} />
            <Text style={styles.homeButtonText}>Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // Main render switch
  switch (quizState) {
    case STATES.LOADING:
      return renderLoading();
    case STATES.QUESTION:
      return renderQuestion();
    case STATES.FEEDBACK:
      return renderFeedback();
    case STATES.RESULTS:
      return renderResults();
    default:
      return renderSetup();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  
  // Setup styles
  setupCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
  },
  setupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginTop: 16,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pickerText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  placeholder: {
    color: COLORS.textMuted,
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  countButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    minWidth: 60,
    textAlign: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    gap: 8,
  },
  startButtonDisabled: {
    backgroundColor: COLORS.cardLight,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  topicList: {
    padding: 16,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: COLORS.backgroundLight,
  },
  topicItemSelected: {
    backgroundColor: COLORS.primary,
  },
  topicItemText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultybeginner: {
    backgroundColor: COLORS.scorePerfect,
  },
  difficultyintermediate: {
    backgroundColor: COLORS.scoreGood,
  },
  difficultyadvanced: {
    backgroundColor: COLORS.scoreIncorrect,
  },
  difficultyText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '600',
  },
  
  // Question styles
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.card,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  questionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  questionBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  questionBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  questionText: {
    fontSize: 20,
    color: COLORS.text,
    lineHeight: 28,
  },
  answerContainer: {
    marginBottom: 20,
  },
  answerInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.cardLight,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  
  // Feedback styles
  scoreBadge: {
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 50,
    marginBottom: 24,
  },
  scoreBadgeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  feedbackCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  feedbackSummary: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  feedbackExplanation: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  feedbackSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  feedbackTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  feedbackLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  feedbackValue: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  feedbackExample: {
    fontSize: 16,
    color: COLORS.text,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  
  // Results styles
  celebrationEmoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  gradeCard: {
    alignSelf: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 3,
    backgroundColor: COLORS.card,
    marginBottom: 24,
  },
  gradeText: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gradeLabel: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  scoreCircle: {
    alignSelf: 'center',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 4,
    borderColor: COLORS.primary,
  },
  scorePercentage: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scoreDetail: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  statsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  homeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
});
