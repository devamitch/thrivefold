import { Image, type ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme/useTheme';
import { ImageViewer, type ViewerOrigin } from '../ui/ImageViewer';
import { PressableScale } from '../ui/PressableScale';

/**
 * A wide illustration at the top of a beta screen: rounded, fixed ratio, a soft fade into the
 * page at the bottom, and a tap to see it full screen (grows from the card).
 */
export function BetaHero({ source, label }: { source: ImageSource | number; label: string }) {
  const { colors } = useTheme();
  const ref = useRef<View | null>(null);
  const [origin, setOrigin] = useState<ViewerOrigin | null>(null);

  return (
    <>
      <PressableScale
        ref={ref}
        scaleTo={0.985}
        onPress={() => ref.current?.measureInWindow((x, y, width, height) => setOrigin({ x, y, width, height }))}
        accessibilityRole="imagebutton"
        accessibilityLabel={`${label}. Open the picture full screen`}
        style={styles.wrap}
      >
        <Image source={source} style={styles.img} contentFit="cover" transition={200} accessibilityIgnoresInvertColors />
        <LinearGradient
          pointerEvents="none"
          colors={['transparent', colors.background]}
          locations={[0.55, 1]}
          style={StyleSheet.absoluteFill}
          // Barely-there fade so the picture settles into the page instead of ending in a hard edge.
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1.6 }}
        />
      </PressableScale>
      <ImageViewer source={origin ? source : null} origin={origin} caption={label} onClose={() => setOrigin(null)} />
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 22, overflow: 'hidden', marginTop: 8, marginBottom: 12, aspectRatio: 16 / 8, width: '100%' },
  img: { width: '100%', height: '100%' },
});
