/**
 * Thrivefold Custom Alert Dialog
 * Serene, modal confirmation dialog adapted from Neev / Setu. The dialog scales in from 0.94 like
 * an iOS alert; the backdrop is a scrim (a blur inside a Modal is pixelated on Android).
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { Button } from './Button';
import FrostedView from './FrostedView';

const IN = { duration: 240, easing: Easing.bezier(0.16, 1, 0.3, 1) };

export function CustomAlert() {
  const { colors, typography } = useTheme();
  const alert = useRootStore((s) => s.alert);
  const hideAlert = useRootStore((s) => s.hideAlert);
  const reduceMotion = useReducedMotion();
  const shown = useSharedValue(0);

  useEffect(() => {
    if (alert) {
      shown.value = 0;
      shown.value = withTiming(1, reduceMotion ? { duration: 0 } : IN);
    }
  }, [alert, reduceMotion, shown]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: shown.value }));
  const dialogStyle = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ scale: 0.92 + shown.value * 0.08 }],
  }));

  if (!alert) return null;

  const handleConfirm = () => {
    alert.onConfirm?.();
    hideAlert();
  };

  const handleCancel = () => {
    alert.onCancel?.();
    hideAlert();
  };

  const iconName: keyof typeof Ionicons.glyphMap = alert.destructive
    ? 'trash-outline'
    : alert.title.toLowerCase().includes('workout') || alert.title.toLowerCase().includes('end')
      ? 'flag-outline'
      : 'information-circle-outline';

  const iconColor = alert.destructive ? colors.error : colors.primary;
  const iconBg = alert.destructive ? colors.error + '18' : colors.primaryAlpha;

  return (
    <Modal
      transparent
      animationType="none"
      statusBarTranslucent
      visible
      onRequestClose={handleCancel}
    >
      <GestureHandlerRootView style={styles.ghRoot}>
        <View style={styles.overlay}>
          <Animated.View
            style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }, backdropStyle]}
          >
            <FrostedView
              tone="dark"
              tintOpacity={0.5}
              intensity={35}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />

            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={handleCancel}
              accessibilityLabel="Dismiss"
            />
          </Animated.View>

          <Animated.View
            style={[styles.dialog, dialogStyle]}
            accessibilityViewIsModal
            accessibilityRole="alert"
          >
            <FrostedView
              tone="surface"
              intensity={95}
              tintOpacity={Platform.OS === 'android' ? 0.92 : 0.82}
              style={[
                styles.content,
                {
                  borderRadius: 28,
                  borderColor: colors.border,
                  borderWidth: StyleSheet.hairlineWidth,
                },
              ]}
            >
              {/* Header Icon Badge */}
              <View style={[styles.iconBadge, { backgroundColor: iconBg }]}>
                <Ionicons name={iconName} size={24} color={iconColor} />
              </View>

              <Text style={[typography.subheading, styles.title, { color: colors.text.primary }]}>
                {alert.title}
              </Text>

              {alert.message ? (
                <Text style={[typography.body, styles.message, { color: colors.text.secondary }]}>
                  {alert.message}
                </Text>
              ) : null}

              <View style={styles.actions}>
                {alert.cancelText !== null ? (
                  <Button
                    label={alert.cancelText || 'Cancel'}
                    variant="secondary"
                    style={styles.button}
                    onPress={handleCancel}
                  />
                ) : null}
                <Button
                  label={alert.confirmText || 'Confirm'}
                  variant={alert.destructive ? 'danger' : 'primary'}
                  style={styles.button}
                  onPress={handleConfirm}
                />
              </View>
            </FrostedView>
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Android gives a Modal its own window; gestures there need their own root.
  ghRoot: { flex: 1 },
  overlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    maxWidth: 340,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 12,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
  },
  iconBadge: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginBottom: 14,
    width: 48,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  button: {
    flex: 1,
  },
});

export default CustomAlert;
