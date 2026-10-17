/**
 * SMYS INTRA HOSTEL CRICKET - PLAYER REGISTRATION MODULE CONTROLLER
 * 100% faithful restoration matching official design specification.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const form = document.getElementById('playerRegForm');
  const fileInput = document.getElementById('regPhotoFile');
  const btnDeviceUpload = document.getElementById('btnDeviceUpload');
  const btnWebLink = document.getElementById('btnWebLink');
  const dropzoneBox = document.getElementById('dropzoneBox');
  const avatarPreviewImg = document.getElementById('avatarPreviewImg');
  const avatarSvgPlaceholder = document.getElementById('avatarSvgPlaceholder');
  const btnAvatarEdit = document.getElementById('btnAvatarEdit');

  // Web Link Modal
  const weblinkModal = document.getElementById('weblinkModal');
  const weblinkInput = document.getElementById('weblinkInput');
  const btnCancelWeblink = document.getElementById('btnCancelWeblink');
  const btnConfirmWeblink = document.getElementById('btnConfirmWeblink');

  // Playing style role pills
  const rolePills = document.querySelectorAll('.role-pill');
  let selectedRole = '';

  // Sliders
  const battingSlider = document.getElementById('battingRating');
  const bowlingSlider = document.getElementById('bowlingRating');
  const keepingSlider = document.getElementById('keepingRating');

  // Stat circles
  const statCircles = document.querySelectorAll('.stat-circle-toggle');

  // Submit button
  const submitBtn = document.getElementById('btnSubmitRegistration');

  // State
  let currentPhotoData = '';

  // ------------------------------------------------------------
  // SLIDER GRADIENT FILL UPDATER
  // ------------------------------------------------------------
  function updateSliderFill(slider, colorHex, emptyHex = '#E2E8F0') {
    if (!slider) return;
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 10;
    const val = parseFloat(slider.value) || 0;
    const percent = ((val - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, ${colorHex} 0%, ${colorHex} ${percent}%, ${emptyHex} ${percent}%, ${emptyHex} 100%)`;
  }

  function initSliders() {
    if (battingSlider) {
      updateSliderFill(battingSlider, '#EF4444');
      battingSlider.addEventListener('input', () => updateSliderFill(battingSlider, '#EF4444'));
    }
    if (bowlingSlider) {
      updateSliderFill(bowlingSlider, '#3B82F6');
      bowlingSlider.addEventListener('input', () => updateSliderFill(bowlingSlider, '#3B82F6'));
    }
    if (keepingSlider) {
      updateSliderFill(keepingSlider, '#A855F7');
      keepingSlider.addEventListener('input', () => updateSliderFill(keepingSlider, '#A855F7'));
    }
  }

  // ------------------------------------------------------------
  // PHOTO PROCESSING (Standard 600x600 Aspect-Fit)
  // ------------------------------------------------------------
  function setAvatarImage(dataUrl) {
    currentPhotoData = dataUrl;
    if (avatarPreviewImg && avatarSvgPlaceholder) {
      if (dataUrl) {
        avatarPreviewImg.src = dataUrl;
        avatarPreviewImg.style.display = 'block';
        avatarSvgPlaceholder.style.display = 'none';
      } else {
        avatarPreviewImg.src = '';
        avatarPreviewImg.style.display = 'none';
        avatarSvgPlaceholder.style.display = 'block';
      }
    }
  }

  function processImageFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG).', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const targetSize = 600;
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');

        // Professional dark studio radial background
        const grad = ctx.createRadialGradient(
          targetSize / 2, targetSize / 2, 40,
          targetSize / 2, targetSize / 2, targetSize * 0.72
        );
        grad.addColorStop(0, '#1E293B');
        grad.addColorStop(0.7, '#0F172A');
        grad.addColorStop(1, '#080C16');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, targetSize, targetSize);

        // Aspect fit without cropping
        const scale = Math.min(targetSize / img.width, targetSize / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        const dx = (targetSize - dw) / 2;
        const dy = (targetSize - dh) / 2;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, dx, dy, dw, dh);

        const processedUrl = canvas.toDataURL('image/jpeg', 0.85);
        setAvatarImage(processedUrl);
        showToast('✓ Photo attached successfully!', 'success');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // File Upload Handlers
  if (btnDeviceUpload && fileInput) {
    btnDeviceUpload.addEventListener('click', (e) => {
      e.preventDefault();
      fileInput.click();
    });
  }

  if (btnAvatarEdit && fileInput) {
    btnAvatarEdit.addEventListener('click', (e) => {
      e.preventDefault();
      fileInput.click();
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        processImageFile(e.target.files[0]);
      }
    });
  }

  // Drag & Drop
  if (dropzoneBox) {
    dropzoneBox.addEventListener('click', () => {
      if (fileInput) fileInput.click();
    });

    ['dragenter', 'dragover'].forEach(evt => {
      dropzoneBox.addEventListener(evt, (e) => {
        e.preventDefault();
        dropzoneBox.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(evt => {
      dropzoneBox.addEventListener(evt, (e) => {
        e.preventDefault();
        dropzoneBox.classList.remove('dragover');
      });
    });

    dropzoneBox.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        processImageFile(e.dataTransfer.files[0]);
      }
    });
  }

  // Web Link Modal
  if (btnWebLink && weblinkModal) {
    btnWebLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (weblinkInput) weblinkInput.value = '';
      weblinkModal.classList.add('open');
      if (weblinkInput) weblinkInput.focus();
    });
  }

  if (btnCancelWeblink && weblinkModal) {
    btnCancelWeblink.addEventListener('click', () => {
      weblinkModal.classList.remove('open');
    });
  }

  if (btnConfirmWeblink && weblinkModal && weblinkInput) {
    btnConfirmWeblink.addEventListener('click', () => {
      const url = weblinkInput.value.trim();
      if (!url) {
        showToast('Please enter an image URL', 'error');
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setAvatarImage(url);
        weblinkModal.classList.remove('open');
        showToast('✓ Photo linked successfully!', 'success');
      };
      img.onerror = () => {
        // Fallback directly
        setAvatarImage(url);
        weblinkModal.classList.remove('open');
        showToast('✓ Photo link set!', 'success');
      };
      img.src = url;
    });
  }

  // ------------------------------------------------------------
  // PLAYING STYLE (SINGLE ROLE SELECTION)
  // ------------------------------------------------------------
  rolePills.forEach(pill => {
    pill.addEventListener('click', () => {
      rolePills.forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      selectedRole = pill.dataset.role || '';
    });
  });

  // ------------------------------------------------------------
  // STAT CIRCLE TOGGLES (QUICK 0 TOGGLE)
  // ------------------------------------------------------------
  statCircles.forEach(circle => {
    circle.addEventListener('click', () => {
      const targetId = circle.dataset.target;
      const input = document.getElementById(targetId);
      if (input) {
        if (input.value === '0') {
          input.value = '';
          circle.classList.remove('active');
        } else {
          input.value = '0';
          circle.classList.add('active');
        }
      }
    });
  });

  // Also sync circle if input typed
  ['regMatches', 'regRuns', 'regWickets'].forEach(id => {
    const input = document.getElementById(id);
    const circle = document.querySelector(`.stat-circle-toggle[data-target="${id}"]`);
    if (input && circle) {
      input.addEventListener('input', () => {
        if (input.value === '0') {
          circle.classList.add('active');
        } else {
          circle.classList.remove('active');
        }
      });
    }
  });

  // ------------------------------------------------------------
  // FORM RESET
  // ------------------------------------------------------------
  function resetRegistrationForm() {
    if (form) form.reset();
    selectedRole = '';
    rolePills.forEach(p => p.classList.remove('selected'));
    statCircles.forEach(c => c.classList.remove('active'));
    setAvatarImage('');
    if (fileInput) fileInput.value = '';

    // Reset sliders to 0
    if (battingSlider) {
      battingSlider.value = 0;
      updateSliderFill(battingSlider, '#EF4444');
    }
    if (bowlingSlider) {
      bowlingSlider.value = 0;
      updateSliderFill(bowlingSlider, '#3B82F6');
    }
    if (keepingSlider) {
      keepingSlider.value = 0;
      updateSliderFill(keepingSlider, '#A855F7');
    }
  }

  // ------------------------------------------------------------
  // FORM SUBMISSION & STORE CONNECTION
  // ------------------------------------------------------------
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Collect values
      const fullName = (document.getElementById('regName')?.value || '').trim();
      const year = document.getElementById('regYear')?.value || '';
      const phone = (document.getElementById('regPhone')?.value || '').trim();
      const matches = document.getElementById('regMatches')?.value || '';
      const runs = document.getElementById('regRuns')?.value || '';
      const wickets = document.getElementById('regWickets')?.value || '';
      const battingRating = battingSlider ? battingSlider.value : 0;
      const bowlingRating = bowlingSlider ? bowlingSlider.value : 0;
      const keepingRating = keepingSlider ? keepingSlider.value : 0;
      const battingStyle = document.getElementById('regBattingStyle')?.value || '';
      const bowlingStyle = document.getElementById('regBowlingStyle')?.value || '';

      // Validation
      if (!fullName) {
        showToast('Please enter your Full Name', 'error');
        document.getElementById('regName')?.focus();
        return;
      }

      if (!year) {
        showToast('Please select your Year', 'error');
        document.getElementById('regYear')?.focus();
        return;
      }

      if (!phone || phone.length < 10) {
        showToast('Please enter a valid 10-digit Phone Number', 'error');
        document.getElementById('regPhone')?.focus();
        return;
      }

      if (matches === '') {
        showToast('Please enter Total Matches Played (or enter 0)', 'error');
        document.getElementById('regMatches')?.focus();
        return;
      }

      if (runs === '') {
        showToast('Please enter Total Runs Scored (or enter 0)', 'error');
        document.getElementById('regRuns')?.focus();
        return;
      }

      if (wickets === '') {
        showToast('Please enter Total Wickets Taken (or enter 0)', 'error');
        document.getElementById('regWickets')?.focus();
        return;
      }

      if (!selectedRole) {
        showToast('Please select your Playing Style (role)', 'error');
        return;
      }

      // Prepare payload
      const payload = {
        name: fullName,
        year: year,
        phone: phone,
        matches: parseInt(matches) || 0,
        runs: parseInt(runs) || 0,
        wickets: parseInt(wickets) || 0,
        role: selectedRole,
        battingRating: parseInt(battingRating) || 0,
        bowlingRating: parseInt(bowlingRating) || 0,
        keepingRating: parseInt(keepingRating) || 0,
        battingStyle: battingStyle,
        bowlingStyle: bowlingStyle,
        photoUrl: currentPhotoData || window.DEFAULT_CRICKET_AVATAR
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
      }

      try {
        if (window.auctionStore && typeof window.auctionStore.registerPlayer === 'function') {
          const result = await window.auctionStore.registerPlayer(payload);
          if (result && result.cloudSynced) {
            showToast(`✅ Registration submitted for ${fullName}! Synced to live tournament cloud.`, 'success', 6000);
          } else {
            showToast(`✅ Registration submitted for ${fullName}! Saved for organizer approval.`, 'success', 5000);
          }
        } else {
          showToast(`✅ Registration submitted for ${fullName}!`, 'success', 4000);
        }

        // Reset all fields completely
        resetRegistrationForm();
      } catch (err) {
        showToast(`Submission error: ${err.message}`, 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
        }
      }
    });
  }

  // ------------------------------------------------------------
  // TOAST NOTIFICATION HELPER
  // ------------------------------------------------------------
  function showToast(message, type = 'info', duration = 4000) {
    let toast = document.getElementById('regToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'regToast';
      toast.className = 'reg-toast';
      document.body.appendChild(toast);
    }

    toast.className = `reg-toast ${type === 'success' ? 'toast-success' : type === 'error' ? 'toast-error' : ''}`;
    toast.textContent = message;
    toast.classList.add('show');

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  // Initialize
  initSliders();
  resetRegistrationForm();
});
