/**
 * Real workout gear for gems: stock and requests live on the Thrivefold server (owner fulfils by
 * hand). Network through TanStack Query. Gems are spent on the phone only after the server has
 * accepted the request (stock taken), so a failed request never costs anything.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '../supabase/supabaseClient';

export interface GearRequest {
  itemId: string;
  gems: number;
  fullName: string;
  phone: string;
  address: string;
}

export function useGearStock() {
  return useQuery({
    queryKey: ['gear-stock'],
    enabled: !!supabase,
    queryFn: async () => {
      const { data, error } = await supabase!.from('thrivefold_gear_stock').select('item_id, remaining');
      if (error) throw new Error(error.message);
      return Object.fromEntries((data ?? []).map((r: { item_id: string; remaining: number }) => [r.item_id, r.remaining])) as Record<string, number>;
    },
    staleTime: 60_000,
  });
}

export function useMyGearRequests() {
  return useQuery({
    queryKey: ['gear-requests'],
    enabled: !!supabase,
    queryFn: async () => {
      const { data, error } = await supabase!
        .from('thrivefold_gear_requests')
        .select('id, item_id, status, created_at')
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as { id: string; item_id: string; status: string; created_at: string }[];
    },
  });
}

export function useRequestGear() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (r: GearRequest) => {
      if (!supabase) throw new Error('Real rewards need the Thrivefold server.');
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Sign in to request real gear, so we can deliver it to you.');
      const { error } = await supabase.from('thrivefold_gear_requests').insert({
        item_id: r.itemId,
        gems: r.gems,
        full_name: r.fullName.trim(),
        phone: r.phone.trim(),
        address: r.address.trim(),
      });
      if (error) {
        if (/out_of_stock/.test(error.message)) throw new Error('This item is out of stock right now.');
        if (/duplicate|unique/i.test(error.message)) throw new Error('You already have an open request for this item.');
        throw new Error('Could not send the request. Check your details and connection.');
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['gear-stock'] });
      void qc.invalidateQueries({ queryKey: ['gear-requests'] });
    },
  });
}
