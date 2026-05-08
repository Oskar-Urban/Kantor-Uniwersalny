import fs from 'node:fs/promises';
import { demoRegistryJs } from './prospect-utils.mjs';

const INPUT = process.env.PROSPECTS_JSON || 'marketing/ochota-prospects.seed.json';
const OUTPUT = process.env.DEMO_DATA_FILE || 'marketing/demo-leads.js';

const leads = JSON.parse(await fs.readFile(INPUT, 'utf8'));
await fs.mkdir(OUTPUT.split('/').slice(0, -1).join('/') || '.', { recursive: true });
await fs.writeFile(OUTPUT, demoRegistryJs(leads));
console.log(`Zapisano ${OUTPUT}`);
