import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import type { Player, BoardProperty } from '@/context/GameContext';

type Step = 'select_player' | 'compose' | 'confirm';

interface Props {
  visible: boolean;
  onClose: () => void;
  myPlayer: Player;
  otherPlayers: Player[];
  board: BoardProperty[];
  onPropose: (
    toPlayerId: string,
    offeredProps: number[],
    requestedProps: number[],
    offeredMoney: number,
    requestedMoney: number,
  ) => Promise<void>;
}

export default function TradeModal({
  visible,
  onClose,
  myPlayer,
  otherPlayers,
  board,
  onPropose,
}: Props) {
  const [step, setStep] = useState<Step>('select_player');
  const [target, setTarget] = useState<Player | null>(null);
  const [offeredProps, setOfferedProps] = useState<number[]>([]);
  const [requestedProps, setRequestedProps] = useState<number[]>([]);
  const [offeredMoney, setOfferedMoney] = useState('');
  const [requestedMoney, setRequestedMoney] = useState('');
  const [loading, setLoading] = useState(false);

  const myOwnedProps = board.filter(
    (s) => s.ownerId === myPlayer.id && s.type === 'property' && !s.isMortgaged,
  );
  const theirOwnedProps = target
    ? board.filter(
        (s) => s.ownerId === target.id && s.type === 'property' && !s.isMortgaged,
      )
    : [];

  const toggleOffered = (idx: number) => {
    setOfferedProps((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  const toggleRequested = (idx: number) => {
    setRequestedProps((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  const reset = () => {
    setStep('select_player');
    setTarget(null);
    setOfferedProps([]);
    setRequestedProps([]);
    setOfferedMoney('');
    setRequestedMoney('');
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSelectPlayer = (p: Player) => {
    setTarget(p);
    setStep('compose');
  };

  const handlePropose = async () => {
    if (!target) return;
    setLoading(true);
    try {
      await onPropose(
        target.id,
        offeredProps,
        requestedProps,
        parseInt(offeredMoney || '0', 10),
        parseInt(requestedMoney || '0', 10),
      );
      reset();
      onClose();
    } catch {
      setLoading(false);
    }
  };

  const hasSomething = offeredProps.length > 0 || requestedProps.length > 0 || parseInt(offeredMoney || '0') > 0 || parseInt(requestedMoney || '0') > 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            {step !== 'select_player' && (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => setStep(step === 'confirm' ? 'compose' : 'select_player')}
              >
                <Ionicons name="chevron-back" size={20} color={Colors.gold} />
              </TouchableOpacity>
            )}
            <Text style={styles.headerTitle}>
              {step === 'select_player'
                ? 'Choose Trade Partner'
                : step === 'compose'
                ? `Trade with ${target?.name}`
                : 'Confirm Trade'}
            </Text>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <Ionicons name="close" size={18} color={Colors.warmCream} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ── Step 1: Select player ── */}
            {step === 'select_player' && (
              <View style={styles.playerList}>
                {otherPlayers.length === 0 ? (
                  <Text style={styles.emptyText}>No other active players to trade with.</Text>
                ) : (
                  otherPlayers.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={styles.playerRow}
                      onPress={() => handleSelectPlayer(p)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.playerDot, { backgroundColor: p.color }]} />
                      <View style={styles.playerInfo}>
                        <Text style={styles.playerName}>{p.name}</Text>
                        <Text style={styles.playerMoney}>
                          {p.money.toLocaleString()} DHS ·{' '}
                          {
                            board.filter((s) => s.ownerId === p.id && s.type === 'property').length
                          }{' '}
                          properties
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}

            {/* ── Step 2: Compose trade ── */}
            {step === 'compose' && target && (
              <View style={styles.compose}>
                {/* Your offer */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>You offer</Text>

                  {myOwnedProps.length > 0 ? (
                    myOwnedProps.map((p) => (
                      <TouchableOpacity
                        key={p.index}
                        style={[
                          styles.propRow,
                          offeredProps.includes(p.index) && styles.propRowSelected,
                        ]}
                        onPress={() => toggleOffered(p.index)}
                        activeOpacity={0.8}
                      >
                        <View
                          style={[
                            styles.propColor,
                            { backgroundColor: Colors.gold },
                          ]}
                        />
                        <Text style={styles.propName}>{p.name}</Text>
                        {offeredProps.includes(p.index) && (
                          <Ionicons name="checkmark-circle" size={18} color={Colors.gold} />
                        )}
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.noneText}>No properties to offer</Text>
                  )}

                  <View style={styles.moneyRow}>
                    <Ionicons name="cash-outline" size={16} color="rgba(255,255,255,0.4)" />
                    <TextInput
                      style={styles.moneyInput}
                      placeholder="DHS amount you'll give"
                      placeholderTextColor="rgba(255,255,255,0.25)"
                      keyboardType="number-pad"
                      value={offeredMoney}
                      onChangeText={setOfferedMoney}
                    />
                  </View>
                </View>

                {/* What you want */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>You request from {target.name}</Text>

                  {theirOwnedProps.length > 0 ? (
                    theirOwnedProps.map((p) => (
                      <TouchableOpacity
                        key={p.index}
                        style={[
                          styles.propRow,
                          requestedProps.includes(p.index) && styles.propRowSelected,
                        ]}
                        onPress={() => toggleRequested(p.index)}
                        activeOpacity={0.8}
                      >
                        <View
                          style={[
                            styles.propColor,
                            { backgroundColor: Colors.gold },
                          ]}
                        />
                        <Text style={styles.propName}>{p.name}</Text>
                        {requestedProps.includes(p.index) && (
                          <Ionicons name="checkmark-circle" size={18} color={Colors.gold} />
                        )}
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.noneText}>{target.name} owns no properties</Text>
                  )}

                  <View style={styles.moneyRow}>
                    <Ionicons name="cash-outline" size={16} color="rgba(255,255,255,0.4)" />
                    <TextInput
                      style={styles.moneyInput}
                      placeholder="DHS amount you want"
                      placeholderTextColor="rgba(255,255,255,0.25)"
                      keyboardType="number-pad"
                      value={requestedMoney}
                      onChangeText={setRequestedMoney}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.proposeBtn, !hasSomething && { opacity: 0.4 }]}
                  onPress={() => hasSomething && setStep('confirm')}
                  activeOpacity={0.85}
                  disabled={!hasSomething}
                >
                  <LinearGradient colors={[Colors.gold, '#A07830']} style={styles.proposeBtnGrad}>
                    <Text style={styles.proposeBtnText}>Review Trade</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Step 3: Confirm ── */}
            {step === 'confirm' && target && (
              <View style={styles.confirm}>
                <View style={styles.confirmSection}>
                  <Text style={styles.confirmLabel}>You give to {target.name}</Text>
                  {offeredProps.length > 0 &&
                    offeredProps.map((idx) => {
                      const prop = board.find((s) => s.index === idx);
                      return prop ? (
                        <Text key={idx} style={styles.confirmItem}>
                          • {prop.name}
                        </Text>
                      ) : null;
                    })}
                  {parseInt(offeredMoney || '0') > 0 && (
                    <Text style={styles.confirmItem}>
                      • {parseInt(offeredMoney).toLocaleString()} DHS
                    </Text>
                  )}
                  {offeredProps.length === 0 && parseInt(offeredMoney || '0') === 0 && (
                    <Text style={styles.confirmNone}>Nothing</Text>
                  )}
                </View>

                <View style={styles.arrowRow}>
                  <Ionicons name="swap-vertical" size={24} color={Colors.gold} />
                </View>

                <View style={styles.confirmSection}>
                  <Text style={styles.confirmLabel}>You receive from {target.name}</Text>
                  {requestedProps.length > 0 &&
                    requestedProps.map((idx) => {
                      const prop = board.find((s) => s.index === idx);
                      return prop ? (
                        <Text key={idx} style={styles.confirmItem}>
                          • {prop.name}
                        </Text>
                      ) : null;
                    })}
                  {parseInt(requestedMoney || '0') > 0 && (
                    <Text style={styles.confirmItem}>
                      • {parseInt(requestedMoney).toLocaleString()} DHS
                    </Text>
                  )}
                  {requestedProps.length === 0 && parseInt(requestedMoney || '0') === 0 && (
                    <Text style={styles.confirmNone}>Nothing</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.proposeBtn, loading && { opacity: 0.6 }]}
                  onPress={handlePropose}
                  activeOpacity={0.85}
                  disabled={loading}
                >
                  <LinearGradient colors={[Colors.gold, '#A07830']} style={styles.proposeBtnGrad}>
                    <Text style={styles.proposeBtnText}>
                      {loading ? 'Sending…' : 'Send Trade Offer'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0C1625',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
    maxHeight: '88%',
    minHeight: 300,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: Colors.warmCream,
    textAlign: 'center',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  bodyContent: { padding: 16, paddingBottom: 32 },
  playerList: { gap: 10 },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111E33',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  playerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  playerInfo: { flex: 1 },
  playerName: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.warmCream,
  },
  playerMoney: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    paddingVertical: 24,
  },
  compose: { gap: 16 },
  section: {
    backgroundColor: '#111E33',
    borderRadius: 16,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  propRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 8,
  },
  propRowSelected: {
    borderColor: Colors.gold,
    backgroundColor: Colors.gold + '12',
  },
  propColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  propName: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.warmCream,
  },
  noneText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.3)',
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  moneyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 8,
    gap: 8,
  },
  moneyInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.warmCream,
    paddingVertical: 4,
  },
  proposeBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
  },
  proposeBtnGrad: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  proposeBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: Colors.darkBg,
  },
  confirm: { gap: 4 },
  confirmSection: {
    backgroundColor: '#111E33',
    borderRadius: 14,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  confirmLabel: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  confirmItem: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.warmCream,
  },
  confirmNone: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.3)',
    fontStyle: 'italic',
  },
  arrowRow: {
    alignItems: 'center',
    paddingVertical: 8,
  },
});
