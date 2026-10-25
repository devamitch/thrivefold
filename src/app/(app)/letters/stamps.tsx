import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Header } from '../../../components/ui/Header';
import { useTheme } from '../../../theme/useTheme';
import { STAMP_CATALOG } from '../../../domain/letters/stampCatalog';

export default function StampsAlbumScreen() {
  const { colors, typography, spacing } = useTheme();

  return (
    <ScreenWrapper scrollable>
      <Header title="Stamps" subtitle="Stamps you have collected" showBack />
      <View style={[styles.content, { paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }]}>
        <Card variant="tinted" style={{ marginBottom: spacing.md, padding: spacing.base }}>
          <Text style={[typography.captionBold, { color: colors.primary }]}>
            Earned Through Consistency
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
            Each stamp is unlocked by healthy habits, daily check-ins, or mindful reflections.
          </Text>
        </Card>

        <View style={styles.grid}>
          {STAMP_CATALOG.map((stamp) => (
            <Card key={stamp.id} style={styles.stampCard}>
              <View style={[styles.stampFrame, { borderColor: stamp.color, backgroundColor: colors.surface1 }]}>
                <Ionicons
                  name={
                    stamp.icon === 'flower'
                      ? 'rose'
                      : stamp.icon === 'sun'
                      ? 'sunny'
                      : stamp.icon === 'wind'
                      ? 'water'
                      : stamp.icon === 'mountain'
                      ? 'trail-sign'
                      : 'sunny'
                  }
                  size={30}
                  color={stamp.color}
                />
              </View>
              <Text style={[typography.subbodyBold, { color: colors.text.primary, marginTop: 8, textAlign: 'center' }]}>
                {stamp.name}
              </Text>
              <Badge label={stamp.category} variant="neutral" style={{ marginTop: 4, alignSelf: 'center' }} />
              <Text style={[typography.caption, { color: colors.text.muted, marginTop: 6, textAlign: 'center' }]}>
                {stamp.description}
              </Text>
            </Card>
          ))}
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  stampCard: {
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    padding: 14,
  },
  stampFrame: {
    width: 64,
    height: 64,
    borderRadius: 14,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
