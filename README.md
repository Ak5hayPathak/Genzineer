# GenZineer

A technical notes publishing platform built with the PERN stack.

## Tech Stack

- React + Vite
- Tailwind CSS
- Node.js + Express
- PostgreSQL
- Backblaze B2

## Architecture

- PostgreSQL stores users and document metadata.
- Backblaze B2 stores Markdown documents and media assets.
- Express provides the REST API.
- React renders and edits technical documents.

## Getting Started

### Prerequisites

- Node.js and npm
- PostgreSQL

### Install dependencies

From the project root:

\`\`\`bash
npm install
npm install --prefix client
npm install --prefix server
\`\`\`

Configure `server/.env` using `server/.env.example`.

### Start development servers

\`\`\`bash
npm run dev
\`\`\`

Frontend: http://localhost:5173

Backend health check: http://localhost:5000/api/health