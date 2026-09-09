import React, { memo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';

import Colors from '@/constants/colors';
import type { BoardProperty, Player } from '@/context/GameContext';

export const GROUP_COLORS: Record<string, string> = {
  brown:     '#8B4513',
  lightblue: '#38BDF8',
  pink:      '#EC4899',
  orange:    '#F97316',
  red:       '#EF4444',
  yellow:    '#EAB308',
  green:     '#22C55E',
  darkblue:  '#3B82F6',
};

const SPECIAL_LABELS: Record<string, string> = {
  go: '▶GO', jail: '⛓', free_parking: 'P', go_to_jail: '🔒',
  chance: '?', community: '♡', tax: '$', railroad: '🚂', utility: '⚡',
};

type CellOrientation = 'bottom' | 'top' | 'left' | 'right' | 'corner';

// A player's board pointer. The current player's pointer pulses so it is
// always easy to spot whose turn it is.
function PlayerDot({ color, isCurrent }: { color: string; isCurrent: boolean }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isCurrent) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.55, { duration: 420 }),
          withTiming(1, { duration: 420 }),
        ),
        -1,
      );
    } else {
      cancelAnimation(scale);
      scale.value = withTiming(1, { duration: 150 });
    }
    return () => cancelAnimation(scale);
  }, [isCurrent, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      style={[
        cellStyles.playerDot,
        { backgroundColor: color },
        isCurrent && cellStyles.playerDotCurrent,
        style,
      ]}
    />
  );
}

