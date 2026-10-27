import { Linking } from 'react-native';
import {
  ecosystemSyncService,
  encodeEcosystemPayload,
  decodeEcosystemPayload,
  type UnifiedEcosystemData,
} from '../ecosystem/ecosystemSyncService';

const SETU_PACKAGE = 'com.amit.setu';
const SETU_PLAY_STORE_MARKET = `market://details?id=${SETU_PACKAGE}`;
const SETU_PLAY_STORE_WEB = `https://play.google.com/store/apps/details?id=${SETU_PACKAGE}`;
const SETU_SCHEME = 'setu://';

export interface SetuCallbackData {
  status: 'authorized' | 'cancelled' | 'error';
  userId?: string;
  displayName?: string;
  avatar?: string;
  token?: string;
  state?: string;
  ecosystemData?: Partial<UnifiedEcosystemData> | null;
  errorMessage?: string;
}

export const setuEcosystemService = {
  /**
   * Checks whether Setu app is installed on this device.
   */
  async isSetuInstalled(): Promise<boolean> {
    try {
      return await Linking.canOpenURL(SETU_SCHEME);
    } catch {
      return false;
    }
  },

  /**
   * Opens the Google Play Store to install Setu.
   */
  async openSetuDownload(): Promise<void> {
    try {
      const canMarket = await Linking.canOpenURL(SETU_PLAY_STORE_MARKET).catch(() => false);
      if (canMarket) {
        await Linking.openURL(SETU_PLAY_STORE_MARKET);
      } else {
        await Linking.openURL(SETU_PLAY_STORE_WEB);
      }
    } catch {
      await Linking.openURL(SETU_PLAY_STORE_WEB).catch(() => undefined);
    }
  },

  /**
   * Initiates Setu Single Sign-On and cross-app ecosystem sync.
   * Hands off current Thrivefold profile & health data to Setu.
   */
  async launchSetuConnect(): Promise<{
    ok: boolean;
    status: 'launched' | 'not_installed' | 'failed';
    state?: string;
  }> {
    const installed = await this.isSetuInstalled();
    if (!installed) {
      return { ok: false, status: 'not_installed' };
    }

    const state = `thrivefold_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const callbackUrl = 'thrivefold://auth/callback';

    // Pack current local state to share with Setu ecosystem
    const localPayload = ecosystemSyncService.buildLocalEcosystemPayload();
    const encodedPayload = encodeEcosystemPayload(localPayload);

    const params = new URLSearchParams({
      app_id: 'com.amit.thrivefold',
      app_name: 'Thrivefold',
      callback_url: callbackUrl,
      state,
      scopes: 'identity,p2p,ecosystem',
      ecosystem_data: encodedPayload,
    });

    const ssoUrl = `setu://sso?${params.toString()}`;

    try {
      await Linking.openURL(ssoUrl);
      return { ok: true, status: 'launched', state };
    } catch {
      return { ok: false, status: 'failed' };
    }
  },

  /**
   * Parses the redirect URL received from Setu SSO and extracts ecosystem data.
   */
  parseCallbackUrl(url: string): SetuCallbackData {
    try {
      const normalized = url.replace(/^thrivefold:\/\//, 'http://thrivefold.local/');
      const parsed = new URL(normalized);
      const params = parsed.searchParams;

      const status = (params.get('status') as SetuCallbackData['status']) || 'error';
      const rawEco = params.get('ecosystem_data');
      const ecosystemData = rawEco ? decodeEcosystemPayload(rawEco) : null;

      return {
        status,
        userId: params.get('user_id') || undefined,
        displayName: params.get('display_name') || undefined,
        avatar: params.get('avatar') || undefined,
        token: params.get('token') || undefined,
        state: params.get('state') || undefined,
        ecosystemData,
        errorMessage: params.get('error_message') || undefined,
      };
    } catch {
      return { status: 'error', errorMessage: 'Malformed callback URL' };
    }
  },
};
