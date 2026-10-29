import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native';

import { BetaHero } from '../../components/beta/BetaHero';
import { AppHeader } from '../../components/ui/AppHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { TextField } from '../../components/ui/TextField';
import { orderStops, summarise, type Leg, type Stop } from '../../domain/world/itinerary';
import { describeCode, planWalk, type OfficialAlert, type WalkPlan } from '../../domain/world/outdoor';
import { coachVoice } from '../../services/ai/coachVoice';
import { MapsError, route, searchPlacesNear, type MapPlace } from '../../services/world/maps';
import { alertsFor } from '../../services/world/officialAlerts';
import { getForecast } from '../../services/world/weather';
import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { getSanctuaryIllustration } from '../../utils/illustrationResolver';

const IDEAS = ['Durga Puja pandal', 'Park', 'Heritage site', 'Museum', 'Lake walk', 'Temple', 'Market'];
const MAX_STOPS = 6;
const MINUTES_PER_STOP = 20;

/**
 * Plan an outing: search real places near your town (Google Places), pick a few, and get a
 * walking order with real walking times (Google Routes), the best hour from the forecast, and
 * any official alert. Crowds and queues are not known, so they are never shown.
 */
export default function OutingScreen() {
  const { colors, typography, spacing, experience } = useTheme();
  const place = useRootStore((s) => s.outdoorPlace);
  const [what, setWhat] = useState('Durga Puja pandal');
  const [start, setStart] = useState('');
  const [results, setResults] = useState<MapPlace[]>([]);
  const [picked, setPicked] = useState<MapPlace[]>([]);
  const [plan, setPlan] = useState<{
    order: Stop[];
    legs: Leg[];
    walk: WalkPlan | null;
    alerts: OfficialAlert[];
  } | null>(null);
  const [busy, setBusy] = useState<'search' | 'plan' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const near = place ? { lat: place.lat, lon: place.lon } : null;

  const search = async () => {
    setError(null);
    setPlan(null);
    setBusy('search');
    try {
      const q = place ? `${what} near ${place.name}` : what;
      setResults(await searchPlacesNear(q, near));
    } catch (e) {
      setError(e instanceof MapsError ? e.message : 'Search failed.');
    } finally {
      setBusy(null);
    }
  };

  const toggle = (p: MapPlace) =>
    setPicked((cur) =>
      cur.some((c) => c.id === p.id) ? cur.filter((c) => c.id !== p.id) : cur.length < MAX_STOPS ? [...cur, p] : cur,
    );

  const makePlan = async () => {
    if (picked.length === 0) return;
    setError(null);
    setBusy('plan');
    try {
      const startPoint = start.trim() ? start.trim() : (near ?? { lat: picked[0].lat, lon: picked[0].lon });
      const startCoords =
        typeof startPoint === 'string' ? (near ?? { lat: picked[0].lat, lon: picked[0].lon }) : startPoint;
      const order = orderStops(
        startCoords,
        picked.map((p) => ({ id: p.id, name: p.name, lat: p.lat, lon: p.lon })),
      );
      const legs: Leg[] = [];
      let from: string | { lat: number; lon: number } = startPoint;
      let fromName = start.trim() || (place ? place.name : order[0].name);
      for (const stop of order) {
        if (typeof from !== 'string' && from.lat === stop.lat && from.lon === stop.lon) {
          fromName = stop.name;
          continue;
        }
        const r = await route(from, { lat: stop.lat, lon: stop.lon }, 'WALK');
        legs.push({
          from: fromName,
          to: stop.name,
          seconds: r?.seconds ?? 0,
          meters: r?.meters ?? 0,
        });
        from = { lat: stop.lat, lon: stop.lon };
        fromName = stop.name;
      }
      let walk: WalkPlan | null = null;
      let alerts: OfficialAlert[] = [];
      if (place) {
        try {
          const f = await getForecast(place);
          try {
            alerts = await alertsFor(place.lat, place.lon);
          } catch {
            alerts = [];
          }
          walk = planWalk(f.hours, new Date(), alerts);
        } catch {
          walk = null;
        }
      }
      setPlan({ order, legs, walk, alerts });
      const s = summarise(legs, MINUTES_PER_STOP, order.length);
      void coachVoice.speak(
        `Your outing has ${order.length} stops and about ${s.walkMinutes} minutes of walking.${walk?.best ? ` The best time to start is around ${Number(walk.best.time.slice(11, 13)) % 12 || 12}.` : ''}`,
        { priority: 2, maxMs: 9000 },
      );
    } catch (e) {
      setError(e instanceof MapsError ? e.message : 'Planning failed.');
    } finally {
      setBusy(null);
    }
  };

  const totals = plan ? summarise(plan.legs, MINUTES_PER_STOP, plan.order.length) : null;

  return (
    <ScreenContainer
      scrollable
      header={
        <AppHeader
          eyebrow="OUTDOORS"
          title="Plan an outing"
          subtitle="Real places, walking times, weather and official alerts"
          showBack
        />
      }
    >
      <BetaHero source={getSanctuaryIllustration('outdoors', experience)} label="Plan an outing" />
      {!place ? (
        <Text style={[typography.caption, { color: colors.warning }]}>
          Choose your town in the Outdoors card on Home for nearby results and weather.
        </Text>
      ) : (
        <Text style={[typography.caption, { color: colors.text.secondary }]}>Near {place.name}</Text>
      )}

      <Card style={styles.card}>
        <Text style={[typography.subheading, { color: colors.text.primary }]}>What would you like to visit?</Text>
        <View style={styles.chips}>
          {IDEAS.map((i) => (
            <Chip key={i} label={i} selected={what === i} onPress={() => setWhat(i)} />
          ))}
        </View>
        <TextField label="Or type anything" value={what} onChangeText={setWhat} containerStyle={styles.field} />
        <TextField
          label="Starting point (optional)"
          placeholder="e.g. Gariahat crossing"
          value={start}
          onChangeText={setStart}
          containerStyle={styles.field}
        />
        <Button
          label={busy === 'search' ? 'Searching…' : 'Find places'}
          onPress={() => void search()}
          disabled={busy !== null}
          style={{ marginTop: 12 }}
        />
        {error ? <Text style={[typography.caption, { color: colors.error, marginTop: 8 }]}>{error}</Text> : null}
      </Card>

      {results.length ? (
        <Card style={styles.card}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>Pick up to {MAX_STOPS}</Text>
          {results.map((p) => {
            const on = picked.some((c) => c.id === p.id);
            return (
              <View key={p.id} style={[styles.place, { borderTopColor: colors.surface1 }]}>
                <View style={styles.flex}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]} onPress={() => toggle(p)}>
                    {on ? '✓ ' : ''}
                    {p.name}
                  </Text>
                  <Text style={[typography.caption, { color: colors.text.secondary }]} numberOfLines={2}>
                    {[
                      p.address,
                      p.rating ? `${p.rating}★ (${p.ratings ?? 0})` : null,
                      p.openNow === true ? 'open now' : p.openNow === false ? 'closed now' : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </View>
                <Chip label={on ? 'Remove' : 'Add'} selected={on} onPress={() => toggle(p)} />
              </View>
            );
          })}
          <Button
            label={busy === 'plan' ? 'Planning…' : `Plan walk (${picked.length})`}
            onPress={() => void makePlan()}
            disabled={busy !== null || picked.length === 0}
            style={{ marginTop: 12 }}
          />
        </Card>
      ) : null}

      {busy ? <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} /> : null}

      {plan && totals ? (
        <Card style={styles.card}>
          <Text style={[typography.subheading, { color: colors.text.primary }]}>Your outing</Text>
          <Text style={[typography.subbody, { color: colors.text.secondary, marginTop: 4 }]}>
            {plan.order.length} stops · {totals.walkMinutes} min walking ({totals.km} km, ≈{' '}
            {totals.estSteps.toLocaleString()} steps) · about {Math.round(totals.totalMinutes / 6) / 10} h with{' '}
            {MINUTES_PER_STOP} min at each stop
          </Text>
          {plan.walk?.best ? (
            <Text style={[typography.subbody, { color: colors.text.primary, marginTop: 6 }]}>
              Best time to start: {Number(plan.walk.best.time.slice(11, 13)) % 12 || 12}{' '}
              {Number(plan.walk.best.time.slice(11, 13)) < 12 ? 'am' : 'pm'} (
              {describeCode(plan.walk.best.code).toLowerCase()}, {plan.walk.best.rainChance}% rain)
            </Text>
          ) : null}
          {plan.walk?.tips.map((t) => (
            <Text key={t} style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
              • {t}
            </Text>
          ))}
          {plan.alerts.map((a) => (
            <Text key={a.id} style={[typography.captionBold, { color: colors.error, marginTop: 6 }]}>
              {a.severity} · {a.event} ({a.sender})
            </Text>
          ))}
          {plan.order.map((s, i) => {
            const leg = plan.legs.find((l) => l.to === s.name);
            const mp = picked.find((p) => p.id === s.id);
            return (
              <View key={s.id} style={[styles.place, { borderTopColor: colors.surface1 }]}>
                <Text style={[typography.heading, styles.num, { color: colors.primary }]}>{i + 1}</Text>
                <View style={styles.flex}>
                  <Text style={[typography.bodyBold, { color: colors.text.primary }]}>{s.name}</Text>
                  {leg && leg.seconds ? (
                    <Text style={[typography.caption, { color: colors.text.secondary }]}>
                      {Math.round(leg.seconds / 60)} min walk · {Math.round(leg.meters / 100) / 10} km from {leg.from}
                    </Text>
                  ) : null}
                </View>
                {mp?.mapsUrl ? (
                  <Ionicons
                    name="navigate-outline"
                    size={22}
                    color={colors.primary}
                    onPress={() => void Linking.openURL(mp.mapsUrl!)}
                    accessibilityLabel={`Open ${s.name} in Google Maps`}
                  />
                ) : null}
              </View>
            );
          })}
          <Text style={[typography.caption, { color: colors.text.muted, marginTop: 10 }]}>
            Walking times from Google Maps; steps are estimated. Crowds, queues and pandal timings are not known here;
            check locally and keep water with you. Routes by Google Maps · Weather by Open-Meteo.com · Alerts from NDMA
            SACHET.
          </Text>
        </Card>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { marginTop: 12 },
  field: { marginTop: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  place: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  num: { width: 26, textAlign: 'center' },
});
