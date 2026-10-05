import { useState } from 'react'
import { getCountries, getCountryCallingCode, getExampleNumber, AsYouType } from 'libphonenumber-js/max'
import examples from 'libphonenumber-js/mobile/examples'

const names = new Intl.DisplayNames(['en'], { type: 'region' })
const first = ['IN', 'US', 'CA', 'ES']
const countryName = c => c === 'US' ? 'USA' : names.of(c)
const countries = [...first, ...getCountries().filter(c => !first.includes(c)).sort((a, b) => names.of(a).localeCompare(names.of(b)))]

export function PhoneFields() {
  const [country, setCountry] = useState('IN')
  const [phone, setPhone] = useState('')
  const example = getExampleNumber(country, examples)?.formatNational()
  return <>
    <div className="field">
      <label htmlFor="phone_country">Country code</label>
      <select id="phone_country" name="phone_country" value={country} onChange={e => { setCountry(e.target.value); setPhone('') }} autoComplete="country">
        {countries.map(c => <option key={c} value={c}>{countryName(c)} (+{getCountryCallingCode(c)})</option>)}
      </select>
    </div>
    <div className="field">
      <label htmlFor="phone">Phone number</label>
      <input id="phone" name="phone" type="tel" inputMode="tel" required autoComplete="tel-national" maxLength="30" value={phone} placeholder={example || 'National phone number'} aria-describedby="phone-hint" onChange={e => { e.target.setCustomValidity(''); setPhone(new AsYouType(country).input(e.target.value.replace(/[^\d]/g, ''))) }} />
      <p className="field-hint" id="phone-hint">Enter your number without the country code.</p>
    </div>
  </>
}

const dates = Array.from({ length: 5 }, (_, i) => {
  const day = i + 14
  const weekday = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][i]
  return { value: `2026-12-${day}`, label: `${weekday}, ${day} Dec` }
})
const times = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2), minute = (i % 2) * 30
  return { value: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`, label: `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}` }
})

export function TravelFields({ name, label }) {
  return <fieldset className="field travel-field">
    <legend>{label}</legend>
    <div className="travel-selects">
      <div className="field"><label htmlFor={`${name}_date`}>Date</label>
        <select id={`${name}_date`} name={`${name}_date`} defaultValue=""><option value="">Not decided yet</option>{dates.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}</select>
      </div>
      <div className="field"><label htmlFor={`${name}_time`}>Time</label>
        <select id={`${name}_time`} name={`${name}_time`} defaultValue=""><option value="">Not decided yet</option>{times.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
      </div>
    </div>
    <p className="field-hint">Jaipur time (IST). Tentative is fine.</p>
  </fieldset>
}

export function TransportHelpFields() {
  const [origin, setOrigin] = useState('')
  return <div className="field full transport-help">
    <div className="field">
      <label htmlFor="transport_origin">Where do you need transport from?</label>
      <select id="transport_origin" name="transport_origin" value={origin} required onChange={e => setOrigin(e.target.value)}>
        <option value="">Choose a pickup location</option>
        <option value="Airport">Airport</option><option value="Train station">Train station</option><option value="Another city">Another city</option>
      </select>
    </div>
    {(origin === 'Airport' || origin === 'Train station') && <div className="travel-selects" key={origin}>
      <div className="field"><label htmlFor="transport_number">{origin === 'Airport' ? 'Flight number' : 'Train number'} (optional)</label>
        <input id="transport_number" name="transport_number" type="text" maxLength="60" placeholder={origin === 'Airport' ? 'e.g. AI 123' : 'e.g. 12958'} />
      </div>
      <div className="field"><label htmlFor="transport_arrival_time">{origin === 'Airport' ? 'Landing time' : 'Train arrival time'} (optional)</label>
        <select id="transport_arrival_time" name="transport_arrival_time" defaultValue=""><option value="">Not decided yet</option>{times.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
        <p className="field-hint">Jaipur time (IST).</p>
      </div>
    </div>}
    {origin === 'Another city' && <div className="field">
      <label htmlFor="transport_city">City name</label>
      <input id="transport_city" name="transport_city" type="text" required maxLength="120" placeholder="e.g. Delhi" />
    </div>}
  </div>
}
