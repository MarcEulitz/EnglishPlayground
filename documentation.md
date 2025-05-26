
# Mias Englischwelt - Technische Dokumentation

## 1. App-Zweck und Zielgruppe

### Zweck
"Mias Englischwelt" ist eine interaktive Englisch-Lern-App für Kinder, die spielerisches Vokabellernen mit modernster KI-Technologie kombiniert. Die App bietet:

- **Vokabeltraining** mit Bildern und Audio
- **Lückentext-Übungen** für verschiedene Themen
- **Gamification** durch Trophäen, Sticker und Level-System
- **Eltern-Dashboard** zur Fortschrittskontrolle
- **KI-gestützte Bildsuche** für optimale Lernmaterialien

### Zielgruppe
- **Hauptnutzer**: Kinder im Alter von 6-11 Jahren
- **Sekundärnutzer**: Eltern zur Überwachung des Lernfortschritts
- **Lernziel**: Englische Grundvokabeln spielerisch erlernen

---

## 2. Verwendete Technologien

### Frontend
- **React 18** mit TypeScript - Moderne komponentenbasierte UI
- **Wouter** - Leichtgewichtiges Routing (Alternative zu React Router)
- **TanStack React Query** - Datenmanagement und API-Caching
- **Tailwind CSS** - Utility-First CSS Framework
- **ShadCN UI** - Vorgefertigte UI-Komponenten basierend auf Radix UI
- **IndexedDB** - Client-seitige Datenspeicherung (Fallback)

### Backend
- **Express.js** - Node.js Web-Framework
- **TypeScript** - Typsichere Entwicklung
- **Drizzle ORM** - Moderne TypeScript-erste Datenbank-ORM
- **PostgreSQL** - Relationale Datenbank
- **Zod** - Schema-Validierung für TypeScript

### KI-Integration
- **OpenAI GPT-4o** - Intelligente Bildsuche und -validierung
- **OpenAI Vision API** - Bildanalyse für kinderfreundliche Inhalte

### Deployment
- **Replit** - Cloud-basierte Entwicklung und Hosting
- **Vite** - Moderner Build-Tool und Dev-Server

---

## 3. Projektstruktur

```
├── client/                    # Frontend React-App
│   ├── src/
│   │   ├── components/        # UI-Komponenten
│   │   │   ├── ui/           # ShadCN UI Basis-Komponenten
│   │   │   └── *.tsx         # App-spezifische Komponenten
│   │   ├── contexts/         # React Context für State Management
│   │   ├── hooks/            # Custom React Hooks
│   │   ├── lib/              # Utilities und Daten
│   │   ├── pages/            # React-Seiten/Views
│   │   └── main.tsx          # App-Einstiegspunkt
│   └── index.html            # HTML-Template
├── server/                   # Backend Express-App
│   ├── imageSearch.ts        # KI-gestützte Bildsuche
│   ├── imageValidator.ts     # Bildvalidierung mit OpenAI
│   ├── routes.ts            # API-Endpunkte
│   ├── storage.ts           # Datenbankoperationen
│   └── index.ts             # Server-Einstiegspunkt
├── shared/                  # Gemeinsame TypeScript-Typen
│   └── schema.ts            # Drizzle Datenbankschema
└── public/                  # Statische Assets
```

### Wichtige Dateien im Detail

| Datei | Zweck |
|-------|-------|
| `client/src/App.tsx` | Haupt-React-Komponente mit Routing |
| `client/src/pages/home.tsx` | Startseite mit Themenauswahl |
| `client/src/pages/vocabulary.tsx` | Vokabel-Lernseite |
| `client/src/contexts/UserContext.tsx` | Globaler State für Benutzer |
| `server/routes.ts` | API-Endpunkte Definition |
| `server/imageSearch.ts` | KI-Bildsuche Logik |
| `shared/schema.ts` | Datenbankmodell |

---

## 4. Funktionen & Logik

### Frontend-Komponenten

