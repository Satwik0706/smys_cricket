// state.js - Reactive State Management, Authentication, Dynamic Teams & Real-Time Sync

// Default Tiers (Can be edited, deleted, or expanded by Admin)
const DEFAULT_INITIAL_TIERS = [
  { id: "tier_marquee", name: "Set 1: Marquee Category", defaultBasePriceCr: 2.0, sequenceOrder: 1, color: "#D4AF37" },
  { id: "tier_tier1", name: "Set 2: Tier 1 Elite", defaultBasePriceCr: 1.5, sequenceOrder: 2, color: "#3B82F6" },
  { id: "tier_tier2", name: "Set 3: Tier 2 Specialists", defaultBasePriceCr: 1.0, sequenceOrder: 3, color: "#10B981" },
  { id: "tier_uncapped", name: "Set 4: Emerging & Uncapped", defaultBasePriceCr: 0.3, sequenceOrder: 4, color: "#8B5CF6" }
];

class AuctionStore {
  constructor() {
    this.channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('cricket_auction_channel') : null;
    this.listeners = [];
    this.loadState();

    if (this.channel) {
      this.channel.onmessage = (event) => {
        if (event.data && event.data.type === 'STATE_SYNC') {
          this.state = event.data.payload;
          this.saveLocal();
          this.notify();
        }
      };
    }

    // Sync across browser storage events
    window.addEventListener('storage', (e) => {
      if (e.key === 'cricket_auction_state' && e.newValue) {
        try {
          this.state = JSON.parse(e.newValue);
          this.notify();
        } catch (err) {
          console.error(err);
        }
      }
    });
  }

  loadState() {
    const saved = localStorage.getItem('cricket_auction_state');
    if (saved) {
      try {
        this.state = JSON.parse(saved);
        if (!this.state.teams) this.state.teams = [];
        if (!this.state.tiers) this.state.tiers = JSON.parse(JSON.stringify(DEFAULT_INITIAL_TIERS));
        if (!this.state.players) this.state.players = [];
        if (!this.state.adminPassword) this.state.adminPassword = "admin@2026"; // Default secure password
        if (!this.state.live) this.resetLiveAuctionState();
        return;
      } catch (e) {
        console.error("State parse error, rebuilding fresh state", e);
      }
    }

    // Fresh clean slate - ZERO hardcoded dummy players or dummy teams
    this.state = {
      adminPassword: "admin@2026",
      teams: [],
      tiers: JSON.parse(JSON.stringify(DEFAULT_INITIAL_TIERS)),
      players: [],
      live: {
        activePlayerId: null,
        currentBidCr: 0,
        currentBidderId: null,
        bidHistory: [],
        hammerStatus: "IDLE", // IDLE, BIDDING, GOING_ONCE, GOING_TWICE, SOLD, UNSOLD
        timerSeconds: 15,
        timerRunning: false,
        soldDetails: null
      }
    };
    this.saveLocal();
  }

  resetLiveAuctionState() {
    this.state.live = {
      activePlayerId: null,
      currentBidCr: 0,
      currentBidderId: null,
      bidHistory: [],
      hammerStatus: "IDLE",
      timerSeconds: 15,
      timerRunning: false,
      soldDetails: null
    };
  }

  saveLocal() {
    try {
      localStorage.setItem('cricket_auction_state', JSON.stringify(this.state));
    } catch (e) {
      console.warn("Storage write limit reached", e);
    }
  }

