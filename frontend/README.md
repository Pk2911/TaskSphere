# Component Library

A small reusable UI component library built with Next.js, TypeScript, and Tailwind CSS.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS

## Components

### Button
- Primary, secondary, and danger variants
- Loading state
- Supports standard button props

### Card
- Reusable content container
- Supports custom content and styling

### Table
- Generic TypeScript component
- Sortable columns
- Reusable with different data types

### Modal
- Reusable dialog component
- Keyboard focus trap
- Escape key to close
- Restores focus after closing
- Basic accessibility support

## Project Structure

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
└── components/
    ├── Button/
    │   └── Button.tsx
    ├── Card/
    │   └── Card.tsx
    ├── Table/
    │   └── Table.tsx
    └── Modal/
        └── Modal.tsx

```

## Running Locally

Install dependencies:

```text

npm install

```

## Start the development server:

```text

npm run dev

```

Open:

```text

http://localhost:3000

```
Future Integration

The components are kept independent from my Task Management API repo so they can be reused when the frontend is connected to the backend.