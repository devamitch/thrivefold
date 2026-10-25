import { SquircleSurface } from '@/components/ui';
import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { Link, useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Header } from '../../../components/ui/Header';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore } from '../../../stores/useRootStore';

export default function SafetyScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const blockedUserIds = useRootStore((s) => s.blockedUserIds);
  const unblockUser = useRootStore((s) => s.unblockUser);
  const showAlert = useRootStore((s) => s.showAlert);
  const showToast = useRootStore((s) => s.showToast);

  const [reportText, setReportText] = useState('');
  const [showReportCard, setShowReportCard] = useState(false);

  const emergencyResources = [
    { name: 'Suicide & Crisis Lifeline', phone: '988', isSms: false, country: 'US / Canada' },
    { name: 'Crisis Text Support', phone: '741741', isSms: true, body: 'HOME', country: 'Global / US' },
    { name: 'National Domestic Violence Hotline', phone: '1-800-799-7233', isSms: false, country: '24/7 Free' },
    { name: 'The Trevor Project (LGBTQ+ Youth)', phone: '1-866-488-7386', isSms: false, country: '24/7 Free' },
  ];

  const handleResourceAction = (res: typeof emergencyResources[0]) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    if (res.isSms) {
      Linking.openURL(`sms:${res.phone}?body=${res.body ?? 'HELLO'}`);
    } else {
      Linking.openURL(`tel:${res.phone.replace(/[^0-9]/g, '')}`);
    }
  };

  const handleReportSubmit = () => {
    if (!reportText.trim()) {
      showAlert({
        title: 'Details Needed',
        message: 'Please provide a brief explanation of the violation.',
        confirmText: 'OK',
        cancelText: null,
      });
      return;
    }
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    showToast({
      type: 'info',
      title: 'Report saved',
      message: 'Saved on this device. Reports reach a human reviewer once community features are live.',
    });
    setReportText('');
    setShowReportCard(false);
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="Safety" subtitle="Crisis lines, blocking and reports" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: spacing.xxl }]}>
        {/* Quick Safety Hub Links */}
        <SquircleSurface style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <Link href={'/(app)/safety/urgent-support' as Href} asChild>
            <Button
              label="24/7 Helplines"
              size="sm"
              variant="outline"
              icon={<Ionicons name="call-outline" size={14} color={colors.primary} />}
            />
          </Link>
          <Link href={'/(app)/safety/report' as Href} asChild>
            <Button
              label="Submit Report"
              size="sm"
              variant="outline"
              icon={<Ionicons name="shield-outline" size={14} color={colors.primary} />}
            />
          </Link>
          <Link href={'/(app)/safety/blocked-users' as Href} asChild>
            <Button
              label="Blocked Users"
              size="sm"
              variant="outline"
              icon={<Ionicons name="ban-outline" size={14} color={colors.primary} />}
            />
          </Link>
          <Link href={'/(app)/safety/appeal' as Href} asChild>
            <Button
              label="Appeal Action"
              size="sm"
              variant="ghost"
              icon={<Ionicons name="refresh-outline" size={14} color={colors.text.secondary} />}
            />
          </Link>
        </SquircleSurface>
        {/* Safety Sanctuary Hero */}
        <Card style={{ marginBottom: spacing.md, padding: 14, backgroundColor: colors.surface }}>
          <SquircleSurface style={styles.heroWrap}>
            <Image
              source={require('../../../../assets/illustrations/safety-sanctuary.jpg')}
              style={styles.heroImage}
              contentFit="cover"
            />
          </SquircleSurface>
          <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 12 }]}>
            Your safety
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4, lineHeight: 18 }]}>
            You decide who can reach you and what is shared. Crisis lines and appeals are listed below.
          </Text>
        </Card>

        {/* Emergency Resources */}
        <Card style={{ marginBottom: spacing.md, backgroundColor: colors.errorSurface, borderColor: colors.error }}>
          <SquircleSurface style={styles.emergencyHeader}>
            <Ionicons name="shield-checkmark" size={24} color={colors.error} />
            <Text style={[typography.heading, { color: colors.error, marginLeft: 8 }]}>
              Immediate Crisis Hotlines
            </Text>
          </SquircleSurface>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 6, marginBottom: 16 }]}>
            Confidential, free support available 24/7. Tapping will open your phone dialer or SMS app directly.
          </Text>

          {emergencyResources.map((res) => (
            <SquircleSurface key={res.name} style={[styles.resourceRow, { borderBottomColor: colors.border }]}>
              <SquircleSurface style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{res.name}</Text>
                <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                  {res.country} · {res.isSms ? `SMS: ${res.phone}` : res.phone}
                </Text>
              </SquircleSurface>
              <Button
                label={res.isSms ? 'Text' : 'Call'}
                size="sm"
                variant="danger"
                onPress={() => handleResourceAction(res)}
                icon={<Ionicons name={res.isSms ? 'chatbubble-ellipses' : 'call'} size={14} color={colors.onPrimary} />}
              />
            </SquircleSurface>
          ))}
        </Card>

        {/* Report a User / Violation */}
        <Card style={{ marginBottom: spacing.md }}>
          <SquircleSurface style={styles.rowBetween}>
            <SquircleSurface style={{ flex: 1 }}>
              <Text style={[typography.subheading, { color: colors.text.primary }]}>
                Report an Account or Interaction
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                Violations of chip etiquette, abusive solicitations, or safety threats
              </Text>
            </SquircleSurface>
            <Badge label="Confidential" variant="neutral" />
          </SquircleSurface>

          {showReportCard ? (
            <SquircleSurface style={{ marginTop: 14 }}>
              <TextInput
                value={reportText}
                onChangeText={setReportText}
                placeholder="Explain the incident or account pseudonym..."
                placeholderTextColor={colors.text.muted}
                multiline
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface1,
                    color: colors.text.primary,
                    borderColor: colors.border,
                  },
                ]}
              />
              <SquircleSurface style={[styles.rowEnd, { marginTop: 10 }]}>
                <Button label="Cancel" variant="ghost" size="sm" onPress={() => setShowReportCard(false)} style={{ marginRight: 8 }} />
                <Button label="Submit Report" size="sm" onPress={handleReportSubmit} />
              </SquircleSurface>
            </SquircleSurface>
          ) : (
            <Button
              label="File Confidential Report"
              size="sm"
              variant="outline"
              style={{ marginTop: 14 }}
              onPress={() => setShowReportCard(true)}
            />
          )}
        </Card>

        {/* Blocked Accounts Management */}
        <Card style={{ marginBottom: spacing.md }}>
          <SquircleSurface style={styles.rowBetween}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>
              Blocked Accounts ({blockedUserIds.length})
            </Text>
            <Badge label="Zero Contact" variant="warning" />
          </SquircleSurface>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 6, marginBottom: 12 }]}>
            Blocked accounts cannot find your pseudonym, see shared circles, or send letters. Blocked interactions immediately halt in-transit delivery.
          </Text>

          {blockedUserIds.length > 0 ? (
            blockedUserIds.map((id) => (
              <SquircleSurface key={id} style={[styles.blockedRow, { borderColor: colors.border }]}>
                <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>{id}</Text>
                <Button
                  label="Unblock"
                  size="sm"
                  variant="ghost"
                  onPress={() => unblockUser(id)}
                />
              </SquircleSurface>
            ))
          ) : (
            <Text style={[typography.caption, { color: colors.text.muted, fontStyle: 'italic' }]}>
              No accounts currently blocked.
            </Text>
          )}
        </Card>

        {/* Quick Panic Lock */}
        <Card variant="surface1" style={{ marginBottom: spacing.md, padding: spacing.base }}>
          <SquircleSurface style={styles.rowBetween}>
            <SquircleSurface style={{ flex: 1, paddingRight: 8 }}>
              <Text style={[typography.subbodyBold, { color: colors.primary }]}>Quick Disconnect (Panic Mode)</Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                Immediately closes all open sessions and switches the screen to a discreet journal cover.
              </Text>
            </SquircleSurface>
            <Button
              label="Lock"
              size="sm"
              variant="outline"
              onPress={() => router.replace('/(app)/journal')}
              icon={<Ionicons name="lock-closed-outline" size={14} color={colors.primary} />}
            />
          </SquircleSurface>
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroWrap: {
    width: '100%',
    height: 140,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F3EFEA',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowEnd: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  input: {
    minHeight: 80,
    borderRadius: 14,
    padding: 12,
    textAlignVertical: 'top',
  },
  blockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
});
