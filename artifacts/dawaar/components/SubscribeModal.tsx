import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useSubscription, type Plan } from '@/hooks/useSubscription';

const MONTHLY_PRICE = 9.99;
const ANNUAL_PRICE = parseFloat((MONTHLY_PRICE * 12 * 0.85).toFixed(2));
const ANNUAL_MONTHLY = parseFloat((ANNUAL_PRICE / 12).toFixed(2));
const DISCOUNT_PCT = 15;

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
  const { isSubscribed, plan, subscribe, cancelSubscription } = useSubscription();
  const [selected, setSelected] = useState<Plan>('annual');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    await subscribe(selected);
    setLoading(false);
    Alert.alert(
      'Welcome to Dawaar Premium!',
      `Your ${selected === 'annual' ? 'annual' : 'monthly'} subscription is active. Enjoy an ad-free game!`,
      [{ text: "Let's Play!", onPress: onClose }],
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your Premium subscription? Ads will return.',
      [
        { text: 'Keep Premium', style: 'cancel' },
        {
          text: 'Cancel Anyway',
          style: 'destructive',
          onPress: async () => {
            await cancelSubscription();
            onClose();
          },
        },
      ],
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Close */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color={Colors.warmCream} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
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

            {/* Feature list */}
            <View style={styles.features}>
              {FEATURES.map(f => (
                <View key={f.text} style={styles.featureRow}>
                  <View style={styles.featureIcon}>
                    <Ionicons name={f.icon} size={16} color={Colors.gold} />
                  </View>
                  <Text style={styles.featureText}>{f.text}</Text>
                </View>
              ))}
            </View>

            {isSubscribed ? (
              /* ── Already subscribed ── */
              <View style={styles.activeBox}>
                <Ionicons name="checkmark-circle" size={32} color="#22C55E" />
                <Text style={styles.activeTitle}>You're Premium!</Text>
                <Text style={styles.activePlan}>
                  {plan === 'annual' ? 'Annual plan' : 'Monthly plan'} · Active
                </Text>
                <TouchableOpacity style={styles.cancelLink} onPress={handleCancel}>
                  <Text style={styles.cancelLinkText}>Cancel subscription</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Plan cards */}
                <View style={styles.plans}>
                  {/* Annual */}
                  <TouchableOpacity
                    style={[styles.planCard, selected === 'annual' && styles.planCardSelected]}
                    onPress={() => setSelected('annual')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.planCardTop}>
                      <View style={styles.saveBadge}>
                        <Text style={styles.saveBadgeText}>SAVE {DISCOUNT_PCT}%</Text>
                      </View>
                      <View style={[styles.planRadio, selected === 'annual' && styles.planRadioSelected]}>
                        {selected === 'annual' && <View style={styles.planRadioDot} />}
                      </View>
                    </View>
                    <Text style={styles.planName}>Annual</Text>
                    <Text style={styles.planPrice}>
                      ${ANNUAL_MONTHLY.toFixed(2)}
                      <Text style={styles.planPer}>/mo</Text>
                    </Text>
                    <Text style={styles.planBilled}>Billed ${ANNUAL_PRICE}/year</Text>
                  </TouchableOpacity>

                  {/* Monthly */}
                  <TouchableOpacity
                    style={[styles.planCard, selected === 'monthly' && styles.planCardSelected]}
                    onPress={() => setSelected('monthly')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.planCardTop}>
                      <View style={styles.trialBadge}>
                        <Text style={styles.trialBadgeText}>7-DAY FREE TRIAL</Text>
                      </View>
                      <View style={[styles.planRadio, selected === 'monthly' && styles.planRadioSelected]}>
                        {selected === 'monthly' && <View style={styles.planRadioDot} />}
                      </View>
                    </View>
                    <Text style={styles.planName}>Monthly</Text>
                    <Text style={styles.planPrice}>
                      ${MONTHLY_PRICE.toFixed(2)}
                      <Text style={styles.planPer}>/mo</Text>
                    </Text>
                    <Text style={styles.planBilled}>Free for 7 days, then ${MONTHLY_PRICE}/mo</Text>
                  </TouchableOpacity>
                </View>

                {/* CTA */}
                <TouchableOpacity
                  style={[styles.subscribeBtn, loading && { opacity: 0.6 }]}
                  onPress={handleSubscribe}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <LinearGradient colors={[Colors.gold, '#A07830']} style={styles.subscribeBtnGrad}>
                    <Text style={styles.subscribeBtnText}>
                      {loading
                        ? 'Processing…'
                        : selected === 'monthly'
                        ? 'Start Free Trial'
                        : `Subscribe — $${ANNUAL_PRICE}/yr`}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <Text style={styles.legalText}>
                  {selected === 'monthly'
                    ? `Free for 7 days, then $${MONTHLY_PRICE}/month. Cancel anytime.`
                    : `$${ANNUAL_PRICE} billed annually ($${ANNUAL_MONTHLY.toFixed(2)}/month). Cancel anytime.`}
                  {'\n'}Payment processed via App Store / Google Play.
                  {'\n'}Subscriptions auto-renew unless cancelled.
                </Text>
              </>
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
  title: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: Colors.darkBg,
  },
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
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
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
  plans: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 4,
  },
  planCard: {
    flex: 1,
    backgroundColor: '#111E33',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    gap: 4,
  },
  planCardSelected: {
    borderColor: Colors.gold,
    backgroundColor: Colors.gold + '12',
  },
  planCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  saveBadge: {
    backgroundColor: '#22C55E22',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  saveBadgeText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#22C55E',
    letterSpacing: 0.5,
  },
  trialBadge: {
    backgroundColor: Colors.gold + '22',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  trialBadgeText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: Colors.gold,
    letterSpacing: 0.5,
  },
  planRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planRadioSelected: {
    borderColor: Colors.gold,
  },
  planRadioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: Colors.gold,
  },
  planName: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: 'rgba(255,255,255,0.55)',
  },
  planPrice: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    color: Colors.warmCream,
  },
  planPer: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.45)',
  },
  planBilled: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 15,
  },
  subscribeBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  subscribeBtnGrad: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: Colors.darkBg,
  },
  legalText: {
    marginHorizontal: 16,
    marginTop: 12,
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    lineHeight: 16,
  },
  activeBox: {
    alignItems: 'center',
    padding: 28,
    gap: 6,
  },
  activeTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#22C55E',
    marginTop: 4,
  },
  activePlan: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.5)',
  },
  cancelLink: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  cancelLinkText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#EF4444',
    textDecorationLine: 'underline',
  },
});
