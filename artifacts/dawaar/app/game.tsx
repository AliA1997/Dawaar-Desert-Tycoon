import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  Alert,
  FlatList,
  Dimensions,
} from 'react-native';
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
  runOnJS,
} from 'react-native-reanimated';

import Colors from '@/constants/colors';
import { useGame, TOKENS } from '@/context/GameContext';
import type { BoardProperty, Player } from '@/context/GameContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOARD_SIZE = Math.min(SCREEN_WIDTH - 8, 380);
const CELL_SIZE = BOARD_SIZE / 11;

const GROUP_COLORS: Record<string, string> = {
  brown: '#8B4513',
  lightblue: '#38BDF8',
  pink: '#EC4899',
  orange: '#F97316',
  red: '#EF4444',
  yellow: '#EAB308',
  green: '#22C55E',
  darkblue: '#3B82F6',
};

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

function BoardCell({
  space,
  players,
  size,
  isCorner,
}: {
  space: BoardProperty;
  players: Player[];
  size: number;
  isCorner?: boolean;
}) {
  const playersHere = players.filter(p => p.position === space.index && !p.isBankrupt);
  const owner = space.ownerId;
  const groupColor = space.colorGroup ? GROUP_COLORS[space.colorGroup] : null;

  const typeIcons: Record<string, string> = {
    go: 'arrow-redo',
    jail: 'cube',
    free_parking: 'car',
    go_to_jail: 'lock-closed',
    chance: '❓',
    community: '❤️',
    tax: '💸',
    railroad: '🚂',
    utility: '⚡',
  };

  return (
    <View
      style={[
        cellStyles.cell,
        { width: size, height: size },
        isCorner && { width: size * 1.4, height: size * 1.4 },
      ]}
    >
      {groupColor && (
        <View style={[cellStyles.colorBar, { backgroundColor: groupColor }]} />
      )}
      {owner && !space.isMortgaged && (
        <View style={[cellStyles.ownerDot, { backgroundColor: '#C0392B' }]} />
      )}
      {space.hotel && <Text style={cellStyles.buildingText}>🏨</Text>}
      {!space.hotel && space.houses > 0 && (
        <Text style={cellStyles.buildingText}>{'🏠'.repeat(Math.min(space.houses, 2))}</Text>
      )}
      {space.type !== 'property' && typeIcons[space.type] && (
        <Text style={cellStyles.typeIcon}>
          {typeof typeIcons[space.type] === 'string' && typeIcons[space.type].length <= 2
            ? typeIcons[space.type]
            : ''}
        </Text>
      )}
      {playersHere.length > 0 && (
        <View style={cellStyles.playersRow}>
          {playersHere.slice(0, 2).map(p => (
            <View key={p.id} style={[cellStyles.playerDot, { backgroundColor: p.color }]} />
          ))}
        </View>
      )}
    </View>
  );
}

const cellStyles = StyleSheet.create({
  cell: {
    borderWidth: 0.5,
    borderColor: 'rgba(201,168,76,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17,24,39,0.9)',
    overflow: 'hidden',
  },
  colorBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  ownerDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  buildingText: {
    fontSize: 7,
  },
  typeIcon: {
    fontSize: 10,
  },
  playersRow: {
    position: 'absolute',
    flexDirection: 'row',
    bottom: 1,
    left: 1,
    gap: 1,
  },
  playerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: Colors.warmCream,
  },
});

