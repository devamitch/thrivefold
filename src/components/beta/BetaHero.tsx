import { Image, type ImageSource } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';

/** A wide illustration at the top of a beta screen, with rounded corners and a fixed ratio. */
export function BetaHero({ source, label }: { source: ImageSource | number; label: string }) {
  return (
    <View style={styles.wrap}>
      <Image source={source} style={styles.img} contentFit="cover" accessibilityLabel={label} transition={200} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 22, overflow: 'hidden', marginTop: 8, marginBottom: 12, aspectRatio: 16 / 7, width: '100%' },
  img: { width: '100%', height: '100%' },
});
