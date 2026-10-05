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

const dates = Array.from({ length: 31 }, (_, i) => {
  const day = i + 1
  return { value: `2026-12-${String(day).padStart(2, '0')}`, label: `${day} December 2026` }
})
const times = Array.from({ length: 96 }, (_, i) => {
  const hour = Math.floor(i / 4), minute = (i % 4) * 15
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
    <p className="field-hint">Jaipur time (IST). Tentative is fine. For dates outside December, leave a note below.</p>
  </fieldset>
}
