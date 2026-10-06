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

## ☁️ How to Deploy Live to Vercel (Step-by-Step)

Deploying to Vercel gives you a global link (`https://your-cricket-auction.vercel.app`) that you can share with players and team owners worldwide.

### Method 1: Deploy via GitHub (Recommended)
1. Push your project directory to a GitHub repository:
   ```bash
   cd d:\Cricket_Aution
   git init
   git add .
   git commit -m "Cricket Mega Auction Platform"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New Project"** and select your GitHub repository.
4. Framework Preset: Choose **Other** (Root directory: `./`).
5. Click **Deploy**.
6. Within 30 seconds, Vercel will give you a live HTTPS domain: `https://your-tournament.vercel.app`!

### Method 2: Deploy via Vercel CLI (1-Command)
1. In your terminal, run:
   ```bash
   npm i -g vercel
   cd d:\Cricket_Aution
   vercel
   ```
2. Follow the 3 prompts (hit Enter to accept defaults). Your app will be live immediately!

---

## 🗄️ Connecting Free Supabase Cloud (When Live on Vercel)

To enable live cross-country WebSocket sync between players on phones and teams on laptops:

1. Create a free account at [Supabase](https://supabase.com) (100% Free, no credit card).
2. Create a new project (e.g. `cricket-auction`).
3. Click **SQL Editor** on the left menu in Supabase.
4. In your live web app, click the **"☁️ Cloud Sync"** button in the top navigation bar.
5. Copy the SQL schema from the modal, paste it into the Supabase SQL editor, and click **Run**.
6. In Supabase, go to **Project Settings -> API** and copy your:
   * **Project URL**
   * **Anon Public Key**
7. Paste them into the **Cloud Sync** modal on the web app and click **Save**.
8. All player registrations and live bids now sync globally across all devices!
