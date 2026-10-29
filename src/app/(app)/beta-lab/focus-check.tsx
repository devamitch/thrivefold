import { Redirect, type Href } from 'expo-router';
import React from 'react';

/** The focus self-check lives in You; old links land there. */
export default function FocusCheckRedirect() {
  return <Redirect href={'/(app)/you/adhd-screener' as Href} />;
}
