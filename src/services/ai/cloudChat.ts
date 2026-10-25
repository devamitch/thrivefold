import { supabase } from '../supabase/supabaseClient';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Asks the optional cloud companion. The request goes to Thrivefold's own server function,
 * which holds the provider keys, caps daily use and stores no message content.
 */
export async function askThrive(turns: ChatTurn[]): Promise<{ reply: string; remaining: number }> {
  if (!supabase) throw new Error('not_configured');
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) throw new Error('not_authenticated');
  const { data, error } = await supabase.functions.invoke('ai-chat', { body: { messages: turns.slice(-12) } });
  if (error) {
    const ctx = (error as { context?: Response }).context;
    let code = '';
    try {
      code = ctx ? ((await ctx.json()) as { error?: string }).error ?? '' : '';
    } catch {
      // not JSON
    }
    throw new Error(code || error.message);
  }
  return data as { reply: string; remaining: number };
}

export function aiErrorText(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e);
  if (m.includes('not_authenticated')) return 'Sign in to talk with Thrive.';
  if (m.includes('daily_limit')) return 'That’s today’s limit for the AI companion. It resets tomorrow.';
  if (m.includes('unavailable')) return 'The AI companion is busy right now. Try again in a minute.';
  if (m.includes('not_configured')) return 'The AI companion needs the Thrivefold server.';
  return 'Couldn’t reach the AI companion. Check your connection and try again.';
}
