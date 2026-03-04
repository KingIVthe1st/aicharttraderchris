# Backend Integration Plan
## Tradvio Frontend ↔ PrecisionTradeAI Backend

---

## Executive Summary

This document outlines the integration strategy between the **Tradvio frontend replica** (React/Vite/TypeScript) and the **PrecisionTradeAI backend** (Next.js full-stack application with OpenAI GPT-5.1 integration).

**Current Status:**
- ✅ Frontend: Complete with all 11 sections matching Tradvio design
- ✅ Backend: Production-ready Next.js API with AI analysis, auth, payments
- 🔄 Integration: Not yet connected

**Goal:** Connect the static frontend to the live backend API to create a fully functional AI-powered trading analysis platform.

---

## Backend Technology Stack

### Core Framework
- **Next.js 14.2.5** (App Router)
- **TypeScript 5.6.2**
- **React 18.3.1**

### Database & ORM
- **PostgreSQL** (primary database)
- **Prisma 5.20.0** (ORM with migrations)
- Shadow database for safe migrations

### AI & ML
- **OpenAI SDK 4.56.0** (GPT-5.1 vision model)
- **Vector Stores** (OpenAI file search for conversation context)
- **Structured JSON Schema** validation
- **Server-Sent Events** (SSE) for streaming responses

### Authentication
- **NextAuth 4.24.8** with Prisma adapter
- JWT session strategy
- Providers: Email (magic links) + Google OAuth
- Role-based access control (user/admin)

### Payment Processing
- **Stripe 16.8.0**
- Subscription management with webhooks
- 7-day trial period
- Monthly pricing: $20.00/month

### File Storage
- **AWS S3** (via SDK 3.645.0)
- Presigned URLs for secure uploads
- Stores: chart images, ATM screenshots, PDFs

### Security & Monitoring
- **Sentry 8.21.0** (error tracking)
- **Rate limiting** per user
- **Audit logging** for all sensitive actions
- **Pino logger** (structured logging)

### Testing
- **Vitest 1.6.1** (unit tests)
- **Playwright 1.49.1** (E2E tests)

---

## Backend API Architecture

### Core Endpoints

#### 1. `/api/analyze` (POST) - **PRIMARY FEATURE**
**Purpose:** AI-powered chart analysis using GPT-5.1 vision

**Authentication:** Required (active subscription)

**Rate Limiting:** Yes (per user)

**Request Payload:**
```typescript
{
  instrument: string;        // e.g., "ES" (E-mini S&P 500)
  contract: string;          // e.g., "ESZ24"
  charts: Array<{
    url: string;             // S3 presigned URL to chart image
    type: 'daily' | 'ltf';   // daily timeframe or low-timeframe
  }>;
  atm: {
    entry?: number;          // Entry price (optional)
    distal?: number;         // Stop price (optional)
    stop_ticks: number;      // Stop distance in ticks (required)
    target_ticks: number[];  // Target distances in ticks
    breakeven?: number;      // Breakeven level (optional)
    image_url?: string;      // ATM screenshot URL (optional)
  };
  useConversation?: boolean; // Use vector store for context
}
```

**Response:** Server-Sent Events stream with events:
- `chunk` - Progressive JSON chunks
- `done` - Complete analysis JSON
- `error` - Error messages

**Analysis JSON Schema:**
```typescript
{
  action: 'trade' | 'no_trade' | 'need_inputs';
  rationale: string[];  // Array of reasons
  validation: {
    tickPrecisionOk: boolean;  // Entry/stop on tick grid
    rrOk: boolean;             // Risk-reward acceptable (min 2:1)
    biasAligned: boolean;      // Trade direction matches bias
    atmExact: boolean;         // ATM distances match tick specs
  };
  priceLevels: {
    entry: number;
    stop: number;
    targets: number[];  // Array of target prices
  };
  riskDisclosure: string;      // Required risk warning
  managementNotes?: string;    // Optional trade management advice
}
```

