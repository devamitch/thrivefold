/**
 * Unified Vault SOS Service — Cross-App Peer Mesh Protocol
 *
 * Enables ANY ecosystem app (Setu, Thrivefold, HarmonyBloom, Neev, BlinkQuest)
 * to connect directly with ANY other installed app with complete data access.
 * If Setu is not installed, any sibling app serves as the Unified Vault Provider.
 * If no local peer is installed, falls back to Supabase cloud sync when online.
 */

import { Linking } from 'react-native';
import {
  ecosystemSyncService,
  encodeEcosystemPayload,
  decodeEcosystemPayload,
  type UnifiedVaultSosData,
} from '../ecosystem/ecosystemSyncService';

export interface PeerEcosystemApp {
  id: string;
  name: string;
  scheme: string;
  packageName: string;
}

export const ECOSYSTEM_PEERS: PeerEcosystemApp[] = [
  { id: 'setu', name: 'Setu Vault', scheme: 'setu://', packageName: 'com.amit.setu' },
  { id: 'thrivefold', name: 'Thrivefold', scheme: 'thrivefold://', packageName: 'com.amit.thrivefold' },
  { id: 'harmonybloom', name: 'HarmonyBloom', scheme: 'harmonybloom://', packageName: 'com.amit.harmonybloom' },
  { id: 'neev', name: 'Neev Sanctuary', scheme: 'neev://', packageName: 'com.amit.neev' },
  { id: 'blinkquest', name: 'BlinkQuest', scheme: 'blinkquest://', packageName: 'com.amit.blinkquest' },
];

const MY_APP_ID = 'com.amit.thrivefold';
const MY_APP_NAME = 'Thrivefold';
const MY_SCHEME = 'thrivefold://';
const SUPABASE_BACKEND_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://kwrdugillyakxgvgbrsu.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_KEY ||
  '';

export interface UnifiedVaultResult {
  ok: boolean;
  status: 'launched' | 'cloud_synced' | 'not_installed' | 'failed';
  providerName?: string;
  state?: string;
}

