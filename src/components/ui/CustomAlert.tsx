/**
 * Thrivefold Custom Alert Dialog
 * Serene, modal confirmation dialog adapted from Neev / Setu. The dialog scales in from 0.94 like
 * an iOS alert; the backdrop is a scrim (a blur inside a Modal is pixelated on Android).
 */

import { BlurView } from 'expo-blur';
import React, { useEffect } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { SquircleSurface } from './SquircleSurface';

const IN = { duration: 260, easing: Easing.bezier(0.2, 0.9, 0.25, 1) };

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
    transform: [{ scale: 0.94 + shown.value * 0.06 }],
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

  return (
    <Modal transparent animationType="none" statusBarTranslucent visible onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }, backdropStyle]}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={16} tint="systemUltraThinMaterialDark" style={StyleSheet.absoluteFill} />
          ) : null}
          <Pressable style={StyleSheet.absoluteFill} onPress={handleCancel} accessibilityLabel="Dismiss" />
        </Animated.View>

        <Animated.View style={[styles.dialog, dialogStyle]} accessibilityViewIsModal accessibilityRole="alert">
          <SquircleSurface radius={26} fill={colors.surface} style={styles.content}>
            <Text style={[typography.subheading, styles.title, { color: colors.text.primary }]}>{alert.title}</Text>
            {alert.message ? (
              <Text style={[typography.body, styles.message, { color: colors.text.secondary }]}>{alert.message}</Text>
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
          </SquircleSurface>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    maxWidth: 360,
    width: '100%',
  },
  content: {
    padding: 22,
  },
  title: {
    marginBottom: 8,
  },
  message: {
    lineHeight: 21,
    marginBottom: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
  },
});

export default CustomAlert;