**AI Tools Available to GPT:**
1. `getTickSpec(symbol)` - Returns tick size & multiplier
2. `checkExactFit(...)` - Validates ATM on tick grid
3. `rrToFirstTarget(...)` - Calculates risk:reward ratio

**Vector Store Integration:**
When `useConversation: true`, GPT has access to user's uploaded PDFs/documents for context-aware analysis.

**Database Persistence:**
Every analysis is saved to `AnalysisRun` table with:
- Input data (instrument, contract, charts, ATM)
- Output JSON from GPT
- Status ('trade', 'no_trade', 'need_inputs', 'error')
- Latency in milliseconds
- Timestamp

**Audit Log:**
Creates audit entry: `analysis.completed` with metadata

---

#### 2. `/api/auth/*` - Authentication

**NextAuth routes:**
- `/api/auth/signin` - Sign in page
- `/api/auth/signout` - Sign out
- `/api/auth/callback/google` - OAuth callback
- `/api/auth/callback/email` - Magic link callback
- `/api/auth/session` - Get current session

**Session Structure:**
```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
    image: string;
    role: 'user' | 'admin';
    subscriptionStatus?: 'active' | 'trialing' | 'canceled' | 'incomplete';
  };
  expires: string;
}
```

---

#### 3. `/api/stripe/checkout` (POST) - Create Subscription

**Request:**
```typescript
{
  successUrl?: string;  // Default: /dashboard
  cancelUrl?: string;   // Default: /billing
}
```

**Response:**
```typescript
{
  url: string;  // Stripe checkout URL or /billing if already subscribed
}
```

**Features:**
- 7-day trial period
- Monthly subscription: $20.00
- Automatic email to user
- Links to Stripe customer portal

---

#### 4. `/api/stripe/webhook` (POST) - Stripe Events

