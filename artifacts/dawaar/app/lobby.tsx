import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Share,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';

import Colors from '@/constants/colors';
import { useGame, getTokenImage } from '@/context/GameContext';
import { LobbySkeleton } from '@/components/Skeleton';

export default function LobbyScreen() {
  const insets = useSafeAreaInsets();
  const { gameState, myPlayerId, startGame, isLoading, error, leaveGame, setReady } = useGame();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  if (!gameState) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[Colors.darkBg, '#0A1628', Colors.darkBg]} style={StyleSheet.absoluteFill} />
        <LobbySkeleton />
      </View>
    );
  }

  const isHost = gameState.players[0]?.id === myPlayerId;
  const gameId = gameState.gameId;
  const me = gameState.players.find(p => p.id === myPlayerId);
  const allReady = gameState.players.length >= 2 && gameState.players.every(p => p.ready);
  const canStart = isHost && allReady;

  const handleCopyCode = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === 'web') {
      try { await navigator.clipboard.writeText(gameId); } catch {}
    } else {
      await Clipboard.setStringAsync(gameId);
    }
    Alert.alert('Copied!', `Game code ${gameId} copied to clipboard`);
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: `Join my Dawaar game! Code: ${gameId}` });
    } catch {}
  };

  const handleStart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await startGame();
    router.replace('/game');
  };

  const handleToggleReady = async () => {
    if (!me) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setReady(!me.ready);
  };

  const handleLeave = () => {
    Alert.alert('Leave Game', 'Are you sure you want to leave?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => { leaveGame(); router.replace('/'); } },
    ]);
  };


  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.darkBg, '#0A1628', Colors.darkBg]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={handleLeave} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.warmCream} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Game Lobby</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>GAME CODE</Text>
          <Text style={styles.codeText}>{gameId}</Text>
          <View style={styles.codeActions}>
            <TouchableOpacity style={styles.codeAction} onPress={handleCopyCode}>
              <Ionicons name="copy" size={18} color={Colors.gold} />
              <Text style={styles.codeActionText}>Copy</Text>
            </TouchableOpacity>
            <View style={styles.codeDivider} />
            <TouchableOpacity style={styles.codeAction} onPress={handleShare}>
              <Ionicons name="share-social" size={18} color={Colors.gold} />
              <Text style={styles.codeActionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>
            {allReady
              ? 'All players ready!'
              : `Waiting for players (${gameState.players.length}/6)`}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Players</Text>
          {gameState.players.map((player, idx) => (
            <View
              key={player.id}
              style={[styles.playerRow, player.ready && styles.playerRowReady]}
            >
              <View style={[styles.playerTokenBg, { backgroundColor: player.color + '22' }]}>
                <Image
                  source={getTokenImage(player.token)}
                  style={styles.playerTokenImg}
                />
              </View>
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>
                  {player.name}
                  {player.id === myPlayerId ? ' (You)' : ''}
                </Text>
                <Text style={styles.playerRole}>
                  {idx === 0 ? 'Host' : 'Player'}
                </Text>
              </View>
              <View style={[styles.readyBadge, player.ready ? styles.readyBadgeOn : styles.readyBadgeOff]}>
                <Ionicons
                  name={player.ready ? 'checkmark-circle' : 'ellipse-outline'}
                  size={14}
                  color={player.ready ? '#22C55E' : '#6B7280'}
                />
                <Text style={[styles.readyText, { color: player.ready ? '#22C55E' : '#6B7280' }]}>
                  {player.ready ? 'Ready' : 'Not ready'}
                </Text>
              </View>
            </View>
          ))}

          {Array.from({ length: Math.max(0, 6 - gameState.players.length) }).map((_, i) => (
            <View key={`empty-${i}`} style={[styles.playerRow, styles.emptySlot]}>
              <View style={[styles.playerTokenBg, { backgroundColor: Colors.borderColor }]}>
                <Ionicons name="person-add" size={20} color="#4B5563" />
              </View>
              <Text style={styles.emptySlotText}>Waiting for player...</Text>
            </View>
          ))}
        </View>

        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>How to Play</Text>
          <View style={styles.rulesRow}>
            <Ionicons name="dice" size={16} color={Colors.gold} />
            <Text style={styles.rulesText}>Roll dice and move around the board</Text>
          </View>
          <View style={styles.rulesRow}>
            <Ionicons name="business" size={16} color={Colors.gold} />
            <Text style={styles.rulesText}>Buy properties across the Middle East</Text>
          </View>
          <View style={styles.rulesRow}>
            <Ionicons name="home" size={16} color={Colors.gold} />
            <Text style={styles.rulesText}>Build houses and hotels to collect rent</Text>
          </View>
          <View style={styles.rulesRow}>
            <Ionicons name="trophy" size={16} color={Colors.gold} />
            <Text style={styles.rulesText}>Bankrupt all opponents to win!</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={[styles.footer, { paddingBottom: botPad + 16, gap: 10 }]}>
        {/* Ready toggle for everyone */}
        {me && (
          <TouchableOpacity
            style={[styles.readyBtn, me.ready && styles.readyBtnOn]}
            onPress={handleToggleReady}
            disabled={isLoading}
          >
            <Ionicons
              name={me.ready ? 'checkmark-circle' : 'radio-button-off'}
              size={18}
              color={me.ready ? '#22C55E' : Colors.gold}
            />
            <Text style={[styles.readyBtnText, { color: me.ready ? '#22C55E' : Colors.gold }]}>
              {me.ready ? "I'm Ready" : 'Mark me Ready'}
            </Text>
          </TouchableOpacity>
        )}

        {isHost ? (
          <TouchableOpacity
            style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
            onPress={handleStart}
            disabled={!canStart || isLoading}
          >
            <LinearGradient
              colors={canStart ? [Colors.gold, '#A07830'] : ['#374151', '#1F2937']}
              style={styles.startBtnGrad}
            >
              <Ionicons name="play" size={20} color={canStart ? Colors.darkBg : '#4B5563'} />
              <Text style={[styles.startBtnText, !canStart && styles.startBtnTextDisabled]}>
                {gameState.players.length < 2
                  ? `Need ${2 - gameState.players.length} more player${2 - gameState.players.length === 1 ? '' : 's'}`
                  : !allReady
                  ? 'Waiting for all players to ready up'
                  : 'Start Game'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.waitingBox}>
            <Ionicons name="hourglass" size={18} color={Colors.gold} />
            <Text style={styles.waitingText}>
              {allReady ? 'All ready — waiting for host to start' : 'Waiting for host to start the game...'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.darkBg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.borderColor,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.warmCream },
  scroll: { flex: 1, paddingHorizontal: 16 },
  codeCard: {
    backgroundColor: Colors.cardBg, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: Colors.gold + '40',
    alignItems: 'center', marginTop: 20, marginBottom: 16,
  },
  codeLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#6B7280', letterSpacing: 2, marginBottom: 8 },
  codeText: { fontSize: 42, fontFamily: 'Inter_700Bold', color: Colors.gold, letterSpacing: 10, marginBottom: 16 },
  codeActions: {
    flexDirection: 'row', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: Colors.borderColor,
    paddingTop: 12, width: '100%', justifyContent: 'center', gap: 0,
  },
  codeAction: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 4 },
  codeActionText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.gold },
  codeDivider: { width: 1, height: 24, backgroundColor: Colors.borderColor },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, paddingHorizontal: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },
  statusText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#9CA3AF' },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#6B7280', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  playerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.cardBg, borderRadius: 14, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: Colors.borderColor,
  },
  playerRowReady: { borderColor: '#22C55E55' },
  emptySlot: { borderStyle: 'dashed' },
  playerTokenBg: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  playerTokenImg: { width: 28, height: 28, resizeMode: 'contain' },
  playerInfo: { flex: 1 },
  playerName: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.warmCream },
  playerRole: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#6B7280', marginTop: 2 },
  readyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1,
  },
  readyBadgeOn: { borderColor: '#22C55E55', backgroundColor: '#22C55E18' },
  readyBadgeOff: { borderColor: '#374151', backgroundColor: 'transparent' },
  readyText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  emptySlotText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#4B5563' },
  rulesCard: { backgroundColor: Colors.cardBg, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.borderColor, gap: 10 },
  rulesTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.warmCream, marginBottom: 4 },
  rulesRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rulesText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#9CA3AF', flex: 1 },
  errorBanner: { marginHorizontal: 16, backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 10, padding: 12, marginBottom: 8 },
  errorText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#EF4444', textAlign: 'center' },
  footer: {
    paddingHorizontal: 16, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: Colors.borderColor,
    backgroundColor: Colors.darkBg,
  },
  readyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.gold + '55',
    backgroundColor: 'rgba(201,168,76,0.08)',
  },
  readyBtnOn: { borderColor: '#22C55E66', backgroundColor: 'rgba(34,197,94,0.10)' },
  readyBtnText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  startBtn: { borderRadius: 14, overflow: 'hidden' },
  startBtnDisabled: { opacity: 0.8 },
  startBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  startBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.darkBg },
  startBtnTextDisabled: { color: '#4B5563' },
  waitingBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.cardBg, borderRadius: 14, paddingVertical: 16,
    borderWidth: 1, borderColor: Colors.borderColor,
  },
  waitingText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#9CA3AF' },
});
