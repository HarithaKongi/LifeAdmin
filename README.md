# LifeAdmin

**Your life, in order.** LifeAdmin is a personal document and deadline organizer built with React, TypeScript, Vite, and local browser storage.

## What works in this prototype

- Overview dashboard with document counts, overdue items, and upcoming dates
- Add and edit documents with category, issuer, reference nickname, due date, and notes
- Search across document names, categories, issuers, references, and notes
- Filter by category and view Identity, Education, Finance, Health, and Home categories
- Archive and restore records, or permanently delete them after confirmation
- Download a JSON backup of your records
- Responsive layout for desktop, tablet, and mobile screens
- Sample records so the dashboard is populated on first launch

## Run locally

Requirements: Node.js 20 or later and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal.

Create a production build:

```bash
npm run build
npm run preview
```

## Deploy for free

### Vercel
1. Import `HarithaKongi/LifeAdmin` from GitHub in Vercel.
2. Keep the framework preset as **Vite**.
3. Use `npm run build` as the build command.
4. Use `dist` as the output directory.
5. Deploy.

### Netlify
1. Import the GitHub repository.
2. Set the build command to `npm run build`.
3. Set the publish directory to `dist`.
4. Deploy.

## Storage and privacy

This version stores records in the browser's `localStorage`. That means:
- Data is specific to the browser and device being used.
- Clearing browser data can erase saved records.
- Records do not automatically sync between devices or users.
- Use **Export** to download a JSON backup and keep it somewhere safe.
- This is a prototype, not an encrypted document vault. Do not store passwords, full government ID numbers, financial account numbers, or scans of sensitive documents.

The sample records are demonstration data. You can edit or delete them.

## Current architecture

- React + TypeScript
- Vite
- lucide-react icons
- CSS responsive layout
- Browser localStorage (no backend or account system yet)

## Suggested next milestones

1. Add automated tests for due-date and filtering behavior.
2. Add an authenticated backend and database for secure cross-device sync.
3. Add configurable reminders after choosing a notification provider.
4. Add validation, import/restore backup, and accessibility testing.
5. Review security and privacy requirements before storing real sensitive records.

## License

No license has been added yet. Add one before accepting external contributions or publishing reusable code.
