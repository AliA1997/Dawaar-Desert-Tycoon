import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  FlatList,
  Image,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';

import Colors from '@/constants/colors';
import { useGame, TOKENS, getTokenImage } from '@/context/GameContext';
import type { BoardProperty, Player } from '@/context/GameContext';
import { useSubscription } from '@/lib/revenuecat';
import SubscribeModal from '@/components/SubscribeModal';
import TradeModal from '@/components/TradeModal';
import { GameBoard, GROUP_COLORS } from '@/components/Board';
import PropertyCard from '@/components/PropertyCard';

const DICE_GIF = require('../assets/dice.gif');

// Fires at cumulative turns [4, 9, 16, 20, 25, 32…] (+4, +5, +7 cycling)
const INTERSTITIAL_GAPS = [4, 5, 7] as const;

function DiceDisplay({ dice }: { dice: number[] | null }) {
  if (!dice || dice.length === 0) return null;
  const faces = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  return (
    <View style={diceStyles.row}>
      {dice.map((d, i) => (
        <View key={i} style={diceStyles.die}>
          <Text style={diceStyles.face}>{faces[d]}</Text>
        </View>
      ))}
    </View>
  );
}

const diceStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  die: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.warmCream,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  face: { fontSize: 28, color: Colors.darkBg },
});

// ─── Landing-card helpers ──────────────────────────────────────────────────────

function getLandingEmoji(space: BoardProperty): string {
  if (space.colorGroup) {
    const m: Record<string, string> = {
      brown: '🌿', lightblue: '🌊', pink: '🌸', orange: '🌅',
      red: '🌹', yellow: '⭐', green: '💎', darkblue: '👑',
    };
    return m[space.colorGroup] ?? '🏙️';
  }
  const m: Record<string, string> = {
    go: '▶️', jail: '⛓️', free_parking: '🅿️', go_to_jail: '🔒',
    chance: '❓', community: '♡', tax: '💸', railroad: '🚂', utility: '⚡',
  };
  return m[space.type] ?? '🎲';
}

function getLandingContext(
  space: BoardProperty,
  movingPlayer: Player,
  allPlayers: Player[],
): string {
  switch (space.type) {
    case 'go':          return 'Collect 2,000 DHS!';
    case 'jail':        return 'Just visiting…';
    case 'free_parking':return 'Rest and relax!';
    case 'go_to_jail':  return 'Go directly to jail!';
    case 'chance':      return 'Draw a Chance card';
    case 'community':   return 'Draw a Community Chest card';
    case 'tax':         return `Pay ${space.taxAmount?.toLocaleString()} DHS`;
    case 'property':
    case 'railroad':
    case 'utility': {
      if (!space.ownerId) return `For sale: ${space.price?.toLocaleString()} DHS`;
      if (space.ownerId === movingPlayer.id) return 'Your own property!';
      const owner = allPlayers.find(p => p.id === space.ownerId);
      if (space.isMortgaged) return `Mortgaged — no rent due`;
      const rentIdx = space.hotel ? 5 : (space.houses ?? 0);
      const rent = space.rent?.[rentIdx] ?? 0;
      return `Owned by ${owner?.name ?? '?'} — Pay ${rent.toLocaleString()} DHS`;
    }
    default: return '';
  }
}

