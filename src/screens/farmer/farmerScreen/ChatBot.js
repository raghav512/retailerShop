import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  FlatList,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Switch,
  DeviceEventEmitter,
  PermissionsAndroid,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import { Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SpeechService from './SpeechService';
import Tts from 'react-native-tts';
import HelloRobot from '../../../animations/HelloRobot.json';
import { API_BASE_URL } from '@env';
import { FARMER_COLORS } from '../../../colorsList/ColorList';

// Constants
const MAX_DAILY_CHATS = 10;
const API_TIMEOUT = 30000;

// User-specific storage keys
const getUserChatCountKey = userId => `dailyChatCount_${userId}`;
const getUserDateKey = userId => `lastChatDate_${userId}`;

export default function ChatBox({ navigation }) {
  // State management
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [botTyping, setBotTyping] = useState(false);
  const [dailyChatCount, setDailyChatCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Refs
  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const isSendingRef = useRef(false);
  const isInitializedRef = useRef(false);

  // ==================== Utility Functions ====================

  const formatTime = useCallback(time => {
    return moment(time, 'YYYY-MM-DD HH:mm:ss').fromNow();
  }, []);

  const formatDateSeparator = useCallback(time => {
    const msgDate = moment(time, 'YYYY-MM-DD HH:mm:ss').startOf('day');
    const today = moment().startOf('day');
    const diffDays = today.diff(msgDate, 'days');

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return moment(time, 'YYYY-MM-DD HH:mm:ss').format('DD MMM YYYY');
  }, []);

  const getMessagesWithSeparators = useCallback(
    msgs => {
      let lastDate = null;
      const result = [];

      msgs.forEach(msg => {
        const msgDay = moment(msg.time, 'YYYY-MM-DD HH:mm:ss')
          .startOf('day')
          .format();

        if (lastDate !== msgDay) {
          result.push({
            id: `sep-${msg.id}`,
            type: 'separator',
            text: formatDateSeparator(msg.time),
          });
          lastDate = msgDay;
        }

        result.push({ ...msg, type: 'message' });
      });

      return result;
    },
    [formatDateSeparator],
  );

  const scrollToEnd = useCallback((animated = true) => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated });
    }, 100);
  }, []);

  // ==================== Chat Limit Management ====================

  const loadChatLimit = useCallback(async currentUserId => {
    try {
      if (!currentUserId) {
        setDailyChatCount(0);
        return;
      }

      const userChatCountKey = getUserChatCountKey(currentUserId);
      const userDateKey = getUserDateKey(currentUserId);

      const storedDate = await AsyncStorage.getItem(userDateKey);
      const storedCount = await AsyncStorage.getItem(userChatCountKey);
      const today = moment().format('YYYY-MM-DD');

      if (storedDate === today && storedCount) {
        setDailyChatCount(parseInt(storedCount, 10));
      } else {
        // New day or no stored data - count today's messages from history
        try {
          const { data } = await axios.get(
            `${API_BASE_URL}/api/chat/chatHistory/${currentUserId}`,
            { timeout: API_TIMEOUT },
          );

          if (data.status === 'success' && data.data.chat_history) {
            const todaysUserMessages = data.data.chat_history.filter(
              item =>
                item.role === 'user' &&
                moment(item.time, 'YYYY-MM-DD HH:mm:ss').format(
                  'YYYY-MM-DD',
                ) === today,
            );

            const count = todaysUserMessages.length;
            setDailyChatCount(count);
            await AsyncStorage.setItem(userChatCountKey, count.toString());
          }
        } catch (error) {
          console.error("Error counting today's messages:", error);
          setDailyChatCount(0);
        }

        await AsyncStorage.multiSet([
          [userDateKey, today],
          [userChatCountKey, '0'],
        ]);
      }
    } catch (error) {
      console.error('Error loading chat limit:', error);
      setDailyChatCount(0);
    }
  }, []);

  const incrementChatCount = useCallback(async () => {
    if (!userId) return;

    const newCount = dailyChatCount + 1;
    setDailyChatCount(newCount);

    try {
      const userChatCountKey = getUserChatCountKey(userId);
      await AsyncStorage.setItem(userChatCountKey, newCount.toString());
    } catch (error) {
      console.error('Error saving chat count:', error);
    }
  }, [dailyChatCount, userId]);

  // ==================== API Calls ====================

  const fetchChatHistory = useCallback(async id => {
    try {
      const cleanUrl = `${API_BASE_URL}/api/chat/chatHistory/${id}`.replace(/([^:])\/{2,}/g, '$1/');
      const { data } = await axios.get(cleanUrl, { timeout: API_TIMEOUT });

      if (data.status === 'success' && data.data.chat_history) {
        const history = data.data.chat_history
          .slice()
          .reverse()
          .map((item, index) => ({
            id: `history-${index}-${Date.now()}`,
            text: item.message,
            sender: item.role === 'assistant' ? 'bot' : 'user',
            time: item.time,
            type: 'message',
          }));

        setMessages(history);
        return history.length > 0;
      }
      return false;
    } catch (err) {
      console.error('Error fetching chat history:', err.message);
      return false;
    }
  }, []);

  const sendMessageToBot = useCallback(
    async messageText => {
      if (!messageText?.trim() || !userId) {
        console.warn('Missing message or userId');
        return;
      }

      setBotTyping(true);

      try {
        const cleanUrl = `${API_BASE_URL}/api/chat/chatBot`.replace(/([^:])\/{2,}/g, '$1/');
        console.log('🔵 Sending to:', cleanUrl);
        
        const response = await axios.post(
          cleanUrl,
          {
            user_id: userId,
            query: messageText.trim(),
            language: 'English',
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 60000, // Increased to 60s for cold start
          },
        );

        const botText =
          response.data?.answer ||
          response.data?.response ||
          "Sorry, I couldn't understand that. Please try again.";

        // Speak the answer if voice is enabled
        if (voiceEnabled) {
          Tts.stop();
          Tts.speak(botText);
        }

        const newBotMsg = {
          id: `bot-${Date.now()}`,
          text: botText,
          sender: 'bot',
          time: moment().format('YYYY-MM-DD HH:mm:ss'),
          type: 'message',
        };

        setMessages(prev => [...prev, newBotMsg]);
        scrollToEnd();
      } catch (err) {
        console.error('Bot API error:', err);
        console.error('Error code:', err.code);
        console.error('Error response:', err.response?.status);
        console.error('Error URL:', err.config?.url);

        // Determine specific error type
        let botText = "Sorry, something went wrong. Please try again.";

        if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
          botText = '⏱️ Server is waking up (cold start). Please wait 30 seconds and try again.';
        } else if (
          err.message?.includes('Network Error') ||
          err.code === 'ERR_NETWORK' ||
          !err.response
        ) {
          botText = "📡 Can't reach the server. Please check your internet connection and try again.";
        } else if (err.response?.status === 404) {
          botText = '❌ Chat service endpoint not found. Please contact support.';
        } else if (err.response?.status === 500) {
          botText = '🔧 Server error occurred. Please try again in a moment.';
        } else if (err.response?.status >= 400 && err.response?.status < 500) {
          botText = '⚠️ Invalid request. Please try rephrasing your question.';
        }

        const errMsg = {
          id: `bot-error-${Date.now()}`,
          text: botText,
          sender: 'bot',
          time: moment().format('YYYY-MM-DD HH:mm:ss'),
          type: 'message',
        };

        setMessages(prev => [...prev, errMsg]);
        scrollToEnd();
      } finally {
        setBotTyping(false);
      }
    },
    [userId, scrollToEnd, voiceEnabled],
  );

  // ==================== Message Handling ====================

  const sendMessage = useCallback(async () => {
    // Prevent duplicate sends
    if (isSendingRef.current) return;

    const messageText = input.trim();
    if (!messageText) return;

    // Check daily limit BEFORE processing
    if (dailyChatCount >= MAX_DAILY_CHATS) {
      const limitMsg = {
        id: `limit-${Date.now()}`,
        text: `You've reached your daily limit of ${MAX_DAILY_CHATS} questions. Your limit will reset tomorrow! 🌅`,
        sender: 'bot',
        time: moment().format('YYYY-MM-DD HH:mm:ss'),
        type: 'message',
      };
      setMessages(prev => [...prev, limitMsg]);
      setInput('');
      scrollToEnd();
      return;
    }

    if (!userId) {
      const errMsg = {
        id: `error-${Date.now()}`,
        text: 'Unable to send message. Please restart the app.',
        sender: 'bot',
        time: moment().format('YYYY-MM-DD HH:mm:ss'),
        type: 'message',
      };
      setMessages(prev => [...prev, errMsg]);
      return;
    }

    // Lock sending
    isSendingRef.current = true;

    // Add user message
    const newUserMsg = {
      id: `user-${Date.now()}`,
      text: messageText,
      sender: 'user',
      time: moment().format('YYYY-MM-DD HH:mm:ss'),
      type: 'message',
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    scrollToEnd();

    // Increment count
    await incrementChatCount();

    // Send to bot
    setTimeout(() => {
      sendMessageToBot(messageText);
      isSendingRef.current = false;
    }, 150);
  }, [
    input,
    userId,
    dailyChatCount,
    sendMessageToBot,
    incrementChatCount,
    scrollToEnd,
  ]);

  // ==================== User Initialization ====================

  const createWelcomeMessage = useCallback(
    name => ({
      id: 'welcome-1',
      text: `Hello ${name}! 👋\nWelcome to Retail Management System AI 🌾\n\nI'm your smart farming assistant — here to help you with crop planning, weather updates, government schemes, and agri-tech insights.\n\nHow may I help you today?`,
      sender: 'bot',
      time: moment().format('YYYY-MM-DD HH:mm:ss'),
      type: 'message',
    }),
    [],
  );

  const initializeUser = useCallback(async () => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    try {
      let foundUserId = null;
      let foundUserName = 'User';

      // Try multiple storage keys
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        foundUserId = userData.id || userData._id;
        foundUserName =
          userData.name || userData.username || userData.fullName || 'User';
      } else {
        const userString = await AsyncStorage.getItem('user');
        if (userString) {
          const userObj = JSON.parse(userString);
          foundUserId = userObj.id || userObj._id;
          foundUserName =
            userObj.name || userObj.username || userObj.fullName || 'User';
        } else {
          const directId = await AsyncStorage.getItem('userId');
          if (
            directId &&
            !directId.startsWith('temp_') &&
            !directId.startsWith('user_')
          ) {
            foundUserId = directId;
          }
        }
      }

      setUserId(foundUserId);
      setUserName(foundUserName);

      // Load chat history if user exists
      if (foundUserId) {
        const hasHistory = await fetchChatHistory(foundUserId);

        // Add welcome message only if no history
        if (!hasHistory) {
          setTimeout(() => {
            setMessages([createWelcomeMessage(foundUserName)]);
          }, 300);
        }
      } else {
        console.warn('⚠️ No userId found - chat will not work properly');
        // No user - show welcome message
        setMessages([createWelcomeMessage(foundUserName)]);
      }
    } catch (error) {
      console.error('Error initializing user:', error);
      setUserName('User');
      setMessages([createWelcomeMessage('User')]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchChatHistory, createWelcomeMessage]);

  // ==================== Effects ====================

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      await initializeUser();
    };
    init();
  }, [initializeUser]);

  // Initialize TTS
  useEffect(() => {
    Tts.setDefaultLanguage('en-IN');
    return () => {
      Tts.stop();
    };
  }, []);

  // Initialize Custom SpeechService
  useEffect(() => {
    const speechStartListener = DeviceEventEmitter.addListener(
      'onSpeechStart',
      () => setIsListening(true),
    );
    const speechEndListener = DeviceEventEmitter.addListener(
      'onSpeechEnd',
      () => setIsListening(false),
    );
    const speechErrorListener = DeviceEventEmitter.addListener(
      'onSpeechError',
      e => {
        console.log('onSpeechError: ', e);
        setIsListening(false);
      },
    );
    const speechResultsListener = DeviceEventEmitter.addListener(
      'onSpeechResults',
      e => {
        if (e && e.text) {
          setVoiceText(e.text);
          setInput(e.text);
        } else if (e && e.value && e.value.length > 0) {
          setVoiceText(e.value[0]);
          setInput(e.value[0]);
        }
      },
    );
    const speechPartialListener = DeviceEventEmitter.addListener(
      'onSpeechPartialResults',
      e => {
        if (e && e.text) {
          setVoiceText(e.text);
        } else if (e && e.value && e.value.length > 0) {
          setVoiceText(e.value[0]);
        }
      },
    );

    return () => {
      speechStartListener.remove();
      speechEndListener.remove();
      speechErrorListener.remove();
      speechResultsListener.remove();
      speechPartialListener.remove();
    };
  }, []);

  const startListening = async () => {
    // Request Audio Permission for Android
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        if (
          grants['android.permission.RECORD_AUDIO'] !==
          PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.warn('Record audio permission denied');
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }

    setVoiceText('');
    setIsListening(true);
    // Stop TTS if bot is speaking
    Tts.stop();
    try {
      if (SpeechService && SpeechService.start) {
        SpeechService.start();
      } else {
        console.warn('SpeechService or SpeechService.start is not available');
      }
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    try {
      if (SpeechService && SpeechService.stop) {
        SpeechService.stop();
      }
      setIsListening(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Load chat limit when userId changes
  useEffect(() => {
    if (userId) {
      loadChatLimit(userId);
    }
  }, [userId, loadChatLimit]);

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        scrollToEnd();
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        // Optional: handle keyboard hide
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [scrollToEnd]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      scrollToEnd(true);
    }
  }, [messages.length, isLoading, scrollToEnd]);

  // ==================== Render Functions ====================

  const renderItem = useCallback(
    ({ item }) => {
      if (item.type === 'separator') {
        return (
          <View style={styles.separator}>
            <Text style={styles.separatorText}>{item.text}</Text>
          </View>
        );
      }

      const isUser = item.sender === 'user';

      return (
        <View style={[styles.message, isUser ? styles.userMsg : styles.botMsg]}>
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userMessageText : styles.botMessageText,
            ]}
          >
            {item.text}
          </Text>
          {item.time && (
            <Text style={[styles.timeText, isUser && styles.userTimeText]}>
              {formatTime(item.time)}
            </Text>
          )}
        </View>
      );
    },
    [formatTime],
  );

  const keyExtractor = useCallback(item => item.id, []);

  // ==================== UI Render ====================

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <ActivityIndicator size="large" color={FARMER_COLORS.primaryLight} />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  const canSendMessage =
    input.trim().length > 0 && dailyChatCount < MAX_DAILY_CHATS && !botTyping;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Header */}
      <View style={styles.headerSpacer} />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assistant AI</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <View style={styles.background}>
            {/* Messages List */}
            <FlatList
              ref={flatListRef}
              data={getMessagesWithSeparators(messages)}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.messagesContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
              removeClippedSubviews={Platform.OS === 'android'}
              maxToRenderPerBatch={10}
              windowSize={10}
            />

            {/* Bot Typing Indicator */}
            {botTyping && (
              <View style={styles.typingIndicator}>
                <ActivityIndicator
                  size="small"
                  color={FARMER_COLORS.primaryLight}
                  style={styles.typingSpinner}
                />
                <Text style={styles.typingText}>Bot is typing...</Text>
              </View>
            )}

            {/* Daily Limit Warning */}
            {dailyChatCount >= MAX_DAILY_CHATS && (
              <View style={styles.limitWarning}>
                <Text style={styles.limitWarningText}>
                  📊 Daily limit reached ({dailyChatCount}/{MAX_DAILY_CHATS})
                </Text>
                <Text style={styles.limitWarningSubtext}>
                  Resets tomorrow at midnight
                </Text>
              </View>
            )}

            {/* Floating Lottie Animation */}
            <TouchableOpacity
              style={styles.floatingAnimation}
              activeOpacity={0.8}
              onPress={startListening}
            >
              <LottieView
                source={HelloRobot}
                autoPlay
                loop
                style={styles.lottieIcon}
                pointerEvents="none"
              />
            </TouchableOpacity>

            {/* Input Container */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  value={input}
                  onChangeText={text => {
                    setInput(text);
                    Tts.stop();
                  }}
                  placeholder={
                    dailyChatCount >= MAX_DAILY_CHATS
                      ? 'Daily limit reached...'
                      : 'Ask about farming, crops, weather...'
                  }
                  placeholderTextColor="#999"
                  multiline
                  maxLength={500}
                  editable={dailyChatCount < MAX_DAILY_CHATS && !botTyping}
                  onSubmitEditing={sendMessage}
                  blurOnSubmit={false}
                  returnKeyType="send"
                />

                <TouchableOpacity
                  onPress={sendMessage}
                  style={[
                    styles.sendButton,
                    !canSendMessage && styles.sendButtonDisabled,
                  ]}
                  disabled={!canSendMessage}
                  activeOpacity={0.7}
                >
                  <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
              </View>

              {/* Chat Counter and Voice Toggle */}
              <View
                style={[
                  styles.chatCounter,
                  {
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 10,
                  },
                ]}
              >
                <Text style={styles.chatCounterText}>
                  {dailyChatCount}/{MAX_DAILY_CHATS} chats today
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginLeft: 15,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: '#999',
                      fontWeight: '500',
                      marginRight: 5,
                    }}
                  >
                    Voice Output
                  </Text>
                  <Switch
                    value={voiceEnabled}
                    onValueChange={setVoiceEnabled}
                    trackColor={{ false: '#E5E7EB', true: '#e2f0c9' }}
                    thumbColor={
                      voiceEnabled ? FARMER_COLORS.primaryLight : '#f4f3f4'
                    }
                    ios_backgroundColor="#3e3e3e"
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                  />
                </View>
              </View>
            </View>

            {/* Voice Overlay Modal */}
            <Modal
              visible={isListening}
              transparent={true}
              animationType="fade"
              onRequestClose={stopListening}
            >
              <View style={styles.voiceOverlayContainer}>
                <View style={styles.voiceOverlayContent}>
                  <Text style={styles.voiceOverlayTitle}>Listening...</Text>

                  <View style={styles.micIconWrapper}>
                    <Icon name="mic" size={50} color="#fff" />
                  </View>

                  <Text style={styles.voiceOverlayText}>
                    {voiceText || 'Speak now...'}
                  </Text>

                  <TouchableOpacity
                    style={styles.stopVoiceButton}
                    onPress={stopListening}
                  >
                    <Text style={styles.stopVoiceButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ==================== Styles ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FARMER_COLORS.background,
  },
  headerSpacer: {
    height: 6,
    backgroundColor: FARMER_COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: FARMER_COLORS.surface,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 12,
    shadowColor: FARMER_COLORS.primary,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: FARMER_COLORS.tintMid,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: FARMER_COLORS.tint,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: FARMER_COLORS.accent,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FARMER_COLORS.textPrimary,
  },
  keyboardView: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: FARMER_COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  messagesContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  separator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  separatorText: {
    color: FARMER_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: FARMER_COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: FARMER_COLORS.accent,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  message: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginVertical: 4,
    borderRadius: 24,
    maxWidth: '85%',
    elevation: 4,
    shadowColor: FARMER_COLORS.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  userMsg: {
    backgroundColor: FARMER_COLORS.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  botMsg: {
    backgroundColor: FARMER_COLORS.surface,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: FARMER_COLORS.tintMid,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  botMessageText: {
    color: FARMER_COLORS.textPrimary,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 10,
    marginTop: 6,
    opacity: 0.6,
    alignSelf: 'flex-end',
    color: '#666',
  },
  userTimeText: {
    color: '#ffffff',
    opacity: 0.8,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: FARMER_COLORS.surface,
    borderRadius: 20,
    marginLeft: 16,
    marginBottom: 8,
    elevation: 3,
    shadowColor: FARMER_COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: FARMER_COLORS.tintMid,
  },
  typingSpinner: {
    marginRight: 8,
  },
  typingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  limitWarning: {
    backgroundColor: FARMER_COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: FARMER_COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: FARMER_COLORS.tintMid,
  },
  limitWarningText: {
    color: '#b49509',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  limitWarningSubtext: {
    color: FARMER_COLORS.primaryLight,
    fontSize: 11,
    opacity: 0.9,
  },
  floatingAnimation: {
    position: 'absolute',
    right: 5,
    bottom: 120,
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: FARMER_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  lottieIcon: {
    width: 140,
    height: 140,
  },
  inputWrapper: {
    backgroundColor: FARMER_COLORS.surface,
    borderRadius: 32,
    marginHorizontal: 16,
    marginBottom: Platform.OS === 'ios' ? 24 : 16,
    paddingBottom: 8,
    elevation: 16,
    shadowColor: FARMER_COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: FARMER_COLORS.tintMid,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 4,
  },
  input: {
    flex: 1,
    backgroundColor: FARMER_COLORS.tint,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    marginRight: 8,
    fontSize: 15,
    maxHeight: 120,
    minHeight: 52,
    color: FARMER_COLORS.textPrimary,
    borderWidth: 1,
    borderColor: FARMER_COLORS.tintMid,
  },
  sendButton: {
    backgroundColor: FARMER_COLORS.primaryLight,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 52,
    minWidth: 80,
    elevation: 4,
    shadowColor: FARMER_COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#b0b0b0',
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  chatCounter: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  chatCounterText: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  voiceOverlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceOverlayContent: {
    backgroundColor: FARMER_COLORS.surface,
    width: '80%',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    elevation: 20,
    shadowColor: FARMER_COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    borderWidth: 1,
    borderColor: FARMER_COLORS.tintMid,
  },
  voiceOverlayTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  micIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: FARMER_COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 12,
    shadowColor: FARMER_COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  voiceOverlayText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    minHeight: 40,
  },
  stopVoiceButton: {
    backgroundColor: FARMER_COLORS.accent,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
    width: '100%',
    alignItems: 'center',
    elevation: 6,
    shadowColor: FARMER_COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  stopVoiceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
