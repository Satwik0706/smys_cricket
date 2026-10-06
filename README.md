# 🏏 T20 Cricket Mega Auction & Live Telecasting System

An enterprise, TV-broadcast grade Cricket Mega Auction & Live Telecasting system with dynamic player registration, authenticated franchise tables, admin security, captain/vice-captain purse deductions, procedural Web Audio SFX, and instant 1080x1080 Instagram "SOLD" graphic poster generation.

---

## 🌟 Key Upgrades & Architecture

### 1. 🔐 Admin Security & Access Control
* **Password-Protected Cockpit:** Master administrator controls are locked behind a secure password gate.
* **Default Master Password:** `admin@2026`
* **Custom Password Changer:** Admin can update the password anytime using the 🔑 Key button in the admin header.
* **Session Persistence:** Fast logout and session isolation so unauthorized users cannot access hammer controls.

### 2. 🛡️ Dynamic Franchise Teams & Auto Course Deductions
* **Create Custom Teams On-The-Fly:** Admin creates teams with:
  * Franchise Name & Short Code (e.g. *Chennai Super Kings / CSK*)
  * Custom Brand Colors & Logo Emoji
  * Total Purse Budget (e.g. ₹ 100 Crore)
  * **Captain Name** & **Captain Retention Deduction** (e.g. ₹ 18.00 Cr)
  * **Vice-Captain Name** & **Vice-Captain Retention Deduction** (e.g. ₹ 14.00 Cr)
* **Automatic Course / Retention Deduction:**
  $$\text{Available Purse} = \text{Total Purse} - (\text{Captain Price} + \text{Vice-Captain Price})$$
  The available auction purse updates in real time, and both Captain and Vice-Captain are automatically added to the team roster!
* **Unique Team Login Credentials:**
  * Each team receives an auto-generated **Team Login ID** (e.g. `csk_101`) and **Password** (e.g. `CSK@8492`).
  * Admin has a **"📋 Copy Credentials"** button next to each team to instantly paste and send the credentials to team owners via WhatsApp or email.

### 3. 📝 100% Dynamic Player Registration (Clean Slate)
* **Zero Hardcoded Dummy Values:** Starts with a clean slate ready for dynamic tournament registrations.
* **CricHeroes Integration:**
  * **CricHeroes Profile Name / ID** field.
  * **CricHeroes Phone / WhatsApp Number** field for instant contact.
* **Fast Mobile Camera & PC Photo Upload:**
  * 1-tap **"Select Photo / Camera"** button optimized for mobile phones (Android/iPhone camera & gallery) as well as PC desktop drop.
  * Instant 100ms client-side canvas compression down to ~50KB so registration is instantaneous on 4G/5G and WiFi.
* **Live Dynamic Trading Card:** Renders a high-end gold trading card in real time as the player fills out the form.
* **Admin Review Drawer:** All submitted players appear in the Admin Cockpit under **"Pending Approvals"** where the Admin can assign them to a Tier and sequence order with 1 click.

### 4. 📊 Excel & PDF Reports Engine
* **Franchise Team Squad Export:**
  * In the Team Console, franchise owners can click **"📊 Download Squad Info (Excel / CSV)"** to get their complete squad list with player phone numbers, CricHeroes profiles, roles, stats, and final prices.
* **Admin Full Tournament Export:**
  * In the Admin Cockpit, click **"📊 Export Full Excel"** to download a complete spreadsheet containing:
    * All Franchise Summaries (Budgets, spent, remaining purse, squad count)
    * All Sold Players (with winning team, price, base price, CricHeroes ID, phone number)
    * All Unsold Players
    * All Registered Players
* **Printable / Save-as-PDF Tournament Report:**
  * Click **"📄 PDF Report"** in the Admin Cockpit to open an executive summary report with auto-print / save-to-PDF formatting.

### 4. 🔨 Live Auctioneer Cockpit & Anti-Bankruptcy Bidding
* **Tier Sequencer:** Organize sets (Marquee, Tier 1, Tier 2, Uncapped) and configure custom base prices.
* **Smart Increment Ladders:** Quick increments (`+₹10L`, `+₹20L`, `+₹25L`, `+₹50L`, `+₹1 Cr`).
* **Hammer Sequence:** `Start 15s Timer` (with Web Audio ticks), `Going Once`, `Going Twice`, `HAMMER DOWN: SOLD!`, `UNSOLD`, and `Undo Last Bid`.
* **Anti-Bankruptcy Reserve Guard:** The bidding engine calculates:
  $$\text{Max Allowed Bid} = \text{Remaining Purse} - (\text{Required Unfilled Slots} \times \text{Min Base Price})$$
  Franchise consoles automatically lock and display warning banners if a team attempts to bid beyond their safe limit.

### 5. 🏛️ Dedicated Portal Separation & URL Direct Links
Every portal is now cleanly separated so users only see their designated screen:
* **`https://your-domain.vercel.app/#/hub`** → **Tournament Entrance Hub** (Clean gateway with cards to enter each portal)
* **`https://your-domain.vercel.app/#/register`** → **Dedicated Player Registration** (Share this on WhatsApp with players; no distracting admin/team buttons!)
* **`https://your-domain.vercel.app/#/admin`** → **Dedicated Admin Cockpit** (Password-protected console for tournament organizers)
* **`https://your-domain.vercel.app/#/team`** → **Dedicated Franchise War-Room** (Table bidding screen for team owners with Excel export)
* **`https://your-domain.vercel.app/#/broadcast`** → **Clean Live TV / OBS Overlay** (Stream-ready layout with live tickers and SOLD celebratory popup)
* **`https://your-domain.vercel.app/#/studio`** → **Instagram Poster Studio** (1080x1080 graphic generator)
* **Portal Dropdown:** Users can quickly jump between portals using the clean **`[ 🏛️ Switch Portal ▾ ]`** selector or click **"Entrance Hub"**.
* **Multi-Role Selection:** Players can select **multiple playing roles** simultaneously (e.g. *Batter + Wicketkeeper*, or *All-Rounder + Fast Bowler + Finisher*).

