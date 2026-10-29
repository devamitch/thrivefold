import { useRouter, type Href } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { BetaHero } from '../../../components/beta/BetaHero';
import { AppHeader } from '../../../components/ui/AppHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Chip } from '../../../components/ui/Chip';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { ScreenScrollView } from '../../../components/ui/ScreenScrollView';
import { TextField } from '../../../components/ui/TextField';
import { currentMapLink, endTrip, messageContacts, startTrip } from '../../../services/safety/trip';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';
import { getSanctuaryIllustration } from '../../../utils/illustrationResolver';

const DURATIONS = [15, 30, 60, 90, 120];

/**
 * Trip check-in: tell the app where you are going and when you expect to arrive. At that time it
 * asks whether you arrived. You choose who to message and press Send yourself; nothing is sent
 * automatically, and a missed check-in is never treated as proof of an emergency.
 */
export default function TripScreen() {
  const router = useRouter();
  const { colors, typography, spacing, experience } = useTheme();
  const { trip, contacts, name } = useRootStore(
    useShallow((s) => ({ trip: s.trip, contacts: s.emergencyContacts, name: s.koshProfile.preferredName ?? s.user?.pseudonym ?? 'I' })),
  );
  const [destination, setDestination] = useState('');
  const [minutes, setMinutes] = useState(30);
  const [chosen, setChosen] = useState<string[]>(contacts.map((c) => c.id));
  const [now, setNow] = useState(Date.now());
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (!trip) return;
    const iv = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(iv);
  }, [trip]);

  const tripContacts = contacts.filter((c) => (trip ? trip.contactIds : chosen).includes(c.id));
  const overdue = !!trip && now > trip.dueAt;
  const minsLeft = trip ? Math.max(0, Math.round((trip.dueAt - now) / 60_000)) : 0;

  const send = async (kind: 'share' | 'help') => {
    setNote(null);
    const link = await currentMapLink();
    const where = link ? ` I'm here: ${link}` : '';
    const text =
      kind === 'share'
        ? `${name} here. I'm on my way to ${trip?.destination ?? destination}.${where}`
        : `${name} here. I may need help and planned to reach ${trip?.destination ?? destination} by now. Please call me.${where}`;
    const ok = await messageContacts(tripContacts, text);
    setNote(ok ? (link ? 'Your messages app is open with your location. Press Send.' : 'Your messages app is open. Location was not available.') : 'Could not open your messages app.');
  };

  return (
    <ScreenContainer>
      <AppHeader eyebrow="SAFETY" title="Trip check-in" subtitle="Let trusted people know you got there" showBack />
      <ScreenScrollView contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xl * 2 }}>
        <BetaHero source={getSanctuaryIllustration('outdoors', experience)} label="Trip check-in" />

        <Button label="Call 112 now" variant="outline" onPress={() => void Linking.openURL('tel:112')} />

        {trip ? (
          <Card style={styles.card}>
            <Text style={[typography.subheading, { color: colors.text.primary }]}>Going to {trip.destination}</Text>
            <Text style={[typography.subbody, { color: overdue ? colors.error : colors.text.secondary, marginTop: 4 }]}>
              {overdue ? 'You were due to arrive. Are you safe?' : `Check-in in about ${minsLeft} min`}
            </Text>
            <Button label="I've arrived" onPress={() => void endTrip()} style={{ marginTop: 12 }} />
            {tripContacts.length ? (
              <>
                <Button label="Share my location" variant="outline" onPress={() => void send('share')} style={{ marginTop: 8 }} />
                {overdue ? <Button label="Ask my contacts for help" variant="outline" onPress={() => void send('help')} style={{ marginTop: 8 }} /> : null}
              </>
            ) : (
              <Text style={[typography.caption, { color: colors.text.muted, marginTop: 8 }]}>Add emergency contacts in Your profile to message them from here.</Text>
            )}
            {note ? <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 8 }]}>{note}</Text> : null}
          </Card>
        ) : (
          <Card style={styles.card}>
            <TextField label="Where are you going?" value={destination} onChangeText={setDestination} placeholder="e.g. Home, office, Maddox Square" />
            <Text style={[typography.caption, { color: colors.text.muted, marginTop: 10 }]}>Expected to arrive in</Text>
            <View style={styles.chips}>
              {DURATIONS.map((m) => (
                <Chip key={m} label={m < 60 ? `${m} min` : `${m / 60} h`} selected={minutes === m} onPress={() => setMinutes(m)} />
              ))}
            </View>
            {contacts.length ? (
              <>
                <Text style={[typography.caption, { color: colors.text.muted, marginTop: 10 }]}>Who may be messaged</Text>
                <View style={styles.chips}>
                  {contacts.map((c) => (
                    <Chip
                      key={c.id}
                      label={c.name}
                      selected={chosen.includes(c.id)}
                      onPress={() => setChosen((cur) => (cur.includes(c.id) ? cur.filter((x) => x !== c.id) : [...cur, c.id]))}
                    />
                  ))}
                </View>
              </>
            ) : (
              <Button label="Add emergency contacts" variant="ghost" onPress={() => router.push('/(app)/you/profile' as Href)} style={{ marginTop: 8, alignSelf: 'flex-start' }} />
            )}
            <Button
              label="Start trip"
              disabled={destination.trim().length < 2}
              onPress={() => void startTrip(destination.trim().slice(0, 80), minutes, chosen)}
              style={{ marginTop: 14 }}
            />
          </Card>
        )}

        <Text style={[typography.caption, { color: colors.text.muted, marginTop: 10 }]}>
          Nothing is sent automatically. Your location is read once, only when you tap Share or Ask for help, and goes only into the message you
          send. In danger, call 112 first.
        </Text>
      </ScreenScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
});
