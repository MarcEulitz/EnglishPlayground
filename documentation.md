
# Mias Englischwelt - Technische Dokumentation

## 1. App-Zweck und Zielgruppe

### Was ist Mias Englischwelt?
**Mias Englischwelt** ist eine interaktive Web-App zum Englischlernen für Kinder. Sie macht das Sprachenlernen spielerisch und motivierend durch:
- Bildbasiertes Vokabeltraining
- Lückentexte mit Drag & Drop
- Charaktere, die Feedback geben
- Belohnungssystem mit Trophäen und Stickern
- Fortschrittsverfolgung für Eltern

### Zielgruppe
- **Hauptnutzer**: Kinder im Alter von 6-11 Jahren
- **Sekundärnutzer**: Eltern (Fortschrittskontrolle und Einstellungen)
- **Einsatzbereich**: Zu Hause, in der Schule, unterwegs

## 2. Verwendete Technologien

### Frontend (Client)
- **React 18** mit TypeScript - Moderne UI-Entwicklung
- **Vite** - Schnelles Build-Tool und Entwicklungsserver
- **Wouter** - Leichtgewichtige Routing-Bibliothek
- **TailwindCSS** - Utility-First CSS Framework
- **Radix UI + ShadCN** - Hochwertige UI-Komponenten
- **TanStack React Query** - API-Datenmanagement
- **IndexedDB** - Client-seitige Datenspeicherung (Offline-Fallback)

### Backend (Server)
- **Node.js** mit Express.js - Web-Server
- **TypeScript** - Typisierte JavaScript-Entwicklung
- **Drizzle ORM** - Datenbankzugriff und Migrationen
- **PostgreSQL** - Hauptdatenbank (mit IndexedDB als Fallback)
- **Zod** - Schema-Validierung für APIs

### KI-Integration
- **OpenAI GPT-4o** - Intelligente Bildauswahl und -validierung
- **Text-to-Speech APIs** - Aussprache und Audio-Feedback

### Deployment & Tools
- **Replit** - Hosting und Entwicklungsumgebung
- **Vite Dev Server** - Hot Module Replacement für Entwicklung

## 3. Projektstruktur

```
├── client/                 # Frontend (React App)
│   ├── src/
│   │   ├── components/     # Wiederverwendbare UI-Komponenten
│   │   │   ├── ui/         # ShadCN UI-Komponenten
│   │   │   ├── AudioWave.tsx
│   │   │   ├── AvatarSelection.tsx
│   │   │   ├── BottomNavigation.tsx
│   │   │   ├── CelebrationEffect.tsx
│   │   │   ├── CharacterFeedback.tsx
│   │   │   ├── ImageValidator.tsx
│   │   │   ├── PinEntry.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── StarRating.tsx
│   │   ├── pages/         # Hauptseiten der App
│   │   │   ├── welcome.tsx        # Startseite mit Benutzerauswahl
│   │   │   ├── create-user.tsx    # Neue Benutzer erstellen
│   │   │   ├── home.tsx           # Hauptmenü mit Lernkategorien
│   │   │   ├── vocabulary.tsx     # Vokabeltraining
│   │   │   ├── gap-fill.tsx       # Lückentext-Übungen
│   │   │   ├── success.tsx        # Erfolgsseite nach Übungen
│   │   │   └── parent-area.tsx    # Elternbereich
│   │   ├── hooks/         # Custom React Hooks
│   │   │   ├── use-audio.ts       # Audio-System
│   │   │   ├── use-indexeddb.ts   # Offline-Datenspeicherung
│   │   │   └── use-toast.ts       # Benachrichtigungen
│   │   ├── contexts/      # React Context für Zustandsmanagement
│   │   │   └── UserContext.tsx    # Globaler App-Zustand
│   │   ├── lib/           # Hilfsfunktionen und Daten
│   │   │   ├── data.ts            # Vokabeldaten und Themen
│   │   │   ├── utils.ts           # Hilfsfunktionen
│   │   │   └── queryClient.ts     # API-Konfiguration
│   │   ├── App.tsx        # Haupt-App-Komponente
│   │   ├── main.tsx       # React-Einstiegspunkt
│   │   └── index.css      # Globale Styles
│   └── index.html         # HTML-Template
├── server/                # Backend (Express Server)
│   ├── index.ts          # Server-Startpunkt
│   ├── routes.ts         # API-Endpunkte
│   ├── storage.ts        # Datenbankoperationen
│   ├── imageSearch.ts    # KI-gestützte Bildsuche
│   ├── imageValidator.ts # KI-Bildvalidierung
│   ├── db.ts            # Datenbank-Konfiguration
│   └── vite.ts          # Vite-Integration
├── shared/               # Geteilte Typen und Schemas
│   └── schema.ts         # Datenbankschemas mit Zod
├── public/               # Statische Dateien
└── package.json          # Projekt-Konfiguration
```

