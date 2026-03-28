/**
 * GEN-Z Modpanel — Stok Yönetimi + Finansal Danışman + Vergi Takvimi
 * modpanel-stok.js  |  type="module"
 */

import {
  getFirestore, collection, query, where, getDocs,
  doc, updateDoc, getDoc, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const db = getFirestore();

// ── QR kütüphanesi (CDN) ─────────────────────────────────────────────────
function loadQRLib() {
  return new Promise(resolve => {
    if (window.QRCode) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    s.onload = resolve; document.head.appendChild(s);
  });
}

// ── Global state ──────────────────────────────────────────────────────────
let _stokListesi   = [];
let _stokFiltre    = 'hepsi';
let _stokAramaTxt  = '';
let _aktifStokId   = null;
let _stokSatinAldi = false; // TODO: Firestore'dan oku

// ── Yardımcı ─────────────────────────────────────────────────────────────
function para(n) { return Number(n || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function bugun() { return new Date(); }
function gunFarki(hedef) {
  const fark = new Date(hedef) - bugun();
  return Math.ceil(fark / 86400000);
}

// ═══════════════════════════════════════════════════════════════════════════
//  STOK YÖNETİMİ
// ═══════════════════════════════════════════════════════════════════════════

window.stokModulYukle = async function () {
  const mag = window._magaza;
  if (!mag) return;

  // Satın alma durumu kontrolü (Firestore'da stokModul alanı)
  try {
    const mSnap = await getDoc(doc(db, 'magazalar', mag.id));
    _stokSatinAldi = mSnap.data()?.stokModul === true;
  } catch (e) { _stokSatinAldi = false; }

  // Kilit banner
  const banner = document.getElementById('stokKilitDiv');
  if (banner) banner.style.display = _stokSatinAldi ? 'none' : 'flex';

  // Ürünleri çek (_urunler zaten yüklü olabilir, yoksa tekrar çek)
  _stokListesi = window._urunler || [];
  if (!_stokListesi.length) {
    try {
      const snap = await getDocs(query(
        collection(db, 'magaza_urunler'),
        where('magazaId', '==', mag.id)
      ));
      _stokListesi = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) { _stokListesi = []; }
  }

  stokOzetGuncelle();
  stokRenderTablo();
};

function stokOzetGuncelle() {
  const liste = _stokListesi;
  const toplam  = liste.length;
  const adet    = liste.reduce((t, u) => t + (u.stok || 0), 0);
  const kritik  = liste.filter(u => (u.stok || 0) <= (u.stokEsik || 5) && (u.stok || 0) > 0).length;
  const bitti   = liste.filter(u => (u.stok || 0) === 0).length;
  const deger   = liste.reduce((t, u) => t + (u.fiyat || 0) * (u.stok || 0), 0);

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('stkToplamUrun',  toplam);
  set('stkToplamAdet', adet.toLocaleString('tr-TR'));
  set('stkKritikSay',  kritik + bitti);
  set('stkDeger',      '₺' + para(deger));

  // Badge
  const badge = document.getElementById('stokKritikBadge');
  if (badge) {
    const uyari = kritik + bitti;
    badge.textContent = uyari || '';
    badge.style.display = uyari ? 'inline-flex' : 'none';
  }
}

function stokRenderTablo() {
  const tbody = document.getElementById('stokGovde');
  if (!tbody) return;

  let liste = [..._stokListesi];

  // Filtre
  if (_stokFiltre === 'kritik') liste = liste.filter(u => (u.stok || 0) > 0 && (u.stok || 0) <= (u.stokEsik || 5));
  else if (_stokFiltre === 'bitti') liste = liste.filter(u => (u.stok || 0) === 0);
  else if (_stokFiltre === 'normal') liste = liste.filter(u => (u.stok || 0) > (u.stokEsik || 5));

  // Arama
  if (_stokAramaTxt) {
    const q = _stokAramaTxt.toLowerCase();
    liste = liste.filter(u => (u.ad || '').toLowerCase().includes(q) || (u.sku || '').toLowerCase().includes(q));
  }

  if (!liste.length) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:2rem;color:var(--t2);font-style:italic;">Ürün bulunamadı</td></tr>`;
    return;
  }

  tbody.innerHTML = liste.map(u => {
    const stok   = u.stok ?? 0;
    const esik   = u.stokEsik ?? 5;
    const fiyat  = u.fiyat ?? 0;
    const deger  = fiyat * stok;
    const rafKod = [u.rafBolge, u.rafNo, u.rafGoz].filter(Boolean).join('-') || '—';
    const sku    = u.sku || '—';
    const barkod = u.barkod || '—';

    let durumRenk, durumTxt, rowClass = '';
    if (stok === 0)        { durumRenk = '#666'; durumTxt = '⚫ Bitti';   rowClass = 'stok-row-bitti'; }
    else if (stok <= esik) { durumRenk = '#ff6b6b'; durumTxt = '🔴 Kritik'; rowClass = 'stok-row-kritik'; }
    else                   { durumRenk = '#5CF0B4'; durumTxt = '🟢 Normal'; }

    const kilitClass = _stokSatinAldi ? '' : 'style="opacity:.4;pointer-events:none;"';

    return `<tr class="${rowClass}">
      <td style="text-align:center;font-size:20px;">${u.resimler?.[0] ? `<img src="${u.resimler[0]}" style="width:32px;height:32px;object-fit:cover;border-radius:4px;">` : '📦'}</td>
      <td>
        <div style="font-weight:600;font-size:.72rem;color:var(--cream);max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${u.ad || '—'}</div>
        <div style="font-size:.58rem;color:var(--t2);">${u.kategori || '—'}</div>
      </td>
      <td style="font-family:monospace;font-size:.62rem;">
        <div style="color:var(--gold);">${sku}</div>
        <div style="color:var(--t2);font-size:.55rem;">${barkod !== '—' ? barkod : ''}</div>
      </td>
      <td>
        <span style="background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.18);border-radius:4px;padding:.2rem .6rem;font-size:.62rem;font-family:monospace;color:var(--gold);">
          ${rafKod}
        </span>
      </td>
      <td style="text-align:center;">
        <span style="font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:700;color:${stok===0?'#666':stok<=esik?'#ff6b6b':'var(--cream)'};">${stok}</span>
        <div style="font-size:.56rem;color:var(--t2);">/ eşik: ${esik}</div>
      </td>
      <td style="text-align:center;font-size:.65rem;color:var(--t2);">${esik}</td>
      <td style="font-size:.68rem;color:var(--cream);">₺${para(fiyat)}</td>
      <td style="font-size:.68rem;color:var(--gold);font-weight:600;">₺${para(deger)}</td>
      <td><span style="font-size:.58rem;font-weight:700;color:${durumRenk};">${durumTxt}</span></td>
      <td>
        <div style="display:flex;gap:.3rem;">
          <button class="aksiyon duz" onclick="stokDuzenleAc('${u.id}')" style="font-size:.52rem;padding:.25rem .7rem;">✏️ Düzenle</button>
          ${_stokSatinAldi ? `<button class="aksiyon duz" onclick="stokQRAc('${u.id}')" style="font-size:.52rem;padding:.25rem .5rem;color:#a78bfa;border-color:rgba(167,139,250,.3);">📱 QR</button>` : ''}
        </div>
      </td>
    </tr>`;
  }).join('');
}

window.stokFiltreFn = function (tip, btn) {
  _stokFiltre = tip;
  document.querySelectorAll('#sayfa-stok .filtre-row .f-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  stokRenderTablo();
};

window.stokAraFn = function (val) {
  _stokAramaTxt = val;
  stokRenderTablo();
};

window.stokYenile = async function () {
  _stokListesi = [];
  await window.stokModulYukle();
};

// ── CSV Dışa Aktarma ─────────────────────────────────────────────────────
window.stokCSV = function () {
  const baslik = ['Ürün Adı', 'SKU', 'Barkod', 'Raf Bölge', 'Raf No', 'Raf Göz', 'Stok', 'Eşik', 'Fiyat (₺)', 'Stok Değeri (₺)', 'Durum', 'Depo Notu'];
  const satirlar = _stokListesi.map(u => {
    const stok = u.stok ?? 0;
    const esik = u.stokEsik ?? 5;
    const durum = stok === 0 ? 'Bitti' : stok <= esik ? 'Kritik' : 'Normal';
    return [
      `"${u.ad || ''}"`, u.sku || '', u.barkod || '',
      u.rafBolge || '', u.rafNo || '', u.rafGoz || '',
      stok, esik, u.fiyat || 0, (u.fiyat || 0) * stok, durum,
      `"${(u.depNot || '').replace(/"/g, '""')}"`
    ].join(',');
  });
  const csv = '\uFEFF' + [baslik.join(','), ...satirlar].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `stok_${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
};

// ── Stok Düzenle Modal ───────────────────────────────────────────────────
window.stokDuzenleAc = function (id) {
  const u = _stokListesi.find(x => x.id === id);
  if (!u) return;
  _aktifStokId = id;

  document.getElementById('stokModalBaslik').textContent = u.ad || 'Stok Düzenle';
  document.getElementById('stokModalSku').textContent    = u.sku ? `SKU: ${u.sku}` : '';
  document.getElementById('smBolge').value  = u.rafBolge || '';
  document.getElementById('smRaf').value    = u.rafNo    || '';
  document.getElementById('smGoz').value    = u.rafGoz   || '';
  document.getElementById('smStok').value   = u.stok     ?? 0;
  document.getElementById('smEsik').value   = u.stokEsik ?? 5;
  document.getElementById('smSku').value    = u.sku      || '';
  document.getElementById('smBarkod').value = u.barkod   || '';
  document.getElementById('smNot').value    = u.depNot   || '';

  const errEl = document.getElementById('stokModalErr');
  if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }

  const qrDiv = document.getElementById('qrBarkodAlani');
  if (qrDiv) qrDiv.style.display = 'none';

  rafOnizle();
  document.getElementById('stokModal').classList.add('open');
};

window.stokModalKapat = function (e) {
  if (e && e.target !== document.getElementById('stokModal')) return;
  document.getElementById('stokModal').classList.remove('open');
  _aktifStokId = null;
};

window.smStokDeg = function (delta) {
  const inp = document.getElementById('smStok');
  inp.value = Math.max(0, (parseInt(inp.value) || 0) + delta);
};

window.rafOnizle = function () {
  const b = document.getElementById('smBolge').value.trim().toUpperCase();
  const r = document.getElementById('smRaf').value.trim();
  const g = document.getElementById('smGoz').value.trim().toUpperCase();
  const div = document.getElementById('rafOnizleDiv');
  const txt = document.getElementById('rafOnizleTxt');
  if (b || r || g) {
    const kod = [b, r, g].filter(Boolean).join('-');
    txt.textContent = kod;
    div.style.display = 'block';
  } else {
    div.style.display = 'none';
  }
};

// ── SKU & Barkod Üreteci ─────────────────────────────────────────────────
window.skuUret = function () {
  const mag = (window._magaza?.ad || 'GNZ').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
  const no  = String(Math.floor(Math.random() * 9000) + 1000);
  document.getElementById('smSku').value = `${mag}-${no}`;
};

window.barkodUret = function () {
  // EAN-13 formatında rastgele barkod
  let digits = '20'; // dahili kullanım prefiksi
  for (let i = 0; i < 10; i++) digits += Math.floor(Math.random() * 10);
  // Kontrol hanesi hesapla
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(digits[i]) * (i % 2 === 0 ? 1 : 3);
  const check = (10 - (sum % 10)) % 10;
  document.getElementById('smBarkod').value = digits + check;
};

// ── QR Kod ──────────────────────────────────────────────────────────────
window.stokQRAc = function (id) {
  stokDuzenleAc(id);
  setTimeout(() => qrGoster(), 300);
};

window.qrGoster = async function () {
  await loadQRLib();
  const sku    = document.getElementById('smSku').value.trim();
  const barkod = document.getElementById('smBarkod').value.trim();
  const urunAd = document.getElementById('stokModalBaslik').textContent;
  const rafKod = [
    document.getElementById('smBolge').value.trim().toUpperCase(),
    document.getElementById('smRaf').value.trim(),
    document.getElementById('smGoz').value.trim().toUpperCase()
  ].filter(Boolean).join('-');

  const qrVerisi = JSON.stringify({ sku, barkod, urun: urunAd, raf: rafKod, site: 'gen-z.io' });

  const div = document.getElementById('qrBarkodAlani');
  div.style.display = 'block';

  const canvas = document.getElementById('qrCanvas');
  canvas.style.display = 'block';
  document.getElementById('barkodSvgDiv').innerHTML = '';

  // QRCode.js ile çiz
  const qrDiv = document.createElement('div');
  try {
    new QRCode(qrDiv, {
      text: qrVerisi, width: 180, height: 180,
      colorDark: '#1a1830', colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
    const img = qrDiv.querySelector('img');
    if (img) {
      img.onload = () => {
        const ctx = canvas.getContext('2d');
        canvas.width = 180; canvas.height = 180;
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 180, 180);
        ctx.drawImage(img, 0, 0, 180, 180);
      };
    }
  } catch (e) { canvas.style.display = 'none'; }

  document.getElementById('qrUrunAd').textContent = `${urunAd}${sku ? ' | ' + sku : ''}${rafKod ? ' | 📍 ' + rafKod : ''}`;

  // Barkod SVG (basit stripes)
  if (barkod) barkodSvgCiz(barkod);
};

window.barkodGoster = function () {
  const barkod = document.getElementById('smBarkod').value.trim();
  if (!barkod) { toast('Önce barkod numarası girin veya üretin.', 'err'); return; }
  const div = document.getElementById('qrBarkodAlani');
  div.style.display = 'block';
  document.getElementById('qrCanvas').style.display = 'none';
  barkodSvgCiz(barkod);
  document.getElementById('qrUrunAd').textContent = barkod;
};

function barkodSvgCiz(digits) {
  // EAN-13 tarzı görsel (basitleştirilmiş çizgi temsili)
  const svgDiv = document.getElementById('barkodSvgDiv');
  const W = 220, H = 80;
  let bars = '';
  let x = 10;
  const barW = (W - 20) / (digits.length * 4);
  for (let i = 0; i < digits.length; i++) {
    const n = parseInt(digits[i]);
    const thick = barW * (1 + (n % 3) * 0.5);
    bars += `<rect x="${x}" y="5" width="${thick}" height="${H - 20}" fill="#1a1830"/>`;
    x += thick + barW * 0.6;
    bars += `<rect x="${x}" y="5" width="${barW * 0.4}" height="${H - 20}" fill="white"/>`;
    x += barW * 0.7;
  }
  svgDiv.innerHTML = `<svg width="${W}" height="${H}" style="background:#fff;border-radius:4px;" xmlns="http://www.w3.org/2000/svg">
    ${bars}
    <text x="${W/2}" y="${H-4}" text-anchor="middle" font-size="10" font-family="monospace" fill="#1a1830">${digits}</text>
  </svg>`;
}

window.qrIndir = function () {
  const canvas = document.getElementById('qrCanvas');
  const svg    = document.getElementById('barkodSvgDiv').querySelector('svg');
  const urunAd = document.getElementById('stokModalBaslik').textContent.replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ]/g, '_');

  if (canvas && canvas.style.display !== 'none' && canvas.width > 0) {
    const a = document.createElement('a');
    a.download = `qr_${urunAd}.png`;
    a.href = canvas.toDataURL();
    a.click();
  } else if (svg) {
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.download = `barkod_${urunAd}.svg`;
    a.href = URL.createObjectURL(blob);
    a.click();
    URL.revokeObjectURL(a.href);
  }
};

// ── Kaydet ───────────────────────────────────────────────────────────────
window.stokKaydet = async function () {
  if (!_aktifStokId) return;
  const errEl = document.getElementById('stokModalErr');

  const guncelleme = {
    rafBolge  : document.getElementById('smBolge').value.trim().toUpperCase() || null,
    rafNo     : document.getElementById('smRaf').value.trim() || null,
    rafGoz    : document.getElementById('smGoz').value.trim().toUpperCase() || null,
    stok      : parseInt(document.getElementById('smStok').value) || 0,
    stokEsik  : parseInt(document.getElementById('smEsik').value) || 5,
    sku       : document.getElementById('smSku').value.trim() || null,
    barkod    : document.getElementById('smBarkod').value.trim() || null,
    depNot    : document.getElementById('smNot').value.trim() || null,
    stokGuncellendi: serverTimestamp()
  };

  try {
    await updateDoc(doc(db, 'magaza_urunler', _aktifStokId), guncelleme);

    // Local güncelle
    const idx = _stokListesi.findIndex(u => u.id === _aktifStokId);
    if (idx > -1) Object.assign(_stokListesi[idx], guncelleme);
    if (window._urunler) {
      const idx2 = window._urunler.findIndex(u => u.id === _aktifStokId);
      if (idx2 > -1) Object.assign(window._urunler[idx2], guncelleme);
    }

    stokOzetGuncelle();
    stokRenderTablo();
    document.getElementById('stokModal').classList.remove('open');
    toast('✦ Stok bilgisi kaydedildi!');
  } catch (e) {
    if (errEl) { errEl.textContent = 'Kayıt hatası: ' + e.message; errEl.style.display = 'block'; }
  }
};

// ── 600₺ Satın Al ────────────────────────────────────────────────────────
window.stokSatinAl = function () {
  // Gerçek ödeme entegrasyonuna bağlanacak
  toast('Ödeme altyapısı yakında aktif olacak. Şimdilik demo modunda devam edebilirsiniz.', 'gold');
  // Demo: aktif et
  _stokSatinAldi = true;
  const banner = document.getElementById('stokKilitDiv');
  if (banner) banner.style.display = 'none';
  stokRenderTablo();
};


// ═══════════════════════════════════════════════════════════════════════════
//  FİNANSAL DANIŞMAN
// ═══════════════════════════════════════════════════════════════════════════

window.danismanYukle = function () {
  danAnalizYukle();
  danOnerilerYukle();
};

window.danHesapla = function () {
  const maliyet = parseFloat(document.getElementById('danMaliyet')?.value) || 0;
  const gider   = parseFloat(document.getElementById('danGider')?.value) || 0;
  const marj    = parseFloat(document.getElementById('danMarj')?.value) || 20;
  const kdvOran = parseFloat(document.getElementById('danKdv')?.value) || 20;

  const sonuc  = document.getElementById('danSonuc');
  const icerik = document.getElementById('danSonucIcerik');
  if (!maliyet) { sonuc.style.display = 'none'; return; }

  const toplamMaliyet  = maliyet + gider;
  const kar            = toplamMaliyet * (marj / 100);
  const satisFiyati    = toplamMaliyet + kar; // KDV hariç
  const kdvTutar       = satisFiyati * (kdvOran / 100);
  const kdvDahil       = satisFiyati + kdvTutar;
  const komisyon       = kdvDahil * 0.10;
  const eldeGecan      = kdvDahil - kdvTutar - komisyon;
  const gercekKar      = eldeGecan - toplamMaliyet;
  const gercekMarj     = toplamMaliyet > 0 ? (gercekKar / toplamMaliyet * 100) : 0;

  const satir = (lbl, val, renk = 'var(--cream)') =>
    `<div class="dan-sonuc-row"><span style="color:var(--t2)">${lbl}</span><span class="dan-sonuc-val" style="color:${renk}">${val}</span></div>`;

  icerik.innerHTML = `
    ${satir('Toplam Maliyet (ürün + gider)',  '₺' + para(toplamMaliyet))}
    ${satir('Hedef Kâr (%' + marj + ')',       '₺' + para(kar), 'var(--accent3)')}
    ${satir('KDV Hariç Satış Fiyatı',          '₺' + para(satisFiyati), 'var(--gold)')}
    ${satir('KDV Tutarı (%' + kdvOran + ')',   '₺' + para(kdvTutar), 'var(--orange)')}
    <div class="dan-sonuc-row" style="border-top:1px solid rgba(201,168,76,.2);margin-top:.4rem;padding-top:.8rem;">
      <span style="font-weight:700;color:var(--cream);">🏷️ Müşteriye Satış Fiyatı (KDV dahil)</span>
      <span style="font-family:'Syne',sans-serif;font-size:1.3rem;font-weight:800;color:var(--gold);">₺${para(kdvDahil)}</span>
    </div>
    ${satir('Platform Komisyonu (%10)',         '−₺' + para(komisyon), '#ff6b6b')}
    ${satir('Elinize Geçen Net',                '₺' + para(eldeGecan), 'var(--accent3)')}
    <div class="dan-sonuc-row" style="border-top:1px solid rgba(92,240,180,.2);margin-top:.4rem;padding-top:.8rem;">
      <span style="font-weight:700;color:var(--cream);">💚 Gerçek Kâr</span>
      <span style="font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:800;color:${gercekKar>=0?'var(--accent3)':'#ff6b6b'};">₺${para(gercekKar)} <span style="font-size:.65rem;opacity:.7;">(Gerçek marj: %${gercekMarj.toFixed(1)})</span></span>
    </div>
    ${gercekKar < 0 ? '<div style="background:rgba(240,80,80,.08);border:1px solid rgba(240,80,80,.2);border-radius:6px;padding:.7rem;font-size:.65rem;color:#ff6b6b;margin-top:.6rem;">⚠️ Bu fiyatla zarar ediyorsunuz! Maliyeti düşürün veya satış fiyatını artırın.</div>' : ''}
    ${gercekMarj < 10 && gercekKar >= 0 ? '<div style="background:rgba(240,197,92,.06);border:1px solid rgba(240,197,92,.2);border-radius:6px;padding:.7rem;font-size:.65rem;color:var(--gold);margin-top:.6rem;">💡 Kâr marjı düşük. Giderleri optimize etmeyi veya fiyatı %' + Math.ceil(15 - gercekMarj) + ' artırmayı düşünün.</div>' : ''}
  `;
  sonuc.style.display = 'block';
};

function danAnalizYukle() {
  const el = document.getElementById('danAnalizIcerik');
  if (!el) return;
  const siparisler = window._siparisler || [];
  if (!siparisler.length) {
    el.innerHTML = '<div style="color:var(--t2);font-size:.7rem;font-style:italic;">Henüz sipariş verisi yok.</div>';
    return;
  }

  const tamamlanan = siparisler.filter(s => s.durum === 'tamamlandi');
  const brut       = tamamlanan.reduce((t, s) => t + (s.toplam || 0), 0);
  const kdv        = tamamlanan.reduce((t, s) => t + ((s.toplam || 0) * ((s.kdvOran || 20) / 120)), 0);
  const komisyon   = brut * 0.10;
  const net        = brut - kdv - komisyon;
  const ortSiparis = tamamlanan.length ? brut / tamamlanan.length : 0;

  // Bu ay
  const simdi    = new Date();
  const buAy     = tamamlanan.filter(s => {
    const t = s.ts?.toDate?.();
    return t && t.getMonth() === simdi.getMonth() && t.getFullYear() === simdi.getFullYear();
  });
  const buAyBrut = buAy.reduce((t, s) => t + (s.toplam || 0), 0);

  el.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:.7rem;">
      <div class="stk-k"><div class="stk-n" style="font-size:1.2rem;color:var(--accent3);">₺${para(brut)}</div><div class="stk-l">Toplam Brüt Gelir</div></div>
      <div class="stk-k"><div class="stk-n" style="font-size:1.2rem;color:#ff6b6b;">₺${para(kdv)}</div><div class="stk-l">Ödenecek KDV</div></div>
      <div class="stk-k"><div class="stk-n" style="font-size:1.2rem;color:var(--orange);">₺${para(komisyon)}</div><div class="stk-l">Platform Komisyonu</div></div>
      <div class="stk-k"><div class="stk-n" style="font-size:1.2rem;color:var(--gold);">₺${para(net)}</div><div class="stk-l">Net Kazanç</div></div>
      <div class="stk-k"><div class="stk-n" style="font-size:1.2rem;">₺${para(ortSiparis)}</div><div class="stk-l">Ort. Sipariş Değeri</div></div>
      <div class="stk-k"><div class="stk-n" style="font-size:1.2rem;color:var(--accent3);">₺${para(buAyBrut)}</div><div class="stk-l">Bu Ayın Geliri</div></div>
    </div>
    <div style="margin-top:1rem;font-size:.62rem;color:var(--t2);">
      📌 KDV ve komisyon düşüldükten sonra elde ettiğiniz net kazanç <strong style="color:var(--gold)">₺${para(net)}</strong>'dir.
      Vergi beyanname dönemlerinde KDV tutarını <strong style="color:#ff6b6b">₺${para(kdv)}</strong> olarak beyan etmeniz gerekecek.
    </div>
  `;
}

function danOnerilerYukle() {
  const el = document.getElementById('danOneriler');
  if (!el) return;
  const urunler    = window._urunler || [];
  const siparisler = window._siparisler || [];
  const oneriler   = [];

  // Kritik stok uyarısı
  const kritik = urunler.filter(u => (u.stok || 0) <= (u.stokEsik || 5) && (u.stok || 0) > 0);
  if (kritik.length) oneriler.push({ ikon: '⚠️', renk: '#ff6b6b', baslik: `${kritik.length} ürününüzün stoğu kritik seviyede`, aciklama: kritik.slice(0,3).map(u => u.ad).join(', ') + (kritik.length>3?'…':'')+' — Hızla stok yenileyin.' });

  // Stok biten
  const biten = urunler.filter(u => (u.stok || 0) === 0);
  if (biten.length) oneriler.push({ ikon: '⚫', renk: '#888', baslik: `${biten.length} ürününüzün stoğu tükendi`, aciklama: 'Satışta gözüken ama stoğu sıfır olan ürünler müşteri deneyimini olumsuz etkiler. Pasife alın veya stok girin.' });

  // Düşük fiyat uyarısı
  const dusuk = urunler.filter(u => u.fiyat && u.fiyat < 30);
  if (dusuk.length) oneriler.push({ ikon: '💡', renk: 'var(--gold)', baslik: 'Bazı ürünlerinizin fiyatı çok düşük olabilir', aciklama: 'KDV + platform komisyonu sonrası kâr marjınızı kontrol edin. Fiyat Hesaplayıcı\'yı kullanın.' });

  // KDV tavsiyesi
  const brut = siparisler.filter(s=>s.durum==='tamamlandi').reduce((t,s)=>t+(s.toplam||0),0);
  if (brut > 30000) oneriler.push({ ikon: '🏛️', renk: 'var(--accent)', baslik: 'Cironuz KDV eşiğini aşıyor olabilir', aciklama: 'Yıllık cironuz KDV mükellefiyet eşiğini (2025: ~500.000₺) aşarsa beyannameye dikkat edin. Muhasebeci ile görüşmenizi öneririz.' });

  if (!oneriler.length) oneriler.push({ ikon: '✅', renk: 'var(--accent3)', baslik: 'Her şey yolunda görünüyor!', aciklama: 'Stok ve finansal tablonuzda şu an bir anormallik tespit edilmedi.' });

  el.innerHTML = oneriler.map(o => `
    <div style="display:flex;gap:.8rem;align-items:flex-start;background:rgba(255,255,255,.02);border:1px solid var(--border);border-left:3px solid ${o.renk};border-radius:6px;padding:.9rem 1rem;">
      <span style="font-size:20px;flex-shrink:0;">${o.ikon}</span>
      <div>
        <div style="font-size:.72rem;font-weight:700;color:var(--cream);margin-bottom:.25rem;">${o.baslik}</div>
        <div style="font-size:.65rem;color:var(--t2);line-height:1.6;">${o.aciklama}</div>
      </div>
    </div>`).join('');
}


// ═══════════════════════════════════════════════════════════════════════════
//  VERGİ TAKVİMİ
// ═══════════════════════════════════════════════════════════════════════════

window.vergiYukle = function () {
  const tip   = document.getElementById('vMukTip')?.value || 'gercek';
  const ciro  = parseFloat(document.getElementById('vCiro')?.value) || 0;
  const kdvMuk= document.getElementById('vKdvMuk')?.value || 'evet';
  vergiTakvimRender(tip, ciro, kdvMuk);
  vergiRehberRender(tip);
};

function vergiTakvimRender(tip, ciro, kdvMuk) {
  const el = document.getElementById('vergiTakvimListe');
  if (!el) return;

  const yil = new Date().getFullYear();
  const vergiler = [];

  // ── KDV Beyanname Tarihleri ──────────────────────────────────────────
  if (kdvMuk === 'evet') {
    // Aylık KDV (ciro > 150.000₺ veya şirket)
    const aylikKdv = ciro > 150000 || tip === 'sirket';
    if (aylikKdv) {
      for (let ay = 1; ay <= 12; ay++) {
        const beyanAy = ay + 1 > 12 ? 1 : ay + 1;
        const beyanYil = ay + 1 > 12 ? yil + 1 : yil;
        vergiler.push({
          tarih: new Date(beyanYil, beyanAy - 1, 26),
          tur: 'KDV Beyannamesi',
          periyot: `${ay}. Ay (${yil})`,
          aciklama: 'Aylık KDV beyannamesi ve ödeme',
          tutar: ciro ? (ciro / 12 * 0.18).toFixed(0) : null
        });
      }
    } else {
      // 3 aylık KDV
      [[1,3],[4,6],[7,9],[10,12]].forEach(([bas,bit]) => {
        vergiler.push({
          tarih: new Date(yil, bit, 26),
          tur: 'KDV Beyannamesi (3 Aylık)',
          periyot: `${bas}-${bit}. Aylar (${yil})`,
          aciklama: '3 aylık KDV beyannamesi ve ödeme',
          tutar: ciro ? (ciro / 4 * 0.18).toFixed(0) : null
        });
      });
    }
  }

  // ── Muhtasar Beyanname ────────────────────────────────────────────────
  if (tip !== 'basit') {
    for (let ay = 1; ay <= 12; ay++) {
      const beyanAy = ay + 1 > 12 ? 1 : ay + 1;
      const beyanYil = ay + 1 > 12 ? yil + 1 : yil;
      vergiler.push({
        tarih: new Date(beyanYil, beyanAy - 1, 26),
        tur: 'Muhtasar Beyanname',
        periyot: `${ay}. Ay (${yil})`,
        aciklama: 'Stopaj vergisi beyannamesi (işçi çalıştırıyorsanız)',
        tutar: null
      });
    }
  }

  // ── Geçici Vergi ──────────────────────────────────────────────────────
  if (tip === 'gercek' || tip === 'sahis' || tip === 'sirket') {
    [
      { donem: '1. Dönem (Ocak-Mart)', tarih: new Date(yil, 4, 17) },
      { donem: '2. Dönem (Nisan-Haziran)', tarih: new Date(yil, 7, 17) },
      { donem: '3. Dönem (Temmuz-Eylül)', tarih: new Date(yil, 10, 17) },
    ].forEach(g => {
      vergiler.push({
        tarih: g.tarih,
        tur: 'Geçici Vergi',
        periyot: g.donem,
        aciklama: tip === 'sirket' ? 'Kurumlar geçici vergisi (%25 peşin)' : 'Gelir geçici vergisi (%15 peşin)',
        tutar: ciro ? (ciro / 4 * (tip === 'sirket' ? 0.25 : 0.15) * 0.35).toFixed(0) : null
      });
    });
  }

  // ── Yıllık Beyanname ──────────────────────────────────────────────────
  if (tip === 'gercek' || tip === 'sahis') {
    vergiler.push({
      tarih: new Date(yil + 1, 2, 31),
      tur: 'Yıllık Gelir Vergisi Beyannamesi',
      periyot: `${yil} Yılı`,
      aciklama: 'Yıllık gelir vergisi beyannamesi. 1. taksit Mart, 2. taksit Temmuz\'da ödenir.',
      tutar: ciro ? (ciro * 0.20 * 0.25).toFixed(0) : null,
      onemli: true
    });
  }
  if (tip === 'sirket') {
    vergiler.push({
      tarih: new Date(yil + 1, 3, 30),
      tur: 'Kurumlar Vergisi Beyannamesi',
      periyot: `${yil} Yılı`,
      aciklama: 'Yıllık kurumlar vergisi beyannamesi (%25 kurumlar vergisi).',
      tutar: ciro ? (ciro * 0.20 * 0.25).toFixed(0) : null,
      onemli: true
    });
  }
  if (tip === 'basit') {
    vergiler.push({
      tarih: new Date(yil + 1, 1, 28),
      tur: 'Basit Usul Gelir Vergisi',
      periyot: `${yil} Yılı`,
      aciklama: 'Basit usul mükellefleri için yıllık beyanname. Geçici vergi ve muhtasar yoktur.',
      onemli: true
    });
  }

  // ── SGK / Bağkur ──────────────────────────────────────────────────────
  if (tip !== 'sirket') {
    for (let ay = 1; ay <= 12; ay++) {
      vergiler.push({
        tarih: new Date(yil, ay, 0), // ayın son günü
        tur: 'SGK / Bağ-Kur Primi',
        periyot: `${ay}. Ay (${yil})`,
        aciklama: 'Aylık Bağ-Kur prim ödemesi (zorunlu sigorta)',
        tutar: '1.200-5.000'
      });
    }
  }

  // ── Sırala & Render ──────────────────────────────────────────────────
  const bugunTarih = bugun();
  const siralı = vergiler
    .filter(v => v.tarih >= bugunTarih)
    .sort((a, b) => a.tarih - b.tarih)
    .slice(0, 18); // max 18 göster

  el.innerHTML = siralı.map(v => {
    const gun  = gunFarki(v.tarih);
    const tarihStr = v.tarih.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    let seviye, badge;
    if (gun <= 7)       { seviye = 'acil';   badge = `🔴 ${gun} gün kaldı`; }
    else if (gun <= 30) { seviye = 'yakin';  badge = `🟡 ${gun} gün kaldı`; }
    else                { seviye = 'normal'; badge = `🟢 ${gun} gün kaldı`; }

    return `<div class="vergi-kart ${seviye}">
      <div class="vergi-tarih" style="color:${seviye==='acil'?'#ff6b6b':seviye==='yakin'?'var(--gold)':'var(--accent3)'};">${tarihStr.split(' ')[0]} ${tarihStr.split(' ')[1]}</div>
      <div style="flex:1;">
        <div class="vergi-tur" style="color:${seviye==='acil'?'#ff6b6b':seviye==='yakin'?'var(--gold)':'var(--cream)'};">${v.tur}</div>
        <div class="vergi-aciklama">${v.aciklama}${v.tutar ? ` — Tahmini: <strong style="color:var(--gold)">₺${Number(v.tutar).toLocaleString('tr-TR')}</strong>` : ''}</div>
        <div style="font-size:.58rem;color:var(--t2);margin-top:.2rem;">📅 ${tarihStr} · ${v.periyot}</div>
      </div>
      <span class="vergi-badge ${seviye}">${badge}</span>
    </div>`;
  }).join('') || '<div style="color:var(--t2);font-size:.7rem;padding:1rem;">Yaklaşan vergi tarihi bulunmuyor.</div>';

  // Vergi alert badge
  const acil = siralı.filter(v => gunFarki(v.tarih) <= 7).length;
  const badge = document.getElementById('vergiAlertBadge');
  if (badge) { badge.textContent = acil || ''; badge.style.display = acil ? 'inline-flex' : 'none'; }
}

function vergiRehberRender(tip) {
  const el = document.getElementById('vergiRehberGrid');
  if (!el) return;

  const kartlar = [
    {
      baslik: '💰 KDV (Katma Değer Vergisi)',
      icerik: 'Sattığınız ürünler üzerinden devlete ödenen vergi. Giyim/tekstil %10, genel %20, temel gıda %1. Beyanname ile her ay veya 3 ayda bir ödenir. Aldığınız ürünlerin KDV\'sini mahsup edebilirsiniz.'
    },
    {
      baslik: '📊 Geçici Vergi',
      icerik: tip === 'sirket'
        ? 'Şirketler yıllık kurumlar vergisini peşin ödemek için 3 ayda bir %25 oranında geçici vergi öder.'
        : 'Gerçek kişiler 3 ayda bir %15 oranında geçici gelir vergisi öder. Yıllık beyannamede mahsup edilir.'
    },
    {
      baslik: '🏛️ Yıllık Beyanname',
      icerik: tip === 'sirket'
        ? 'Şirketler Nisan sonuna kadar kurumlar vergisi beyannamesi verir. Net kâr üzerinden %25 kurumlar vergisi.'
        : tip === 'basit'
        ? 'Basit usulde yıllık gelir beyannamesi Şubat sonuna kadar verilir. Geçici vergi ve muhtasar zorunluluğu yoktur.'
        : 'Gerçek kişiler Mart sonuna kadar yıllık gelir vergisi beyannamesi verir. Verginin 1. taksiti Mart, 2. taksiti Temmuz\'da ödenir.'
    },
    {
      baslik: '🏥 SGK / Bağ-Kur',
      icerik: 'Kendi adınıza çalışan esnaf ve serbest meslek sahipleri zorunlu Bağ-Kur sigortalısıdır. Prim tutarı her yıl güncellenir (2025\'te yaklaşık 1.200–5.000₺/ay). Prim borcu birikirse icraya gidebilir.'
    },
    {
      baslik: '🧾 E-Fatura / E-Arşiv',
      icerik: 'Yıllık cirosu 500.000₺\'yi aşan mükellefler e-fatura zorunluluğuna tabidir. E-ticaret satışları için e-arşiv fatura düzenleme zorunluluğu da bulunmaktadır.'
    },
    {
      baslik: '⚖️ Ceza & Gecikme Faizi',
      icerik: 'Zamanında ödenmeyen vergiler için aylık yaklaşık %3-4 gecikme zammı uygulanır. Beyanname verilmezse vergi kaybının 1-3 katı ceza kesilebilir. Pişmanlıkla beyan cezayı sıfırlar.'
    }
  ];

  el.innerHTML = kartlar.map(k => `
    <div class="vergi-rehber-k">
      <h4>${k.baslik}</h4>
      <p>${k.icerik}</p>
    </div>`).join('');
}

// ── Dışa aktar ───────────────────────────────────────────────────────────
console.log('[GEN-Z] modpanel-stok.js yüklendi ✦');
