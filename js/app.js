// app.js - Master Controller Wiring All Portals, Authentication, Dynamic Teams & Real-Time Sync
// Multi-Page Safe, Robust & Professional Tournament Operations Engine

// Toast Notification System (Replaces disruptive window.alert)
window.showToast = function(message, type = 'info', duration = 3000) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '!' : 'ℹ';
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-msg">${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, duration);
};

document.addEventListener('DOMContentLoaded', () => {
  // --- Global Elements ---
  const portalViews = document.querySelectorAll('.portal-view');
  const btnToggleSound = document.getElementById('btnToggleSound');
  const soundIcon = document.getElementById('soundIcon');
  const btnPopoutBroadcast = document.getElementById('btnPopoutBroadcast');
  const btnAdminCloudSettings = document.getElementById('btnAdminCloudSettings');
  const cloudModal = document.getElementById('cloudSettingsModal');
  const btnCloseCloudModal = document.getElementById('btnCloseCloudModal');
  const btnSaveCloudConfig = document.getElementById('btnSaveCloudConfig');
  const btnTestCloudConnection = document.getElementById('btnTestCloudConnection');
  const btnDisconnectCloud = document.getElementById('btnDisconnectCloud');
  const btnCopySqlSchema = document.getElementById('btnCopySqlSchema');
  const cloudStatusBadge = document.getElementById('cloudStatusBadge');
  const cloudFeedbackMsg = document.getElementById('cloudFeedbackMsg');
  const sqlSchemaDisplay = document.getElementById('sqlSchemaDisplay');

  // Lock Badges
  const adminLockBadge = document.getElementById('adminLockBadge');
  const teamLockBadge = document.getElementById('teamLockBadge');

  // Display SQL Schema in Cloud Modal
  if (sqlSchemaDisplay && window.SUPABASE_SQL_SCHEMA) {
    sqlSchemaDisplay.textContent = window.SUPABASE_SQL_SCHEMA.trim();
  }

  // --- Sound FX Toggle ---
  if (btnToggleSound) {
    btnToggleSound.addEventListener('click', () => {
      const isMuted = window.auctionAudio.toggleMute();
      if (soundIcon) soundIcon.textContent = isMuted ? '🔇' : '🔊';
      btnToggleSound.innerHTML = `<span id="soundIcon">${isMuted ? '🔇' : '🔊'}</span> Sound ${isMuted ? 'OFF' : 'ON'}`;
    });
  }

  // --- Pop-out Broadcast Window for OBS / Stadium Projector ---
  if (btnPopoutBroadcast) {
    btnPopoutBroadcast.addEventListener('click', () => {
      const url = window.location.pathname.includes('broadcast.html') 
        ? window.location.href 
        : window.location.href.replace(/[^/]*$/, 'broadcast.html');
      window.open(url, 'OBS_Cricket_Broadcast', 'width=1920,height=1080,menubar=no,toolbar=no');
    });
  }

  // --- Cloud Status Indicator Helper ---
  function updateCloudStatusUI() {
    const isConnected = window.auctionStore && window.auctionStore.isCloudSyncEnabled;
    if (cloudStatusBadge) {
      if (isConnected) {
        cloudStatusBadge.style.background = 'rgba(16, 185, 129, 0.12)';
        cloudStatusBadge.style.color = '#059669';
        cloudStatusBadge.style.borderColor = 'rgba(16, 185, 129, 0.35)';
        cloudStatusBadge.textContent = '● Cloud Connected (Supabase Active)';
      } else {
        cloudStatusBadge.style.background = '#F1F5F9';
        cloudStatusBadge.style.color = '#64748B';
        cloudStatusBadge.style.borderColor = '#CBD5E1';
        cloudStatusBadge.textContent = '○ Local Offline Sync';
      }
    }
  }

  window.addEventListener('cricket_cloud_status', () => {
    updateCloudStatusUI();
  });
  updateCloudStatusUI();

  // --- Master Admin Cloud Settings Modal ---
  if (btnAdminCloudSettings) {
    btnAdminCloudSettings.addEventListener('click', () => {
      const urlInput = document.getElementById('inputSupabaseUrl');
      const keyInput = document.getElementById('inputSupabaseKey');
      if (urlInput) urlInput.value = localStorage.getItem('cricket_supabase_url') || '';
      if (keyInput) keyInput.value = localStorage.getItem('cricket_supabase_key') || '';
      updateCloudStatusUI();
      if (cloudFeedbackMsg) cloudFeedbackMsg.style.display = 'none';
      if (cloudModal) cloudModal.classList.add('active');
    });
  }

  if (btnCloseCloudModal && cloudModal) {
    btnCloseCloudModal.addEventListener('click', () => {
      cloudModal.classList.remove('active');
    });
  }

  if (btnSaveCloudConfig) {
    btnSaveCloudConfig.addEventListener('click', async () => {
      const urlInput = document.getElementById('inputSupabaseUrl');
      const keyInput = document.getElementById('inputSupabaseKey');
      const url = urlInput ? urlInput.value.trim() : '';
      const key = keyInput ? keyInput.value.trim() : '';
      if (!url || !key) {
        window.showToast('Please enter both Supabase Project URL and Anon Key.', 'warning');
        return;
      }
      localStorage.setItem('cricket_supabase_url', url);
      localStorage.setItem('cricket_supabase_key', key);
      window.auctionStore.initSupabase();
      updateCloudStatusUI();

      if (cloudFeedbackMsg) {
        cloudFeedbackMsg.style.display = 'block';
        cloudFeedbackMsg.style.background = 'rgba(16, 185, 129, 0.12)';
        cloudFeedbackMsg.style.color = '#059669';
        cloudFeedbackMsg.style.border = '1px solid rgba(16, 185, 129, 0.35)';
        cloudFeedbackMsg.textContent = 'Configuration saved! Supabase Realtime is now syncing across all devices.';
      }
      window.showToast('Supabase credentials saved successfully.', 'success');
    });
  }

  if (btnTestCloudConnection) {
    btnTestCloudConnection.addEventListener('click', async () => {
      const urlInput = document.getElementById('inputSupabaseUrl');
      const keyInput = document.getElementById('inputSupabaseKey');
      const url = urlInput ? urlInput.value.trim() : '';
      const key = keyInput ? keyInput.value.trim() : '';
      btnTestCloudConnection.disabled = true;
      btnTestCloudConnection.textContent = 'Testing...';
      const result = await window.auctionStore.testSupabaseConnection(url, key);
      btnTestCloudConnection.disabled = false;
      btnTestCloudConnection.textContent = 'Test Connection';

      if (cloudFeedbackMsg) {
        cloudFeedbackMsg.style.display = 'block';
        if (result.success) {
          cloudFeedbackMsg.style.background = 'rgba(16, 185, 129, 0.12)';
          cloudFeedbackMsg.style.color = '#059669';
          cloudFeedbackMsg.style.border = '1px solid rgba(16, 185, 129, 0.35)';
          cloudFeedbackMsg.textContent = result.message;
          window.showToast('Supabase connection verified!', 'success');
        } else {
          cloudFeedbackMsg.style.background = 'rgba(239, 68, 68, 0.12)';
          cloudFeedbackMsg.style.color = '#DC2626';
          cloudFeedbackMsg.style.border = '1px solid rgba(239, 68, 68, 0.35)';
          cloudFeedbackMsg.textContent = result.message;
          window.showToast('Connection failed: ' + result.message, 'error');
        }
      }
    });
  }

  if (btnDisconnectCloud) {
    btnDisconnectCloud.addEventListener('click', () => {
      if (confirm('Disconnect Supabase and switch back to local offline mode?')) {
        window.auctionStore.disconnectSupabase();
        const urlInput = document.getElementById('inputSupabaseUrl');
        const keyInput = document.getElementById('inputSupabaseKey');
        if (urlInput) urlInput.value = '';
        if (keyInput) keyInput.value = '';
        updateCloudStatusUI();
        if (cloudFeedbackMsg) {
          cloudFeedbackMsg.style.display = 'block';
          cloudFeedbackMsg.style.background = '#F8FAFC';
          cloudFeedbackMsg.style.color = '#64748B';
          cloudFeedbackMsg.style.border = '1px solid #CBD5E1';
          cloudFeedbackMsg.textContent = 'Cloud disconnected. Operating in local mode.';
        }
        window.showToast('Switched to local offline mode.', 'info');
      }
    });
  }

  if (btnCopySqlSchema) {
    btnCopySqlSchema.addEventListener('click', () => {
      if (window.SUPABASE_SQL_SCHEMA) {
        navigator.clipboard.writeText(window.SUPABASE_SQL_SCHEMA.trim()).then(() => {
          btnCopySqlSchema.textContent = '✓ Copied to Clipboard';
          setTimeout(() => {
            btnCopySqlSchema.textContent = 'Copy SQL Schema';
          }, 2500);
          window.showToast('SQL Schema copied to clipboard!', 'success');
        });
      }
    });
  }

  // --- Dedicated Portal Routing & Navigation ---
  window.navigateToPortal = (portalId) => {
    // If dedicated HTML pages exist, redirect cleanly to them
    const pageMap = {
      'viewAdmin': 'admin.html',
      'viewTeamWarroom': 'team.html',
      'viewBroadcast': 'broadcast.html',
      'viewRegistration': 'register.html',
      'viewPosterStudio': 'studio.html',
      'viewHub': 'index.html'
    };

    // If current file is not index.html, navigate to that page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (pageMap[portalId] && pageMap[portalId] !== currentPage) {
      window.location.href = pageMap[portalId];
      return;
    }

    // In single-page mode (index.html with all views), switch view
    window.switchPortal(portalId);
  };

  window.switchPortal = (portalId) => {
    if (portalViews.length === 0) return;

    if (portalId !== 'viewAdmin' && typeof cancelAutoAdvance === 'function') {
      cancelAutoAdvance();
    }

    portalViews.forEach(view => {
      view.classList.toggle('active', view.id === portalId);
    });

    const hashMap = {
      'viewHub': 'hub',
      'viewRegistration': 'register',
      'viewAdmin': 'admin',
      'viewTeamWarroom': 'team',
      'viewBroadcast': 'broadcast',
      'viewPosterStudio': 'studio'
    };
    if (hashMap[portalId]) {
      window.location.hash = '#/' + hashMap[portalId];
    }

    window.scrollTo({ top: 0, behavior: 'instant' });

    if (portalId === 'viewPosterStudio') {
      renderStudioPoster();
    }
  };

  window.logoutTeamOrExit = () => {
    if (activeLoggedInTeamId) {
      if (confirm('Disconnect from franchise table and exit?')) {
        activeLoggedInTeamId = null;
        sessionStorage.removeItem('cricket_active_team_id');
        checkTeamAuth();
        window.location.href = 'index.html';
      }
    } else {
      window.location.href = 'index.html';
    }
  };

  window.logoutAdminOrExit = () => {
    const isAuthed = sessionStorage.getItem('cricket_admin_auth') === 'true';
    if (isAuthed) {
      if (confirm('Log out from Administrator Cockpit and return to gateway?')) {
        sessionStorage.removeItem('cricket_admin_auth');
        checkAdminAuth();
        window.location.href = 'index.html';
      }
    } else {
      window.location.href = 'index.html';
    }
  };

  window.toggleGlobalSound = () => {
    const isMuted = window.auctionAudio.toggleMute();
    const text = isMuted ? 'Sound OFF' : 'Sound ON';
    const icon = isMuted ? '🔇' : '🔊';
    if (soundIcon) soundIcon.textContent = icon;
    if (btnToggleSound) btnToggleSound.innerHTML = `<span id="soundIcon">${icon}</span> ${text}`;
  };

  // Handle URL Hash routing on index.html
  function handleRouteFromHash() {
    const hash = window.location.hash.replace('#/', '').replace('#', '').toLowerCase();
    const isIndex = !window.location.pathname.split('/').pop() || window.location.pathname.endsWith('index.html');
    if (!isIndex) return;

    const redirectMap = {
      'admin': 'admin.html',
      'team': 'team.html',
      'warroom': 'team.html',
      'broadcast': 'broadcast.html',
      'live': 'broadcast.html',
      'obs': 'broadcast.html',
      'register': 'register.html',
      'player': 'register.html',
      'studio': 'studio.html'
    };

    if (redirectMap[hash]) {
      window.location.href = redirectMap[hash];
      return;
    }

    if (portalViews.length > 0) {
      window.switchPortal('viewHub');
    }
  }
  window.addEventListener('hashchange', handleRouteFromHash);

  // ============================================================
  // ADMIN AUTHENTICATION
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
    if (!adminLockScreen || !adminMainContent) return;
    const isAuthed = sessionStorage.getItem('cricket_admin_auth') === 'true';
    if (isAuthed) {
      adminLockScreen.style.display = 'none';
      adminMainContent.style.display = 'block';
      if (adminLockBadge) {
        adminLockBadge.textContent = '● ORGANIZER ACTIVE';
        adminLockBadge.className = 'portal-status-pill pill-admin';
      }
    } else {
      adminLockScreen.style.display = 'block';
      adminMainContent.style.display = 'none';
      if (adminLockBadge) {
        adminLockBadge.textContent = '○ LOCKED';
        adminLockBadge.className = 'portal-status-pill';
      }
    }
  }

  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const entered = inputAdminPassword ? inputAdminPassword.value.trim() : '';
      if (window.auctionStore.verifyAdminPassword(entered)) {
        sessionStorage.setItem('cricket_admin_auth', 'true');
        if (inputAdminPassword) inputAdminPassword.value = '';
        checkAdminAuth();
        window.auctionStore.notify();
        window.showToast('Administrator console unlocked.', 'success');
      } else {
        window.showToast('Invalid admin password. (Default: admin@2026)', 'error');
      }
    });
  }

  if (btnAdminLogout) {
    btnAdminLogout.addEventListener('click', () => {
      sessionStorage.removeItem('cricket_admin_auth');
      checkAdminAuth();
      window.showToast('Admin logged out.', 'info');
    });
  }

  if (btnChangeAdminPass && changePassModal) {
    btnChangeAdminPass.addEventListener('click', () => {
      changePassModal.classList.add('active');
    });
  }

  if (btnClosePassModal && changePassModal) {
    btnClosePassModal.addEventListener('click', () => {
      changePassModal.classList.remove('active');
    });
  }

  if (formChangeAdminPass) {
    formChangeAdminPass.addEventListener('submit', (e) => {
      e.preventDefault();
      const newPassInput = document.getElementById('inputNewAdminPass');
      const newPass = newPassInput ? newPassInput.value.trim() : '';
      if (window.auctionStore.updateAdminPassword(newPass)) {
        window.showToast('Admin password updated successfully!', 'success');
        if (changePassModal) changePassModal.classList.remove('active');
        formChangeAdminPass.reset();
      } else {
        window.showToast('Password must be at least 4 characters.', 'warning');
      }
    });
  }

  checkAdminAuth();

  // ============================================================
  // TEAM FRANCHISE AUTHENTICATION
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
    if (!teamLockScreen || !teamMainContent) return;
    const team = window.auctionStore.getTeam(activeLoggedInTeamId);
    if (activeLoggedInTeamId && team) {
      teamLockScreen.style.display = 'none';
      teamMainContent.style.display = 'block';
      if (teamLockBadge) {
        teamLockBadge.textContent = `● ${team.shortCode} TABLE ACTIVE`;
        teamLockBadge.className = 'portal-status-pill pill-team';
      }
      if (teamAuthenticatedName) teamAuthenticatedName.textContent = team.name;
      if (teamBadgeEmoji) teamBadgeEmoji.textContent = team.logoEmoji || '🏏';
      if (teamLeadershipTag) {
        teamLeadershipTag.textContent = `Captain: ${team.captainName || 'Not Set'} • Vice-Captain: ${team.viceCaptainName || 'Not Set'}`;
      }
      renderTeamWarroom(window.auctionStore.state);
    } else {
      teamLockScreen.style.display = 'block';
      teamMainContent.style.display = 'none';
      if (teamLockBadge) {
        teamLockBadge.textContent = '○ TABLE LOCKED';
        teamLockBadge.className = 'portal-status-pill';
      }
      activeLoggedInTeamId = null;
      sessionStorage.removeItem('cricket_active_team_id');
    }
  }

  if (teamLoginForm) {
    teamLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const loginId = inputTeamLoginId ? inputTeamLoginId.value.trim() : '';
      const pass = inputTeamPassword ? inputTeamPassword.value.trim() : '';
      const team = window.auctionStore.verifyTeamLogin(loginId, pass);
      if (team) {
        activeLoggedInTeamId = team.id;
        sessionStorage.setItem('cricket_active_team_id', team.id);
        teamLoginForm.reset();
        checkTeamAuth();
        window.showToast(`Connected to ${team.name} bidding console!`, 'success');
      } else {
        window.showToast('Invalid Team Login ID or Password. Verify with administrator.', 'error');
      }
    });
  }

  if (btnTeamLogout) {
    btnTeamLogout.addEventListener('click', () => {
      activeLoggedInTeamId = null;
      sessionStorage.removeItem('cricket_active_team_id');
      checkTeamAuth();
      window.showToast('Franchise table disconnected.', 'info');
    });
  }

  checkTeamAuth();

  // ============================================================
  // CREATE TEAM MODAL & RETENTION DEDUCTIONS
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
    if (createTeamModal) {
      createTeamModal.classList.add('active');
      updateTeamPursePreview();
    }
  }

  if (btnOpenCreateTeamModal) btnOpenCreateTeamModal.addEventListener('click', openCreateTeam);
  if (btnOpenCreateTeamModal2) btnOpenCreateTeamModal2.addEventListener('click', openCreateTeam);
  if (btnCloseTeamModal && createTeamModal) {
    btnCloseTeamModal.addEventListener('click', () => createTeamModal.classList.remove('active'));
  }

  function updateTeamPursePreview() {
    if (!newTeamPursePreview) return;
    const total = parseFloat(newTeamTotalPurse ? newTeamTotalPurse.value : 0) || 0;
    const cap = parseFloat(newTeamCaptainPrice ? newTeamCaptainPrice.value : 0) || 0;
    const vc = parseFloat(newTeamVCPrice ? newTeamVCPrice.value : 0) || 0;
    const left = Math.max(0, total - (cap + vc));
    newTeamPursePreview.textContent = `Purse Available for Auction: ₹ ${left.toFixed(2)} Cr (Deductions: ₹ ${(cap + vc).toFixed(2)} Cr)`;
  }

  [newTeamTotalPurse, newTeamCaptainPrice, newTeamVCPrice].forEach(el => {
    if (el) el.addEventListener('input', updateTeamPursePreview);
  });

  if (formCreateTeam) {
    formCreateTeam.addEventListener('submit', (e) => {
      e.preventDefault();
      const newTeam = window.auctionStore.createTeam({
        name: document.getElementById('newTeamName').value,
        shortCode: document.getElementById('newTeamCode').value,
        primaryColor: document.getElementById('newTeamColor').value,
        logoEmoji: document.getElementById('newTeamEmoji').value,
        totalPurseCr: newTeamTotalPurse ? newTeamTotalPurse.value : 100,
        captainName: document.getElementById('newTeamCaptain').value,
        captainPriceCr: newTeamCaptainPrice ? newTeamCaptainPrice.value : 0,
        viceCaptainName: document.getElementById('newTeamVC').value,
        viceCaptainPriceCr: newTeamVCPrice ? newTeamVCPrice.value : 0
      });

      window.showToast(`Franchise "${newTeam.name}" created! Credentials: ${newTeam.teamLoginId} / ${newTeam.teamPassword}`, 'success', 5000);
      formCreateTeam.reset();
      if (createTeamModal) createTeamModal.classList.remove('active');
    });
  }

  // ============================================================
  // PLAYER REGISTRATION PORTAL
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

  let currentPhotoDataUrl = window.DEFAULT_CRICKET_AVATAR || '';

  const updateCardPreview = () => {
    if (!cardPreviewName) return;
    const regNameEl = document.getElementById('regName');
    const regCountryEl = document.getElementById('regCountry');
    const regMatchesEl = document.getElementById('regMatches');
    const regRunsEl = document.getElementById('regRuns');
    const regSREl = document.getElementById('regStrikeRate');
    const regCHEl = document.getElementById('regCricHeroesName');

    const name = (regNameEl && regNameEl.value.trim()) || 'PLAYER NAME';
    const country = (regCountryEl && regCountryEl.value.trim()) || 'INDIA';
    const checkedRoles = Array.from(document.querySelectorAll('input[name="regRole"]:checked')).map(cb => cb.value);
    const role = checkedRoles.length > 0 ? checkedRoles.join(', ') : 'Batter';
    const matches = (regMatchesEl && regMatchesEl.value) || '0';
    const runs = (regRunsEl && regRunsEl.value) || '0';
    const sr = (regSREl && regSREl.value) || '0.0';
    const chName = (regCHEl && regCHEl.value.trim()) || '';

    cardPreviewName.textContent = name.toUpperCase();
    if (cardPreviewRole) cardPreviewRole.textContent = `${role.toUpperCase()} • ${country.toUpperCase()}`;
    if (cardPreviewCricHeroes) {
      cardPreviewCricHeroes.textContent = chName ? `CricHeroes: ${chName}` : 'CricHeroes: Not linked';
    }
    if (cardPreviewMatches) cardPreviewMatches.textContent = matches;
    if (cardPreviewRuns) cardPreviewRuns.textContent = runs;
    if (cardPreviewSR) cardPreviewSR.textContent = sr;
    if (cardPreviewImg && currentPhotoDataUrl) cardPreviewImg.src = currentPhotoDataUrl;
  };

  ['regName', 'regCountry', 'regAge', 'regMatches', 'regRuns', 'regStrikeRate', 'regWickets', 'regEconomy', 'regCricHeroesName', 'regCricHeroesPhone'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateCardPreview);
  });

  document.querySelectorAll('input[name="regRole"]').forEach(r => {
    r.addEventListener('change', updateCardPreview);
  });

  const btnChoosePhoto = document.getElementById('btnChoosePhoto');
  const uploadSuccessBadge = document.getElementById('uploadSuccessBadge');

  if (photoDropzone && regPhotoFile) {
    photoDropzone.addEventListener('click', () => regPhotoFile.click());
  }
  if (btnChoosePhoto && regPhotoFile) {
    btnChoosePhoto.addEventListener('click', (e) => {
      e.stopPropagation();
      regPhotoFile.click();
    });
  }

  if (regPhotoFile) {
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
          if (cardPreviewImg) cardPreviewImg.src = currentPhotoDataUrl;
          if (uploadSuccessBadge) uploadSuccessBadge.style.display = 'block';
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  if (regPhotoUrl) {
    regPhotoUrl.addEventListener('input', () => {
      if (regPhotoUrl.value.trim()) {
        currentPhotoDataUrl = regPhotoUrl.value.trim();
        if (cardPreviewImg) cardPreviewImg.src = currentPhotoDataUrl;
        if (uploadSuccessBadge) uploadSuccessBadge.style.display = 'block';
      }
    });
  }

  if (playerRegForm) {
    playerRegForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const checkedRoles = Array.from(document.querySelectorAll('input[name="regRole"]:checked')).map(cb => cb.value);
      const role = checkedRoles.length > 0 ? checkedRoles.join(', ') : 'Batter';

      const newPlayer = window.auctionStore.registerPlayer({
        name: document.getElementById('regName').value.trim(),
        country: document.getElementById('regCountry').value.trim(),
        age: document.getElementById('regAge').value,
        battingStyle: document.getElementById('regBattingStyle').value,
        bowlingStyle: document.getElementById('regBowlingStyle') ? document.getElementById('regBowlingStyle').value.trim() : '',
        role: role,
        matches: document.getElementById('regMatches').value || 0,
        runs: document.getElementById('regRuns').value || 0,
        strikeRate: document.getElementById('regStrikeRate').value || 0,
        wickets: document.getElementById('regWickets').value || 0,
        economy: document.getElementById('regEconomy').value || 0,
        cricHeroesName: document.getElementById('regCricHeroesName') ? document.getElementById('regCricHeroesName').value.trim() : '',
        cricHeroesPhone: document.getElementById('regCricHeroesPhone') ? document.getElementById('regCricHeroesPhone').value.trim() : '',
        photoUrl: currentPhotoDataUrl || window.DEFAULT_CRICKET_AVATAR
      });

      window.showToast(`Registration submitted for ${newPlayer.name}! Awaiting organizer approval.`, 'success', 5000);
      playerRegForm.reset();
      currentPhotoDataUrl = window.DEFAULT_CRICKET_AVATAR;
      if (uploadSuccessBadge) uploadSuccessBadge.style.display = 'none';
      updateCardPreview();
    });
  }

  // ============================================================
  // ADMIN COCKPIT & LIVE HAMMER LOGIC
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

  if (btnAddTier) {
    btnAddTier.addEventListener('click', () => {
      const name = prompt('Enter Tier / Set Name (e.g. Set 5: Finisher Batsmen):');
      if (!name) return;
      const price = prompt('Enter Default Base Price in Crores (e.g. 0.75 for ₹75 Lakh):', '1.0');
      if (!price) return;
      window.auctionStore.createTier({
        name: name,
        defaultBasePriceCr: parseFloat(price)
      });
      window.showToast(`Tier "${name}" created!`, 'success');
    });
  }

  if (btnResetAuction) {
    btnResetAuction.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all tournament state and start with a clean slate?')) {
        localStorage.removeItem('cricket_auction_state');
        window.auctionStore.loadState();
        window.auctionStore.broadcast();
        window.showToast('Tournament state reset.', 'info');
      }
    });
  }

  // Auto-Advance Sequencer Controls
  let autoAdvanceTimer = null;
  let autoAdvanceSeconds = 3;

  function cancelAutoAdvance() {
    if (autoAdvanceTimer) {
      clearInterval(autoAdvanceTimer);
      autoAdvanceTimer = null;
    }
    const bar = document.getElementById('adminAutoAdvanceBar');
    if (bar) bar.style.display = 'none';
  }

  function triggerAutoAdvance(isSold, winningTeam, price) {
    const chk = document.getElementById('chkAutoAdvanceSeq');
    if (!chk || !chk.checked) return;

    cancelAutoAdvance();
    const bar = document.getElementById('adminAutoAdvanceBar');
    const msg = document.getElementById('autoAdvanceMsg');
    if (!bar || !msg) return;

    autoAdvanceSeconds = 4;
    bar.style.display = 'flex';
    msg.textContent = isSold
      ? `Sold to ${winningTeam ? winningTeam.name : 'Team'}! Calling next player in ${autoAdvanceSeconds}s...`
      : `Player Unsold. Calling next player in ${autoAdvanceSeconds}s...`;

    autoAdvanceTimer = setInterval(() => {
      autoAdvanceSeconds--;
      if (autoAdvanceSeconds > 0) {
        msg.textContent = isSold
          ? `Sold to ${winningTeam ? winningTeam.name : 'Team'}! Calling next player in ${autoAdvanceSeconds}s...`
          : `Player Unsold. Calling next player in ${autoAdvanceSeconds}s...`;
      } else {
        cancelAutoAdvance();
        const next = window.auctionStore.getNextPlayerInSequence();
        if (next) {
          window.auctionStore.callPlayerToStage(next.id);
          window.showToast(`Now on stage: ${next.name}`, 'info');
        }
      }
    }, 1000);
  }

  const btnAutoCallNow = document.getElementById('btnAutoCallNow');
  if (btnAutoCallNow) {
    btnAutoCallNow.addEventListener('click', () => {
      cancelAutoAdvance();
      const next = window.auctionStore.getNextPlayerInSequence();
      if (next) {
        window.auctionStore.callPlayerToStage(next.id);
      } else {
        window.showToast('No uncalled players in sequence queue.', 'warning');
      }
    });
  }

  const btnAutoCallCancel = document.getElementById('btnAutoCallCancel');
  if (btnAutoCallCancel) {
    btnAutoCallCancel.addEventListener('click', () => {
      cancelAutoAdvance();
    });
  }

  if (btnCallNextSeq) {
    btnCallNextSeq.addEventListener('click', () => {
      cancelAutoAdvance();
      const nextPlayer = window.auctionStore.getNextPlayerInSequence();
      if (!nextPlayer) {
        window.showToast('No uncalled players in the sequence queue! Approve pending registrations first.', 'warning');
        return;
      }
      window.auctionStore.callPlayerToStage(nextPlayer.id);
      window.showToast(`Called ${nextPlayer.name} to the auction block.`, 'info');
    });
  }

  // Quick Increments
  document.querySelectorAll('.chip-inc[data-inc]').forEach(btn => {
    btn.addEventListener('click', () => {
      const inc = parseFloat(btn.dataset.inc);
      const curr = window.auctionStore.state.live.currentBidCr;
      const target = parseFloat((curr + inc).toFixed(2));
      const teamId = window.auctionStore.state.live.currentBidderId || (window.auctionStore.state.teams[0] ? window.auctionStore.state.teams[0].id : null);
      if (!teamId) {
        window.showToast('Please create at least one franchise team first.', 'warning');
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

  if (btnAdminTimer) {
    btnAdminTimer.addEventListener('click', () => {
      window.auctionStore.state.live.timerSeconds = 15;
      window.auctionStore.state.live.timerRunning = true;
      window.auctionStore.broadcast();
      startCountdown();
    });
  }

  if (btnAdminOnce) btnAdminOnce.addEventListener('click', () => window.auctionStore.setHammerStatus('GOING_ONCE'));
  if (btnAdminTwice) btnAdminTwice.addEventListener('click', () => window.auctionStore.setHammerStatus('GOING_TWICE'));

  if (btnAdminSold) {
    btnAdminSold.addEventListener('click', () => {
      if (!window.auctionStore.state.live.currentBidderId) {
        window.showToast('Cannot sell: No franchise has placed a bid yet.', 'warning');
        return;
      }
      const currentPrice = window.auctionStore.state.live.currentBidCr;
      const winningTeam = window.auctionStore.getTeam(window.auctionStore.state.live.currentBidderId);
      const sold = window.auctionStore.hammerSold();
      if (sold) {
        triggerAutoAdvance(true, winningTeam, currentPrice);
        window.showToast(`SOLD to ${winningTeam ? winningTeam.name : 'Team'} for ₹${currentPrice.toFixed(2)} Cr!`, 'success');
      }
    });
  }

  if (btnAdminUnsold) {
    btnAdminUnsold.addEventListener('click', () => {
      window.auctionStore.hammerUnsold();
      triggerAutoAdvance(false, null, 0);
      window.showToast('Player declared UNSOLD.', 'info');
    });
  }

  if (btnAdminUndo) {
    btnAdminUndo.addEventListener('click', () => {
      cancelAutoAdvance();
      window.auctionStore.undoLastBid();
      window.showToast('Last bid undone.', 'info');
    });
  }

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
  // FRANCHISE WAR-ROOM TABLE PADDLE
  // ============================================================
  const btnTeamRaisePaddle = document.getElementById('btnTeamRaisePaddle');
  const paddleActionText = document.getElementById('paddleActionText');
  const antiBankruptcyNotice = document.getElementById('antiBankruptcyNotice');

  if (btnTeamRaisePaddle) {
    btnTeamRaisePaddle.addEventListener('click', () => {
      if (!activeLoggedInTeamId) {
        window.showToast('Please log in with franchise credentials first.', 'warning');
        return;
      }
      const currentBid = window.auctionStore.state.live.currentBidCr;
      const inc = (window.TOURNAMENT_CONFIG ? window.TOURNAMENT_CONFIG.getIncrement(currentBid) : 0.20);
      const newBid = parseFloat((currentBid + inc).toFixed(2));

      const res = window.auctionStore.placeBid(activeLoggedInTeamId, newBid);
      if (!res.success) {
        window.showToast(res.reason, 'warning');
      }
    });
  }

  document.querySelectorAll('.team-inc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!activeLoggedInTeamId) return;
      const step = parseFloat(btn.dataset.step);
      const currentBid = window.auctionStore.state.live.currentBidCr;
      const newBid = parseFloat((currentBid + step).toFixed(2));
      const res = window.auctionStore.placeBid(activeLoggedInTeamId, newBid);
      if (!res.success) window.showToast(res.reason, 'warning');
    });
  });

  // ============================================================
  // SOLD POPUP & FANFARE
  // ============================================================
  const soldPopupModal = document.getElementById('soldPopupModal');
  const soldPopupImg = document.getElementById('soldPopupImg');
  const soldPopupName = document.getElementById('soldPopupName');
  const soldPopupTeamBadge = document.getElementById('soldPopupTeamBadge');
  const soldPopupPrice = document.getElementById('soldPopupPrice');
  const btnDownloadPopupPost = document.getElementById('btnDownloadPopupPost');
  const btnClosePopupModal = document.getElementById('btnClosePopupModal');

  if (btnClosePopupModal && soldPopupModal) {
    btnClosePopupModal.addEventListener('click', () => {
      soldPopupModal.classList.remove('active');
    });
  }

  if (btnDownloadPopupPost) {
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
  }

  // Confetti Particle System (Guarded)
  const confettiCanvas = document.getElementById('confettiCanvas');
  const confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
  let confettiParticles = [];
  let confettiAnimId = null;

  function resizeConfetti() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  if (confettiCanvas) {
    window.addEventListener('resize', resizeConfetti);
    resizeConfetti();
  }

  function triggerConfetti() {
    if (!confettiCanvas || !confettiCtx) return;
    confettiParticles = [];
    const colors = ['#D4AF37', '#F59E0B', '#2563EB', '#059669', '#E11D48'];
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
    if (!confettiCanvas || !confettiCtx) return;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let active = false;

    confettiParticles.forEach(p => {
      p.x += p.velX;
      p.y += p.velY;
      p.rot += p.rotSpeed;

      if (p.y < confettiCanvas.height) active = true;

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rot * Math.PI) / 180);
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      confettiCtx.restore();
    });

    if (active) {
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
    renderHub(state);
    renderAdminCockpit(state);
    renderTeamWarroom(state);
    renderBroadcast(state);

    // Sold Modal - ONLY trigger on Broadcast or relevant Team console (never block Admin)
    const isBroadcastPage = window.location.pathname.includes('broadcast.html') || (document.getElementById('viewBroadcast') && document.getElementById('viewBroadcast').classList.contains('active'));
    const isTeamPage = window.location.pathname.includes('team.html') || (document.getElementById('viewTeamWarroom') && document.getElementById('viewTeamWarroom').classList.contains('active'));

    if (state.live.hammerStatus === 'SOLD' && state.live.soldDetails) {
      const details = state.live.soldDetails;
      if (lastSoldId !== details.player.id + '_' + details.finalPriceCr) {
        lastSoldId = details.player.id + '_' + details.finalPriceCr;

        if (soldPopupModal && (isBroadcastPage || isTeamPage)) {
          if (soldPopupImg) soldPopupImg.src = details.player.photoUrl || window.DEFAULT_CRICKET_AVATAR;
          if (soldPopupName) soldPopupName.textContent = details.player.name.toUpperCase();
          if (soldPopupTeamBadge) {
            soldPopupTeamBadge.textContent = `PURCHASED BY ${details.team.name.toUpperCase()}`;
            soldPopupTeamBadge.style.color = details.team.primaryColor;
          }
          if (soldPopupPrice) {
            soldPopupPrice.textContent = details.finalPriceCr >= 1
              ? `₹ ${details.finalPriceCr.toFixed(2)} CRORE`
              : `₹ ${(details.finalPriceCr * 100).toFixed(0)} LAKH`;
          }
          soldPopupModal.classList.add('active');
          triggerConfetti();
        }
      }
    } else if (state.live.hammerStatus !== 'SOLD' && soldPopupModal) {
      soldPopupModal.classList.remove('active');
    }
  });

  // ============================================================
  // RENDERERS (SAFELY GUARDED)
  // ============================================================

  // 1. Hub Renderer
  function renderHub(state) {
    const avatarStack = document.getElementById('hubTeamAvatarStack');
    if (avatarStack) {
      avatarStack.innerHTML = '';
      if (state.teams.length === 0) {
        avatarStack.innerHTML = `
          <div style="font-size:0.8rem; color:#64748B; padding:4px 0;">
            No franchises created yet. Create teams in the Admin Console.
          </div>
        `;
      } else {
        state.teams.slice(0, 10).forEach(t => {
          const circle = document.createElement('div');
          circle.className = 'team-circle';
          circle.style.background = t.primaryColor || '#2563EB';
          circle.title = `${t.name} (${t.shortCode})`;
          circle.textContent = t.shortCode;
          avatarStack.appendChild(circle);
        });
      }
    }

    const hubTeams = document.getElementById('hubTeamsCount');
    const hubPlayers = document.getElementById('hubPlayersCount');
    const hubPurse = document.getElementById('hubTotalPurse');
    const hubArena = document.getElementById('hubArenaStatus');
    const hubLiveInd = document.getElementById('hubLiveIndicator');
    const hubPurseChip = document.getElementById('hubPurseChip');

    if (hubTeams) hubTeams.textContent = `${state.teams.length} Teams`;
    if (hubPlayers) hubPlayers.textContent = `${state.players.length} Players`;
    if (hubPurse) {
      const totalPurse = state.teams.reduce((acc, t) => acc + (t.totalPurseCr || 100), 0);
      hubPurse.textContent = `₹ ${totalPurse.toFixed(1)} Cr`;
    }
    if (hubPurseChip && state.teams[0]) {
      hubPurseChip.innerHTML = `<span>💰</span> ₹ ${state.teams[0].totalPurseCr} CR PURSE / TEAM`;
    }

    if (hubArena) {
      const activeP = window.auctionStore.getActivePlayer();
      if (activeP) {
        hubArena.textContent = `${activeP.name.split(' ')[0]} on Stage`;
        if (hubLiveInd) hubLiveInd.className = 'meta-chip chip-rose';
      } else {
        hubArena.textContent = 'Arena Ready';
        if (hubLiveInd) hubLiveInd.className = 'meta-chip chip-emerald';
      }
    }
  }

  // 2. Admin Cockpit Renderer
  function renderAdminCockpit(state) {
    if (!adminTeamsGrid) return;

    if (adminTeamsCount) adminTeamsCount.textContent = state.teams.length;
    adminTeamsGrid.innerHTML = '';

    if (state.teams.length === 0) {
      adminTeamsGrid.innerHTML = `
        <div class="empty-state-box" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🛡️</div>
          <strong>No franchise teams created yet</strong>
          <p style="font-size:0.82rem; margin-top:4px; color:#64748B;">Click "+ Add Franchise" to create teams, assign captains, and generate credentials.</p>
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
                <strong style="color:var(--text-primary); font-size:1.05rem;">${team.name}</strong>
                <span style="background:${team.primaryColor}; color:#FFF; padding:2px 7px; border-radius:4px; font-size:0.7rem; font-weight:800; margin-left:6px;">${team.shortCode}</span>
              </div>
            </div>
            <button class="btn-action-danger btn-delete-team" data-id="${team.id}" style="padding:4px 9px; font-size:0.72rem;">Delete</button>
          </div>

          <div style="margin:10px 0; font-size:0.82rem; color:var(--text-secondary); line-height:1.5;">
            <div>Captain: <strong style="color:var(--text-primary);">${team.captainName || 'None'}</strong> ${team.captainPriceCr ? `(₹${team.captainPriceCr} Cr)` : ''}</div>
            <div>Vice-Captain: <strong style="color:var(--text-primary);">${team.viceCaptainName || 'None'}</strong> ${team.viceCaptainPriceCr ? `(₹${team.viceCaptainPriceCr} Cr)` : ''}</div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; background:#F8FAFC; border:1px solid var(--border-subtle); padding:8px 12px; border-radius:8px; margin-bottom:10px;">
            <span style="font-size:0.75rem; color:var(--text-muted);">Purse Available:</span>
            <span style="font-weight:900; color:#059669;">₹ ${team.purseLeftCr.toFixed(2)} Cr / ₹ ${team.totalPurseCr} Cr</span>
          </div>

          <div style="border-top:1px dashed var(--border-subtle); padding-top:10px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Credentials:</div>
              <div style="display:flex; gap:6px; margin-top:4px;">
                <span class="credential-chip">${team.teamLoginId}</span>
                <span class="credential-chip">${team.teamPassword}</span>
              </div>
            </div>
            <button class="btn-copy-cred" data-cred="Team: ${team.name}\nLogin ID: ${team.teamLoginId}\nPassword: ${team.teamPassword}">Copy</button>
          </div>
        `;
        adminTeamsGrid.appendChild(card);
      });

      document.querySelectorAll('.btn-delete-team').forEach(b => {
        b.onclick = () => {
          if (confirm('Delete this franchise team?')) {
            window.auctionStore.deleteTeam(b.dataset.id);
            window.showToast('Team removed.', 'info');
          }
        };
      });

      document.querySelectorAll('.btn-copy-cred').forEach(b => {
        b.onclick = () => {
          navigator.clipboard.writeText(b.dataset.cred);
          b.textContent = '✓ Copied';
          setTimeout(() => { b.textContent = 'Copy'; }, 2000);
          window.showToast('Credentials copied to clipboard!', 'success');
        };
      });
    }

    // Tiers
    if (tierListContainer) {
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
            <input type="number" step="0.1" value="${tier.defaultBasePriceCr}" style="width:75px;" class="form-input" data-tier-id="${tier.id}">
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
            window.showToast('Tier base price updated.', 'success');
          }
        };
      });
    }

    // Pending Players
    if (pendingPlayersList) {
      const pending = state.players.filter(p => p.status === 'PENDING');
      if (pendingCountBadge) pendingCountBadge.textContent = pending.length;
      pendingPlayersList.innerHTML = '';
      if (pending.length === 0) {
        pendingPlayersList.innerHTML = '<div style="color:var(--text-muted); font-size:0.82rem; padding:8px 0;">No pending player applications.</div>';
      } else {
        pending.forEach(p => {
          const item = document.createElement('div');
          item.style.cssText = 'background:#F8FAFC; border:1px solid var(--border-subtle); padding:10px 12px; border-radius:10px; display:flex; justify-content:space-between; align-items:center;';
          item.innerHTML = `
            <div>
              <strong style="color:var(--text-primary);">${p.name}</strong> <span style="font-size:0.8rem; color:var(--text-muted);">(${p.role})</span>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">${p.country} • Runs: ${p.runs} | Wkts: ${p.wickets}</div>
            </div>
            <div style="display:flex; gap:6px;">
              <select class="form-select" id="selTier_${p.id}" style="padding:4px 8px; font-size:0.75rem;">
                ${state.tiers.map(t => `<option value="${t.id}">${t.name} (₹${t.defaultBasePriceCr}Cr)</option>`).join('')}
              </select>
              <button class="btn-action-primary btn-approve-p" data-id="${p.id}" style="padding:4px 10px; font-size:0.75rem;">Approve</button>
              <button class="btn-action-danger btn-reject-p" data-id="${p.id}" style="padding:4px 8px; font-size:0.75rem;">✕</button>
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
            window.showToast('Player approved into sequence queue!', 'success');
          };
        });

        document.querySelectorAll('.btn-reject-p').forEach(b => {
          b.onclick = () => {
            window.auctionStore.rejectPlayer(b.dataset.id);
            window.showToast('Player rejected.', 'info');
          };
        });
      }
    }

    // Active Caller on Block
    const callerImg = document.getElementById('adminCallerImg');
    const callerName = document.getElementById('adminCallerName');
    const callerSet = document.getElementById('adminCallerSet');
    const callerMeta = document.getElementById('adminCallerMeta');
    const callerLead = document.getElementById('adminCallerLeadTeam');
    const callerBid = document.getElementById('adminCallerCurrentBid');
    const adminTimerNum = document.getElementById('adminTimerNumber');

    if (callerName) {
      const active = window.auctionStore.getActivePlayer();
      if (active) {
        if (callerImg) callerImg.src = active.photoUrl || window.DEFAULT_CRICKET_AVATAR;
        callerName.textContent = active.name.toUpperCase();
        const tierObj = window.auctionStore.getTier(active.tierId);
        if (callerSet) callerSet.textContent = tierObj ? tierObj.name.toUpperCase() : 'AUCTION POOL';
        if (callerMeta) callerMeta.textContent = `${active.role} • Base: ₹${active.basePriceCr.toFixed(2)} Cr`;
        const leadTeam = window.auctionStore.getTeam(state.live.currentBidderId);
        if (callerLead) callerLead.textContent = leadTeam ? leadTeam.name : 'None yet';
        if (callerBid) callerBid.textContent = `₹ ${state.live.currentBidCr.toFixed(2)} Cr`;
      } else {
        if (callerImg) callerImg.src = window.DEFAULT_CRICKET_AVATAR;
        callerName.textContent = 'NO ACTIVE PLAYER';
        if (callerSet) callerSet.textContent = 'AUCTION STAGE';
        if (callerMeta) callerMeta.textContent = 'Call a player from the queue to start bidding.';
        if (callerLead) callerLead.textContent = 'None';
        if (callerBid) callerBid.textContent = '₹ 0.00 Cr';
      }
      if (adminTimerNum) adminTimerNum.textContent = `${state.live.timerSeconds}s`;
    }

    // Admin Team Paddles Grid
    const adminPaddlesGrid = document.getElementById('adminTeamPaddlesGrid');
    if (adminPaddlesGrid) {
      adminPaddlesGrid.innerHTML = '';
      state.teams.forEach(team => {
        const btn = document.createElement('button');
        btn.className = 'icon-btn';
        btn.style.cssText = `background:${team.primaryColor}; color:#FFF; justify-content:center; font-weight:800; border:none; padding:10px; border-radius:8px;`;
        btn.innerHTML = `${team.shortCode} <span style="font-size:0.75rem; opacity:0.85;">(₹${team.purseLeftCr.toFixed(1)}Cr)</span>`;
        btn.onclick = () => {
          const curr = state.live.currentBidCr;
          const inc = (window.TOURNAMENT_CONFIG ? window.TOURNAMENT_CONFIG.getIncrement(curr) : 0.20);
          const nextBid = parseFloat((curr + inc).toFixed(2));
          const res = window.auctionStore.placeBid(team.id, nextBid);
          if (!res.success) window.showToast(res.reason, 'warning');
        };
        adminPaddlesGrid.appendChild(btn);
      });
    }

    // Sequence Queue Table
    if (sequenceTableBody) {
      sequenceTableBody.innerHTML = '';
      const sequenced = [...state.players].sort((a, b) => (a.auctionSequence || 999) - (b.auctionSequence || 999));
      if (sequenced.length === 0) {
        sequenceTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:24px; color:var(--text-muted);">No approved players in sequence. Approve pending registrations to build sequence.</td></tr>';
      } else {
        sequenced.forEach((p, idx) => {
          const tr = document.createElement('tr');
          const tier = window.auctionStore.getTier(p.tierId);
          const isCurrent = p.id === state.live.activePlayerId;
          tr.style.backgroundColor = isCurrent ? 'rgba(217, 119, 6, 0.08)' : 'transparent';
          tr.innerHTML = `
            <td><strong>#${idx + 1}</strong></td>
            <td>
              <div style="display:flex; align-items:center; gap:8px;">
                <img src="${p.photoUrl || window.DEFAULT_CRICKET_AVATAR}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">
                <strong>${p.name}</strong>
              </div>
            </td>
            <td>${p.role}</td>
            <td>${tier ? tier.name : 'Unassigned'}</td>
            <td>₹ ${p.basePriceCr ? p.basePriceCr.toFixed(2) : '0.20'} Cr</td>
            <td><span class="status-pill status-${p.status.toLowerCase()}">${p.status}</span></td>
            <td>
              <button class="icon-btn btn-call-stage" data-id="${p.id}" style="padding:4px 10px; font-size:0.75rem;">
                ${isCurrent ? 'Current' : 'Call to Stage'}
              </button>
              <button class="btn-action-danger btn-del-player" data-id="${p.id}" style="padding:4px 8px; font-size:0.72rem;">✕</button>
            </td>
          `;
          sequenceTableBody.appendChild(tr);
        });

        document.querySelectorAll('.btn-call-stage').forEach(b => {
          b.onclick = () => window.auctionStore.callPlayerToStage(b.dataset.id);
        });
        document.querySelectorAll('.btn-del-player').forEach(b => {
          b.onclick = () => {
            if (confirm('Remove player from tournament?')) {
              window.auctionStore.deletePlayer(b.dataset.id);
              window.showToast('Player deleted.', 'info');
            }
          };
        });
      }
    }
  }

  // 3. Team War-Room Renderer
  function renderTeamWarroom(state) {
    const teamViewPlayerName = document.getElementById('teamViewPlayerName');
    if (!teamViewPlayerName) return;

    if (!activeLoggedInTeamId) return;
    const team = window.auctionStore.getTeam(activeLoggedInTeamId);
    if (!team) return;

    const activePlayer = window.auctionStore.getActivePlayer();
    const teamViewPlayerRole = document.getElementById('teamViewPlayerRole');
    const teamViewCurrentBid = document.getElementById('teamViewCurrentBid');
    const teamViewLeaderTag = document.getElementById('teamViewLeaderTag');

    if (activePlayer) {
      teamViewPlayerName.textContent = activePlayer.name.toUpperCase();
      if (teamViewPlayerRole) teamViewPlayerRole.textContent = `${activePlayer.role} • Base ₹${activePlayer.basePriceCr.toFixed(2)} Cr`;
    } else {
      teamViewPlayerName.textContent = 'NO ACTIVE PLAYER';
      if (teamViewPlayerRole) teamViewPlayerRole.textContent = 'Awaiting next call from auctioneer';
    }

    if (teamViewCurrentBid) teamViewCurrentBid.textContent = `₹ ${state.live.currentBidCr.toFixed(2)} CR`;
    const leadTeam = window.auctionStore.getTeam(state.live.currentBidderId);
    if (teamViewLeaderTag) teamViewLeaderTag.textContent = leadTeam ? `Held by: ${leadTeam.name}` : 'No Bids Placed';

    const inc = (window.TOURNAMENT_CONFIG ? window.TOURNAMENT_CONFIG.getIncrement(state.live.currentBidCr) : 0.20);
    const nextBid = parseFloat((state.live.currentBidCr + inc).toFixed(2));
    if (paddleActionText) paddleActionText.textContent = `RAISE BID TO ₹ ${nextBid.toFixed(2)} CR`;

    const minSlotsLeft = Math.max(0, 18 - (team.squad.length + 1));
    const reservedPurse = minSlotsLeft * 0.20;
    const maxAllowedBid = team.purseLeftCr - reservedPurse;

    const cannotAfford = nextBid > maxAllowedBid;
    const isCurrentlyWinning = state.live.currentBidderId === team.id;
    const noPlayer = !activePlayer;

    if (btnTeamRaisePaddle && antiBankruptcyNotice) {
      if (noPlayer) {
        btnTeamRaisePaddle.disabled = true;
        antiBankruptcyNotice.style.display = 'none';
      } else if (cannotAfford) {
        btnTeamRaisePaddle.disabled = true;
        antiBankruptcyNotice.style.display = 'block';
        antiBankruptcyNotice.textContent = `⚠️ Cannot bid ₹${nextBid.toFixed(2)} Cr: Must reserve ₹${reservedPurse.toFixed(2)} Cr for ${minSlotsLeft} required squad slots.`;
        antiBankruptcyNotice.style.background = 'rgba(244, 63, 94, 0.1)';
        antiBankruptcyNotice.style.borderColor = 'rgba(244, 63, 94, 0.3)';
        antiBankruptcyNotice.style.color = '#DC2626';
      } else if (isCurrentlyWinning) {
        btnTeamRaisePaddle.disabled = true;
        antiBankruptcyNotice.style.display = 'block';
        antiBankruptcyNotice.textContent = `✓ Your franchise currently holds the highest bid!`;
        antiBankruptcyNotice.style.background = 'rgba(16, 185, 129, 0.12)';
        antiBankruptcyNotice.style.borderColor = 'rgba(16, 185, 129, 0.35)';
        antiBankruptcyNotice.style.color = '#059669';
      } else {
        btnTeamRaisePaddle.disabled = false;
        antiBankruptcyNotice.style.display = 'none';
      }
    }

    // Squad & Purse Dashboard
    const teamDashTitle = document.getElementById('teamDashboardTitle');
    const teamPurseLeftText = document.getElementById('teamPurseLeftText');
    const teamPurseBar = document.getElementById('teamPurseProgressBar');
    const teamSquadCount = document.getElementById('teamSquadCount');
    const teamOverseasCount = document.getElementById('teamOverseasCount');

    if (teamDashTitle) teamDashTitle.textContent = `${team.name} Dashboard`;
    if (teamPurseLeftText) teamPurseLeftText.textContent = `₹ ${team.purseLeftCr.toFixed(2)} Cr`;
    if (teamPurseBar) {
      const pursePct = Math.max(0, Math.min(100, (team.purseLeftCr / team.totalPurseCr) * 100));
      teamPurseBar.style.width = `${pursePct}%`;
    }
    if (teamSquadCount) teamSquadCount.textContent = `${team.squad.length} / 25`;
    if (teamOverseasCount) teamOverseasCount.textContent = `${team.overseasCount || 0} / 8`;

    const acquiredList = document.getElementById('teamAcquiredRoster');
    const teamAcquiredCount = document.getElementById('teamAcquiredCount');
    if (acquiredList) {
      acquiredList.innerHTML = '';
      if (teamAcquiredCount) teamAcquiredCount.textContent = team.squad.length;
      if (team.squad.length === 0) {
        acquiredList.innerHTML = '<div style="color:var(--text-muted); font-size:0.82rem; padding:8px 0;">No players acquired yet.</div>';
      } else {
        team.squad.forEach(sq => {
          const d = document.createElement('div');
          d.className = 'acquired-player-item';
          d.innerHTML = `<span><strong>${sq.name}</strong> (${sq.role})</span><span style="color:#059669; font-weight:800;">₹ ${sq.priceCr.toFixed(2)} Cr</span>`;
          acquiredList.appendChild(d);
        });
      }
    }
  }

  // 4. TV Broadcast Renderer
  function renderBroadcast(state) {
    const bcPlayerImg = document.getElementById('bcPlayerImg');
    if (!bcPlayerImg) return;

    const bcPlayerName = document.getElementById('bcPlayerName');
    const bcPlayerRole = document.getElementById('bcPlayerRole');
    const bcStatMatches = document.getElementById('bcStatMatches');
    const bcStatRuns = document.getElementById('bcStatRuns');
    const bcStatSR = document.getElementById('bcStatSR');
    const bcBasePriceBadge = document.getElementById('bcBasePriceBadge');
    const bcSetTitle = document.getElementById('bcSetTitle');

    const active = window.auctionStore.getActivePlayer();
    if (active) {
      bcPlayerImg.src = active.photoUrl || window.DEFAULT_CRICKET_AVATAR;
      if (bcPlayerName) bcPlayerName.textContent = active.name.toUpperCase();
      if (bcPlayerRole) bcPlayerRole.textContent = `${active.role.toUpperCase()} • ${active.country.toUpperCase()}`;
      if (bcStatMatches) bcStatMatches.textContent = active.matches;
      if (bcStatRuns) bcStatRuns.textContent = active.runs;
      if (bcStatSR) bcStatSR.textContent = active.strikeRate || '0.0';
      if (bcBasePriceBadge) bcBasePriceBadge.textContent = `BASE PRICE: ₹ ${active.basePriceCr.toFixed(2)} CR`;

      const tierObj = window.auctionStore.getTier(active.tierId);
      if (bcSetTitle) bcSetTitle.textContent = tierObj ? tierObj.name.toUpperCase() : 'AUCTION POOL';
    } else {
      bcPlayerImg.src = window.DEFAULT_CRICKET_AVATAR;
      if (bcPlayerName) bcPlayerName.textContent = 'STAGE AWAITING CALL';
      if (bcPlayerRole) bcPlayerRole.textContent = 'AUCTION IN PROGRESS';
      if (bcStatMatches) bcStatMatches.textContent = '0';
      if (bcStatRuns) bcStatRuns.textContent = '0';
      if (bcStatSR) bcStatSR.textContent = '0.0';
      if (bcBasePriceBadge) bcBasePriceBadge.textContent = 'BASE PRICE: ₹ 0.00 CR';
      if (bcSetTitle) bcSetTitle.textContent = 'AUCTION ARENA';
    }

    const bcCurrentBid = document.getElementById('bcCurrentBid');
    if (bcCurrentBid) bcCurrentBid.textContent = `₹ ${state.live.currentBidCr.toFixed(2)} CR`;

    const leadTeam = window.auctionStore.getTeam(state.live.currentBidderId);
    const leaderBadge = document.getElementById('bcLeaderBadge');
    if (leaderBadge) {
      if (leadTeam) {
        leaderBadge.textContent = `${leadTeam.logoEmoji || '🏆'} ${leadTeam.name.toUpperCase()}`;
        leaderBadge.style.background = leadTeam.primaryColor;
        leaderBadge.style.color = '#FFFFFF';
      } else {
        leaderBadge.textContent = 'NO BIDS YET';
        leaderBadge.style.background = '#1E293B';
        leaderBadge.style.color = '#FFFFFF';
      }
    }

    // Timer
    const timerBox = document.getElementById('bcTimerBox');
    const timerNum = document.getElementById('bcTimerNumber');
    if (timerNum) {
      const sec = state.live.timerSeconds;
      timerNum.textContent = `00:${sec < 10 ? '0' + sec : sec}`;
      if (timerBox) timerBox.classList.toggle('timer-critical', sec <= 5 && state.live.timerRunning);
    }

    // Hammer Banner
    const hammerBanner = document.getElementById('bcHammerBanner');
    if (hammerBanner) {
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
    }

    // Bidding History Ladder
    const ladderList = document.getElementById('bcBidLadderList');
    if (ladderList) {
      ladderList.innerHTML = '';
      if (state.live.bidHistory.length === 0) {
        ladderList.innerHTML = '<div style="color:#64748B; font-size:0.85rem; padding:8px;">Awaiting opening bid from franchise tables...</div>';
      } else {
        state.live.bidHistory.slice(0, 5).forEach((bid) => {
          const item = document.createElement('div');
          item.className = 'ladder-item';
          item.innerHTML = `
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${bid.color};"></span>
              <span>${bid.teamName}</span>
            </div>
            <span style="color:#059669; font-weight:800;">₹ ${bid.amountCr.toFixed(2)} Cr</span>
          `;
          ladderList.appendChild(item);
        });
      }
    }

    // Bottom Ticker
    const tickerTrack = document.getElementById('bcTickerTrack');
    if (tickerTrack) {
      tickerTrack.innerHTML = '';
      if (state.teams.length === 0) {
        tickerTrack.innerHTML = '<div class="ticker-item">Awaiting franchise team registration...</div>';
      } else {
        const loopTeams = state.teams.concat(state.teams);
        loopTeams.forEach(t => {
          const item = document.createElement('div');
          item.className = 'ticker-item';
          item.innerHTML = `
            <span style="color:${t.primaryColor}; font-weight:800;">[${t.shortCode}]</span>
            <span><strong>${t.name}</strong></span>
            <span style="color:#059669; font-weight:800;">Purse: ₹${t.purseLeftCr.toFixed(2)} Cr</span>
            <span>Squad: ${t.squad.length}/25</span>
          `;
          tickerTrack.appendChild(item);
        });
      }
    }
  }

  // Fullscreen Toggle
  const btnBcFullscreen = document.getElementById('btnBcFullscreen');
  if (btnBcFullscreen) {
    btnBcFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        btnBcFullscreen.innerHTML = '<span>⛶</span> Exit Full';
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
        btnBcFullscreen.innerHTML = '<span>⛶</span> Fullscreen';
      }
    });
  }

  // 5. Studio Poster Canvas
  async function renderStudioPoster() {
    const canvas = document.getElementById('studioPosterCanvas');
    if (!canvas) return;

    const player = window.auctionStore.getActivePlayer() || window.auctionStore.state.players[0] || {
      name: "CHAMPION PLAYER",
      role: "All-Rounder",
      country: "INDIA",
      photoUrl: window.DEFAULT_CRICKET_AVATAR
    };
    const team = window.auctionStore.getTeam(window.auctionStore.state.live.currentBidderId) || window.auctionStore.state.teams[0] || {
      name: "PREMIER CHAMPIONS",
      primaryColor: "#2563EB",
      logoEmoji: "🏆"
    };
    const price = window.auctionStore.state.live.currentBidCr || 12.5;

    const rendered = await window.auctionPoster.generateSoldPoster(player, team, price);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(rendered, 0, 0, canvas.width, canvas.height);
  }

  const btnDownloadStudio = document.getElementById('btnDownloadStudioPoster');
  if (btnDownloadStudio) {
    btnDownloadStudio.addEventListener('click', async () => {
      const player = window.auctionStore.getActivePlayer() || window.auctionStore.state.players[0] || {
        name: "CHAMPION_PLAYER",
        role: "All-Rounder",
        photoUrl: window.DEFAULT_CRICKET_AVATAR
      };
      const team = window.auctionStore.getTeam(window.auctionStore.state.live.currentBidderId) || window.auctionStore.state.teams[0] || {
        name: "CHAMPIONS",
        primaryColor: "#2563EB"
      };
      const price = window.auctionStore.state.live.currentBidCr || 12.5;
      const canvas = await window.auctionPoster.generateSoldPoster(player, team, price);
      window.auctionPoster.downloadPoster(canvas, `${player.name.replace(/\s+/g, '_')}_SOLD.png`);
    });
  }

  // ============================================================
  // EXPORTS & REPORTING
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

  // Team Squad Export
  const btnExportTeamExcel = document.getElementById('btnExportTeamExcel');
  if (btnExportTeamExcel) {
    btnExportTeamExcel.addEventListener('click', () => {
      if (!activeLoggedInTeamId) {
        window.showToast('Please log in with franchise credentials first.', 'warning');
        return;
      }
      const team = window.auctionStore.getTeam(activeLoggedInTeamId);
      if (!team) return;

      if (team.squad.length === 0) {
        window.showToast('No players acquired yet by your franchise.', 'info');
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
      window.showToast('Squad roster CSV downloaded.', 'success');
    });
  }

  // Admin Full Tournament Export
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
      window.showToast('Full tournament report downloaded.', 'success');
    });
  }

  // Admin Print / PDF Summary Report
  const btnPrintAdminReport = document.getElementById('btnPrintAdminReport');
  if (btnPrintAdminReport) {
    btnPrintAdminReport.addEventListener('click', () => {
      const state = window.auctionStore.state;
      const printWin = window.open('', '_blank', 'width=1000,height=800');
      if (!printWin) {
        window.showToast('Please allow popups to open printable report.', 'warning');
        return;
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Tournament Auction Financial & Squad Report</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #0F172A; }
            h1 { font-size: 22px; margin-bottom: 4px; color: #0F172A; font-weight: 800; }
            h2 { font-size: 15px; margin: 24px 0 10px 0; color: #1E293B; border-bottom: 2px solid #E2E8F0; padding-bottom: 6px; font-weight: 700; }
            .meta { color: #64748B; margin-bottom: 24px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px; }
            th, td { border: 1px solid #CBD5E1; padding: 8px 10px; text-align: left; }
            th { background: #F8FAFC; font-weight: 700; color: #334155; }
            .price { color: #059669; font-weight: 800; }
            @media print {
              body { padding: 10px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Official Tournament Financial & Squad Report</h1>
          <div class="meta">Exported: ${new Date().toLocaleString()}</div>

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

  // Initial Notify & Route
  window.auctionStore.notify();
  updateCardPreview();
  handleRouteFromHash();
});
