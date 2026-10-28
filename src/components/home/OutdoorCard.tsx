import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native';

import { describeCode, planWalk, type OfficialAlert, type WalkPlan } from '../../domain/world/outdoor';
import { alertsFor } from '../../services/world/officialAlerts';
import { getForecast, searchPlaces, type Forecast, type Place } from '../../services/world/weather';
import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { TextField } from '../ui/TextField';

const hourLabel = (iso: string) => {
  const h = Number(iso.slice(11, 13));
  return `${h % 12 || 12} ${h < 12 ? 'am' : 'pm'}`;
};
const timeLabel = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' }) : 'not stated';

/**
 * Outdoors today for the town the person chose: current weather, the best hour to walk, practical
 * tips, and official NDMA SACHET alerts that cover that town. Each source and time is shown.
 * An emergency call is always one tap away, with or without data.
 */
export function OutdoorCard() {
  const { colors, typography, spacing } = useTheme();
  const place = useRootStore((s) => s.outdoorPlace);
  const setPlace = useRootStore((s) => s.setOutdoorPlace);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [editing, setEditing] = useState(false);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [alerts, setAlerts] = useState<OfficialAlert[] | null>(null);
  const [plan, setPlan] = useState<WalkPlan | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [alertsError, setAlertsError] = useState(false);

  const load = useCallback(async (p: Place) => {
    setState('loading');
    setAlertsError(false);
    try {
      const f = await getForecast(p);
      setForecast(f);
      let a: OfficialAlert[] = [];
      try {
        a = await alertsFor(p.lat, p.lon);
        setAlerts(a);
      } catch {
        setAlerts(null);
        setAlertsError(true);
      }
      setPlan(planWalk(f.hours, new Date(), a));
      setState('idle');
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => {
    if (place) void load(place);
  }, [place, load]);

  const search = async () => {
    try {
      setResults(await searchPlaces(query));
    } catch {
      setResults([]);
    }
  };

  const emergency = (
    <Chip label="Emergency 112" onPress={() => void Linking.openURL('tel:112')} />
  );

  if (!place || editing) {
    return (
      <Card style={{ marginTop: spacing.md }}>
        <View style={styles.head}>
          <Ionicons name="partly-sunny-outline" size={20} color={colors.primary} />
          <Text style={[typography.bodyBold, styles.flex, { color: colors.text.primary }]}>Outdoors today</Text>
          {emergency}
        </View>
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
          Choose your town for weather, the best time to walk, and official alerts. Only the town name you pick is used.
        </Text>
        <View style={styles.row}>
          <TextField
            value={query}
            onChangeText={setQuery}
            placeholder="Town or city"
            returnKeyType="search"
            onSubmitEditing={() => void search()}
            containerStyle={styles.flex}
          />
          <Chip label="Search" onPress={() => void search()} />
        </View>
        <View style={styles.chips}>
          {results.map((r) => (
            <Chip
              key={`${r.lat},${r.lon}`}
              label={[r.name, r.region].filter(Boolean).join(', ')}
              onPress={() => {
                setPlace(r);
                setEditing(false);
                setResults([]);
              }}
            />
          ))}
        </View>
      </Card>
    );
  }

  return (
    <Card style={{ marginTop: spacing.md }}>
      <View style={styles.head}>
        <Ionicons name="partly-sunny-outline" size={20} color={colors.primary} />
        <Text style={[typography.bodyBold, styles.flex, { color: colors.text.primary }]} onPress={() => setEditing(true)}>
          {place.name} · change
        </Text>
        {emergency}
      </View>

      {state === 'loading' && !forecast ? <ActivityIndicator color={colors.primary} style={{ marginTop: 10 }} /> : null}
      {state === 'error' ? (
        <Text style={[typography.caption, { color: colors.error, marginTop: 8 }]} onPress={() => void load(place)}>
          Weather could not load. Tap to retry.
        </Text>
      ) : null}

      {forecast ? (
        <>
          <View style={styles.nowRow}>
            <Text style={[styles.temp, { color: colors.text.primary }]}>{Math.round(forecast.now.tempC)}°</Text>
            <View style={styles.flex}>
              <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{describeCode(forecast.now.code)}</Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                Feels {Math.round(forecast.now.feelsC)}° · humidity {forecast.now.humidity}% · wind {Math.round(forecast.now.windKmh)} km/h
              </Text>
            </View>
          </View>
          {plan?.best ? (
            <Text style={[typography.subbody, { color: colors.text.primary, marginTop: 8 }]}>
              Best time to walk: {hourLabel(plan.best.time)} ({describeCode(plan.best.code).toLowerCase()}, feels{' '}
              {Math.round(plan.best.feelsC)}°, {plan.best.rainChance}% rain)
            </Text>
          ) : null}
          {plan?.tips.map((t) => (
            <Text key={t} style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
              • {t}
            </Text>
          ))}
        </>
      ) : null}

      {alerts && alerts.length > 0
        ? alerts.slice(0, 3).map((a) => (
            <View key={a.id} style={[styles.alert, { backgroundColor: a.severity === 'Moderate' || a.severity === 'Minor' ? colors.warningSurface : colors.errorSurface }]}>
              <Text style={[typography.captionBold, { color: colors.text.primary }]}>
                {a.severity} · {a.event}
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]} numberOfLines={4}>
                {a.headline}
              </Text>
              {a.instruction ? <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>{a.instruction}</Text> : null}
              <Text style={[typography.caption, { color: colors.text.muted, marginTop: 2 }]}>
                {a.sender} · issued {timeLabel(a.sentAt)} · until {timeLabel(a.expiresAt)}
              </Text>
            </View>
          ))
        : null}

      <Text style={[typography.caption, { color: colors.text.muted, marginTop: 8 }]}>
        {alertsError
          ? 'Official alerts could not be checked just now. '
          : alerts && alerts.length === 0
            ? 'No active official alert covers this town right now; that does not mean it is safe everywhere. '
            : ''}
        Weather by Open-Meteo.com
        {forecast ? ` · updated ${new Date(forecast.fetchedAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}` : ''} · Alerts
        from NDMA SACHET.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  nowRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  temp: { fontSize: 36, lineHeight: 42, fontWeight: '700' },
  alert: { borderRadius: 14, padding: 10, marginTop: 10 },
});
