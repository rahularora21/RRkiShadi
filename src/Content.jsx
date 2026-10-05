import { useEffect, useRef, useState } from 'react'
import Tilt from './Tilt.jsx'
import Figures from './Figures.jsx'
import { parsePhoneNumberFromString } from 'libphonenumber-js/max'
import { PhoneFields, TravelFields, TransportHelpFields } from './RsvpFields.jsx'

/* ------------------------------------------------------------------
   The five chapters of the invitation (rendered by App.jsx).
------------------------------------------------------------------- */
export const VENUE = {
  name: 'Stardom Resort, Jaipur',
  address: 'Jaisinghpura Road, Bhankrota, Ajmer Road, Jaipur 302026',
  maps: 'https://www.google.com/maps/search/?api=1&query=Stardom+Resort+Jaisinghpura+Road+Bhankrota+Jaipur',
  site: 'https://stardomresortjaipur.in/',
}


export const LOOKS = {
  cocktail: {
    label: 'Cocktail',
    title: 'Cocktail Dinner',
    sub: 'Wednesday 16 Dec · Indo-western',
    note: 'Jewel tones in satin and silk — sharp collars, flowing drapes, a glint of antique gold.',
    swatches: [
      ['Deep green', '#1b3a2a'],
      ['Dusk', '#4d4560'],
      ['Antique gold', '#b08d3f'],
    ],
  },
  wedding: {
    label: 'Wedding',
    title: 'Sundowner Wedding',
    sub: 'Thursday 17 Dec · Indian festive',
    note: 'Tea green, ivory and a stroke of sunset — soft festive colours for the golden hour.',
    swatches: [
      ['Tea green', '#cfdcc3'],
      ['Ivory', '#f3efe1'],
      ['Sunset', '#e0813f'],
    ],
  },
  pyjama: {
    label: 'Pyjama Party',
    title: 'Pyjama Party',
    sub: 'Thursday 17 Dec · after the pheras, till the sun comes up',
    note: 'Pyjamas, or whatever you wore to the wedding — nobody is checking. Slippers very welcome.',
    swatches: [
      ['Midnight', '#1c2340'],
      ['Blush', '#e8b4c0'],
      ['Pearl', '#f0e6d2'],
    ],
  },
}