export const BoardCell = memo(function BoardCell({
  space,
  players,
  w,
  h,
  orientation = 'bottom',
  isHighlighted = false,
  currentPlayerId = null,
  onLongPress,
}: {
  space: BoardProperty;
  players: Player[];
  w: number;
  h: number;
  orientation?: CellOrientation;
  isHighlighted?: boolean;
  currentPlayerId?: string | null;
  onLongPress?: () => void;
}) {
  const playersHere = players.filter(p => p.position === space.index && !p.isBankrupt);
  const ownerPlayer = space.ownerId ? players.find(p => p.id === space.ownerId) : null;
  const groupColor  = space.colorGroup ? GROUP_COLORS[space.colorGroup] : null;

  const shortName = (space.type === 'property' || space.type === 'railroad' || space.type === 'utility')
    ? space.name.split(',')[0]
    : null;

  const barEdge: object = orientation === 'top'
    ? { top: 0,    left: 0, right: 0,  height: 6 }
    : orientation === 'right'  ? { right: 0,  top: 0, bottom: 0, width: 6  }
    : orientation === 'left'   ? { left: 0,   top: 0, bottom: 0, width: 6  }
    :                             { bottom: 0, left: 0, right: 0,  height: 6 };

  const rot = orientation === 'bottom' ? '-90deg' : orientation === 'top' ? '90deg' : '0deg';
  const isPortrait = orientation === 'bottom' || orientation === 'top';
  const cellBg = ownerPlayer ? ownerPlayer.color + '28' : '#07101D';

  return (
    <TouchableOpacity
      activeOpacity={onLongPress ? 0.75 : 1}
      onLongPress={onLongPress}
      delayLongPress={350}
      style={[cellStyles.cell, { width: w, height: h, backgroundColor: cellBg }]}
    >
      {groupColor && (
        <View style={[cellStyles.colorBar, barEdge, { backgroundColor: groupColor }]} />
      )}

      {shortName ? (
        <View style={[
          cellStyles.labelWrap,
          isPortrait
            ? { width: h, height: w, transform: [{ rotate: rot }] }
            : { width: w, height: h },
        ]}>
          <Text
            style={[cellStyles.nameText, ownerPlayer ? { color: ownerPlayer.color } : {}]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {shortName}
          </Text>
          {space.price != null && (
            <Text style={cellStyles.priceText} numberOfLines={1}>
              {space.price.toLocaleString()}
            </Text>
          )}
        </View>
      ) : (
        <Text style={cellStyles.typeIcon}>{SPECIAL_LABELS[space.type] ?? ''}</Text>
      )}

      {(space.houses > 0 || space.hotel) && (
        <View style={cellStyles.buildingsRow}>
          {space.hotel
            ? <View style={cellStyles.hotelBlock} />
            : Array.from({ length: space.houses }).map((_, i) => (
                <View key={i} style={cellStyles.houseBlock} />
              ))
          }
        </View>
      )}

      {ownerPlayer && (
        <View style={[cellStyles.ownerBadge, { backgroundColor: ownerPlayer.color }]}>
          <Text style={cellStyles.ownerInitial}>{ownerPlayer.name[0]}</Text>
        </View>
      )}

      {playersHere.length > 0 && (
        <View style={cellStyles.playersRow}>
          {playersHere.slice(0, 4).map(p => (
            <PlayerDot key={p.id} color={p.color} isCurrent={p.id === currentPlayerId} />
          ))}
        </View>
      )}

      {isHighlighted && <View style={cellStyles.highlightOverlay} />}
    </TouchableOpacity>
  );
});

const cellStyles = StyleSheet.create({
  cell: {
    borderWidth: 0.5,
    borderColor: 'rgba(201,168,76,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  colorBar:      { position: 'absolute' },
  labelWrap:     { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  nameText: {
    fontSize: 6,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.warmCream,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  priceText: {
    fontSize: 5.5,
    fontFamily: 'Inter_700Bold',
    color: Colors.gold,
    textAlign: 'center',
    marginTop: 1,
  },
  typeIcon:      { fontSize: 9, color: Colors.warmCream, opacity: 0.75 },
  buildingsRow: {
    position: 'absolute',
    top: 7, left: 1, right: 1,
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 1, justifyContent: 'center', alignItems: 'center',
  },
  houseBlock:  { width: 4, height: 5, borderRadius: 1, backgroundColor: '#22C55E' },
  hotelBlock:  { width: 8, height: 5, borderRadius: 1, backgroundColor: '#EF4444' },
  ownerBadge: {
    position: 'absolute', bottom: 1, right: 1,
    width: 9, height: 9, borderRadius: 5,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.3)',
  },
  ownerInitial:  { fontSize: 5, color: 'white', fontFamily: 'Inter_700Bold' },
  playersRow:    { position: 'absolute', flexDirection: 'row', bottom: 1, left: 1, gap: 1 },
  playerDot: {
    width: 7, height: 7, borderRadius: 4,
    borderWidth: 0.5, borderColor: Colors.warmCream,
  },
  playerDotCurrent: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.9,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  highlightOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(201,168,76,0.45)',
    borderWidth: 1.5,
    borderColor: Colors.gold,
  },
});

export const GameBoard = memo(function GameBoard({
  board, players, highlightPos, currentPlayerId, onCellLongPress,
}: {
  board: BoardProperty[];
  players: Player[];
  highlightPos?: number | null;
  currentPlayerId?: string | null;
  onCellLongPress?: (space: BoardProperty) => void;
}) {
  const { width, height } = useWindowDimensions();

  // Scale the board to fit the screen: respect width (16px side margins) and
  // available height (380px reserved for top-bar + status + actions panel).
  // Hard-cap at 440px so large tablets / desktop don't over-inflate the board.
  const boardSize = Math.round(Math.min(width - 16, height - 40, 440));
  const CS  = Math.round(boardSize / 9);
  const CS2 = Math.round(CS * 1.5);
  const BOARD_ACTUAL = CS * 6 + CS2 * 2;

  // 28-tile layout: corners at 0, 7, 14, 21 — 6 regular tiles per side
  const bottomRow = board.slice(0, 8);
  const rightCol  = [...board.slice(8, 14)].reverse();
  const topRow    = [...board.slice(14, 22)].reverse();
  const leftCol   = board.slice(22, 28);

  return (
    <View style={[boardStyles.board, { width: BOARD_ACTUAL, height: BOARD_ACTUAL }]}>
      <View style={[boardStyles.center, { top: CS2, left: CS2, right: CS2, bottom: CS2 }]}>
        <Text style={[boardStyles.centerTitleAr, { fontSize: Math.round(CS * 1.4) }]}>東方</Text>
        <Text style={[boardStyles.centerTitle, { fontSize: Math.round(CS * 0.4) }]}>EASTERN TYCOON</Text>
        <LinearGradient colors={[Colors.gold + '18', 'transparent']} style={boardStyles.centerGlow} />
      </View>

      <View style={[boardStyles.row, { bottom: 0, left: 0, height: CS2 }]}>
        {bottomRow.map((space, i) => {
          const isC = i === 0 || i === 7;
          return (
            <BoardCell key={space.index} space={space} players={players}
              w={isC ? CS2 : CS} h={CS2}
              orientation={isC ? 'corner' : 'bottom'}
              isHighlighted={highlightPos === space.index}
              currentPlayerId={currentPlayerId}
              onLongPress={onCellLongPress ? () => onCellLongPress(space) : undefined} />
          );
        })}
      </View>

      <View style={[boardStyles.col, { right: 0, top: CS2, width: CS2 }]}>
        {rightCol.map(space => (
          <BoardCell key={space.index} space={space} players={players}
            w={CS2} h={CS} orientation="right"
            isHighlighted={highlightPos === space.index}
              currentPlayerId={currentPlayerId}
            onLongPress={onCellLongPress ? () => onCellLongPress(space) : undefined} />
        ))}
      </View>

      <View style={[boardStyles.row, { top: 0, left: 0, height: CS2 }]}>
        {topRow.map((space, i) => {
          const isC = i === 0 || i === 7;
          return (
            <BoardCell key={space.index} space={space} players={players}
              w={isC ? CS2 : CS} h={CS2}
              orientation={isC ? 'corner' : 'top'}
              isHighlighted={highlightPos === space.index}
              currentPlayerId={currentPlayerId}
              onLongPress={onCellLongPress ? () => onCellLongPress(space) : undefined} />
          );
        })}
      </View>

      <View style={[boardStyles.col, { left: 0, top: CS2, width: CS2 }]}>
        {leftCol.map(space => (
          <BoardCell key={space.index} space={space} players={players}
            w={CS2} h={CS} orientation="left"
            isHighlighted={highlightPos === space.index}
              currentPlayerId={currentPlayerId}
            onLongPress={onCellLongPress ? () => onCellLongPress(space) : undefined} />
        ))}
      </View>
    </View>
  );
});

const boardStyles = StyleSheet.create({
  board: {
    position: 'relative',
    backgroundColor: '#07101D',
    borderWidth: 2,
    borderColor: Colors.gold + '55',
    borderRadius: 3,
  },
  row: { position: 'absolute', flexDirection: 'row' },
  col: { position: 'absolute', flexDirection: 'column' },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTitleAr: {
    fontFamily: 'Inter_700Bold',
    color: Colors.gold,
  },
  centerTitle: {
    fontFamily: 'Inter_700Bold',
    color: Colors.gold + '70',
    letterSpacing: 4,
  },
  centerGlow: { position: 'absolute', inset: 0, borderRadius: 8 },
});
