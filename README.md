# 🎙️ PodcastClips

**Turn any podcast into 5 viral short-form video clips in minutes — powered by AI.**

PodcastClips is a full-stack SaaS web application that helps podcast creators repurpose their long-form audio content into bite-sized, social-media-ready clips. Upload a podcast episode, and the AI engine will transcribe it, detect the most viral-worthy moments, and generate ready-to-post short videos for **TikTok**, **Instagram Reels**, and **YouTube Shorts**.

---

## ✨ Features

- **AI-Powered Clip Detection** — GPT-4o-mini analyzes your transcript and picks the 5 moments most likely to go viral (strong opinions, surprising facts, emotional stories, actionable advice).
- **Automatic Transcription** — Powered by OpenAI Whisper, supporting 90+ languages with accurate timestamped segments.
- **Caption Video Generation** — Auto-generated caption videos in vertical (9:16), square (1:1), or horizontal (16:9) formats.
- **User Authentication** — Secure sign-up/sign-in via Clerk with protected routes and middleware.
- **Subscription Billing** — Free tier (2 podcasts/month) and Pro plan via Stripe Checkout with customer portal.
- **File Storage** — Podcast audio uploads handled through Supabase Storage.
- **Transactional Email** — Email notifications powered by Resend.
- **Dashboard** — Manage all your podcasts, view clips, upload new episodes, and handle billing.

---

## 🛠️ Tech Stack

