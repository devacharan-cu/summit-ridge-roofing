/**
 * Server-only Whop API client (thin fetch wrapper, no SDK needed on Workers).
 * Hosted runtime: set the WHOP_SERVER_KEY app secret (a company API key).
 * `whop apps dev` injects WHOP_API_KEY automatically, used as a fallback.
 */
import { env as cfEnv } from 'cloudflare:workers'

export function getEnv(name: string): string | undefined {
  const fromCf = (cfEnv as unknown as Record<string, string | undefined> | undefined)?.[name]
  if (fromCf) return fromCf
  return typeof process !== 'undefined' ? process.env?.[name] : undefined
}

const API = 'https://api.whop.com/api/v1'

export class WhopApiError extends Error {
  status: number
  body: unknown
  constructor(status: number, body: unknown, path: string) {
    const msg =
      (typeof body === 'object' && body && ((body as any).message || (body as any).error?.message)) ||
      `Whop API ${status} on ${path}`
    super(String(msg))
    this.status = status
    this.body = body
  }
}

export async function whop<T = any>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
  opts: { idempotencyKey?: string } = {},
): Promise<T> {
  const key = getEnv('WHOP_SERVER_KEY') ?? getEnv('WHOP_API_KEY')
  if (!key) throw new Error('No Whop API key: set the WHOP_SERVER_KEY app secret')
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      'Api-Version-Date': '2026-11-03-1',
      'Content-Type': 'application/json',
      ...(opts.idempotencyKey ? { 'Idempotency-Key': opts.idempotencyKey } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await res.text()
  let json: any = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = { message: text }
  }
  if (!res.ok) throw new WhopApiError(res.status, json, path)
  return json as T
}
