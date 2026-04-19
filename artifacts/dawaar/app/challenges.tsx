import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, ActivityIndicator, Image, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import Colors from '@/constants/colors';
import { useGame, TOKENS } from '@/context/GameContext';
import { REGION_CHALLENGES, REWARD_ADVANTAGES, type CountryChallenge, type RegionChallenge } from '@/data/challenges';

const DIFFICULTY_OPTIONS = [
  { id: 'easy' as const,   label: 'Easy',   emoji: '😊' },
  { id: 'medium' as const, label: 'Medium', emoji: '🎯' },
  { id: 'hard' as const,   label: 'Hard',   emoji: '🔥' },
];

export default function ChallengesScreen() {
  const insets = useSafeAreaInsets();
  const { createChallengeGame, isLoading, error, clearError, myPlayerName, rewardPoints } = useGame();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const [selectedRegion, setSelectedRegion] = useState<RegionChallenge | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryChallenge | null>(null);
  const [nameInput, setNameInput] = useState(myPlayerName || '');
  const [selectedToken, setSelectedToken] = useState('camel');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const handleSelectRegion = (r: RegionChallenge) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (r.countries.length === 1) {
      setSelectedRegion(r);
      setSelectedCountry(r.countries[0]);
    } else {
      setSelectedRegion(r);
      setSelectedCountry(null);
    }
  };

  const handleSelectCountry = (c: CountryChallenge) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedCountry(c);
  };

  const handleBack = () => {
    clearError();
    if (selectedCountry) {
      if (selectedRegion && selectedRegion.countries.length === 1) {
        setSelectedRegion(null);
        setSelectedCountry(null);
      } else {
        setSelectedCountry(null);
      }
    } else {
      setSelectedRegion(null);
    }
  };

  const handleStart = async () => {
    if (!selectedCountry) return;
    const name = nameInput.trim();
    if (!name) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const ok = await createChallengeGame(selectedCountry.boardId, name, selectedToken, difficulty);
    if (ok) router.push('/game');
  };

  const canStart = !!nameInput.trim() && !isLoading;

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
          <TouchableOpacity
            style={styles.backBtn}
            onPress={selectedRegion ? handleBack : () => router.back()}
          >
            <Ionicons name="chevron-back" size={22} color={Colors.gold} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>
            {selectedCountry
              ? selectedCountry.title
              : selectedRegion
              ? selectedRegion.title
              : 'Challenges'}
          </Text>
          <View style={styles.rewardPill}>
            <Text style={styles.rewardIcon}>⭐</Text>
            <Text style={styles.rewardPts}>{rewardPoints.toLocaleString()} pts</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          {selectedCountry
            ? selectedCountry.description
            : selectedRegion
            ? `Choose a country in ${selectedRegion.title}`
            : `Conquer a region to earn \u2b50 1,000 reward points`}
        </Text>

        {/* API Error */}
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={clearError}>
              <Ionicons name="close" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Level 1: Region cards ──────────────────────────────────────────── */}
        {!selectedRegion && (
          <>
            <View style={styles.grid}>
              {REGION_CHALLENGES.map(region => (
                <TouchableOpacity
                  key={region.id}
                  style={styles.regionCard}
                  onPress={() => handleSelectRegion(region)}
                  activeOpacity={0.82}
                >
                  <LinearGradient
                    colors={[region.color, '#0A1628']}
                    style={styles.regionCardInner}
                  >
                    <View style={[styles.regionIconBg, { backgroundColor: region.accentColor + '22' }]}>
                      <Text style={styles.regionIconText}>{region.regionFlag}</Text>
                    </View>
                    <View style={styles.countryFlagRow}>
                      {region.countries.map(c => (
                        <Text key={c.id} style={styles.countryFlagSmall}>{c.flag}</Text>
                      ))}
                    </View>
                    <Text style={styles.regionTitle}>{region.title}</Text>
                    <Text style={styles.regionTitleAr}>{region.titleAr}</Text>
                    <Text style={styles.regionDesc}>{region.description}</Text>
                    <View style={styles.regionFooter}>
                      <View style={[styles.rewardBadge, { borderColor: region.accentColor + '66', backgroundColor: region.accentColor + '18' }]}>
                        <Text style={[styles.rewardBadgeText, { color: region.accentColor }]}>
                          ⭐ {(region.countries.length * 1000).toLocaleString()} pts total
                        </Text>
                      </View>
                      <View style={styles.countBadge}>
                        <Ionicons name="flag" size={10} color="#9CA3AF" />
                        <Text style={styles.countBadgeText}>{region.countries.length} countr{region.countries.length === 1 ? 'y' : 'ies'}</Text>
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
                  style={[styles.advantageRow, rewardPoints >= adv.pts && styles.advantageRowUnlocked]}
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

        {/* ── Level 2: Country sub-challenges ───────────────────────────────── */}
        {selectedRegion && !selectedCountry && (
          <View style={styles.countryGrid}>
            {selectedRegion.countries.map(country => (
              <TouchableOpacity
                key={country.id}
                style={styles.countryCard}
                onPress={() => handleSelectCountry(country)}
                activeOpacity={0.82}
              >
                <LinearGradient
                  colors={[selectedRegion.color, '#0A1628']}
                  style={styles.countryCardInner}
                >
                  <View style={styles.countryCardTop}>
                    <Text style={styles.countryCardFlag}>{country.flag}</Text>
                    <View style={styles.countryCardTitles}>
                      <Text style={styles.countryCardTitle}>{country.title}</Text>
                      <Text style={styles.countryCardTitleAr}>{country.titleAr}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={selectedRegion.accentColor} />
                  </View>
                  <Text style={styles.countryCardDesc}>{country.description}</Text>
                  <View style={[styles.rewardBadge, { borderColor: selectedRegion.accentColor + '55', backgroundColor: selectedRegion.accentColor + '15', alignSelf: 'flex-start', marginTop: 8 }]}>
                    <Text style={[styles.rewardBadgeText, { color: selectedRegion.accentColor }]}>
                      ⭐ {country.rewardPoints.toLocaleString()} pts
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Level 3: Setup form ────────────────────────────────────────────── */}
        {selectedRegion && selectedCountry && (
          <View style={styles.setupCard}>
            <LinearGradient
              colors={[selectedRegion.color, '#0A1628']}
              style={styles.setupCardHeader}
            >
              <View style={styles.setupCardHeaderRow}>
                <View style={{ flex: 1 }}>
                  <View style={styles.setupFlagRow}>
                    <Text style={styles.setupFlagLarge}>{selectedCountry.flag}</Text>
                    <View>
                      <Text style={styles.setupCardTitle}>{selectedCountry.title}</Text>
                      <Text style={styles.setupCardTitleAr}>{selectedCountry.titleAr}</Text>
                    </View>
                  </View>
                  <Text style={[styles.setupRegionLabel, { color: selectedRegion.accentColor }]}>
                    {selectedRegion.title} Region
                  </Text>
                </View>
              </View>
            </LinearGradient>

            <View style={styles.setupBody}>
              {/* Name input */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Your Name</Text>
                  {!nameInput.trim() && <Text style={styles.requiredHint}>Required</Text>}
                </View>
                <View style={[styles.inputContainer, !nameInput.trim() && styles.inputContainerRequired]}>
                  <Ionicons name="person" size={18} color={Colors.gold} style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your name"
                    placeholderTextColor="#4B5563"
                    value={nameInput}
                    onChangeText={setNameInput}
                    maxLength={20}
                    autoCorrect={false}
                  />
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
                  Win to earn{' '}
                  <Text style={{ color: Colors.gold, fontFamily: 'Inter_700Bold' }}>
                    {selectedCountry.rewardPoints.toLocaleString()} reward points
                  </Text>
                </Text>
              </View>

              {/* Start button */}
              <TouchableOpacity
                style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
                onPress={handleStart}
                disabled={!canStart}
              >
                <LinearGradient
                  colors={!canStart ? ['#4B5563', '#374151'] : [selectedRegion.accentColor, selectedRegion.color]}
                  style={styles.startBtnGrad}
                >
                  {isLoading ? (
                    <ActivityIndicator color={Colors.darkBg} size="small" />
                  ) : (
                    <>
                      <Text style={[styles.startBtnText, !nameInput.trim() && { color: '#9CA3AF' }]}>
                        Start Challenge
                      </Text>
                      <Ionicons name="play" size={18} color={!nameInput.trim() ? '#9CA3AF' : Colors.darkBg} />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBg },
  decorCircle: { position: 'absolute', borderRadius: 999, opacity: 0.05, backgroundColor: Colors.gold },
  dc1: { width: 300, height: 300, top: -80, right: -80 },
  dc2: { width: 200, height: 200, bottom: 60, left: -60 },
  scroll: { paddingHorizontal: 20, paddingBottom: 48 },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  screenTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', color: Colors.warmCream, flex: 1 },
  rewardPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(201,168,76,0.15)', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.gold + '44',
  },
  rewardIcon: { fontSize: 14 },
  rewardPts: { fontSize: 13, fontFamily: 'Inter_700Bold', color: Colors.gold },
  subtitle: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#6B7280', marginBottom: 20, marginLeft: 48 },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)', borderRadius: 10, padding: 12, marginBottom: 16,
  },
  errorText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', color: '#EF4444' },

  // Region cards
  grid: { gap: 14, marginBottom: 28 },
  regionCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: Colors.borderColor },
  regionCardInner: { padding: 20, gap: 4 },
  regionIconBg: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  regionIconText: { fontSize: 26 },
  countryFlagRow: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  countryFlagSmall: { fontSize: 18 },
  regionTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', color: Colors.warmCream },
  regionTitleAr: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.gold, marginBottom: 6 },
  regionDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#9CA3AF', lineHeight: 19, marginBottom: 14 },
  regionFooter: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  rewardBadge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  rewardBadgeText: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  countBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderColor: '#374151',
  },
  countBadgeText: { fontSize: 11, fontFamily: 'Inter_400Regular', color: '#9CA3AF' },

  // Country cards
  countryGrid: { gap: 12, marginBottom: 24 },
  countryCard: { borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: Colors.borderColor },
  countryCardInner: { padding: 16 },
  countryCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  countryCardFlag: { fontSize: 32 },
  countryCardTitles: { flex: 1 },
  countryCardTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.warmCream },
  countryCardTitleAr: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.gold },
  countryCardDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#9CA3AF', lineHeight: 19 },

  // Setup card
  setupCard: { backgroundColor: Colors.cardBg, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: Colors.borderColor },
  setupCardHeader: { padding: 20 },
  setupCardHeaderRow: { flexDirection: 'row', alignItems: 'flex-start' },
  setupFlagRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  setupFlagLarge: { fontSize: 36 },
  setupCardTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', color: Colors.warmCream },
  setupCardTitleAr: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.gold },
  setupRegionLabel: { fontSize: 12, fontFamily: 'Inter_600SemiBold', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  setupBody: { padding: 20, gap: 0 },

  inputGroup: { marginBottom: 16 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 },
  requiredHint: { fontSize: 11, fontFamily: 'Inter_500Medium', color: '#EF4444', opacity: 0.8 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.darkBg, borderRadius: 12, borderWidth: 1,
    borderColor: Colors.borderColor, paddingHorizontal: 14,
  },
  inputContainerRequired: { borderColor: 'rgba(239,68,68,0.4)' },
  textInput: { flex: 1, height: 48, fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.warmCream },

  tokenGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tokenBtn: {
    flex: 1, minWidth: '28%', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 6,
    backgroundColor: Colors.darkBg, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.borderColor, gap: 4,
  },
  tokenBtnActive: { borderColor: Colors.gold, backgroundColor: 'rgba(201,168,76,0.1)' },
  tokenImg: { width: 36, height: 36, resizeMode: 'contain' },
  tokenLabel: { fontSize: 10, fontFamily: 'Inter_500Medium', color: '#6B7280', textAlign: 'center' },

  diffRow: { flexDirection: 'row', gap: 8 },
  diffBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    backgroundColor: Colors.darkBg, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.borderColor, gap: 4,
  },
  diffBtnActive: { borderColor: Colors.gold, backgroundColor: 'rgba(201,168,76,0.1)' },
  diffLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#6B7280' },

  rewardNote: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(201,168,76,0.08)', borderRadius: 12,
    borderWidth: 1, borderColor: Colors.gold + '33', padding: 12, marginBottom: 16,
  },
  rewardNoteIcon: { fontSize: 18 },
  rewardNoteText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#9CA3AF', flex: 1 },

  startBtn: { borderRadius: 14, overflow: 'hidden' },
  startBtnDisabled: { opacity: 0.7 },
  startBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  startBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.darkBg },

  // Advantages section
  advantagesSection: { marginBottom: 20, gap: 2 },
  sectionTitle: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  advantageRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.cardBg, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.borderColor, marginBottom: 8, opacity: 0.65,
  },
  advantageRowUnlocked: { opacity: 1, borderColor: Colors.gold + '44', backgroundColor: 'rgba(201,168,76,0.06)' },
  advantageIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(201,168,76,0.1)', alignItems: 'center', justifyContent: 'center' },
  advantageText: { flex: 1, gap: 2 },
  advantageTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  advantageName: { fontSize: 14, fontFamily: 'Inter_700Bold', color: Colors.warmCream },
  unlockedBadge: { backgroundColor: '#22C55E22', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: '#22C55E44' },
  unlockedText: { fontSize: 9, fontFamily: 'Inter_700Bold', color: '#22C55E' },
  advantageDesc: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#6B7280' },
  advantageCost: { fontSize: 12, fontFamily: 'Inter_700Bold', color: Colors.gold },
});
