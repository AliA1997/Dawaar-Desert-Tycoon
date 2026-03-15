import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import Colors from '@/constants/colors';
import { useGame, TOKENS } from '@/context/GameContext';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { createGame, joinGame, isLoading, error, clearError, myPlayerName } = useGame();

  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [playerName, setPlayerName] = useState(myPlayerName || '');
  const [gameCode, setGameCode] = useState('');
  const [selectedToken, setSelectedToken] = useState('camel');

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const handleCreate = async () => {
    if (!playerName.trim()) {
      Alert.alert('Enter your name', 'Please enter your name to continue');
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const gameId = await createGame(playerName.trim(), selectedToken);
    if (gameId) {
      router.push('/lobby');
    }
  };

  const handleJoin = async () => {
    if (!playerName.trim()) {
      Alert.alert('Enter your name', 'Please enter your name to continue');
      return;
    }
    if (!gameCode.trim()) {
      Alert.alert('Enter game code', 'Please enter the 6-character game code');
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = await joinGame(gameCode.trim().toUpperCase(), playerName.trim(), selectedToken);
    if (success) {
      router.push('/lobby');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.darkBg, '#0A1628', Colors.darkBg]}
        style={StyleSheet.absoluteFill}
      />
      {/* Decorative elements */}
      <View style={[styles.decorCircle, styles.decorCircle1]} />
      <View style={[styles.decorCircle, styles.decorCircle2]} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: topPad + 20 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo / Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[Colors.gold, '#8B6914']}
                style={styles.logoGradient}
              >
                <Ionicons name="compass-outline" size={36} color={Colors.darkBg} />
              </LinearGradient>
            </View>
            <Text style={styles.titleAr}>دوّار</Text>
            <Text style={styles.titleEn}>DAWAAR</Text>
            <Text style={styles.subtitle}>Middle East Monopoly</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Tabs */}
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'create' && styles.tabActive]}
                onPress={() => setActiveTab('create')}
              >
                <Ionicons name="add-circle" size={16} color={activeTab === 'create' ? Colors.gold : '#6B7280'} />
                <Text style={[styles.tabText, activeTab === 'create' && styles.tabTextActive]}>Create Game</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'join' && styles.tabActive]}
                onPress={() => setActiveTab('join')}
              >
                <Ionicons name="enter" size={16} color={activeTab === 'join' ? Colors.gold : '#6B7280'} />
                <Text style={[styles.tabText, activeTab === 'join' && styles.tabTextActive]}>Join Game</Text>
              </TouchableOpacity>
            </View>

            {/* Error */}
            {error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={clearError}>
                  <Ionicons name="close" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            )}

            {/* Name input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={18} color={Colors.gold} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor="#4B5563"
                  value={playerName}
                  onChangeText={setPlayerName}
                  maxLength={20}
                  autoCorrect={false}
                />
              </View>
            </View>

            {activeTab === 'join' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Game Code</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="key" size={18} color={Colors.gold} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.codeInput]}
                    placeholder="6-digit code"
                    placeholderTextColor="#4B5563"
                    value={gameCode}
                    onChangeText={setGameCode}
                    maxLength={6}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                </View>
              </View>
            )}

            {/* Token Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Choose Your Token</Text>
              <View style={styles.tokenGrid}>
                {TOKENS.map((token) => (
                  <TouchableOpacity
                    key={token.id}
                    style={[styles.tokenBtn, selectedToken === token.id && styles.tokenBtnActive]}
                    onPress={() => setSelectedToken(token.id)}
                  >
                    <Ionicons
                      name={token.icon as any}
                      size={22}
                      color={selectedToken === token.id ? Colors.gold : '#6B7280'}
                    />
                    <Text style={[styles.tokenLabel, selectedToken === token.id && styles.tokenLabelActive]}>
                      {token.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Action button */}
            <TouchableOpacity
              style={[styles.actionBtn, isLoading && styles.actionBtnDisabled]}
              onPress={activeTab === 'create' ? handleCreate : handleJoin}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? ['#4B5563', '#374151'] : [Colors.gold, '#A07830']}
                style={styles.actionBtnGrad}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.darkBg} size="small" />
                ) : (
                  <>
                    <Text style={styles.actionBtnText}>
                      {activeTab === 'create' ? 'Create Game' : 'Join Game'}
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color={Colors.darkBg} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer note */}
          <Text style={styles.footer}>
            Inspired by the cities and landmarks of the Arab World
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkBg,
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.06,
    backgroundColor: Colors.gold,
  },
  decorCircle1: {
    width: 350,
    height: 350,
    top: -100,
    right: -100,
  },
  decorCircle2: {
    width: 250,
    height: 250,
    bottom: 50,
    left: -80,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleAr: {
    fontSize: 42,
    fontFamily: 'Inter_700Bold',
    color: Colors.gold,
    letterSpacing: 2,
  },
  titleEn: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: Colors.warmCream,
    letterSpacing: 8,
    marginTop: -4,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
    marginTop: 6,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: Colors.darkBg,
    borderRadius: 12,
    padding: 3,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: '#6B7280',
  },
  tabTextActive: {
    color: Colors.gold,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#EF4444',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#9CA3AF',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.warmCream,
  },
  codeInput: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 6,
    textTransform: 'uppercase',
  },
  tokenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tokenBtn: {
    flex: 1,
    minWidth: '28%',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    backgroundColor: Colors.darkBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    gap: 4,
  },
  tokenBtnActive: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(201,168,76,0.1)',
  },
  tokenLabel: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  tokenLabelActive: {
    color: Colors.gold,
  },
  actionBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
  },
  actionBtnDisabled: {
    opacity: 0.7,
  },
  actionBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  actionBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: Colors.darkBg,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#374151',
    marginTop: 24,
    paddingHorizontal: 20,
  },
});
