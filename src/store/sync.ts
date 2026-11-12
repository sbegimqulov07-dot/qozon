import type { AppData } from '../engine/model'

export const SUPABASE_URL = 'https://fjpstjadsubpqklclmht.supabase.co'
export const SUPABASE_KEY = 'sb_publishable_a4uklp_pjj2eWaxq5fiAZQ_EoFbJ_sE'

async function rpc<T>(fn: string, body: Record<string, unknown>): Promise<T> {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST', headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!r.ok) { const t = await r.text(); throw new Error(t.slice(0, 200)) }
  return r.json()
}

export type Remote = { state: AppData; rev: number; updated_at: string } | null
export const loadRemote = (code: string) => rpc<Remote>('qozon_load', { p_code: code })
export const saveRemote = (code: string, state: AppData, baseRev: number) =>
  rpc<{ ok: boolean; conflict?: boolean; rev: number; state?: AppData }>('qozon_save', { p_code: code, p_state: state, p_base_rev: baseRev })
