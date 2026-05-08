import fs from 'node:fs/promises';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';
import { DEFAULT_DEMO_BASE_URL, demoRegistryJs, toProspectRow } from './prospect-utils.mjs';

const INPUT = process.env.PROSPECTS_JSON || 'marketing/ochota-prospects.seed.json';
const OUTPUT_DIR = process.env.OUTPUT_DIR || 'outputs/ochota-prospecting';
const OUTPUT_FILE = `${OUTPUT_DIR}/ochota-prospecting-crm.xlsx`;
const DEMO_DATA_FILE = process.env.DEMO_DATA_FILE || 'marketing/demo-leads.js';
const DEMO_BASE_URL = process.env.DEMO_BASE_URL || DEFAULT_DEMO_BASE_URL;

const rawLeads = JSON.parse(await fs.readFile(INPUT, 'utf8'));
await fs.mkdir(DEMO_DATA_FILE.split('/').slice(0, -1).join('/') || '.', { recursive: true });
await fs.writeFile(DEMO_DATA_FILE, demoRegistryJs(rawLeads));
const leads = rawLeads.map(lead => toProspectRow(lead, DEMO_BASE_URL));

const workbook = Workbook.create();
const dashboard = workbook.worksheets.add('Dashboard');
const leadsSheet = workbook.worksheets.add('Leady_Ochota');
const draftsSheet = workbook.worksheets.add('Drafty_Maili');
const templatesSheet = workbook.worksheets.add('Szablony');
const sourcesSheet = workbook.worksheets.add('Zrodla_i_API');

function setValues(sheet, range, values) {
  sheet.getRange(range).values = values;
}

function setFormula(sheet, cell, formula) {
  sheet.getRange(cell).formulas = [[formula]];
}

function tryStyle(fn) {
  try { fn(); } catch (e) {}
}

function cellValue(value) {
  return value === '' ? null : value;
}

function styleHeader(sheet, range) {
  const r = sheet.getRange(range);
  tryStyle(() => { r.format.fill.color = '#0c2340'; });
  tryStyle(() => { r.format.font.color = '#ffffff'; });
  tryStyle(() => { r.format.font.bold = true; });
}

function styleTitle(sheet, range) {
  const r = sheet.getRange(range);
  tryStyle(() => { r.format.font.bold = true; });
  tryStyle(() => { r.format.font.size = 18; });
  tryStyle(() => { r.format.font.color = '#0c2340'; });
}

function styleKpi(sheet, range) {
  const r = sheet.getRange(range);
  tryStyle(() => { r.format.fill.color = '#fff7ed'; });
  tryStyle(() => { r.format.font.bold = true; });
}

const leadHeaders = [
  'ID', 'Priorytet', 'Typ leadu', 'Status wysyłki', 'Data wysyłki', 'Nazwa', 'Adres', 'Dzielnica',
  'Telefon', 'E-mail', 'Strona www', 'Google Maps', 'Place ID', 'Ocena', 'Opinie', 'Godziny',
  'Demo URL', 'Źródło', 'URL źródła', 'Notatki'
];
const leadRows = leads.map(lead => [
  lead.leadId, lead.priority, lead.leadType, lead.status, lead.sentAt, lead.name, lead.address, lead.district,
  lead.phone, lead.email, lead.website, lead.googleMapsUrl, lead.placeId, lead.rating, lead.reviewCount, lead.hours,
  lead.demoUrl, lead.source, lead.sourceUrl, lead.notes
].map(cellValue));
setValues(leadsSheet, `A1:T${leadRows.length + 1}`, [leadHeaders, ...leadRows]);
styleHeader(leadsSheet, 'A1:T1');
tryStyle(() => leadsSheet.freezePanes = { rows: 1, columns: 2 });

