import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Linking, StyleSheet, Switch, Text, View } from 'react-native';

import { AppHeader } from '../../../components/ui/AppHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { ScreenScrollView } from '../../../components/ui/ScreenScrollView';
import { TextField } from '../../../components/ui/TextField';
import { PHONE_RE, koshCompleteness, splitList, type KoshProfile } from '../../../domain/account/koshProfile';
import { pushProfile } from '../../../services/account/profileSync';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

type ListKey = 'languages' | 'foodRestrictions' | 'allergies' | 'cuisines' | 'foodDislikes' | 'interests' | 'skills';

const LISTS: { key: ListKey; label: string; hint: string; group: 'about' | 'food' | 'growth' }[] = [
  { key: 'languages', label: 'Languages you prefer', hint: 'e.g. Bengali, English', group: 'about' },
  { key: 'foodRestrictions', label: 'Food rules you follow', hint: 'e.g. vegetarian, no onion or garlic, halal', group: 'food' },
  { key: 'allergies', label: 'Allergies and intolerances', hint: 'e.g. peanuts, lactose', group: 'food' },
  { key: 'cuisines', label: 'Cuisines you enjoy', hint: 'e.g. Bengali, South Indian', group: 'food' },
  { key: 'foodDislikes', label: 'Foods you dislike', hint: 'e.g. bitter gourd', group: 'food' },
  { key: 'interests', label: 'Interests', hint: 'e.g. music, heritage walks', group: 'growth' },
  { key: 'skills', label: 'Skills you have or want', hint: 'e.g. public speaking, Python', group: 'growth' },
];

/**
 * Your Anvay Kosh profile: what you choose to tell Thrivefold, in one place, saved to your
 * account so every phone and sign-in has it. Every field is optional and editable; nothing here
 * is guessed. Health records, cycle data and journal stay on this phone (encrypted).
 */
