/**
 * Squircle-shaped surface matching Neev's exact architecture.
 *
 * It is ONE plain View. The squircle is painted behind the children (Skia-free SVG path, or the
 * native Android view from modules/setu-squircle), and every style key you pass - padding, gap,
 * alignItems, justifyContent, flexDirection, minHeight, width, height, flex - lands on that same View,
 * so layout behaves exactly like a normal `View`.
 */
import { requireNativeView } from 'expo';
import React, {
  memo,
  useCallback,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
import {
  Platform,
  processColor,
  StyleSheet,
  UIManager,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { squirclePath, squircleRadius } from '../../theme/squirclePath';
import { useTheme } from '../../theme/useTheme';

export type SquircleShape = 'squircle' | 'rounded' | 'pill' | 'circle';

type NativeSquircleProps = ViewProps & {
  squircleBackgroundColor?: number | null;
  squircleBorderColor?: number | null;
  squircleHighlightColor?: number | null;
  squircleAccentColor?: number | null;
  squircleBorderWidth?: number | null;
  squircleRadius?: number | null;
  topLeftRadius?: number | null;
  topRightRadius?: number | null;
  bottomRightRadius?: number | null;
  bottomLeftRadius?: number | null;
  cornerSmoothing?: number | null;
  preserveSmoothing?: boolean | null;
  shape?: SquircleShape | null;
  clipContent?: boolean | null;
  ref?: any;
};

let NativeSquircleView: ComponentType<NativeSquircleProps> | null = null;
if (Platform.OS === 'android') {
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
  /** Overrides `style.backgroundColor`. Falls back to the theme surface colour. */
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  shape?: SquircleShape;
  /** Clips children to the corner radius. Ignored when `style.overflow` is 'visible'. */
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
  clipContent = true,
  onLayout,
  ref,
  ...rest
}: SquircleSurfaceProps) {
  const { colors } = useTheme();
  const [size, setSize] = useState({ width: 0, height: 0 });

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout;
      setSize((prev) =>
        prev.width === width && prev.height === height ? prev : { width, height },
      );
      onLayout?.(e);
    },
    [onLayout],
  );

  const flat = useMemo(() => (StyleSheet.flatten(style) ?? {}) as ViewStyle, [style]);

  const paint =
    fill ??
    (typeof flat.backgroundColor === 'string' ? flat.backgroundColor : undefined) ??
    'transparent';
  const edge = stroke ? strokeWidth : 0;
  const painted = paint !== 'transparent' || edge > 0;
  // Only clip when something is painted; a transparent rounded box (an unselected chip) must
  // not start cutting off its children.
  const clip = clipContent && painted && flat.overflow !== 'visible';

  // An explicit radius wins; otherwise the style's own borderRadius; otherwise square. A View
  // swapped for a SquircleSurface therefore keeps exactly the corners it had.
  const radius = radiusProp ?? (typeof flat.borderRadius === 'number' ? flat.borderRadius : 0);
  const effectiveRadius = squircleRadius(shape, radius, size.width || 100, size.height || 100);

  // Inset by half the stroke so the line sits fully inside the box instead of being clipped.
  const path = useMemo(
    () =>
      size.width > 0 && size.height > 0
        ? squirclePath({
            width: Math.max(0, size.width - edge),
            height: Math.max(0, size.height - edge),
            radius: Math.max(0, effectiveRadius - edge / 2),
            smoothing: shape === 'rounded' ? 0 : smoothing,
          })
        : '',
    [edge, effectiveRadius, shape, size.height, size.width, smoothing],
  );

  const drawn = Boolean(path);
  // Decided by shape alone, never by the fill: a chip whose fill toggles on selection must keep
  // the same component tree, otherwise every toggle remounts its children (flicker, lost
  // animations, re-measured text).
  const hasVisual = radius > 0 || shape !== 'squircle';
  const viewStyle = useMemo(
    () => [
      flat,
      hasVisual
        ? drawn
          ? styles.clear
          : {
              // Before the first layout: an ordinary rounded box, so nothing flashes square.
              backgroundColor: paint,
              borderColor: stroke,
              borderWidth: edge,
              borderRadius: shape === 'circle' || shape === 'pill' ? 9999 : radius,
            }
        : null,
      clip ? { borderRadius: effectiveRadius, overflow: 'hidden' as const } : null,
    ],
    [clip, drawn, edge, effectiveRadius, flat, hasVisual, paint, radius, shape, stroke],
  );

  // Square corners: behave exactly like a plain View (a fill still applies). No layout
  // tracking, no extra render and no clip, so a SquircleSurface used for layout costs nothing.
  if (!hasVisual) {
    return (
      <View {...rest} onLayout={onLayout} style={fill ? [style, { backgroundColor: fill }] : style}>
        {children}
      </View>
    );
  }

  // Hardware-accelerated clipping when the native Android view is available.
  if (NativeSquircleView) {
    return (
      <NativeSquircleView
        {...rest}
        ref={ref as any}
        onLayout={handleLayout}
        squircleBackgroundColor={
          paint !== 'transparent' ? (processColor(paint) as number | null) : null
        }
        squircleBorderColor={stroke ? (processColor(stroke) as number | null) : null}
        squircleBorderWidth={edge}
        squircleRadius={effectiveRadius}
        cornerSmoothing={Math.round(smoothing * 100)}
        shape={shape}
        clipContent={clip}
        style={[flat, hasVisual ? styles.clear : null]}
      >
        {children}
      </NativeSquircleView>
    );
  }

  return (
    <View {...rest} ref={ref} onLayout={handleLayout} style={viewStyle}>
      {path && painted ? (
        <Svg
          pointerEvents="none"
          width={size.width}
          height={size.height}
          style={StyleSheet.absoluteFill}
        >
          <G transform={`translate(${edge / 2}, ${edge / 2})`}>
            <Path d={path} fill={paint} stroke={stroke} strokeWidth={edge} />
          </G>
        </Svg>
      ) : null}
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  // The squircle paints the fill and edge; the View itself must never draw a rectangle.
  clear: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
});

export default SquircleSurface;
