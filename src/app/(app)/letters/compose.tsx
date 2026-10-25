import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { Badge } from '../../../components/ui/Badge';
import { Header } from '../../../components/ui/Header';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { APPROVED_CHIPS, ChipCategory } from '../../../domain/chips/catalog';
import { STAMP_CATALOG } from '../../../domain/letters/stampCatalog';
import { calculateDeliveryHours } from '../../../domain/letters/deliveryCalculator';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';
import { PressableScale } from '../../../components/ui/PressableScale';

export default function LetterComposeScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  const { createDraft, sendLetter, showAlert } = useRootStore(
    useShallow((s) => ({
      createDraft: s.createDraft,
      sendLetter: s.sendLetter,
      showAlert: s.showAlert,
    })),
  );

  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [selectedStamp, setSelectedStamp] = useState(STAMP_CATALOG[0].id);
  const [selectedCategory, setSelectedCategory] = useState<ChipCategory>('introduction');

  const categories: { id: ChipCategory; label: string }[] = [
    { id: 'introduction', label: 'Introductions' },
    { id: 'interests', label: 'Interests & Art' },
    { id: 'daily_checkin', label: 'Daily Life' },
    { id: 'wellbeing', label: 'Self-Care' },
    { id: 'gratitude', label: 'Gratitude' },
    { id: 'boundaries', label: 'Pacing' },
    { id: 'close_conversation', label: 'Warm Closings' },
  ];

  const categoryChips = APPROVED_CHIPS.filter((c) => c.category === selectedCategory);
  const activeStamp = STAMP_CATALOG.find((s) => s.id === selectedStamp) ?? STAMP_CATALOG[0];

  const estimatedDistanceKm = 4800;
  const estimatedDelayHours = calculateDeliveryHours(estimatedDistanceKm);

  const toggleChip = (chipId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    if (selectedChips.includes(chipId)) {
      setSelectedChips((prev) => prev.filter((id) => id !== chipId));
    } else {
      if (selectedChips.length >= 5) {
        showAlert({
          title: 'Maximum Cards Reached',
          message: 'Slow letters hold up to 5 curated cards to preserve thoughtful pacing.',
          confirmText: 'Understood',
          cancelText: null,
        });
        return;
      }
      setSelectedChips((prev) => [...prev, chipId]);
    }
  };

  const handleSend = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    const draftId = createDraft(selectedChips, selectedStamp);
    sendLetter(draftId, 'penpal_aurora_seeker');

    showAlert({
      title: 'Letter Sealed & Sent',
      message: `Your letter is traveling with the ${activeStamp.name} stamp. Estimated transit time is ${estimatedDelayHours} hours (${estimatedDistanceKm.toLocaleString()} km).`,
      confirmText: 'Return to Mailbox',
      cancelText: null,
      onConfirm: () => router.replace('/(app)/letters'),
    });
  };

  return (
    <ScreenWrapper scrollable>
      <Header
        title="Write a letter"
        subtitle="Chip-only thoughtful correspondence"
        showBack
        rightAction={<Badge label={`${selectedChips.length}/5 Cards`} variant={selectedChips.length > 0 ? 'primary' : 'neutral'} />}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: spacing.xxl }]}>
        {/* Selected Stamp Preview Banner */}
        <Card style={{ marginBottom: spacing.md, backgroundColor: colors.surface1 }}>
          <View style={styles.stampHeaderRow}>
            <View style={styles.stampLeftCol}>
              <Text style={[typography.caption, { color: colors.text.muted }]}>ACTIVE POSTAGE STAMP</Text>
              <Text style={[typography.subheading, { color: colors.text.primary, marginTop: 2 }]}>
                {activeStamp.name}
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                {activeStamp.description}
              </Text>
            </View>
            <View style={[styles.stampPill, { borderColor: activeStamp.color, backgroundColor: colors.surface }]}>
              <Ionicons
                name={
                  activeStamp.icon === 'flower'
                    ? 'rose'
                    : activeStamp.icon === 'sun'
                    ? 'sunny'
                    : activeStamp.icon === 'wind'
                    ? 'water'
                    : activeStamp.icon === 'mountain'
                    ? 'trail-sign'
                    : 'sunny'
                }
                size={28}
                color={activeStamp.color}
              />
            </View>
          </View>
        </Card>

        {/* Category Pill Bar */}
        <Text style={[typography.subbodyBold, { color: colors.text.primary, marginBottom: spacing.sm }]}>
          1. Select Conversation Theme
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalCats}>
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.label}
              selected={selectedCategory === cat.id}
              onPress={() => setSelectedCategory(cat.id)}
            />
          ))}
        </ScrollView>

        {/* Chip Selection Cards */}
        <Text style={[typography.subbodyBold, { color: colors.text.primary, marginTop: spacing.md, marginBottom: spacing.sm }]}>
          2. Tap Cards to Add (Up to 5)
        </Text>
        <View style={styles.chipsGrid}>
          {categoryChips.map((chip) => {
            const isSelected = selectedChips.includes(chip.id);
            return (
              <Card
                key={chip.id}
                onPress={() => toggleChip(chip.id)}
                style={[
                  styles.chipCard,
                  {
                    backgroundColor: isSelected ? colors.primaryAlpha : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <View style={styles.chipRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.body, { color: isSelected ? colors.primary : colors.text.primary }]}>
                      {chip.text}
                    </Text>
                    {chip.subtext && (
                      <Text style={[typography.caption, { color: colors.text.muted, marginTop: 4 }]}>
                        {chip.subtext}
                      </Text>
                    )}
                  </View>
                  <View style={[styles.selectIndicator, { borderColor: isSelected ? colors.primary : colors.borderStrong }]}>
                    {isSelected && <Ionicons name="checkmark" size={14} color={colors.primary} />}
                  </View>
                </View>
              </Card>
            );
          })}
        </View>

        {/* Choose Collectible Stamp */}
        <Text style={[typography.subbodyBold, { color: colors.text.primary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          3. Affix Digital Stamp
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalStamps}>
          {STAMP_CATALOG.map((stamp) => {
            const isSelected = selectedStamp === stamp.id;
            return (
              <PressableScale
                key={stamp.id}
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {}
                  setSelectedStamp(stamp.id);
                }}
                style={[
                  styles.stampItem,
                  {
                    backgroundColor: isSelected ? colors.primaryAlpha : colors.surface,
                  },
                ]}
              >
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
                  size={24}
                  color={stamp.color}
                />
                <Text style={[typography.captionBold, { color: colors.text.primary, marginTop: 6, textAlign: 'center' }]}>
                  {stamp.name}
                </Text>
              </PressableScale>
            );
          })}
        </ScrollView>

        {/* Transit Estimation Card */}
        <Card style={{ marginTop: spacing.lg, marginBottom: spacing.lg, backgroundColor: colors.surface2 }}>
          <View style={styles.transitRow}>
            <Ionicons name="airplane-outline" size={22} color={colors.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>
                Estimated Transit: ~{estimatedDelayHours} Hours
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                Calculated by geographic distance (~{estimatedDistanceKm.toLocaleString()} km). No instant dopamine rushes—just peaceful anticipation.
              </Text>
            </View>
          </View>
        </Card>

        {/* Send Button */}
        <Button
          label={selectedChips.length === 0 ? 'Select at Least 1 Card' : 'Seal & Send Letter'}
          onPress={handleSend}
          disabled={selectedChips.length === 0}
          size="lg"
          icon={<Ionicons name="send" size={18} color="#FFFFFF" />}
        />
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
  stampHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stampLeftCol: {
    flex: 1,
    paddingRight: 12,
  },
  stampPill: {
    width: 60,
    height: 60,
    borderRadius: 14,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalCats: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chipsGrid: {
    gap: 8,
  },
  chipCard: {
    padding: 14,
    borderRadius: 16,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  horizontalStamps: {
    flexDirection: 'row',
  },
  stampItem: {
    width: 104,
    height: 94,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    padding: 8,
  },
  transitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