### Wichtigste Dateien im Detail

#### Frontend-Kern
- **`App.tsx`**: Haupt-Router und Layout der Anwendung
- **`UserContext.tsx`**: Verwaltet Benutzerdaten, Lernstatistiken und App-Zustand
- **`home.tsx`**: Startseite mit allen Lernkategorien und Fortschrittsanzeige

#### Backend-Kern
- **`server/index.ts`**: Express-Server mit Port 5000 (Replit-Standard)
- **`server/routes.ts`**: Alle API-Endpunkte für Frontend-Backend-Kommunikation
- **`server/storage.ts`**: Datenbankzugriff mit Drizzle ORM

## 4. Funktionen & Logik

### Benutzer-Management
**Dateien**: `welcome.tsx`, `create-user.tsx`, `UserContext.tsx`

- **Benutzerprofile erstellen**: Kinder wählen Namen, Avatar und Alter
- **Profilauswahl**: Einfache Auswahl beim App-Start
- **Mehrbenutzer-Support**: Verschiedene Kinder können eigene Profile haben

```typescript
// Beispiel: Benutzer erstellen
const createUser = async (userData: InsertUser) => {
  const user = await storage.createUser(userData);
  setCurrentUser(user);
};
```

### Lernaktivitäten

#### Vokabeltraining (`vocabulary.tsx`)
- **Bildbasiertes Lernen**: Zeigt Bilder mit deutschen Übersetzungen
- **Audio-Aussprache**: Kinder hören englische Wörter
- **Multiple Choice**: 4 Antwortmöglichkeiten pro Frage
- **Sofortiges Feedback**: Charaktere geben motivierendes Feedback

```typescript
// Beispiel: Frage beantworten
const handleOptionClick = (option: string) => {
  const correct = option === currentQuestion.word;
  if (correct) {
    playAudio('correct');
    playCharacterPhrase('correct', { character: 'mia' });
    setScore(score + 1);
  }
};
```

#### Lückentext-Übungen (`gap-fill.tsx`)
- **Kontextbasiertes Lernen**: Vollständige Sätze mit fehlenden Wörtern
- **Drag & Drop Interface**: Intuitive Bedienung für Kinder
- **Verschiedene Schwierigkeitsgrade**: Je nach Alter und Fortschritt

### Audio-System (`use-audio.ts`)
- **Sprachausgabe**: Charakterstimmen für Feedback
- **Wort-Aussprache**: Englische Vokabeln anhören
- **Sound-Effekte**: Für Interaktionen und Erfolge
- **Elternkontrolle**: Audio kann deaktiviert werden

```typescript
// Beispiel: Audio abspielen
const playWord = (word: string) => {
  const audio = new Audio(`/api/speech/${word}`);
  audio.play();
};
```

### Fortschrittssystem
**Dateien**: `ProgressBar.tsx`, Achievement-System

