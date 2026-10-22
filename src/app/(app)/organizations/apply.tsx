import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../../components/ui/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { Chip } from '../../../components/ui/Chip';
import { useTheme } from '../../../theme/useTheme';

export default function OrganizationApplyScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();

  const [orgName, setOrgName] = useState('');
  const [repName, setRepName] = useState('');
  const [orgType, setOrgType] = useState('Non-Profit / NGO');
  const [purpose, setPurpose] = useState('');

  const types = ['Non-Profit / NGO', 'Licensed Mental Health Clinic', 'Corporate Wellness Cohort', 'Community Peer Sanctuary'];

  const handleSubmit = () => {
    if (!orgName.trim() || !repName.trim()) {
      Alert.alert('Required Fields', 'Please specify the organization name and verified representative.');
      return;
    }

    Alert.alert(
      'Application Submitted',
      'Your organization credentials will be audited by Thrivefold administrators before role issuance.',
      [{ text: 'Done', onPress: () => router.back() }]
    );
  };

  return (
    <ScreenWrapper scrollable>
      <Header title="Register Organization" subtitle="Verification for NGOs, Clinics & Corporate Hubs" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.base, paddingBottom: spacing.xxl }]}>
        <Card style={{ marginBottom: spacing.md, backgroundColor: colors.surface1, borderColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="business-outline" size={20} color={colors.primary} />
            <Text style={[typography.subbodyBold, { color: colors.text.primary, marginLeft: 6 }]}>
              Verification Standards (Section 9.3)
            </Text>
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, lineHeight: 18 }]}>
            Organization accounts require a verified representative. Clinical therapy groups must furnish accredited licensure. Peer leaders cannot be falsely represented as licensed clinicians.
          </Text>
        </Card>

        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[typography.captionBold, { color: colors.text.secondary, marginBottom: 4 }]}>
            ORGANIZATION / CLINIC NAME
          </Text>
          <TextInput
            placeholder="e.g. Nordic Somatic Health Foundation"
            placeholderTextColor={colors.text.muted}
            value={orgName}
            onChangeText={setOrgName}
            style={[styles.input, { color: colors.text.primary, borderColor: colors.border, backgroundColor: colors.surface1 }]}
          />

          <Text style={[typography.captionBold, { color: colors.text.secondary, marginTop: 12, marginBottom: 4 }]}>
            AUTHORIZED REPRESENTATIVE NAME
          </Text>
          <TextInput
            placeholder="e.g. Dr. Astrid Lindgren, Director"
            placeholderTextColor={colors.text.muted}
            value={repName}
            onChangeText={setRepName}
            style={[styles.input, { color: colors.text.primary, borderColor: colors.border, backgroundColor: colors.surface1 }]}
          />

          <Text style={[typography.captionBold, { color: colors.text.secondary, marginTop: 14, marginBottom: 8 }]}>
            ORGANIZATION SECTOR
          </Text>
          <View style={styles.chipRow}>
            {types.map((t) => (
              <Chip
                key={t}
                label={t}
                selected={orgType === t}
                onPress={() => setOrgType(t)}
                style={{ marginRight: 6, marginBottom: 6 }}
              />
            ))}
          </View>

          <Text style={[typography.captionBold, { color: colors.text.secondary, marginTop: 14, marginBottom: 4 }]}>
            MISSION & CONFIDENTIALITY STATEMENT
          </Text>
          <TextInput
            placeholder="Describe the programs, support groups, or wellness workshops your organization plans to host..."
            placeholderTextColor={colors.text.muted}
            value={purpose}
            onChangeText={setPurpose}
            multiline
            numberOfLines={4}
            style={[styles.textArea, { color: colors.text.primary, borderColor: colors.border, backgroundColor: colors.surface1 }]}
          />
        </Card>

        <Button label="Submit for Audit & Credentialing" onPress={handleSubmit} />
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
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
