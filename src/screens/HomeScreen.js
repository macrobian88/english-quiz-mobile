import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { getTopics } from '../services/api';
import { COLORS } from '../constants/config';

export default function HomeScreen({ navigation }) {
  const { userId, setUserId, isLoading: userLoading } = useUser();
  const [localUserId, setLocalUserId] = useState('');
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      setLocalUserId(userId);
    }
  }, [userId]);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTopics();
      setTopics(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUserId = () => {
    if (localUserId.trim()) {
      setUserId(localUserId.trim());
    }
  };

  const handleNavigate = (screen) => {
    if (!localUserId.trim()) {
      alert('Please enter a User ID first');
      return;
    }
    handleSaveUserId();
    navigation.navigate(screen);
  };

  if (userLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>📚</Text>
        <Text style={styles.title}>English Quiz Master</Text>
        <Text style={styles.subtitle}>Learn English with AI-powered quizzes and chat</Text>
      </View>

      {/* User ID Input */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your User ID</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Enter your user ID"
            placeholderTextColor={COLORS.textMuted}
            value={localUserId}
            onChangeText={setLocalUserId}
            onBlur={handleSaveUserId}
            autoCapitalize="none"
          />
          {userId === localUserId && localUserId.length > 0 && (
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
          )}
        </View>
        <Text style={styles.hint}>This ID will be used to track your progress</Text>
      </View>

      {/* Main Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionCard, styles.quizCard]}
          onPress={() => handleNavigate('Quiz')}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="school-outline" size={32} color={COLORS.text} />
          </View>
          <Text style={styles.actionTitle}>Start Quiz</Text>
          <Text style={styles.actionDescription}>
            Test your knowledge with AI-generated questions
          </Text>
          <View style={styles.actionArrow}>
            <Ionicons name="arrow-forward" size={20} color={COLORS.text} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, styles.chatCard]}
          onPress={() => handleNavigate('Chat')}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="chatbubbles-outline" size={32} color={COLORS.text} />
          </View>
          <Text style={styles.actionTitle}>Chat with Tutor</Text>
          <Text style={styles.actionDescription}>
            Ask questions and learn from AI tutor
          </Text>
          <View style={styles.actionArrow}>
            <Ionicons name="arrow-forward" size={20} color={COLORS.text} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Topics Preview */}
      <View style={styles.topicsSection}>
        <Text style={styles.sectionTitle}>Available Topics</Text>
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchTopics}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.topicsList}>
            {topics.slice(0, 5).map((topic) => (
              <View key={topic.topic_id} style={styles.topicChip}>
                <Text style={styles.topicChipText}>{topic.title}</Text>
              </View>
            ))}
            {topics.length > 5 && (
              <View style={styles.topicChip}>
                <Text style={styles.topicChipText}>+{topics.length - 5} more</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* History Link */}
      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => handleNavigate('History')}
      >
        <Ionicons name="time-outline" size={20} color={COLORS.primary} />
        <Text style={styles.historyButtonText}>View My History</Text>
        <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
      </TouchableOpacity>
    </ScrollView>
  );
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 8,
  },
  actionsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  actionCard: {
    borderRadius: 16,
    padding: 20,
    position: 'relative',
  },
  quizCard: {
    backgroundColor: COLORS.primary,
  },
  chatCard: {
    backgroundColor: COLORS.secondary,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  actionArrow: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  topicsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicChip: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  topicChipText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: COLORS.error,
    marginBottom: 8,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.card,
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  historyButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    flex: 1,
  },
});
