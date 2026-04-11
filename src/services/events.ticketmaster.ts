// src/services/events.ticketmaster.ts
export type TmEvent = {
  id: string;
  name: string;
  dates?: { start?: { localDate?: string; localTime?: string } };
  _embedded?: { venues?: { name?: string; city?: { name?: string }, address?: { line1?: string } }[] };
};

const TM_BASE = 'https://app.ticketmaster.com/discovery/v2';

export async function fetchTmEvents(city = 'São Paulo', countryCode = 'BR') {
  const apikey = process.env.EXPO_PUBLIC_TICKETMASTER_KEY;
  const url = `${TM_BASE}/events.json?apikey=${apikey}&countryCode=${countryCode}&city=${encodeURIComponent(city)}&size=25`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`TM HTTP ${res.status}`);
  const json = await res.json();
  const list: TmEvent[] = json?._embedded?.events ?? [];
  return list.map(e => {
    const v = e._embedded?.venues?.[0];
    const endereco = [v?.name, v?.address?.line1, v?.city?.name].filter(Boolean).join(' · ');
    return {
      id: e.id,
      nome: e.name,
      tipo: 'Show', // você pode mapear por e.classifications se quiser
      endereco,
      status: 'PRESENTE',
      transporte: 'METRÔ',
      eta: '0 min',
      descricao: `${e.dates?.start?.localDate ?? ''} ${e.dates?.start?.localTime ?? ''}`.trim()
    };
  });
}
