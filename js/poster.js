// poster.js - Instagram / Social Media 1080x1080 Canvas Graphic Generator & Live Screen Popup

class AuctionPosterGenerator {
  constructor() {
    this.canvas = null;
    this.ctx = null;
  }

  initCanvas(width = 1080, height = 1080) {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
    }
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
    return this.canvas;
  }

  // Draw high-resolution 1080x1080 Instagram post
  async generateSoldPoster(player, team, priceCr) {
    const canvas = this.initCanvas(1080, 1080);
    const ctx = this.ctx;
    const teamColor = team ? team.primaryColor : "#FFB800";
    const teamSecondary = team ? (team.secondaryColor || "#004BA0") : "#111827";

    // 1. Deep Obsidian Gradient Background
    const bgGrad = ctx.createRadialGradient(540, 400, 100, 540, 540, 750);
    bgGrad.addColorStop(0, "#131b2e");
    bgGrad.addColorStop(0.5, "#0b0f1a");
    bgGrad.addColorStop(1, "#05070d");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1080);

    // 2. Team Ambient Light Glow (Left & Right)
    const glow1 = ctx.createRadialGradient(200, 200, 20, 200, 200, 450);
    glow1.addColorStop(0, teamColor + "33"); // 20% opacity
    glow1.addColorStop(1, "transparent");
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, 1080, 1080);

    // 3. Golden Metallic Outer Frame
    ctx.strokeStyle = "rgba(255, 184, 0, 0.4)";
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, 1020, 1020);

    ctx.strokeStyle = teamColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(44, 44, 992, 992);

    // 4. Header Tournament Tag
    ctx.fillStyle = "#FFB800";
    ctx.font = "900 28px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.letterSpacing = "6px";
    ctx.fillText("PREMIER CRICKET MEGA AUCTION 2026", 540, 95);

    // Subtle line divider
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(250, 115);
    ctx.lineTo(830, 115);
    ctx.stroke();

    // 5. Massive "SOLD" Stamp Graphic
    ctx.save();
    ctx.shadowColor = "rgba(255, 184, 0, 0.8)";
    ctx.shadowBlur = 25;
    ctx.fillStyle = "#FFB800";
    ctx.font = "900 68px 'Inter', sans-serif";
    ctx.letterSpacing = "4px";
    ctx.fillText("⚡ S O L D ⚡", 540, 195);
    ctx.restore();

    // 6. Player Photo with Glowing Team Border
    const photoSize = 340;
    const photoX = 540 - photoSize / 2;
    const photoY = 230;

    // Outer glow circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(540, photoY + photoSize / 2, photoSize / 2 + 10, 0, Math.PI * 2);
    ctx.strokeStyle = teamColor;
    ctx.lineWidth = 8;
    ctx.shadowColor = teamColor;
    ctx.shadowBlur = 30;
    ctx.stroke();
    ctx.restore();

    // Clip circle & draw player image
    ctx.save();
    ctx.beginPath();
    ctx.arc(540, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Load or fallback image
    try {
      const img = await this.loadImage(player.photoUrl);
      const scale = Math.min(photoSize / img.width, photoSize / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const drawX = photoX + (photoSize - drawW) / 2;
      const drawY = photoY + (photoSize - drawH) / 2;

      ctx.fillStyle = "#0F172A";
      ctx.fillRect(photoX, photoY, photoSize, photoSize);
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    } catch (e) {
      // High-end placeholder
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(photoX, photoY, photoSize, photoSize);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 60px 'Inter', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(player.name.substring(0, 2).toUpperCase(), 540, photoY + photoSize / 2 + 20);
    }
    ctx.restore();

    // 7. Role Badge Pill
    const roleText = `🏏 ${player.role.toUpperCase()} • ${player.country || 'INDIA'}`.toUpperCase();
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    this.roundRect(ctx, 360, 600, 360, 42, 21, true, false);
    ctx.fillStyle = "#E2E8F0";
    ctx.font = "700 20px 'Inter', sans-serif";
    ctx.letterSpacing = "2px";
    ctx.textAlign = "center";
    ctx.fillText(roleText, 540, 628);

    // 8. Player Full Name
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 64px 'Inter', sans-serif";
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 15;
    ctx.fillText(player.name.toUpperCase(), 540, 695);

    // 9. Winning Team Banner
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    this.roundRect(ctx, 160, 725, 760, 110, 20, true, false);
    ctx.strokeStyle = teamColor;
    ctx.lineWidth = 3;
    this.roundRect(ctx, 160, 725, 760, 110, 20, false, true);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "600 20px 'Inter', sans-serif";
    ctx.letterSpacing = "3px";
    ctx.fillText("PURCHASED BY", 540, 760);

    ctx.fillStyle = teamColor;
    ctx.font = "900 42px 'Inter', sans-serif";
    ctx.fillText(`${team.logoEmoji || '🏆'} ${team.name.toUpperCase()}`, 540, 810);

    // 10. Massive Winning Bid Gold Box
    const priceBoxY = 860;
    const priceGrad = ctx.createLinearGradient(200, priceBoxY, 880, priceBoxY + 110);
    priceGrad.addColorStop(0, "#FFB800");
    priceGrad.addColorStop(1, "#FF8A00");

    ctx.fillStyle = priceGrad;
    this.roundRect(ctx, 220, priceBoxY, 640, 115, 24, true, false);

    // Price Text
    ctx.fillStyle = "#0A0E1A";
    ctx.font = "900 60px 'Inter', sans-serif";
    ctx.letterSpacing = "1px";
    const formattedPrice = priceCr >= 1 ? `₹ ${priceCr.toFixed(2)} CRORE` : `₹ ${(priceCr * 100).toFixed(0)} LAKH`;
    ctx.fillText(formattedPrice, 540, priceBoxY + 75);

    // Footer Watermark
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "500 18px 'Inter', sans-serif";
    ctx.letterSpacing = "3px";
    ctx.fillText("OFFICIAL MEGA AUCTION BROADCAST", 540, 1025);

    return canvas;
  }

  // Helper to load image as Promise
  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = src;
    });
  }

  // Helper to draw rounded rectangle on canvas
  roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  // 1-Click Download High-Res PNG
  downloadPoster(canvas, filename = "cricket_auction_sold.png") {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}

window.auctionPoster = new AuctionPosterGenerator();
