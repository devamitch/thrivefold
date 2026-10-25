import { SquircleSurface } from '@/components/ui';
import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../stores/useRootStore';

export default function BlockedUsersScreen() {
  const { colors, typography, spacing } = useTheme();
  const { blockedUserIds, unblockUser, showAlert, showToast } = useRootStore(
    useShallow((s) => ({
      blockedUserIds: s.blockedUserIds,
      unblockUser: s.unblockUser,
      showAlert: s.showAlert,
      showToast: s.showToast,
    })),
  );

  const handleUnblock = (id: string) => {
    showAlert({
      title: 'Unblock User',
      message: 'Allow this user to be eligible for future correspondence and discovery?',
      confirmText: 'Unblock',
      onConfirm: () => {
        unblockUser(id);
        showToast({ type: 'info', message: 'User unblocked.' });
      },
    });
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="Blocked people" subtitle="People you have blocked" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        <Card style={{ marginBottom: spacing.md, backgroundColor: colors.surface1, borderColor: colors.border }}>
          <SquircleSurface style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="ban-outline" size={18} color={colors.primary} />
            <Text style={[typography.subbodyBold, { color: colors.text.primary, marginLeft: 6 }]}>
              Immediate Invariant Enforcement
            </Text>
          </SquircleSurface>
          <Text style={[typography.caption, { color: colors.text.secondary, lineHeight: 18 }]}>
            When a user is blocked, their letters in transit are immediately halted. No payment or premium subscription can ever bypass or remove a block.
          </Text>
        </Card>

        {blockedUserIds.length > 0 ? (
          blockedUserIds.map((id) => (
            <Card key={id} style={{ marginBottom: spacing.sm }}>
              <SquircleSurface style={styles.headerRow}>
                <SquircleSurface>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{id}</Text>
                  <Text style={[typography.caption, { color: colors.text.muted }]}>Blocked from all letters & circles</Text>
                </SquircleSurface>
                <Button
                  label="Unblock"
                  variant="outline"
                  size="sm"
                  onPress={() => handleUnblock(id)}
                />
              </SquircleSurface>
            </Card>
          ))
        ) : (
          <Card style={{ padding: spacing.xl, alignItems: 'center', marginTop: spacing.md }}>
            <Text style={[typography.subbody, { color: colors.text.secondary }]}>
              Your blocklist is empty. No participants are currently blocked.
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
});
