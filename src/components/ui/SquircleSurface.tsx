/**
 * Rounded surface. Every style key you pass (padding, gap, flex, alignment, size) lands on the
 * one view it renders, so it lays out exactly like a `View`.
 *
 * How it draws, chosen by shape and radius only (never by fill, so a chip whose fill toggles on
 * selection keeps the same view and nothing remounts):
 *
 * - iOS: a plain View with `borderCurve: 'continuous'`, the system squircle. No extra views.
 * - Android, painted squircle with radius >= 18: the native squircle view
 *   (modules/setu-squircle). Large cards are where the smoothed corner is visible.
 * - Everything else (pills, circles, small radii, unpainted boxes): a plain rounded View.
 *   Native views cannot be flattened by Fabric; using them for every chip made the view tree so
 *   deep that the Android RenderThread overflowed its stack and the app crashed.
 */
import { requireNativeView } from 'expo';
import React, { memo, type ComponentType, type ReactNode } from 'react';
import {
  Platform,
  processColor,
  StyleSheet,
  UIManager,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

export type SquircleShape = 'squircle' | 'rounded' | 'pill' | 'circle';

/** Below this radius a squircle and a rounded rect are indistinguishable on screen. */
const NATIVE_MIN_RADIUS = 18;
/**
 * The native squircle redraws its path on every frame of a scroll; measured on a Moto G71
 * (release) plain rounded views scroll noticeably smoother. Off until it is optimised.
 */
const USE_NATIVE_SQUIRCLE = false;

type NativeSquircleProps = ViewProps & {
  squircleBackgroundColor?: number | null;
  squircleBorderColor?: number | null;
  squircleBorderWidth?: number | null;
  squircleRadius?: number | null;
  cornerSmoothing?: number | null;
  shape?: SquircleShape | null;
  clipContent?: boolean | null;
  glassEnabled?: boolean | null;
  ref?: any;
};

let NativeSquircleView: ComponentType<NativeSquircleProps> | null = null;
if (Platform.OS === 'android' && USE_NATIVE_SQUIRCLE) {
  try {
    const hasViewManager =
      typeof UIManager.getViewManagerConfig === 'function'
        ? Boolean(UIManager.getViewManagerConfig('ExpoSquircleView'))
        : Boolean((UIManager as any)?.ExpoSquircleView);
    if (hasViewManager) {
      NativeSquircleView = requireNativeView<NativeSquircleProps>('ExpoSquircleView');
    }
  } catch {
    NativeSquircleView = null;
  }
}

export interface SquircleSurfaceProps extends ViewProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  smoothing?: number;
  /** Overrides `style.backgroundColor`. */
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  shape?: SquircleShape;
  /**
   * Clip children to the corners. Plain views clip when painted (cheap outline clipping); the
   * native squircle clips only when this is set explicitly, since a path clip on every card
   * is expensive to redraw while scrolling.
   */
  clipContent?: boolean;
  ref?: React.Ref<View>;
}

export const SquircleSurface = memo(function SquircleSurface({
  children,
  style,
  radius: radiusProp,
  smoothing = 1,
  fill,
  stroke,
  strokeWidth = 1,
  shape = 'squircle',
  clipContent,
  ref,
  ...rest
}: SquircleSurfaceProps) {
  const flat = (StyleSheet.flatten(style) ?? {}) as ViewStyle;

  const paint =
    fill ?? (typeof flat.backgroundColor === 'string' ? flat.backgroundColor : undefined);
  const painted = (paint !== undefined && paint !== 'transparent') || Boolean(stroke);
  const edge = stroke ? strokeWidth : 0;
  const round = shape === 'pill' || shape === 'circle';

  const hasSpecificCorners =
    radiusProp === undefined &&
    flat.borderRadius === undefined &&
    (typeof flat.borderTopLeftRadius === 'number' ||
      typeof flat.borderTopRightRadius === 'number' ||
      typeof flat.borderBottomLeftRadius === 'number' ||
      typeof flat.borderBottomRightRadius === 'number');

  // An explicit radius wins, then the style's borderRadius, else square corners.
  const radius = round
    ? 9999
    : (radiusProp ?? (typeof flat.borderRadius === 'number' ? flat.borderRadius : 0));
  const hasAnyRadius = radius > 0 || hasSpecificCorners;
  const clip = (clipContent ?? true) && painted && hasAnyRadius && flat.overflow !== 'visible';

  if (NativeSquircleView && shape === 'squircle' && radius >= NATIVE_MIN_RADIUS && painted && !hasSpecificCorners) {
    return (
      <NativeSquircleView
        {...rest}
        ref={ref as any}
        squircleBackgroundColor={paint ? (processColor(paint) as number | null) : null}
        squircleBorderColor={stroke ? (processColor(stroke) as number | null) : null}
        squircleBorderWidth={edge}
        squircleRadius={radius}
        cornerSmoothing={Math.round(smoothing * 100)}
        shape={shape}
        // The module's "glass" (gradient light, sweep-gradient rims) redraws every frame and
        // drew border lines on every card: off. Path clipping only when asked for.
        glassEnabled={false}
        clipContent={clipContent === true && clip}
        style={[flat, styles.clear]}
      >
        {children}
      </NativeSquircleView>
    );
  }

  // Square and unpainted: a layout box. Pass the style through untouched so Fabric can flatten it.
  if (!hasAnyRadius && !fill && !stroke) {
    return (
      <View {...rest} ref={ref} style={style}>
        {children}
      </View>
    );
  }

  const radiusStyle = hasSpecificCorners
    ? {
        borderTopLeftRadius: flat.borderTopLeftRadius,
        borderTopRightRadius: flat.borderTopRightRadius,
        borderBottomLeftRadius: flat.borderBottomLeftRadius,
        borderBottomRightRadius: flat.borderBottomRightRadius,
      }
    : { borderRadius: radius };

  return (
    <View
      {...rest}
      ref={ref}
      style={[
        flat,
        {
          backgroundColor: paint,
          ...radiusStyle,
          borderCurve: 'continuous',
          borderWidth: edge || flat.borderWidth,
          borderColor: stroke ?? flat.borderColor,
        },
        clip ? styles.clip : null,
      ]}
    >
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  // The native squircle paints the fill and edge; the view itself must never draw a rectangle.
  clear: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
  },
  clip: {
    overflow: 'hidden',
  },
});

export default SquircleSurface;
