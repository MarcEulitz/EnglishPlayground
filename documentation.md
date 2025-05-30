
# Mias Englischwelt - Technische Dokumentation

## 1. App-Zweck und Zielgruppe

### Was ist "Mias Englischwelt"?
Eine interaktive Englisch-Lern-App speziell für Kinder im Alter von 6-11 Jahren. Die App macht das Englischlernen spielerisch und motivierend durch:

- **Vokabeltraining** mit Bildern und Audio
- **Lückentexte** zum Üben der Grammatik
- **Belohnungssystem** mit Trophäen und Stickern
- **Fortschrittsverfolgung** für Eltern
- **Gamification** mit Levels und Achievements

### Zielgruppe
- **Primär**: Kinder (6-11 Jahre) zum selbstständigen Englischlernen
- **Sekundär**: Eltern zur Überwachung des Lernfortschritts
- **Tertiär**: Lehrkräfte als Unterrichtsunterstützung

## 2. Verwendete Technologien

### Frontend (Client)
- **React 18** mit TypeScript - Moderne UI-Komponenten
- **Wouter** - Leichtgewichtiges Routing
- **TanStack React Query** - Datenmanagement und API-Calls
- **Tailwind CSS** - Utility-First CSS Framework
- **ShadCN UI** - Vorgefertigte UI-Komponenten
- **IndexedDB** - Lokale Datenspeicherung (Fallback)

### Backend (Server)
- **Node.js** mit Express.js - Web-Server
- **TypeScript** - Typsichere Programmierung
- **Drizzle ORM** - Datenbankzugriff
- **PostgreSQL** - Hauptdatenbank
- **Zod** - Schema-Validierung

### Externe Services
- **OpenAI API** - KI-gestützte Bildvalidierung
- **Unsplash/Pexels** - Hochwertige Lernbilder
- **Freesound.org** - Audio-Effekte
- **Google Fonts** - Schriftarten (Nunito)
- **Remix Icons** - Icon-Bibliothek

## 3. Projektstruktur

```
├── client/                 # Frontend (React App)
│   ├── src/
│   │   ├── components/     # Wiederverwendbare UI-Komponenten
│   │   ├── pages/         # Hauptseiten der App
│   │   ├── hooks/         # Custom React Hooks
│   │   ├── contexts/      # React Context für Zustandsmanagement
│   │   └── lib/           # Hilfsfunktionen und Daten
│   └── index.html         # Haupt-HTML-Datei
├── server/                # Backend (Express Server)
│   ├── routes.ts          # API-Endpunkte
│   ├── storage.ts         # Datenbankoperationen
│   ├── imageValidator.ts  # KI-Bildvalidierung
│   └── index.ts           # Server-Startpunkt
├── shared/                # Geteilte Typen und Schemas
│   └── schema.ts          # Datenbankschemas
└── public/                # Statische Dateien
```

### Wichtige Dateien im Detail

#### Frontend-Hauptdateien
- `client/src/App.tsx` - Haupt-App-Komponente mit Routing
- `client/src/pages/home.tsx` - Startseite mit Lernkategorien
- `client/src/pages/vocabulary.tsx` - Vokabeltraining
- `client/src/pages/parent-area.tsx` - Elternbereich mit Statistiken
- `client/src/contexts/UserContext.tsx` - Globaler App-Zustand

#### Backend-Hauptdateien
- `server/index.ts` - Express-Server-Setup
- `server/routes.ts` - Alle API-Routen
- `server/storage.ts` - Datenbankzugriff-Logik
- `shared/schema.ts` - Datenbank-Tabellen-Definitionen

## 4. Funktionen & Logik

### Benutzer-Management
**Datei**: `client/src/pages/welcome.tsx`, `client/src/pages/create-user.tsx`
- Benutzerprofile erstellen mit Avatar-Auswahl
- Altersangabe für angepasste Inhalte
- Profilauswahl beim App-Start

### Lernaktivitäten

#### Vokabeltraining
**Datei**: `client/src/pages/vocabulary.tsx`
- Zeigt Bilder mit englischen Wörtern
- Audio-Wiedergabe für Aussprache
- Multiple-Choice-Antworten
- Sofortiges Feedback mit Charakteranimationen

#### Lückentexte
**Datei**: `client/src/pages/gap-fill.tsx`
- Sätze mit fehlenden Wörtern
- Drag & Drop oder Eingabe-Interface
- Kontextbasiertes Lernen

### Fortschrittssystem
**Datei**: `client/src/components/ProgressBar.tsx`, Achievement-System
- Level-System basierend auf abgeschlossenen Aktivitäten
- Trophäen für Meilensteine
- Sticker für tägliche Ziele
- Lernzeit-Tracking