function Celebrations() {
  const days = [
    {
      date: '2026-12-16',
      label: 'Day 1 · 16 December',
      events: [
        ['By 12:00 noon', 'Arrival & Check-in', 'Settle in at Stardom Resort, Jaipur'],
        ['2:00 PM', 'Lunch', 'Join us for a hosted lunch'],
        ['7:00 PM onwards', 'Cocktail Dinner', 'Elegant cocktail · Indo-western'],
        ['Till sunrise', 'Party the Night Away', 'Keep the celebrations going till the sun comes up'],
      ],
    },
    {
      date: '2026-12-17',
      label: 'Day 2 · 17 December',
      events: [
        ['8:00 AM onwards', 'Breakfast', 'Ease into the day over breakfast'],
        ['Around 2:00 PM', 'Lunch', 'A hosted lunch before the celebrations'],
        ['Around 4:00 PM', 'Baraat', 'Indian festive attire'],
        ['Around 6:00 PM', 'Pheras', 'Join us for the wedding ceremony'],
        ['9:00 PM onwards', 'Dinner', 'Come together for a celebratory dinner'],
        ['After the pheras', 'Pyjama Party', 'Till the sun comes up · Pyjamas, or whatever you wore to the wedding'],
      ],
    },
  ]
  return (
    <>
      <h2 className="kicker celebrations-title">the celebrations</h2>
      <p className="section-title celebrations-subtitle">Two Days · Three Parties</p>
      <p className="lede">
        A cocktail evening, a sundowner wedding — and once the pheras are done, a pyjama party that
        carries on until the sun is up again.
      </p>
      <p className="programme-venue">Your day-wise programme · Stardom Resort, Jaipur</p>
      <div className="programme">
        {days.map(({ date, label, events }) => (
          <section className="programme-day" key={date} aria-labelledby={date}>
            <h3 className="programme-date" id={date}><time dateTime={date}>{label}</time></h3>
            <div className="event-list">
              {events.map(([time, name, attire]) => (
                <div className="event-row" key={name}>
                  <p className="when">{time}</p>
                  <div>
                    <h4>{name}</h4>
                    <p className="attire">{attire}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  )
}

function Stay() {
  const cards = [
    ['Check-in · out', 'Check in Wednesday 16 Dec by noon. Depart Friday 18 Dec by noon. Your stay and all meals are hosted throughout.'],
    ['From Delhi', 'About 3½–5 hours by road via the Delhi–Mumbai Expressway. Complimentary parking at the resort.'],
    ['Flying in', 'Roughly 30 minutes from Jaipur International Airport. Share arrival details in the RSVP and we will help you plan.'],
  ]
  return (
    <>
      <p className="kicker">your stay &amp; getting there</p>
      <h2 className="section-title">Room to Be Together</h2>
      <p className="lede">A calm resort off Ajmer Road — open lawns, a glittering pool and room to simply be together.</p>
      <p className="hosted-note">
        <strong>Your stay &amp; all meals are on us.</strong>
        Accommodation and all meals are hosted by our families, from check-in on 16 December
        to check-out on 18 December.
      </p>
      <div className="venue-address">
        <div>
          <h4>{VENUE.name}</h4>
          <p>{VENUE.address}</p>
        </div>
        <div className="venue-links">
          <a className="link-btn" href={VENUE.maps} target="_blank" rel="noreferrer">
            Open in Google Maps →
          </a>
          <a className="link-btn ghost" href={VENUE.site} target="_blank" rel="noreferrer">
            Resort website
          </a>
        </div>
      </div>
      <div className="venue-strip">
        {[
          ['/venue/pool.jpg', 'The resort pool'],
          ['/venue/lawn.jpg', 'The lawns'],
          ['/venue/room.jpg', 'A guest room'],
        ].map(([src, alt]) => (
          <img key={src} src={src} alt={alt} loading="lazy" />
        ))}
      </div>
      <div className="info-grid">
        {cards.map(([title, text]) => (
          <Tilt key={title} max={7}>
            <div className="info-card">
              <h4>{title}</h4>
              <p>{text}</p>
            </div>
          </Tilt>
        ))}
      </div>
    </>
  )
}

function WhatToWear() {
  const [look, setLookState] = useState('cocktail')
  const [shade, setShade] = useState(0)
  const active = LOOKS[look]
  const setLook = (key) => {
    setLookState(key)
    setShade(0)
  }
  const color = active.swatches[Math.min(shade, active.swatches.length - 1)][1]
  return (
    <>
      <p className="kicker">what to wear</p>
      <h2 className="section-title">Dress the Evening</h2>
      <p className="lede">Three evenings, three palettes — pick an evening, then tap a colour to dress them.</p>
      <div className="wear">
        <div className="wear-stage">
          <Figures look={look} color={color} />
        </div>
        <div className="wear-controls">
          <div className="tabs" role="tablist" aria-label="Choose an event look">
            {Object.entries(LOOKS).map(([key, l]) => (
              <button
                key={key}
                role="tab"
                aria-selected={look === key}
                className={`tab ${look === key ? 'active' : ''}`}
                onClick={() => setLook(key)}
              >
                {l.label}
              </button>
            ))}
          </div>
          <div className="swatches" role="radiogroup" aria-label="Dress them in">
            {active.swatches.map(([name, hex], i) => (
              <button
                type="button"
                role="radio"
                aria-checked={i === shade}
                className={`swatch ${i === shade ? 'active' : ''}`}
                key={name}
                onClick={() => setShade(i)}
              >
                <span className="chip" style={{ background: hex }} />
                <span>{name}</span>
              </button>
            ))}
          </div>
          <p className="dress-note">“{active.note}”</p>
          <p className="dress-sub">{active.title} — {active.sub}</p>
        </div>
      </div>
    </>
  )
}

function Explore() {
  const spots = [
    {
      img: '/jaipur/amber.jpg',
      name: 'Amber Fort',
      blurb: 'Hilltop ramparts and mirror-work halls.',
      maps: 'https://www.google.com/maps/search/?api=1&query=Amber+Fort+Jaipur',
    },
    {
      img: '/jaipur/hawa.jpg',
      name: 'Hawa Mahal',
      blurb: 'The pink honeycomb facade of the old city.',
      maps: 'https://www.google.com/maps/search/?api=1&query=Hawa+Mahal+Jaipur',
    },
    {
      img: '/jaipur/city.jpg',
      name: 'City Palace',
      blurb: 'Courtyards, peacock gates, royal collection.',
      maps: 'https://www.google.com/maps/search/?api=1&query=City+Palace+Jaipur',
    },
    {
      img: '/jaipur/johari.jpg',
      name: 'Johri Bazaar',
      blurb: 'Jewellery, block prints and lac bangles.',
      maps: 'https://www.google.com/maps/search/?api=1&query=Johari+Bazaar+Jaipur',
    },
  ]
  return (
    <>
      <p className="kicker">explore jaipur</p>
      <h2 className="section-title">The Pink City Awaits</h2>
      <p className="lede">All within an hour of the resort — tap one to walk around it on the map.</p>
      <div className="explore-grid">
        {spots.map((s) => (
          <a className="explore-card photo" key={s.name} href={s.maps} target="_blank" rel="noreferrer">
            <img src={s.img} alt={s.name} loading="lazy" />
            <div className="ex-overlay">
              <h4>{s.name}</h4>
              <p>{s.blurb}</p>
              <span className="ex-walk">Walk around →</span>
            </div>
          </a>
        ))}
      </div>
      <p className="ex-credit">Photographs · Wikimedia Commons</p>
    </>
  )
}

/** Custom dropdown — reliable and styled inside the 3D-transformed panel. */
function Dropdown({ id, name, label, options, placeholder = 'Choose…', onChange }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const ref = useRef(null)
  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])
  return (
    <div className="field dd-field" ref={ref}>
      <label htmlFor={id}>{label}</label>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        id={id}
        className={`dd-btn ${open ? 'open' : ''} ${value ? '' : 'empty'}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {value || placeholder}
        <span className="dd-caret" aria-hidden="true">▾</span>
      </button>
      {open && (
        <ul className="dd-list" role="listbox" aria-labelledby={id}>
          {options.map((o) => (
            <li
              key={o}
              role="option"
              aria-selected={o === value}
              className={o === value ? 'sel' : ''}
              onClick={() => {
                setValue(o)
                onChange?.(o)
                setOpen(false)
              }}
            >
              {o}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Rsvp() {
  const [status, setStatus] = useState('idle')
  const [travelMode, setTravelMode] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    const form = new FormData(e.target)
    const payload = Object.fromEntries(form.entries())
    const phone = parsePhoneNumberFromString(payload.phone, payload.phone_country)
    if (!phone?.isValid() || phone.country !== payload.phone_country) {
      const input = e.target.elements.phone
      input.setCustomValidity('Please enter a valid phone number for the selected country.')
      input.reportValidity()
      setStatus('idle')
      return
    }
    payload.phone = phone.number
    if ((payload.arrival_time && !payload.arrival_date) || (payload.departure_time && !payload.departure_date)) {
      setStatus('travel-incomplete')
      return
    }
    if (payload.arrival_date && payload.departure_date && `${payload.departure_date}T${payload.departure_time || '23:59'}` < `${payload.arrival_date}T${payload.arrival_time || '00:00'}`) {
      setStatus('travel-order')
      return
    }
    payload.events = 'All celebrations'
    if (!payload.attending) {
      setStatus('incomplete')
      return
    }
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <p className="kicker">rsvp</p>
      <h2 className="section-title">Respond by 1 November 2026</h2>
      <p className="lede">Tell us you are coming — and everything we need to host you well.</p>
      {status === 'done' ? (
        <p className="rsvp-done">Thank you — we can’t wait to celebrate with you.</p>
      ) : (
        <form className="rsvp-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="full_name">Full name</label>
            <input id="full_name" name="full_name" type="text" required autoComplete="name" />
          </div>
          <PhoneFields />
          <Dropdown
            id="attending"
            name="attending"
            label="Will you attend?"
            options={['Joyfully accept', 'Regretfully decline']}
          />
          <div className="field">
            <label htmlFor="party_size">Guests in your party</label>
            <input id="party_size" name="party_size" type="number" min="1" max="12" defaultValue="1" />
          </div>
          <div className="field">
            <label htmlFor="rooms">Rooms needed</label>
            <input id="rooms" name="rooms" type="number" min="0" max="12" step="1" defaultValue="1" />
          </div>
          <div className="field">
            <label htmlFor="extra_bedding">Extra beds needed</label>
            <input id="extra_bedding" name="extra_bedding" type="number" min="0" max="12" step="1" defaultValue="0" />
            <p className="field-hint">Leave at 0 if you don’t need extra bedding.</p>
          </div>
          <Dropdown
            id="travel_mode"
            name="travel_mode"
            label="Travelling by"
            onChange={setTravelMode}
            options={['Car', 'Flight', 'Train', 'I need help arranging transport', 'Other']}
          />
          {travelMode === 'I need help arranging transport' && <TransportHelpFields />}
          <div className="field full travel-plans">
            <TravelFields name="arrival" label="Arrival in Jaipur" />
            <TravelFields name="departure" label="Departure from Jaipur" />
          </div>
          <Dropdown id="dietary" name="dietary" label="Dietary preference" options={['Vegetarian', 'Non-vegetarian']} />
          <div className="field">
            <label htmlFor="song">A song that gets you dancing</label>
            <input id="song" name="song" type="text" placeholder="Optional" />
          </div>
          <div className="field full">
            <label htmlFor="notes">Anything else we should know?</label>
            <textarea id="notes" name="notes" rows="2" />
          </div>
          <button className="btn" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send RSVP'}
          </button>
          {status === 'error' && (
            <p className="rsvp-error">Could not submit just now — please try again, or reach us directly.</p>
          )}
          {status === 'incomplete' && (
            <p className="rsvp-error">Please choose whether you will attend.</p>
          )}
          {status === 'travel-incomplete' && <p className="rsvp-error" role="alert">Please choose a date alongside your travel time.</p>}
          {status === 'travel-order' && <p className="rsvp-error" role="alert">Departure must be after arrival. Please check your dates and times.</p>}
        </form>
      )}
    </>
  )
}

export const CONTENT = {
  celebrations: Celebrations,
  stay: Stay,
  'what-to-wear': WhatToWear,
  jaipur: Explore,
  rsvp: Rsvp,
}