function GameBoard({ board, players }: { board: BoardProperty[]; players: Player[] }) {
  const cs = CELL_SIZE;
  const cornerSize = cs * 1.3;

  // Board layout: bottom row (indices 0-10), right col (11-20), top row (21-30), left col (31-39)
  const bottomRow = board.slice(0, 11); // 0-10
  const rightCol = board.slice(11, 20); // 11-19 (bottom to top)
  const topRow = board.slice(20, 31); // 20-30 (right to left)
  const leftCol = board.slice(31, 40); // 31-39 (top to bottom)

  return (
    <View style={[boardStyles.board, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
      {/* Center */}
      <View style={boardStyles.center}>
        <Text style={boardStyles.centerTitleAr}>دوّار</Text>
        <Text style={boardStyles.centerTitle}>DAWAAR</Text>
        <LinearGradient
          colors={[Colors.gold + '20', 'transparent']}
          style={boardStyles.centerGlow}
        />
      </View>

      {/* Bottom row (0-10, left to right) */}
      <View style={[boardStyles.bottomRow, { bottom: 0, left: 0, right: 0, height: cornerSize }]}>
        {bottomRow.map((space, i) => (
          <BoardCell
            key={space.index}
            space={space}
            players={players}
            size={i === 0 || i === 10 ? cornerSize : cs}
            isCorner={i === 0 || i === 10}
          />
        ))}
      </View>

      {/* Right column (11-19, bottom to top) */}
      <View style={[boardStyles.rightCol, { right: 0, top: cornerSize, bottom: cornerSize, width: cornerSize }]}>
        {rightCol.map(space => (
          <BoardCell key={space.index} space={space} players={players} size={cs} />
        ))}
      </View>

      {/* Top row (20-30, right to left) */}
      <View style={[boardStyles.topRow, { top: 0, left: 0, right: 0, height: cornerSize }]}>
        {[...topRow].reverse().map((space, i) => (
          <BoardCell
            key={space.index}
            space={space}
            players={players}
            size={i === 0 || i === 10 ? cornerSize : cs}
            isCorner={i === 0 || i === 10}
          />
        ))}
      </View>

      {/* Left column (31-39, top to bottom) */}
      <View style={[boardStyles.leftCol, { left: 0, top: cornerSize, bottom: cornerSize, width: cornerSize }]}>
        {leftCol.map(space => (
          <BoardCell key={space.index} space={space} players={players} size={cs} />
        ))}
      </View>
    </View>
  );
}

const boardStyles = StyleSheet.create({
  board: {
    position: 'relative',
    backgroundColor: 'rgba(8,15,26,0.95)',
    borderWidth: 2,
    borderColor: Colors.gold + '60',
    borderRadius: 4,
  },
  center: {
    position: 'absolute',
    top: CELL_SIZE * 1.3,
    left: CELL_SIZE * 1.3,
    right: CELL_SIZE * 1.3,
    bottom: CELL_SIZE * 1.3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTitleAr: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: Colors.gold,
  },
  centerTitle: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: Colors.gold + '80',
    letterSpacing: 5,
  },
  centerGlow: {
    position: 'absolute',
    inset: 0,
    borderRadius: 8,
  },
  bottomRow: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  topRow: {
    position: 'absolute',
    flexDirection: 'row',
  },
  rightCol: {
    position: 'absolute',
    flexDirection: 'column',
  },
  leftCol: {
    position: 'absolute',
    flexDirection: 'column',
  },
});

function PropertyCard({ property, onClose }: { property: BoardProperty; onClose: () => void }) {
  const { myPlayer, buyProperty, buildHouse, mortgageProperty, gameState, myPlayerId } = useGame();

  if (!property) return null;

  const isOwner = property.ownerId === myPlayerId;
  const canBuy = !property.ownerId && property.price && myPlayer && myPlayer.money >= property.price;
  const groupColor = property.colorGroup ? GROUP_COLORS[property.colorGroup] : Colors.gold;

  const handleBuy = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await buyProperty();
    onClose();
  };

  const handleBuild = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await buildHouse(property.index);
  };

  const handleMortgage = async (action: 'mortgage' | 'unmortgage') => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await mortgageProperty(property.index, action);
  };

  const ownerPlayer = property.ownerId ? gameState?.players.find(p => p.id === property.ownerId) : null;

  return (
    <View style={propStyles.card}>
      <View style={[propStyles.header, { backgroundColor: groupColor }]}>
        <Text style={propStyles.headerName}>{property.name}</Text>
        <Text style={propStyles.headerNameAr}>{property.nameAr}</Text>
        <TouchableOpacity onPress={onClose} style={propStyles.closeBtn}>
          <Ionicons name="close" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={propStyles.body}>
        {property.price && (
          <View style={propStyles.priceRow}>
            <Text style={propStyles.price}>{property.price.toLocaleString()} DHS</Text>
            {property.isMortgaged && <Text style={propStyles.mortgagedBadge}>MORTGAGED</Text>}
          </View>
        )}

        {ownerPlayer && (
          <View style={[propStyles.ownerBadge, { backgroundColor: ownerPlayer.color + '22', borderColor: ownerPlayer.color + '44' }]}>
            <View style={[propStyles.ownerDot, { backgroundColor: ownerPlayer.color }]} />
            <Text style={propStyles.ownerText}>Owned by {ownerPlayer.name}</Text>
          </View>
        )}

        {property.houses > 0 && !property.hotel && (
          <Text style={propStyles.buildInfo}>{property.houses} house{property.houses > 1 ? 's' : ''} built</Text>
        )}
        {property.hotel && <Text style={propStyles.buildInfo}>Hotel built</Text>}

        {property.rent && property.rent.length > 0 && (
          <View style={propStyles.rentTable}>
            <Text style={propStyles.rentTitle}>Rent</Text>
            {['Base', '1 House', '2 Houses', '3 Houses', '4 Houses', 'Hotel'].map((label, i) => (
              <View key={i} style={[propStyles.rentRow, i % 2 === 0 && propStyles.rentRowAlt]}>
                <Text style={propStyles.rentLabel}>{label}</Text>
                <Text style={propStyles.rentValue}>{property.rent![i]?.toLocaleString()} DHS</Text>
              </View>
            ))}
          </View>
        )}

        {canBuy && (
          <TouchableOpacity style={propStyles.buyBtn} onPress={handleBuy}>
            <LinearGradient colors={[Colors.gold, '#A07830']} style={propStyles.buyBtnGrad}>
              <Text style={propStyles.buyBtnText}>Buy for {property.price?.toLocaleString()} DHS</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {isOwner && property.type === 'property' && (
          <View style={propStyles.ownerActions}>
            {!property.hotel && !property.isMortgaged && (
              <TouchableOpacity style={propStyles.buildBtn} onPress={handleBuild}>
                <Ionicons name="add" size={16} color={Colors.darkBg} />
                <Text style={propStyles.buildBtnText}>{property.houses < 4 ? 'Build House' : 'Build Hotel'}</Text>
              </TouchableOpacity>
            )}
            {!property.isMortgaged ? (
              <TouchableOpacity style={propStyles.mortgageBtn} onPress={() => handleMortgage('mortgage')}>
                <Text style={propStyles.mortgageBtnText}>Mortgage ({property.mortgageValue} DHS)</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={propStyles.mortgageBtn} onPress={() => handleMortgage('unmortgage')}>
                <Text style={propStyles.mortgageBtnText}>Unmortgage</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const propStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    overflow: 'hidden',
    maxHeight: '85%',
  },
  header: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerName: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: 'white',
  },
  headerNameAr: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
  },
  body: {
    padding: 16,
    gap: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  price: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: Colors.gold,
  },
  mortgagedBadge: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#EF4444',
    backgroundColor: 'rgba(239,68,68,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    letterSpacing: 0.5,
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  ownerDot: { width: 10, height: 10, borderRadius: 5 },
  ownerText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.warmCream },
  buildInfo: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: '#22C55E',
  },
  rentTable: {
    backgroundColor: Colors.darkBg,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
  rentTitle: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#6B7280',
    padding: 10,
    paddingBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rentRowAlt: {
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  rentLabel: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#9CA3AF',
  },
  rentValue: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.warmCream,
  },
  buyBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buyBtnGrad: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  buyBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: Colors.darkBg,
  },
  ownerActions: {
    gap: 8,
  },
  buildBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#22C55E',
    borderRadius: 12,
    paddingVertical: 12,
  },
  buildBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.darkBg,
  },
  mortgageBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.darkBg,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
  mortgageBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#9CA3AF',
  },
});

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const {
    gameState, myPlayerId, myPlayer, isMyTurn,
    rollDice, buyProperty, endTurn, leaveGame,
    error, clearError, lastDiceRoll,
  } = useGame();

  const [selectedProperty, setSelectedProperty] = useState<BoardProperty | null>(null);
  const [showLog, setShowLog] = useState(false);
  const [showPlayers, setShowPlayers] = useState(false);
  const [diceAnimating, setDiceAnimating] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  useEffect(() => {
    if (!gameState) {
      router.replace('/');
    } else if (gameState.status === 'finished' && gameState.winnerId) {
      const winner = gameState.players.find(p => p.id === gameState.winnerId);
      Alert.alert(
        'Game Over!',
        `${winner?.name} wins the game!`,
        [{ text: 'Back to Home', onPress: () => { leaveGame(); router.replace('/'); } }]
      );
    }
  }, [gameState?.status]);

  if (!gameState) return null;

  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
  const mySpace = myPlayer ? gameState.board[myPlayer.position] : null;
  const canBuyCurrentSpace = isMyTurn && gameState.hasRolled && mySpace &&
    (mySpace.type === 'property' || mySpace.type === 'railroad' || mySpace.type === 'utility') &&
    !mySpace.ownerId && mySpace.price && myPlayer && myPlayer.money >= mySpace.price;

  const handleRoll = async () => {
    if (!isMyTurn || gameState.hasRolled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setDiceAnimating(true);
    await rollDice();
    setDiceAnimating(false);
  };

  const handleEndTurn = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await endTurn();
  };

  const handleBuy = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await buyProperty();
  };

  const handleLeave = () => {
    Alert.alert('Leave Game', 'Are you sure? The game will continue without you.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => { leaveGame(); router.replace('/'); } },
    ]);
  };

  const getTokenIcon = (tokenId: string) => TOKENS.find(t => t.id === tokenId)?.icon || 'person';

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
        <GameBoard board={gameState.board} players={gameState.players} />
      </View>

      {/* My status */}
      {myPlayer && (
        <View style={gameStyles.myStatus}>
          <View style={gameStyles.myStatusLeft}>
            <View style={[gameStyles.tokenBg, { backgroundColor: myPlayer.color + '22' }]}>
              <Ionicons name={getTokenIcon(myPlayer.token) as any} size={18} color={myPlayer.color} />
            </View>
            <View>
              <Text style={gameStyles.myMoney}>{myPlayer.money.toLocaleString()} DHS</Text>
              {mySpace && <Text style={gameStyles.myPosition}>{mySpace.name}</Text>}
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

      {/* Actions Panel */}
      <View style={[gameStyles.actionsPanel, { paddingBottom: botPad + 8 }]}>
        {isMyTurn ? (
          <View style={gameStyles.actionBtns}>
            {!gameState.hasRolled && (
              <TouchableOpacity style={gameStyles.rollBtn} onPress={handleRoll}>
                <LinearGradient colors={[Colors.gold, '#A07830']} style={gameStyles.rollBtnGrad}>
                  <Ionicons name="dice" size={22} color={Colors.darkBg} />
                  <Text style={gameStyles.rollBtnText}>Roll Dice</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            {canBuyCurrentSpace && (
              <TouchableOpacity style={gameStyles.buyBtn} onPress={handleBuy}>
                <LinearGradient colors={['#22C55E', '#16A34A']} style={gameStyles.buyBtnGrad}>
                  <Ionicons name="business" size={20} color="white" />
                  <Text style={gameStyles.buyBtnText}>Buy {mySpace?.name}</Text>
                </LinearGradient>
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
          </View>
        ) : (
          <View style={gameStyles.waitingPanel}>
            <Text style={gameStyles.waitingText}>
              {currentPlayer ? `Waiting for ${currentPlayer.name}...` : 'Waiting...'}
            </Text>
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
            <FlatList
              data={[...gameState.log].reverse()}
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
                        <Ionicons name={getTokenIcon(player.token) as any} size={22} color={player.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={gameStyles.playerCardName}>{player.name}</Text>
                          {player.id === myPlayerId && (
                            <Text style={gameStyles.youBadge}>You</Text>
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
    paddingVertical: 8,
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
});