---

## ⚡ How to Run Locally Right Now

1. Double-click or open [index.html](file:///d:/Cricket_Aution/index.html) in your browser.
2. **Step 1 - Unlock Admin:**
   * Go to **👑 Admin Cockpit**.
   * Enter password: `admin@2026`
   * Click **"+ Create New Team"** to add 2 or 3 franchise teams with purse budgets and captains.
   * Copy the generated credentials for each team.
3. **Step 2 - Register Players:**
   * Go to **📝 Registration** tab and submit 1 or 2 player profiles with photos.
   * In **👑 Admin Cockpit**, approve them and slot them into Tiers.
4. **Step 3 - Test Live Multi-Tab Bidding:**
   * Open **Tab 1**: Admin Cockpit.
   * Open **Tab 2**: Team Console (Log in using Team 1's ID & Password).
   * Open **Tab 3**: Live Telecast / OBS.
   * In Admin, click **"Call 🎙️"** on a player.
   * In Team Console, tap **"RAISE TABLE PADDLE"** — watch all tabs update in **< 5ms**!
   * In Admin, click **"HAMMER DOWN: SOLD!"** — watch the TV broadcast burst confetti and display the **Instagram post popup**!

---

## 🚀 How to Push Updates to GitHub & Auto-Deploy on Vercel

Since your repo is already connected to Vercel, any push to `main` branch automatically deploys live in ~15 seconds!

Run these 3 commands in your PowerShell / Terminal:

```bash
git add .
git commit -m "feat: sky blue luxury theme and admin-only supabase cloud sync"
git push origin main
```

That's it! Vercel will immediately pick up the push and update your live site.

---

## ☁️ Connecting Free Supabase Cloud in Master Admin Cockpit

Supabase connects all mobile phones, franchise laptops, and stadium OBS screens in real time.

### Step 1: Create a Free Supabase Project
1. Go to [supabase.com](https://supabase.com) and click **Start your project** (100% Free, no credit card required).
2. Click **New Project**, name it (e.g. `cricket-auction-2026`), choose a database password and click **Create new project** (takes ~1 minute to spin up).

### Step 2: Run the 1-Click SQL Schema
1. In your Supabase dashboard, click **SQL Editor** on the left sidebar.
2. Click **+ New query**.
3. Copy the SQL schema from the **Cloud Sync** modal in your Admin Cockpit (or copy it below):
```sql
-- 1. Create Players Table
create table if not exists public.players (
  id text primary key,
  name text not null,
  role text not null,
  batting_style text,
  bowling_style text,
  country text default 'India',
  age integer,
  matches integer default 0,
  runs integer default 0,
  wickets integer default 0,
  strike_rate numeric default 0,
  economy numeric default 0,
  photo_url text,
  tier_id text,
  base_price_cr numeric default 0.20,
  status text default 'PENDING',
  sold_to_team text,
  sold_price_cr numeric,
  auction_sequence integer default 999,
  cric_heroes_name text,
  cric_heroes_phone text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Create Teams Table
create table if not exists public.teams (
  id text primary key,
  name text not null,
  short_code text not null,
  primary_color text not null,
  secondary_color text,
  logo_url text,
  purse_left_cr numeric not null,
  total_purse_cr numeric not null,
  captain_name text,
  captain_price_cr numeric default 0,
  vice_captain_name text,
  vice_captain_price_cr numeric default 0,
  team_login_id text,
  team_password text,
  squad jsonb default '[]'::jsonb,
  squad_count integer default 0,
  overseas_count integer default 0
);

-- 3. Create Live Auction State Table
create table if not exists public.auction_state (
  id text primary key default 'live_room',
  active_player_id text,
  current_bid_cr numeric default 0,
  current_bidder_id text,
  bid_history jsonb default '[]'::jsonb,
  hammer_status text default 'IDLE',
  timer_running boolean default false,
  timer_seconds integer default 15,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Enable Supabase Realtime
alter publication supabase_realtime add table public.players;
alter publication supabase_realtime add table public.teams;
alter publication supabase_realtime add table public.auction_state;
```
4. Click **Run** (Green button). You will see `Success. No rows returned`.

### Step 3: Copy Your API Keys
1. In Supabase, click **Project Settings** (gear icon at bottom left) -> **API** (or **Data API**).
2. Copy:
   * **Project URL** (looks like `https://xxxxxxxxxxxxxxxxxxxx.supabase.co`)
   * **Project API Keys -> `anon` public** (starts with `eyJhbGciOi...`)

### Step 4: Paste into Master Admin Cockpit
1. Open your live app: `https://your-app.vercel.app/#/admin`
2. Unlock the cockpit with password (default: `admin@2026`).
3. Click the **"☁️ Cloud Sync (Supabase)"** button in the admin bar.
4. Paste your **Project URL** and **Anon Key**.
5. Click **🧪 Test Connection** — you will see `✅ Connected to Supabase! All tables & Realtime active.`
6. Click **💾 Save & Connect Supabase**.

✨ **Done!** Every player registering from their phone, every bid from a team laptop, and the live broadcast overlay will now synchronize globally in real time with zero cost!

