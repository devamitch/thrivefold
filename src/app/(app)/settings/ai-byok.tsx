import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '../../../components/ui/AppHeader';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { PressableScale } from '../../../components/ui/PressableScale';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { SquircleSurface } from '../../../components/ui/SquircleSurface';
import { TextField } from '../../../components/ui/TextField';
import { testProviderKey } from '../../../services/ai/providers';
import type { AiDeliveryMode, UserApiKeys } from '../../../stores/slices/appSlice';
import { useRootStore, useShallow } from '../../../stores/useRootStore';
import { useTheme } from '../../../theme/useTheme';

interface ProviderConfig {
  id: keyof UserApiKeys;
  name: string;
  badge: string;
  description: string;
  docsUrl: string;
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const PROVIDERS: ProviderConfig[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    badge: 'Recommended',
    description: 'Generous free tier with Gemini 2.0 Flash. Fast reasoning and vision assistance.',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    placeholder: 'AIzaSy...',
    icon: 'sparkles-outline',
  },
  {
    id: 'groq',
    name: 'Groq Cloud',
    badge: 'Ultra Fast',
    description: 'Sub-second inference running LLaMA 3.3 70B on dedicated LPU hardware.',
    docsUrl: 'https://console.groq.com/keys',
    placeholder: 'gsk_...',
    icon: 'flash-outline',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    badge: 'Multi-Model',
    description: 'Unified gateway providing access to Claude, Mistral, LLaMA, and Gemini.',
    docsUrl: 'https://openrouter.ai/keys',
    placeholder: 'sk-or-v1-...',
    icon: 'git-network-outline',
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    badge: 'Deep Reasoning',
    description: 'State-of-the-art reasoning and thoughtful dialogue powered by Claude 3.5 Haiku & Sonnet.',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    placeholder: 'sk-ant-...',
    icon: 'bulb-outline',
  },
  {
    id: 'sarvam',
    name: 'Sarvam AI',
    badge: 'Indian Voice',
    description: 'Neural TTS for natural, warm Hindi & Indian-English spoken coaching.',
    docsUrl: 'https://www.sarvam.ai/',
    placeholder: 'sarvam_key_...',
    icon: 'volume-high-outline',
  },
];