**Handled Events:**
- `checkout.session.completed` - New subscription created
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.created` - Subscription created
- `customer.subscription.deleted` - Subscription canceled

**Database Updates:**
Updates `Subscription` table with latest status and billing period.

---

#### 5. `/api/upload-url` (POST) - Get S3 Presigned URL

**Purpose:** Get secure upload URL for chart images or ATM screenshots

**Request:**
```typescript
{
  fileName: string;
  fileType: string;
  fileKind: 'chart' | 'atm_screenshot' | 'pdf';
}
```

**Response:**
```typescript
{
  uploadUrl: string;     // Presigned S3 URL (15-min expiry)
  finalUrl: string;      // Final public URL after upload
  fileId: string;        // Database record ID
}
```

---

#### 6. `/api/history` - Analysis History

**GET `/api/history`** - List user's past analyses
```typescript
Response: {
  analyses: Array<{
    id: string;
    instrument: string;
    contract: string;
    status: 'trade' | 'no_trade' | 'need_inputs' | 'error';
    summaryText: string;
    latencyMs: number;
    createdAt: string;
  }>;
}
```

**GET `/api/history/[id]`** - Get specific analysis details

---

#### 7. `/api/atm` (POST) - Calculate ATM Values

**Purpose:** Calculate entry/distal prices based on tick specifications

**Request:**
```typescript
{
  instrument: string;
  entry?: number;
  distal?: number;
  stop_ticks: number;
  target_ticks: number[];
}
```

---

#### 8. `/api/admin/*` - Admin Panel Routes

**Endpoints:**
- `/api/admin/users` - User management
- `/api/admin/tick-specs` - Trading instrument specifications
- `/api/admin/analytics` - Platform analytics

**Access:** Requires `role: 'admin'`

---

#### 9. `/api/vector-store` - Document Upload

**POST `/api/vector-store/upload`** - Upload documents to user's knowledge base

**Purpose:** Users can upload PDFs/documents that GPT can reference during analysis

---

## Database Schema

### Key Models

#### User
```prisma
model User {
  id            String           @id @default(cuid())
  email         String?          @unique
  name          String?
  image         String?
  role          Role             @default(user)  // user | admin
  emailVerified DateTime?
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  accounts      Account[]        // OAuth accounts
  sessions      Session[]        // Active sessions
  subscription  Subscription?    // Stripe subscription
  vectorStores  VectorStoreRef[] // AI knowledge bases
  files         File[]           // Uploaded files
  analyses      AnalysisRun[]    // Analysis history
  settings      Settings?        // User preferences
  auditLogs     AuditLog[]       // Activity logs
}
```

#### Subscription
```prisma
model Subscription {
  id                String             @id @default(cuid())
  userId            String             @unique
  status            SubscriptionStatus // active | trialing | canceled | incomplete
  stripeCustomerId  String             @unique
  stripeSubId       String             @unique
  currentPeriodEnd  DateTime
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### AnalysisRun
```prisma
model AnalysisRun {
  id                String          @id @default(cuid())
  userId            String
  instrument        String          // e.g., "ES"
  contract          String          // e.g., "ESZ24"
  atmJson           Json            // ATM input data
  inputsJson        Json            // Charts array
  status            AnalysisStatus  // trade | no_trade | need_inputs | error
  modelResponseJson Json            // GPT output
  summaryText       String          // Human-readable summary
  latencyMs         Int?            // Response time
  createdAt         DateTime        @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
}
```

#### File
```prisma
model File {
  id        String   @id @default(cuid())
  userId    String
  kind      FileKind  // chart | atm_screenshot | pdf
  url       String    // S3 URL
  size      Int       // Bytes
  mime      String    // MIME type
  createdAt DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### TickSpec
```prisma
model TickSpec {
  id               String   @id @default(cuid())
  symbol           String   @unique  // e.g., "ES", "NQ", "YM"
  tick             Decimal           // e.g., 0.25
  multiplier       Decimal           // e.g., 50
  editableByAdmin  Boolean  @default(false)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

---

## Trading Logic Deep Dive

### Tick Grid Validation

**Purpose:** Ensure all price levels align with the instrument's tick size

**Function:** `isOnTickGrid(value, tickSize, tolerance = 1e-9)`

**Example:**
- ES (E-mini S&P) has tick size 0.25
- Valid prices: 5000.00, 5000.25, 5000.50, 5000.75
- Invalid: 5000.10, 5000.33

### ATM (Automated Trade Management) Validation

**Function:** `checkExactFit({ entry, distal, stop_ticks, target_ticks, tick_size })`

**Validations:**
1. ✅ Entry on tick grid
2. ✅ Distal (stop) on tick grid
3. ✅ Stop ticks > 0
4. ✅ All targets > 0
5. ✅ Stop distance matches tick count
6. ✅ Distal matches calculated stop level
7. ✅ Minimum 2:1 risk:reward ratio

**Returns:**
```typescript
{
  exact: boolean;
  reasons: string[];  // Empty if exact=true
}
```

### Risk:Reward Calculation

**Function:** `rrToFirstTarget(entry, stop, target)`

**Formula:**
```
RR = |target - entry| / |entry - stop|
```

**Example:**
- Entry: 5000.00
- Stop: 4990.00 (10 points risk)
- Target: 5020.00 (20 points reward)
- RR = 20 / 10 = 2.0 (2:1)

### Tick Specifications

Common instruments stored in database:

| Symbol | Name | Tick Size | Multiplier | Value/Tick |
|--------|------|-----------|------------|------------|
| ES | E-mini S&P 500 | 0.25 | 50 | $12.50 |
| NQ | E-mini Nasdaq | 0.25 | 20 | $5.00 |
| YM | E-mini Dow | 1.00 | 5 | $5.00 |
| GC | Gold Futures | 0.10 | 100 | $10.00 |
| CL | Crude Oil | 0.01 | 1000 | $10.00 |

---

## Environment Variables Required

### OpenAI
```env
OPENAI_API_KEY=sk-proj-...
```

### Stripe
```env
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
STRIPE_MONTHLY_AMOUNT=2000  # $20.00 in cents
```

### NextAuth
```env
NEXTAUTH_SECRET=<random-32-char-string>
NEXTAUTH_URL=http://localhost:3000  # or production URL
```

### Database
```env
DATABASE_URL=postgresql://user:pass@host:5432/precisiontrade
SHADOW_DATABASE_URL=postgresql://user:pass@host:5432/precisiontrade_shadow
```

### AWS S3
```env
S3_ENDPOINT=https://s3.amazonaws.com  # or DigitalOcean Spaces
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_BUCKET=precisiontrade-files
```

### Email (for magic links)
```env
EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=SG....
EMAIL_FROM=noreply@precisiontrade.ai
```

### Google OAuth
```env
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
```

### Monitoring
```env
SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

### App Configuration
```env
APP_URL=http://localhost:3000  # or production URL
```

---

## Integration Strategy

### Phase 1: Environment Setup ✅ (Next)
1. Copy backend `.env.example` to `.env` in frontend project
2. Configure environment variables
3. Set up CORS on backend to allow frontend origin
4. Test backend API health endpoints

### Phase 2: Authentication Integration
1. Install `next-auth` client in frontend
2. Create `/api/auth` proxy routes in Vite to forward to backend
3. Build login/signup UI components
4. Implement session management
5. Add protected route guards

### Phase 3: File Upload Flow
1. Build chart upload UI component
2. Implement S3 presigned URL flow:
   - Request presigned URL from backend
   - Upload file directly to S3
   - Store final URL in state
3. Add image preview/cropping
4. Support multiple chart uploads (daily + LTF)

### Phase 4: Analysis Request Flow
1. Build ATM input form (entry, stop, targets)
2. Create analysis request UI
3. Implement SSE client for streaming responses
4. Build real-time progress indicator
5. Parse and display analysis results

### Phase 5: Results Display
1. Design analysis result card
2. Show action ('trade', 'no_trade', 'need_inputs')
3. Display rationale bullets
4. Show validation checkmarks
5. Display price levels with visual chart

### Phase 6: Subscription & Billing
1. Build pricing page with Stripe integration
2. Create checkout flow
3. Implement subscription status checks
4. Build billing portal link
5. Handle trial period messaging

### Phase 7: History & Dashboard
1. Fetch analysis history from API
2. Build history list/table UI
3. Implement search/filter
4. Add detailed view for past analyses
5. Show usage statistics

### Phase 8: Advanced Features
1. Vector store document upload
2. Conversation mode toggle
3. Settings page for user preferences
4. Admin panel (if user.role === 'admin')
5. Export analysis to PDF

---

## Frontend Changes Required

### New Dependencies to Install
```json
{
  "next-auth": "^4.24.8",
  "@tanstack/react-query": "^5.0.0",  // For API state management
  "eventsource": "^2.0.2",             // For SSE client
  "zod": "^3.23.8",                    // For validation (shared with backend)
  "react-dropzone": "^14.2.3",         // For file uploads
  "recharts": "^2.12.0"                // Already installed ✅
}
```

### New Directory Structure
```
src/
├── api/
│   ├── client.ts              # Axios/fetch wrapper
│   ├── auth.ts                # Auth API calls
│   ├── analyze.ts             # Analysis API calls
│   ├── stripe.ts              # Stripe API calls
│   └── upload.ts              # File upload API calls
├── hooks/
│   ├── useAuth.ts             # Auth hook
│   ├── useAnalysis.ts         # Analysis hook with SSE
│   ├── useSubscription.ts     # Subscription status hook
│   └── useFileUpload.ts       # File upload hook
├── components/
│   ├── Auth/
│   │   ├── SignInForm.tsx
│   │   ├── SignUpForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── Analysis/
│   │   ├── ChartUpload.tsx
│   │   ├── ATMForm.tsx
│   │   ├── AnalysisRequest.tsx
│   │   ├── AnalysisResult.tsx
│   │   └── AnalysisStream.tsx
│   ├── Dashboard/
│   │   ├── AnalysisHistory.tsx
│   │   ├── UsageStats.tsx
│   │   └── QuickActions.tsx
│   └── Billing/
│       ├── SubscriptionCard.tsx
│       ├── PricingTable.tsx
│       └── BillingPortal.tsx
└── types/
    ├── api.ts                 # API type definitions
    └── analysis.ts            # Analysis type definitions
```

### Configuration Files

**`vite.config.ts`** - Add proxy for API:
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
```

**`.env`** - Frontend environment variables:
```env
VITE_API_URL=http://localhost:3000
VITE_APP_URL=http://localhost:5173
```

---

## API Client Example

**`src/api/client.ts`:**
```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,  // Important for cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for auth
apiClient.interceptors.request.use((config) => {
  // Add CSRF token if available
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

// Response interceptor for errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/auth/signin';
    }
    return Promise.reject(error);
  }
);
```

---

## SSE Client Example

**`src/hooks/useAnalysis.ts`:**
```typescript
import { useState } from 'react';

export function useAnalysis() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [chunks, setChunks] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (payload: AnalyzePayload) => {
    setStatus('loading');
    setChunks([]);
    setResult(null);
    setError(null);

    const eventSource = new EventSource('/api/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    eventSource.addEventListener('chunk', (event) => {
      setChunks((prev) => [...prev, event.data]);
    });

    eventSource.addEventListener('done', (event) => {
      const json = JSON.parse(event.data);
      setResult(json);
      setStatus('success');
      eventSource.close();
    });

    eventSource.addEventListener('error', (event) => {
      setError(event.data || 'Analysis failed');
      setStatus('error');
      eventSource.close();
    });

    eventSource.onerror = () => {
      setError('Connection lost');
      setStatus('error');
      eventSource.close();
    };
  };

  return { analyze, status, chunks, result, error };
}
```

---

## Next Steps

1. ✅ **Review Backend** (COMPLETE)
2. 🔄 **Create Integration Plan** (IN PROGRESS)
3. ⏳ **Set Up Environment** (NEXT)
4. ⏳ **Build Auth Flow**
5. ⏳ **Build Analysis Flow**
6. ⏳ **Connect Stripe**
7. ⏳ **Testing & Deployment**

---

## Questions & Considerations

### CORS Configuration
**Q:** Does backend allow frontend origin?
**A:** Need to configure Next.js middleware to allow http://localhost:5173 in dev

### Session Persistence
**Q:** How to share sessions between frontend and backend?
**A:** Use `withCredentials: true` and configure CORS to allow credentials

### File Upload Size
**Q:** Max file size for chart images?
**A:** Need to check S3 presigned URL expiry and size limits

### Rate Limiting
**Q:** Current rate limits per user?
**A:** Need to check `lib/security/rateLimit.ts` implementation

### Cost Considerations
**Q:** OpenAI GPT-5.1 cost per analysis?
**A:** Need to monitor token usage and implement cost tracking

---

## Contact & Support

**Backend Location:** `/Users/ivanjackson/Desktop/Futurevision/precisiontradeai/`
**Frontend Location:** `/Users/ivanjackson/Desktop/Futurevision/tradvio-replica/`

**Tech Stack Compatibility:**
- ✅ Both use TypeScript
- ✅ Both use React
- ✅ Backend has Next.js (can serve frontend if needed)
- ✅ Shared Tailwind CSS configuration possible
- ✅ Shared type definitions via npm workspace

---

**Document Version:** 1.0
**Last Updated:** October 21, 2025
**Author:** Claude Code (AI Assistant)
