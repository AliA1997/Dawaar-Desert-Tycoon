import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useSubscription } from '@/lib/revenuecat';

const FEATURES = [
  { icon: 'ban' as const, text: 'No ads — ever' },
  { icon: 'play-skip-forward' as const, text: 'Skip video ad prompts' },
  { icon: 'star' as const, text: 'Premium badge in lobby' },
  { icon: 'flash' as const, text: 'Early access to new cities' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function SubscribeModal({ visible, onClose }: Props) {
  const { isSubscribed, offerings, purchase, restore, isPurchasing, isRestoring } =
    useSubscription();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const currentOffering = offerings?.current;
  const pkg = currentOffering?.availablePackages[0];
  const priceString = pkg?.product?.priceString ?? '…';

  const handlePurchase = async () => {
    if (!pkg) return;
    setConfirmVisible(true);
  };

  const confirmPurchase = async () => {
    setConfirmVisible(false);
    if (!pkg) return;
    try {
      await purchase(pkg);
      onClose();
    } catch (err: any) {
      if (!err?.userCancelled) {
        console.error('Purchase failed:', err?.message ?? err);
      }
    }
  };

  const handleRestore = async () => {
    try {
      await restore();
    } catch (err: any) {
      console.error('Restore failed:', err?.message ?? err);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color={Colors.warmCream} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            <LinearGradient
              colors={[Colors.gold + 'CC', '#A07830CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.header}
            >
              <Text style={styles.crownEmoji}>👑</Text>
              <Text style={styles.title}>Dawaar Premium</Text>
              <Text style={styles.subtitle}>Play without limits — no ads, ever</Text>
            </LinearGradient>

            <View style={styles.features}>
              {FEATURES.map((f) => (
                <View key={f.text} style={styles.featureRow}>
                  <View style={styles.featureIcon}>
                    <Ionicons name={f.icon} size={16} color={Colors.gold} />
                  </View>
                  <Text style={styles.featureText}>{f.text}</Text>
                </View>
              ))}
            </View>

            {isSubscribed ? (
              <View style={styles.activeBox}>
                <Ionicons name="checkmark-circle" size={40} color="#22C55E" />
                <Text style={styles.activeTitle}>You're Premium!</Text>
                <Text style={styles.activeSub}>Ad-free play is active on this device.</Text>
                <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore}>
                  <Text style={styles.restoreBtnText}>Restore Purchases</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.priceBox}>
                  <Text style={styles.priceLabel}>Monthly</Text>
                  <Text style={styles.priceValue}>{priceString}</Text>
                  <Text style={styles.pricePer}>per month</Text>
                </View>

                <TouchableOpacity
                  style={[styles.subscribeBtn, (isPurchasing || !pkg) && { opacity: 0.6 }]}
                  onPress={handlePurchase}
                  disabled={isPurchasing || !pkg}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[Colors.gold, '#A07830']}
                    style={styles.subscribeBtnGrad}
                  >
                    {isPurchasing ? (
                      <ActivityIndicator color={Colors.darkBg} />
                    ) : (
                      <Text style={styles.subscribeBtnText}>Subscribe — {priceString}/mo</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.restoreBtn, isRestoring && { opacity: 0.5 }]}
                  onPress={handleRestore}
                  disabled={isRestoring}
                >
                  <Text style={styles.restoreBtnText}>
                    {isRestoring ? 'Restoring…' : 'Restore Purchases'}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.legalText}>
                  {`${priceString}/month. Cancel anytime via App Store or Google Play.\nSubscriptions auto-renew unless cancelled at least 24 hours before renewal.\nPayment charged to your store account on confirmation.`}
                </Text>
              </>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Confirmation dialog for test mode */}
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Confirm Purchase</Text>
            <Text style={styles.confirmBody}>
              Subscribe to Dawaar Premium for {priceString}/month?
            </Text>
            <View style={styles.confirmBtns}>
              <TouchableOpacity
                style={styles.confirmCancel}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmOk} onPress={confirmPurchase}>
                <Text style={styles.confirmOkText}>Subscribe</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    maxHeight: '92%',
    paddingBottom: 32,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    padding: 28,
    alignItems: 'center',
    gap: 6,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  crownEmoji: { fontSize: 36, marginBottom: 2 },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold', color: Colors.darkBg },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.darkBg,
    opacity: 0.75,
    textAlign: 'center',
  },
  features: {
    padding: 20,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: Colors.gold + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.warmCream,
  },
  priceBox: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 2,
  },
  priceLabel: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  priceValue: {
    fontSize: 40,
    fontFamily: 'Inter_700Bold',
    color: Colors.warmCream,
  },
  pricePer: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.4)',
  },
  subscribeBtn: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  subscribeBtnGrad: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  subscribeBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: Colors.darkBg,
  },
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 16,
  },
  restoreBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.4)',
    textDecorationLine: 'underline',
  },
  legalText: {
    marginHorizontal: 16,
    marginTop: 8,
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.25)',
    textAlign: 'center',
    lineHeight: 15,
  },
  activeBox: {
    alignItems: 'center',
    padding: 32,
    gap: 8,
  },
  activeTitle: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: '#22C55E',
    marginTop: 4,
  },
  activeSub: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmBox: {
    backgroundColor: '#0C1625',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
    gap: 12,
  },
  confirmTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: Colors.warmCream,
    textAlign: 'center',
  },
  confirmBody: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 20,
  },
  confirmBtns: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  confirmCancel: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
  },
  confirmCancelText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: 'rgba(255,255,255,0.55)',
  },
  confirmOk: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: Colors.gold,
    alignItems: 'center',
  },
  confirmOkText: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: Colors.darkBg,
  },
});
