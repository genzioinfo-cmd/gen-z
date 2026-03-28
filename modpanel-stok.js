/**
 * GEN-Z Modpanel — Stok Yönetimi + Finansal Danışman + Vergi Takvimi
 * modpanel-stok.js  |  type="module"
 *
 * KILIT SİSTEMİ:
 *  _stokSatinAldi = false → Sadece: stok adedi güncelle, ürün durumu değiştir
 *  _stokSatinAldi = true  → Tümü: raf, barkod, QR, CSV, eşik, not
 */

import {
  getFirestore, collection, query, where, getDocs,
  doc, updateDoc, getDoc, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const db = getFirestore();

// ── QR kütüphanesi ───────────────────────────────────────────────────────
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
let _stokSatinAldi = false;

function para(n) { return Number(n || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function gunFarki(hedef) { return Math.ceil((new Date(hedef) - new Date()) / 86400000); }

// ═══════════════════════════════════════════════════════════════════════════
//  STOK YÖNETİMİ
// ═══════════════════════════════════════════════════════════════════════════

window.stokModulYukle = async function () {
  const mag = window._magaza;
  if (!mag) return;

  // Satın alma kontrolü — admin her şeyi ücretsiz görür
  try {
    const uid = window._aktifUid;
    const kulSnap = uid ? await getDoc(doc(db, 'kullanicilar', uid)) : null;
    const kulData = kulSnap?.data() || {};
    const isAdmin = kulData.rol === 'admin' || (kulData.roller||[]).includes('admin');

    if (isAdmin) {
      _stokSatinAldi = true; // Admin için kilit yok
    } else {
      const mSnap = await getDoc(doc(db, 'magazalar', mag.id));
      _stokSatinAldi = mSnap.data()?.stokModul === true;
    }
  } catch (e) { _stokSatinAldi = false; }

  // Kilit banner
  const banner = document.getElementById('stokKilitDiv');
  if (banner) banner.style.display = _stokSatinAldi ? 'none' : 'flex';

  // Ürünleri çek
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
  const liste  = _stokListesi;
  const toplam = liste.length;
  const adet   = liste.reduce((t, u) => t + (u.stok || 0), 0);
  const kritik = liste.filter(u => (u.stok||0) > 0 && (u.stok||0) <= (u.stokEsik||5)).length;
  const bitti  = liste.filter(u => (u.stok||0) === 0).length;
  const deger  = liste.reduce((t, u) => t + (u.fiyat||0) * (u.stok||0), 0);

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('stkToplamUrun',  toplam);
  set('stkToplamAdet', adet.toLocaleString('tr-TR'));
  set('stkKritikSay',  kritik + bitti);
  set('stkDeger',      '₺' + para(deger));

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
  if (_stokFiltre === 'kritik') liste = liste.filter(u => (u.stok||0) > 0 && (u.stok||0) <= (u.stokEsik||5));
  else if (_stokFiltre === 'bitti')  liste = liste.filter(u => (u.stok||0) === 0);
  else if (_stokFiltre === 'normal') liste = liste.filter(u => (u.stok||0) > (u.stokEsik||5));

  if (_stokAramaTxt) {
    const q = _stokAramaTxt.toLowerCase();
    liste = liste.filter(u => (u.ad||'').toLowerCase().includes(q) || (u.sku||'').toLowerCase().includes(q));
  }

  if (!liste.length) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:2rem;color:var(--t2);font-style:italic;">Ürün bulunamadı</td></tr>`;
    return;
  }

  tbody.innerHTML = liste.map(u => {
    const stok   = u.stok ?? 0;
    const esik   = u.stokEsik ?? 5;
    const fiyat  = u.fiyat ?? 0;
    const rafKod = _stokSatinAldi
      ? ([u.rafBolge, u.rafNo, u.rafGoz].filter(Boolean).join('-') || '—')
      : '<span style="opacity:.3;filter:blur(3px);">A-01-B2</span>';
    const skuGoster   = _stokSatinAldi ? (u.sku || '—') : '<span style="opacity:.3;filter:blur(3px);">GNZ-001</span>';
    const degerGoster = _stokSatinAldi ? '₺' + para(fiyat * stok) : '<span style="opacity:.3;filter:blur(3px);">₺0,00</span>';

    let durumRenk, durumTxt, rowClass = '';
    if (stok === 0)        { durumRenk='#666';     durumTxt='⚫ Bitti';   rowClass='stok-row-bitti'; }
    else if (stok <= esik) { durumRenk='#ff6b6b';  durumTxt='🔴 Kritik'; rowClass='stok-row-kritik'; }
    else                   { durumRenk='#5CF0B4';  durumTxt='🟢 Normal'; }

    return `<tr class="${rowClass}">
      <td style="text-align:center;">${u.resimler?.[0]
        ? `<img src="${u.resimler[0]}" style="width:32px;height:32px;object-fit:cover;border-radius:4px;">`
        : '📦'}</td>
      <td>
        <div style="font-weight:600;font-size:.72rem;color:var(--cream);max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${u.ad||'—'}</div>
        <div style="font-size:.58rem;color:var(--t2);">${u.kategori||'—'}</div>
      </td>
      <td style="font-family:monospace;font-size:.62rem;color:var(--gold);">${skuGoster}</td>
      <td>
        <span style="background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.18);border-radius:4px;padding:.2rem .6rem;font-size:.62rem;font-family:monospace;color:var(--gold);">
          ${rafKod}
        </span>
      </td>
      <td style="text-align:center;">
        <div style="display:flex;align-items:center;justify-content:center;gap:.3rem;">
          <button onclick="stokHizliDeg('${u.id}',-1)" style="width:22px;height:22px;background:rgba(255,255,255,.06);border:1px solid var(--border);border-radius:4px;color:var(--cream);font-size:13px;cursor:pointer;line-height:1;">−</button>
          <span style="font-family:'Syne',sans-serif;font-size:1rem;font-weight:700;color:${stok===0?'#666':stok<=esik?'#ff6b6b':'var(--cream)'};">${stok}</span>
          <button onclick="stokHizliDeg('${u.id}',1)" style="width:22px;height:22px;background:rgba(255,255,255,.06);border:1px solid var(--border);border-radius:4px;color:var(--cream);font-size:13px;cursor:pointer;line-height:1;">+</button>
        </div>
        <div style="font-size:.52rem;color:var(--t2);margin-top:2px;">eşik: ${esik}</div>
      </td>
      <td style="text-align:center;font-size:.65rem;color:var(--t2);">${_stokSatinAldi ? esik : '🔒'}</td>
      <td style="font-size:.68rem;color:var(--cream);">₺${para(fiyat)}</td>
      <td style="font-size:.68rem;color:var(--gold);font-weight:600;">${degerGoster}</td>
      <td><span style="font-size:.58rem;font-weight:700;color:${durumRenk};">${durumTxt}</span></td>
      <td>
        <div style="display:flex;gap:.3rem;flex-wrap:wrap;">
          <button class="aksiyon duz" onclick="stokDuzenleAc('${u.id}')" style="font-size:.52rem;padding:.25rem .7rem;">
            ${_stokSatinAldi ? '✏️ Düzenle' : '📦 Stok'}
          </button>
          ${_stokSatinAldi ? `<button class="aksiyon duz" onclick="stokQRAc('${u.id}')" style="font-size:.52rem;padding:.25rem .5rem;color:#a78bfa;border-color:rgba(167,139,250,.3);">📱 QR</button>` : ''}
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ── Hızlı stok +/- (ücretsiz kullanıcıda da çalışır) ────────────────────
window.stokHizliDeg = async function(id, delta) {
  const u = _stokListesi.find(x => x.id === id);
  if (!u) return;
  const yeniStok = Math.max(0, (u.stok || 0) + delta);
  try {
    await updateDoc(doc(db, 'magaza_urunler', id), { stok: yeniStok, stokGuncellendi: serverTimestamp() });
    u.stok = yeniStok;
    if (window._urunler) { const i = window._urunler.findIndex(x=>x.id===id); if(i>-1) window._urunler[i].stok = yeniStok; }
    stokOzetGuncelle();
    stokRenderTablo();
  } catch(e) { if(typeof toast==='function') toast('Güncelleme hatası ⚠️','err'); }
};

window.stokFiltreFn = function (tip, btn) {
  _stokFiltre = tip;
  document.querySelectorAll('#sayfa-stok .filtre-row .f-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  stokRenderTablo();
};

window.stokAraFn = function (val) { _stokAramaTxt = val; stokRenderTablo(); };
window.stokYenile = async function () { _stokListesi = []; await window.stokModulYukle(); };

// ── CSV (sadece premium) ─────────────────────────────────────────────────
window.stokCSV = function () {
  if (!_stokSatinAldi) { toast('Bu özellik Gelişmiş Stok paketi gerektirir (₺600).','err'); return; }
  const baslik = ['Ürün Adı','SKU','Barkod','Raf Bölge','Raf No','Raf Göz','Stok','Eşik','Fiyat (₺)','Stok Değeri (₺)','Durum','Depo Notu'];
  const satirlar = _stokListesi.map(u => {
    const stok = u.stok??0; const esik = u.stokEsik??5;
    return [`"${u.ad||''}"`,u.sku||'',u.barkod||'',u.rafBolge||'',u.rafNo||'',u.rafGoz||'',
      stok,esik,u.fiyat||0,(u.fiyat||0)*stok,stok===0?'Bitti':stok<=esik?'Kritik':'Normal',
      `"${(u.depNot||'').replace(/"/g,'""')}"`].join(',');
  });
  const csv = '\uFEFF' + [baslik.join(','), ...satirlar].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
  a.download = `stok_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
};

// ── Modal Aç ────────────────────────────────────────────────────────────
window.stokDuzenleAc = function (id) {
  const u = _stokListesi.find(x => x.id === id);
  if (!u) return;
  _aktifStokId = id;

  document.getElementById('stokModalBaslik').textContent = u.ad || 'Stok Düzenle';
  document.getElementById('stokModalSku').textContent    = u.sku ? `SKU: ${u.sku}` : '';
  document.getElementById('smStok').value   = u.stok   ?? 0;
  document.getElementById('smEsik').value   = u.stokEsik ?? 5;
  document.getElementById('smBolge').value  = u.rafBolge || '';
  document.getElementById('smRaf').value    = u.rafNo    || '';
  document.getElementById('smGoz').value    = u.rafGoz   || '';
  document.getElementById('smSku').value    = u.sku      || '';
  document.getElementById('smBarkod').value = u.barkod   || '';
  document.getElementById('smNot').value    = u.depNot   || '';

  // Kilitli alanlar
  const kilitliIds = ['smBolge','smRaf','smGoz','smSku','smBarkod','smNot'];
  kilitliIds.forEach(fid => {
    const el = document.getElementById(fid);
    if (!el) return;
    el.disabled = !_stokSatinAldi;
    el.style.opacity = _stokSatinAldi ? '1' : '0.4';
    el.style.cursor  = _stokSatinAldi ? '' : 'not-allowed';
  });

  // Kilit uyarısı modal içinde
  const kilitUyari = document.getElementById('stokModalKilitUyari');
  if (kilitUyari) kilitUyari.style.display = _stokSatinAldi ? 'none' : 'flex';

  // QR butonları
  const qrBtnler = document.querySelectorAll('#stokModal .qr-btn-grup button');
  qrBtnler.forEach(b => {
    b.disabled = !_stokSatinAldi;
    b.style.opacity = _stokSatinAldi ? '1' : '0.35';
    b.title = _stokSatinAldi ? '' : 'Gelişmiş Stok paketi gerektirir (₺600)';
  });

  const errEl = document.getElementById('stokModalErr');
  if (errEl) { errEl.textContent=''; errEl.style.display='none'; }
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
  inp.value = Math.max(0, (parseInt(inp.value)||0) + delta);
};

window.rafOnizle = function () {
  const b = document.getElementById('smBolge').value.trim().toUpperCase();
  const r = document.getElementById('smRaf').value.trim();
  const g = document.getElementById('smGoz').value.trim().toUpperCase();
  const div = document.getElementById('rafOnizleDiv');
  const txt = document.getElementById('rafOnizleTxt');
  if (!div || !txt) return;
  if (b || r || g) { txt.textContent = [b,r,g].filter(Boolean).join('-'); div.style.display='block'; }
  else { div.style.display='none'; }
};

// ── SKU & Barkod ─────────────────────────────────────────────────────────
window.skuUret = function () {
  if (!_stokSatinAldi) { toast('Bu özellik Gelişmiş Stok paketi gerektirir.','err'); return; }
  const mag = (window._magaza?.ad||'GNZ').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,3);
  document.getElementById('smSku').value = `${mag}-${Math.floor(Math.random()*9000)+1000}`;
};

window.barkodUret = function () {
  if (!_stokSatinAldi) { toast('Bu özellik Gelişmiş Stok paketi gerektirir.','err'); return; }
  let d = '20';
  for (let i=0;i<10;i++) d += Math.floor(Math.random()*10);
  let sum = 0;
  for (let i=0;i<12;i++) sum += parseInt(d[i])*(i%2===0?1:3);
  document.getElementById('smBarkod').value = d + (10-(sum%10))%10;
};

// ── QR Kod ───────────────────────────────────────────────────────────────
window.stokQRAc = function (id) { stokDuzenleAc(id); setTimeout(()=>qrGoster(),300); };

window.qrGoster = async function () {
  if (!_stokSatinAldi) { toast('Bu özellik Gelişmiş Stok paketi gerektirir.','err'); return; }
  await loadQRLib();
  const sku    = document.getElementById('smSku').value.trim();
  const barkod = document.getElementById('smBarkod').value.trim();
  const urunAd = document.getElementById('stokModalBaslik').textContent;
  const rafKod = [document.getElementById('smBolge').value.trim().toUpperCase(),
    document.getElementById('smRaf').value.trim(),
    document.getElementById('smGoz').value.trim().toUpperCase()].filter(Boolean).join('-');

  const qrVerisi = JSON.stringify({ sku, barkod, urun: urunAd, raf: rafKod, site:'gen-z.io' });
  const div = document.getElementById('qrBarkodAlani');
  div.style.display = 'block';
  const canvas = document.getElementById('qrCanvas');
  canvas.style.display = 'block';
  document.getElementById('barkodSvgDiv').innerHTML = '';

  const qrDiv = document.createElement('div');
  try {
    new QRCode(qrDiv, { text:qrVerisi, width:180, height:180, colorDark:'#1a1830', colorLight:'#ffffff', correctLevel:QRCode.CorrectLevel.M });
    const img = qrDiv.querySelector('img');
    if (img) img.onload = () => {
      const ctx = canvas.getContext('2d');
      canvas.width=180; canvas.height=180;
      ctx.fillStyle='#fff'; ctx.fillRect(0,0,180,180);
      ctx.drawImage(img,0,0,180,180);
    };
  } catch(e) { canvas.style.display='none'; }

  document.getElementById('qrUrunAd').textContent = `${urunAd}${sku?' | '+sku:''}${rafKod?' | 📍 '+rafKod:''}`;
  if (barkod) barkodSvgCiz(barkod);
};

window.barkodGoster = function () {
  if (!_stokSatinAldi) { toast('Bu özellik Gelişmiş Stok paketi gerektirir.','err'); return; }
  const barkod = document.getElementById('smBarkod').value.trim();
  if (!barkod) { toast('Önce barkod numarası girin.','err'); return; }
  const div = document.getElementById('qrBarkodAlani');
  div.style.display='block';
  document.getElementById('qrCanvas').style.display='none';
  barkodSvgCiz(barkod);
  document.getElementById('qrUrunAd').textContent = barkod;
};

function barkodSvgCiz(digits) {
  const svgDiv = document.getElementById('barkodSvgDiv');
  if (!svgDiv) return;
  const W=220, H=80; let bars='', x=10;
  const barW=(W-20)/(digits.length*4);
  for (let i=0;i<digits.length;i++) {
    const n=parseInt(digits[i]);
    const thick=barW*(1+(n%3)*0.5);
    bars+=`<rect x="${x}" y="5" width="${thick}" height="${H-20}" fill="#1a1830"/>`;
    x+=thick+barW*0.6;
    bars+=`<rect x="${x}" y="5" width="${barW*0.4}" height="${H-20}" fill="white"/>`;
    x+=barW*0.7;
  }
  svgDiv.innerHTML=`<svg width="${W}" height="${H}" style="background:#fff;border-radius:4px;" xmlns="http://www.w3.org/2000/svg">
    ${bars}<text x="${W/2}" y="${H-4}" text-anchor="middle" font-size="10" font-family="monospace" fill="#1a1830">${digits}</text></svg>`;
}

window.qrIndir = function () {
  const canvas = document.getElementById('qrCanvas');
  const svg    = document.getElementById('barkodSvgDiv')?.querySelector('svg');
  const urunAd = document.getElementById('stokModalBaslik').textContent.replace(/[^a-zA-Z0-9]/g,'_');
  if (canvas && canvas.style.display!=='none' && canvas.width>0) {
    const a=document.createElement('a'); a.download=`qr_${urunAd}.png`; a.href=canvas.toDataURL(); a.click();
  } else if (svg) {
    const a=document.createElement('a'); a.download=`barkod_${urunAd}.svg`;
    a.href=URL.createObjectURL(new Blob([svg.outerHTML],{type:'image/svg+xml'})); a.click();
    URL.revokeObjectURL(a.href);
  }
};

// ── Kaydet ───────────────────────────────────────────────────────────────
window.stokKaydet = async function () {
  if (!_aktifStokId) return;
  const errEl = document.getElementById('stokModalErr');

  // Ücretsiz kullanıcı sadece stok ve eşiği kaydedebilir
  const guncelleme = {
    stok     : parseInt(document.getElementById('smStok').value)||0,
    stokEsik : parseInt(document.getElementById('smEsik').value)||5,
    stokGuncellendi: serverTimestamp()
  };

  // Premium alanlar
  if (_stokSatinAldi) {
    guncelleme.rafBolge = document.getElementById('smBolge').value.trim().toUpperCase()||null;
    guncelleme.rafNo    = document.getElementById('smRaf').value.trim()||null;
    guncelleme.rafGoz   = document.getElementById('smGoz').value.trim().toUpperCase()||null;
    guncelleme.sku      = document.getElementById('smSku').value.trim()||null;
    guncelleme.barkod   = document.getElementById('smBarkod').value.trim()||null;
    guncelleme.depNot   = document.getElementById('smNot').value.trim()||null;
  }

  try {
    await updateDoc(doc(db,'magaza_urunler',_aktifStokId), guncelleme);
    const idx = _stokListesi.findIndex(u=>u.id===_aktifStokId);
    if (idx>-1) Object.assign(_stokListesi[idx], guncelleme);
    if (window._urunler) { const i=window._urunler.findIndex(u=>u.id===_aktifStokId); if(i>-1) Object.assign(window._urunler[i],guncelleme); }
    stokOzetGuncelle();
    stokRenderTablo();
    document.getElementById('stokModal').classList.remove('open');
    if(typeof toast==='function') toast('✦ Stok bilgisi kaydedildi!');
  } catch(e) {
    if (errEl) { errEl.textContent='Kayıt hatası: '+e.message; errEl.style.display='block'; }
  }
};

// ── 600₺ Satın Al ────────────────────────────────────────────────────────
window.stokSatinAl = function () {
  toast('Ödeme altyapısı yakında aktif olacak. Demo için açılıyor…','gold');
  setTimeout(() => {
    _stokSatinAldi = true;
    const banner = document.getElementById('stokKilitDiv');
    if (banner) banner.style.display = 'none';
    stokRenderTablo();
    toast('✦ Gelişmiş Stok Yönetimi aktif edildi!');
  }, 1000);
};

// ═══════════════════════════════════════════════════════════════════════════
//  FİNANSAL DANIŞMAN
// ═══════════════════════════════════════════════════════════════════════════

window.danismanYukle = function () { danAnalizYukle(); danOnerilerYukle(); };

window.danHesapla = function () {
  const maliyet = parseFloat(document.getElementById('danMaliyet')?.value)||0;
  const gider   = parseFloat(document.getElementById('danGider')?.value)||0;
  const marj    = parseFloat(document.getElementById('danMarj')?.value)||20;
  const kdvOran = parseFloat(document.getElementById('danKdv')?.value)||20;
  const sonuc   = document.getElementById('danSonuc');
  const icerik  = document.getElementById('danSonucIcerik');
  if (!maliyet) { if(sonuc) sonuc.style.display='none'; return; }

  const toplamMaliyet = maliyet+gider;
  const kar           = toplamMaliyet*(marj/100);
  const satisFiyati   = toplamMaliyet+kar;
  const kdvTutar      = satisFiyati*(kdvOran/100);
  const kdvDahil      = satisFiyati+kdvTutar;
  const komisyon      = kdvDahil*0.10;
  const eldeGecan     = kdvDahil-kdvTutar-komisyon;
  const gercekKar     = eldeGecan-toplamMaliyet;
  const gercekMarj    = toplamMaliyet>0?(gercekKar/toplamMaliyet*100):0;

  const satir = (lbl,val,renk='var(--cream)') =>
    `<div class="dan-sonuc-row"><span style="color:var(--t2)">${lbl}</span><span class="dan-sonuc-val" style="color:${renk}">${val}</span></div>`;

  icerik.innerHTML = `
    ${satir('Toplam Maliyet','₺'+para(toplamMaliyet))}
    ${satir('Hedef Kâr (%'+marj+')','₺'+para(kar),'var(--accent3)')}
    ${satir('KDV Hariç Satış Fiyatı','₺'+para(satisFiyati),'var(--gold)')}
    ${satir('KDV Tutarı (%'+kdvOran+')','₺'+para(kdvTutar),'var(--orange)')}
    <div class="dan-sonuc-row" style="border-top:1px solid rgba(201,168,76,.2);margin-top:.4rem;padding-top:.8rem;">
      <span style="font-weight:700;color:var(--cream);">🏷️ Müşteriye Satış Fiyatı</span>
      <span style="font-family:'Syne',sans-serif;font-size:1.3rem;font-weight:800;color:var(--gold);">₺${para(kdvDahil)}</span>
    </div>
    ${satir('Platform Komisyonu (%10)','−₺'+para(komisyon),'#ff6b6b')}
    ${satir('Elinize Geçen Net','₺'+para(eldeGecan),'var(--accent3)')}
    <div class="dan-sonuc-row" style="border-top:1px solid rgba(92,240,180,.2);margin-top:.4rem;padding-top:.8rem;">
      <span style="font-weight:700;">💚 Gerçek Kâr</span>
      <span style="font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:800;color:${gercekKar>=0?'var(--accent3)':'#ff6b6b'};">
        ₺${para(gercekKar)} <span style="font-size:.65rem;opacity:.7;">(Marj: %${gercekMarj.toFixed(1)})</span>
      </span>
    </div>
    ${gercekKar<0?'<div style="background:rgba(240,80,80,.08);border:1px solid rgba(240,80,80,.2);border-radius:6px;padding:.7rem;font-size:.65rem;color:#ff6b6b;margin-top:.6rem;">⚠️ Bu fiyatla zarar ediyorsunuz!</div>':''}
  `;
  if(sonuc) sonuc.style.display='block';
};

function danAnalizYukle() {
  const el = document.getElementById('danAnalizIcerik');
  if (!el) return;
  const siparisler = window._siparisler||[];
  if (!siparisler.length) { el.innerHTML='<div style="color:var(--t2);font-size:.7rem;font-style:italic;">Henüz sipariş verisi yok.</div>'; return; }
  const tam    = siparisler.filter(s=>s.durum==='tamamlandi');
  const brut   = tam.reduce((t,s)=>t+(s.toplam||0),0);
  const kdv    = tam.reduce((t,s)=>t+((s.toplam||0)*((s.kdvOran||20)/120)),0);
  const kom    = brut*0.10;
  const net    = brut-kdv-kom;
  const ort    = tam.length?brut/tam.length:0;
  el.innerHTML=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:.7rem;">
    <div class="stk-k"><div class="stk-n" style="font-size:1.2rem;color:var(--accent3);">₺${para(brut)}</div><div class="stk-l">Brüt Gelir</div></div>
    <div class="stk-k"><div class="stk-n" style="font-size:1.2rem;color:#ff6b6b;">₺${para(kdv)}</div><div class="stk-l">Ödenecek KDV</div></div>
    <div class="stk-k"><div class="stk-n" style="font-size:1.2rem;color:var(--orange);">₺${para(kom)}</div><div class="stk-l">Komisyon</div></div>
    <div class="stk-k"><div class="stk-n" style="font-size:1.2rem;color:var(--gold);">₺${para(net)}</div><div class="stk-l">Net Kazanç</div></div>
    <div class="stk-k"><div class="stk-n" style="font-size:1.2rem;">₺${para(ort)}</div><div class="stk-l">Ort. Sipariş</div></div>
  </div>`;
}

