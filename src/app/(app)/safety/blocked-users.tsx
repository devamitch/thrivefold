import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { useTheme } from '../../../theme/useTheme';
import { useRootStore, useShallow } from '../../../stores/useRootStore';

export default function BlockedUsersScreen() {
  const { colors, typography, spacing } = useTheme();
  const { blockedUserIds, unblockUser } = useRootStore(
    useShallow((s) => ({ blockedUserIds: s.blockedUserIds, unblockUser: s.unblockUser })),
  );

  const handleUnblock = (id: string) => {
    Alert.alert('Unblock User', 'Allow this user to be eligible for future correspondence and discovery?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Unblock', onPress: () => unblockUser(id) },
    ]);
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="Blocked Users" subtitle="Manage Mutual Protection & Disconnects" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        <Card style={{ marginBottom: spacing.md, backgroundColor: colors.surface1, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="ban-outline" size={18} color={colors.primary} />
            <Text style={[typography.subbodyBold, { color: colors.text.primary, marginLeft: 6 }]}>
              Immediate Invariant Enforcement
            </Text>
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, lineHeight: 18 }]}>
            When a user is blocked, their letters in transit are immediately halted. No payment or premium subscription can ever bypass or remove a block.
          </Text>
        </Card>

        {blockedUserIds.length > 0 ? (
          blockedUserIds.map((id) => (
            <Card key={id} style={{ marginBottom: spacing.sm }}>
              <View style={styles.headerRow}>
                <View>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{id}</Text>
                  <Text style={[typography.caption, { color: colors.text.muted }]}>Blocked from all letters & circles</Text>
                </View>
                <Button
                  label="Unblock"
                  variant="outline"
                  size="sm"
                  onPress={() => handleUnblock(id)}
                />
              </View>
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