### Elternbereich
**Datei**: `client/src/pages/parent-area.tsx`
- PIN-geschützter Zugang (Standard: 1234)
- Lernstatistiken pro Kind
- Einstellungen für tägliche Lernziele
- Audio-/Benachrichtigungseinstellungen

### Audio-System
**Datei**: `client/src/hooks/use-audio.ts`
- Charakterstimmen für Feedback
- Sound-Effekte für Interaktionen
- Aussprache-Audio für Vokabeln
- Ein/Aus-Schaltung durch Eltern

## 5. Datenmodell

### Tabellen-Struktur

#### users (Benutzer)
```typescript
{
  id: number,           // Eindeutige Benutzer-ID
  username: string,     // Anzeigename des Kindes
  avatarId: number,     // Gewähltes Avatar-Bild
  age: number,          // Alter für angepasste Inhalte
  createdAt: Date       // Erstellungsdatum
}
```

#### learningStats (Lernstatistiken)
```typescript
{
  id: number,           // Eindeutige Statistik-ID
  userId: number,       // Verweis auf Benutzer
  topic: string,        // Lernthema (z.B. "animals")
  score: number,        // Erreichte Punkte (0-5)
  duration: number,     // Lernzeit in Sekunden
  date: Date           // Zeitstempel der Aktivität
}
```

#### achievements (Erfolge)
```typescript
{
  id: number,           // Eindeutige Achievement-ID
  userId: number,       // Verweis auf Benutzer
  type: string,         // "trophy" oder "sticker"
  name: string,         // Name des Erfolgs
  description: string,  // Beschreibung
  dateEarned: Date     // Zeitpunkt der Auszeichnung
}
```

#### parentSettings (Elterneinstellungen)
```typescript
{
  id: number,           // Eindeutige Einstellungs-ID
  pin: string,          // Eltern-PIN (Standard: "1234")
  dailyGoal: number,    // Tägliches Lernziel in Minuten
  notifications: boolean, // Benachrichtigungen an/aus
  soundEffects: boolean   // Audio-Effekte an/aus
}
```

### Datenspeicherung
- **Primär**: PostgreSQL-Datenbank über Drizzle ORM
- **Fallback**: IndexedDB im Browser (bei Verbindungsproblemen)
- **Cache**: React Query für optimierte API-Anfragen

## 6. Integrationen

### OpenAI API Integration
**Datei**: `server/imageValidator.ts`
- **Zweck**: Automatische Validierung von Lernbildern
- **Funktionen**:
  - Überprüfung, ob Bilder zum Lernwort passen
  - Bewertung der Bildqualität für Kinder
  - Vorschläge für bessere Alternativen

```typescript
// Beispiel einer Bildvalidierung
const result = await validateImage(
  "https://example.com/cat-image.jpg",
  "cat",           // Englisches Wort
  "Katze",         // Deutsche Übersetzung
  "animals"        // Kategorie
);
```

### Unsplash/Pexels Bildsuche
**Datei**: `server/imageSearch.ts`
- Kuratierte, kinderfreundliche Bilder
- Automatische Bildoptimierung
- Fallback-Strategien bei fehlenden Bildern

### Audio-Integration
- **Freesound.org**: Lizenzfreie Sound-Effekte
- **Web Speech API**: Zukünftige Spracherkennung
- **HTML5 Audio**: Plattformübergreifende Wiedergabe

## 7. Besonderheiten und Erweiterungsmöglichkeiten

### Aktuelle Besonderheiten

#### KI-gestützte Bildvalidierung
- Automatische Qualitätskontrolle von Lernmaterialien
- Kontextbewertung für Altersangemessenheit
- Kontinuierliche Verbesserung der Bilddatenbank

#### Offline-Funktionalität
- IndexedDB als Fallback bei Netzwerkproblemen
- Lokale Zwischenspeicherung von Lerninhalten
- Synchronisation bei Wiederverbindung

#### Responsive Design
- Optimiert für Tablets (Hauptzielgerät)
- Funktioniert auf Smartphones und Desktops
- Touch-freundliche Benutzeroberfläche

### Mögliche Erweiterungen

#### Neue Lernmodule
- **Hörverständnis**: Audio-Geschichten mit Fragen
- **Spracherkennung**: Aussprache-Training mit Feedback
- **Schreibtraining**: Buchstaben und Wörter nachzeichnen
- **Dialoge**: Rollenspiele mit KI-Charakteren