function danOnerilerYukle() {
  const el = document.getElementById('danOneriler');
  if (!el) return;
  const urunler = window._urunler||[];
  const oneriler = [];
  const kritik = urunler.filter(u=>(u.stok||0)<=((u.stokEsik||5))&&(u.stok||0)>0);
  if (kritik.length) oneriler.push({ikon:'⚠️',renk:'#ff6b6b',baslik:`${kritik.length} ürünün stoğu kritik`,aciklama:kritik.slice(0,3).map(u=>u.ad).join(', ')+'…'});
  const biten = urunler.filter(u=>(u.stok||0)===0);
  if (biten.length) oneriler.push({ikon:'⚫',renk:'#888',baslik:`${biten.length} ürünün stoğu tükendi`,aciklama:'Pasife alın veya stok girin.'});
  if (!oneriler.length) oneriler.push({ikon:'✅',renk:'var(--accent3)',baslik:'Her şey yolunda!',aciklama:'Stok tablonuzda şu an bir sorun yok.'});
  el.innerHTML=oneriler.map(o=>`<div style="display:flex;gap:.8rem;align-items:flex-start;background:rgba(255,255,255,.02);border:1px solid var(--border);border-left:3px solid ${o.renk};border-radius:6px;padding:.9rem 1rem;">
    <span style="font-size:20px;flex-shrink:0;">${o.ikon}</span>
    <div><div style="font-size:.72rem;font-weight:700;color:var(--cream);margin-bottom:.25rem;">${o.baslik}</div>
    <div style="font-size:.65rem;color:var(--t2);line-height:1.6;">${o.aciklama}</div></div></div>`).join('');
}

