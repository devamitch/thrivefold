import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Header } from '../../../components/ui/Header';
import { useTheme } from '../../../theme/useTheme';

export default function BillingScreen() {
  const { colors, typography, spacing } = useTheme();

  const plans = [
    {
      id: 'plan_free',
      name: 'Free Personal Tier',
      price: '$0 / Lifetime',
      badge: 'Active Plan',
      features: [
        'Complete cycle & reproductive health tracking',
        'Daily check-ins, mood & stress analytics',
        'Full wellness quests & streaks',
        'On-device local AI task personalization',
        '100% private local vault on your device',
      ],
      current: true,
    },
    {
      id: 'plan_letters_plus',
      name: 'Correspondence Plus',
      price: '$2.99 / month',
      badge: 'Optional',
      features: [
        'Exclusive seasonal stamp collectibles',
        'Expanded regional correspondence distance slots',
        'Supports platform independent serverless costs',
      ],
      current: false,
    },
  ];

  return (
    <ScreenWrapper scrollable>
      <Header title="Plans & Entitlements" subtitle="Transparent, Non-Coercive Economics" showBack />
      <View style={[styles.content, { paddingHorizontal: spacing.base, paddingBottom: spacing.xxl }]}>
        <Card variant="surface1" style={{ marginBottom: spacing.md, padding: spacing.base }}>
          <Text style={[typography.captionBold, { color: colors.primary }]}>
            No Credit Card Required
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
            Core health tools, daily self-care, and on-device AI are completely functional without payment or subscriptions.
          </Text>
        </Card>

        {plans.map((p) => (
          <Card
            key={p.id}
            variant={p.current ? 'tinted' : 'surface'}
            style={[styles.planCard, { borderColor: p.current ? colors.primary : colors.border, marginBottom: spacing.md }]}
          >
            <View style={styles.rowBetween}>
              <View>
                <Text style={[typography.subheading, { color: colors.text.primary }]}>{p.name}</Text>
                <Text style={[typography.heading, { color: colors.primary, marginTop: 4 }]}>{p.price}</Text>
              </View>
              <Badge label={p.badge} variant={p.current ? 'primary' : 'neutral'} />
            </View>

            <View style={{ marginVertical: spacing.md }}>
              {p.features.map((feat) => (
                <Text key={feat} style={[typography.caption, { color: colors.text.secondary, marginVertical: 3 }]}>
                  ✓  {feat}
                </Text>
              ))}
            </View>

            {p.current ? (
              <Badge label="Currently Active" variant="success" style={{ alignSelf: 'flex-start' }} />
            ) : (
              <Button
                label="Subscribe"
                variant="outline"
                size="sm"
                onPress={() => Alert.alert('Test Mode', 'In-app purchases are enabled for production store channels.')}
              />
            )}
          </Card>
        ))}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  planCard: {
    borderWidth: 1.5,
    padding: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
});
