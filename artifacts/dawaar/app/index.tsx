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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import Colors from '@/constants/colors';
import { useGame, TOKENS } from '@/context/GameContext';
import { useSubscription } from '@/lib/revenuecat';
import SubscribeModal from '@/components/SubscribeModal';

type Screen = 'mode' | 'singleplayer' | 'multiplayer';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { createGame, createSinglePlayerGame, joinGame, resumeGame, isLoading, error, clearError, myPlayerName, savedGame } = useGame();
  const { isSubscribed } = useSubscription();
  const [showSubscribe, setShowSubscribe] = useState(false);

  const [screen, setScreen] = useState<Screen>('mode');
  const [mpTab, setMpTab] = useState<'create' | 'join'>('create');
  const [playerName, setPlayerName] = useState(myPlayerName || '');
  const [gameCode, setGameCode] = useState('');
  const [selectedToken, setSelectedToken] = useState('camel');
  const [npcCount, setNpcCount] = useState(2);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const handleResume = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const ok = await resumeGame();
    if (ok) router.push('/game');
  };

  const handleSinglePlayer = async () => {
    if (!playerName.trim()) {
      Alert.alert('Enter your name', 'Please enter your name to continue');
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const ok = await createSinglePlayerGame(playerName.trim(), selectedToken, npcCount, selectedDifficulty);
    if (ok) router.push('/game');
  };

  const handleCreate = async () => {
    if (!playerName.trim()) {
      Alert.alert('Enter your name', 'Please enter your name to continue');
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const gameId = await createGame(playerName.trim(), selectedToken);
    if (gameId) router.push('/lobby');
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
    const ok = await joinGame(gameCode.trim().toUpperCase(), playerName.trim(), selectedToken);
    if (ok) router.push('/lobby');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.darkBg, '#0A1628', Colors.darkBg]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.decorCircle, styles.decorCircle1]} />
      <View style={[styles.decorCircle, styles.decorCircle2]} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: topPad + 20 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            {screen !== 'mode' && (
              <TouchableOpacity style={styles.backBtn} onPress={() => { clearError(); setScreen('mode'); }}>
                <Ionicons name="chevron-back" size={22} color={Colors.gold} />
              </TouchableOpacity>
            )}
            <View style={styles.logoContainer}>
              <LinearGradient colors={[Colors.gold, '#8B6914']} style={styles.logoGradient}>
                <Ionicons name="sync-outline" size={36} color={Colors.darkBg} />
              </LinearGradient>
            </View>
            <Text style={styles.titleAr}>دوّار</Text>
            <Text style={styles.titleEn}>DAWAAR</Text>
            <Text style={styles.subtitle}>Middle East Monopoly</Text>
          </View>

          {/* Mode Selection */}
          {screen === 'mode' && (
            <View style={styles.modeContainer}>
              {savedGame && (
                <TouchableOpacity
                  style={styles.resumeCard}
                  onPress={handleResume}
                  activeOpacity={0.85}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={['rgba(201,168,76,0.2)', 'rgba(201,168,76,0.08)']}
                    style={styles.resumeCardInner}
                  >
                    <View style={styles.resumeIconBg}>
                      <Ionicons name="play-circle" size={28} color={Colors.gold} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resumeTitle}>Resume Game</Text>
                      <Text style={styles.resumeDesc}>Continue your saved single-player game</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors.gold} />
                  </LinearGradient>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.modeCard}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setScreen('singleplayer'); }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#1A2640', '#0F1A2E']}
                  style={styles.modeCardInner}
                >
                  <View style={[styles.modeIconBg, { backgroundColor: 'rgba(201,168,76,0.15)' }]}>
                    <Ionicons name="person" size={32} color={Colors.gold} />
                  </View>
                  <View style={styles.modeTextBlock}>
                    <Text style={styles.modeTitle}>Single Player</Text>
                    <Text style={styles.modeDesc}>Play vs AI bots from across the Arab world</Text>
                  </View>
                  <View style={styles.modeArrow}>
                    <Ionicons name="chevron-forward" size={20} color={Colors.gold} />
                  </View>
                  <View style={[styles.modeBadge, { backgroundColor: '#22C55E22', borderColor: '#22C55E44' }]}>
                    <Text style={[styles.modeBadgeText, { color: '#22C55E' }]}>Offline</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modeCard}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/challenges'); }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#1A2640', '#0F1A2E']}
                  style={styles.modeCardInner}
                >
                  <View style={[styles.modeIconBg, { backgroundColor: 'rgba(201,168,76,0.15)' }]}>
                    <Ionicons name="trophy" size={32} color={Colors.gold} />
                  </View>
                  <View style={styles.modeTextBlock}>
                    <Text style={styles.modeTitle}>Challenges</Text>
                    <Text style={styles.modeDesc}>Conquer regions of the Arab world. Earn reward points.</Text>
                  </View>
                  <View style={styles.modeArrow}>
                    <Ionicons name="chevron-forward" size={20} color={Colors.gold} />
                  </View>
                  <View style={[styles.modeBadge, { backgroundColor: 'rgba(201,168,76,0.15)', borderColor: 'rgba(201,168,76,0.3)' }]}>
                    <Text style={[styles.modeBadgeText, { color: Colors.gold }]}>⭐ Points</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modeCard}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setScreen('multiplayer'); }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#1A2640', '#0F1A2E']}
                  style={styles.modeCardInner}
                >
                  <View style={[styles.modeIconBg, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
                    <Ionicons name="people" size={32} color="#60A5FA" />
                  </View>
                  <View style={styles.modeTextBlock}>
                    <Text style={styles.modeTitle}>Multiplayer</Text>
                    <Text style={styles.modeDesc}>Invite friends with a 6-character game code</Text>
                  </View>
                  <View style={styles.modeArrow}>
                    <Ionicons name="chevron-forward" size={20} color="#60A5FA" />
                  </View>
                  <View style={[styles.modeBadge, { backgroundColor: 'rgba(59,130,246,0.15)', borderColor: 'rgba(59,130,246,0.3)' }]}>
                    <Text style={[styles.modeBadgeText, { color: '#60A5FA' }]}>Online</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.footer}>
                Inspired by the cities and landmarks of the Arab World
              </Text>

              <TouchableOpacity
                style={[styles.premiumBtn, isSubscribed && styles.premiumBtnActive]}
                onPress={() => setShowSubscribe(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="star" size={14} color={isSubscribed ? Colors.darkBg : Colors.gold} />
                <Text style={[styles.premiumBtnText, isSubscribed && styles.premiumBtnTextActive]}>
                  {isSubscribed ? 'Premium Active' : 'Go Premium — Remove Ads'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Single Player Setup */}
          {screen === 'singleplayer' && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Single Player Setup</Text>

              {error && <ErrorBanner message={error} onDismiss={clearError} />}

              <NameInput value={playerName} onChange={setPlayerName} />

              <TokenPicker selected={selectedToken} onSelect={setSelectedToken} />

              {/* NPC Count */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Number of Opponents</Text>
                <View style={styles.npcRow}>
                  {[1, 2, 3, 4].map(n => (
                    <TouchableOpacity
                      key={n}
                      style={[styles.npcBtn, npcCount === n && styles.npcBtnActive]}
                      onPress={() => setNpcCount(n)}
                    >
                      <Text style={[styles.npcBtnText, npcCount === n && styles.npcBtnTextActive]}>{n}</Text>
                      <Text style={[styles.npcBtnLabel, npcCount === n && styles.npcBtnLabelActive]}>
                        {n === 1 ? 'Bot' : 'Bots'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.npcPreviewRow}>
                  {Array.from({ length: npcCount }).map((_, i) => (
                    <View key={i} style={[styles.npcChip, { backgroundColor: Colors.players[i + 1] + '22', borderColor: Colors.players[i + 1] + '44' }]}>
                      <Ionicons name="hardware-chip" size={12} color={Colors.players[i + 1]} />
                      <Text style={[styles.npcChipText, { color: Colors.players[i + 1] }]}>
                        {['Khalid', 'Tariq', 'Omar', 'Layla'][i]}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Difficulty */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Difficulty</Text>
                <View style={styles.npcRow}>
                  {([
                    { id: 'easy', label: 'Easy', emoji: '😊' },
                    { id: 'medium', label: 'Medium', emoji: '🎯' },
                    { id: 'hard', label: 'Hard', emoji: '🔥' },
                  ] as const).map(d => (
                    <TouchableOpacity
                      key={d.id}
                      style={[styles.npcBtn, { flex: 1 }, selectedDifficulty === d.id && styles.npcBtnActive]}
                      onPress={() => setSelectedDifficulty(d.id)}
                    >
                      <Text style={{ fontSize: 18 }}>{d.emoji}</Text>
                      <Text style={[styles.npcBtnLabel, selectedDifficulty === d.id && styles.npcBtnLabelActive]}>
                        {d.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <ActionButton
                label="Start Game"
                icon="play"
                loading={isLoading}
                onPress={handleSinglePlayer}
              />
            </View>
          )}

          {/* Multiplayer Setup */}
          {screen === 'multiplayer' && (
            <View style={styles.card}>
              {/* Tabs */}
              <View style={styles.tabRow}>
                <TouchableOpacity
                  style={[styles.tab, mpTab === 'create' && styles.tabActive]}
                  onPress={() => setMpTab('create')}
                >
                  <Ionicons name="add-circle" size={16} color={mpTab === 'create' ? Colors.gold : '#6B7280'} />
                  <Text style={[styles.tabText, mpTab === 'create' && styles.tabTextActive]}>Create Game</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, mpTab === 'join' && styles.tabActive]}
                  onPress={() => setMpTab('join')}
                >
                  <Ionicons name="enter" size={16} color={mpTab === 'join' ? Colors.gold : '#6B7280'} />
                  <Text style={[styles.tabText, mpTab === 'join' && styles.tabTextActive]}>Join Game</Text>
                </TouchableOpacity>
              </View>

              {error && <ErrorBanner message={error} onDismiss={clearError} />}

              <NameInput value={playerName} onChange={setPlayerName} />

              {mpTab === 'join' && (
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

              <TokenPicker selected={selectedToken} onSelect={setSelectedToken} />

              <ActionButton
                label={mpTab === 'create' ? 'Create Game' : 'Join Game'}
                icon="arrow-forward"
                loading={isLoading}
                onPress={mpTab === 'create' ? handleCreate : handleJoin}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <SubscribeModal visible={showSubscribe} onClose={() => setShowSubscribe(false)} />
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <View style={styles.errorBanner}>
      <Ionicons name="alert-circle" size={16} color="#EF4444" />
      <Text style={styles.errorText}>{message}</Text>
      <TouchableOpacity onPress={onDismiss}>
        <Ionicons name="close" size={16} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );
}

function NameInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Your Name</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="person" size={18} color={Colors.gold} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor="#4B5563"
          value={value}
          onChangeText={onChange}
          maxLength={20}
          autoCorrect={false}
        />
      </View>
    </View>
  );
}

function TokenPicker({ selected, onSelect }: { selected: string; onSelect: (t: string) => void }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Choose Your Token</Text>
      <View style={styles.tokenGrid}>
        {TOKENS.map(token => (
          <TouchableOpacity
            key={token.id}
            style={[styles.tokenBtn, selected === token.id && styles.tokenBtnActive]}
            onPress={() => onSelect(token.id)}
          >
            <Image
              source={token.image}
              style={[styles.tokenImg, !( selected === token.id) && { opacity: 0.45 }]}
            />
            <Text style={[styles.tokenLabel, selected === token.id && styles.tokenLabelActive]}>
              {token.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function ActionButton({ label, icon, loading, onPress }: { label: string; icon: string; loading: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.actionBtn, loading && styles.actionBtnDisabled]} onPress={onPress} disabled={loading}>
      <LinearGradient
        colors={loading ? ['#4B5563', '#374151'] : [Colors.gold, '#A07830']}
        style={styles.actionBtnGrad}
      >
        {loading ? (
          <ActivityIndicator color={Colors.darkBg} size="small" />
        ) : (
          <>
            <Text style={styles.actionBtnText}>{label}</Text>
            <Ionicons name={icon as any} size={18} color={Colors.darkBg} />
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBg },
  decorCircle: { position: 'absolute', borderRadius: 999, opacity: 0.06, backgroundColor: Colors.gold },
  decorCircle1: { width: 350, height: 350, top: -100, right: -100 },
  decorCircle2: { width: 250, height: 250, bottom: 50, left: -80 },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 28, position: 'relative' },
  backBtn: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  logoContainer: { marginBottom: 14 },
  logoGradient: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  titleAr: { fontSize: 40, fontFamily: 'Inter_700Bold', color: Colors.gold, letterSpacing: 2 },
  titleEn: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.warmCream, letterSpacing: 8, marginTop: -4 },
  subtitle: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#6B7280', marginTop: 4, letterSpacing: 1 },

  // Mode selection
  modeContainer: { gap: 14 },
  resumeCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(201,168,76,0.4)',
  },
  resumeCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  resumeIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201,168,76,0.12)',
  },
  resumeTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.gold },
  resumeDesc: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#9CA3AF', marginTop: 2 },
  modeCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
  modeCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 14,
  },
  modeIconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTextBlock: { flex: 1 },
  modeTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', color: Colors.warmCream },
  modeDesc: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#6B7280', marginTop: 3 },
  modeArrow: { paddingLeft: 4 },
  modeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  modeBadgeText: { fontSize: 10, fontFamily: 'Inter_700Bold' },

  // Card
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    gap: 0,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: Colors.warmCream,
    marginBottom: 16,
  },

  // Tabs
  tabRow: { flexDirection: 'row', backgroundColor: Colors.darkBg, borderRadius: 12, padding: 3, marginBottom: 20 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  tabActive: { backgroundColor: Colors.cardBg, borderWidth: 1, borderColor: Colors.borderColor },
  tabText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#6B7280' },
  tabTextActive: { color: Colors.gold },

  // Error
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)', borderRadius: 10, padding: 12, marginBottom: 16,
  },
  errorText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', color: '#EF4444' },

  // Inputs
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#9CA3AF', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.darkBg, borderRadius: 12, borderWidth: 1, borderColor: Colors.borderColor, paddingHorizontal: 14 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 48, fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.warmCream },
  codeInput: { fontSize: 20, fontFamily: 'Inter_700Bold', letterSpacing: 6, textTransform: 'uppercase' },

  // Tokens
  tokenGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tokenBtn: { flex: 1, minWidth: '28%', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 6, backgroundColor: Colors.darkBg, borderRadius: 12, borderWidth: 1, borderColor: Colors.borderColor, gap: 4 },
  tokenBtnActive: { borderColor: Colors.gold, backgroundColor: 'rgba(201,168,76,0.1)' },
  tokenImg: { width: 36, height: 36, resizeMode: 'contain' },
  tokenLabel: { fontSize: 10, fontFamily: 'Inter_500Medium', color: '#6B7280', textAlign: 'center' },
  tokenLabelActive: { color: Colors.gold },

  // NPC count
  npcRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  npcBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    backgroundColor: Colors.darkBg, borderRadius: 12, borderWidth: 1, borderColor: Colors.borderColor,
  },
  npcBtnActive: { borderColor: Colors.gold, backgroundColor: 'rgba(201,168,76,0.1)' },
  npcBtnText: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#4B5563' },
  npcBtnTextActive: { color: Colors.gold },
  npcBtnLabel: { fontSize: 10, fontFamily: 'Inter_500Medium', color: '#4B5563', marginTop: 2 },
  npcBtnLabelActive: { color: Colors.gold },
  npcPreviewRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  npcChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  npcChipText: { fontSize: 12, fontFamily: 'Inter_500Medium' },

  // Action button
  actionBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 4 },
  actionBtnDisabled: { opacity: 0.7 },
  actionBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  actionBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.darkBg },

  footer: { textAlign: 'center', fontSize: 12, fontFamily: 'Inter_400Regular', color: '#374151', marginTop: 16, paddingHorizontal: 10 },

  premiumBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gold + '55',
    backgroundColor: Colors.gold + '0C',
    alignSelf: 'center',
  },
  premiumBtnActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  premiumBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.gold,
  },
  premiumBtnTextActive: {
    color: Colors.darkBg,
  },
});