- **Level-System**: Fortschritt basierend auf abgeschlossenen Übungen
- **Trophäen**: Für große Meilensteine (z.B. 50 richtige Antworten)
- **Sticker**: Für tägliche Ziele und kleinere Erfolge
- **Lernzeit-Tracking**: Verfolgt täglich verbrachte Zeit

### Elternbereich (`parent-area.tsx`)
- **PIN-Schutz**: Standardmäßig "1234", anpassbar
- **Lernstatistiken**: Detaillierte Übersicht pro Kind
- **Einstellungen**: Tägliche Lernziele, Audio-Kontrolle
- **Fortschrittsvisualisierung**: Diagramme und Übersichten

## 5. Datenmodell

### Datenbank-Tabellen (PostgreSQL/IndexedDB)

#### users (Benutzer)
```typescript
{
  id: number,           // Eindeutige Benutzer-ID
  username: string,     // Anzeigename des Kindes
  avatarId: number,     // Gewähltes Avatar-Bild (1-6)
  age: number,          // Alter für angepasste Inhalte
  createdAt: Date       // Erstellungsdatum
}
```

#### learningStats (Lernstatistiken)
```typescript
{
  id: number,           // Eindeutige Statistik-ID
  userId: number,       // Verweis auf Benutzer
  topic: string,        // Lernthema (z.B. "animals", "colors")
  score: number,        // Erreichte Punkte (0-5 pro Übung)
  duration: number,     // Lernzeit in Sekunden
  date: Date           // Zeitstempel der Aktivität
}
```

#### achievements (Erfolge/Belohnungen)
```typescript
{
  id: number,           // Eindeutige Achievement-ID
  userId: number,       // Verweis auf Benutzer
  type: string,         // "trophy" oder "sticker"
  name: string,         // Name des Erfolgs
  description: string,  // Beschreibung der Leistung
  dateEarned: Date     // Zeitpunkt der Auszeichnung
}
```

#### parentSettings (Elterneinstellungen)
```typescript
{
  id: number,           // Eindeutige Einstellungs-ID
  pin: string,          // Eltern-PIN (Standard: "1234")
  dailyGoal: number,    // Tägliches Lernziel in Minuten (Standard: 20)
  notifications: boolean, // Benachrichtigungen aktiviert
  soundEffects: boolean   // Audio-Effekte aktiviert
}
```

### Datenspeicherung
- **Produktiv**: PostgreSQL-Datenbank (über Drizzle ORM)
- **Entwicklung/Offline**: IndexedDB im Browser als Fallback
- **API-Kommunikation**: RESTful Endpoints mit JSON-Datenformat

## 6. Integrationen

### OpenAI GPT-4o Integration
**Dateien**: `imageSearch.ts`, `imageValidator.ts`

#### Intelligente Bildsuche
- **Zweck**: Findet semantisch passende, kinderfreundliche Bilder
- **Funktionsweise**: GPT-4o bewertet Bildkandidaten nach Relevanz und Kindertauglichkeit
- **Beispiel**: Für "motorcycle" + "wheel" findet es spezifisch Motorradräder (nicht Fahrradräder)

```typescript
// Beispiel: Bildsuche mit KI
const findBestImage = async (category: string, word: string, translation: string) => {
  const candidates = await generateImageCandidates(category, word, translation);
  const evaluation = await evaluateImageCandidates(candidates, category, word, translation);
  return evaluation.bestImageUrl;
};
```

#### Bildvalidierung
- **Qualitätskontrolle**: Überprüft vorhandene Bilder auf Korrektheit
- **Batch-Verarbeitung**: Kann ganze Kategorien auf einmal validieren
- **Feedback-System**: Schlägt bessere Alternativen vor

### Text-to-Speech (Geplant)
- **Aussprache-Training**: Kinder hören korrekte englische Aussprache
- **Charakterstimmen**: Verschiedene Stimmen für Mia, Buddy und andere Charaktere
- **Mehrsprachigkeit**: Deutsch für Anweisungen, Englisch für Vokabeln

