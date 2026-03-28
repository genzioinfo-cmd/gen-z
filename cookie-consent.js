// GEN-Z Cookie Consent Modülü
// Tüm sayfalara <script src="cookie-consent.js"></script> ile eklenir (type="module" gerekmez)

(function() {
  const CONSENT_KEY = 'genz-cookie-consent';
  const CONSENT_VERSION = '1';

  // Zorunlu çerezler (kapatılamaz)
  const ZORUNLU = [
    { id: 'session',    ad: 'Oturum Çerezi',         aciklama: 'Giriş durumunu ve güvenliği korur. Siteyi kullanabilmek için zorunludur.' },
    { id: 'csrf',       ad: 'Güvenlik Çerezi',        aciklama: 'CSRF saldırılarına karşı koruma sağlar.' },
    { id: 'consent',    ad: 'Çerez Tercih Çerezi',    aciklama: 'Bu sayfadaki çerez tercihlerini hatırlar.' },
  ];

  // Opsiyonel çerezler (kullanıcı seçer)
  const OPSIYONEL = [
    { id: 'analytics',  ad: 'Analitik Çerezler',      aciklama: 'Sitenin nasıl kullanıldığını anlamamıza yardımcı olur. Kişisel veri içermez.', varsayilan: true },
    { id: 'sepet',      ad: 'Sepet & Favoriler',       aciklama: 'Sepetini ve favorilerini oturum boyunca hatırlar.', varsayilan: true },
    { id: 'tercihler',  ad: 'Kişiselleştirme',         aciklama: 'Tema, dil ve görünüm tercihlerini hatırlar.', varsayilan: true },
    { id: 'marketing',  ad: 'Pazarlama Çerezleri',     aciklama: 'Sana özel reklamlar göstermek için kullanılır. İstersen kapatabilirsin.', varsayilan: false },
  ];

  function mevcutOnay() {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (obj.version !== CONSENT_VERSION) return null;
      return obj;
    } catch { return null; }
  }

  function onayiKaydet(tercihler) {
    const obj = {
      version: CONSENT_VERSION,
      tarih: new Date().toISOString(),
      zorunlu: true,
      tercihler,
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(obj));
    window.dispatchEvent(new CustomEvent('genzCookieConsent', { detail: obj }));
    // Reddedilen opsiyonel çerezlerin localStorage verilerini temizle
    if (!tercihler.sepet) {
      // sepet ve favorileri temizleme — sadece yeni veri eklenmesini engelle
      window._genzCookieSepetIzin = false;
    } else {
      window._genzCookieSepetIzin = true;
    }
    if (!tercihler.tercihler) {
      localStorage.removeItem('genz-tema');
      localStorage.removeItem('genz-dil');
    }
    if (!tercihler.marketing) {
      localStorage.removeItem('genz-marketing');
    }
  }

  function hepsiniKabul() {
    const t = {};
    OPSIYONEL.forEach(c => t[c.id] = true);
    onayiKaydet(t);
    bannerKapat();
  }

  function hepsiniReddet() {
    const t = {};
    OPSIYONEL.forEach(c => t[c.id] = false);
    onayiKaydet(t);
    bannerKapat();
  }

  function seciliKaydet() {
    const t = {};
    OPSIYONEL.forEach(c => {
      const el = document.getElementById('genz-cookie-' + c.id);
      t[c.id] = el ? el.checked : c.varsayilan;
    });
    onayiKaydet(t);
    bannerKapat();
  }

  function bannerKapat() {
    const el = document.getElementById('genz-cookie-banner');
    if (el) { el.style.opacity = '0'; el.style.transform = 'translateY(20px)'; setTimeout(() => el.remove(), 350); }
    const ov = document.getElementById('genz-cookie-overlay');
    if (ov) ov.remove();
  }

  function detayAc() {
    document.getElementById('genz-cookie-simple').style.display = 'none';
    document.getElementById('genz-cookie-detail').style.display = 'block';
  }

  function detayKapat() {
    document.getElementById('genz-cookie-simple').style.display = 'block';
    document.getElementById('genz-cookie-detail').style.display = 'none';
  }

  function bannerOlustur() {
    const style = document.createElement('style');
    style.textContent = `
      #genz-cookie-banner {
        position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
        z-index: 99999; width: min(520px, calc(100vw - 32px));
        background: #13131a; border: 1px solid #2e2e3f;
        border-radius: 18px; padding: 24px;
        box-shadow: 0 8px 48px rgba(123,92,240,0.25);
        font-family: 'DM Sans', system-ui, sans-serif;
        transition: opacity .35s, transform .35s;
      }
      #genz-cookie-banner h3 {
        margin: 0 0 8px; font-size: 1rem; font-weight: 700;
        color: #f0eeff; font-family: 'Syne', system-ui, sans-serif;
        display: flex; align-items: center; gap: 8px;
      }
      #genz-cookie-banner p {
        margin: 0 0 18px; font-size: .85rem; color: #9b97b8; line-height: 1.5;
      }
      .genz-cookie-btns { display: flex; gap: 8px; flex-wrap: wrap; }
      .genz-cookie-btn {
        flex: 1; min-width: 100px; padding: 10px 16px; border-radius: 10px;
        font-size: .82rem; font-weight: 600; cursor: pointer; border: none;
        transition: opacity .2s, transform .15s; white-space: nowrap;
      }
      .genz-cookie-btn:hover { opacity: .85; transform: translateY(-1px); }
      .genz-cookie-btn.primary { background: #7B5CF0; color: #fff; }
      .genz-cookie-btn.secondary { background: #22222f; color: #f0eeff; border: 1px solid #2e2e3f; }
      .genz-cookie-btn.ghost { background: transparent; color: #9b97b8; border: 1px solid #2e2e3f; flex: 0; }
      .genz-cookie-item {
        display: flex; align-items: flex-start; gap: 12px;
        padding: 12px 0; border-bottom: 1px solid #1c1c28;
      }
      .genz-cookie-item:last-child { border-bottom: none; }
      .genz-cookie-item-info { flex: 1; }
      .genz-cookie-item-info strong { display: block; font-size: .85rem; color: #f0eeff; margin-bottom: 2px; }
      .genz-cookie-item-info span { font-size: .78rem; color: #9b97b8; line-height: 1.4; }
      .genz-cookie-badge {
        font-size: .65rem; background: #22222f; border: 1px solid #2e2e3f;
        color: #5a5770; border-radius: 6px; padding: 2px 7px;
        white-space: nowrap; margin-top: 2px; display: inline-block;
      }
      .genz-toggle {
        position: relative; width: 40px; height: 22px; flex-shrink: 0; margin-top: 2px;
      }
      .genz-toggle input { opacity: 0; width: 0; height: 0; }
      .genz-toggle-slider {
        position: absolute; inset: 0; background: #2e2e3f;
        border-radius: 22px; cursor: pointer; transition: .2s;
      }
      .genz-toggle-slider:before {
        content: ''; position: absolute; width: 16px; height: 16px;
        left: 3px; top: 3px; background: #fff; border-radius: 50%; transition: .2s;
      }
      .genz-toggle input:checked + .genz-toggle-slider { background: #7B5CF0; }
      .genz-toggle input:checked + .genz-toggle-slider:before { transform: translateX(18px); }
      .genz-toggle input:disabled + .genz-toggle-slider { opacity: .5; cursor: not-allowed; }
      #genz-cookie-detail { display: none; }
      .genz-cookie-scroll { max-height: 260px; overflow-y: auto; margin-bottom: 16px; }
      .genz-cookie-scroll::-webkit-scrollbar { width: 4px; }
      .genz-cookie-scroll::-webkit-scrollbar-track { background: transparent; }
      .genz-cookie-scroll::-webkit-scrollbar-thumb { background: #2e2e3f; border-radius: 4px; }
      .genz-cookie-back { background: none; border: none; color: #7B5CF0; cursor: pointer; font-size: .82rem; margin-bottom: 12px; padding: 0; display: flex; align-items: center; gap: 4px; }
    `;
    document.head.appendChild(style);

    // Opsiyonel çerez satırları
    const opsiyonelHTML = OPSIYONEL.map(c => `
      <div class="genz-cookie-item">
        <div class="genz-cookie-item-info">
          <strong>${c.ad}</strong>
          <span>${c.aciklama}</span>
        </div>
        <label class="genz-toggle">
          <input type="checkbox" id="genz-cookie-${c.id}" ${c.varsayilan ? 'checked' : ''}>
          <span class="genz-toggle-slider"></span>
        </label>
      </div>
    `).join('');

    const zorunluHTML = ZORUNLU.map(c => `
      <div class="genz-cookie-item">
        <div class="genz-cookie-item-info">
          <strong>${c.ad}</strong>
          <span>${c.aciklama}</span>
          <span class="genz-cookie-badge">Zorunlu</span>
        </div>
        <label class="genz-toggle">
          <input type="checkbox" checked disabled>
          <span class="genz-toggle-slider"></span>
        </label>
      </div>
    `).join('');

    const banner = document.createElement('div');
    banner.id = 'genz-cookie-banner';
    banner.innerHTML = `
      <div id="genz-cookie-simple">
        <h3>🍪 Çerez Tercihleri</h3>
        <p>Siteyi düzgün çalıştırmak için zorunlu çerezler kullanıyoruz. Analitik, sepet ve kişiselleştirme çerezleri için tercihini belirle.</p>
        <div class="genz-cookie-btns">
          <button class="genz-cookie-btn primary" onclick="window._genzCookie.hepsiniKabul()">Tümünü Kabul Et</button>
          <button class="genz-cookie-btn secondary" onclick="window._genzCookie.hepsiniReddet()">Yalnızca Zorunlu</button>
          <button class="genz-cookie-btn ghost" onclick="window._genzCookie.detayAc()">Özelleştir ›</button>
        </div>
      </div>
      <div id="genz-cookie-detail">
        <button class="genz-cookie-back" onclick="window._genzCookie.detayKapat()">‹ Geri</button>
        <h3>🍪 Çerez Ayarları</h3>
        <div class="genz-cookie-scroll">
          <p style="font-size:.75rem;color:#5a5770;margin:0 0 8px">— Zorunlu —</p>
          ${zorunluHTML}
          <p style="font-size:.75rem;color:#5a5770;margin:12px 0 8px">— Opsiyonel —</p>
          ${opsiyonelHTML}
        </div>
        <div class="genz-cookie-btns">
          <button class="genz-cookie-btn primary" onclick="window._genzCookie.seciliKaydet()">Seçilenleri Kaydet</button>
          <button class="genz-cookie-btn secondary" onclick="window._genzCookie.hepsiniKabul()">Tümünü Kabul Et</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);
  }

  // ── Global API ──
  window._genzCookie = { hepsiniKabul, hepsiniReddet, seciliKaydet, detayAc, detayKapat, mevcutOnay };

  // ── Başlat ──
  function baslat() {
    if (mevcutOnay()) return; // Zaten onaylanmış
    bannerOlustur();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', baslat);
  } else {
    baslat();
  }
})();
