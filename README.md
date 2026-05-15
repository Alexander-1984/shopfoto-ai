# ShopFoto AI – MVP

Kleine Web-App/PWA für Produktfotos:

- Foto aufnehmen oder hochladen
- Preset auswählen
- Bild per OpenAI Image Edit API bearbeiten
- Ergebnis als PNG herunterladen

## Voraussetzungen

- Node.js installieren
- OpenAI API-Key erstellen

## Installation

```bash
npm install
cp .env.example .env.local
```

Dann in `.env.local` eintragen:

```bash
OPENAI_API_KEY=dein_api_key
```

## Start

```bash
npm run dev
```

Dann im Browser öffnen:

```bash
http://localhost:3000
```

## Wichtiger Hinweis

Die Presets liegen in `lib/presets.ts` und können dort angepasst werden.

Der aktuelle Standard-Prompt achtet darauf, dass das Produkt nicht verändert wird:

- keine neuen Bauteile
- keine Formänderung
- weißer Hintergrund
- Freistellung
- Shop-Optimierung