const dashboardRows = [
  ['Kantor Uniwersalny - prospecting Ochota', '', '', '', ''],
  ['Zakres', 'Warszawa Ochota', '', 'Baza', INPUT],
  ['', '', '', '', ''],
  ['KPI', 'Wartość', '', 'Status', 'Liczba'],
  ['Leadów razem', '', '', 'Do weryfikacji', ''],
  ['Do wysłania', '', '', 'Do wysłania', ''],
  ['Wysłano', '', '', 'Wysłano', ''],
  ['Z mailem', '', '', 'Odpowiedział', ''],
  ['Bez strony www', '', '', 'Nie kontaktować', ''],
  ['', '', '', '', ''],
  ['Priorytet', 'Liczba', '', 'Następny krok', ''],
  ['wysoki', '', '', '1. Zweryfikować dane z Google Places', ''],
  ['średni', '', '', '2. Wysłać mail z linkiem demo', ''],
  ['niski', '', '', '3. Oznaczyć status i datę wysyłki', '']
];
setValues(dashboard, 'A1:E14', dashboardRows);
styleTitle(dashboard, 'A1:E1');
styleHeader(dashboard, 'A4:B4');
styleHeader(dashboard, 'D4:E4');
styleHeader(dashboard, 'A11:B11');
styleHeader(dashboard, 'D11:E11');
styleKpi(dashboard, 'A5:B9');
setFormula(dashboard, 'B5', '=COUNTA(Leady_Ochota!A2:A1000)');
setFormula(dashboard, 'B6', '=COUNTIF(Leady_Ochota!D2:D1000,"Do wysłania")');
setFormula(dashboard, 'B7', '=COUNTIF(Leady_Ochota!D2:D1000,"Wysłano")');
setFormula(dashboard, 'B8', '=COUNTA(Leady_Ochota!J2:J1000)');
setFormula(dashboard, 'B9', '=COUNTBLANK(Leady_Ochota!K2:K1000)-COUNTBLANK(Leady_Ochota!A2:A1000)');
setFormula(dashboard, 'E5', '=COUNTIF(Leady_Ochota!D2:D1000,D5)');
setFormula(dashboard, 'E6', '=COUNTIF(Leady_Ochota!D2:D1000,D6)');
setFormula(dashboard, 'E7', '=COUNTIF(Leady_Ochota!D2:D1000,D7)');
setFormula(dashboard, 'E8', '=COUNTIF(Leady_Ochota!D2:D1000,D8)');
setFormula(dashboard, 'E9', '=COUNTIF(Leady_Ochota!D2:D1000,D9)');
setFormula(dashboard, 'B12', '=COUNTIF(Leady_Ochota!B2:B1000,A12)');
setFormula(dashboard, 'B13', '=COUNTIF(Leady_Ochota!B2:B1000,A13)');
setFormula(dashboard, 'B14', '=COUNTIF(Leady_Ochota!B2:B1000,A14)');

const personalizedDraftRows = leads.map(lead => [
  lead.leadId,
  lead.name,
  lead.mailSubject,
  lead.demoUrl,
  lead.mailDraft,
  lead.followUpDraft
]);
setValues(draftsSheet, `A1:F${personalizedDraftRows.length + 1}`, [
  ['ID', 'Nazwa', 'Temat', 'Demo URL', 'Pierwszy mail', 'Follow-up'],
  ...personalizedDraftRows
]);
styleHeader(draftsSheet, 'A1:F1');
tryStyle(() => draftsSheet.freezePanes = { rows: 1, columns: 2 });

const templateRows = [
  ['Typ', 'Temat', 'Treść'],
  ['Pierwszy mail', 'Krótka wersja demo strony dla [nazwa kantoru]', leads[0]?.mailDraft || ''],
  ['Follow-up', 'Wracam z linkiem do demo strony', leads[0]?.followUpDraft || ''],
  ['Krótki wariant', 'Strona dla [nazwa kantoru]', 'Dzień dobry,\n\nmam krótką, spersonalizowaną wersję demo strony dla Państwa kantoru: [link]\n\nJeżeli temat odświeżenia strony jest aktualny, mogę pokazać pełną wersję z kursami, kalkulatorem i panelem aktualizacji.\n\nPozdrawiam,\nOskar']
];
setValues(templatesSheet, 'A1:C4', templateRows);
styleHeader(templatesSheet, 'A1:C1');

const sourceRows = [
  ['Obszar', 'Notatka'],
  ['Źródło danych startowych', 'Publiczne wyniki katalogów branżowych i wyszukiwarek. Przed wysyłką warto potwierdzić dane w Google Places.'],
  ['Google Places API', 'Skrypt scripts/fetch-ochota-places.mjs używa Places API Text Search i pola X-Goog-FieldMask.'],
  ['Dlaczego Text Search', 'W aktualnych typach Places API nie ma osobnego filtra currency_exchange, więc używamy fraz tekstowych.'],
  ['Status wysyłki', 'Edytuj kolumny Status wysyłki i Data wysyłki w arkuszu Leady_Ochota.'],
  ['Baza demo', DEMO_BASE_URL]
];
setValues(sourcesSheet, 'A1:B6', sourceRows);
styleHeader(sourcesSheet, 'A1:B1');

const widthHints = {
  Dashboard: [260, 120, 30, 240, 160],
  Leady_Ochota: [90, 90, 110, 120, 110, 220, 260, 90, 180, 180, 220, 260, 160, 70, 70, 240, 420, 180, 260, 360],
  Drafty_Maili: [90, 220, 260, 420, 620, 520],
  Szablony: [120, 260, 620],
  Zrodla_i_API: [180, 720]
};
for (const [sheetName, widths] of Object.entries(widthHints)) {
  const sheet = workbook.worksheets.getItem(sheetName);
  widths.forEach((width, index) => {
    const col = String.fromCharCode('A'.charCodeAt(0) + index);
    tryStyle(() => { sheet.getRange(`${col}:${col}`).format.columnWidthPx = width; });
  });
}

for (const sheet of [leadsSheet, draftsSheet, templatesSheet, sourcesSheet]) {
  tryStyle(() => { sheet.getRange('A:W').format.wrapText = true; });
}

await fs.mkdir(OUTPUT_DIR, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(OUTPUT_FILE);
console.log(OUTPUT_FILE);