export default function AiByokScreen() {
  const { colors, typography, spacing } = useTheme();
  const {
    userApiKeys,
    aiDeliveryMode,
    setUserApiKey,
    clearUserApiKey,
    setAiDeliveryMode,
    showToast,
  } = useRootStore(
    useShallow((s) => ({
      userApiKeys: s.userApiKeys,
      aiDeliveryMode: s.aiDeliveryMode,
      setUserApiKey: s.setUserApiKey,
      clearUserApiKey: s.clearUserApiKey,
      setAiDeliveryMode: s.setAiDeliveryMode,
      showToast: s.showToast,
    })),
  );

  const [inputKeys, setInputKeys] = useState<Partial<Record<keyof UserApiKeys, string>>>({
    gemini: userApiKeys.gemini ?? '',
    groq: userApiKeys.groq ?? '',
    openrouter: userApiKeys.openrouter ?? '',
    claude: userApiKeys.claude ?? '',
    sarvam: userApiKeys.sarvam ?? '',
  });

  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [testStatus, setTestStatus] = useState<Record<string, { ok: boolean; message: string }>>({});

  const handleSaveKey = (provider: keyof UserApiKeys) => {
    const val = (inputKeys[provider] ?? '').trim();
    if (val) {
      setUserApiKey(provider, val);
      showToast({
        type: 'success',
        title: 'Key Saved',
        message: `${provider.toUpperCase()} key stored safely in encrypted storage.`,
      });
      // Automatically switch to BYOK mode when a key is saved
      if (aiDeliveryMode === 'local_only') {
        setAiDeliveryMode('byok');
      }
    }
  };

  const handleClearKey = (provider: keyof UserApiKeys) => {
    clearUserApiKey(provider);
    setInputKeys((prev) => ({ ...prev, [provider]: '' }));
    setTestStatus((prev) => {
      const next = { ...prev };
      delete next[provider];
      return next;
    });
    showToast({
      type: 'info',
      title: 'Key Cleared',
      message: `${provider.toUpperCase()} key removed from device.`,
    });
  };

  const handleTestKey = async (provider: keyof UserApiKeys) => {
    const keyToTest = (inputKeys[provider] ?? userApiKeys[provider] ?? '').trim();
    if (!keyToTest) {
      showToast({
        type: 'warning',
        title: 'Empty Key',
        message: 'Please paste an API key before testing connection.',
      });
      return;
    }

    setTesting((prev) => ({ ...prev, [provider]: true }));
    try {
      const result = await testProviderKey(
        provider as 'gemini' | 'groq' | 'openrouter' | 'claude' | 'sarvam',
        keyToTest,
      );
      setTestStatus((prev) => ({
        ...prev,
        [provider]: { ok: result.ok, message: result.message },
      }));
    } finally {
      setTesting((prev) => ({ ...prev, [provider]: false }));
    }
  };

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="AI & API Keys (BYOK)"
          subtitle="Bring Your Own Key or run 100% on-device"
          showBack
        />
      }
      scrollMode="shell-scroll-view"
    >
      <View style={{ paddingBottom: spacing.xxl }}>
        {/* Mode Selector Card */}
        <Card style={[styles.modeCard, { backgroundColor: colors.surface }]}>
          <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>
            AI Delivery Mode
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 4 }]}>
            Choose whether to operate completely offline or use your personal API keys for cloud enhancements.
          </Text>

          <View style={styles.modeRow}>
            {(
              [
                {
                  id: 'local_only',
                  label: 'Local-First Only',
                  icon: 'phone-portrait-outline',
                  desc: '100% On-Device, zero cloud calls',
                },
                {
                  id: 'byok',
                  label: 'BYOK Mode',
                  icon: 'key-outline',
                  desc: 'Your keys, direct API connection',
                },
              ] as const
            ).map((m) => {
              const selected = aiDeliveryMode === m.id;
              return (
                <PressableScale
                  key={m.id}
                  onPress={() => setAiDeliveryMode(m.id as AiDeliveryMode)}
                  scaleTo={0.96}
                  style={styles.flex}
                >
                  <SquircleSurface
                    radius={14}
                    fill={selected ? colors.primaryAlpha : colors.surface1}
                    strokeWidth={selected ? 1.5 : 1}
                    style={[
                      styles.modeOption,
                      { borderColor: selected ? colors.primary : colors.border },
                    ]}
                  >
                    <Ionicons
                      name={m.icon}
                      size={20}
                      color={selected ? colors.primary : colors.text.secondary}
                    />
                    <Text
                      style={[
                        typography.captionBold,
                        {
                          color: selected ? colors.primary : colors.text.primary,
                          marginTop: 6,
                        },
                      ]}
                    >
                      {m.label}
                    </Text>
                    <Text
                      numberOfLines={2}
                      style={[
                        typography.caption,
                        { color: colors.text.secondary, fontSize: 10, textAlign: 'center', marginTop: 2 },
                      ]}
                    >
                      {m.desc}
                    </Text>
                  </SquircleSurface>
                </PressableScale>
              );
            })}
          </View>
        </Card>

        {/* Current Status Badge */}
        <Card style={{ marginVertical: spacing.sm, padding: spacing.md, backgroundColor: colors.surface1 }}>
          <View style={styles.statusRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Ionicons
                name={aiDeliveryMode === 'local_only' ? 'shield-checkmark' : 'cloud-done'}
                size={22}
                color={aiDeliveryMode === 'local_only' ? colors.success : colors.primary}
              />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={[typography.subbodyBold, { color: colors.text.primary }]}>
                  {aiDeliveryMode === 'local_only'
                    ? 'Local-First Active (100% On-Device)'
                    : 'BYOK Cloud Connected'}
                </Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>
                  {aiDeliveryMode === 'local_only'
                    ? 'Vitals, timers, workouts, check-ins & rules run smoothly without network.'
                    : 'Optional cloud intelligence uses your personal provider keys directly.'}
                </Text>
              </View>
            </View>
            <Badge
              label={aiDeliveryMode === 'local_only' ? 'Private' : 'BYOK'}
              variant={aiDeliveryMode === 'local_only' ? 'success' : 'primary'}
            />
          </View>
        </Card>

        {/* Provider Keys */}
        <Text
          style={[
            typography.subheading,
            { color: colors.text.primary, marginTop: spacing.md, marginBottom: spacing.sm },
          ]}
        >
          Provider API Credentials
        </Text>

        {PROVIDERS.map((provider) => {
          const isConfigured = Boolean(userApiKeys[provider.id]);
          const currentVal = inputKeys[provider.id] ?? '';
          const isVisible = Boolean(showKey[provider.id]);
          const isBusy = Boolean(testing[provider.id]);
          const status = testStatus[provider.id];

          return (
            <Card key={provider.id} style={{ marginBottom: spacing.md, padding: spacing.base }}>
              {/* Provider Header */}
              <View style={styles.providerHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Ionicons name={provider.icon} size={22} color={colors.primary} />
                  <Text style={[typography.bodyBold, { color: colors.text.primary, marginLeft: 8 }]}>
                    {provider.name}
                  </Text>
                </View>
                <Badge label={provider.badge} variant={isConfigured ? 'success' : 'neutral'} />
              </View>

              <Text style={[typography.subbody, { color: colors.text.secondary, marginVertical: 6 }]}>
                {provider.description}
              </Text>

              {/* Input Field */}
              <View style={styles.inputWrap}>
                <TextField
                  value={currentVal}
                  onChangeText={(text) =>
                    setInputKeys((prev) => ({ ...prev, [provider.id]: text }))
                  }
                  placeholder={provider.placeholder}
                  secureTextEntry={!isVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                  containerStyle={styles.flex}
                  accessibilityLabel={`${provider.name} API Key`}
                />
                <PressableScale
                  onPress={() =>
                    setShowKey((prev) => ({ ...prev, [provider.id]: !prev[provider.id] }))
                  }
                  style={styles.eyeBtn}
                  accessibilityLabel="Toggle key visibility"
                >
                  <Ionicons
                    name={isVisible ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.text.secondary}
                  />
                </PressableScale>
              </View>

              {/* Test Status feedback */}
              {status ? (
                <View
                  style={[
                    styles.testResultBox,
                    {
                      backgroundColor: status.ok ? colors.primaryAlpha : colors.surface2,
                    },
                  ]}
                >
                  <Ionicons
                    name={status.ok ? 'checkmark-circle' : 'alert-circle'}
                    size={16}
                    color={status.ok ? colors.success : colors.error}
                  />
                  <Text
                    style={[
                      typography.caption,
                      { color: status.ok ? colors.success : colors.error, marginLeft: 6 },
                    ]}
                  >
                    {status.message}
                  </Text>
                </View>
              ) : null}

              {/* Actions row */}
              <View style={styles.actionsRow}>
                <Button
                  label={isConfigured ? 'Update' : 'Save'}
                  size="sm"
                  onPress={() => handleSaveKey(provider.id)}
                  disabled={!currentVal.trim()}
                />

                <Button
                  label="Test"
                  size="sm"
                  variant="outline"
                  onPress={() => handleTestKey(provider.id)}
                  disabled={isBusy || !currentVal.trim()}
                  icon={
                    isBusy ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Ionicons name="flash-outline" size={14} color={colors.primary} />
                    )
                  }
                />

                {isConfigured ? (
                  <Button
                    label="Clear"
                    size="sm"
                    variant="ghost"
                    onPress={() => handleClearKey(provider.id)}
                  />
                ) : null}

                <PressableScale
                  onPress={() => Linking.openURL(provider.docsUrl)}
                  style={{ marginLeft: 'auto', paddingVertical: 6 }}
                >
                  <Text style={[typography.captionBold, { color: colors.primary }]}>
                    Get Key ↗
                  </Text>
                </PressableScale>
              </View>
            </Card>
          );
        })}

        {/* Security & Local-First Assurance */}
        <Card variant="surface1" style={{ marginTop: spacing.sm, padding: spacing.base }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.primary} />
            <Text style={[typography.subbodyBold, { color: colors.text.primary, marginLeft: 8 }]}>
              Zero-Cloud Privacy Guarantee
            </Text>
          </View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 6, lineHeight: 18 }]}>
            All API keys are encrypted locally inside MMKV hardware storage on your phone. They are never sent
            to Thrivefold servers, analytics, or third parties. Requests are made directly from your phone to the
            respective provider endpoint.
          </Text>
        </Card>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  modeCard: {
    padding: 16,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  modeOption: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 88,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  eyeBtn: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  testResultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  flex: {
    flex: 1,
  },
});
