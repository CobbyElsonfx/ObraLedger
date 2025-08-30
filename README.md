# Obra Ledger - Funeral Management System

A modern, offline-first web application for managing funeral records, contributions, and expenses in community organizations.

## Features

- **Offline-First**: Works completely offline with IndexedDB storage
- **PWA Support**: Installable as a desktop/mobile app
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Role-Based Access**: Admin, Recorder, Viewer, and Auditor roles
- **Data Export/Import**: Backup and restore functionality
- **Real-time Dashboard**: Overview of key metrics and financials

## Tech Stack

- **Frontend**: React 19 with React Router v7
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Icons**: Lucide React
- **Database**: IndexedDB (via Dexie.js)
- **PWA**: Service Worker for offline functionality
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Frontend_Obra/obra-ledger
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `build` directory.

## Project Structure

```
obra-ledger/
├── app/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.tsx
│   │   │   └── Sidebar.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── label.tsx
│   ├── routes/
│   │   ├── _index.tsx          # Dashboard
│   │   ├── deceased.tsx        # Deceased Records
│   │   ├── contributors.tsx    # Contributors
│   │   ├── contributions.tsx   # Contributions
│   │   ├── expenses.tsx        # Expenses
│   │   ├── reports.tsx         # Reports
│   │   └── settings.tsx        # Settings
│   ├── app.css
│   └── root.tsx
├── lib/
│   ├── database.ts             # IndexedDB setup and helpers
│   └── utils.ts                # Utility functions
├── public/
│   ├── manifest.json           # PWA manifest
│   └── sw.js                   # Service worker
└── package.json
```

## Core Modules

### 1. Dashboard
- Overview of key metrics
- Total deceased, contributors, contributions, expenses
- Current balance calculation
- Quick action buttons

### 2. Deceased Records
- Add/edit deceased person information
- Track death date, burial date, status
- Representative contact information
- Photo upload support (placeholder)

### 3. Contributors
- Manage contributors by religion (Christian/Muslim/Other)
- Expected contribution amounts
- Contact information
- Grouped display by religion

### 4. Contributions
- Record payments linked to deceased and contributor
- Date tracking and notes
- Automatic arrears calculation
- Contribution history

### 5. Expenses
- Track funeral expenses
- Description, date, and amount
- Linked to specific deceased
- Expense history and totals

### 6. Reports
- Financial summaries
- Export to JSON/CSV
- Filter by date, contributor, deceased
- Balance calculations

### 7. Settings
- User management with roles
- System preferences
- Backup/restore functionality
- Default contribution amounts

## User Roles

- **Admin**: Full access to all features
- **Recorder**: Can add and edit records
- **Viewer**: Can only view reports
- **Auditor**: Read-only access to financials

## Offline Functionality

The application is designed to work completely offline:

- All data is stored locally in IndexedDB
- Service worker caches essential assets
- Backup/restore via JSON export/import
- No internet connection required for core functionality

## Data Backup & Restore

### Backup
- Click "Backup Data" in the sidebar
- Downloads a JSON file with all data
- Includes deceased, contributors, contributions, expenses, users, and settings

### Restore
- Click "Restore Data" in the sidebar
- Select a previously exported JSON file
- All existing data will be replaced with the imported data

## PWA Features

- Installable on desktop and mobile devices
- Offline functionality
- App-like experience
- Automatic updates when new versions are available

## Development

### Adding New Components

1. Create components in `app/components/ui/` for reusable UI components
2. Use shadcn/ui patterns for consistency
3. Import from `~/components/ui/` using the configured alias

### Database Operations

All database operations are handled through the `databaseHelpers` object in `lib/database.ts`:

```typescript
import { databaseHelpers } from "~/lib/database";

// Add a new deceased record
await databaseHelpers.addDeceased({
  name: "John Doe",
  age: 75,
  gender: "male",
  deathDate: "2024-01-15",
  burialDate: "2024-01-20",
  representativeName: "Jane Doe",
  representativePhone: "+233123456789",
  status: "pending"
});
```

### Styling

- Use Tailwind CSS classes for styling
- Follow the design system defined in `app/app.css`
- Use shadcn/ui components for consistent UI

## Deployment

### Static Hosting

The application can be deployed to any static hosting service:

1. Build the application: `npm run build`
2. Upload the contents of the `build` directory
3. Ensure the service worker and manifest are accessible

### Recommended Hosting

- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