### Replit-Integration
- **Hosting**: App läuft vollständig auf Replit
- **Automatisches Deployment**: Änderungen werden sofort live geschaltet
- **Umgebungsvariablen**: Sichere Speicherung von API-Keys
- **Port-Weiterleitung**: Port 5000 wird automatisch öffentlich zugänglich gemacht

## 7. Besonderheiten und Erweiterungsmöglichkeiten

### Aktuelle Besonderheiten

#### Adaptive Lernkategorien
- **Vordefinierte Themen**: Tiere, Farben, Zahlen, Familie, Essen, etc.
- **Benutzerdefinierte Themen**: Eltern/Kinder können eigene Kategorien hinzufügen
- **KI-generierte Inhalte**: Neue Themen werden automatisch mit passenden Bildern gefüllt

#### Gamification-Elemente
- **Lebenssystem**: 3 Leben pro Übung, motiviert zu Konzentration
- **Charaktere mit Persönlichkeit**: Mia (ermutigend), Buddy (unterstützend)
- **Fortschritts-Visualisierung**: Sterne, Level, Prozentbalken

#### Responsive Design
- **Tablet-optimiert**: Hauptzielgerät für Kinder
- **Smartphone-tauglich**: Funktioniert auch unterwegs
- **Touch-freundlich**: Große Buttons, intuitive Gesten

### Mögliche Erweiterungen

#### Neue Lernmodule
- **Hörverstehen**: Audio-Geschichten mit Verständnisfragen
- **Spracherkennung**: Aussprache-Training mit KI-Feedback
- **Schreibtraining**: Buchstaben und Wörter nachzeichnen
- **Dialoge**: Rollenspiele mit KI-Charakteren

#### Erweiterte Gamification
- **Multiplayer-Modus**: Lernen mit Freunden und Geschwistern
- **Wöchentliche Challenges**: Besondere Aufgaben und Wettbewerbe
- **Sammelkarten-System**: Virtuelle Belohnungen für Fortschritte
- **Story-Modus**: Lernfortschritt in Abenteuer-Geschichten eingebettet

#### Technische Verbesserungen
- **Progressive Web App (PWA)**: Installation als echte App auf Geräten
- **Push-Notifications**: Freundliche Erinnerungen an Lernzeiten
- **Offline-First Architecture**: Vollständige Funktionalität ohne Internet
- **Erweiterte Analytics**: Detaillierte Lernmuster und Empfehlungen

#### Pädagogische Features
- **Adaptive Schwierigkeit**: KI passt Schwierigkeitsgrad automatisch an
- **Spaced Repetition**: Intelligente Wiederholung schwieriger Vokabeln
- **Lehrerbereich**: Tools für Schulen und Klassenmanagement
- **Curriculum-Integration**: Anpassung an nationale Lehrpläne

## 8. Hinweise zur lokalen Weiterentwicklung

### Entwicklungsumgebung Setup

#### Voraussetzungen
- **Node.js 18+** installiert
- **Git** für Versionskontrolle
- **Code-Editor** (VS Code empfohlen)
- **PostgreSQL** (optional, nutzt IndexedDB als Fallback)

#### Erste Schritte
```bash
# 1. Projekt klonen (falls extern)
git clone <repository-url>
cd englisch-lern-app

# 2. Abhängigkeiten installieren
npm install

# 3. Umgebungsvariablen setzen (optional)
# Erstelle .env-Datei in server/ für:
# DATABASE_URL=postgresql://user:password@host:port/database
# OPENAI_API_KEY=sk-...

# 4. Datenbank initialisieren (falls PostgreSQL verfügbar)
npm run db:push

# 5. Entwicklungsserver starten
npm run dev
```

#### Wichtige npm-Befehle
- **`npm run dev`**: Startet Frontend und Backend gleichzeitig
- **`npm run build`**: Erstellt Production-Build des Frontends
- **`npm run db:push`**: Synchronisiert Datenbankschema mit Code
- **`npm run db:studio`**: Öffnet Drizzle Studio (Datenbank-GUI)

