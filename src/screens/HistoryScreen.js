import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { getConversations, getConversationDetails } from '../services/api';
import { COLORS, getGradeInfo } from '../constants/config';

export default function HistoryScreen({ navigation }) {
  const { userId } = useUser();
  const [localUserId, setLocalUserId] = useState(userId || '');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'quiz', 'chat'
  const [expandedId, setExpandedId] = useState(null);
  const [expandedDetails, setExpandedDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (localUserId) {
      fetchConversations();
    }
  }, [localUserId]);

  const fetchConversations = async () => {
    if (!localUserId.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await getConversations(localUserId);
      setConversations(response.conversations || []);
    } catch (err) {
      setError(err.message);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  };

  const handleLoadHistory = () => {
    if (localUserId.trim()) {
      fetchConversations();
    }
  };

  const handleToggleExpand = async (conversation) => {
    const id = `${conversation.topic_id}-${conversation.mode}`;
    
    if (expandedId === id) {
      setExpandedId(null);
      setExpandedDetails(null);
      return;
    }

    setExpandedId(id);
    setLoadingDetails(true);

    try {
      const response = await getConversationDetails(
        localUserId,
        conversation.topic_id,
        conversation.mode
      );
      setExpandedDetails(response.conversation);
    } catch (err) {
      console.error('Error loading details:', err);
      setExpandedDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredConversations = conversations.filter((conv) => {
    if (filter === 'all') return true;
    return conv.mode === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return COLORS.success;
      case 'in_progress':
        return COLORS.warning;
      default:
        return COLORS.textMuted;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
    >
      {/* User ID Input */}
      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>User ID</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Enter your user ID"
            placeholderTextColor={COLORS.textMuted}
            value={localUserId}
            onChangeText={setLocalUserId}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.loadButton} onPress={handleLoadHistory}>
            <Ionicons name="search" size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['all', 'quiz', 'chat'].map((filterOption) => (
          <TouchableOpacity
            key={filterOption}
            style={[styles.filterTab, filter === filterOption && styles.filterTabActive]}
            onPress={() => setFilter(filterOption)}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === filterOption && styles.filterTabTextActive,
              ]}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchConversations}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty State */}
      {!loading && !error && filteredConversations.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No History Found</Text>
          <Text style={styles.emptyText}>
            {localUserId
              ? 'Start a quiz or chat to see your history here'
              : 'Enter your user ID to load your history'}
          </Text>
        </View>
      )}

      {/* Conversations List */}
      {!loading && filteredConversations.length > 0 && (
        <View style={styles.listContainer}>
          {filteredConversations.map((conversation, index) => {
            const id = `${conversation.topic_id}-${conversation.mode}`;
            const isExpanded = expandedId === id;
            const percentage = conversation.max_possible_score
              ? Math.round((conversation.total_score / conversation.max_possible_score) * 100)
              : 0;
            const gradeInfo = getGradeInfo(percentage);

            return (
              <TouchableOpacity
                key={id + index}
                style={styles.conversationCard}
                onPress={() => handleToggleExpand(conversation)}
                activeOpacity={0.7}
              >
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <View
                      style={[
                        styles.modeBadge,
                        conversation.mode === 'quiz' ? styles.quizBadge : styles.chatBadge,
                      ]}
                    >
                      <Ionicons
                        name={conversation.mode === 'quiz' ? 'school' : 'chatbubbles'}
                        size={14}
                        color={COLORS.text}
                      />
                      <Text style={styles.modeBadgeText}>
                        {conversation.mode.toUpperCase()}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(conversation.status) }]}>
                      <Text style={styles.statusBadgeText}>{conversation.status}</Text>
                    </View>
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </View>

                {/* Topic ID */}
                <Text style={styles.topicId}>{conversation.topic_id}</Text>

                {/* Quiz Score */}
                {conversation.mode === 'quiz' && conversation.total_score !== undefined && (
                  <View style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>Score:</Text>
                    <Text style={[styles.scoreValue, { color: gradeInfo.color }]}>
                      {conversation.total_score}/{conversation.max_possible_score} ({percentage}%)
                    </Text>
                    <Text style={styles.gradeEmoji}>{gradeInfo.emoji}</Text>
                  </View>
                )}

                {/* Date */}
                <Text style={styles.dateText}>
                  {formatDate(conversation.updated_at || conversation.created_at)}
                </Text>

                {/* Expanded Details */}
                {isExpanded && (
                  <View style={styles.expandedContent}>
                    {loadingDetails ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : expandedDetails ? (
                      <View style={styles.messagesPreview}>
                        <Text style={styles.messagesTitle}>
                          {expandedDetails.messages?.length || 0} Messages
                        </Text>
                        {expandedDetails.messages?.slice(-5).map((msg, idx) => (
                          <View key={idx} style={styles.messagePreviewItem}>
                            <Text style={styles.messageRole}>
                              {msg.role === 'user' ? '👤' : '🤖'} {msg.role}:
                            </Text>
                            <Text style={styles.messagePreview} numberOfLines={2}>
                              {msg.content}
                            </Text>
                            {msg.score !== undefined && (
                              <Text style={styles.messageScore}>
                                Score: {msg.score}/{msg.max_score}
                              </Text>
                            )}
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.noDetailsText}>No details available</Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  
  // Input Card
  inputCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loadButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Filter Tabs
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTabTextActive: {
    color: COLORS.text,
  },
  
  // Loading
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  
  // Error
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  
  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  
  // List
  listContainer: {
    gap: 12,
  },
  conversationCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  quizBadge: {
    backgroundColor: COLORS.primary,
  },
  chatBadge: {
    backgroundColor: COLORS.secondary,
  },
  modeBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    color: COLORS.text,
    fontWeight: '600',
  },
  topicId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  gradeEmoji: {
    fontSize: 16,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  
  // Expanded
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  messagesPreview: {
    gap: 12,
  },
  messagesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  messagePreviewItem: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 8,
    padding: 12,
  },
  messageRole: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  messagePreview: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  messageScore: {
    fontSize: 12,
    color: COLORS.scoreGood,
    marginTop: 4,
    fontWeight: '600',
  },
  noDetailsText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
