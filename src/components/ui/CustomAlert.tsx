/**
 * Thrivefold Custom Alert Dialog
 * Serene, modal confirmation dialog adapted from Neev / Setu.
 */

import React from 'react';
import { Modal, Platform, StyleSheet, Text } from 'react-native';
import { BlurView } from 'expo-blur';

import { useRootStore } from '../../stores/useRootStore';
import { useTheme } from '../../theme/useTheme';
import { Button } from './Button';
import { PressableScale } from './PressableScale';
import { SquircleSurface } from './SquircleSurface';

export function CustomAlert() {
  const { colors, typography } = useTheme();
  const alert = useRootStore((s) => s.alert);
  const hideAlert = useRootStore((s) => s.hideAlert);

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
    <Modal
      transparent
      animationType="fade"
      visible={Boolean(alert)}
      onRequestClose={handleCancel}
    >
      <SquircleSurface style={styles.overlay}>
        <BlurView
          intensity={Platform.OS === 'ios' ? 25 : 10}
          tint="light"
          style={StyleSheet.absoluteFill}
        />
        <PressableScale
          style={StyleSheet.absoluteFill}
          scaleTo={1}
          onPress={handleCancel}
        />

        <SquircleSurface
          radius={24}
          smoothing={1}
          fill={colors.surface}
          strokeWidth={0}
          style={styles.dialog}
        >
          <SquircleSurface style={styles.content}>
            <Text style={[typography.subheading, styles.title, { color: colors.text.primary }]}>
              {alert.title}
            </Text>
            {alert.message ? (
              <Text
                style={[
                  typography.body,
                  styles.message,
                  { color: colors.text.secondary },
                ]}
              >
                {alert.message}
              </Text>
            ) : null}

            <SquircleSurface style={styles.actions}>
              {alert.cancelText !== null ? (
                <Button
                  label={alert.cancelText || 'Cancel'}
                  variant="outline"
                  size="sm"
                  style={styles.button}
                  onPress={handleCancel}
                />
              ) : null}
              <Button
                label={alert.confirmText || 'Confirm'}
                variant={alert.destructive ? 'danger' : 'primary'}
                size="sm"
                style={styles.button}
                onPress={handleConfirm}
              />
            </SquircleSurface>
          </SquircleSurface>
        </SquircleSurface>
      </SquircleSurface>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 25, 23, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    zIndex: 10,
  },
  content: {
    padding: 22,
  },
  title: {
    marginBottom: 8,
  },
  message: {
    marginBottom: 20,
    lineHeight: 21,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    minWidth: 92,
  },
});

export default CustomAlert;
