import { useEffect, useState } from "react";
import { COUNTRIES, detectCountryCode, countryByCode } from "../data/store";

export default function CountryPhone({ country, phone, onCountry, onPhone, inputClass }: { country: string; phone: string; onCountry: (value: string) => void; onPhone: (value: string) => void; inputClass: string }) {
  const [detected, setDetected] = useState(false);
  useEffect(() => {
    if (detected) return;
    setDetected(true);
    void detectCountryCode().then((code) => onCountry(code));
  }, [detected, onCountry]);
  const selected = countryByCode(country);
  return <div className="grid gap-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
    <select value={country} onChange={(event) => onCountry(event.target.value)} className={inputClass} aria-label="Country">
      {COUNTRIES.map((item) => (
        <option key={item.code} value={item.code} className="bg-[#12001f] text-white">
          {item.name} ({item.dial})
        </option>
      ))}
    </select>
    <div className="flex min-w-0 items-center overflow-hidden rounded-xl border border-white/15 bg-black/20 focus-within:border-pink-400/60">
      <span className="shrink-0 border-r border-white/10 px-3 text-sm text-pink-300">{selected.dial}</span>
      <input value={phone} onChange={(event) => onPhone(event.target.value.replace(/[^0-9\s()-]/g, ""))} placeholder="Phone number" className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder:text-[#6f6390] focus:outline-none" />
    </div>
  </div>;
}