/**
 * RSVP API — Cloudflare Pages Function backed by D1.
 *
 * POST /api/rsvp            — store a guest's RSVP (JSON body)
 * GET  /api/rsvp?key=…      — list RSVPs (requires ADMIN_KEY secret)
 * GET  /api/rsvp?key=…&format=csv — download as CSV
 */

import { parsePhoneNumberFromString } from 'libphonenumber-js/max'

const FIELDS = [
  'full_name', 'phone', 'attending', 'events', 'party_size', 'rooms',
  'travel_mode', 'arrival', 'departure', 'dietary', 'song', 'notes', 'phone_country', 'extra_bedding',
]

export async function onRequestPost({ request, env }) {
  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body || typeof body !== 'object' || Array.isArray(body) || typeof body.phone_country !== 'string') {
    return Response.json({ ok: false, error: 'Invalid RSVP' }, { status: 400 })
  }
  const fullName = String(body.full_name || '').trim().slice(0, 200)
  const parsedPhone = parsePhoneNumberFromString(String(body.phone || ''), body.phone_country)
  const phone = parsedPhone?.number
  if (!fullName || !phone) {
    return Response.json({ ok: false, error: 'Name and phone are required' }, { status: 400 })
  }
  const invalid = error => Response.json({ ok: false, error }, { status: 400 })
  if (!parsedPhone?.isValid() || parsedPhone.country !== body.phone_country) return invalid('Invalid phone number for country')
  if (!['Joyfully accept', 'Regretfully decline'].includes(body.attending)) return invalid('Choose attendance')
  const counts = [['party_size', 1, 12], ['rooms', 0, 12], ['extra_bedding', 0, 12]]
  for (const [field, min, max] of counts) {
    const value = Number(body[field])
    if (body[field] === '' || body[field] == null || !Number.isInteger(value) || value < min || value > max) return invalid(`Invalid ${field}`)
  }
  const travel = {}
  for (const field of ['arrival', 'departure']) {
    const date = body[`${field}_date`] || '', time = body[`${field}_time`] || ''
    if (date && !/^2026-12-(0[1-9]|[12]\d|3[01])$/.test(date)) return invalid('Invalid travel date')
    if (time && (!date || !/^([01]\d|2[0-3]):(00|15|30|45)$/.test(time))) return invalid('Invalid travel time')
    travel[field] = date ? `${date}${time ? ` ${time}` : ' (time undecided)'} IST` : ''
  }
  if (body.arrival_date && body.departure_date && `${body.departure_date}T${body.departure_time || '23:59'}` < `${body.arrival_date}T${body.arrival_time || '00:00'}`) return invalid('Departure precedes arrival')

  const clean = (v, n = 300) => String(v ?? '').trim().slice(0, n)
  await env.DB.prepare(
    `INSERT INTO rsvps (full_name, phone, attending, events, party_size, rooms, travel_mode, arrival, departure, dietary, song, notes, phone_country, extra_bedding)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      fullName,
      phone,
      clean(body.attending, 60),
      clean(body.events, 120),
      Number.parseInt(body.party_size, 10) || 1,
      clean(body.rooms, 120),
      clean(body.travel_mode, 40),
      travel.arrival,
      travel.departure,
      clean(body.dietary, 60),
      clean(body.song, 200),
      clean(body.notes, 1000),
      body.phone_country,
      Number(body.extra_bedding),
    )
    .run()

  return Response.json({ ok: true })
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url)
  const key = request.headers.get('Authorization')?.replace(/^Bearer /, '') || url.searchParams.get('key')
  if (!env.ADMIN_KEY || key !== env.ADMIN_KEY) {
    return new Response('Unauthorized', { status: 401 })
  }

  const after = url.searchParams.get('after_id')
  if (after !== null && (!/^\d+$/.test(after) || !Number.isSafeInteger(Number(after)))) return new Response('Invalid cursor', { status: 400 })
  const { results } = after === null
    ? await env.DB.prepare('SELECT * FROM rsvps ORDER BY id DESC').all()
    : await env.DB.prepare('SELECT * FROM rsvps WHERE id > ? ORDER BY id ASC LIMIT 100').bind(Number(after)).all()

  if (url.searchParams.get('format') === 'csv') {
    const cols = ['id', 'created_at', ...FIELDS]
    const esc = (v) => {
      const text = String(v ?? '')
      const safe = /^[\s]*[=+@-]/.test(text) ? `'${text}` : text
      return `"${safe.replaceAll('"', '""')}"`
    }
    const csv = '\uFEFF' + [cols.join(','), ...results.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\r\n')
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="rsvps.csv"',
        'Cache-Control': 'no-store',
      },
    })
  }

  return Response.json({ count: results.length, rsvps: results }, { headers: { 'Cache-Control': 'no-store' } })
}
