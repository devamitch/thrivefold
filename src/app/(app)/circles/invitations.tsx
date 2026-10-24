import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore } from '../../../stores/useRootStore';

export default function CircleInvitationsScreen() {
  const { colors, typography, spacing } = useTheme();
  const showToast = useRootStore((s) => s.showToast);

  // Invitations arrive only from the server; none exist until real organizers send them.
  const [invitations, setInvitations] = useState<
    {
      id: string;
      communityName: string;
      type: string;
      facilitator: string;
      membersCount: number;
      coarseRegion: string;
      description: string;
    }[]
  >([]);

  const handleAccept = (id: string, name: string) => {
    setInvitations((prev) => prev.filter((i) => i.id !== id));
    showToast({ type: 'success', title: 'Invitation Accepted', message: `You have joined "${name}".` });
  };

  const handleDecline = (id: string) => {
    setInvitations((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="Circle invitations" subtitle="Invitations to private circles" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        <Card style={{ marginBottom: spacing.md, backgroundColor: colors.surface1, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="shield-outline" size={18} color={colors.primary} />
            <Text style={[typography.subbodyBold, { color: colors.text.primary, marginLeft: 6 }]}>
              You always choose
            </Text>
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, lineHeight: 18 }]}>
            No user is ever auto-enrolled or imported into a group without explicit consent. You choose whether to join, and can quietly leave at any time.
          </Text>
        </Card>

        {invitations.length > 0 ? (
          invitations.map((inv) => (
            <Card key={inv.id} style={{ marginBottom: spacing.md }}>
              <View style={styles.headerRow}>
                <Badge label={inv.type} variant="primary" />
                <Text style={[typography.caption, { color: colors.text.muted }]}>{inv.membersCount} Members</Text>
              </View>

              <Text style={[typography.bodyBold, { color: colors.text.primary, marginTop: 8 }]}>
                {inv.communityName}
              </Text>
              <Text style={[typography.caption, { color: colors.primary, marginTop: 2 }]}>
                Facilitated by {inv.facilitator} · {inv.coarseRegion}
              </Text>
              <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 8, lineHeight: 20 }]}>
                {inv.description}
              </Text>

              <View style={styles.actionsRow}>
                <Button
                  label="Decline"
                  variant="outline"
                  size="sm"
                  onPress={() => handleDecline(inv.id)}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  label="Accept & Join"
                  variant="primary"
                  size="sm"
                  onPress={() => handleAccept(inv.id, inv.communityName)}
                  style={{ flex: 1, marginLeft: 8 }}
                />
              </View>
            </Card>
          ))
        ) : (
          <Card style={{ padding: spacing.xl, alignItems: 'center', marginTop: spacing.md }}>
            <Text style={[typography.subbody, { color: colors.text.secondary }]}>
              No pending invitations. When organizers or verified peers invite you, they will appear here.
            </Text>
          </Card>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 14,
  },
});
