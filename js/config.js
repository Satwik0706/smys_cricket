// config.js - Supabase & Tournament Configuration
// Supports 100% Free Supabase Cloud Mode + Instant Local Offline Fallback

const TOURNAMENT_CONFIG = {
  tournamentName: "PREMIER T20 CRICKET MEGA AUCTION",
  season: "2026",
  currencySymbol: "₹",
  defaultPurseCr: 100, // ₹ 100 Crore per team
  minBasePriceLakh: 20, // ₹ 20 Lakh minimum squad slot reserve
  maxSquadSize: 25,
  minSquadSize: 18,
  maxOverseas: 8,
  timerSeconds: 15,
  
  // Supabase Real-Time Cloud Configuration
  // -------------------------------------------------------------
  // TO MAKE REAL-TIME WORK FOR EVERYONE ACROSS ALL DEVICES:
  // Paste your Supabase Project URL and Anon Public Key below.
  // Any phone, laptop, or tablet visiting the site will automatically
  // connect to the live database in real time.
  // -------------------------------------------------------------
  supabaseUrl: "https://uiwqmyhzunfbmtigjusx.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpd3FteWh6dW5mYm10aWdqdXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzMDc5MTcsImV4cCI6MjEwNjg4MzkxN30.0OxbuUu-vOD3k9Ym7sZgMt0KWlOBhVjtrBVWeArzZ6o",

  // Standard increment slab ladder (in Crores/Lakhs)
  getIncrement(currentBidCr) {
    if (currentBidCr < 1.00) return 0.10; // +10 Lakh below 1 Cr
    if (currentBidCr < 3.00) return 0.20; // +20 Lakh between 1-3 Cr
    if (currentBidCr < 5.00) return 0.25; // +25 Lakh between 3-5 Cr
    if (currentBidCr < 10.00) return 0.50; // +50 Lakh between 5-10 Cr
    return 1.00; // +1.00 Cr above 10 Cr
  }
};

// SQL Schema for Supabase (Can be run in Supabase SQL Editor with 1 click)
const SUPABASE_SQL_SCHEMA = `
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
  status text default 'PENDING', -- PENDING, READY, IN_AUCTION, SOLD, UNSOLD, REJECTED
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

-- 3. Create Live Auction State Table (Single row for real-time sync)
create table if not exists public.auction_state (
  id text primary key default 'live_room',
  active_player_id text,
  current_bid_cr numeric default 0,
  current_bidder_id text,
  bid_history jsonb default '[]'::jsonb,
  hammer_status text default 'IDLE', -- IDLE, BIDDING, GOING_ONCE, GOING_TWICE, SOLD, UNSOLD
  timer_running boolean default false,
  timer_seconds integer default 15,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Initialize default live auction room if missing
insert into public.auction_state (id, hammer_status) values ('live_room', 'IDLE')
on conflict (id) do nothing;

-- 4. Enable Supabase Realtime
alter publication supabase_realtime add table public.players;
alter publication supabase_realtime add table public.teams;
alter publication supabase_realtime add table public.auction_state;

-- 5. Open public read/write access for seamless tournament operations with anon key
alter table public.players disable row level security;
alter table public.teams disable row level security;
alter table public.auction_state disable row level security;

-- Add permissive policies (guarantees anon access even if RLS remains enabled)
drop policy if exists "Allow all on players" on public.players;
create policy "Allow all on players" on public.players for all using (true) with check (true);

drop policy if exists "Allow all on teams" on public.teams;
create policy "Allow all on teams" on public.teams for all using (true) with check (true);

drop policy if exists "Allow all on auction_state" on public.auction_state;
create policy "Allow all on auction_state" on public.auction_state for all using (true) with check (true);
`;

const DEFAULT_CRICKET_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><rect width='200' height='200' fill='%230F172A'/><circle cx='100' cy='72' r='36' fill='%23334155'/><circle cx='100' cy='72' r='28' fill='%23475569'/><path d='M36,176 C36,132 68,120 100,120 C132,120 164,132 164,176 Z' fill='%23334155'/><circle cx='100' cy='142' r='18' fill='%231E293B'/><text x='100' y='148' font-size='20' text-anchor='middle'>🏏</text></svg>";

window.TOURNAMENT_CONFIG = TOURNAMENT_CONFIG;
window.SUPABASE_SQL_SCHEMA = SUPABASE_SQL_SCHEMA;
window.DEFAULT_CRICKET_AVATAR = DEFAULT_CRICKET_AVATAR;