#### Hauptseiten
- **`welcome.tsx`** - Benutzerauswahl und Login
- **`create-user.tsx`** - Neuen Benutzer erstellen (Avatar, Name, Alter)
- **`home.tsx`** - Dashboard mit Themenauswahl und Fortschritt
- **`vocabulary.tsx`** - Vokabel-Lernmodus
- **`gap-fill.tsx`** - Lückentext-Übungen
- **`parent-area.tsx`** - PIN-geschützter Elternbereich

#### Kern-Komponenten
- **`BottomNavigation.tsx`** - App-Navigation
- **`CelebrationEffect.tsx`** - Erfolgs-Animationen
- **`CharacterFeedback.tsx`** - Virtuelle Lern-Assistentin "Mia"
- **`ProgressBar.tsx`** - Fortschrittsanzeige
- **`ImageValidator.tsx`** - KI-Bildvalidierung UI

### Backend-Logik

#### API-Endpunkte (`server/routes.ts`)
```typescript
GET  /api/users                    # Alle Benutzer abrufen
POST /api/users                    # Neuen Benutzer erstellen
GET  /api/users/:id/learning-stats # Lernstatistiken abrufen
POST /api/learning-stats           # Neue Lernstatistik speichern
POST /api/find-best-image          # KI-Bildsuche
POST /api/validate-image           # Bildvalidierung
```

#### KI-Bildsuche (`server/imageSearch.ts`)
1. **Kuratierte Bilder**: Vorab definierte, kinderfreundliche Bilder
2. **Intelligente Suche**: GPT-4o generiert optimale Suchbegriffe
3. **Qualitätsbewertung**: KI bewertet Bilder nach Relevanz und Kinderfreundlichkeit

---

## 5. Datenmodell

### Datenbank-Tabellen (PostgreSQL)

#### `users` - Benutzerprofile
```sql
id          SERIAL PRIMARY KEY
username    TEXT NOT NULL
avatar_id   INTEGER NOT NULL
age         INTEGER NOT NULL
created_at  TIMESTAMP DEFAULT NOW()
```

#### `learning_stats` - Lernfortschritt
```sql
id       SERIAL PRIMARY KEY
user_id  INTEGER NOT NULL
topic    TEXT NOT NULL
score    INTEGER NOT NULL
duration INTEGER NOT NULL  -- in Sekunden
date     TIMESTAMP DEFAULT NOW()
```

#### `achievements` - Erfolge
```sql
id          SERIAL PRIMARY KEY
user_id     INTEGER NOT NULL
type        TEXT NOT NULL     -- 'trophy' oder 'sticker'
name        TEXT NOT NULL
description TEXT NOT NULL
date_earned TIMESTAMP DEFAULT NOW()
```

#### `parent_settings` - Elterneinstellungen
```sql
id            SERIAL PRIMARY KEY
pin           TEXT DEFAULT '1234'
daily_goal    INTEGER DEFAULT 20  -- Minuten pro Tag
notifications BOOLEAN DEFAULT true
sound_effects BOOLEAN DEFAULT true
```

### Fallback-Speicherung
Bei fehlender Datenbankverbindung nutzt die App **IndexedDB** im Browser als lokale Speicherlösung.

---

## 6. KI-Integrationen

### OpenAI GPT-4o Integration

#### Bildsuche-Pipeline
1. **Thema-Analyse**: GPT generiert passende Suchbegriffe
2. **Bildkandidaten**: Erstellt URLs zu kinderfreundlichen Bildern
3. **Qualitätsbewertung**: Bewertet Bilder nach Relevanz und Sicherheit

#### Beispiel-Prompt für Farben:
```javascript
const promptColorsCategory = (color) => `
You are helping to create a vocabulary app for children aged 6 to 11.
Suggest a simple search term that will return a clear, realistic, 
and age-appropriate image representing the color "${color}".
Return only the search term (max. 4 words), nothing else.
`;
```

### Bildvalidierung
- **Vision API**: Analysiert Bilder auf Kinderfreundlichkeit
- **Automatische Ersetzung**: Schlägt bessere Bilder vor
- **Batch-Verarbeitung**: Validiert ganze Themenbereiche

---

## 7. Besonderheiten und Features

### Adaptive Bildsuche
Die App bevorzugt kuratierte, geprüfte Bilder und nutzt KI nur als Fallback:

```typescript
// Beispiel: Kuratierte Bilder haben Vorrang
if (imageMap[categoryLower]?.[wordLower]) {
  return imageMap[categoryLower][wordLower][0]; // Erstes kuratiertes Bild
} else {
  return await findBestImage(category, word, translation); // KI-Suche
}
```

### Gamification-System
- **Level-System**: Basiert auf gesammelten Erfolgen
- **Trophäen**: Für abgeschlossene Themen
- **Sticker**: Für einzelne Erfolge
- **Tagesziele**: Einstellbare Lernzeit-Ziele

### Audio-Integration
- **Text-to-Speech**: Automatische Aussprache
- **Sound-Effekte**: Feedback für Interaktionen
- **Charakterstimme**: Virtuelle Assistentin "Mia"

### Responsive Design
- **Mobile-First**: Optimiert für Tablets und Smartphones
- **Touch-Freundlich**: Große Buttons für Kinderhände
- **Kinderfreundliche UI**: Bunte, spielerische Gestaltung

---

## 8. Weiterentwicklung und Setup

### Lokale Entwicklung

#### Voraussetzungen
- Node.js 18+
- OpenAI API Key (für KI-Features)
- PostgreSQL (optional, IndexedDB als Fallback)

#### Setup-Schritte
1. **Dependencies installieren**:
   ```bash
   npm install
   ```

2. **Environment Variables** (in Replit Secrets):
   ```
   OPENAI_API_KEY=your-api-key-here
   DATABASE_URL=your-postgres-url (optional)
   ```

3. **Entwicklungsserver starten**:
   ```bash
   npm run dev
   ```

### Erweiterungsmöglichkeiten

#### Neue Themen hinzufügen
1. **Vokabeln definieren** in `client/src/lib/data.ts`
2. **Kuratierte Bilder** in `server/imageSearch.ts` hinzufügen
3. **UI-Icons** in `client/src/pages/home.tsx` ergänzen

#### Neue Übungstypen
- Multiple Choice Quiz
- Drag & Drop Übungen
- Aussprache-Training mit Speech Recognition

#### Erweiterte KI-Features
- Personalisierte Vokabelauswahl
- Schwierigkeitsanpassung
- Automatische Themengenerierung

### Deployment auf Replit
- **Automatisches Deployment**: Code-Änderungen werden automatisch deployed
- **Environment Variables**: In Replit Secrets verwalten
- **Port-Konfiguration**: App läuft standardmäßig auf Port 5000
- **Custom Domain**: Kann später hinzugefügt werden

### Performance-Optimierungen
- **React Query Caching**: API-Antworten werden gecacht
- **Lazy Loading**: Komponenten werden bei Bedarf geladen
- **Image Optimization**: Bilder werden automatisch optimiert
- **Service Worker**: Für Offline-Funktionalität (erweiterbar)

---

## 9. Troubleshooting

### Häufige Probleme

#### KI-Features funktionieren nicht
- ✅ **Lösung**: OpenAI API Key in Replit Secrets hinzufügen

#### Daten werden nicht gespeichert
- ✅ **Fallback**: App nutzt automatisch IndexedDB im Browser
- ✅ **Persistent**: Daten bleiben auch nach Browser-Neustart erhalten

#### Bilder laden nicht
- ✅ **Fallback**: App hat Standard-Bilder als Backup
- ✅ **Cache**: Browser speichert Bilder automatisch zwischen

### Debugging-Tipps
- **Browser Console**: Zeigt DetailInformationen zu API-Aufrufen
- **Network Tab**: Überwacht API-Requests
- **React DevTools**: Für Component-State-Debugging

---

## Fazit

Diese App kombiniert moderne Web-Technologien mit künstlicher Intelligenz, um eine sichere und effektive Lernumgebung für Kinder zu schaffen. Die modulare Architektur ermöglicht einfache Erweiterungen und Anpassungen.

**Nächste Schritte**: 
1. OpenAI API Key einrichten
2. Bildvalidierung testen
3. Neue Themen hinzufügen
4. Performance optimieren

Die App ist bereit für produktiven Einsatz und kann jederzeit erweitert werden! 🚀