// ═══════════════════════════════════════════════════════════════════════════
//  VERGİ TAKVİMİ
// ═══════════════════════════════════════════════════════════════════════════

window.vergiYukle = function () {
  const tip    = document.getElementById('vMukTip')?.value||'gercek';
  const ciro   = parseFloat(document.getElementById('vCiro')?.value)||0;
  const kdvMuk = document.getElementById('vKdvMuk')?.value||'evet';
  vergiTakvimRender(tip,ciro,kdvMuk);
  vergiRehberRender(tip);
};

function vergiTakvimRender(tip,ciro,kdvMuk) {
  const el = document.getElementById('vergiTakvimListe');
  if (!el) return;
  const yil = new Date().getFullYear();
  const vergiler = [];

  if (kdvMuk==='evet') {
    const aylik = ciro>150000||tip==='sirket';
    if (aylik) {
      for (let ay=1;ay<=12;ay++) {
        const bAy=ay+1>12?1:ay+1, bYil=ay+1>12?yil+1:yil;
        vergiler.push({tarih:new Date(bYil,bAy-1,26),tur:'KDV Beyannamesi',periyot:`${ay}. Ay (${yil})`,aciklama:'Aylık KDV beyannamesi ve ödeme',tutar:ciro?(ciro/12*0.18).toFixed(0):null});
      }
    } else {
      [[1,3],[4,6],[7,9],[10,12]].forEach(([b,t])=>{
        vergiler.push({tarih:new Date(yil,t,26),tur:'KDV Beyannamesi (3 Aylık)',periyot:`${b}-${t}. Aylar`,aciklama:'3 aylık KDV beyannamesi',tutar:ciro?(ciro/4*0.18).toFixed(0):null});
      });
    }
  }

  if (tip==='gercek'||tip==='sahis'||tip==='sirket') {
    [{donem:'1. Dönem (Ocak-Mart)',tarih:new Date(yil,4,17)},{donem:'2. Dönem (Nisan-Haziran)',tarih:new Date(yil,7,17)},{donem:'3. Dönem (Temmuz-Eylül)',tarih:new Date(yil,10,17)}]
    .forEach(g=>vergiler.push({tarih:g.tarih,tur:'Geçici Vergi',periyot:g.donem,aciklama:tip==='sirket'?'Kurumlar geçici vergisi (%25)':'Gelir geçici vergisi (%15)',tutar:ciro?(ciro/4*(tip==='sirket'?0.25:0.15)*0.35).toFixed(0):null}));
  }

  if (tip==='gercek'||tip==='sahis') vergiler.push({tarih:new Date(yil+1,2,31),tur:'Yıllık Gelir Vergisi Beyannamesi',periyot:`${yil} Yılı`,aciklama:'1. taksit Mart, 2. taksit Temmuz.',onemli:true});
  if (tip==='sirket') vergiler.push({tarih:new Date(yil+1,3,30),tur:'Kurumlar Vergisi Beyannamesi',periyot:`${yil} Yılı`,aciklama:'%25 kurumlar vergisi.',onemli:true});
  if (tip==='basit') vergiler.push({tarih:new Date(yil+1,1,28),tur:'Basit Usul Gelir Vergisi',periyot:`${yil} Yılı`,aciklama:'Yıllık beyanname. Geçici vergi yok.',onemli:true});

  for (let ay=1;ay<=12;ay++) {
    vergiler.push({tarih:new Date(yil,ay,0),tur:'SGK / Bağ-Kur Primi',periyot:`${ay}. Ay`,aciklama:'Aylık prim ödemesi',tutar:'1.200-5.000'});
  }

  const bugun = new Date();
  const siralı = vergiler.filter(v=>v.tarih>=bugun).sort((a,b)=>a.tarih-b.tarih).slice(0,15);

  el.innerHTML = siralı.map(v=>{
    const gun=gunFarki(v.tarih);
    const tarihStr=v.tarih.toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'});
    let sev,badge;
    if(gun<=7){sev='acil';badge=`🔴 ${gun} gün kaldı`;}
    else if(gun<=30){sev='yakin';badge=`🟡 ${gun} gün kaldı`;}
    else{sev='normal';badge=`🟢 ${gun} gün kaldı`;}
    return `<div class="vergi-kart ${sev}">
      <div class="vergi-tarih" style="color:${sev==='acil'?'#ff6b6b':sev==='yakin'?'var(--gold)':'var(--accent3)'};">${tarihStr.split(' ')[0]} ${tarihStr.split(' ')[1]}</div>
      <div style="flex:1;">
        <div class="vergi-tur" style="color:${sev==='acil'?'#ff6b6b':sev==='yakin'?'var(--gold)':'var(--cream)'};">${v.tur}</div>
        <div class="vergi-aciklama">${v.aciklama}${v.tutar?` — Tahmini: <strong style="color:var(--gold)">₺${Number(v.tutar).toLocaleString('tr-TR')}</strong>`:''}</div>
        <div style="font-size:.58rem;color:var(--t2);margin-top:.2rem;">📅 ${tarihStr} · ${v.periyot}</div>
      </div>
      <span class="vergi-badge ${sev}">${badge}</span>
    </div>`;
  }).join('')||'<div style="color:var(--t2);font-size:.7rem;padding:1rem;">Yaklaşan vergi tarihi yok.</div>';

  const acil=siralı.filter(v=>gunFarki(v.tarih)<=7).length;
  const badge=document.getElementById('vergiAlertBadge');
  if(badge){badge.textContent=acil||'';badge.style.display=acil?'inline-flex':'none';}
}