  broadcast() {
    this.saveLocal();
    if (this.channel) {
      this.channel.postMessage({ type: 'STATE_SYNC', payload: this.state });
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(cb => {
      try { cb(this.state); } catch (err) { console.error(err); }
    });
  }

  // --- AUTHENTICATION ---
  verifyAdminPassword(password) {
    return password === this.state.adminPassword;
  }

  updateAdminPassword(newPassword) {
    if (!newPassword || newPassword.length < 4) return false;
    this.state.adminPassword = newPassword;
    this.broadcast();
    return true;
  }

  verifyTeamLogin(loginId, password) {
    if (!loginId || !password) return null;
    const team = this.state.teams.find(t => 
      t.teamLoginId.toLowerCase() === loginId.trim().toLowerCase() && 
      t.teamPassword === password.trim()
    );
    return team || null;
  }

  // --- DYNAMIC TEAM MANAGEMENT ---
  createTeam(data) {
    const totalPurse = parseFloat(data.totalPurseCr) || 100.0;
    const captainPrice = parseFloat(data.captainPriceCr) || 0.0;
    const viceCaptainPrice = parseFloat(data.viceCaptainPriceCr) || 0.0;
    
    // Automatic Course / Retention Deduction
    const totalDeductions = captainPrice + viceCaptainPrice;
    const initialPurseLeft = Math.max(0, parseFloat((totalPurse - totalDeductions).toFixed(2)));

    // Generate unique Login ID and Password
    const cleanCode = (data.shortCode || "TEAM").trim().toUpperCase();
    const loginId = cleanCode.toLowerCase() + "_" + Math.floor(100 + Math.random() * 900);
    const generatedPassword = cleanCode + "@" + Math.floor(1000 + Math.random() * 9000);

    const newTeam = {
      id: "team_" + Date.now(),
      name: data.name.trim(),
      shortCode: cleanCode,
      primaryColor: data.primaryColor || "#D4AF37",
      secondaryColor: data.secondaryColor || "#0E1526",
      textColor: data.textColor || "#FFFFFF",
      logoEmoji: data.logoEmoji || "🏏",
      captainName: (data.captainName || "").trim(),
      captainPriceCr: captainPrice,
      viceCaptainName: (data.viceCaptainName || "").trim(),
      viceCaptainPriceCr: viceCaptainPrice,
      totalPurseCr: totalPurse,
      purseLeftCr: initialPurseLeft,
      teamLoginId: loginId,
      teamPassword: generatedPassword,
      squad: [],
      overseasCount: 0
    };

    // If captain/vice-captain are listed, add them to team squad roster
    if (newTeam.captainName) {
      newTeam.squad.push({
        playerId: "cap_" + Date.now(),
        name: newTeam.captainName + " (Captain)",
        role: "Captain (Retained)",
        priceCr: captainPrice,
        isOverseas: false
      });
    }
    if (newTeam.viceCaptainName) {
      newTeam.squad.push({
        playerId: "vc_" + Date.now(),
        name: newTeam.viceCaptainName + " (Vice-Captain)",
        role: "Vice-Captain (Retained)",
        priceCr: viceCaptainPrice,
        isOverseas: false
      });
    }

    this.state.teams.push(newTeam);
    this.broadcast();
    return newTeam;
  }

  deleteTeam(teamId) {
    this.state.teams = this.state.teams.filter(t => t.id !== teamId);
    if (this.state.live.currentBidderId === teamId) {
      this.state.live.currentBidderId = null;
    }
    this.broadcast();
  }

  // --- DYNAMIC PLAYER REGISTRATION ---
  registerPlayer(data) {
    const id = "ply_" + Date.now();
    const newPlayer = {
      id: id,
      name: data.name.trim(),
      role: data.role || "Batter",
      battingStyle: data.battingStyle || "Right-hand bat",
      bowlingStyle: data.bowlingStyle || "Right-arm medium",
      country: data.country ? data.country.trim() : "India",
      age: parseInt(data.age) || 24,
      isOverseas: data.country && data.country.toLowerCase() !== 'india',
      matches: parseInt(data.matches) || 0,
      runs: parseInt(data.runs) || 0,
      wickets: parseInt(data.wickets) || 0,
      strikeRate: parseFloat(data.strikeRate) || 0,
      economy: parseFloat(data.economy) || 0,
      cricHeroesName: (data.cricHeroesName || "").trim(),
      cricHeroesPhone: (data.cricHeroesPhone || "").trim(),
      photoUrl: data.photoUrl || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><rect width='200' height='200' fill='%230F172A'/><circle cx='100' cy='72' r='36' fill='%23334155'/><circle cx='100' cy='72' r='28' fill='%23475569'/><path d='M36,176 C36,132 68,120 100,120 C132,120 164,132 164,176 Z' fill='%23334155'/><circle cx='100' cy='142' r='18' fill='%231E293B'/><text x='100' y='148' font-size='20' text-anchor='middle'>🏏</text></svg>",
      tierId: null, // Admin will assign
      basePriceCr: parseFloat(data.requestedBasePriceCr) || 0.20,
      status: "PENDING", // Needs Admin review & tier allocation
      auctionSequence: 999,
      soldToTeam: null,
      soldPriceCr: null
    };

    this.state.players.push(newPlayer);
    this.broadcast();
    return newPlayer;
  }

  approvePlayer(playerId, tierId, basePriceCr, sequenceOrder) {
    const p = this.state.players.find(x => x.id === playerId);
    if (!p) return;
    p.status = "READY";
    p.tierId = tierId;
    p.basePriceCr = parseFloat(basePriceCr);
    if (sequenceOrder) p.auctionSequence = parseInt(sequenceOrder);
    this.broadcast();
  }

  rejectPlayer(playerId) {
    const p = this.state.players.find(x => x.id === playerId);
    if (!p) return;
    p.status = "REJECTED";
    this.broadcast();
  }

  deletePlayer(playerId) {
    this.state.players = this.state.players.filter(p => p.id !== playerId);
    if (this.state.live.activePlayerId === playerId) {
      this.resetLiveAuctionState();
    }
    this.broadcast();
  }

  // --- TIER MANAGEMENT ---
  createTier(tier) {
    const id = "tier_" + Date.now();
    this.state.tiers.push({
      id: id,
      name: tier.name.trim(),
      defaultBasePriceCr: parseFloat(tier.defaultBasePriceCr) || 1.0,
      sequenceOrder: this.state.tiers.length + 1,
      color: tier.color || "#D4AF37"
    });
    this.broadcast();
  }

  updateTierPrice(tierId, newPriceCr) {
    const t = this.state.tiers.find(x => x.id === tierId);
    if (t) {
      t.defaultBasePriceCr = parseFloat(newPriceCr);
      // Automatically update all un-auctioned players in this tier
      this.state.players.forEach(p => {
        if (p.tierId === tierId && p.status === "READY") {
          p.basePriceCr = parseFloat(newPriceCr);
        }
      });
      this.broadcast();
    }
  }

  deleteTier(tierId) {
    this.state.tiers = this.state.tiers.filter(t => t.id !== tierId);
    this.broadcast();
  }

  // --- LIVE AUCTION CONTROLS ---
  callPlayerToStage(playerId) {
    const p = this.state.players.find(x => x.id === playerId);
    if (!p) return;

    this.state.live.activePlayerId = playerId;
    this.state.live.currentBidCr = p.basePriceCr;
    this.state.live.currentBidderId = null;
    this.state.live.bidHistory = [];
    this.state.live.hammerStatus = "IDLE";
    this.state.live.timerSeconds = 15;
    this.state.live.timerRunning = false;
    this.state.live.soldDetails = null;

    p.status = "IN_AUCTION";
    this.broadcast();
  }

  placeBid(teamId, bidAmountCr) {
    const team = this.state.teams.find(t => t.id === teamId);
    const player = this.getActivePlayer();
    if (!team || !player) return { success: false, reason: "No active player or invalid franchise team" };

    const amount = parseFloat(bidAmountCr);

    // Anti-bankruptcy calculation
    const minSlotsLeft = Math.max(0, (window.TOURNAMENT_CONFIG ? window.TOURNAMENT_CONFIG.minSquadSize : 18) - (team.squad.length + 1));
    const reservedPurse = minSlotsLeft * 0.20; // 20 Lakh reserve per slot
    const maxAllowedBid = team.purseLeftCr - reservedPurse;

    if (amount > maxAllowedBid) {
      return { 
        success: false, 
        reason: `Bid exceeds allowed limit! Team must reserve ₹${reservedPurse.toFixed(2)} Cr for remaining ${minSlotsLeft} required squad slots.` 
      };
    }

    if (player.isOverseas && team.overseasCount >= 8) {
      return { success: false, reason: "Overseas player limit reached! (Max 8 allowed)" };
    }

    // Place bid
    this.state.live.bidHistory.unshift({
      teamId: team.id,
      teamName: team.name,
      teamShort: team.shortCode,
      color: team.primaryColor,
      amountCr: amount,
      time: new Date().toLocaleTimeString()
    });

    this.state.live.currentBidCr = amount;
    this.state.live.currentBidderId = team.id;
    this.state.live.hammerStatus = "BIDDING";
    this.state.live.timerSeconds = 15;
    this.state.live.timerRunning = true;

    this.broadcast();
    if (window.auctionAudio) window.auctionAudio.playBidChime();

    return { success: true };
  }

  undoLastBid() {
    if (this.state.live.bidHistory.length === 0) return;
    this.state.live.bidHistory.shift();

    if (this.state.live.bidHistory.length > 0) {
      const prev = this.state.live.bidHistory[0];
      this.state.live.currentBidCr = prev.amountCr;
      this.state.live.currentBidderId = prev.teamId;
      this.state.live.hammerStatus = "BIDDING";
    } else {
      const p = this.getActivePlayer();
      this.state.live.currentBidCr = p ? p.basePriceCr : 0;
      this.state.live.currentBidderId = null;
      this.state.live.hammerStatus = "IDLE";
    }
    this.state.live.timerSeconds = 15;
    this.broadcast();
  }

  setHammerStatus(status) {
    this.state.live.hammerStatus = status;
    if (status === 'GOING_ONCE' || status === 'GOING_TWICE') {
      if (window.auctionAudio) window.auctionAudio.playGoingWarning();
    }
    this.broadcast();
  }

  hammerSold() {
    const player = this.getActivePlayer();
    const winningTeam = this.state.teams.find(t => t.id === this.state.live.currentBidderId);

    if (!player || !winningTeam) return false;

    const finalPrice = this.state.live.currentBidCr;

    // Deduct Purse
    winningTeam.purseLeftCr = parseFloat((winningTeam.purseLeftCr - finalPrice).toFixed(2));
    winningTeam.squad.push({
      playerId: player.id,
      name: player.name,
      role: player.role,
      battingStyle: player.battingStyle || "Right-hand bat",
      bowlingStyle: player.bowlingStyle || "Medium",
      cricHeroesName: player.cricHeroesName || "N/A",
      cricHeroesPhone: player.cricHeroesPhone || "N/A",
      runs: player.runs || 0,
      wickets: player.wickets || 0,
      strikeRate: player.strikeRate || 0,
      priceCr: finalPrice,
      isOverseas: player.isOverseas
    });
    if (player.isOverseas) {
      winningTeam.overseasCount = (winningTeam.overseasCount || 0) + 1;
    }

    // Update Player
    player.status = "SOLD";
    player.soldToTeam = winningTeam.id;
    player.soldPriceCr = finalPrice;

    // Set Live State for Screen Celebration & Instagram Pop-up
    this.state.live.hammerStatus = "SOLD";
    this.state.live.timerRunning = false;
    this.state.live.soldDetails = {
      player: JSON.parse(JSON.stringify(player)),
      team: JSON.parse(JSON.stringify(winningTeam)),
      finalPriceCr: finalPrice,
      timestamp: new Date().toISOString()
    };

    this.broadcast();

    // Trigger Fanfare
    if (window.auctionAudio) window.auctionAudio.playSoldFanfare();

    return true;
  }

  hammerUnsold() {
    const player = this.getActivePlayer();
    if (!player) return;

    player.status = "UNSOLD";
    this.state.live.hammerStatus = "UNSOLD";
    this.state.live.timerRunning = false;
    this.state.live.currentBidderId = null;
    this.state.live.soldDetails = null;

    this.broadcast();
    if (window.auctionAudio) window.auctionAudio.playUnsoldBuzzer();
  }

  // Helper Getters
  getActivePlayer() {
    return this.state.players.find(p => p.id === this.state.live.activePlayerId);
  }

  getNextPlayerInSequence() {
    const unauctioned = this.state.players
      .filter(p => p.status === "READY" && p.id !== this.state.live.activePlayerId)
      .sort((a, b) => (a.auctionSequence || 999) - (b.auctionSequence || 999));
    return unauctioned[0] || null;
  }

  getTeam(teamId) {
    return this.state.teams.find(t => t.id === teamId);
  }

  getTier(tierId) {
    return this.state.tiers.find(t => t.id === tierId);
  }
}

window.auctionStore = new AuctionStore();