export const unifiedVaultSosService = {
  /**
   * Discovers all installed ecosystem peer apps on this device.
   */
  async getInstalledPeers(): Promise<Array<PeerEcosystemApp & { installed: boolean }>> {
    const peers = ECOSYSTEM_PEERS.filter((p) => p.id !== 'thrivefold');
    const checked = await Promise.all(
      peers.map(async (peer) => {
        let installed = false;
        try {
          installed = await Linking.canOpenURL(peer.scheme).catch(() => false);
        } catch {
          installed = false;
        }
        return { ...peer, installed };
      })
    );
    return checked;
  },

  /**
   * Finds the best available installed peer app to act as the Unified Vault SOS Provider.
   */
  async findBestAvailableProvider(): Promise<PeerEcosystemApp | null> {
    const peers = await this.getInstalledPeers();
    // Prefer Setu if installed; otherwise first available sibling
    const setu = peers.find((p) => p.id === 'setu' && p.installed);
    if (setu) return setu;
    const sibling = peers.find((p) => p.installed);
    return sibling || null;
  },

  /**
   * Initiates Unified Vault SOS login / connection with complete data access.
   * If a local peer is found, deep links into it.
   * If no local peer is found, attempts direct Supabase cloud vault pull.
   */
  async launchUnifiedVaultSos(preferredTargetId?: string): Promise<UnifiedVaultResult> {
    const state = `sos_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const callbackUrl = `${MY_SCHEME}unified-vault/callback`;

    // 1. Pack current local Thrivefold state
    const localData = ecosystemSyncService.buildLocalEcosystemPayload();
    const encodedPayload = encodeEcosystemPayload(localData);

    // 2. Discover target peer app
    let targetProvider: PeerEcosystemApp | null = null;
    if (preferredTargetId) {
      targetProvider = ECOSYSTEM_PEERS.find((p) => p.id === preferredTargetId) || null;
    } else {
      targetProvider = await this.findBestAvailableProvider();
    }

    // 3. If local peer app exists, launch peer handoff
    if (targetProvider) {
      const url =
        targetProvider.id === 'setu'
          ? `${targetProvider.scheme}sso?app_id=${MY_APP_ID}&app_name=${encodeURIComponent(
              MY_APP_NAME
            )}&callback_url=${encodeURIComponent(callbackUrl)}&state=${state}&ecosystem_data=${encodedPayload}`
          : `${targetProvider.scheme}unified-vault?client_app=${MY_APP_ID}&client_name=${encodeURIComponent(
              MY_APP_NAME
            )}&callback_url=${encodeURIComponent(callbackUrl)}&state=${state}&payload=${encodedPayload}`;

      try {
        await Linking.openURL(url);
        return {
          ok: true,
          status: 'launched',
          providerName: targetProvider.name,
          state,
        };
      } catch {
        // Fall back to cloud attempt
      }
    }

    // 4. If no peer app is installed, attempt online cloud sync from Supabase backend
    const cloudSuccess = await this.pullFromCloudBackend(localData.identity.userId);
    if (cloudSuccess) {
      return {
        ok: true,
        status: 'cloud_synced',
        providerName: 'Unified Cloud Vault',
      };
    }

    return {
      ok: false,
      status: 'not_installed',
    };
  },

  /**
   * Responds to an incoming Unified Vault request from a sibling app (acting as Vault Provider).
   * Unifies incoming client data with Thrivefold's local store non-destructively,
   * then redirects back to the calling client with full unified data.
   */
  async handleIncomingVaultRequest(url: string): Promise<boolean> {
    try {
      const normalized = url.replace(/^[a-z]+:\/\//, 'http://unified-vault.local/');
      const parsed = new URL(normalized);
      const params = parsed.searchParams;

      const callbackUrl = params.get('callback_url');
      const state = params.get('state') || '';
      const rawPayload = params.get('payload') || params.get('ecosystem_data');

      if (!callbackUrl) return false;

      let unified = ecosystemSyncService.buildLocalEcosystemPayload();
      if (rawPayload) {
        const incoming = decodeEcosystemPayload(rawPayload);
        if (incoming) {
          unified = ecosystemSyncService.hydrateStoreFromEcosystem(incoming);
        }
      }

      const delimiter = callbackUrl.includes('?') ? '&' : '?';
      const redirectParams = new URLSearchParams({
        status: 'authorized',
        state,
        payload: encodeEcosystemPayload(unified),
        ecosystem_data: encodeEcosystemPayload(unified),
      });

      const finalRedirect = `${callbackUrl}${delimiter}${redirectParams.toString()}`;
      await Linking.openURL(finalRedirect).catch(() => undefined);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Parses the redirect response received from Unified Vault SOS and hydrates the local store.
   */
  handleIncomingVaultCallback(url: string): boolean {
    try {
      const normalized = url.replace(/^[a-z]+:\/\//, 'http://unified-vault.local/');
      const parsed = new URL(normalized);
      const params = parsed.searchParams;

      const status = params.get('status');
      if (status !== 'authorized') return false;

      const rawPayload = params.get('payload') || params.get('ecosystem_data');
      if (!rawPayload) return false;

      const decoded = decodeEcosystemPayload(rawPayload);
      if (decoded) {
        ecosystemSyncService.hydrateStoreFromEcosystem(decoded);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  /**
   * Pulls latest unified vault data from Supabase backend when online.
   */
  async pullFromCloudBackend(userId: string): Promise<boolean> {
    try {
      if (!SUPABASE_ANON_KEY) return false;

      const response = await fetch(
        `${SUPABASE_BACKEND_URL}/rest/v1/unified_vault_sos?user_id=eq.${encodeURIComponent(
          userId
        )}&select=*`,
        {
          method: 'GET',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      ).catch(() => null);

      if (!response || !response.ok) return false;
      const records = (await response.json()) as Array<{ vault_data: Partial<UnifiedVaultSosData> }>;
      if (Array.isArray(records) && records.length > 0 && records[0].vault_data) {
        ecosystemSyncService.hydrateStoreFromEcosystem(records[0].vault_data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  /**
   * Opens Google Play Store for Setu download.
   */
  async openSetuDownload(): Promise<void> {
    const market = 'market://details?id=com.amit.setu';
    const web = 'https://play.google.com/store/apps/details?id=com.amit.setu';
    const can = await Linking.canOpenURL(market).catch(() => false);
    if (can) {
      await Linking.openURL(market).catch(() => undefined);
    } else {
      await Linking.openURL(web).catch(() => undefined);
    }
  },
};
