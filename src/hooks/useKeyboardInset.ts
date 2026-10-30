import { useEffect, useState } from 'react';
import { Dimensions, Keyboard, Platform } from 'react-native';

/**
 * How much of the bottom of the screen the keyboard covers, in dp (0 when it is closed).
 *
 * Android is edge-to-edge, so windows no longer resize for the keyboard; screens shrink their
 * own content by this amount instead. The keyboard's top edge is used rather than
 * `endCoordinates.height`, which over-reports by the navigation-bar inset on Android
 * (measured on the Moto G71).
 */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);
  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const a = Keyboard.addListener(showEvt, (e) =>
      setInset(Math.max(0, Dimensions.get('screen').height - e.endCoordinates.screenY)),
    );
    const b = Keyboard.addListener(hideEvt, () => setInset(0));
    return () => {
      a.remove();
      b.remove();
    };
  }, []);
  return inset;
}
