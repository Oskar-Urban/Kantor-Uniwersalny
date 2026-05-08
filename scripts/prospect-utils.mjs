export const DEFAULT_DEMO_BASE_URL = 'https://Oskar-Urban.github.io/Kantor-Uniwersalny/';

export function encodeDemoPayload(payload) {
  return Buffer.from(JSON.stringify(payload), 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function mapsSearchUrl(lead) {
  const query = [lead.name, lead.address || lead.shortAddress, 'Warszawa'].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function makeDemoPayload(lead) {
  const name = lead.name || lead.displayName || '';
  const address = lead.address || lead.formattedAddress || '';
  const mapQuery = lead.mapQuery || [name, address].filter(Boolean).join(', ');
  const placeId = lead.placeId || lead.googlePlaceId || '';
  const mapUrl = lead.googleMapsUrl || lead.mapUrl || '';
  return {
    name,
    address,
    phone: lead.phone || lead.nationalPhoneNumber || lead.internationalPhoneNumber || '',
    email: lead.email || '',
    placeId: placeId || mapUrl,
    mapQuery,
    slogan: lead.slogan || 'Wymiana walut w Warszawie Ochota',
    heroDesc: lead.heroDesc || `Wymiana walut · Skup i sprzedaż złota · ${address || 'Warszawa Ochota'}`
  };
}

export function demoCode(lead) {
  return String(lead.demoCode || lead.leadId || '')
    .trim()
    .toLowerCase()
    .replace(/^demo[-_]?/, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function makeDemoUrl(lead, baseUrl = DEFAULT_DEMO_BASE_URL) {
  const url = new URL(baseUrl);
  const code = demoCode(lead);
  if (code) {
    url.search = '';
    url.hash = '';
    url.searchParams.set('d', code);
    return url.toString();
  }
  url.searchParams.set('demo', encodeDemoPayload(makeDemoPayload(lead)));
  return url.toString();
}

export function demoRegistryJs(leads) {
  const registry = {};
  for (const lead of leads) {
    const code = demoCode(lead);
    if (!code) continue;
    registry[code] = makeDemoPayload(lead);
  }
  return [
    'window.KANTOR_DEMOS = Object.freeze(',
    JSON.stringify(registry, null, 2),
    ');',
    ''
  ].join('\n');
}

export function draftSubject(lead) {
  return `Krótka wersja demo strony dla ${lead.name}`;
}

export function draftEmail(lead, demoUrl) {
  const addressLine = lead.address ? ` Wstawiłem już podstawowe dane publiczne: nazwę i lokalizację (${lead.address}).` : '';
  return [
    'Dzień dobry,',
    '',
    `przygotowałem krótką, poglądową wersję nowoczesnej strony dla ${lead.name}:`,
    demoUrl,
    '',
    `To nie jest szablon “na sucho” - link pokazuje od razu, jak mogłaby wyglądać strona Państwa kantoru z kursami walut, kalkulatorem, mapą dojazdu oraz sekcją usług typu złoto, srebro i numizmatyka.${addressLine}`,
    '',
    'Jeżeli obecna strona nie spełnia już swojej roli albo chcieliby Państwo mieć prostą stronę, którą da się szybko aktualizować, mogę przygotować docelową wersję pod Państwa kantor.',
    '',
    'Czy mogę podesłać krótką propozycję wdrożenia albo zadzwonić na 10 minut?',
    '',
    'Pozdrawiam,',
    'Oskar'
  ].join('\n');
}

export function followUpEmail(lead, demoUrl) {
  return [
    'Dzień dobry,',
    '',
    `wracam tylko z linkiem do poglądowej wersji strony dla ${lead.name}:`,
    demoUrl,
    '',
    'Jeżeli temat strony internetowej jest aktualny, mogę dopasować treści, kolory i sekcje pod Państwa realną ofertę oraz przygotować prosty panel do aktualizacji kursów.',
    '',
    'Pozdrawiam,',
    'Oskar'
  ].join('\n');
}

export function toProspectRow(lead, baseUrl = DEFAULT_DEMO_BASE_URL) {
  const demoUrl = lead.demoUrl || makeDemoUrl(lead, baseUrl);
  return {
    leadId: lead.leadId || '',
    priority: lead.priority || 'średni',
    leadType: lead.leadType || 'kantor',
    status: lead.status || 'Do wysłania',
    sentAt: lead.sentAt || '',
    name: lead.name || '',
    address: lead.address || '',
    district: lead.district || 'Ochota',
    phone: lead.phone || '',
    email: lead.email || '',
    website: lead.website || '',
    googleMapsUrl: lead.googleMapsUrl || mapsSearchUrl(lead),
    placeId: lead.placeId || '',
    rating: lead.rating || '',
    reviewCount: lead.reviewCount || '',
    hours: lead.hours || '',
    demoUrl,
    mailSubject: lead.mailSubject || draftSubject(lead),
    mailDraft: lead.mailDraft || draftEmail(lead, demoUrl),
    followUpDraft: lead.followUpDraft || followUpEmail(lead, demoUrl),
    source: lead.source || '',
    sourceUrl: lead.sourceUrl || '',
    notes: lead.notes || ''
  };
}

export function csvEscape(value) {
  const str = String(value ?? '');
  if (/[",\n\r;]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function prospectsToCsv(leads, baseUrl = DEFAULT_DEMO_BASE_URL) {
  const headers = [
    'leadId','priority','leadType','status','sentAt','name','address','district','phone','email','website',
    'googleMapsUrl','placeId','rating','reviewCount','hours','demoUrl','mailSubject','mailDraft',
    'followUpDraft','source','sourceUrl','notes'
  ];
  const rows = leads.map(lead => toProspectRow(lead, baseUrl));
  return [
    headers.join(','),
    ...rows.map(row => headers.map(header => csvEscape(row[header])).join(','))
  ].join('\n');
}