### Arbeiten mit der Codebase

#### Neue Lernkategorien hinzufügen
```typescript
// 1. Vokabeldaten erweitern (client/src/lib/data.ts)
export const vocabularyData = {
  // ... bestehende Kategorien
  newCategory: [
    { word: "example", translation: "Beispiel", imageUrl: "..." }
  ]
};

// 2. UI-Icon hinzufügen (client/src/pages/home.tsx)
<button onClick={() => handleCategoryClick('newCategory')}>
  <i className="ri-new-icon"></i>
  <span>Neue Kategorie</span>
</button>
```

#### Neue UI-Komponenten erstellen
```typescript
// 1. Komponente erstellen (client/src/components/NewComponent.tsx)
import React from 'react';

interface Props {
  title: string;
  onClick: () => void;
}

export const NewComponent: React.FC<Props> = ({ title, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="bg-primary text-white p-4 rounded-xl"
    >
      {title}
    </button>
  );
};

// 2. Komponente verwenden
import { NewComponent } from '@/components/NewComponent';
```

#### API-Endpunkte erweitern
```typescript
// 1. Route definieren (server/routes.ts)
app.get("/api/new-endpoint", async (req, res) => {
  try {
    const data = await storage.getNewData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Fehler beim Laden" });
  }
});

// 2. Frontend-Hook erstellen
export const useNewData = () => {
  return useQuery({
    queryKey: ['newData'],
    queryFn: () => fetch('/api/new-endpoint').then(res => res.json())
  });
};
```

### Debugging-Tipps

#### Frontend-Debugging
- **Browser-Entwicklertools**: F12 → Console für Fehler und Logs
- **React Developer Tools**: Browser-Extension für Component-Debugging
- **Network-Tab**: API-Aufrufe und Antworten überwachen

#### Backend-Debugging
- **Server-Logs**: Terminal beobachten für Express-Logs
- **API-Tests**: Postman oder curl für Endpoint-Tests
- **Datenbank-Inspektion**: Drizzle Studio mit `npm run db:studio`

#### Häufige Probleme lösen

**Problem**: Frontend kann Backend nicht erreichen
```bash
# Lösung: Server-URL prüfen
console.log("API Base URL:", import.meta.env.VITE_API_URL);
```

**Problem**: Datenbank-Verbindung fehlgeschlagen
```bash
# Lösung: Umgebungsvariablen prüfen
echo $DATABASE_URL
# Oder IndexedDB-Fallback verwenden (automatisch)
```

**Problem**: Audio funktioniert nicht
```javascript
// Lösung: Browser-Autoplay-Richtlinien beachten
const playAudio = async () => {
  try {
    await audio.play();
  } catch (error) {
    console.log("Autoplay blocked - User interaction required");
  }
};
```

### Deployment auf Replit

#### Automatisches Deployment
- **Git Push**: Änderungen werden automatisch deployed
- **Hot Reload**: Entwicklungsserver startet automatisch neu
- **Environment Variables**: Über Replit Secrets verwalten

#### Production-Deployment
```bash
# Build erstellen
npm run build

# Production-Server (falls gewünscht)
NODE_ENV=production npm start
```

### Nützliche Ressourcen

#### Dokumentation
- **React**: https://react.dev/
- **TailwindCSS**: https://tailwindcss.com/docs
- **Drizzle ORM**: https://orm.drizzle.team/
- **OpenAI API**: https://platform.openai.com/docs

#### Tools
- **Figma**: UI-Design und Prototyping
- **Canva**: Grafiken und Icons erstellen
- **Unsplash**: Lizenzfreie Bilder für Vokabeln

---

## Schlusswort

Diese Dokumentation soll dir helfen, die App zu verstehen und weiterzuentwickeln. Zögere nicht, Code zu experimentieren und neue Features auszuprobieren. Das Lernen durch Machen ist der beste Weg!

**Viel Erfolg beim Programmieren! 🚀**