export default function KoshProfileScreen() {
  const { colors, typography, spacing } = useTheme();
  const { kosh, update, contacts, setContacts, signedIn } = useRootStore(
    useShallow((s) => ({
      kosh: s.koshProfile,
      update: s.updateKoshProfile,
      contacts: s.emergencyContacts,
      setContacts: s.setEmergencyContacts,
      signedIn: !!s.user && !s.user.isGuest,
    })),
  );
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cRelation, setCRelation] = useState('');
  const [saved, setSaved] = useState<'idle' | 'saving' | 'saved' | 'local'>('idle');

  const text = (key: string, fallback: string) => drafts[key] ?? fallback;
  const setDraft = (key: string, v: string) => setDrafts((d) => ({ ...d, [key]: v }));

  const commitList = (key: ListKey) => {
    if (drafts[key] === undefined) return;
    update({ [key]: splitList(drafts[key]) } as Partial<KoshProfile>);
  };
  const commitText = (key: 'preferredName' | 'phone' | 'careerGoal') => {
    if (drafts[key] === undefined) return;
    const v = drafts[key].trim();
    if (key === 'phone' && v && !PHONE_RE.test(v)) return;
    update({ [key]: v || null } as Partial<KoshProfile>);
  };

  const save = async () => {
    setSaved('saving');
    const ok = await pushProfile();
    setSaved(ok ? 'saved' : 'local');
  };

  const addContact = () => {
    const name = cName.trim();
    const phone = cPhone.trim();
    if (!name || !PHONE_RE.test(phone) || contacts.length >= 5) return;
    setContacts([...contacts, { id: `local_${Date.now()}`, name, phone, relation: cRelation.trim() || null }]);
    setCName('');
    setCPhone('');
    setCRelation('');
  };

  const listField = (l: (typeof LISTS)[number]) => (
    <TextField
      key={l.key}
      label={l.label}
      placeholder={l.hint}
      value={text(l.key, kosh[l.key].join(', '))}
      onChangeText={(v) => setDraft(l.key, v)}
      onBlur={() => commitList(l.key)}
      containerStyle={styles.field}
    />
  );

  const access = (key: keyof KoshProfile['accessibility'], label: string) => (
    <View style={styles.switchRow}>
      <Text style={[typography.subbody, styles.flex, { color: colors.text.primary }]}>{label}</Text>
      <Switch value={!!kosh.accessibility[key]} onValueChange={(v) => update({ accessibility: { ...kosh.accessibility, [key]: v } })} />
    </View>
  );

  return (
    <ScreenContainer>
      <AppHeader eyebrow="ANVAY KOSH" title="Your profile" subtitle={`${koshCompleteness(kosh, contacts.length)}% complete · every field optional`} showBack />
      <ScreenScrollView contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xl * 2 }}>
        <Text style={[typography.caption, { color: colors.text.secondary }]}>
          {signedIn
            ? 'Saved to your account, so you are not asked again on another phone or after reinstalling. Health records, cycle data and your journal stay encrypted on this phone.'
            : 'You are using Thrivefold as a guest, so this stays on this phone. Sign in to keep it with your account.'}
        </Text>

        <Card style={styles.card}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>About you</Text>
          <TextField label="What should we call you?" value={text('preferredName', kosh.preferredName ?? '')} onChangeText={(v) => setDraft('preferredName', v)} onBlur={() => commitText('preferredName')} containerStyle={styles.field} />
          <TextField label="Phone" keyboardType="phone-pad" value={text('phone', kosh.phone ?? '')} onChangeText={(v) => setDraft('phone', v)} onBlur={() => commitText('phone')} containerStyle={styles.field} />
          {LISTS.filter((l) => l.group === 'about').map(listField)}
        </Card>

        <Card style={styles.card}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>Food</Text>
          <Text style={[typography.caption, { color: colors.text.muted }]}>Meal ideas follow these. Allergies are always respected first.</Text>
          {LISTS.filter((l) => l.group === 'food').map(listField)}
        </Card>

        <Card style={styles.card}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>Growth</Text>
          {LISTS.filter((l) => l.group === 'growth').map(listField)}
          <TextField label="A goal for your work or studies" value={text('careerGoal', kosh.careerGoal ?? '')} onChangeText={(v) => setDraft('careerGoal', v)} onBlur={() => commitText('careerGoal')} containerStyle={styles.field} multiline />
        </Card>

        <Card style={styles.card}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>Accessibility</Text>
          {access('screenReader', 'I use a screen reader')}
          {access('largeText', 'I prefer larger text')}
          {access('voiceFirst', 'Speak results and instructions to me')}
        </Card>

        <Card style={styles.card}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>Emergency contacts</Text>
          <Text style={[typography.caption, { color: colors.text.muted }]}>Up to five people you can call in one tap. They are not contacted automatically.</Text>
          {contacts.map((c) => (
            <View key={c.id} style={[styles.contact, { borderTopColor: colors.surface1 }]}>
              <View style={styles.flex}>
                <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{c.name}</Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>{[c.relation, c.phone].filter(Boolean).join(' · ')}</Text>
              </View>
              <PressableScale onPress={() => void Linking.openURL(`tel:${c.phone.replace(/[^0-9+]/g, '')}`)} accessibilityLabel={`Call ${c.name}`} style={styles.iconBtn}>
                <Ionicons name="call-outline" size={20} color={colors.primary} />
              </PressableScale>
              <PressableScale onPress={() => setContacts(contacts.filter((x) => x.id !== c.id))} accessibilityLabel={`Remove ${c.name}`} style={styles.iconBtn}>
                <Ionicons name="trash-outline" size={18} color={colors.text.muted} />
              </PressableScale>
            </View>
          ))}
          {contacts.length < 5 ? (
            <>
              <TextField label="Name" value={cName} onChangeText={setCName} containerStyle={styles.field} />
              <TextField label="Phone" keyboardType="phone-pad" value={cPhone} onChangeText={setCPhone} containerStyle={styles.field} />
              <TextField label="Relation (optional)" value={cRelation} onChangeText={setCRelation} containerStyle={styles.field} />
              <Button label="Add contact" size="sm" variant="outline" onPress={addContact} style={{ marginTop: 8, alignSelf: 'flex-start' }} />
            </>
          ) : null}
        </Card>

        <Button
          label={saved === 'saving' ? 'Saving…' : 'Save to my account'}
          onPress={() => void save()}
          disabled={!signedIn || saved === 'saving'}
          style={{ marginTop: spacing.md }}
        />
        {saved === 'saved' ? <Text style={[typography.caption, { color: colors.success, marginTop: 6 }]}>Saved to your account.</Text> : null}
        {saved === 'local' ? (
          <Text style={[typography.caption, { color: colors.warning, marginTop: 6 }]}>Saved on this phone; it will sync when you are online.</Text>
        ) : null}
      </ScreenScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { marginTop: 12 },
  field: { marginTop: 10 },
  switchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  contact: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, marginTop: 6 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});