#### Erweiterte Gamification
- **Multiplayer**: Lernen mit Freunden
- **Wettbewerbe**: Wöchentliche Challenges
- **Sammelkarten**: Virtuelle Belohnungen
- **Geschichten**: Lernfortschritt in Abenteuern

#### Technische Verbesserungen
- **PWA**: Installation als App auf Geräten
- **Push-Notifications**: Erinnerungen an Lernzeiten
- **Offline-First**: Vollständige Offline-Funktionalität
- **Analytics**: Detaillierte Lernanalysen

#### Pädagogische Features
- **Adaptive Schwierigkeit**: KI passt Schwierigkeitsgrad an
- **Personalisierte Wiederholung**: Spaced Repetition System
- **Lehrerbereich**: Tools für Schulen und Klassen
- **Curriculum-Integration**: Anpassung an Lehrpläne

## 8. Hinweise zur lokalen Weiterentwicklung

### Entwicklungsumgebung Setup

#### Voraussetzungen
- Node.js 18+ installiert
- PostgreSQL-Datenbank (optional, nutzt IndexedDB als Fallback)
- Code-Editor (VS Code empfohlen)

#### Erste Schritte
```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Umgebungsvariablen setzen (optional)
# Erstelle .env-Datei in server/ für:
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...

# 3. Datenbank initialisieren (falls verfügbar)
npm run db:push

# 4. Entwicklungsserver starten
npm run dev
```

#### Wichtige npm-Befehle
- `npm run dev` - Startet Frontend und Backend gleichzeitig
- `npm run build` - Erstellt Production-Build
- `npm run db:push` - Synchronisiert Datenbankschema
- `npm run db:studio` - Öffnet Drizzle Studio (DB-GUI)

### Arbeiten mit der Codebase

#### Neue Lernkategorien hinzufügen
1. **Vokabeldaten erweitern** (`client/src/lib/data.ts`)
2. **Icons hinzufügen** (`client/src/pages/home.tsx`)
3. **Routing aktualisieren** (`client/src/App.tsx`)

#### Neue UI-Komponenten erstellen
1. **Komponente erstellen** in `client/src/components/`
2. **Styling** mit Tailwind CSS
3. **Integration** in bestehende Seiten

#### API-Endpunkte erweitern
1. **Route definieren** in `server/routes.ts`
2. **Datenbankzugriff** in `server/storage.ts`
3. **Schema validieren** mit Zod

### Debugging-Tipps

#### Frontend-Debugging
- Browser-Entwicklertools verwenden
- React Developer Tools installieren
- Console.log für Zustandsanalyse

#### Backend-Debugging
- Server-Logs in Terminal beobachten
- API-Endpunkte mit Postman testen
- Datenbankzustand mit Drizzle Studio prüfen

#### Häufige Probleme
- **CORS-Fehler**: Server und Client-URLs prüfen
- **Datenbank-Verbindung**: DATABASE_URL überprüfen
- **Audio-Probleme**: Browser-Autoplay-Richtlinien beachten

### Deployment auf Replit

#### Automatisches Deployment
- Code-Änderungen werden automatisch deployed
- Build-Prozess läuft bei jeder Aktualisierung
- Logs in der Replit-Konsole verfolgen

#### Umgebungsvariablen setzen
1. Replit Secrets-Tool verwenden
2. Sensitive Daten (API-Keys) dort speichern
3. In Code mit `process.env.VARIABLE_NAME` abrufen

#### Performance-Optimierung
- Bilder komprimieren vor Upload
- API-Requests minimieren
- Cache-Strategien nutzen

### Best Practices für Weiterentwicklung

#### Code-Organisation
- **Komponenten**: Klein und wiederverwendbar halten
- **Hooks**: Logik aus Komponenten extrahieren
- **Typen**: TypeScript für Typsicherheit nutzen

#### Testing-Strategien
- Manuelle Tests auf verschiedenen Geräten
- Automatisierte Tests für kritische Funktionen
- Benutzertests mit echten Kindern

#### Sicherheitsüberlegungen
- Eingabe-Validierung auf Client und Server
- API-Keys sicher speichern
- Kinderfreundliche Inhalte sicherstellen

---

## Zusammenfassung

Mias Englischwelt ist eine vollständige, moderne Web-Anwendung, die spielerisches Englischlernen für Kinder ermöglicht. Die Architektur ist sauber getrennt zwischen Frontend (React) und Backend (Express), mit einer robusten Datenschicht und KI-Integration für verbesserte Lerninhalte.

Die App ist bereit für Erweiterungen und kann sowohl pädagogisch als auch technisch weiterentwickelt werden. Die verwendeten Technologien sind aktuell und ermöglichen eine einfache Wartung und Skalierung.