| Layer           | Technology                                               |
| --------------- | -------------------------------------------------------- |
| **Framework**   | [Next.js 16](https://nextjs.org/) (App Router)          |
| **Language**    | TypeScript                                               |
| **Styling**     | [Tailwind CSS v4](https://tailwindcss.com/)              |
| **Auth**        | [Clerk](https://clerk.com/)                              |
| **Database**    | PostgreSQL via [Prisma ORM](https://www.prisma.io/)      |
| **AI**          | [OpenAI](https://openai.com/) (Whisper + GPT-4o-mini)   |
| **Payments**    | [Stripe](https://stripe.com/) (Checkout + Billing Portal)|
| **Storage**     | [Supabase](https://supabase.com/) (File Storage)        |
| **Email**       | [Resend](https://resend.com/)                            |
| **Validation**  | [Zod](https://zod.dev/)                                  |

---

## 📁 Project Structure

```
podcastclips/
├── app/
│   ├── api/
│   │   ├── checkout/       # Stripe checkout session creation
│   │   ├── portal/         # Stripe customer billing portal
│   │   ├── process/        # Podcast transcription & clip detection
│   │   ├── upload/         # Audio file upload handling
│   │   └── webhooks/       # Stripe webhook handler
│   ├── dashboard/
│   │   ├── billing/        # Billing & subscription management
│   │   ├── clips/          # View generated clips
│   │   ├── upload/         # Upload new podcast
│   │   └── page.tsx        # Dashboard home
│   ├── pricing/            # Pricing page (Free vs Pro)
│   ├── sign-in/            # Clerk sign-in page
│   ├── sign-up/            # Clerk sign-up page
│   ├── layout.tsx          # Root layout (ClerkProvider, fonts)
│   ├── page.tsx            # Landing / home page
│   └── globals.css         # Global styles
├── lib/
│   ├── ai.ts               # OpenAI Whisper transcription & GPT clip detection
│   ├── auth.ts             # Clerk user helpers (getCurrentUser, getOrCreateUser)
│   ├── db.ts               # Prisma client singleton
│   └── stripe.ts           # Stripe checkout & portal session helpers
├── prisma/
│   └── schema.prisma       # Database schema (User, Podcast, Clip, Subscription)
├── middleware.ts            # Clerk route protection middleware
├── .env.local               # Environment variables (not committed)
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** ≥ 18 — [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** / **pnpm**
- **PostgreSQL** database (local or hosted) — [Download](https://www.postgresql.org/download/)
- **Git** — [Download](https://git-scm.com/)

You'll also need accounts and API keys for:

- [Clerk](https://clerk.com/) — Authentication
- [OpenAI](https://platform.openai.com/) — Whisper + GPT API
- [Stripe](https://stripe.com/) — Payment processing
- [Supabase](https://supabase.com/) — File storage
- [Resend](https://resend.com/) — Transactional email

---

## 🔑 API Keys — How to Get Them

### 1. 🔐 Clerk (Authentication)

Clerk handles user sign-up, sign-in, and protected routes.

**Steps:**
1. Go to [clerk.com](https://clerk.com) → Click **"Sign Up"** (free)
2. Create a new application → Name it "PodcastClips"
3. Choose sign-in methods (Email, Google, etc.)
4. Go to **Dashboard → API Keys**
5. Copy both keys into your `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

> ✅ Free tier is generous — no credit card needed to start.

---

### 2. 🤖 OpenAI (Whisper + GPT-4o-mini)

Used for **transcribing** podcast audio (Whisper) and **detecting viral moments** (GPT-4o-mini).

**Steps:**
1. Go to [platform.openai.com](https://platform.openai.com) → Sign in / Create account
2. Click your **profile icon** (top-right) → **"API Keys"**
3. Click **"Create new secret key"** → Copy it immediately (shown only once!)

```env
OPENAI_API_KEY=sk-...
```

> ⚠️ OpenAI requires a **paid account** (add $5–$10 credit to start). Whisper costs ~$0.006/minute of audio. GPT-4o-mini is very cheap (~$0.15 per 1M input tokens).

---

### 3. 💳 Stripe (Payments & Subscriptions)

Handles Free vs Pro plan billing, Stripe Checkout, and the Customer Billing Portal.

**Steps for API Keys:**
1. Go to [stripe.com](https://stripe.com) → Create account
2. Stay in **Test Mode** (toggle in the dashboard header)
3. Go to **Developers → API Keys**
4. Copy your keys:

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Steps for Webhook Secret (local dev):**

Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) then run:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

It will print your signing secret — copy it:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Steps for Pro Price ID:**
1. In Stripe Dashboard → **Products → Create Product**
2. Name it "PodcastClips Pro" → Add a recurring monthly price (e.g., $19/month)
3. Copy the **Price ID** (starts with `price_...`):

```env
STRIPE_PRO_PRICE_ID=price_...
```

> ✅ Test mode is completely free. Use test card `4242 4242 4242 4242` with any future date and any CVC.

---

### 4. 🗄️ Supabase (File Storage)

Used to store uploaded podcast audio files.

**Steps:**
1. Go to [supabase.com](https://supabase.com) → Sign up (free)
2. Click **"New Project"** → Name it "podcastclips" → Set a database password
3. Wait for provisioning (~1 min)
4. Go to **Settings → API**
5. Copy:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Use the "service_role" key — NOT the anon key
```

6. Go to **Storage → Create Bucket** → Name it `podcasts` → Set to **Private**

> ✅ Free tier includes 1GB storage — plenty for development.

---

### 5. 📧 Resend (Transactional Email)

Sends email notifications to users.

**Steps:**
1. Go to [resend.com](https://resend.com) → Sign up (free)
2. Go to **API Keys → Create API Key**
3. Copy it:

```env
RESEND_API_KEY=re_...
```

> ✅ Free tier sends 3,000 emails/month — more than enough for development.

---

### 6. 🐘 Database (PostgreSQL)

**Option A — Local PostgreSQL:**
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/podcastclips"
```

**Option B — Neon (free cloud Postgres, recommended):**
1. Go to [neon.tech](https://neon.tech) → Sign up free
2. Create a project → Copy the connection string into `DATABASE_URL`

---

### ✅ API Keys Checklist

| Variable | Service | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL / Neon | ✅ Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk | ✅ Yes |
| `CLERK_SECRET_KEY` | Clerk | ✅ Yes |
| `OPENAI_API_KEY` | OpenAI | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | ✅ Yes |
| `STRIPE_SECRET_KEY` | Stripe | ✅ Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe | ✅ Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe CLI | ✅ Yes |
| `STRIPE_PRO_PRICE_ID` | Stripe Product | ✅ Yes |
| `RESEND_API_KEY` | Resend | ✅ Yes |

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/podcastclips.git
cd podcastclips
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root and add the following variables:

```env
# ========================================
# PodcastClips Environment Variables
# ========================================

# ---- Database (PostgreSQL) ----
DATABASE_URL="postgresql://user:password@localhost:5432/podcastclips"

# ---- Clerk Auth ----
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# ---- Stripe ----
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...

# ---- OpenAI (Whisper + GPT) ----
OPENAI_API_KEY=sk-...

# ---- Supabase Storage ----
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# ---- Resend (Email) ----
RESEND_API_KEY=re_...

# ---- App ----
NEXT_PUBLIC_APP_URL=http://localhost:3000
FREE_PODCAST_LIMIT=2
```

> **Note:** Never commit your `.env.local` file. It's already included in `.gitignore`.

### 4. Set Up the Database

Generate the Prisma client and run migrations to create your database tables:

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init
```

To visually inspect your database, you can open Prisma Studio:

```bash
npx prisma studio
```

### 5. Set Up Stripe (Webhooks)

For local development, use the [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhooks:

```bash
# Install Stripe CLI, then:
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret (`whsec_...`) and add it to your `.env.local` as `STRIPE_WEBHOOK_SECRET`.

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

---

## 📜 Available Scripts

| Command              | Description                                 |
| -------------------- | ------------------------------------------- |
| `npm run dev`        | Start the development server                |
| `npm run build`      | Build the production bundle                 |
| `npm run start`      | Start the production server                 |
| `npm run lint`       | Run ESLint                                  |
| `npx prisma studio`  | Open Prisma Studio (database GUI)           |
| `npx prisma migrate dev` | Run pending database migrations         |
| `npx prisma generate`    | Regenerate the Prisma client            |

---

## 🗄️ Database Schema

The app uses **4 main models**:

- **User** — Linked to Clerk via `clerkId`. Tracks plan (`FREE` / `PRO`) and usage count.
- **Podcast** — Uploaded audio file with status tracking (`PENDING` → `PROCESSING` → `DONE` / `FAILED`), transcript, and associated clips.
- **Clip** — An extracted viral moment with start/end timestamps, transcript, hook caption, reason, and video URL.
- **Subscription** — Stripe subscription details tied to a user.

---

## 🔒 Authentication & Route Protection

Clerk handles all auth. The `middleware.ts` file protects routes — only the following are public:

- `/` — Landing page
- `/pricing` — Pricing page
- `/sign-in` and `/sign-up` — Auth pages
- `/api/webhooks/*` — Webhook endpoints

All other routes (including `/dashboard/*`) require authentication.

---

## 💳 Billing

- **Free plan** — 2 podcasts per month, no credit card required.
- **Pro plan** — Unlimited podcasts via Stripe subscription.
- Users can manage their subscription through the Stripe Customer Portal at `/dashboard/billing`.

---

## 📄 License

This project is private and not licensed for public distribution.
