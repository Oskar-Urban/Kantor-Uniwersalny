import fs from 'node:fs/promises';
import { DEFAULT_DEMO_BASE_URL, demoRegistryJs, mapsSearchUrl, prospectsToCsv, toProspectRow } from './prospect-utils.mjs';

const API_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
const DEMO_BASE_URL = process.env.DEMO_BASE_URL || DEFAULT_DEMO_BASE_URL;
const OUT_JSON = process.env.OUT_JSON || 'marketing/ochota-prospects.google-places.json';
const OUT_CSV = process.env.OUT_CSV || 'marketing/ochota-prospects.google-places.csv';
const OUT_DEMOS_JS = process.env.OUT_DEMOS_JS || 'marketing/demo-leads.js';
const OCHOTA_CENTER = { latitude: 52.2125, longitude: 20.9710 };
const SEARCH_QUERIES = [
  'kantor wymiany walut Ochota Warszawa',
  'kantor walut Grójecka Warszawa Ochota',
  'kantor wymiany walut Aleje Jerozolimskie Ochota Warszawa',
  'currency exchange Ochota Warsaw'
];
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.googleMapsUri',
  'places.internationalPhoneNumber',
  'places.nationalPhoneNumber',
  'places.websiteUri',
  'places.rating',
  'places.regularOpeningHours',
  'places.userRatingCount',
  'places.businessStatus',
  'places.location',
  'places.primaryType',
  'places.types'
].join(',');

if (!API_KEY) {
  console.error([
    'Brakuje klucza Google Places API.',
    'Ustaw zmienną środowiskową i uruchom ponownie:',
    '  export GOOGLE_MAPS_API_KEY="..."',
    '  node scripts/fetch-ochota-places.mjs'
  ].join('\n'));
  process.exit(1);
}

async function textSearch(textQuery) {
  const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': FIELD_MASK
    },
    body: JSON.stringify({
      textQuery,
      languageCode: 'pl',
      regionCode: 'PL',
      locationBias: {
        circle: {
          center: OCHOTA_CENTER,
          radius: 3500
        }
      }
    })
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Google Places API ${response.status} for "${textQuery}": ${detail}`);
  }
  const data = await response.json();
  return data.places || [];
}

function looksLikeExchange(place) {
  const text = [
    place.displayName?.text,
    place.formattedAddress,
    place.primaryType,
    ...(place.types || [])
  ].filter(Boolean).join(' ').toLowerCase();
  return /\b(kantor|walut|currency|exchange)\b/.test(text);
}

function placeToLead(place, index) {
  const name = place.displayName?.text || '';
  const address = place.formattedAddress || '';
  const phone = place.internationalPhoneNumber || place.nationalPhoneNumber || '';
  const hours = (place.regularOpeningHours?.weekdayDescriptions || []).join('; ');
  return toProspectRow({
    leadId: `OCH-GP-${String(index + 1).padStart(3, '0')}`,
    priority: place.websiteUri ? 'średni' : 'wysoki',
    leadType: 'kantor',
    status: 'Do wysłania',
    name,
    address,
    district: 'Ochota',
    phone,
    email: '',
    website: place.websiteUri || '',
    googleMapsUrl: place.googleMapsUri || mapsSearchUrl({ name, address }),
    placeId: place.id || '',
    rating: place.rating || '',
    reviewCount: place.userRatingCount || '',
    hours,
    source: 'Google Places API Text Search',
    sourceUrl: 'https://places.googleapis.com/v1/places:searchText',
    notes: [
      place.businessStatus ? `Status Google: ${place.businessStatus}` : '',
      place.primaryType ? `Typ: ${place.primaryType}` : ''
    ].filter(Boolean).join('; ')
  }, DEMO_BASE_URL);
}

const byId = new Map();
for (const query of SEARCH_QUERIES) {
  const places = await textSearch(query);
  for (const place of places) {
    const key = place.id || `${place.displayName?.text}|${place.formattedAddress}`;
    if (!key || byId.has(key) || !looksLikeExchange(place)) continue;
    byId.set(key, place);
  }
}

const leads = Array.from(byId.values()).map(placeToLead);
await fs.mkdir('marketing', { recursive: true });
await fs.writeFile(OUT_JSON, `${JSON.stringify(leads, null, 2)}\n`);
await fs.writeFile(OUT_CSV, `${prospectsToCsv(leads, DEMO_BASE_URL)}\n`);
await fs.writeFile(OUT_DEMOS_JS, demoRegistryJs(leads));
console.log(`Zapisano ${leads.length} leadów: ${OUT_JSON}, ${OUT_CSV}, ${OUT_DEMOS_JS}`);
