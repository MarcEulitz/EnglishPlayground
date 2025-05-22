# Mias Englischwelt - Interactive English Learning App for Kids

## Overview

Mias Englischwelt is an interactive English learning application for children aged 6-11. The app provides engaging vocabulary learning activities, gap-fill exercises, and a parent dashboard to monitor learning progress. It features a colorful, child-friendly UI with audio feedback, achievements, and gamification elements to make learning English fun and motivating.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The application uses React (with TypeScript) for the frontend with the following key technologies:
- React for component-based UI development
- Wouter for lightweight routing
- TanStack React Query for API data fetching
- Tailwind CSS for styling with a custom theme
- ShadCN UI components built on Radix UI primitives
- IndexedDB for client-side data persistence (used in development/when DB is not available)

### Backend Architecture

The backend is built with:
- Express.js as the Node.js web framework
- Drizzle ORM for database access
- PostgreSQL as the database (configured but may need to be set up)
- Zod for schema validation

The app follows a monorepo structure with shared schema definitions between frontend and backend.

### Data Persistence

The application employs a dual persistence strategy:
1. **Primary persistence**: PostgreSQL database accessed through Drizzle ORM
2. **Fallback persistence**: IndexedDB for offline/development mode via the `useIndexedDB` hook

### Authentication System

The application uses a simple PIN-based authentication system for the parent area, stored in the database or locally in IndexedDB. This is not a full security system but appropriate for the target audience.

## Key Components

### Frontend Components

1. **User Management**
   - User creation and selection interface
   - Avatar selection and age input
   - User profile management

2. **Learning Activities**
   - Vocabulary learning with image associations
   - Gap-fill exercises with immediate feedback
   - Progress tracking and scoring

3. **Achievement System**
   - Trophies and stickers for completing activities
   - Level progression based on achievements
   - Visual celebration effects

4. **Parent Dashboard**
   - PIN-protected parent area
   - Learning statistics and progress reports
   - Setting daily goals and toggling features

### Backend Components

1. **API Layer**
   - RESTful API endpoints for user management, learning stats, and achievements
   - Data validation with Zod schemas

2. **Data Storage**
   - Schema definitions for users, learning stats, achievements, and parent settings
   - Drizzle ORM configurations for PostgreSQL

3. **Development Tools**
   - Vite development server integration
   - Request logging middleware

## Data Flow

1. **User Creation and Selection**
   - User creates profile with username, avatar, and age
   - Data is stored in the database/IndexedDB
   - User selects profile from the welcome screen

2. **Learning Process**
   - User selects a learning activity and topic
   - App fetches relevant learning content
   - User completes activities, receiving immediate feedback
   - Learning statistics are recorded

3. **Achievement System**
   - System checks completion criteria after activities
   - Awards achievements when criteria are met
   - Displays celebration effects

4. **Parent Monitoring**
   - Parent authenticates via PIN
   - System retrieves and displays learning statistics
   - Parent can adjust settings that affect the learning experience

## External Dependencies

### UI Components
- Radix UI primitive components
- ShadCN UI component library
- Tailwind CSS for styling

### Data Management
- Drizzle ORM for database operations
- Zod for schema validation
- TanStack React Query for data fetching

### Audio and Visual
- Remote audio files (freesound.org) for sound effects
- External font (Nunito) and icon (Remix Icon) libraries

## Deployment Strategy

The application is configured for deployment on Replit with:

1. **Build Process**
   - Vite for frontend bundle generation
   - ESBuild for server-side code bundling

2. **Runtime Environment**
   - Node.js 20 for server execution
   - PostgreSQL 16 for data persistence

3. **Configuration**
   - Environment variables for database connection
   - Development/production mode detection

The deployment workflow is defined in the `.replit` file, which specifies build and run commands.

## Development Guidelines

1. **Database Setup**
   - Run `npm run db:push` to initialize the database schema
   - Ensure the `DATABASE_URL` environment variable is set

2. **Development Mode**
   - Use `npm run dev` to start the development server
   - IndexedDB will be used if the database is not available

3. **Code Organization**
   - Client code in `client/src/`
   - Server code in `server/`
   - Shared schemas in `shared/`
   - UI components in `client/src/components/`
   - Pages in `client/src/pages/`

4. **API Implementation**
   - Follow the pattern in `server/routes.ts` for new endpoints
   - Use Zod schemas from `shared/schema.ts` for validation

5. **UI Development**
   - Follow the design system established in `client/src/index.css`
   - Use existing UI components from `client/src/components/ui/`
   - Maintain the child-friendly aesthetic with rounded corners and vibrant colors