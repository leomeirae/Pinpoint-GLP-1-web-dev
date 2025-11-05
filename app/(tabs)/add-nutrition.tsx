import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { useGeminiChat } from '@/hooks/useGeminiChat';
import { useNutrition } from '@/hooks/useNutrition';
import { InstructionsCard } from '@/components/nutrition/InstructionsCard';
import { ChatMessage as ChatMessageComponent } from '@/components/nutrition/ChatMessage';
import { AudioRecorder } from '@/components/nutrition/AudioRecorder';
import { ConfirmationModal } from '@/components/nutrition/ConfirmationModal';
import { NutritionCard } from '@/components/nutrition/NutritionCard';
import { PaperPlaneRight, ChatCircle, ClockCounterClockwise } from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';

type Tab = 'chat' | 'history';

export default function NutritionChatScreen() {
  const colors = useShotsyColors();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [inputText, setInputText] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [savingLog, setSavingLog] = useState(false);

  const {
    messages,
    loading: chatLoading,
    sendMessage,
    getLastAssistantMessage,
    isConfigured,
  } = useGeminiChat();

  const {
    nutrition,
    loading: nutritionLoading,
    createOrUpdateNutrition,
    deleteNutritionByDate,
    refetch,
  } = useNutrition();

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && activeTab === 'chat') {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, activeTab]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    if (!isConfigured) {
      Alert.alert(
        'Configuração necessária',
        'A IA não está configurada. Por favor, adicione sua chave API do Google Gemini no arquivo .env'
      );
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const message = inputText.trim();
    setInputText('');
    inputRef.current?.blur();

    const assistantMessage = await sendMessage(message);

    // Show confirmation modal if we got a valid analysis
    if (assistantMessage?.analysis) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmLog = async () => {
    const lastMessage = getLastAssistantMessage();
    if (!lastMessage?.analysis) return;

    try {
      setSavingLog(true);

      const today = new Date();
      const dateString = today.toISOString().split('T')[0];

      await createOrUpdateNutrition({
        date: dateString,
        calories: lastMessage.analysis.calories,
        protein: lastMessage.analysis.protein,
        carbs: lastMessage.analysis.carbs,
        fats: lastMessage.analysis.fats,
        notes: lastMessage.analysis.summary,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setShowConfirmation(false);

      Alert.alert(
        'Sucesso! 🎉',
        'Seu registro de nutrição foi salvo.',
        [
          {
            text: 'Ver histórico',
            onPress: () => setActiveTab('history'),
          },
          { text: 'OK' },
        ]
      );

      // Refresh nutrition data
      await refetch();
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erro', error.message || 'Erro ao salvar registro');
    } finally {
      setSavingLog(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    const log = nutrition.find(n => n.id === id);
    if (!log) return;

    try {
      const dateString = new Date(log.date).toISOString().split('T')[0];
      await deleteNutritionByDate(dateString);
      await refetch();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao excluir registro');
    }
  };

  const handleTabChange = async (tab: Tab) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
    if (tab === 'history') {
      await refetch();
    }
  };

  const styles = getStyles(colors);

  const lastMessage = getLastAssistantMessage();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header with tabs */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nutrição com IA</Text>
        
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
            onPress={() => handleTabChange('chat')}
        >
            <ChatCircle
              size={20}
              color={activeTab === 'chat' ? colors.primary : colors.textSecondary}
              weight={activeTab === 'chat' ? 'fill' : 'regular'}
            />
            <Text style={[
              styles.tabText,
              activeTab === 'chat' && styles.activeTabText
            ]}>
              Chat
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.activeTab]}
            onPress={() => handleTabChange('history')}
          >
            <ClockCounterClockwise
              size={20}
              color={activeTab === 'history' ? colors.primary : colors.textSecondary}
              weight={activeTab === 'history' ? 'fill' : 'regular'}
            />
            <Text style={[
              styles.tabText,
              activeTab === 'history' && styles.activeTabText
            ]}>
              Histórico
            </Text>
          </TouchableOpacity>
        </View>
          </View>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              messages.length === 0 ? <InstructionsCard /> : null
            }
            renderItem={({ item }) => (
              <ChatMessageComponent
                role={item.role}
                content={item.content}
                timestamp={item.timestamp}
              />
            )}
            ListFooterComponent={
              chatLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.loadingText}>Analisando...</Text>
                </View>
              ) : null
            }
          />

          {/* Input area */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="Descreva o que você comeu..."
                placeholderTextColor={colors.textSecondary}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                editable={!chatLoading}
              />

              <View style={styles.inputActions}>
                <AudioRecorder
                  onRecordComplete={(text) => {
                    setInputText(text);
                  }}
                  disabled={chatLoading}
                />

                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    (!inputText.trim() || chatLoading) && styles.sendButtonDisabled
                  ]}
                  onPress={handleSendMessage}
                  disabled={!inputText.trim() || chatLoading}
                >
                  <PaperPlaneRight
                    size={20}
                    color={inputText.trim() && !chatLoading ? '#fff' : colors.textSecondary}
                    weight="bold"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <View style={styles.historyContainer}>
          {nutritionLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : nutrition.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>Nenhum registro ainda</Text>
              <Text style={styles.emptySubtext}>
                Use o chat para registrar suas refeições
              </Text>
              <TouchableOpacity
                style={styles.goToChatButton}
                onPress={() => handleTabChange('chat')}
              >
                <Text style={styles.goToChatButtonText}>Ir para o Chat</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={nutrition}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.historyContent}
              renderItem={({ item }) => (
                <NutritionCard
                  id={item.id}
                  date={item.date}
                  calories={item.calories}
                  protein={item.protein}
                  carbs={item.carbs}
                  fats={item.fats}
                  notes={item.notes}
                  onDelete={handleDeleteLog}
            />
              )}
            />
          )}
          </View>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showConfirmation}
        analysis={lastMessage?.analysis || null}
        onConfirm={handleConfirmLog}
        onCancel={() => setShowConfirmation(false)}
        loading={savingLog}
          />
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
  header: {
    paddingTop: 56,  // Mudança: 60 → 56px (consistência com Results e Settings)
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeTab: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
  },
  chatContent: {
    padding: 20,
    paddingBottom: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 14,
      color: colors.textSecondary,
  },
  inputContainer: {
    padding: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputWrapper: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
    },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    maxHeight: 100,
  },
  inputActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    },
  sendButtonDisabled: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
  },
  historyContainer: {
    flex: 1,
  },
  historyContent: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    marginBottom: 8,
    },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  goToChatButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    },
  goToChatButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    },
  });