// ──────────────────────────────────────────────────────────────────────────────

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const {
    gameState, myPlayerId, myPlayer, isMyTurn,
    rollDice, buyProperty, buildHouse, sellHouse, auctionBuy, endTurn, payJail, leaveGame,
    error, clearError, lastDiceRoll,
    npcThinking, isSinglePlayer, npcPlayerIds,
    claimAdReward, proposeTrade, acceptTrade, declineTrade, chooseTax,
  } = useGame();

  const [selectedProperty, setSelectedProperty] = useState<BoardProperty | null>(null);
  const [showLog, setShowLog] = useState(false);
  const [showPlayers, setShowPlayers] = useState(false);
  const [diceAnimating, setDiceAnimating] = useState(false);
  const [logFilter, setLogFilter] = useState<'all' | 'rent' | 'cards' | 'buildings' | 'trades'>('all');
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [bankruptToast, setBankruptToast] = useState<string | null>(null);
  const prevBankruptRef = useRef<Set<string>>(new Set());

  // Movement tracking
  const prevPositionsRef = useRef<Record<string, number>>({});
  const [highlightPos, setHighlightPos] = useState<number | null>(null);
  const [landingCard, setLandingCard] = useState<BoardProperty | null>(null);
  const [landingPlayer, setLandingPlayer] = useState<Player | null>(null);
  const [lastCardText, setLastCardText] = useState<string | null>(null);
  const [lastCardType, setLastCardType] = useState<'chance' | 'community' | null>(null);
  const [showBuild, setShowBuild] = useState(false);
  const [showAuction, setShowAuction] = useState(false);
  const [humanBid, setHumanBid] = useState(0);
  const [npcAuctionBids, setNpcAuctionBids] = useState<Array<{ id: string; name: string; color: string; bid: number }>>([]);
  const [auctionPhase, setAuctionPhase] = useState<'bidding' | 'resolved'>('bidding');
  const [auctionWinner, setAuctionWinner] = useState<{ id: string; name: string; bid: number } | null>(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [adWatched, setAdWatched] = useState(false);
  const [adClaiming, setAdClaiming] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [showTrade, setShowTrade] = useState(false);
  const [doublesGranted, setDoublesGranted] = useState(false);
  const [showEndTurnConfirm, setShowEndTurnConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const adTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Subscription
  const { isSubscribed } = useSubscription();

  const turnCountRef = useRef(0);
  const interstitialGapIdxRef = useRef(0);
  const nextInterstitialRef = useRef(INTERSTITIAL_GAPS[0]);
  const landingDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const landingCardY = useSharedValue(300);

  const landingCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: landingCardY.value }],
  }));

  const clearLandingState = useCallback(() => {
    setLandingCard(null);
    setLandingPlayer(null);
    setHighlightPos(null);
    setLastCardText(null);
    setLastCardType(null);
  }, []);

  const openAdModal = useCallback(() => {
    setAdCountdown(5);
    setShowAdModal(true);
    if (adTimerRef.current) clearInterval(adTimerRef.current);
    adTimerRef.current = setInterval(() => {
      setAdCountdown(prev => {
        if (prev <= 1) {
          clearInterval(adTimerRef.current!);
          adTimerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleClaimAdReward = useCallback(async () => {
    setAdClaiming(true);
    await claimAdReward();
    setAdClaiming(false);
    setAdWatched(true);
    setShowAdModal(false);
  }, [claimAdReward]);

  const dismissLanding = useCallback(() => {
    if (landingDismissRef.current) clearTimeout(landingDismissRef.current);
    landingCardY.value = withTiming(300, { duration: 220 }, (done) => {
      if (done) runOnJS(clearLandingState)();
    });
  }, [clearLandingState]);

  // Detect any player position change and animate
  const posKey = gameState?.players.map(p => `${p.id}:${p.position}`).join(',') ?? '';
  useEffect(() => {
    if (!gameState) return;
    gameState.players.forEach(player => {
      if (player.isBankrupt) { prevPositionsRef.current[player.id] = player.position; return; }
      const prev = prevPositionsRef.current[player.id];
      if (prev === undefined) { prevPositionsRef.current[player.id] = player.position; return; }
      if (prev !== player.position) {
        const from = prev;
        const to = player.position;
        const steps = ((to - from + 40) % 40) || 1;
        prevPositionsRef.current[player.id] = to;

        // Clear prior animation
        if (stepTimerRef.current) clearInterval(stepTimerRef.current);
        if (landingDismissRef.current) clearTimeout(landingDismissRef.current);

        let step = 0;
        setHighlightPos((from + 1) % 40);

        // Extract chance/community card text from log if drawn in the last 8 seconds
        const now = Date.now();
        const recentLogs = [...gameState.log].reverse().slice(0, 8);
        const cardEntry = recentLogs.find(l => {
          if (!l.message.startsWith('CHANCE:') && !l.message.startsWith('COMMUNITY CHEST:')) return false;
          return now - new Date(l.timestamp).getTime() < 8000;
        });
        const extractedCardText = cardEntry
          ? cardEntry.message.replace(/^(CHANCE|COMMUNITY CHEST): /, '')
          : null;

        stepTimerRef.current = setInterval(() => {
          step++;
          setHighlightPos((from + step) % 40);
          if (step >= steps) {
            clearInterval(stepTimerRef.current!);
            stepTimerRef.current = null;
            // Show landing card (with optional card text)
            setLandingCard(gameState.board[to]);
            setLandingPlayer(player);
            setLastCardText(extractedCardText);
            setLastCardType(cardEntry?.message.startsWith('COMMUNITY CHEST:') ? 'community' : extractedCardText ? 'chance' : null);
            landingCardY.value = withSpring(0, { damping: 18, stiffness: 120 });
            landingDismissRef.current = setTimeout(dismissLanding, 4000);
          }
        }, 130);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posKey]);

  // Cleanup on unmount
  useEffect(() => () => {
    if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    if (landingDismissRef.current) clearTimeout(landingDismissRef.current);
  }, []);

  // Reset doublesGranted when the active player changes
  useEffect(() => {
    setDoublesGranted(false);
  }, [gameState?.currentPlayerId]);

  // Auto-dismiss error banner after 6 seconds
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(clearError, 6000);
    return () => clearTimeout(t);
  }, [error, clearError]);

  // Detect newly bankrupt players
  useEffect(() => {
    if (!gameState) return;
    gameState.players.forEach(p => {
      if (p.isBankrupt && !prevBankruptRef.current.has(p.id)) {
        prevBankruptRef.current.add(p.id);
        const label = p.id === myPlayerId ? 'You are bankrupt!' : `${p.name} is bankrupt!`;
        setBankruptToast(label);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setTimeout(() => setBankruptToast(null), 4000);
      }
    });
  }, [gameState?.players.map(p => `${p.id}:${p.isBankrupt}`).join(',')]);

  // Show tax choice modal when it's my turn to choose
  useEffect(() => {
    if (gameState?.pendingTaxChoice?.playerId === myPlayerId) {
      setShowTaxModal(true);
    } else {
      setShowTaxModal(false);
    }
  }, [gameState?.pendingTaxChoice, myPlayerId]);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const canBuyCurrentSpace = useMemo(() => {
    if (!gameState || !myPlayer || !isMyTurn) return false;
    const space = gameState.board[myPlayer.position];
    const hasMoved = gameState.hasRolled || myPlayer.doublesCount > 0;
    return !!(hasMoved && space &&
      (space.type === 'property' || space.type === 'railroad' || space.type === 'utility') &&
      !space.ownerId && space.price != null && myPlayer.money >= space.price);
  }, [gameState, myPlayer, isMyTurn]);

  const myBuildableProps = useMemo(() => {
    if (!gameState || !myPlayer) return [];
    return gameState.board.filter(s => {
      if (s.type !== 'property' || !s.colorGroup || s.ownerId !== myPlayer.id) return false;
      if (s.hotel) return false;
      return gameState.board.filter(b => b.colorGroup === s.colorGroup).every(b => b.ownerId === myPlayer.id);
    });
  }, [gameState, myPlayer]);

  const myPropsWithBuildings = useMemo(() => {
    if (!gameState || !myPlayer) return [];
    return gameState.board.filter(s =>
      s.type === 'property' && s.ownerId === myPlayer.id && (s.houses > 0 || s.hotel)
    );
  }, [gameState, myPlayer]);

  const onCellLongPress = useCallback((space: BoardProperty) => {
    if (space.type === 'property' || space.type === 'railroad' || space.type === 'utility') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedProperty(space);
    }
  }, []);

  useEffect(() => {
    if (!gameState) {
      router.replace('/');
    } else if (gameState.status === 'finished' && gameState.winnerId) {
      setShowGameOver(true);
    }
  }, [gameState?.status]);

  if (!gameState) return null;

  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
  const mySpace = myPlayer ? gameState.board[myPlayer.position] : null;

  const handleRoll = async () => {
    if (!isMyTurn || gameState.hasRolled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setDiceAnimating(true);
    const result = await rollDice();
    setDiceAnimating(false);
    if (result?.isDoubles) {
      setDoublesGranted(true);
    }
  };

  const handleEndTurn = () => setShowEndTurnConfirm(true);

  const confirmEndTurn = async () => {
    setShowEndTurnConfirm(false);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await endTurn();
    if (!isSubscribed) {
      turnCountRef.current += 1;
      if (turnCountRef.current >= nextInterstitialRef.current) {
        setShowInterstitial(true);
        interstitialGapIdxRef.current = (interstitialGapIdxRef.current + 1) % INTERSTITIAL_GAPS.length;
        nextInterstitialRef.current = turnCountRef.current + INTERSTITIAL_GAPS[interstitialGapIdxRef.current];
      }
    }
  };

  const handleBuy = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await buyProperty();
  };

  const handleAuction = () => {
    if (!mySpace || !mySpace.price) return;
    setHumanBid(Math.floor(mySpace.price * 0.5));
    setNpcAuctionBids([]);
    setAuctionPhase('bidding');
    setAuctionWinner(null);
    setShowAuction(true);
  };

  const handleSubmitBid = async () => {
    if (!mySpace || !myPlayerId || !myPlayer) return;
    const myBid = { id: myPlayerId, name: 'You', color: myPlayer.color, bid: humanBid };
    const allBids = [...npcAuctionBids, myBid];
    const winner = allBids.reduce((best, b) => b.bid > best.bid ? b : best, allBids[0]);
    setAuctionWinner(winner);
    setAuctionPhase('resolved');
    await auctionBuy(mySpace.index, winner.id, winner.bid);
    setTimeout(() => setShowAuction(false), 2500);
  };

  // Simulate NPC bids sequentially when auction opens
  useEffect(() => {
    if (!showAuction || !mySpace || !gameState || !mySpace.price) return;
    setNpcAuctionBids([]);
    const activeBots = gameState.players.filter(p =>
      npcPlayerIds.includes(p.id) && !p.isBankrupt && p.money > 0
    );
    const timers: ReturnType<typeof setTimeout>[] = [];
    activeBots.forEach((bot, i) => {
      const t = setTimeout(() => {
        const maxBid = Math.min(
          Math.floor((mySpace.price ?? 0) * 0.95),
          Math.floor(bot.money * 0.35)
        );
        const groupBonus = mySpace.colorGroup
          ? gameState.board.filter(s => s.colorGroup === mySpace.colorGroup && s.ownerId === bot.id).length * 0.15
          : 0;
        const bid = Math.max(0, Math.floor(maxBid * (1 + groupBonus) * (0.7 + Math.random() * 0.5)));
        const finalBid = Math.min(bid, bot.money);
        setNpcAuctionBids(prev => [...prev, { id: bot.id, name: bot.name, color: bot.color, bid: finalBid }]);
      }, (i + 1) * 1400);
      timers.push(t);
    });
    return () => timers.forEach(t => clearTimeout(t));
  }, [showAuction]);

  const handlePayJail = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await payJail();
  };

  const handleLeave = () => setShowLeaveConfirm(true);


  return (
    <View style={gameStyles.container}>
      <LinearGradient colors={[Colors.darkBg, '#050D18']} style={StyleSheet.absoluteFill} />

      {/* Top Bar */}
      <View style={[gameStyles.topBar, { paddingTop: topPad + 8 }]}>
        <TouchableOpacity onPress={handleLeave} style={gameStyles.topBtn}>
          <Ionicons name="exit-outline" size={22} color="#6B7280" />
        </TouchableOpacity>
        <View style={gameStyles.turnInfo}>
          {currentPlayer && (
            <>
              <View style={[gameStyles.turnDot, { backgroundColor: currentPlayer.color }]} />
              <Text style={gameStyles.turnText}>
                {currentPlayer.id === myPlayerId ? 'Your Turn' : `${currentPlayer.name}'s Turn`}
              </Text>
            </>
          )}
        </View>
        <View style={gameStyles.topBtnsRight}>
          <TouchableOpacity onPress={() => setShowSubscribe(true)} style={gameStyles.topBtn}>
            <Ionicons name="star" size={20} color={isSubscribed ? Colors.gold : '#6B7280'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowPlayers(true)} style={gameStyles.topBtn}>
            <Ionicons name="people" size={22} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowLog(true)} style={gameStyles.topBtn}>
            <Ionicons name="list" size={22} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Board */}
      <View style={gameStyles.boardContainer}>
        <GameBoard
          board={gameState.board}
          players={gameState.players}
          highlightPos={highlightPos}
          onCellLongPress={onCellLongPress}
        />
      </View>

      {/* ── Landing card ── slides up over the status bar when a piece lands ── */}
      {landingCard && landingPlayer && (
        <Animated.View style={[gameStyles.landingWrap, landingCardStyle]} pointerEvents="box-none">
          <TouchableOpacity onPress={dismissLanding} activeOpacity={0.92} style={[
            gameStyles.landingCard,
            landingCard.colorGroup ? { borderColor: GROUP_COLORS[landingCard.colorGroup] + 'AA' } : {},
          ]}>
            {/* Color stripe */}
            {landingCard.colorGroup && (
              <View style={[gameStyles.landingStripe, { backgroundColor: GROUP_COLORS[landingCard.colorGroup] }]} />
            )}
            <View style={gameStyles.landingBody}>
              <Text style={gameStyles.landingEmoji}>{getLandingEmoji(landingCard)}</Text>
              <View style={gameStyles.landingTexts}>
                <Text style={[gameStyles.landingWho, { color: landingPlayer.color }]}>
                  {landingPlayer.id === myPlayerId ? 'You landed on' : `${landingPlayer.name} landed on`}
                </Text>
                <Text style={gameStyles.landingName}>{landingCard.name}</Text>
                <Text style={gameStyles.landingCtx}>
                  {getLandingContext(landingCard, landingPlayer, gameState.players)}
                </Text>
                {/* Chance / Community chest card text */}
                {lastCardText && (
                  <View style={gameStyles.cardTextBox}>
                    <Text style={gameStyles.cardTextLabel}>
                      {lastCardType === 'community' ? '♡ Community Chest' : '✦ Chance'}
                    </Text>
                    <Text style={gameStyles.cardTextBody}>{lastCardText}</Text>
                  </View>
                )}
              </View>
            </View>
            <Text style={gameStyles.landingDismissTip}>tap to dismiss</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* My status */}
      {myPlayer && (
        <View style={gameStyles.myStatus}>
          <View style={gameStyles.myStatusLeft}>
            <View style={[gameStyles.tokenBg, { backgroundColor: myPlayer.color + '22' }]}>
              <Image source={getTokenImage(myPlayer.token)} style={gameStyles.statusTokenImg} />
            </View>
            <View>
              <Text style={gameStyles.myMoney}>{myPlayer.money.toLocaleString()} DHS</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 1 }}>
                {mySpace && <Text style={gameStyles.myPosition}>{mySpace.name}</Text>}
                {myPlayer.inJail && (
                  <Text style={gameStyles.jailBadge}>🔒 In Jail</Text>
                )}
              </View>
            </View>
          </View>
          {lastDiceRoll && (
            <DiceDisplay dice={lastDiceRoll} />
          )}
        </View>
      )}

      {/* Error */}
      {error && (
        <TouchableOpacity style={gameStyles.errorBanner} onPress={clearError}>
          <Ionicons name="alert-circle" size={14} color="#EF4444" />
          <Text style={gameStyles.errorText}>{error}</Text>
        </TouchableOpacity>
      )}

      {/* Doubles toast — slides in when player earns a re-roll */}
      {doublesGranted && !gameState.hasRolled && isMyTurn && (
        <View style={gameStyles.doublesToast}>
          <Ionicons name="sparkles" size={15} color={Colors.gold} />
          <Text style={gameStyles.doublesToastText}>You rolled doubles! Roll again!</Text>
        </View>
      )}

      {/* Actions Panel */}
      <View style={[gameStyles.actionsPanel, { paddingBottom: botPad + 8 }]}>
        {/* Pending trade banner — shows when someone proposes a trade to you */}
        {gameState.pendingTrade && gameState.pendingTrade.toPlayerId === myPlayerId && (() => {
          const from = gameState.players.find(p => p.id === gameState.pendingTrade?.fromPlayerId);
          const trade = gameState.pendingTrade;
          return (
            <View style={gameStyles.tradeBanner}>
              <Ionicons name="swap-horizontal" size={18} color={Colors.gold} />
              <View style={{ flex: 1 }}>
                <Text style={gameStyles.tradeBannerText} numberOfLines={1}>
                  {from?.name ?? 'Someone'} wants to trade!
                </Text>
                {trade.offeredMoney > 0 && (
                  <Text style={gameStyles.tradeBannerSub}>
                    Offers {trade.offeredMoney.toLocaleString()} DHS
                    {trade.offeredPropertyIndices.length > 0 ? ` + ${trade.offeredPropertyIndices.length} prop(s)` : ''}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={gameStyles.tradeDeclineBtn}
                onPress={async () => { try { await declineTrade(); } catch {} }}
              >
                <Text style={gameStyles.tradeDeclineText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={gameStyles.tradeAcceptBtn}
                onPress={async () => { try { await acceptTrade(); } catch {} }}
              >
                <Text style={gameStyles.tradeAcceptText}>Accept</Text>
              </TouchableOpacity>
            </View>
          );
        })()}
        {isMyTurn ? (
          <View style={gameStyles.actionBtns}>
            {!gameState.hasRolled && myPlayer?.inJail && (
              <TouchableOpacity style={gameStyles.buyBtn} onPress={handlePayJail}>
                <LinearGradient colors={['#EF4444', '#B91C1C']} style={gameStyles.buyBtnGrad}>
                  <Ionicons name="exit" size={20} color="white" />
                  <Text style={gameStyles.buyBtnText}>Pay 500 DHS — Leave Jail</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            {!gameState.hasRolled && (
              <TouchableOpacity style={gameStyles.rollBtn} onPress={handleRoll}>
                <LinearGradient colors={[Colors.gold, '#A07830']} style={gameStyles.rollBtnGrad}>
                  <Ionicons name="dice" size={22} color={Colors.darkBg} />
                  <Text style={gameStyles.rollBtnText}>{myPlayer?.inJail ? 'Roll for Doubles' : 'Roll Dice'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            {canBuyCurrentSpace && (
              <View style={gameStyles.buyRow}>
                <TouchableOpacity style={[gameStyles.buyBtn, { flex: 1 }]} onPress={handleBuy}>
                  <LinearGradient colors={['#22C55E', '#16A34A']} style={gameStyles.buyBtnGrad}>
                    <Ionicons name="business" size={20} color="white" />
                    <Text style={gameStyles.buyBtnText}>Buy {mySpace?.name}</Text>
                  </LinearGradient>
                </TouchableOpacity>
                {isSinglePlayer && (
                  <TouchableOpacity style={gameStyles.auctionBtn} onPress={handleAuction}>
                    <Ionicons name="hammer" size={16} color={Colors.gold} />
                    <Text style={gameStyles.auctionBtnText}>Auction</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            {isMyTurn && (myBuildableProps.length > 0 || myPropsWithBuildings.length > 0) && (
              <TouchableOpacity style={gameStyles.buildBtn} onPress={() => setShowBuild(true)}>
                <View style={gameStyles.buildBtnInner}>
                  <Ionicons name="home" size={18} color="#22C55E" />
                  <Text style={gameStyles.buildBtnText}>Build / Sell</Text>
                </View>
              </TouchableOpacity>
            )}
            {isMyTurn && !isSinglePlayer && (
              <TouchableOpacity style={gameStyles.buildBtn} onPress={() => setShowTrade(true)}>
                <View style={gameStyles.buildBtnInner}>
                  <Ionicons name="swap-horizontal" size={18} color={Colors.gold} />
                  <Text style={[gameStyles.buildBtnText, { color: Colors.gold }]}>Trade</Text>
                </View>
              </TouchableOpacity>
            )}
            {gameState.hasRolled && (
              <TouchableOpacity style={gameStyles.endBtn} onPress={handleEndTurn}>
                <View style={gameStyles.endBtnInner}>
                  <Ionicons name="chevron-forward-circle" size={20} color={Colors.warmCream} />
                  <Text style={gameStyles.endBtnText}>End Turn</Text>
                </View>
              </TouchableOpacity>
            )}
            {!isSubscribed && !adWatched && (
              <TouchableOpacity style={gameStyles.adWatchBtn} onPress={openAdModal}>
                <Ionicons name="play-circle" size={15} color={Colors.gold} />
                <Text style={gameStyles.adWatchBtnText}>+1,500 DHS</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={gameStyles.waitingPanel}>
            {isSinglePlayer && npcThinking ? (
              <View style={gameStyles.botThinkingRow}>
                <BotThinkingDots />
                <Text style={gameStyles.botThinkingText}>
                  {currentPlayer?.name} is thinking...
                </Text>
              </View>
            ) : (
              <Text style={gameStyles.waitingText}>
                {currentPlayer ? `Waiting for ${currentPlayer.name}...` : 'Waiting...'}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Property Modal */}
      <Modal
        visible={!!selectedProperty}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedProperty(null)}
      >
        <TouchableOpacity
          style={gameStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedProperty(null)}
        >
          <TouchableOpacity activeOpacity={1} style={gameStyles.modalContent}>
            {selectedProperty && (
              <PropertyCard property={selectedProperty} onClose={() => setSelectedProperty(null)} />
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Build / Sell Modal */}
      <Modal visible={showBuild} transparent animationType="slide" onRequestClose={() => setShowBuild(false)}>
        <View style={gameStyles.logModalOverlay}>
          <View style={[gameStyles.logModal, { paddingBottom: botPad + 16 }]}>
            <View style={gameStyles.logHeader}>
              <Text style={gameStyles.logTitle}>Build &amp; Sell Buildings</Text>
              <TouchableOpacity onPress={() => setShowBuild(false)}>
                <Ionicons name="close" size={22} color={Colors.warmCream} />
              </TouchableOpacity>
            </View>
            {myBuildableProps.length === 0 && myPropsWithBuildings.length === 0 ? (
              <Text style={gameStyles.buildEmptyText}>
                Own all properties in a color group to build houses.
              </Text>
            ) : (
              <FlatList
                data={[
                  ...myBuildableProps.map(p => ({ ...p, _mode: 'build' as const })),
                  ...myPropsWithBuildings
                    .filter(p => !myBuildableProps.some(b => b.index === p.index))
                    .map(p => ({ ...p, _mode: 'sell' as const })),
                ]}
                keyExtractor={item => String(item.index)}
                renderItem={({ item }) => {
                  const groupColor = item.colorGroup ? GROUP_COLORS[item.colorGroup] : '#888';
                  const nextCost = item.houses < 4 ? (item.houseCost ?? 1000) : (item.hotelCost ?? 1000);
                  const canAfford = (myPlayer?.money ?? 0) >= nextCost;
                  const buildLabel = item.houses < 4 ? `House ${item.houses + 1}/4` : 'Hotel';
                  const sellRefund = item.hotel
                    ? Math.floor((item.hotelCost ?? 1000) / 2)
                    : Math.floor((item.houseCost ?? 1000) / 2);
                  const hasBuildable = item._mode === 'build' || myBuildableProps.some(b => b.index === item.index);
                  const hasSellable = item.houses > 0 || item.hotel;
                  return (
                    <View style={gameStyles.buildRow}>
                      <View style={[gameStyles.buildColorDot, { backgroundColor: groupColor }]} />
                      <View style={gameStyles.buildInfo}>
                        <Text style={gameStyles.buildPropName}>{item.name}</Text>
                        <View style={gameStyles.buildPipRow}>
                          {Array.from({ length: item.houses }).map((_, i) => (
                            <View key={i} style={gameStyles.pipHouse} />
                          ))}
                          {item.hotel && <View style={gameStyles.pipHotel} />}
                        </View>
                        {hasBuildable && !item.hotel && (
                          <Text style={[gameStyles.buildCostText, !canAfford && { color: '#EF4444' }]}>
                            {buildLabel} — {nextCost.toLocaleString()} DHS
                          </Text>
                        )}
                        {hasSellable && (
                          <Text style={gameStyles.sellRefundText}>
                            Sell → +{sellRefund.toLocaleString()} DHS
                          </Text>
                        )}
                      </View>
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        {hasBuildable && !item.hotel && (
                          <TouchableOpacity
                            style={[gameStyles.buildConfirmBtn, !canAfford && { opacity: 0.4 }]}
                            disabled={!canAfford}
                            onPress={async () => {
                              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                              await buildHouse(item.index);
                            }}
                          >
                            <Ionicons name="add-circle" size={28} color="#22C55E" />
                          </TouchableOpacity>
                        )}
                        {hasSellable && (
                          <TouchableOpacity
                            style={gameStyles.sellConfirmBtn}
                            onPress={async () => {
                              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                              await sellHouse(item.index);
                            }}
                          >
                            <Ionicons name="remove-circle" size={28} color="#EF4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                }}
                style={gameStyles.logList}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Auction Modal */}
      <Modal visible={showAuction} transparent animationType="slide" onRequestClose={() => setShowAuction(false)}>
        <View style={gameStyles.logModalOverlay}>
          <View style={[gameStyles.logModal, { paddingBottom: botPad + 16 }]}>
            <View style={gameStyles.logHeader}>
              <Text style={gameStyles.logTitle}>🏛️ Property Auction</Text>
              <TouchableOpacity onPress={() => { setShowAuction(false); }}>
                <Ionicons name="close" size={22} color={Colors.warmCream} />
              </TouchableOpacity>
            </View>

            {mySpace && (
              <View style={gameStyles.auctionPropertyBox}>
                <View style={[gameStyles.auctionColorBar, { backgroundColor: mySpace.colorGroup ? GROUP_COLORS[mySpace.colorGroup] : Colors.gold }]} />
                <View style={{ flex: 1 }}>
                  <Text style={gameStyles.auctionPropName}>{mySpace.name}</Text>
                  <Text style={gameStyles.auctionPropPrice}>Face value: {mySpace.price?.toLocaleString()} DHS</Text>
                </View>
              </View>
            )}

            <View style={gameStyles.auctionBidsList}>
              {npcAuctionBids.map(bid => (
                <View key={bid.id} style={gameStyles.auctionBidRow}>
                  <View style={[gameStyles.auctionBidDot, { backgroundColor: bid.color }]} />
                  <Text style={gameStyles.auctionBidName}>{bid.name}</Text>
                  <Text style={gameStyles.auctionBidAmount}>
                    {bid.bid > 0 ? `${bid.bid.toLocaleString()} DHS` : 'Passed'}
                  </Text>
                </View>
              ))}
            </View>

            {auctionPhase === 'bidding' ? (
              <View style={gameStyles.auctionInputArea}>
                <Text style={gameStyles.auctionInputLabel}>Your bid (DHS)</Text>
                <View style={gameStyles.auctionInputRow}>
                  <TouchableOpacity
                    style={gameStyles.auctionStepBtn}
                    onPress={() => setHumanBid(v => Math.max(0, v - 100))}
                  >
                    <Text style={gameStyles.auctionStepBtnText}>−100</Text>
                  </TouchableOpacity>
                  <Text style={gameStyles.auctionBidValue}>{humanBid.toLocaleString()}</Text>
                  <TouchableOpacity
                    style={gameStyles.auctionStepBtn}
                    onPress={() => setHumanBid(v => Math.min(myPlayer?.money ?? 0, v + 100))}
                  >
                    <Text style={gameStyles.auctionStepBtnText}>+100</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={gameStyles.auctionSubmitBtn}
                  onPress={handleSubmitBid}
                  disabled={humanBid <= 0}
                >
                  <LinearGradient colors={[Colors.gold, '#A07830']} style={gameStyles.auctionSubmitGrad}>
                    <Text style={gameStyles.auctionSubmitText}>
                      {humanBid > 0 ? `Submit Bid — ${humanBid.toLocaleString()} DHS` : 'Pass (Enter a bid > 0)'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={gameStyles.auctionResultBox}>
                {auctionWinner && (
                  <>
                    <Text style={gameStyles.auctionResultLabel}>
                      {auctionWinner.id === myPlayerId ? '🏆 You won the auction!' : `${auctionWinner.name} won the auction!`}
                    </Text>
                    <Text style={gameStyles.auctionResultPrice}>{auctionWinner.bid.toLocaleString()} DHS</Text>
                  </>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Game Log Modal */}
      <Modal visible={showLog} transparent animationType="slide" onRequestClose={() => setShowLog(false)}>
        <View style={gameStyles.logModalOverlay}>
          <View style={[gameStyles.logModal, { paddingBottom: botPad + 16 }]}>
            <View style={gameStyles.logHeader}>
              <Text style={gameStyles.logTitle}>Game Log</Text>
              <TouchableOpacity onPress={() => setShowLog(false)}>
                <Ionicons name="close" size={22} color={Colors.warmCream} />
              </TouchableOpacity>
            </View>
            {/* Filter chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={gameStyles.logFilterRow} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 10 }}>
              {(['all', 'rent', 'cards', 'buildings', 'trades'] as const).map(f => (
                <TouchableOpacity
                  key={f}
                  style={[gameStyles.logChip, logFilter === f && gameStyles.logChipActive]}
                  onPress={() => setLogFilter(f)}
                >
                  <Text style={[gameStyles.logChipText, logFilter === f && gameStyles.logChipTextActive]}>
                    {f === 'all' ? 'All' : f === 'rent' ? 'Rent' : f === 'cards' ? 'Cards' : f === 'buildings' ? 'Buildings' : 'Trades'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <FlatList
              data={(() => {
                const reversed = [...gameState.log].reverse();
                if (logFilter === 'all') return reversed;
                return reversed.filter(item => {
                  const m = item.message.toLowerCase();
                  if (logFilter === 'rent') return m.includes('rent') || m.includes('paid');
                  if (logFilter === 'cards') return m.includes('chance') || m.includes('community') || m.includes('chest');
                  if (logFilter === 'buildings') return m.includes('house') || m.includes('hotel') || m.includes('built') || m.includes('sold');
                  if (logFilter === 'trades') return m.includes('trade') || m.includes('offer');
                  return true;
                });
              })()}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item }) => (
                <View style={gameStyles.logItem}>
                  <Text style={gameStyles.logMessage}>{item.message}</Text>
                  <Text style={gameStyles.logTime}>
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              )}
              style={gameStyles.logList}
            />
          </View>
        </View>
      </Modal>

      {/* Players Modal */}
      <Modal visible={showPlayers} transparent animationType="slide" onRequestClose={() => setShowPlayers(false)}>
        <View style={gameStyles.logModalOverlay}>
          <View style={[gameStyles.logModal, { paddingBottom: botPad + 16 }]}>
            <View style={gameStyles.logHeader}>
              <Text style={gameStyles.logTitle}>Players</Text>
              <TouchableOpacity onPress={() => setShowPlayers(false)}>
                <Ionicons name="close" size={22} color={Colors.warmCream} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {gameState.players.map(player => {
                const playerProps = player.properties.map(i => gameState.board[i]).filter(Boolean);
                return (
                  <View key={player.id} style={[gameStyles.playerCard, player.isBankrupt && gameStyles.playerCardBankrupt]}>
                    <View style={gameStyles.playerCardHeader}>
                      <View style={[gameStyles.playerColorBg, { backgroundColor: player.color + '22' }]}>
                        <Image source={getTokenImage(player.token)} style={gameStyles.modalTokenImg} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={gameStyles.playerCardName}>{player.name}</Text>
                          {player.id === myPlayerId && (
                            <Text style={gameStyles.youBadge}>You</Text>
                          )}
                          {npcPlayerIds.includes(player.id) && (
                            <Text style={gameStyles.botBadge}>Bot</Text>
                          )}
                          {player.id === gameState.currentPlayerId && (
                            <Text style={gameStyles.activeBadge}>Active</Text>
                          )}
                          {player.isBankrupt && (
                            <Text style={gameStyles.bankruptBadge}>Bankrupt</Text>
                          )}
                        </View>
                        <Text style={gameStyles.playerCardMoney}>{player.money.toLocaleString()} DHS</Text>
                      </View>
                      {player.inJail && <Ionicons name="lock-closed" size={16} color="#EF4444" />}
                    </View>
                    {playerProps.length > 0 && (
                      <View style={gameStyles.playerPropsRow}>
                        {playerProps.slice(0, 6).map(prop => (
                          <View
                            key={prop.index}
                            style={[
                              gameStyles.propChip,
                              { backgroundColor: (prop.colorGroup ? GROUP_COLORS[prop.colorGroup] : Colors.gold) + '33' },
                            ]}
                          >
                            <Text style={[gameStyles.propChipText, { color: prop.colorGroup ? GROUP_COLORS[prop.colorGroup] : Colors.gold }]}>
                              {prop.name.split(',')[0].substring(0, 8)}
                            </Text>
                          </View>
                        ))}
                        {playerProps.length > 6 && (
                          <Text style={gameStyles.moreProps}>+{playerProps.length - 6}</Text>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─── Rewarded Video Modal ─────────────────────────────────────────── */}
      <Modal visible={showAdModal} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={gameStyles.adOverlay}>
          <View style={gameStyles.adCard}>
            {/* Header */}
            <View style={gameStyles.adHeader}>
              <View style={gameStyles.adSponsorBadge}>
                <Text style={gameStyles.adSponsorText}>SPONSORED</Text>
              </View>
              {adCountdown > 0 && (
                <View style={gameStyles.adCountdownBadge}>
                  <Text style={gameStyles.adCountdownText}>{adCountdown}s</Text>
                </View>
              )}
            </View>

            {adCountdown > 0 ? (
              /* ── Video playing state ── */
              <>
                <View style={gameStyles.adVideoFrame}>
                  <View style={gameStyles.adVideoPlaceholder}>
                    <Ionicons name="videocam" size={38} color="rgba(255,255,255,0.3)" />
                    <Text style={gameStyles.adVideoLabel}>Video Ad Playing</Text>
                    <View style={gameStyles.adProgressBar}>
                      <View style={[gameStyles.adProgressFill, { width: `${((5 - adCountdown) / 5) * 100}%` }]} />
                    </View>
                  </View>
                </View>
                <Text style={gameStyles.adWaitText}>Watch to earn 1,500 DHS</Text>
              </>
            ) : (
              /* ── Reward ready state ── */
              <>
                <View style={gameStyles.adRewardReady}>
                  <Ionicons name="checkmark-circle" size={56} color="#22C55E" />
                  <Text style={gameStyles.adRewardTitle}>Reward Earned!</Text>
                  <Text style={gameStyles.adRewardAmt}>+1,500 DHS</Text>
                  <Text style={gameStyles.adRewardSub}>Added to your balance</Text>
                </View>
                <TouchableOpacity
                  style={[gameStyles.adClaimBtn, adClaiming && { opacity: 0.6 }]}
                  onPress={handleClaimAdReward}
                  disabled={adClaiming}
                >
                  <LinearGradient colors={[Colors.gold, '#A07830']} style={gameStyles.adClaimGrad}>
                    <Text style={gameStyles.adClaimText}>{adClaiming ? 'Claiming…' : 'Claim 1,500 DHS'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ─── Banner Ad Placeholder ────────────────────────────────────────── */}
      {/* TODO: Replace with real AdMob BannerAd from react-native-google-mobile-ads */}
      {!isSubscribed && adWatched && (
        <View style={[gameStyles.bannerAd, { marginBottom: insets.bottom }]}>
          <Text style={gameStyles.bannerAdText}>🌟 Dawaar — Discover the Arab World</Text>
          <Text style={gameStyles.bannerAdSub}>AD</Text>
        </View>
      )}

      {/* ─── Dice Roll GIF Overlay ────────────────────────────────────────── */}
      {diceAnimating && (
        <View style={gameStyles.diceGifOverlay} pointerEvents="none">
          <ExpoImage
            source={DICE_GIF}
            style={gameStyles.diceGifImg}
            contentFit="contain"
          />
        </View>
      )}

      {/* ─── Interstitial Ad Modal ────────────────────────────────────────── */}
      {/* TODO: Replace inner content with real AdMob InterstitialAd */}
      <Modal visible={showInterstitial} transparent animationType="fade" onRequestClose={() => setShowInterstitial(false)}>
        <View style={gameStyles.interstitialOverlay}>
          <View style={gameStyles.interstitialCard}>
            <View style={gameStyles.interstitialHeader}>
              <View style={gameStyles.adSponsorBadge}>
                <Text style={gameStyles.adSponsorText}>ADVERTISEMENT</Text>
              </View>
              <TouchableOpacity
                style={gameStyles.interstitialCloseBtn}
                onPress={() => setShowInterstitial(false)}
              >
                <Ionicons name="close" size={16} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>

            {/* Ad content placeholder */}
            <View style={gameStyles.interstitialContent}>
              <View style={gameStyles.interstitialArtwork}>
                <Text style={gameStyles.interstitialArtworkEmoji}>🕌</Text>
              </View>
              <Text style={gameStyles.interstitialTitle}>Dawaar Premium</Text>
              <Text style={gameStyles.interstitialBody}>
                Enjoy Dawaar without interruptions. Remove all ads with a Premium subscription.
              </Text>
              <TouchableOpacity
                style={gameStyles.interstitialCta}
                onPress={() => { setShowInterstitial(false); setShowSubscribe(true); }}
              >
                <LinearGradient colors={[Colors.gold, '#A07830']} style={gameStyles.interstitialCtaGrad}>
                  <Text style={gameStyles.interstitialCtaText}>Start Free Trial</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={gameStyles.interstitialSkip}
                onPress={() => setShowInterstitial(false)}
              >
                <Text style={gameStyles.interstitialSkipText}>Continue without Premium</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── Subscribe Modal ──────────────────────────────────────────────── */}
      <SubscribeModal visible={showSubscribe} onClose={() => setShowSubscribe(false)} />

      {/* ─── Trade Modal ─────────────────────────────────────────────────── */}
      {myPlayer && gameState && (
        <TradeModal
          visible={showTrade}
          onClose={() => setShowTrade(false)}
          myPlayer={myPlayer}
          otherPlayers={gameState.players.filter(p => p.id !== myPlayerId && !p.isBankrupt)}
          board={gameState.board}
          onPropose={proposeTrade}
        />
      )}

      {/* ─── Tax Choice Modal ─────────────────────────────────────────────── */}
      <Modal visible={showTaxModal} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={gameStyles.taxModalOverlay}>
          <View style={gameStyles.taxModal}>
            <Ionicons name="cash" size={36} color={Colors.gold} style={{ marginBottom: 8 }} />
            <Text style={gameStyles.taxModalTitle}>Tax Time!</Text>
            {gameState.pendingTaxChoice && (
              <>
                <Text style={gameStyles.taxModalSub}>Choose how to pay your tax:</Text>
                <View style={gameStyles.taxChoiceRow}>
                  <TouchableOpacity
                    style={gameStyles.taxFlatBtn}
                    onPress={async () => { await chooseTax('flat'); setShowTaxModal(false); }}
                  >
                    <Text style={gameStyles.taxFlatAmount}>{gameState.pendingTaxChoice.flat.toLocaleString()} DHS</Text>
                    <Text style={gameStyles.taxFlatLabel}>Flat Tax</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={gameStyles.taxPercentBtn}
                    onPress={async () => { await chooseTax('percent'); setShowTaxModal(false); }}
                  >
                    <Text style={gameStyles.taxFlatAmount}>{gameState.pendingTaxChoice.percent.toLocaleString()} DHS</Text>
                    <Text style={gameStyles.taxFlatLabel}>10% of Net Worth</Text>
                  </TouchableOpacity>
                </View>
                <Text style={gameStyles.taxModalTip}>
                  {gameState.pendingTaxChoice.flat <= gameState.pendingTaxChoice.percent
                    ? '💡 Flat tax is cheaper for you'
                    : '💡 Net worth tax is cheaper for you'}
                </Text>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ─── End Turn Confirmation Modal ──────────────────────────────────── */}
      <Modal visible={showEndTurnConfirm} transparent animationType="fade" onRequestClose={() => setShowEndTurnConfirm(false)}>
        <View style={gameStyles.confirmOverlay}>
          <View style={gameStyles.confirmBox}>
            <Ionicons name="chevron-forward-circle" size={36} color={Colors.gold} style={{ marginBottom: 10 }} />
            <Text style={gameStyles.confirmTitle}>End Turn</Text>
            <Text style={gameStyles.confirmMsg}>Are you sure you want to end your turn?</Text>
            <View style={gameStyles.confirmBtns}>
              <TouchableOpacity style={gameStyles.confirmCancelBtn} onPress={() => setShowEndTurnConfirm(false)}>
                <Text style={gameStyles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={gameStyles.confirmOkBtn} onPress={confirmEndTurn}>
                <Text style={gameStyles.confirmOkText}>End Turn</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── Leave Game Confirmation Modal ────────────────────────────────── */}
      <Modal visible={showLeaveConfirm} transparent animationType="fade" onRequestClose={() => setShowLeaveConfirm(false)}>
        <View style={gameStyles.confirmOverlay}>
          <View style={gameStyles.confirmBox}>
            <Ionicons name="exit-outline" size={36} color="#EF4444" style={{ marginBottom: 10 }} />
            <Text style={gameStyles.confirmTitle}>Leave Game</Text>
            <Text style={gameStyles.confirmMsg}>Are you sure? The game will continue without you.</Text>
            <View style={gameStyles.confirmBtns}>
              <TouchableOpacity style={gameStyles.confirmCancelBtn} onPress={() => setShowLeaveConfirm(false)}>
                <Text style={gameStyles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[gameStyles.confirmOkBtn, { backgroundColor: '#EF4444' }]} onPress={() => { leaveGame(); router.replace('/'); }}>
                <Text style={gameStyles.confirmOkText}>Leave</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── Game Over Modal ───────────────────────────────────────────────── */}
      <Modal visible={showGameOver} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={gameStyles.confirmOverlay}>
          <View style={gameStyles.confirmBox}>
            <Text style={{ fontSize: 44, marginBottom: 8 }}>🏆</Text>
            <Text style={gameStyles.confirmTitle}>Game Over!</Text>
            {gameState?.winnerId && (
              <Text style={gameStyles.confirmMsg}>
                {gameState.players.find(p => p.id === gameState.winnerId)?.name ?? 'Someone'} wins the game!
              </Text>
            )}
            <View style={gameStyles.confirmBtns}>
              <TouchableOpacity
                style={[gameStyles.confirmOkBtn, { flex: 1 }]}
                onPress={() => { setShowGameOver(false); leaveGame(); router.replace('/'); }}
              >
                <Text style={gameStyles.confirmOkText}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── Bankruptcy Toast ─────────────────────────────────────────────── */}
      {bankruptToast && (
        <View style={gameStyles.bankruptToast} pointerEvents="none">
          <Ionicons name="skull" size={18} color="#EF4444" />
          <Text style={gameStyles.bankruptToastText}>{bankruptToast}</Text>
        </View>
      )}

    </View>
  );
}

const gameStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkBg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
  },
  topBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBtnsRight: {
    flexDirection: 'row',
  },
  turnInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  turnDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  turnText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.warmCream,
  },
  boardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  myStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    marginTop: 4,
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
  myStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tokenBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTokenImg: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
  },
  myMoney: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: Colors.gold,
  },
  myPosition: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
    marginTop: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 12,
    marginTop: 6,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#EF4444',
  },
  actionsPanel: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderColor,
    backgroundColor: Colors.darkBg,
  },
  actionBtns: {
    gap: 8,
  },
  rollBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  rollBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  rollBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: Colors.darkBg,
  },
  buyBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  buyBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  buyBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: 'white',
  },
  endBtn: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    backgroundColor: Colors.cardBg,
  },
  endBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  endBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.warmCream,
  },
  waitingPanel: {
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
  waitingText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#6B7280',
  },
  botThinkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  botDots: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  botDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.gold,
    opacity: 0.5,
  },
  botDotMid: {
    opacity: 1,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  botThinkingText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.gold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  modalContent: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  logModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  logModal: {
    backgroundColor: Colors.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    borderTopWidth: 1,
    borderColor: Colors.borderColor,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
  },
  logTitle: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    color: Colors.warmCream,
  },
  logList: {
    paddingHorizontal: 16,
  },
  logItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  logMessage: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.warmCream,
  },
  logTime: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#4B5563',
  },
  playerCard: {
    margin: 8,
    backgroundColor: Colors.darkBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    gap: 10,
  },
  playerCardBankrupt: {
    opacity: 0.5,
  },
  playerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playerColorBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTokenImg: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  playerCardName: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.warmCream,
  },
  playerCardMoney: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.gold,
    marginTop: 2,
  },
  youBadge: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#38BDF8',
    backgroundColor: 'rgba(56,189,248,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  botBadge: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#A78BFA',
    backgroundColor: 'rgba(167,139,250,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeBadge: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#22C55E',
    backgroundColor: 'rgba(34,197,94,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bankruptBadge: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#EF4444',
    backgroundColor: 'rgba(239,68,68,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  playerPropsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  propChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  propChipText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
  },
  moreProps: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
    alignSelf: 'center',
  },

  // Landing card
  landingWrap: {
    position: 'absolute',
    bottom: 160,
    left: 12,
    right: 12,
    zIndex: 200,
  },
  landingCard: {
    backgroundColor: '#0D1826',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.gold + '55',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  landingStripe: {
    height: 5,
    width: '100%',
  },
  landingBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    gap: 14,
  },
  landingEmoji: {
    fontSize: 32,
  },
  landingTexts: {
    flex: 1,
    gap: 2,
  },
  landingWho: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    opacity: 0.85,
  },
  landingName: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: Colors.warmCream,
  },
  landingCtx: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.gold,
    marginTop: 2,
  },
  landingDismissTip: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#374151',
    textAlign: 'center',
    paddingBottom: 8,
  },
  cardTextBox: {
    marginTop: 10,
    backgroundColor: 'rgba(201,168,76,0.12)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.gold + '55',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cardTextLabel: {
    fontSize: 9,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.gold,
    letterSpacing: 0.5,
    marginBottom: 3,
    opacity: 0.85,
  },
  cardTextBody: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.warmCream,
    lineHeight: 19,
  },
  buildBtn: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#22C55E55',
    backgroundColor: '#22C55E12',
    overflow: 'hidden',
  },
  buildBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buildBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#22C55E',
  },
  tradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gold + '18',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gold + '50',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    gap: 8,
  },
  tradeBannerText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.warmCream,
  },
  tradeBannerSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.gold,
    marginTop: 2,
  },
  tradeDeclineBtn: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#EF4444' + '44',
  },
  tradeDeclineText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#EF4444',
  },
  tradeAcceptBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tradeAcceptText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: Colors.darkBg,
  },
  buildEmptyText: {
    color: '#6B7280',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  buildRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201,168,76,0.12)',
    gap: 10,
  },
  buildColorDot: {
    width: 12,
    height: 32,
    borderRadius: 3,
    flexShrink: 0,
  },
  buildInfo: {
    flex: 1,
    gap: 3,
  },
  buildPropName: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.warmCream,
  },
  buildPipRow: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
  },
  pipHouse: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#22C55E',
  },
  pipHotel: {
    width: 14,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#EF4444',
  },
  buildCostText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.gold,
  },
  buildConfirmBtn: {
    padding: 4,
  },
  sellConfirmBtn: {
    padding: 4,
  },
  sellRefundText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#EF4444',
    marginTop: 2,
  },

  /* ── Buy + Auction row ── */
  buyRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'stretch',
  },
  auctionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1.5,
    borderColor: Colors.gold,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(201,168,76,0.08)',
  },
  auctionBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: Colors.gold,
  },

  /* ── Auction modal ── */
  auctionPropertyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    overflow: 'hidden',
    marginBottom: 12,
  },
  auctionColorBar: {
    width: 6,
    alignSelf: 'stretch',
  },
  auctionPropName: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: Colors.warmCream,
    padding: 12,
  },
  auctionPropPrice: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#9CA3AF',
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  auctionBidsList: {
    gap: 8,
    marginBottom: 16,
    minHeight: 30,
  },
  auctionBidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.darkBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
  auctionBidDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  auctionBidName: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.warmCream,
  },
  auctionBidAmount: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: Colors.gold,
  },
  auctionInputArea: {
    gap: 10,
  },
  auctionInputLabel: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: '#9CA3AF',
  },
  auctionInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  auctionStepBtn: {
    backgroundColor: Colors.darkBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  auctionStepBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: Colors.warmCream,
  },
  auctionBidValue: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: Colors.gold,
    minWidth: 100,
    textAlign: 'center',
  },
  auctionSubmitBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
  },
  auctionSubmitGrad: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  auctionSubmitText: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: Colors.darkBg,
  },
  auctionResultBox: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  auctionResultLabel: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: Colors.warmCream,
    textAlign: 'center',
  },
  auctionResultPrice: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: Colors.gold,
  },

  /* ── Watch-Ad button (inline in action strip) ── */
  adWatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.gold + '44',
    backgroundColor: Colors.gold + '10',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  adWatchBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.gold,
  },

  /* ── Rewarded video modal ── */
  adOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  adCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#0E1A2E',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
    overflow: 'hidden',
    paddingBottom: 20,
  },
  adHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  adSponsorBadge: {
    backgroundColor: 'rgba(201,168,76,0.18)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  adSponsorText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: Colors.gold,
    letterSpacing: 1,
  },
  adCountdownBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  adCountdownText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: Colors.warmCream,
  },
  adVideoFrame: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    height: 180,
    backgroundColor: '#111C30',
  },
  adVideoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  adVideoLabel: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.4)',
  },
  adProgressBar: {
    width: '70%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  adProgressFill: {
    height: 4,
    backgroundColor: Colors.gold,
    borderRadius: 2,
  },
  adWaitText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 14,
  },
  adRewardReady: {
    alignItems: 'center',
    padding: 24,
    gap: 6,
  },
  adRewardTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.warmCream,
    marginTop: 4,
  },
  adRewardAmt: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: Colors.gold,
  },
  adRewardSub: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.5)',
  },
  adClaimBtn: {
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
  },
  adClaimGrad: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adClaimText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: Colors.darkBg,
  },

  /* ── Banner Ad placeholder ── */
  bannerAd: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: '#0D1621',
    borderTopWidth: 1,
    borderTopColor: 'rgba(201,168,76,0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  bannerAdText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.45)',
  },
  bannerAdSub: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: 1,
  },

  /* ── Dice GIF overlay ── */
  diceGifOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,15,26,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  diceGifImg: {
    width: 240,
    height: 240,
  },

  /* ── Interstitial modal ── */
  interstitialOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  interstitialCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#0C1625',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.2)',
    overflow: 'hidden',
  },
  interstitialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  interstitialCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  interstitialContent: {
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  interstitialArtwork: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.gold + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  interstitialArtworkEmoji: {
    fontSize: 36,
  },
  interstitialTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.warmCream,
  },
  interstitialBody: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    lineHeight: 20,
  },
  interstitialCta: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
  },
  interstitialCtaGrad: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  interstitialCtaText: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: Colors.darkBg,
  },
  interstitialSkip: {
    paddingVertical: 10,
  },
  interstitialSkipText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.35)',
  },

  /* ── Doubles toast ── */
  doublesToast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 12,
    marginTop: 6,
    backgroundColor: 'rgba(201,168,76,0.12)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.gold + '44',
  },
  doublesToastText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.gold,
  },

  /* ── Jail badge in status bar ── */
  jailBadge: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#EF4444',
    backgroundColor: 'rgba(239,68,68,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  /* ── Log filter chips ── */
  logFilterRow: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
  },
  logChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.darkBg,
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
  logChipActive: {
    backgroundColor: Colors.gold + '22',
    borderColor: Colors.gold + '88',
  },
  logChipText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#9CA3AF',
  },
  logChipTextActive: {
    color: Colors.gold,
    fontFamily: 'Inter_700Bold',
  },

  /* ── Tax choice modal ── */
  taxModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  taxModal: {
    backgroundColor: Colors.cardBg,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.gold + '44',
  },
  taxModalTitle: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: Colors.gold,
  },
  taxModalSub: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.warmCream,
    textAlign: 'center',
  },
  taxChoiceRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  taxFlatBtn: {
    flex: 1,
    backgroundColor: Colors.darkBg,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gold + '55',
  },
  taxPercentBtn: {
    flex: 1,
    backgroundColor: Colors.darkBg,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A78BFA44',
  },
  taxFlatAmount: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: Colors.gold,
    marginBottom: 4,
  },
  taxFlatLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#9CA3AF',
  },
  taxModalTip: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#22C55E',
    textAlign: 'center',
  },

  /* ── Bankruptcy toast ── */
  bankruptToast: {
    position: 'absolute',
    top: 120,
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EF444488',
  },
  bankruptToastText: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#EF4444',
    flex: 1,
  },

  /* ── Confirmation / Game-Over modals ── */
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  confirmBox: {
    backgroundColor: '#1A2540',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.25)',
  },
  confirmTitle: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: '#F0E6C8',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmMsg: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  confirmBtns: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  confirmCancelText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#9CA3AF',
  },
  confirmOkBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#D4AF37',
  },
  confirmOkText: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#0D1B2A',
  },
});

// ── Animated bot thinking dots ────────────────────────────────────────────────
function BotThinkingDots() {
  const d1 = useSharedValue(0.3);
  const d2 = useSharedValue(0.3);
  const d3 = useSharedValue(0.3);

  useEffect(() => {
    const makeLoop = (delayMs: number) =>
      withDelay(
        delayMs,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 360 }),
            withTiming(0.2, { duration: 360 }),
          ),
          -1,
          false,
        ),
      );
    d1.value = makeLoop(0);
    d2.value = makeLoop(180);
    d3.value = makeLoop(360);
  }, []);

  const s1 = useAnimatedStyle(() => ({ opacity: d1.value }));
  const s2 = useAnimatedStyle(() => ({ opacity: d2.value }));
  const s3 = useAnimatedStyle(() => ({ opacity: d3.value }));

  return (
    <View style={gameStyles.botDots}>
      <Animated.View style={[gameStyles.botDot, s1]} />
      <Animated.View style={[gameStyles.botDot, gameStyles.botDotMid, s2]} />
      <Animated.View style={[gameStyles.botDot, s3]} />
    </View>
  );
}
