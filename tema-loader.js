// ══════════════════════════════════════════════════════
//  GEN-Z Tema Loader  v2.0  — Sayfa Bazlı
//  Her sayfa kendi Firestore dokümanından yüklenir:
//  platform_ayarlari / sayfa_{dosyaadi}
//  Örn: gen-z.html → platform_ayarlari/sayfa_gen-z
// ══════════════════════════════════════════════════════
(async function genzTemaYukle() {
  try {
    // Sayfa adını belirle: gen-z.html → gen-z
    const sayfaAdi = location.pathname.split('/').pop().replace('.html','') || 'gen-z';
    const docId    = 'sayfa_' + sayfaAdi;

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

    const snap = await getDoc(doc(db, 'platform_ayarlari', docId));
    if (!snap.exists()) return;
    const t = snap.data();

    _uygulaTemaDos(t);

    window._genzTema  = t;
    window._genzSayfa = sayfaAdi;
    window.dispatchEvent(new CustomEvent('genzTemaYuklendi', { detail: t }));
  } catch(e) {
    console.warn('GEN-Z tema yüklenemedi:', e);
  }
})();

function _uygulaTemaDos(t) {
  const root = document.documentElement;

  // ── 1. RENKLER ──────────────────────────────────────
  if (t.renkler) {
    const r = t.renkler;
    const setVar = (k, v) => v && root.style.setProperty(k, v);
    setVar('--accent',  r.accent);  setVar('--accent2', r.accent2);
    setVar('--accent3', r.accent3); setVar('--bg',      r.bg);
    setVar('--bg2',     r.bg2);     setVar('--bg3',     r.bg3);
    setVar('--text',    r.text);    setVar('--text2',   r.text2);
    setVar('--border',  r.border);
  }

  // ── 2. NAVBAR ────────────────────────────────────────
  if (t.navbar?.aktif) {
    const nb = t.navbar;
    const nav = document.querySelector('nav');
    if (nav) {
      if (nb.bgRenk) nav.style.background = nb.bgRenk;
      if (nb.blur !== undefined) nav.style.backdropFilter = `blur(${nb.blur}px)`;
    }
    if (nb.logoMetin) {
      const logo = document.querySelector('.nav-logo');
      if (logo && logo.childElementCount === 0) logo.textContent = nb.logoMetin;
    }
  }

  // ── 3. ARKA PLAN ────────────────────────────────────
  if (t.arkaplan?.aktif) {
    const a = t.arkaplan;
    if (a.tip === 'renk' && a.renk) {
      document.body.style.background = a.renk;
      root.style.setProperty('--bg', a.renk);
    } else if (a.tip === 'gradient' && a.gradient) {
      document.body.style.background = a.gradient;
    } else if (a.tip === 'gorsel' && a.gorselUrl) {
      document.body.style.background = `url('${a.gorselUrl}') center/cover no-repeat fixed`;
      // Overlay
      let ov = document.getElementById('_genz_bg_ov');
      if (!ov) { ov = Object.assign(document.createElement('div'), { id: '_genz_bg_ov' }); ov.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0;'; document.body.prepend(ov); }
      ov.style.background = `rgba(0,0,0,${1 - (a.opasite ?? 0.7)})`;
    }
  }

  // ── 4. HERO / BANNER ─────────────────────────────────
  if (t.hero?.aktif) {
    const h = t.hero;
    // Hedef: .hero, #hero, veya ilk büyük section
    const heroEl = document.querySelector('.hero, #hero, .page-hero, .landing-hero, section.hero');
    if (heroEl) {
      if (h.bgTip === 'gorsel' && h.gorselUrl) {
        heroEl.style.backgroundImage = `url('${h.gorselUrl}')`;
        heroEl.style.backgroundSize = 'cover';
        heroEl.style.backgroundPosition = 'center';
      } else if (h.bgTip === 'gradient' && h.gradient) {
        heroEl.style.background = h.gradient;
      } else if (h.bgTip === 'renk' && h.renk) {
        heroEl.style.background = h.renk;
      }
      if (h.minH) heroEl.style.minHeight = h.minH;
    }
    // Hero başlığı
    if (h.baslik) {
      const hb = heroEl?.querySelector('.hero-title, h1, .page-title');
      if (hb) hb.textContent = h.baslik;
    }
    // Hero alt yazısı
    if (h.altYazi) {
      const ha = heroEl?.querySelector('.hero-sub, .hero-subtitle, p');
      if (ha) ha.textContent = h.altYazi;
    }
    // Hero buton
    if (h.butonMetin) {
      const hbtn = heroEl?.querySelector('a.btn, button.btn, .hero-cta, .btn-primary');
      if (hbtn) {
        hbtn.textContent = h.butonMetin;
        if (h.butonLink) hbtn.href = h.butonLink;
      }
    }
  }

  // ── 5. DUYURU BANDI ──────────────────────────────────
  if (t.duyuru?.aktif && t.duyuru?.metin) {
    const d = t.duyuru;
    let du = document.getElementById('_genz_duyuru');
    if (!du) {
      du = document.createElement('div');
      du.id = '_genz_duyuru';
      document.body.prepend(du);
    }
    du.style.cssText = `position:relative;z-index:200;background:${d.bgRenk||'var(--accent)'};color:${d.textRenk||'#fff'};text-align:center;padding:8px 40px;font-size:13px;font-weight:600;`;
    du.innerHTML = d.link ? `<a href="${d.link}" style="color:inherit;text-decoration:none;">${d.metin}</a>` : d.metin;
    if (d.kapatilabilir) {
      const x = document.createElement('button');
      x.innerHTML = '✕';
      x.style.cssText = 'position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:inherit;cursor:pointer;font-size:16px;opacity:.7;';
      x.onclick = () => du.remove();
      du.appendChild(x);
    }
  }

  // ── 6. REKLAM ALANLARI ───────────────────────────────
  if (t.reklamlar && Array.isArray(t.reklamlar)) {
    t.reklamlar.forEach(r => {
      if (!r.aktif || !r.alanId) return;
      const el = document.getElementById(r.alanId);
      if (!el) return;
      el.style.display = 'block';
      if (r.tip === 'gorsel' && r.gorselUrl) {
        el.innerHTML = r.link
          ? `<a href="${r.link}" target="${r.yeniSekme?'_blank':'_self'}"><img src="${r.gorselUrl}" alt="${r.altText||''}" style="width:100%;height:auto;border-radius:inherit;display:block;"/></a>`
          : `<img src="${r.gorselUrl}" alt="${r.altText||''}" style="width:100%;height:auto;border-radius:inherit;display:block;"/>`;
      } else if (r.tip === 'html' && r.html) {
        el.innerHTML = r.html;
      } else if (r.tip === 'metin' && r.metin) {
        el.innerHTML = `<div style="padding:12px 16px;text-align:center;">${r.metin}</div>`;
      }
      if (r.bgRenk) el.style.background = r.bgRenk;
      if (r.radius) el.style.borderRadius = r.radius;
      if (r.margin) el.style.margin = r.margin;
    });
  }

  // ── 7. ÖZEL CSS ──────────────────────────────────────
  if (t.ozelCss) {
    const s = document.createElement('style');
    s.id = '_genz_ozel_css';
    s.textContent = t.ozelCss;
    document.head.appendChild(s);
  }
}
