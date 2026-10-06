// app.js - Master Controller Wiring All Portals, Authentication, Dynamic Teams & Real-Time Sync

document.addEventListener('DOMContentLoaded', () => {
  // --- Global Elements ---
  const portalTabs = document.querySelectorAll('.tab-btn');
  const portalViews = document.querySelectorAll('.portal-view');
  const btnToggleSound = document.getElementById('btnToggleSound');
  const soundIcon = document.getElementById('soundIcon');
  const btnPopoutBroadcast = document.getElementById('btnPopoutBroadcast');
  const btnCloudSettings = document.getElementById('btnCloudSettings');
  const cloudModal = document.getElementById('cloudSettingsModal');
  const btnCloseCloudModal = document.getElementById('btnCloseCloudModal');
  const btnSaveCloudConfig = document.getElementById('btnSaveCloudConfig');
  const sqlSchemaDisplay = document.getElementById('sqlSchemaDisplay');

  // Lock Badges
  const adminLockBadge = document.getElementById('adminLockBadge');
  const teamLockBadge = document.getElementById('teamLockBadge');

  // Display SQL Schema in Cloud Modal
  if (sqlSchemaDisplay && window.SUPABASE_SQL_SCHEMA) {
    sqlSchemaDisplay.textContent = window.SUPABASE_SQL_SCHEMA.trim();
  }

  // --- Sound FX Toggle ---
  btnToggleSound.addEventListener('click', () => {
    const isMuted = window.auctionAudio.toggleMute();
    soundIcon.textContent = isMuted ? '🔇' : '🔊';
    btnToggleSound.innerHTML = `<span id="soundIcon">${isMuted ? '🔇' : '🔊'}</span> Sound ${isMuted ? 'OFF' : 'ON'}`;
  });

  // --- Pop-out Broadcast Window for OBS / Stadium Projector ---
  btnPopoutBroadcast.addEventListener('click', () => {
    const popout = window.open(window.location.href, 'OBS_Cricket_Broadcast', 'width=1920,height=1080,menubar=no,toolbar=no');
    if (popout) {
      popout.onload = () => {
        if (popout.switchPortal) popout.switchPortal('viewBroadcast');
      };
    }
  });

  // --- Cloud Settings Modal ---
  btnCloudSettings.addEventListener('click', () => {
    document.getElementById('inputSupabaseUrl').value = localStorage.getItem('cricket_supabase_url') || '';
    document.getElementById('inputSupabaseKey').value = localStorage.getItem('cricket_supabase_key') || '';
    cloudModal.classList.add('active');
  });

  btnCloseCloudModal.addEventListener('click', () => {
    cloudModal.classList.remove('active');
  });

  btnSaveCloudConfig.addEventListener('click', () => {
    const url = document.getElementById('inputSupabaseUrl').value.trim();
    const key = document.getElementById('inputSupabaseKey').value.trim();
    localStorage.setItem('cricket_supabase_url', url);
    localStorage.setItem('cricket_supabase_key', key);
    alert('Cloud configuration saved! Connect your GitHub repo to Vercel for 1-click live deployment.');
    cloudModal.classList.remove('active');
  });

  // --- Navigation & Portal Switching ---
  window.switchPortal = (portalId) => {
    portalTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.portal === portalId);
    });
    portalViews.forEach(view => {
      view.classList.toggle('active', view.id === portalId);
    });
    if (portalId === 'viewPosterStudio') {
      renderStudioPoster();
    }
  };

  portalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      window.switchPortal(tab.dataset.portal);
    });
  });

  // ============================================================
  // 🔐 ADMIN AUTHENTICATION
  // ============================================================
  const adminLockScreen = document.getElementById('adminLockScreen');
  const adminMainContent = document.getElementById('adminMainContent');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const inputAdminPassword = document.getElementById('inputAdminPassword');
  const btnAdminLogout = document.getElementById('btnAdminLogout');
  const btnChangeAdminPass = document.getElementById('btnChangeAdminPass');
  const changePassModal = document.getElementById('changePassModal');
  const btnClosePassModal = document.getElementById('btnClosePassModal');
  const formChangeAdminPass = document.getElementById('formChangeAdminPass');

  function checkAdminAuth() {
    const isAuthed = sessionStorage.getItem('cricket_admin_auth') === 'true';
    if (isAuthed) {
      adminLockScreen.style.display = 'none';
      adminMainContent.style.display = 'block';
      if (adminLockBadge) adminLockBadge.textContent = '🔓';
    } else {
      adminLockScreen.style.display = 'block';
      adminMainContent.style.display = 'none';
      if (adminLockBadge) adminLockBadge.textContent = '🔒';
    }
  }

  adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const entered = inputAdminPassword.value.trim();
    if (window.auctionStore.verifyAdminPassword(entered)) {
      sessionStorage.setItem('cricket_admin_auth', 'true');
      inputAdminPassword.value = '';
      checkAdminAuth();
      window.auctionStore.notify();
    } else {
      alert('❌ Invalid admin password. (Default is: admin@2026)');
    }
  });

  btnAdminLogout.addEventListener('click', () => {
    sessionStorage.removeItem('cricket_admin_auth');
    checkAdminAuth();
  });

  btnChangeAdminPass.addEventListener('click', () => {
    changePassModal.classList.add('active');
  });

  btnClosePassModal.addEventListener('click', () => {
    changePassModal.classList.remove('active');
  });

  formChangeAdminPass.addEventListener('submit', (e) => {
    e.preventDefault();
    const newPass = document.getElementById('inputNewAdminPass').value.trim();
    if (window.auctionStore.updateAdminPassword(newPass)) {
      alert('✅ Admin master password updated successfully!');
      changePassModal.classList.remove('active');
      formChangeAdminPass.reset();
    } else {
      alert('Password must be at least 4 characters.');
    }
  });

  checkAdminAuth();

  // ============================================================
  // 🛡️ TEAM FRANCHISE AUTHENTICATION
  // ============================================================
  const teamLockScreen = document.getElementById('teamLockScreen');
  const teamMainContent = document.getElementById('teamMainContent');
  const teamLoginForm = document.getElementById('teamLoginForm');
  const inputTeamLoginId = document.getElementById('inputTeamLoginId');
  const inputTeamPassword = document.getElementById('inputTeamPassword');
  const btnTeamLogout = document.getElementById('btnTeamLogout');
  const teamAuthenticatedName = document.getElementById('teamAuthenticatedName');
  const teamBadgeEmoji = document.getElementById('teamBadgeEmoji');
  const teamLeadershipTag = document.getElementById('teamLeadershipTag');

  let activeLoggedInTeamId = sessionStorage.getItem('cricket_active_team_id') || null;

  function checkTeamAuth() {
    const team = window.auctionStore.getTeam(activeLoggedInTeamId);
    if (activeLoggedInTeamId && team) {
      teamLockScreen.style.display = 'none';
      teamMainContent.style.display = 'block';
      if (teamLockBadge) teamLockBadge.textContent = '🔓';
      teamAuthenticatedName.textContent = team.name;
      teamBadgeEmoji.textContent = team.logoEmoji || '🏏';
      teamLeadershipTag.textContent = `Captain: ${team.captainName || 'Not Set'} • Vice-Captain: ${team.viceCaptainName || 'Not Set'}`;
      renderTeamWarroom(window.auctionStore.state);
    } else {
      teamLockScreen.style.display = 'block';
      teamMainContent.style.display = 'none';
      if (teamLockBadge) teamLockBadge.textContent = '🔒';
      activeLoggedInTeamId = null;
      sessionStorage.removeItem('cricket_active_team_id');
    }
  }

  teamLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const loginId = inputTeamLoginId.value.trim();
    const pass = inputTeamPassword.value.trim();
    const team = window.auctionStore.verifyTeamLogin(loginId, pass);
    if (team) {
      activeLoggedInTeamId = team.id;
      sessionStorage.setItem('cricket_active_team_id', team.id);
      teamLoginForm.reset();
      checkTeamAuth();
    } else {
      alert('❌ Invalid Team Login ID or Password! Please verify your credentials with the administrator.');
    }
  });

  btnTeamLogout.addEventListener('click', () => {
    activeLoggedInTeamId = null;
    sessionStorage.removeItem('cricket_active_team_id');
    checkTeamAuth();
  });

  checkTeamAuth();

  // ============================================================
  // ➕ CREATE TEAM MODAL & RETENTION DEDUCTIONS
  // ============================================================
  const createTeamModal = document.getElementById('createTeamModal');
  const btnOpenCreateTeamModal = document.getElementById('btnOpenCreateTeamModal');
  const btnOpenCreateTeamModal2 = document.getElementById('btnOpenCreateTeamModal2');
  const btnCloseTeamModal = document.getElementById('btnCloseTeamModal');
  const formCreateTeam = document.getElementById('formCreateTeam');
  const newTeamTotalPurse = document.getElementById('newTeamTotalPurse');
  const newTeamCaptainPrice = document.getElementById('newTeamCaptainPrice');
  const newTeamVCPrice = document.getElementById('newTeamVCPrice');
  const newTeamPursePreview = document.getElementById('newTeamPursePreview');

  function openCreateTeam() {
    createTeamModal.classList.add('active');
    updateTeamPursePreview();
  }

  if (btnOpenCreateTeamModal) btnOpenCreateTeamModal.addEventListener('click', openCreateTeam);
  if (btnOpenCreateTeamModal2) btnOpenCreateTeamModal2.addEventListener('click', openCreateTeam);
  btnCloseTeamModal.addEventListener('click', () => createTeamModal.classList.remove('active'));

  function updateTeamPursePreview() {
    const total = parseFloat(newTeamTotalPurse.value) || 0;
    const cap = parseFloat(newTeamCaptainPrice.value) || 0;
    const vc = parseFloat(newTeamVCPrice.value) || 0;
    const left = Math.max(0, total - (cap + vc));
    newTeamPursePreview.textContent = `Purse Available for Auction: ₹ ${left.toFixed(2)} Cr (Deductions: ₹ ${(cap + vc).toFixed(2)} Cr)`;
  }

  [newTeamTotalPurse, newTeamCaptainPrice, newTeamVCPrice].forEach(el => {
    if (el) el.addEventListener('input', updateTeamPursePreview);
  });

  formCreateTeam.addEventListener('submit', (e) => {
    e.preventDefault();
    const newTeam = window.auctionStore.createTeam({
      name: document.getElementById('newTeamName').value,
      shortCode: document.getElementById('newTeamCode').value,
      primaryColor: document.getElementById('newTeamColor').value,
      logoEmoji: document.getElementById('newTeamEmoji').value,
      totalPurseCr: newTeamTotalPurse.value,
      captainName: document.getElementById('newTeamCaptain').value,
      captainPriceCr: newTeamCaptainPrice.value,
      viceCaptainName: document.getElementById('newTeamVC').value,
      viceCaptainPriceCr: newTeamVCPrice.value
    });

    alert(`🎉 Team "${newTeam.name}" created!\n\n📋 Team Credentials:\nLogin ID: ${newTeam.teamLoginId}\nPassword: ${newTeam.teamPassword}\n\nPurse Available: ₹${newTeam.purseLeftCr.toFixed(2)} Cr`);
    formCreateTeam.reset();
    createTeamModal.classList.remove('active');
  });

  // ============================================================
  // 📝 PORTAL 1: PLAYER REGISTRATION
  // ============================================================
  const playerRegForm = document.getElementById('playerRegForm');
  const photoDropzone = document.getElementById('photoDropzone');
  const regPhotoFile = document.getElementById('regPhotoFile');
  const regPhotoUrl = document.getElementById('regPhotoUrl');

  const cardPreviewImg = document.getElementById('cardPreviewImg');
  const cardPreviewName = document.getElementById('cardPreviewName');
  const cardPreviewRole = document.getElementById('cardPreviewRole');
  const cardPreviewMatches = document.getElementById('cardPreviewMatches');
  const cardPreviewRuns = document.getElementById('cardPreviewRuns');
  const cardPreviewSR = document.getElementById('cardPreviewSR');

  const cardPreviewCricHeroes = document.getElementById('cardPreviewCricHeroes');

  let currentPhotoDataUrl = window.DEFAULT_CRICKET_AVATAR || cardPreviewImg.src;

  const updateCardPreview = () => {
    const name = document.getElementById('regName').value || 'PLAYER NAME';
    const country = document.getElementById('regCountry').value || 'INDIA';
    const roleEl = document.querySelector('input[name="regRole"]:checked');
    const role = roleEl ? roleEl.value : 'Batter';
    const matches = document.getElementById('regMatches').value || '0';
    const runs = document.getElementById('regRuns').value || '0';
    const sr = document.getElementById('regStrikeRate').value || '0.0';
    const chName = (document.getElementById('regCricHeroesName') ? document.getElementById('regCricHeroesName').value.trim() : '');

    cardPreviewName.textContent = name.toUpperCase();
    cardPreviewRole.textContent = `🏏 ${role.toUpperCase()} • ${country.toUpperCase()}`;
    if (cardPreviewCricHeroes) {
      cardPreviewCricHeroes.textContent = chName ? `📱 CricHeroes: ${chName}` : '📱 CricHeroes: Not linked';
    }
    cardPreviewMatches.textContent = matches;
    cardPreviewRuns.textContent = runs;
    cardPreviewSR.textContent = sr;
    cardPreviewImg.src = currentPhotoDataUrl;
  };

  ['regName', 'regCountry', 'regAge', 'regMatches', 'regRuns', 'regStrikeRate', 'regWickets', 'regEconomy', 'regCricHeroesName', 'regCricHeroesPhone'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateCardPreview);
  });

  document.querySelectorAll('input[name="regRole"]').forEach(r => {
    r.addEventListener('change', updateCardPreview);
  });

  // 100% Zero-cost Local Canvas compression (Optimized for Mobile Camera & PC)
  const btnChoosePhoto = document.getElementById('btnChoosePhoto');
  const uploadSuccessBadge = document.getElementById('uploadSuccessBadge');

  if (photoDropzone) {
    photoDropzone.addEventListener('click', () => regPhotoFile.click());
  }
  if (btnChoosePhoto) {
    btnChoosePhoto.addEventListener('click', (e) => {
      e.stopPropagation();
      regPhotoFile.click();
    });
  }

  regPhotoFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 450;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxDim) { h = Math.round(h * maxDim / w); w = maxDim; }
        } else {
          if (h > maxDim) { h = Math.round(h * maxDim / h); h = maxDim; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        currentPhotoDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        cardPreviewImg.src = currentPhotoDataUrl;
        if (uploadSuccessBadge) uploadSuccessBadge.style.display = 'block';
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  regPhotoUrl.addEventListener('input', () => {
    if (regPhotoUrl.value.trim()) {
      currentPhotoDataUrl = regPhotoUrl.value.trim();
      cardPreviewImg.src = currentPhotoDataUrl;
      if (uploadSuccessBadge) uploadSuccessBadge.style.display = 'block';
    }
  });

  playerRegForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const roleEl = document.querySelector('input[name="regRole"]:checked');

    const newPlayer = window.auctionStore.registerPlayer({
      name: document.getElementById('regName').value.trim(),
      country: document.getElementById('regCountry').value.trim(),
      age: document.getElementById('regAge').value,
      battingStyle: document.getElementById('regBattingStyle').value,
      bowlingStyle: document.getElementById('regBowlingStyle').value.trim(),
      role: roleEl ? roleEl.value : 'Batter',
      matches: document.getElementById('regMatches').value || 0,
      runs: document.getElementById('regRuns').value || 0,
      strikeRate: document.getElementById('regStrikeRate').value || 0,
      wickets: document.getElementById('regWickets').value || 0,
      economy: document.getElementById('regEconomy').value || 0,
      cricHeroesName: document.getElementById('regCricHeroesName') ? document.getElementById('regCricHeroesName').value.trim() : '',
      cricHeroesPhone: document.getElementById('regCricHeroesPhone') ? document.getElementById('regCricHeroesPhone').value.trim() : '',
      photoUrl: currentPhotoDataUrl
    });

    alert(`🎉 Registration successful for ${newPlayer.name}!\n\nCricHeroes: ${newPlayer.cricHeroesName || 'N/A'}\nPhone: ${newPlayer.cricHeroesPhone || 'N/A'}\n\nYour profile has been forwarded to the Admin inbox for tier review.`);
    playerRegForm.reset();
    currentPhotoDataUrl = window.DEFAULT_CRICKET_AVATAR;
    if (uploadSuccessBadge) uploadSuccessBadge.style.display = 'none';
    updateCardPreview();
  });

  // ============================================================
  // 👑 ADMIN COCKPIT & LIVE HAMMER LOGIC
  // ============================================================
  const tierListContainer = document.getElementById('tierListContainer');
  const pendingPlayersList = document.getElementById('pendingPlayersList');
  const pendingCountBadge = document.getElementById('pendingCountBadge');
  const sequenceTableBody = document.getElementById('sequenceTableBody');
  const adminTeamsGrid = document.getElementById('adminTeamsGrid');
  const adminTeamsCount = document.getElementById('adminTeamsCount');
  const btnCallNextSeq = document.getElementById('btnCallNextSeq');
  const btnResetAuction = document.getElementById('btnResetAuction');
  const btnAddTier = document.getElementById('btnAddTier');

  // Add Tier
  btnAddTier.addEventListener('click', () => {
    const name = prompt('Enter Tier / Set Name (e.g. Set 5: Finisher Batsmen):');
    if (!name) return;
    const price = prompt('Enter Default Base Price in Crores (e.g. 0.75 for ₹75 Lakh):', '1.0');
    if (!price) return;
    window.auctionStore.createTier({
      name: name,
      defaultBasePriceCr: parseFloat(price)
    });
  });

  btnResetAuction.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all tournament state and start with a clean slate?')) {
      localStorage.removeItem('cricket_auction_state');
      window.auctionStore.loadState();
      window.auctionStore.broadcast();
    }
  });

  btnCallNextSeq.addEventListener('click', () => {
    const nextPlayer = window.auctionStore.getNextPlayerInSequence();
    if (!nextPlayer) {
      alert('No uncalled players in the sequence queue! Approve pending registrations or assign sequence numbers.');
      return;
    }
    window.auctionStore.callPlayerToStage(nextPlayer.id);
  });

  // Increments
  document.querySelectorAll('.chip-inc[data-inc]').forEach(btn => {
    btn.addEventListener('click', () => {
      const inc = parseFloat(btn.dataset.inc);
      const curr = window.auctionStore.state.live.currentBidCr;
      const target = parseFloat((curr + inc).toFixed(2));
      const teamId = window.auctionStore.state.live.currentBidderId || (window.auctionStore.state.teams[0] ? window.auctionStore.state.teams[0].id : null);
      if (!teamId) {
        alert('Please create at least one team first!');
        return;
      }
      window.auctionStore.placeBid(teamId, target);
    });
  });

  // Hammer Buttons
  const btnAdminTimer = document.getElementById('btnAdminTimer');
  const btnAdminOnce = document.getElementById('btnAdminOnce');
  const btnAdminTwice = document.getElementById('btnAdminTwice');
  const btnAdminSold = document.getElementById('btnAdminSold');
  const btnAdminUnsold = document.getElementById('btnAdminUnsold');
  const btnAdminUndo = document.getElementById('btnAdminUndo');

  let timerInterval = null;

  btnAdminTimer.addEventListener('click', () => {
    window.auctionStore.state.live.timerSeconds = 15;
    window.auctionStore.state.live.timerRunning = true;
    window.auctionStore.broadcast();
    startCountdown();
  });

  btnAdminOnce.addEventListener('click', () => window.auctionStore.setHammerStatus('GOING_ONCE'));
  btnAdminTwice.addEventListener('click', () => window.auctionStore.setHammerStatus('GOING_TWICE'));

  btnAdminSold.addEventListener('click', () => {
    if (!window.auctionStore.state.live.currentBidderId) {
      alert('Cannot sell: No franchise has placed a bid yet!');
      return;
    }
    window.auctionStore.hammerSold();
  });

  btnAdminUnsold.addEventListener('click', () => window.auctionStore.hammerUnsold());
  btnAdminUndo.addEventListener('click', () => window.auctionStore.undoLastBid());

  function startCountdown() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      const live = window.auctionStore.state.live;
      if (live.timerRunning && live.timerSeconds > 0) {
        live.timerSeconds--;
        if (live.timerSeconds <= 5 && live.timerSeconds > 0) {
          if (window.auctionAudio) window.auctionAudio.playWarningTick();
        }
        window.auctionStore.broadcast();
      } else {
        clearInterval(timerInterval);
      }
    }, 1000);
  }

  // ============================================================
  // 🛡️ FRANCHISE TABLE BIDDING PADDLE
  // ============================================================
  const btnTeamRaisePaddle = document.getElementById('btnTeamRaisePaddle');
  const paddleActionText = document.getElementById('paddleActionText');
  const antiBankruptcyNotice = document.getElementById('antiBankruptcyNotice');

  btnTeamRaisePaddle.addEventListener('click', () => {
    if (!activeLoggedInTeamId) {
      alert('Please log in with your team credentials first!');
      return;
    }
    const currentBid = window.auctionStore.state.live.currentBidCr;
    const inc = (window.TOURNAMENT_CONFIG ? window.TOURNAMENT_CONFIG.getIncrement(currentBid) : 0.20);
    const newBid = parseFloat((currentBid + inc).toFixed(2));

    const res = window.auctionStore.placeBid(activeLoggedInTeamId, newBid);
    if (!res.success) {
      alert(`⚠️ ${res.reason}`);
    }
  });

  document.querySelectorAll('.team-inc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!activeLoggedInTeamId) return;
      const step = parseFloat(btn.dataset.step);
      const currentBid = window.auctionStore.state.live.currentBidCr;
      const newBid = parseFloat((currentBid + step).toFixed(2));
      const res = window.auctionStore.placeBid(activeLoggedInTeamId, newBid);
      if (!res.success) alert(`⚠️ ${res.reason}`);
    });
  });

  // ============================================================
  // 🌟 LIVE INSTAGRAM "SOLD" POP-UP MODAL
  // ============================================================
  const soldPopupModal = document.getElementById('soldPopupModal');
  const soldPopupImg = document.getElementById('soldPopupImg');
  const soldPopupName = document.getElementById('soldPopupName');
  const soldPopupTeamBadge = document.getElementById('soldPopupTeamBadge');
  const soldPopupPrice = document.getElementById('soldPopupPrice');
  const btnDownloadPopupPost = document.getElementById('btnDownloadPopupPost');
  const btnClosePopupModal = document.getElementById('btnClosePopupModal');

  btnClosePopupModal.addEventListener('click', () => {
    soldPopupModal.classList.remove('active');
  });

  btnDownloadPopupPost.addEventListener('click', async () => {
    const details = window.auctionStore.state.live.soldDetails;
    if (details) {
      const canvas = await window.auctionPoster.generateSoldPoster(
        details.player,
        details.team,
        details.finalPriceCr
      );
      window.auctionPoster.downloadPoster(canvas, `${details.player.name.replace(/\s+/g, '_')}_SOLD.png`);
    }
  });

  // Confetti Particle System
  const confettiCanvas = document.getElementById('confettiCanvas');
  const confettiCtx = confettiCanvas.getContext('2d');
  let confettiParticles = [];
  let confettiAnimId = null;

  function resizeConfetti() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeConfetti);
  resizeConfetti();

  function triggerConfetti() {
    confettiParticles = [];
    const colors = ['#D4AF37', '#F59E0B', '#38BDF8', '#FFFFFF', '#10B981'];
    for (let i = 0; i < 180; i++) {
      confettiParticles.push({
        x: Math.random() * confettiCanvas.width,
        y: Math.random() * -confettiCanvas.height,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        velX: (Math.random() - 0.5) * 4,
        velY: Math.random() * 4 + 3,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10
      });
    }

    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
    animateConfetti();
  }

  function animateConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let alive = false;
    confettiParticles.forEach(p => {
      p.x += p.velX;
      p.y += p.velY;
      p.rot += p.rotSpeed;
      if (p.y < confettiCanvas.height) alive = true;

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rot * Math.PI) / 180);
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      confettiCtx.restore();
    });

    if (alive) {
      confettiAnimId = requestAnimationFrame(animateConfetti);
    } else {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  // ============================================================
  // REACTIVE STATE SUBSCRIBER
  // ============================================================
  let lastSoldId = null;

  window.auctionStore.subscribe((state) => {
    renderAdminCockpit(state);
    renderTeamWarroom(state);
    renderBroadcast(state);

    // Sold Modal
    if (state.live.hammerStatus === 'SOLD' && state.live.soldDetails) {
      const details = state.live.soldDetails;
      if (lastSoldId !== details.player.id + '_' + details.finalPriceCr) {
        lastSoldId = details.player.id + '_' + details.finalPriceCr;

        soldPopupImg.src = details.player.photoUrl;
        soldPopupName.textContent = details.player.name.toUpperCase();
        soldPopupTeamBadge.textContent = `PURCHASED BY ${details.team.name.toUpperCase()}`;
        soldPopupTeamBadge.style.color = details.team.primaryColor;
        soldPopupPrice.textContent = details.finalPriceCr >= 1
          ? `₹ ${details.finalPriceCr.toFixed(2)} CRORE`
          : `₹ ${(details.finalPriceCr * 100).toFixed(0)} LAKH`;

        soldPopupModal.classList.add('active');
        triggerConfetti();
      }
    } else if (state.live.hammerStatus !== 'SOLD') {
      soldPopupModal.classList.remove('active');
    }
  });

  // Render Admin Cockpit
  function renderAdminCockpit(state) {
    // 1. Teams & Credentials Grid
    adminTeamsCount.textContent = state.teams.length;
    adminTeamsGrid.innerHTML = '';
    if (state.teams.length === 0) {
      adminTeamsGrid.innerHTML = `
        <div class="empty-state-box" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🛡️</div>
          <strong>No franchise teams created yet</strong>
          <p style="font-size:0.8rem; margin-top:4px;">Click "+ Create New Team" to add franchises, assign captains, and generate login passwords.</p>
        </div>
      `;
    } else {
      state.teams.forEach(team => {
        const card = document.createElement('div');
        card.className = 'team-credential-card';
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:1.4rem;">${team.logoEmoji || '🏏'}</span>
              <div>
                <strong style="color:#FFF; font-size:1.05rem;">${team.name}</strong>
                <span style="background:${team.primaryColor}; color:${team.textColor || '#FFF'}; padding:2px 6px; border-radius:4px; font-size:0.7rem; font-weight:800; margin-left:6px;">${team.shortCode}</span>
              </div>
            </div>
            <button class="icon-btn btn-delete-team" data-id="${team.id}" style="color:var(--accent-crimson); border-color:rgba(239,68,68,0.3); padding:4px 8px; font-size:0.75rem;">Delete</button>
          </div>

          <div style="margin:10px 0; font-size:0.8rem; color:var(--text-secondary);">
            <div>👑 Captain: <strong style="color:#FFF;">${team.captainName || 'None'}</strong> ${team.captainPriceCr ? `(₹${team.captainPriceCr} Cr)` : ''}</div>
            <div>⭐ Vice-Captain: <strong style="color:#FFF;">${team.viceCaptainName || 'None'}</strong> ${team.viceCaptainPriceCr ? `(₹${team.viceCaptainPriceCr} Cr)` : ''}</div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); padding:8px; border-radius:8px; margin-bottom:10px;">
            <span style="font-size:0.75rem; color:var(--text-muted);">Purse Available:</span>
            <span style="font-weight:900; color:var(--accent-emerald);">₹ ${team.purseLeftCr.toFixed(2)} Cr / ₹ ${team.totalPurseCr} Cr</span>
          </div>

          <div style="border-top:1px dashed var(--border-subtle); padding-top:10px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase;">Table Credentials:</div>
              <div style="display:flex; gap:6px; margin-top:4px;">
                <span class="credential-chip">${team.teamLoginId}</span>
                <span class="credential-chip">${team.teamPassword}</span>
              </div>
            </div>
            <button class="btn-copy-cred" data-cred="Team: ${team.name}\nLogin ID: ${team.teamLoginId}\nPassword: ${team.teamPassword}">📋 Copy</button>
          </div>
        `;
        adminTeamsGrid.appendChild(card);
      });

      document.querySelectorAll('.btn-delete-team').forEach(b => {
        b.onclick = () => {
          if (confirm('Delete this team?')) window.auctionStore.deleteTeam(b.dataset.id);
        };
      });

      document.querySelectorAll('.btn-copy-cred').forEach(b => {
        b.onclick = () => {
          navigator.clipboard.writeText(b.dataset.cred);
          b.textContent = 'Copied! ✅';
          setTimeout(() => { b.textContent = '📋 Copy'; }, 2000);
        };
      });
    }

    // 2. Tiers
    tierListContainer.innerHTML = '';
    state.tiers.forEach(tier => {
      const div = document.createElement('div');
      div.className = 'tier-item-row';
      div.innerHTML = `
        <div>
          <div class="tier-info-title">${tier.name}</div>
          <div class="tier-price-tag">Default Base: ₹${tier.defaultBasePriceCr.toFixed(2)} Cr</div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <input type="number" step="0.1" value="${tier.defaultBasePriceCr}" style="width:70px;" class="form-input" data-tier-id="${tier.id}">
          <button class="icon-btn btn-save-tier" data-tier-id="${tier.id}">Save</button>
        </div>
      `;
      tierListContainer.appendChild(div);
    });

    document.querySelectorAll('.btn-save-tier').forEach(b => {
      b.onclick = () => {
        const tid = b.dataset.tierId;
        const input = document.querySelector(`input[data-tier-id="${tid}"]`);
        if (input) {
          window.auctionStore.updateTierPrice(tid, input.value);
          alert('Tier price updated!');
        }
      };
    });

    // 3. Pending Players
    const pending = state.players.filter(p => p.status === 'PENDING');
    pendingCountBadge.textContent = pending.length;
    pendingPlayersList.innerHTML = '';
    if (pending.length === 0) {
      pendingPlayersList.innerHTML = '<div style="color:var(--text-muted); font-size:0.8rem;">No pending player applications.</div>';
    } else {
      pending.forEach(p => {
        const item = document.createElement('div');
        item.style.cssText = 'background:rgba(0,0,0,0.5); padding:10px; border-radius:10px; display:flex; justify-content:space-between; align-items:center;';
        item.innerHTML = `
          <div>
            <strong style="color:#FFF;">${p.name}</strong> (${p.role})
            <div style="font-size:0.75rem; color:var(--text-secondary);">${p.country} • Runs: ${p.runs} | Wkts: ${p.wickets}</div>
          </div>
          <div style="display:flex; gap:6px;">
            <select class="form-select" id="selTier_${p.id}" style="padding:4px 8px; font-size:0.75rem;">
              ${state.tiers.map(t => `<option value="${t.id}">${t.name} (₹${t.defaultBasePriceCr}Cr)</option>`).join('')}
            </select>
            <button class="icon-btn btn-approve-p" data-id="${p.id}" style="background:var(--accent-emerald); border:none; padding:4px 10px; font-size:0.75rem;">Approve</button>
            <button class="icon-btn btn-reject-p" data-id="${p.id}" style="background:var(--accent-crimson); border:none; padding:4px 8px; font-size:0.75rem;">X</button>
          </div>
        `;
        pendingPlayersList.appendChild(item);
      });

      document.querySelectorAll('.btn-approve-p').forEach(b => {
        b.onclick = () => {
          const pid = b.dataset.id;
          const sel = document.getElementById(`selTier_${pid}`);
          const tier = state.tiers.find(t => t.id === sel.value);
          window.auctionStore.approvePlayer(pid, tier.id, tier.defaultBasePriceCr, state.players.length);
        };
      });

      document.querySelectorAll('.btn-reject-p').forEach(b => {
        b.onclick = () => window.auctionStore.rejectPlayer(b.dataset.id);
      });
    }

    // 4. Active Caller Details
    const active = window.auctionStore.getActivePlayer();
    if (active) {
      document.getElementById('adminCallerImg').src = active.photoUrl;
      document.getElementById('adminCallerName').textContent = active.name.toUpperCase();
      const tierObj = window.auctionStore.getTier(active.tierId);
      document.getElementById('adminCallerSet').textContent = tierObj ? tierObj.name.toUpperCase() : 'AUCTION POOL';
      document.getElementById('adminCallerMeta').textContent = `${active.role} • Base: ₹${active.basePriceCr.toFixed(2)} Cr`;
      const leadTeam = window.auctionStore.getTeam(state.live.currentBidderId);
      document.getElementById('adminCallerLeadTeam').textContent = leadTeam ? leadTeam.name : 'None yet';
      document.getElementById('adminCallerCurrentBid').textContent = `₹ ${state.live.currentBidCr.toFixed(2)} Cr`;
    } else {
      document.getElementById('adminCallerImg').src = window.DEFAULT_CRICKET_AVATAR;
      document.getElementById('adminCallerName').textContent = 'NO ACTIVE PLAYER';
      document.getElementById('adminCallerSet').textContent = 'AUCTION STAGE';
      document.getElementById('adminCallerMeta').textContent = 'Call a player from the queue to start bidding.';
      document.getElementById('adminCallerLeadTeam').textContent = 'None';
      document.getElementById('adminCallerCurrentBid').textContent = '₹ 0.00 Cr';
    }
    document.getElementById('adminTimerNumber').textContent = `${state.live.timerSeconds}s`;

    // 5. Admin Team Paddles Grid
    const adminPaddlesGrid = document.getElementById('adminTeamPaddlesGrid');
    adminPaddlesGrid.innerHTML = '';
    state.teams.forEach(team => {
      const btn = document.createElement('button');
      btn.className = 'icon-btn';
      btn.style.cssText = `background:${team.primaryColor}; color:${team.textColor || '#FFF'}; justify-content:center; font-weight:800; border:none; padding:10px;`;
      btn.innerHTML = `${team.shortCode} <span style="font-size:0.75rem; opacity:0.85;">(₹${team.purseLeftCr.toFixed(1)}Cr)</span>`;
      btn.onclick = () => {
        const curr = state.live.currentBidCr;
        const inc = (window.TOURNAMENT_CONFIG ? window.TOURNAMENT_CONFIG.getIncrement(curr) : 0.20);
        const nextBid = parseFloat((curr + inc).toFixed(2));
        const res = window.auctionStore.placeBid(team.id, nextBid);
        if (!res.success) alert(res.reason);
      };
      adminPaddlesGrid.appendChild(btn);
    });

    // 6. Sequence Queue Table
    sequenceTableBody.innerHTML = '';
    const sequenced = [...state.players].sort((a, b) => (a.auctionSequence || 999) - (b.auctionSequence || 999));
    if (sequenced.length === 0) {
      sequenceTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-muted);">No approved players in sequence. Share the registration link to register players!</td></tr>';
    } else {
      sequenced.forEach((p, idx) => {
        const tr = document.createElement('tr');
        const tier = window.auctionStore.getTier(p.tierId);
        const isCurrent = p.id === state.live.activePlayerId;
        tr.style.backgroundColor = isCurrent ? 'rgba(212, 175, 55, 0.15)' : 'transparent';
        tr.innerHTML = `
          <td><strong>#${idx + 1}</strong></td>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <img src="${p.photoUrl}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">
              <strong>${p.name}</strong>
            </div>
          </td>
          <td>${p.role}</td>
          <td>${tier ? tier.name : 'Unassigned'}</td>
          <td>₹ ${p.basePriceCr ? p.basePriceCr.toFixed(2) : '0.20'} Cr</td>
          <td><span style="font-size:0.75rem; font-weight:700; color:${p.status === 'SOLD' ? '#10B981' : p.status === 'IN_AUCTION' ? '#D4AF37' : '#94A3B8'};">${p.status}</span></td>
          <td>
            <button class="icon-btn btn-call-stage" data-id="${p.id}" style="padding:4px 8px; font-size:0.75rem;">
              ${isCurrent ? 'Current' : 'Call 🎙️'}
            </button>
            <button class="icon-btn btn-del-player" data-id="${p.id}" style="padding:4px 8px; font-size:0.75rem; color:var(--accent-crimson);">X</button>
          </td>
        `;
        sequenceTableBody.appendChild(tr);
      });

      document.querySelectorAll('.btn-call-stage').forEach(b => {
        b.onclick = () => window.auctionStore.callPlayerToStage(b.dataset.id);
      });
      document.querySelectorAll('.btn-del-player').forEach(b => {
        b.onclick = () => {
          if (confirm('Remove player from tournament?')) window.auctionStore.deletePlayer(b.dataset.id);
        };
      });
    }
  }

  // Render Team War-Room
  function renderTeamWarroom(state) {
    if (!activeLoggedInTeamId) return;
    const team = window.auctionStore.getTeam(activeLoggedInTeamId);
    if (!team) return;

    const activePlayer = window.auctionStore.getActivePlayer();
    if (activePlayer) {
      document.getElementById('teamViewPlayerName').textContent = activePlayer.name.toUpperCase();
      document.getElementById('teamViewPlayerRole').textContent = `${activePlayer.role} • Base ₹${activePlayer.basePriceCr.toFixed(2)} Cr`;
    } else {
      document.getElementById('teamViewPlayerName').textContent = 'NO ACTIVE PLAYER';
      document.getElementById('teamViewPlayerRole').textContent = 'Awaiting next call from auctioneer';
    }

    document.getElementById('teamViewCurrentBid').textContent = `₹ ${state.live.currentBidCr.toFixed(2)} CR`;
    const leadTeam = window.auctionStore.getTeam(state.live.currentBidderId);
    document.getElementById('teamViewLeaderTag').textContent = leadTeam ? `Held by: ${leadTeam.name}` : 'No Bids Placed';

    const inc = (window.TOURNAMENT_CONFIG ? window.TOURNAMENT_CONFIG.getIncrement(state.live.currentBidCr) : 0.20);
    const nextBid = parseFloat((state.live.currentBidCr + inc).toFixed(2));
    paddleActionText.textContent = `BID ₹ ${nextBid.toFixed(2)} CR`;

    const minSlotsLeft = Math.max(0, 18 - (team.squad.length + 1));
    const reservedPurse = minSlotsLeft * 0.20;
    const maxAllowedBid = team.purseLeftCr - reservedPurse;

    const cannotAfford = nextBid > maxAllowedBid;
    const isCurrentlyWinning = state.live.currentBidderId === team.id;
    const noPlayer = !activePlayer;

    if (noPlayer) {
      btnTeamRaisePaddle.disabled = true;
      antiBankruptcyNotice.style.display = 'none';
    } else if (cannotAfford) {
      btnTeamRaisePaddle.disabled = true;
      antiBankruptcyNotice.style.display = 'block';
      antiBankruptcyNotice.textContent = `⚠️ Cannot bid ₹${nextBid.toFixed(2)} Cr: Must reserve ₹${reservedPurse.toFixed(2)} Cr for ${minSlotsLeft} required squad slots.`;
    } else if (isCurrentlyWinning) {
      btnTeamRaisePaddle.disabled = true;
      antiBankruptcyNotice.style.display = 'block';
      antiBankruptcyNotice.textContent = `✅ Your franchise currently holds the highest bid!`;
      antiBankruptcyNotice.style.background = 'rgba(16, 185, 129, 0.15)';
      antiBankruptcyNotice.style.borderColor = 'rgba(16, 185, 129, 0.4)';
      antiBankruptcyNotice.style.color = '#10B981';
    } else {
      btnTeamRaisePaddle.disabled = false;
      antiBankruptcyNotice.style.display = 'none';
    }

    // Dashboard
    document.getElementById('teamDashboardTitle').textContent = `${team.name} Dashboard`;
    document.getElementById('teamPurseLeftText').textContent = `₹ ${team.purseLeftCr.toFixed(2)} Cr`;
    const pursePct = Math.max(0, Math.min(100, (team.purseLeftCr / team.totalPurseCr) * 100));
    document.getElementById('teamPurseProgressBar').style.width = `${pursePct}%`;
    document.getElementById('teamSquadCount').textContent = `${team.squad.length} / 25`;
    document.getElementById('teamOverseasCount').textContent = `${team.overseasCount || 0} / 8`;

    const acquiredList = document.getElementById('teamAcquiredRoster');
    acquiredList.innerHTML = '';
    document.getElementById('teamAcquiredCount').textContent = team.squad.length;
    if (team.squad.length === 0) {
      acquiredList.innerHTML = '<div style="color:var(--text-muted); font-size:0.8rem;">No players acquired yet.</div>';
    } else {
      team.squad.forEach(sq => {
        const d = document.createElement('div');
        d.style.cssText = 'background:rgba(255,255,255,0.04); padding:8px 12px; border-radius:8px; display:flex; justify-content:space-between; font-size:0.85rem; border:1px solid var(--border-subtle);';
        d.innerHTML = `<span><strong>${sq.name}</strong> (${sq.role})</span><span style="color:var(--gold-bright); font-weight:800;">₹ ${sq.priceCr.toFixed(2)} Cr</span>`;
        acquiredList.appendChild(d);
      });
    }
  }

  // Render TV Broadcast
  function renderBroadcast(state) {
    const active = window.auctionStore.getActivePlayer();
    if (active) {
      document.getElementById('bcPlayerImg').src = active.photoUrl;
      document.getElementById('bcPlayerName').textContent = active.name.toUpperCase();
      document.getElementById('bcPlayerRole').textContent = `🏏 ${active.role.toUpperCase()} • ${active.country.toUpperCase()}`;
      document.getElementById('bcStatMatches').textContent = active.matches;
      document.getElementById('bcStatRuns').textContent = active.runs;
      document.getElementById('bcStatSR').textContent = active.strikeRate || '0.0';
      document.getElementById('bcBasePriceBadge').textContent = `BASE PRICE: ₹ ${active.basePriceCr.toFixed(2)} CR`;

      const tierObj = window.auctionStore.getTier(active.tierId);
      document.getElementById('bcSetTitle').textContent = tierObj ? tierObj.name.toUpperCase() : 'AUCTION POOL';
    } else {
      document.getElementById('bcPlayerImg').src = window.DEFAULT_CRICKET_AVATAR;
      document.getElementById('bcPlayerName').textContent = 'STAGE AWAITING CALL';
      document.getElementById('bcPlayerRole').textContent = 'AUCTION IN PROGRESS';
      document.getElementById('bcStatMatches').textContent = '0';
      document.getElementById('bcStatRuns').textContent = '0';
      document.getElementById('bcStatSR').textContent = '0.0';
      document.getElementById('bcBasePriceBadge').textContent = 'BASE PRICE: ₹ 0.00 CR';
      document.getElementById('bcSetTitle').textContent = 'AUCTION ARENA';
    }

    document.getElementById('bcCurrentBid').textContent = `₹ ${state.live.currentBidCr.toFixed(2)} CR`;
    const leadTeam = window.auctionStore.getTeam(state.live.currentBidderId);
    const leaderBadge = document.getElementById('bcLeaderBadge');
    if (leadTeam) {
      leaderBadge.textContent = `${leadTeam.logoEmoji || '🏆'} ${leadTeam.name.toUpperCase()}`;
      leaderBadge.style.background = leadTeam.primaryColor;
      leaderBadge.style.color = leadTeam.textColor || '#FFFFFF';
    } else {
      leaderBadge.textContent = 'NO BIDS YET';
      leaderBadge.style.background = '#1E293B';
      leaderBadge.style.color = '#FFFFFF';
    }

    // Timer
    const timerBox = document.getElementById('bcTimerBox');
    const timerNum = document.getElementById('bcTimerNumber');
    const sec = state.live.timerSeconds;
    timerNum.textContent = `00:${sec < 10 ? '0' + sec : sec}`;
    timerBox.classList.toggle('timer-critical', sec <= 5 && state.live.timerRunning);

    // Hammer Banner
    const hammerBanner = document.getElementById('bcHammerBanner');
    if (state.live.hammerStatus === 'GOING_ONCE') {
      hammerBanner.style.display = 'block';
      hammerBanner.className = 'hammer-banner hammer-going-once';
      hammerBanner.textContent = '⚠️ GOING ONCE...';
    } else if (state.live.hammerStatus === 'GOING_TWICE') {
      hammerBanner.style.display = 'block';
      hammerBanner.className = 'hammer-banner hammer-going-twice';
      hammerBanner.textContent = '🚨 GOING TWICE... FINAL CALL!';
    } else {
      hammerBanner.style.display = 'none';
    }

    // Bidding History Ladder
    const ladderList = document.getElementById('bcBidLadderList');
    ladderList.innerHTML = '';
    if (state.live.bidHistory.length === 0) {
      ladderList.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem; padding:8px;">Awaiting opening bid from franchise tables...</div>';
    } else {
      state.live.bidHistory.slice(0, 5).forEach((bid) => {
        const item = document.createElement('div');
        item.className = 'ladder-item';
        item.innerHTML = `
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${bid.color};"></span>
            <span>${bid.teamName}</span>
          </div>
          <span style="color:var(--gold-bright); font-weight:800;">₹ ${bid.amountCr.toFixed(2)} Cr</span>
        `;
        ladderList.appendChild(item);
      });
    }

    // Bottom Ticker
    const tickerTrack = document.getElementById('bcTickerTrack');
    tickerTrack.innerHTML = '';
    if (state.teams.length === 0) {
      tickerTrack.innerHTML = '<div class="ticker-item">Awaiting franchise team registration...</div>';
    } else {
      state.teams.forEach(t => {
        const item = document.createElement('div');
        item.className = 'ticker-item';
        item.innerHTML = `
          <span style="color:${t.primaryColor}; font-weight:800;">[${t.shortCode}]</span>
          Purse: ₹${t.purseLeftCr.toFixed(1)} Cr (${t.squad.length}/25)
        `;
        tickerTrack.appendChild(item);
      });
    }
  }

  // Render Studio Poster Canvas
  async function renderStudioPoster() {
    const canvas = document.getElementById('studioPosterCanvas');
    const player = window.auctionStore.getActivePlayer() || window.auctionStore.state.players[0] || {
      name: "CHAMPION PLAYER",
      role: "All-Rounder",
      country: "INDIA",
      photoUrl: window.DEFAULT_CRICKET_AVATAR
    };
    const team = window.auctionStore.getTeam(window.auctionStore.state.live.currentBidderId) || window.auctionStore.state.teams[0] || {
      name: "PREMIER CHAMPIONS",
      primaryColor: "#D4AF37",
      logoEmoji: "🏆"
    };
    const price = window.auctionStore.state.live.currentBidCr || 12.5;

    const rendered = await window.auctionPoster.generateSoldPoster(player, team, price);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(rendered, 0, 0, canvas.width, canvas.height);
  }

  document.getElementById('btnDownloadStudioPoster').addEventListener('click', async () => {
    const player = window.auctionStore.getActivePlayer() || window.auctionStore.state.players[0] || {
      name: "CHAMPION_PLAYER",
      role: "All-Rounder",
      photoUrl: window.DEFAULT_CRICKET_AVATAR
    };
    const team = window.auctionStore.getTeam(window.auctionStore.state.live.currentBidderId) || window.auctionStore.state.teams[0] || {
      name: "CHAMPIONS",
      primaryColor: "#D4AF37"
    };
    const price = window.auctionStore.state.live.currentBidCr || 12.5;
    const canvas = await window.auctionPoster.generateSoldPoster(player, team, price);
    window.auctionPoster.downloadPoster(canvas, `${player.name.replace(/\s+/g, '_')}_SOLD.png`);
  });

  // ============================================================
  // 📊 EXCEL / CSV & PRINTABLE REPORT GENERATOR
  // ============================================================
  function downloadCSV(csvContent, filename) {
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // 1. Team Export Squad to Excel
  const btnExportTeamExcel = document.getElementById('btnExportTeamExcel');
  if (btnExportTeamExcel) {
    btnExportTeamExcel.addEventListener('click', () => {
      if (!activeLoggedInTeamId) {
        alert('Please log in with your franchise credentials first!');
        return;
      }
      const team = window.auctionStore.getTeam(activeLoggedInTeamId);
      if (!team) return;

      if (team.squad.length === 0) {
        alert('No players acquired yet by your franchise!');
        return;
      }

      let csv = "Player Name,Role,CricHeroes Profile,Phone / WhatsApp,Runs,Wickets,Strike Rate,Batting Style,Bowling Style,Price (Cr),Status\n";
      team.squad.forEach(sq => {
        const p = window.auctionStore.state.players.find(x => x.id === sq.playerId);
        const chName = (p && p.cricHeroesName) || sq.cricHeroesName || "N/A";
        const chPhone = (p && p.cricHeroesPhone) || sq.cricHeroesPhone || "N/A";
        const runs = (p && p.runs) || sq.runs || 0;
        const wkts = (p && p.wickets) || sq.wickets || 0;
        const sr = (p && p.strikeRate) || sq.strikeRate || 0;
        const bat = (p && p.battingStyle) || sq.battingStyle || "N/A";
        const bowl = (p && p.bowlingStyle) || sq.bowlingStyle || "N/A";

        csv += `"${sq.name}","${sq.role}","${chName}","${chPhone}","${runs}","${wkts}","${sr}","${bat}","${bowl}","₹ ${sq.priceCr} Cr","Acquired"\n`;
      });

      downloadCSV(csv, `${team.name.replace(/\s+/g, '_')}_Squad_Roster.csv`);
    });
  }

  // 2. Admin Export Full Tournament Excel
  const btnExportAdminExcel = document.getElementById('btnExportAdminExcel');
  if (btnExportAdminExcel) {
    btnExportAdminExcel.addEventListener('click', () => {
      const state = window.auctionStore.state;
      let csv = "--- TOURNAMENT FRANCHISE SUMMARY ---\n";
      csv += "Team Name,Short Code,Captain,Vice-Captain,Total Purse (Cr),Purse Spent (Cr),Purse Remaining (Cr),Squad Count,Overseas Count,Table Login ID\n";
      state.teams.forEach(t => {
        const spent = (t.totalPurseCr - t.purseLeftCr).toFixed(2);
        csv += `"${t.name}","${t.shortCode}","${t.captainName || 'None'}","${t.viceCaptainName || 'None'}","₹ ${t.totalPurseCr} Cr","₹ ${spent} Cr","₹ ${t.purseLeftCr.toFixed(2)} Cr","${t.squad.length}","${t.overseasCount || 0}","${t.teamLoginId}"\n`;
      });

      csv += "\n--- ALL SOLD PLAYERS ---\n";
      csv += "Player Name,Sold To Franchise,Sold Price (Cr),Base Price (Cr),Role,CricHeroes Profile,Phone / WhatsApp,Country,Runs,Wickets,Strike Rate\n";
      const sold = state.players.filter(p => p.status === 'SOLD');
      sold.forEach(p => {
        const tm = window.auctionStore.getTeam(p.soldToTeam);
        csv += `"${p.name}","${tm ? tm.name : 'Unknown'}","₹ ${p.soldPriceCr} Cr","₹ ${p.basePriceCr} Cr","${p.role}","${p.cricHeroesName || 'N/A'}","${p.cricHeroesPhone || 'N/A'}","${p.country}","${p.runs}","${p.wickets}","${p.strikeRate}"\n`;
      });

      csv += "\n--- ALL UNSOLD PLAYERS ---\n";
      csv += "Player Name,Base Price (Cr),Role,CricHeroes Profile,Phone / WhatsApp,Country,Runs,Wickets\n";
      const unsold = state.players.filter(p => p.status === 'UNSOLD');
      unsold.forEach(p => {
        csv += `"${p.name}","₹ ${p.basePriceCr} Cr","${p.role}","${p.cricHeroesName || 'N/A'}","${p.cricHeroesPhone || 'N/A'}","${p.country}","${p.runs}","${p.wickets}"\n`;
      });

      csv += "\n--- ALL REGISTERED PLAYERS IN TOURNAMENT ---\n";
      csv += "Player Name,Auction Status,Assigned Tier,Base Price (Cr),Role,CricHeroes Profile,Phone / WhatsApp,Country,Runs,Wickets,Strike Rate\n";
      state.players.forEach(p => {
        const tier = window.auctionStore.getTier(p.tierId);
        csv += `"${p.name}","${p.status}","${tier ? tier.name : 'Unassigned'}","₹ ${p.basePriceCr || 0.20} Cr","${p.role}","${p.cricHeroesName || 'N/A'}","${p.cricHeroesPhone || 'N/A'}","${p.country}","${p.runs}","${p.wickets}","${p.strikeRate}"\n`;
      });

      downloadCSV(csv, "Cricket_Mega_Auction_Full_Tournament_Report.csv");
    });
  }

  // 3. Admin Print / Save PDF Summary Report
  const btnPrintAdminReport = document.getElementById('btnPrintAdminReport');
  if (btnPrintAdminReport) {
    btnPrintAdminReport.addEventListener('click', () => {
      const state = window.auctionStore.state;
      const printWin = window.open('', '_blank', 'width=1000,height=800');
      if (!printWin) {
        alert('Please allow popups to open the printable report.');
        return;
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Tournament Auction Financial & Squad Report</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #0F172A; }
            h1 { font-size: 24px; margin-bottom: 4px; color: #0F172A; }
            h2 { font-size: 16px; margin: 24px 0 10px 0; color: #1E293B; border-bottom: 2px solid #E2E8F0; padding-bottom: 6px; }
            .meta { color: #64748B; margin-bottom: 24px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px; }
            th, td { border: 1px solid #CBD5E1; padding: 8px 10px; text-align: left; }
            th { background: #F1F5F9; font-weight: 700; color: #334155; }
            .price { color: #059669; font-weight: 800; }
            .badge-sold { color: #059669; font-weight: 800; }
            .badge-unsold { color: #DC2626; font-weight: 800; }
            @media print {
              body { padding: 10px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>🏆 Premier Cricket Mega Auction 2026</h1>
          <div class="meta">Official Tournament Financial & Squad Report • Exported: ${new Date().toLocaleString()}</div>

          <h2>1. Franchise Teams & Purse Balances</h2>
          <table>
            <thead>
              <tr>
                <th>Franchise</th>
                <th>Captain</th>
                <th>Vice-Captain</th>
                <th>Total Budget</th>
                <th>Purse Spent</th>
                <th>Remaining Purse</th>
                <th>Squad Count</th>
              </tr>
            </thead>
            <tbody>
              ${state.teams.map(t => `
                <tr>
                  <td><strong>${t.name}</strong> (${t.shortCode})</td>
                  <td>${t.captainName || 'None'}</td>
                  <td>${t.viceCaptainName || 'None'}</td>
                  <td>₹ ${t.totalPurseCr} Cr</td>
                  <td>₹ ${(t.totalPurseCr - t.purseLeftCr).toFixed(2)} Cr</td>
                  <td class="price">₹ ${t.purseLeftCr.toFixed(2)} Cr</td>
                  <td>${t.squad.length} / 25</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>2. Sold Players Summary (${state.players.filter(p => p.status === 'SOLD').length})</h2>
          <table>
            <thead>
              <tr>
                <th>Player Name</th>
                <th>Winning Franchise</th>
                <th>Final Price</th>
                <th>Role</th>
                <th>CricHeroes Profile</th>
                <th>Phone No</th>
              </tr>
            </thead>
            <tbody>
              ${state.players.filter(p => p.status === 'SOLD').map(p => {
                const tm = window.auctionStore.getTeam(p.soldToTeam);
                return `
                  <tr>
                    <td><strong>${p.name}</strong></td>
                    <td>${tm ? tm.name : 'Unknown'}</td>
                    <td class="price">₹ ${p.soldPriceCr} Cr</td>
                    <td>${p.role}</td>
                    <td>${p.cricHeroesName || 'N/A'}</td>
                    <td>${p.cricHeroesPhone || 'N/A'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <h2>3. Unsold Players Summary (${state.players.filter(p => p.status === 'UNSOLD').length})</h2>
          <table>
            <thead>
              <tr>
                <th>Player Name</th>
                <th>Base Price</th>
                <th>Role</th>
                <th>CricHeroes Profile</th>
                <th>Phone No</th>
              </tr>
            </thead>
            <tbody>
              ${state.players.filter(p => p.status === 'UNSOLD').map(p => `
                <tr>
                  <td><strong>${p.name}</strong></td>
                  <td>₹ ${p.basePriceCr} Cr</td>
                  <td>${p.role}</td>
                  <td>${p.cricHeroesName || 'N/A'}</td>
                  <td>${p.cricHeroesPhone || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      printWin.document.write(html);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        printWin.print();
      }, 350);
    });
  }

  // Initial Notify
  window.auctionStore.notify();
  updateCardPreview();
});

