import { DEFAULT_DEMO_BASE_URL, makeDemoUrl } from './prospect-utils.mjs';

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) {
  const key = process.argv[i]?.replace(/^--/, '');
  const value = process.argv[i + 1];
  if (key && value) args.set(key, value);
}

const lead = {
  leadId: args.get('id') || args.get('demo') || args.get('demo-id') || '',
  name: args.get('name') || '',
  address: args.get('address') || '',
  phone: args.get('phone') || '',
  email: args.get('email') || '',
  googleMapsUrl: args.get('maps') || args.get('map-url') || '',
  placeId: args.get('place-id') || ''
};

if (!lead.name && !lead.address) {
  console.error([
    'Podaj przynajmniej nazwę albo adres.',
    'Przykład:',
    '  node scripts/make-demo-link.mjs --name "Kantor Akcent" --address "ul. Grójecka 95, Warszawa" --phone "22 823 00 90"'
  ].join('\n'));
  process.exit(1);
}

console.log(makeDemoUrl(lead, args.get('base-url') || process.env.DEMO_BASE_URL || DEFAULT_DEMO_BASE_URL));
