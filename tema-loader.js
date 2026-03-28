// ══════════════════════════════════════════════════════
//  GEN-Z Tema & Reklam Loader  v1.0
//  Her sayfaya <script src="tema-loader.js"></script>
//  ile eklenir. Firestore platform_ayarlari/tema
//  dokümanından ayarları çekip canlı uygular.
// ══════════════════════════════════════════════════════

(async function genzTemaYukle() {
  try {
    const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const { getFirestore, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

    const cfg = {
      apiKey: "AIzaSyASkzJZdiW-Yj5HhxRub0UVtKPkERjCAVQ",
      authDomain: "gen-z-io.firebaseapp.com",
      projectId: "gen-z-io",
      storageBucket: "gen-z-io.firebasestorage.app",
      messagingSenderId: "97338868944",
      appId: "1:97338868944:web:d7b429e416d8c505b14ad5"
    };
    const app = getApps().length ? getApps()[0] : initializeApp(cfg);
    const db  = getFirestore(app);

    const snap = await getDoc(doc(db, 'platform_ayarlari', 'tema'));
    if (!snap.exists()) return;
    const t = snap.data();

    // ── 1. CSS DEĞİŞKENLERİ (renkler, fontlar) ──────────
    const root = document.documentElement;
    if (t.renkler) {
      const r = t.renkler;
      if (r.accent)   root.style.setProperty('--accent',   r.accent);
      if (r.accent2)  root.style.setProperty('--accent2',  r.accent2);
      if (r.accent3)  root.style.setProperty('--accent3',  r.accent3);
      if (r.bg)       root.style.setProperty('--bg',       r.bg);
      if (r.bg2)      root.style.setProperty('--bg2',      r.bg2);
      if (r.bg3)      root.style.setProperty('--bg3',      r.bg3);
      if (r.text)     root.style.setProperty('--text',     r.text);
      if (r.text2)    root.style.setProperty('--text2',    r.text2);
      if (r.border)   root.style.setProperty('--border',   r.border);
    }

    // ── 2. ARKA PLAN (renk | gradient | görsel) ─────────
    if (t.arkaplan) {
      const a = t.arkaplan;
      if (a.aktif) {
        let bgVal = '';
        if (a.tip === 'renk' && a.renk) {
          bgVal = a.renk;
        } else if (a.tip === 'gradient' && a.gradient) {
          bgVal = a.gradient;
        } else if (a.tip === 'gorsel' && a.gorselUrl) {
          bgVal = `url('${a.gorselUrl}') center/cover no-repeat fixed`;
        }
        if (bgVal) {
          document.body.style.background = bgVal;
          root.style.setProperty('--bg', a.tip === 'renk' ? a.renk : 'transparent');
        }
        if (a.tip === 'gorsel' && a.opasite !== undefined) {
          // Overlay ekle
          let overlay = document.getElementById('genz-bg-overlay');
          if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'genz-bg-overlay';
            overlay.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0;';
            document.body.prepend(overlay);
          }
          overlay.style.background = `rgba(0,0,0,${1 - (a.opasite || 0.85)})`;
        }
      }
    }

    // ── 3. NAVBAR ────────────────────────────────────────
    if (t.navbar) {
      const nb = t.navbar;
      const nav = document.querySelector('nav');
      if (nav) {
        if (nb.bgRenk) nav.style.background = nb.bgRenk;
        if (nb.opasite !== undefined) nav.style.opacity = nb.opasite;
      }
      if (nb.logoMetin) {
        const logo = document.querySelector('.nav-logo');
        if (logo) logo.textContent = nb.logoMetin;
      }
    }

    // ── 4. HERO / BANNER ALANLARI ────────────────────────
    if (t.heroBannerlar && Array.isArray(t.heroBannerlar)) {
      t.heroBannerlar.forEach(banner => {
        if (!banner.aktif || !banner.hedef) return;
        const el = document.querySelector(banner.hedef);
        if (!el) return;

        if (banner.bgTip === 'gorsel' && banner.gorselUrl) {
          el.style.backgroundImage = `url('${banner.gorselUrl}')`;
          el.style.backgroundSize = 'cover';
          el.style.backgroundPosition = 'center';
        } else if (banner.bgTip === 'gradient' && banner.gradient) {
          el.style.background = banner.gradient;
        } else if (banner.bgTip === 'renk' && banner.renk) {
          el.style.background = banner.renk;
        }

        if (banner.minYukseklik) el.style.minHeight = banner.minYukseklik;
        if (banner.opasite !== undefined) el.style.opacity = banner.opasite;
      });
    }

    // ── 5. REKLAM ALANLARI ───────────────────────────────
    if (t.reklamAlanlari && Array.isArray(t.reklamAlanlari)) {
      t.reklamAlanlari.forEach(rek => {
        if (!rek.aktif || !rek.alan) return;
        const el = document.getElementById(rek.alan);
        if (!el) return;

        el.style.display = 'block';
        if (rek.tip === 'gorsel' && rek.gorselUrl) {
          el.innerHTML = rek.link
            ? `<a href="${rek.link}" target="${rek.yeniSekme ? '_blank' : '_self'}" style="display:block;">
                <img src="${rek.gorselUrl}" alt="${rek.altText || 'Reklam'}" style="width:100%;height:auto;border-radius:inherit;display:block;"/>
               </a>`
            : `<img src="${rek.gorselUrl}" alt="${rek.altText || 'Reklam'}" style="width:100%;height:auto;border-radius:inherit;display:block;"/>`;
        } else if (rek.tip === 'html' && rek.html) {
          el.innerHTML = rek.html;
        } else if (rek.tip === 'metin' && rek.metin) {
          el.innerHTML = `<div style="padding:12px 16px;text-align:center;font-size:13px;">${rek.metin}</div>`;
        }

        if (rek.bgRenk) el.style.background = rek.bgRenk;
        if (rek.borderRadius) el.style.borderRadius = rek.borderRadius;
        if (rek.margin) el.style.margin = rek.margin;
      });
    }

    // ── 6. DUYURU BANNER (sitenin üstünde şerit) ────────
    if (t.duyuruBanner && t.duyuruBanner.aktif && t.duyuruBanner.metin) {
      const d = t.duyuruBanner;
      let duyuru = document.getElementById('genz-duyuru');
      if (!duyuru) {
        duyuru = document.createElement('div');
        duyuru.id = 'genz-duyuru';
        document.body.prepend(duyuru);
      }
      duyuru.style.cssText = `
        position:relative;z-index:200;
        background:${d.bgRenk || 'var(--accent)'};
        color:${d.textRenk || '#fff'};
        text-align:center;padding:8px 40px;
        font-size:13px;font-weight:600;
        ${d.link ? 'cursor:pointer;' : ''}
      `;
      duyuru.innerHTML = d.link
        ? `<a href="${d.link}" style="color:inherit;text-decoration:none;">${d.metin}</a>`
        : d.metin;
      if (d.kapatilabilir) {
        const x = document.createElement('button');
        x.textContent = '✕';
        x.style.cssText = 'position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:inherit;cursor:pointer;font-size:16px;opacity:.7;';
        x.onclick = () => duyuru.remove();
        duyuru.appendChild(x);
      }
    }

    // ── 7. ÖZEL CSS ENJEKTE ──────────────────────────────
    if (t.ozelCss) {
      const style = document.createElement('style');
      style.id = 'genz-ozel-css';
      style.textContent = t.ozelCss;
      document.head.appendChild(style);
    }

    // Tema yüklendi eventi
    window._genzTema = t;
    window.dispatchEvent(new CustomEvent('genzTemaYuklendi', { detail: t }));

  } catch(e) {
    console.warn('GEN-Z tema yüklenemedi:', e);
  }
})();
