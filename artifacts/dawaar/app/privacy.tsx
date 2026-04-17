import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

const LAST_UPDATED = 'April 17, 2026';
const CONTACT_EMAIL = 'privacy@dawaar.app';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.body}>{children}</Text>
);

const Li = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.li}>• {children}</Text>
);

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'web' ? 67 : insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.gold} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.appName}>Dawaar — Middle East Monopoly</Text>
        <Text style={styles.updated}>Last updated: {LAST_UPDATED}</Text>

        <Section title="1. Introduction">
          <P>
            Welcome to Dawaar ("we", "us", or "our"). This Privacy Policy explains how we collect,
            use, and protect your information when you use our mobile game application. By using
            Dawaar, you agree to the practices described here.
          </P>
        </Section>

        <Section title="2. Information We Collect">
          <P>We may collect the following types of information:</P>
          <Li>
            <Text style={styles.bold}>Player name</Text>: A name you choose when starting a game.
            This is stored locally on your device only.
          </Li>
          <Li>
            <Text style={styles.bold}>Game state data</Text>: Game progress, scores, and settings
            are stored locally using AsyncStorage and, for multiplayer, temporarily on our secure
            servers.
          </Li>
          <Li>
            <Text style={styles.bold}>Device identifiers</Text>: A randomly generated player ID
            used to associate you with a multiplayer game session.
          </Li>
          <Li>
            <Text style={styles.bold}>Purchase information</Text>: If you subscribe to Dawaar
            Premium, purchase and subscription data is handled by RevenueCat on behalf of the Apple
            App Store and Google Play Store. We do not store payment card details.
          </Li>
        </Section>

        <Section title="3. How We Use Your Information">
          <Li>To provide and maintain the game experience</Li>
          <Li>To enable multiplayer game sessions</Li>
          <Li>To process premium subscriptions via RevenueCat</Li>
          <Li>To improve app performance and fix bugs</Li>
          <Li>We do not sell or rent your personal data to third parties</Li>
        </Section>

        <Section title="4. Third-Party Services">
          <P>Dawaar uses the following third-party services, each with their own Privacy Policies:</P>
          <Li>
            <Text style={styles.bold}>RevenueCat</Text> — manages in-app subscriptions and
            purchase validation. See: revenuecat.com/privacy
          </Li>
          <Li>
            <Text style={styles.bold}>Apple App Store / Google Play</Text> — processes payment for
            subscriptions.
          </Li>
          <P>
            We do not use third-party advertising SDKs. The ad experience in the free version is
            simulated within the app and does not collect advertising identifiers.
          </P>
        </Section>

        <Section title="5. Data Storage and Security">
          <P>
            Game data is stored locally on your device. Multiplayer game sessions are temporarily
            stored on our servers and are deleted after the game ends or after 24 hours of
            inactivity. We use industry-standard security practices to protect data in transit and
            at rest.
          </P>
        </Section>

        <Section title="6. Children's Privacy">
          <P>
            Dawaar is designed for players aged 4 and older. We do not knowingly collect personal
            information from children under 13 beyond what is described in this policy. The game
            does not require account registration and no personally identifiable information is
            required to play.
          </P>
        </Section>

        <Section title="7. Your Rights">
          <P>Depending on your location, you may have rights to:</P>
          <Li>Access the personal data we hold about you</Li>
          <Li>Request correction or deletion of your data</Li>
          <Li>Opt out of data processing (where applicable)</Li>
          <P>
            Because most data is stored locally on your device, you can delete it at any time by
            uninstalling the app.
          </P>
        </Section>

        <Section title="8. Changes to This Policy">
          <P>
            We may update this Privacy Policy from time to time. We will notify you of significant
            changes by updating the "Last updated" date above. Continued use of the app after
            changes constitutes acceptance of the revised policy.
          </P>
        </Section>

        <Section title="9. Contact Us">
          <P>
            If you have any questions about this Privacy Policy or your data, please contact us
            at:
          </P>
          <Text style={styles.email}>{CONTACT_EMAIL}</Text>
        </Section>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201,168,76,0.12)',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    color: Colors.warmCream,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  appName: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.gold,
    marginBottom: 4,
  },
  updated: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.35)',
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: Colors.warmCream,
    marginBottom: 8,
  },
  body: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 20,
    marginBottom: 6,
  },
  li: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 20,
    paddingLeft: 8,
    marginBottom: 4,
  },
  bold: {
    fontFamily: 'Inter_700Bold',
    color: Colors.warmCream,
  },
  email: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.gold,
    marginTop: 4,
  },
});
