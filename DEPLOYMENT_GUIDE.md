# Tate Studies Web App - Deployment Guide

## Current Status

The app is **fully functional** with free AI-powered study material processing.

### Working Features:
- **File Upload**: Drag-and-drop with 50MB file size validation
- **AI Summarization**: Google Gemini 1.5 Flash (free tier) with local fallback
- **Note Storage**: localStorage-based persistence (Supabase optional)
- **Note Editing**: Full CRUD on summaries, key definitions, study tips
- **Multiple Choice**: AI-generated questions from study material
- **Flashcards**: Traditional flip-card study mode with keyboard support
- **Dashboard**: Progress tracking, XP system, study streaks
- **Dark/Light Mode**: Theme toggle with persistence
- **Mobile Responsive**: Collapsible sidebar, stacked layouts on small screens
- **Error Boundary**: Graceful error recovery

## Prerequisites

### Required Dependencies

Install all dependencies before building:

```bash
npm install
```

#### Core Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.3.1 | UI framework |
| `react-dom` | ^18.3.1 | React DOM rendering |
| `lucide-react` | ^0.487.0 | Icon library |
| `class-variance-authority` | ^0.7.1 | Component variant patterns |
| `clsx` | ^2.0.0 | Conditional classNames |
| `tailwind-merge` | ^2.0.0 | Tailwind class merging |

#### UI Components (Radix UI)
| Package | Purpose |
|---------|---------|
| `@radix-ui/react-accordion` | Collapsible sections |
| `@radix-ui/react-alert-dialog` | Confirmation dialogs |
| `@radix-ui/react-dialog` | Modal dialogs |
| `@radix-ui/react-dropdown-menu` | Dropdown menus |
| `@radix-ui/react-label` | Form labels |
| `@radix-ui/react-progress` | Progress bars |
| `@radix-ui/react-radio-group` | Radio button groups |
| `@radix-ui/react-scroll-area` | Custom scrollbars |
| `@radix-ui/react-select` | Select dropdowns |
| `@radix-ui/react-separator` | Visual separators |
| `@radix-ui/react-slot` | Component composition |
| `@radix-ui/react-switch` | Toggle switches |
| `@radix-ui/react-tabs` | Tab navigation |
| `@radix-ui/react-tooltip` | Tooltips |

#### Backend & AI
| Package | Version | Purpose |
|---------|---------|---------|
| `@supabase/supabase-js` | ^2.49.8 | Supabase client (optional backend) |
| `sonner` | ^2.0.3 | Toast notifications |

#### Dev Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `vite` | ^6.3.5 | Build tool & dev server |
| `typescript` | ~5.0.0 | Type checking |
| `@vitejs/plugin-react-swc` | ^3.10.2 | React SWC compiler |
| `tailwindcss` | ^3.4.0 | CSS framework |
| `postcss` | ^8.4.0 | CSS processing |
| `autoprefixer` | ^10.4.0 | Browser prefix automation |
| `@types/react` | ^18.3.0 | React type definitions |
| `@types/react-dom` | ^18.3.0 | React DOM type definitions |

### Removed Dependencies (no longer needed)
These were removed during the code quality cleanup. Do NOT reinstall them:
- `recharts` - No charts in the app
- `react-hook-form` - No forms use it
- `next-themes` - Theme handled manually
- `react-day-picker` - No date picker needed
- `embla-carousel-react` - No carousel used
- `cmdk` - No command palette used
- `input-otp` - No OTP input needed
- `vaul` - No drawer component used
- `react-resizable-panels` - No resizable panels used

## Environment Variables

Create a `.env` file in the project root:

```env
# Required for AI features (free tier available)
VITE_GEMINI_API_KEY=your_gemini_api_key

# Optional - Supabase backend
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional - API configuration
VITE_API_BASE_URL=your_api_base_url
VITE_USE_MOCK_API=false
VITE_ENABLE_DEBUG_LOGGING=false
VITE_DEFAULT_USER_ID=default

# Server-side (for Vercel API routes)
ALLOWED_ORIGIN=https://your-domain.com
```

### Get a Gemini API Key (Free)
1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create a new API key
3. Add it to your `.env` as `VITE_GEMINI_API_KEY`

> **Note**: The app works without a Gemini key using local fallback processing, but AI summaries will be basic.

## Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Type check
npx tsc --noEmit

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment Options

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set environment variables in Vercel dashboard:
- `VITE_GEMINI_API_KEY`
- `ALLOWED_ORIGIN` (your production URL)

The `api/` directory contains serverless functions that deploy automatically.

### Option 2: Static Hosting (Netlify, GitHub Pages, etc.)

```bash
npm run build
```

Deploy the `dist/` folder. Note: The Vercel API routes won't work on static hosts - the app will use client-side processing only.

### Option 3: Supabase Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref your_project_ref

# Deploy edge function
supabase functions deploy make-server-4e8803b0
```

Set edge function secrets:
```bash
supabase secrets set ALLOWED_ORIGIN=https://your-domain.com
```

## Build Output

The production build uses code splitting for optimal loading:

| Chunk | Size (gzip) | Contents |
|-------|-------------|----------|
| `vendor-react` | ~46KB | React, React DOM |
| `vendor-radix` | ~36KB | Radix UI components |
| `index` | ~16KB | App shell, routing, sidebar |
| `upload-page` | ~9KB | File upload (lazy loaded) |
| `summary-view` | ~7KB | Summary viewer (lazy loaded) |
| `flashcards` | ~6KB | Study modes (lazy loaded) |
| `dashboard` | ~3KB | Dashboard (lazy loaded) |
| `settings` | ~2KB | Settings (lazy loaded) |
| CSS | ~10KB | All styles |

## Architecture

```
Frontend (React + Vite + TypeScript)
    ├── React.lazy() code-split pages
    ├── localStorage for data persistence
    ├── Gemini API for AI summarization (client-side)
    └── ErrorBoundary for crash recovery

Optional Backend:
    ├── Vercel Serverless Functions (api/)
    └── Supabase Edge Functions + Storage + KV Store
```

## Security Notes

- API keys must be set via environment variables, never hardcoded
- CORS is configurable via `ALLOWED_ORIGIN` env var
- File uploads are validated (50MB limit, type checking)
- Input validation on all API endpoints
- CSP headers configured in index.html

## Troubleshooting

### "Demo Mode" message
Normal when no backend is connected. The app works fully with local processing.

### AI summaries are basic
Configure `VITE_GEMINI_API_KEY` for enhanced AI-powered summaries.

### Upload fails
Check that the file is under 50MB and is a supported type (PDF, TXT, DOCX, images).

### Build fails with missing modules
Run `npm install` to install all dependencies. Do not install the removed packages listed above.
