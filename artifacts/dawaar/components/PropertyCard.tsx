import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import Colors from '@/constants/colors';
import { useGame } from '@/context/GameContext';
import type { BoardProperty } from '@/context/GameContext';
import { GROUP_COLORS } from '@/components/Board';

export default function PropertyCard({
  property,
  onClose,
}: {
  property: BoardProperty;
  onClose: () => void;
}) {
  const { myPlayer, buyProperty, buildHouse, sellHouse, mortgageProperty, gameState, myPlayerId } = useGame();

  if (!property) return null;

  const isOwner  = property.ownerId === myPlayerId;
  const canBuy   = !property.ownerId && property.price && myPlayer && myPlayer.money >= property.price;
  const groupColor = property.colorGroup ? GROUP_COLORS[property.colorGroup] : Colors.gold;
  const ownerPlayer = property.ownerId ? gameState?.players.find(p => p.id === property.ownerId) : null;

  const handleBuy = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await buyProperty();
    onClose();
  };

  const handleBuild = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await buildHouse(property.index);
  };

  const handleSell = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await sellHouse(property.index);
  };

  const handleMortgage = async (action: 'mortgage' | 'unmortgage') => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await mortgageProperty(property.index, action);
  };

  return (
    <View style={styles.card}>
      <View style={[styles.header, { backgroundColor: groupColor }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerName}>{property.name}</Text>
          <Text style={styles.headerNameAr}>{property.nameAr}</Text>

          {(property.houses > 0 || property.hotel) && (
            <View style={styles.headerBuildRow}>
              {property.hotel ? (
                <View style={styles.headerHotelBadge}>
                  <Text style={styles.headerBuildText}>🏨 Hotel</Text>
                </View>
              ) : (
                <View style={styles.headerHouseBadge}>
                  {Array.from({ length: property.houses }).map((_, i) => (
                    <View key={i} style={styles.headerHousePip} />
                  ))}
                  <Text style={styles.headerBuildText}>
                    {' '}{property.houses} House{property.houses > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {property.price && (
          <View style={styles.priceRow}>
            <Text style={styles.price}>{property.price.toLocaleString()} DHS</Text>
            {property.isMortgaged && (
              <Text style={styles.mortgagedBadge}>MORTGAGED</Text>
            )}
          </View>
        )}

        {ownerPlayer && (
          <View style={[styles.ownerBadge, {
            backgroundColor: ownerPlayer.color + '22',
            borderColor:     ownerPlayer.color + '44',
          }]}>
            <View style={[styles.ownerDot, { backgroundColor: ownerPlayer.color }]} />
            <Text style={styles.ownerText}>Owned by {ownerPlayer.name}</Text>
          </View>
        )}

        {property.houses > 0 && !property.hotel && (
          <Text style={styles.buildInfo}>
            {property.houses} house{property.houses > 1 ? 's' : ''} built
          </Text>
        )}
        {property.hotel && <Text style={styles.buildInfo}>Hotel built</Text>}

        {property.rent && property.rent.length > 0 && (
          <View style={styles.rentTable}>
            <Text style={styles.rentTitle}>Rent</Text>
            {['Base', '1 House', '2 Houses', '3 Houses', '4 Houses', 'Hotel'].map((label, i) => (
              <View key={i} style={[styles.rentRow, i % 2 === 0 && styles.rentRowAlt]}>
                <Text style={styles.rentLabel}>{label}</Text>
                <Text style={styles.rentValue}>{property.rent![i]?.toLocaleString()} DHS</Text>
              </View>
            ))}
          </View>
        )}

        {canBuy && (
          <TouchableOpacity style={styles.buyBtn} onPress={handleBuy}>
            <LinearGradient colors={[Colors.gold, '#A07830']} style={styles.buyBtnGrad}>
              <Text style={styles.buyBtnText}>Buy for {property.price?.toLocaleString()} DHS</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {isOwner && property.type === 'property' && (
          <View style={styles.ownerActions}>
            {!property.hotel && !property.isMortgaged && (
              <TouchableOpacity style={styles.buildBtn} onPress={handleBuild}>
                <Ionicons name="add" size={16} color={Colors.darkBg} />
                <Text style={styles.buildBtnText}>
                  {property.houses < 4 ? 'Build House' : 'Build Hotel'}
                </Text>
              </TouchableOpacity>
            )}

            {(property.houses > 0 || property.hotel) && (
              <TouchableOpacity style={styles.sellBtn} onPress={handleSell}>
                <Ionicons name="remove" size={16} color="white" />
                <Text style={styles.sellBtnText}>
                  Sell {property.hotel ? 'Hotel' : 'House'}{' '}
                  (+{Math.floor(
                    (property.hotel
                      ? (property.hotelCost ?? 1000)
                      : (property.houseCost ?? 1000)
                    ) / 2,
                  ).toLocaleString()} DHS)
                </Text>
              </TouchableOpacity>
            )}

            {!property.isMortgaged ? (
              <TouchableOpacity style={styles.mortgageBtn} onPress={() => handleMortgage('mortgage')}>
                <Text style={styles.mortgageBtnText}>
                  Mortgage ({property.mortgageValue} DHS)
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.mortgageBtn} onPress={() => handleMortgage('unmortgage')}>
                <Text style={styles.mortgageBtnText}>Unmortgage</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    marginTop: 2,
  },
  headerBuildRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  headerHouseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 3,
  },
  headerHotelBadge: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  headerHousePip: {
    width: 8,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#22C55E',
  },
  headerBuildText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: 'white',
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
  ownerDot:   { width: 10, height: 10, borderRadius: 5 },
  ownerText:  { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.warmCream },
  buildInfo:  { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#22C55E' },
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
  rentRowAlt: { backgroundColor: 'rgba(255,255,255,0.02)' },
  rentLabel:  { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#9CA3AF' },
  rentValue:  { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: Colors.warmCream },
  buyBtn:     { borderRadius: 12, overflow: 'hidden' },
  buyBtnGrad: { alignItems: 'center', paddingVertical: 14 },
  buyBtnText: { fontSize: 15, fontFamily: 'Inter_700Bold', color: Colors.darkBg },
  ownerActions: { gap: 8 },
  buildBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#22C55E',
    borderRadius: 12,
    paddingVertical: 12,
  },
  buildBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.darkBg },
  mortgageBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.darkBg,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
  mortgageBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#9CA3AF' },
  sellBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 12,
  },
  sellBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: 'white' },
});
