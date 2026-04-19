import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '@/constants/colors';
import type { BoardProperty, Player } from '@/context/GameContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const BOARD_SIZE = Math.round(Math.min(SCREEN_WIDTH, SCREEN_HEIGHT - 210));
// 28-tile board: 6 regular cells + 2 corner cells per side
// Board width = 6×CS + 2×CS2 = 6CS + 3CS = 9CS  →  CS = BOARD_SIZE / 9
export const CS  = Math.round(BOARD_SIZE / 9);
export const CS2 = Math.round(CS * 1.5);
export const BOARD_ACTUAL = CS * 6 + CS2 * 2;

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

export const BoardCell = memo(function BoardCell({
  space,
  players,
  w,
  h,
  orientation = 'bottom',
  isHighlighted = false,
  onLongPress,
}: {
  space: BoardProperty;
  players: Player[];
  w: number;
  h: number;
  orientation?: CellOrientation;
  isHighlighted?: boolean;
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
          {playersHere.slice(0, 3).map(p => (
            <View key={p.id} style={[cellStyles.playerDot, { backgroundColor: p.color }]} />
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
  highlightOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(201,168,76,0.45)',
    borderWidth: 1.5,
    borderColor: Colors.gold,
  },
});

export const GameBoard = memo(function GameBoard({
  board, players, highlightPos, onCellLongPress,
}: {
  board: BoardProperty[];
  players: Player[];
  highlightPos?: number | null;
  onCellLongPress?: (space: BoardProperty) => void;
}) {
  // 28-tile layout: corners at 0, 7, 14, 21 — 6 regular tiles per side
  const bottomRow = board.slice(0, 8);               // pos 0–7  (GO → Jail)
  const rightCol  = [...board.slice(8, 14)].reverse(); // pos 8–13 displayed top→bottom
  const topRow    = [...board.slice(14, 22)].reverse(); // pos 14–21 displayed right→left
  const leftCol   = board.slice(22, 28);             // pos 22–27 displayed top→bottom

  return (
    <View style={[boardStyles.board, { width: BOARD_ACTUAL, height: BOARD_ACTUAL }]}>
      <View style={boardStyles.center}>
        <Text style={boardStyles.centerTitleAr}>دوّار</Text>
        <Text style={boardStyles.centerTitle}>DAWAAR</Text>
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
              onLongPress={onCellLongPress ? () => onCellLongPress(space) : undefined} />
          );
        })}
      </View>

      <View style={[boardStyles.col, { right: 0, top: CS2, width: CS2 }]}>
        {rightCol.map(space => (
          <BoardCell key={space.index} space={space} players={players}
            w={CS2} h={CS} orientation="right"
            isHighlighted={highlightPos === space.index}
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
              onLongPress={onCellLongPress ? () => onCellLongPress(space) : undefined} />
          );
        })}
      </View>

      <View style={[boardStyles.col, { left: 0, top: CS2, width: CS2 }]}>
        {leftCol.map(space => (
          <BoardCell key={space.index} space={space} players={players}
            w={CS2} h={CS} orientation="left"
            isHighlighted={highlightPos === space.index}
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
    top: CS2, left: CS2, right: CS2, bottom: CS2,
    alignItems: 'center', justifyContent: 'center',
  },
  centerTitleAr: {
    fontSize: Math.round(CS * 1.4),
    fontFamily: 'Inter_700Bold',
    color: Colors.gold,
  },
  centerTitle: {
    fontSize: Math.round(CS * 0.45),
    fontFamily: 'Inter_700Bold',
    color: Colors.gold + '70',
    letterSpacing: 4,
  },
  centerGlow: { position: 'absolute', inset: 0, borderRadius: 8 },
});
