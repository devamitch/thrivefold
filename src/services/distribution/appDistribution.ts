import { Linking, Platform, Share } from 'react-native';

export interface AppDistributionConfig {
  appId: string;
  appName: string;
  tagline: string;
  playStoreUrl: string;
  betaOptInUrl: string;
}

export const THRIVEFOLD_DISTRIBUTION: AppDistributionConfig = {
  appId: 'com.amit.thrivefold',
  appName: 'Thrivefold',
  tagline: 'A calm, local-first sanctuary for your biological rhythm, daily check-ins, and holistic health.',
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.amit.thrivefold',
  betaOptInUrl: 'https://play.google.com/apps/testing/com.amit.thrivefold',
};

/**
 * Invokes native Android Sharesheet with app invitation link.
 * Does not expose raw text URL in the UI.
 */
export async function shareApp(config: AppDistributionConfig = THRIVEFOLD_DISTRIBUTION): Promise<boolean> {
  try {
    const result = await Share.share(
      {
        title: `Share ${config.appName}`,
        message: `Try ${config.appName} — ${config.tagline}\n\nDownload: ${config.playStoreUrl}`,
        url: Platform.OS === 'ios' ? config.playStoreUrl : undefined,
      },
      {
        dialogTitle: `Share ${config.appName}`,
      }
    );
    return result.action === Share.sharedAction;
  } catch {
    return false;
  }
}

/**
 * Opens Google Play Beta Testing opt-in page with fallback to Play Store.
 */
export async function joinAsBetaTester(config: AppDistributionConfig = THRIVEFOLD_DISTRIBUTION): Promise<boolean> {
  try {
    const supported = await Linking.canOpenURL(config.betaOptInUrl);
    if (supported) {
      await Linking.openURL(config.betaOptInUrl);
      return true;
    }
    await Linking.openURL(config.playStoreUrl);
    return true;
  } catch {
    try {
      await Linking.openURL(config.playStoreUrl);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Invokes native Android Sharesheet with beta invitation link.
 */
export async function shareBetaInvite(config: AppDistributionConfig = THRIVEFOLD_DISTRIBUTION): Promise<boolean> {
  try {
    const result = await Share.share(
      {
        title: `Join ${config.appName} Beta`,
        message: `Be an early tester for ${config.appName}! Join our private testing track on Google Play: ${config.betaOptInUrl}`,
        url: Platform.OS === 'ios' ? config.betaOptInUrl : undefined,
      },
      {
        dialogTitle: `Invite to ${config.appName} Beta`,
      }
    );
    return result.action === Share.sharedAction;
  } catch {
    return false;
  }
}
