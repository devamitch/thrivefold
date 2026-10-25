import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { shouldOfferSocialPath } from '../../domain/policy/socialReveal';
import { useRootStore, useShallow } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

/**
 * A one-time, plain-language invitation to the social side. It says exactly what letters and
 * groups are and what they need, and reveals them only if the person chooses to.
 */
export function SocialInvite() {
  const { colors, typography, spacing } = useTheme();
  const s = useRootStore(
    useShallow((st) => ({
      signedIn: st.isAuthenticated && Boolean(st.user) && !st.user?.isGuest,
      revealed: st.isSocialPathRevealed,
      dismissedAt: st.socialInviteDismissedAt,
      checkInDays: st.completedCheckInDaysCount,
      reveal: st.setSocialPathRevealed,
      dismiss: st.dismissSocialInvite,
      grantConsent: st.grantConsent,
    })),
  );
  if (!shouldOfferSocialPath(s)) return null;

  return (
    <Card style={{ padding: spacing.base, marginTop: spacing.md }}>
      <View style={styles.row}>
        <Ionicons name="mail-outline" size={20} color={colors.primary} />
        <Text style={[typography.bodyBold, styles.flex, { color: colors.text.primary }]}>Letters and groups, if you want them</Text>
      </View>
      <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 6 }]}>
        Slow pen-pal letters made of cards (no live chat, no photos) and small private groups. Both are for verified adults
        only and need a quick age check. Your health records are never shared.
      </Text>
      <View style={[styles.row, { marginTop: spacing.md }]}>
        <Button label="Not now" variant="secondary" size="sm" onPress={s.dismiss} style={styles.flex} />
        <Button
          label="Show me"
          size="sm"
          onPress={() => {
            s.grantConsent('social_path');
            s.reveal(true);
          }}
          style={styles.flex}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { alignItems: 'center', flexDirection: 'row', gap: 10 },
});