function vergiRehberRender(tip) {
  const el = document.getElementById('vergiRehberGrid');
  if (!el) return;
  el.innerHTML=[
    {baslik:'💰 KDV',icerik:'Sattığınız ürünler üzerinden devlete ödenen vergi. Giyim %10, genel %20, temel gıda %1. Aldığınız ürünlerin KDV\'sini mahsup edebilirsiniz.'},
    {baslik:'📊 Geçici Vergi',icerik:tip==='sirket'?'Şirketler 3 ayda bir %25 kurumlar geçici vergisi öder.':'Gerçek kişiler 3 ayda bir %15 gelir geçici vergisi öder.'},
    {baslik:'🏛️ Yıllık Beyanname',icerik:tip==='sirket'?'Nisan sonuna kadar kurumlar vergisi. Net kâr üzerinden %25.':tip==='basit'?'Şubat sonuna kadar. Geçici vergi zorunluluğu yok.':'Mart sonuna kadar. 1. taksit Mart, 2. taksit Temmuz.'},
    {baslik:'🏥 SGK / Bağ-Kur',icerik:'Kendi adınıza çalışanlar için zorunlu sigorta. 2025 itibarıyla 1.200–5.000₺/ay arası.'},
    {baslik:'🧾 E-Fatura',icerik:'Yıllık cirosu 500.000₺\'yi aşanlar e-fatura zorunluluğuna tabidir.'},
    {baslik:'⚖️ Ceza & Faiz',icerik:'Geç ödemelerde aylık ~%3-4 gecikme zammı. Pişmanlıkla beyan cezayı sıfırlar.'}
  ].map(k=>`<div class="vergi-rehber-k"><h4>${k.baslik}</h4><p>${k.icerik}</p></div>`).join('');
}

console.log('[GEN-Z] modpanel-stok.js yüklendi ✦');
