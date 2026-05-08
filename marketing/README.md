# Prospecting: kantory Warszawa Ochota

Cel: z danych publicznych lub Google Places wygenerować dla każdego kantoru:

- unikalny link do spersonalizowanego demo strony,
- draft pierwszego maila,
- draft follow-upu,
- status wysyłki i notatki CRM.

## Krótki link demo

Strona obsługuje krótkie identyfikatory demo zapisane w `marketing/demo-leads.js`.

Domyślny format linku:

```text
https://Oskar-Urban.github.io/Kantor-Uniwersalny/?d=och-001
```

Alternatywnie działają też:

```text
https://Oskar-Urban.github.io/Kantor-Uniwersalny/#demo-och-001
https://Oskar-Urban.github.io/Kantor-Uniwersalny/demo-och-001
```

Ostatni wariant używa `404.html` jako przekierowania na GitHub Pages.
Wariant `?d=...` jest najbezpieczniejszy do maili, bo Chrome zawsze przeładowuje stronę przy zmianie query stringa.

Plik z danymi demo generuje się z JSON-a leadów:

```bash
node scripts/build-demo-leads.mjs
```

Pojedynczy krótki link można wygenerować tak:

```bash
node scripts/make-demo-link.mjs --id "OCH-001" --name "Kantor Akcent" --address "ul. Grójecka 95, Warszawa" --phone "22 823 00 90"
```

Jeśli nie podasz `--id`, generator wróci do długiego linku z zakodowanym payloadem, bo strona nie ma wtedy jak znaleźć danych w rejestrze demo.

```bash
node scripts/make-demo-link.mjs --name "Kantor Akcent" --address "ul. Grójecka 95, Warszawa" --phone "22 823 00 90"
```

## Google Places

Po podpięciu klucza API:

```bash
export GOOGLE_MAPS_API_KEY="..."
node scripts/fetch-ochota-places.mjs
```

Skrypt odpytuje Places API Text Search dla Ochoty i zapisuje:

- `marketing/ochota-prospects.google-places.json`
- `marketing/ochota-prospects.google-places.csv`

W nowym Places API nie zakładamy filtra typu `currency_exchange`, bo w aktualnej tabeli typów finansowych są m.in. `bank`, `atm` i `accounting`. Dlatego skrypt używa kilku fraz tekstowych i filtruje wyniki po nazwie/adresie.

## Statusy wysyłki

Rekomendowane statusy:

- `Do weryfikacji`
- `Do wysłania`
- `Wysłano`
- `Odpowiedział`
- `Follow-up`
- `Nie kontaktować`
