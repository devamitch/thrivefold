import React, { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppHeader } from './AppHeader';
import { Header, SanctuaryHeader, type HeaderProps } from './Header';
import { ScreenContainer } from './ScreenContainer';

export interface ScreenWrapperProps {
  children?: ReactNode;
  /** Custom pinned header node. */
  header?: ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  disableScrollAwareDock?: boolean;
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  showBack?: boolean;
  rightAction?: ReactNode;
  useLargeTitle?: boolean;
  footer?: ReactNode;
  /**
   * Optional full-bleed ambient background illustration (using ImageBackground).
   * Renders behind screen content with a calm, eye-friendly theme wash.
   */
  backgroundImage?: ImageSourcePropType | number | string;
  /** Opacity of the background tint wash (defaults to 0.92 for low-glare calm). */
  backgroundOverlayOpacity?: number;
  /** Optional blur radius for ultra-soft, low-glare ambient texture (e.g. 2..8). */
  backgroundBlurRadius?: number;
  /** Custom style for the background image. */
  backgroundImageStyle?: StyleProp<ImageStyle>;
}

const isHeaderElement = (node: ReactNode): node is ReactElement<HeaderProps> =>
  isValidElement(node) && (node.type === Header || node.type === SanctuaryHeader);

/** Removes horizontal padding: the shared screen column already provides the gutter. */
function withoutSidePadding(style: StyleProp<ViewStyle>): ViewStyle {
  const flat = { ...((StyleSheet.flatten(style) ?? {}) as ViewStyle) };
  if (flat.padding !== undefined) {
    flat.paddingVertical = flat.paddingVertical ?? flat.padding;
    delete flat.padding;
  }
  delete flat.paddingHorizontal;
  delete flat.paddingLeft;
  delete flat.paddingRight;
  delete flat.flex;
  return flat;
}

/**
 * Adapter that gives every older screen the shared ScreenContainer layout: a `<Header>`
 * child becomes the collapsing large-title header, a nested vertical ScrollView is unwrapped
 * into the single screen scroll (so the header collapses and the dock hides), and side
 * padding is normalised to the shared gutter.
 */
export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  header,
  scrollable = false,
  style,
  contentContainerStyle,
  disableScrollAwareDock = false,
  title,
  subtitle,
  eyebrow,
  showBack = false,
  rightAction,
  footer,
  backgroundImage,
  backgroundOverlayOpacity,
  backgroundBlurRadius,
  backgroundImageStyle,
}) => {
  let headerProps: HeaderProps | null = title ? { title, subtitle, eyebrow, showBack, rightAction } : null;
  const body: ReactNode[] = [];

  // The children are re-collected into an array, so each element needs a stable key (its own,
  // else its position); without one React warns on every render of every screen.
  Children.forEach(children, (child, index) => {
    const key = isValidElement(child) ? (child.key ?? `screen-child-${index}`) : undefined;
    if (!headerProps && isHeaderElement(child)) {
      headerProps = child.props;
      return;
    }
    if (isValidElement(child) && child.type === ScrollView && !(child.props as { horizontal?: boolean }).horizontal) {
      const props = child.props as { contentContainerStyle?: StyleProp<ViewStyle>; children?: ReactNode };
      body.push(
        <View key={key} style={withoutSidePadding(props.contentContainerStyle)}>
          {props.children}
        </View>,
      );
      return;
    }
    if (isValidElement(child) && child.type === View) {
      const props = child.props as { style?: StyleProp<ViewStyle>; children?: ReactNode };
      body.push(
        React.cloneElement(child as ReactElement<{ style?: StyleProp<ViewStyle> }>, {
          key,
          style: withoutSidePadding(props.style),
        }),
      );
      return;
    }
    body.push(isValidElement(child) ? React.cloneElement(child, { key }) : child);
  });

  const resolved = headerProps as HeaderProps | null;
  const appHeader = resolved ? (
    <AppHeader
      title={resolved.title}
      subtitle={resolved.subtitle}
      eyebrow={resolved.eyebrow}
      showBack={resolved.showBack}
      rightAction={resolved.rightAction}
    />
  ) : (
    header
  );

  return (
    <ScreenContainer
      header={appHeader}
      style={style}
      contentContainerStyle={contentContainerStyle}
      scrollMode={scrollable ? 'shell-scroll-view' : 'none'}
      autoHideTabBar={!disableScrollAwareDock}
      footer={footer}
      backgroundImage={backgroundImage}
      backgroundOverlayOpacity={backgroundOverlayOpacity}
      backgroundBlurRadius={backgroundBlurRadius}
      backgroundImageStyle={backgroundImageStyle}
    >
      {body}
    </ScreenContainer>
  );
};

export default ScreenWrapper;
