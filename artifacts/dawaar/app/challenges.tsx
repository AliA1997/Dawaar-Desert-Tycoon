import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, Alert, ActivityIndicator, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import Colors from '@/constants/colors';
import { useGame, TOKENS } from '@/context/GameContext';
import { CHALLENGES, REWARD_ADVANTAGES, type Challenge } from '@/data/challenges';

const DIFFICULTY_OPTIONS = [
  { id: 'easy' as const,   label: 'Easy',   emoji: '😊' },
  { id: 'medium' as const, label: 'Medium', emoji: '🎯' },
  { id: 'hard' as const,   label: 'Hard',   emoji: '🔥' },
];

export default function ChallengesScreen() {
  const insets = useSafeAreaInsets();
  const { createChallengeGame, isLoading, error, clearError, myPlayerName, rewardPoints } = useGame();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const [selected, setSelected] = useState<Challenge | null>(null);
  const [playerName, setPlayerName] = useState(myPlayerName || '');
  const [selectedToken, setSelectedToken] = useState('camel');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [nameInput, setNameInput] = useState(myPlayerName || '');

  const handleSelectChallenge = (c: Challenge) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelected(c);
  };

  const handleStart = async () => {
    const name = nameInput.trim();
    if (!name) {
      Alert.alert('Enter your name', 'Please enter your name to continue');
      return;
    }
    if (!selected) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const ok = await createChallengeGame(selected.id, name, selectedToken, difficulty);
    if (ok) router.push('/game');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.darkBg, '#0A1628', Colors.darkBg]} style={StyleSheet.absoluteFill} />
      <View style={[styles.decorCircle, styles.dc1]} />
      <View style={[styles.decorCircle, styles.dc2]} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={Colors.gold} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Challenges</Text>
          <View style={styles.rewardPill}>
            <Text style={styles.rewardIcon}>⭐</Text>
            <Text style={styles.rewardPts}>{rewardPoints.toLocaleString()} pts</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Conquer a region to earn {'\u2b50'} 1,000 reward points
        </Text>

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

        {/* Challenge cards */}
        {!selected && (
          <>
            <View style={styles.challengeGrid}>
              {CHALLENGES.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.challengeCard}
                  onPress={() => handleSelectChallenge(c)}
                  activeOpacity={0.82}
                >
                  <LinearGradient
                    colors={[c.color, '#0A1628']}
                    style={styles.challengeCardInner}
                  >
                    <View style={[styles.challengeIconBg, { backgroundColor: c.accentColor + '22' }]}>
                      <Text style={styles.challengeFlag}>{c.flag}</Text>
                    </View>
                    <View style={styles.countryFlags}>
                      {c.countries.map((f, i) => (
                        <Text key={i} style={styles.countryFlag}>{f}</Text>
                      ))}
                    </View>
                    <Text style={styles.challengeTitle}>{c.title}</Text>
                    <Text style={styles.challengeTitleAr}>{c.titleAr}</Text>
                    <Text style={styles.challengeDesc}>{c.description}</Text>
                    <View style={styles.challengeFooter}>
                      <View style={[styles.rewardBadge, { borderColor: c.accentColor + '66', backgroundColor: c.accentColor + '18' }]}>
                        <Text style={[styles.rewardBadgeText, { color: c.accentColor }]}>⭐ {c.rewardPoints.toLocaleString()} pts</Text>
                      </View>
                      <View style={[styles.botsBadge, { borderColor: '#6B7280' }]}>
                        <Ionicons name="hardware-chip" size={10} color="#9CA3AF" />
                        <Text style={styles.botsBadgeText}>{c.npcCount} bots</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>

            {/* Reward Advantages */}
            <View style={styles.advantagesSection}>
              <Text style={styles.sectionTitle}>What rewards unlock</Text>
              {REWARD_ADVANTAGES.map((adv, i) => (
                <View
                  key={i}
                  style={[
                    styles.advantageRow,
                    rewardPoints >= adv.pts && styles.advantageRowUnlocked,
                  ]}
                >
                  <View style={styles.advantageIcon}>
                    <Text style={{ fontSize: 20 }}>{adv.icon}</Text>
                  </View>
                  <View style={styles.advantageText}>
                    <View style={styles.advantageTitleRow}>
                      <Text style={styles.advantageName}>{adv.title}</Text>
                      {rewardPoints >= adv.pts && (
                        <View style={styles.unlockedBadge}>
                          <Text style={styles.unlockedText}>Unlocked</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.advantageDesc}>{adv.desc}</Text>
                  </View>
                  <Text style={styles.advantageCost}>⭐ {adv.pts.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Setup form after selecting a challenge */}
        {selected && (
          <View style={styles.setupCard}>
            {/* Challenge header */}
            <LinearGradient
              colors={[selected.color, '#0A1628']}
              style={styles.setupCardHeader}
            >
              <View style={styles.setupCardHeaderRow}>
                <View>
                  <Text style={styles.setupCardTitle}>{selected.title}</Text>
                  <Text style={styles.setupCardTitleAr}>{selected.titleAr}</Text>
                  <View style={styles.countryFlagsRow}>
                    {selected.countries.map((f, i) => (
                      <Text key={i} style={styles.setupFlag}>{f}</Text>
                    ))}
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.changeBtn}
                  onPress={() => { setSelected(null); clearError(); }}
                >
                  <Text style={[styles.changeBtnText, { color: selected.accentColor }]}>Change</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <View style={styles.setupBody}>
              {/* Name input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Your Name</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person" size={18} color={Colors.gold} style={{ marginRight: 10 }} />
                  <TextInputComp value={nameInput} onChange={setNameInput} />
                </View>
              </View>

              {/* Token picker */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Choose Your Token</Text>
                <View style={styles.tokenGrid}>
                  {TOKENS.map(token => (
                    <TouchableOpacity
                      key={token.id}
                      style={[styles.tokenBtn, selectedToken === token.id && styles.tokenBtnActive]}
                      onPress={() => setSelectedToken(token.id)}
                    >
                      <Image
                        source={token.image}
                        style={[styles.tokenImg, selectedToken !== token.id && { opacity: 0.4 }]}
                      />
                      <Text style={[styles.tokenLabel, selectedToken === token.id && { color: Colors.gold }]}>
                        {token.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Difficulty */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Difficulty</Text>
                <View style={styles.diffRow}>
                  {DIFFICULTY_OPTIONS.map(d => (
                    <TouchableOpacity
                      key={d.id}
                      style={[styles.diffBtn, difficulty === d.id && styles.diffBtnActive]}
                      onPress={() => setDifficulty(d.id)}
                    >
                      <Text style={{ fontSize: 20 }}>{d.emoji}</Text>
                      <Text style={[styles.diffLabel, difficulty === d.id && { color: Colors.gold }]}>
                        {d.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Reward note */}
              <View style={styles.rewardNote}>
                <Text style={styles.rewardNoteIcon}>⭐</Text>
                <Text style={styles.rewardNoteText}>
                  Win this challenge to earn <Text style={{ color: Colors.gold, fontFamily: 'Inter_700Bold' }}>1,000 reward points</Text>
                </Text>
              </View>

              {/* Start button */}
              <TouchableOpacity
                style={[styles.startBtn, isLoading && { opacity: 0.6 }]}
                onPress={handleStart}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={isLoading ? ['#4B5563', '#374151'] : [selected.accentColor, selected.color]}
                  style={styles.startBtnGrad}
                >
                  {isLoading ? (
                    <ActivityIndicator color={Colors.darkBg} size="small" />
                  ) : (
                    <>
                      <Text style={styles.startBtnText}>Start Challenge</Text>
                      <Ionicons name="play" size={18} color={Colors.darkBg} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

import { TextInput } from 'react-native';
function TextInputComp({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <TextInput
      style={styles.textInput}
      placeholder="Enter your name"
      placeholderTextColor="#4B5563"
      value={value}
      onChangeText={onChange}
      maxLength={20}
      autoCorrect={false}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBg },
  decorCircle: { position: 'absolute', borderRadius: 999, opacity: 0.05, backgroundColor: Colors.gold },
  dc1: { width: 300, height: 300, top: -80, right: -80 },
  dc2: { width: 200, height: 200, bottom: 60, left: -60 },
  scroll: { paddingHorizontal: 20, paddingBottom: 48 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backBtn: {
    width: 40, height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  screenTitle: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: Colors.warmCream,
    flex: 1,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.gold + '44',
  },
  rewardIcon: { fontSize: 14 },
  rewardPts: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: Colors.gold,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
    marginBottom: 20,
    marginLeft: 48,
  },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)', borderRadius: 10, padding: 12, marginBottom: 16,
  },
  errorText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', color: '#EF4444' },

  challengeGrid: { gap: 14, marginBottom: 28 },

  challengeCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
  challengeCardInner: {
    padding: 20,
    gap: 4,
  },
  challengeIconBg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  challengeFlag: { fontSize: 26 },
  countryFlags: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  countryFlag: { fontSize: 18 },
  challengeTitle: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: Colors.warmCream,
  },
  challengeTitleAr: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.gold,
    marginBottom: 6,
  },
  challengeDesc: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#9CA3AF',
    lineHeight: 19,
    marginBottom: 14,
  },
  challengeFooter: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  rewardBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  rewardBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  botsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderColor: '#374151',
  },
  botsBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#9CA3AF',
  },

  advantagesSection: {
    marginBottom: 20,
    gap: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  advantageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    marginBottom: 8,
    opacity: 0.65,
  },
  advantageRowUnlocked: {
    opacity: 1,
    borderColor: Colors.gold + '44',
    backgroundColor: 'rgba(201,168,76,0.06)',
  },
  advantageIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(201,168,76,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  advantageText: { flex: 1, gap: 2 },
  advantageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  advantageName: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: Colors.warmCream,
  },
  unlockedBadge: {
    backgroundColor: '#22C55E22',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#22C55E44',
  },
  unlockedText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#22C55E',
  },
  advantageDesc: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
  },
  advantageCost: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: Colors.gold,
  },

  setupCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
  setupCardHeader: {
    padding: 20,
  },
  setupCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  setupCardTitle: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: Colors.warmCream,
  },
  setupCardTitleAr: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.gold,
    marginBottom: 6,
  },
  countryFlagsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  setupFlag: { fontSize: 20 },
  changeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  changeBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  setupBody: {
    padding: 20,
    gap: 0,
  },

  inputGroup: { marginBottom: 16 },
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
  textInput: {
    flex: 1,
    height: 48,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.warmCream,
  },

  tokenGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tokenBtn: {
    flex: 1, minWidth: '28%',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    backgroundColor: Colors.darkBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    gap: 4,
  },
  tokenBtnActive: { borderColor: Colors.gold, backgroundColor: 'rgba(201,168,76,0.1)' },
  tokenImg: { width: 36, height: 36, resizeMode: 'contain' },
  tokenLabel: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: '#6B7280',
    textAlign: 'center',
  },

  diffRow: { flexDirection: 'row', gap: 8 },
  diffBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: Colors.darkBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    gap: 4,
  },
  diffBtnActive: { borderColor: Colors.gold, backgroundColor: 'rgba(201,168,76,0.1)' },
  diffLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#6B7280',
  },

  rewardNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(201,168,76,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gold + '33',
    padding: 12,
    marginBottom: 16,
  },
  rewardNoteIcon: { fontSize: 18 },
  rewardNoteText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#9CA3AF',
    flex: 1,
  },

  startBtn: { borderRadius: 14, overflow: 'hidden' },
  startBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  startBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: Colors.darkBg,
  },
});
