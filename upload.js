/**
 * GEN-Z — Fotoğraf Yükleme Modülü
 * upload.js
 * 
 * Tüm roller için ortak fotoğraf yükleme kodu:
 *   - Mağaza: max 5 fotoğraf
 *   - Usta:   1 kapak fotoğrafı
 *   - Genç-Z: 1 kapak fotoğrafı
 */

const UPLOAD_URL = 'https://genz-upload.genzio-info.workers.dev';
const MAX_BOYUT  = 1.5 * 1024 * 1024; // 1.5MB

// ── ORTAK: Görseli sıkıştır (max 1200px, JPEG %72) ──────────────────────
export function gorselSikistir(file) {
  return new Promise(resolve => {
    const MAX_W = 1200, MAX_H = 1200, QUALITY = 0.72;
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > MAX_W || h > MAX_H) {
          const ratio = Math.min(MAX_W / w, MAX_H / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        canvas.toBlob(blob => {
          const sFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
          const url   = canvas.toDataURL('image/jpeg', QUALITY);
          resolve({ file: sFile, url });
        }, 'image/jpeg', QUALITY);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ── ORTAK: R2'ye yükle ──────────────────────────────────────────────────
export async function resimYukleR2(dosya, klasor) {
  const uid      = window._aktifUid || 'anonim';
  const fileName = `${klasor}/${uid}/${Date.now()}_${dosya.name}`;
  const formData = new FormData();
  formData.append('file', dosya);
  formData.append('key', fileName);
  const res = await fetch(UPLOAD_URL, { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Yükleme başarısız (' + res.status + ')');
  const data = await res.json();
  if (!data.url) throw new Error('URL alınamadı');
  return data.url;
}

// ════════════════════════════════════════════════════════════════════════
// MAĞAZA — max 5 fotoğraf
// ════════════════════════════════════════════════════════════════════════
let _resimler = [];
window._resimler = _resimler;

window.resimSec = async function(files) {
  for (const f of Array.from(files)) {
    if (_resimler.length >= 5) break;
    if (!f.type.startsWith('image/')) continue;
    if (f.size > MAX_BOYUT) {
      window.toast?.('⚠ Fotoğraf çok büyük! Max 1.5MB — squoosh.app ile küçültün. (' + f.name + ')', 'err');
      continue;
    }
    const sikis = await gorselSikistir(f);
    _resimler.push(sikis);
    magazaResimPreview();
    window.formKontrol?.();
  }
};

window.dragOver  = function(e) { e.preventDefault(); document.getElementById('resimAlan')?.classList.add('dragover'); };
window.dragLeave = function()  { document.getElementById('resimAlan')?.classList.remove('dragover'); };
window.dropResim = function(e) {
  e.preventDefault();
  document.getElementById('resimAlan')?.classList.remove('dragover');
  window.resimSec(e.dataTransfer.files);
};

function magazaResimPreview() {
  const el = document.getElementById('resimPreview');
  if (!el) return;
  el.innerHTML = _resimler.map((r, i) => `
    <div class="resim-thumb${i === 0 ? ' ana' : ''}">
      <img src="${r.url}" alt="resim">
      <button class="r-sil" onclick="resimSil(${i})">✕</button>
    </div>`).join('');
}

window.resimSil = function(i) {
  _resimler.splice(i, 1);
  magazaResimPreview();
  window.formKontrol?.();
};

window.magazaResimleriTemizle = function() {
  _resimler.length = 0;
  magazaResimPreview();
};

// Mağaza ürün yüklerken URL'leri R2'ye at
window.magazaResimleriYukle = async function() {
  return Promise.all(_resimler.map(async r => {
    const fileName = `magaza_urunler/${window._aktifUid}/${Date.now()}_${r.file.name}`;
    const formData = new FormData();
    formData.append('file', r.file);
    formData.append('key', fileName);
    const res = await fetch(UPLOAD_URL, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Yükleme hatası');
    const data = await res.json();
    return data.url;
  }));
};

// ════════════════════════════════════════════════════════════════════════
// USTA — 1 kapak fotoğrafı
// ════════════════════════════════════════════════════════════════════════
window._ilanResimDosya = null;

window.ilanResimSec = async function(files) {
  const f = files[0];
  if (!f) return;
  if (f.size > MAX_BOYUT) {
    alert('⚠ Fotoğraf max 1.5MB olmalı! squoosh.app ile küçültün.');
    return;
  }
  const sikis = await gorselSikistir(f);
  window._ilanResimDosya = sikis.file;
  const img = document.getElementById('ilanResimImg');
  const oniz = document.getElementById('ilanResimOnizleme');
  const ph   = document.getElementById('ilanResimPlaceholder');
  if (img)  img.src = sikis.url;
  if (oniz) oniz.style.display = 'block';
  if (ph)   ph.style.display   = 'none';
};

window.ilanResimDrop = function(e) {
  e.preventDefault();
  window.ilanResimSec(e.dataTransfer.files);
};

window.ilanResimTemizle = function() {
  window._ilanResimDosya = null;
  const input = document.getElementById('ilanResimInput');
  const oniz  = document.getElementById('ilanResimOnizleme');
  const ph    = document.getElementById('ilanResimPlaceholder');
  if (input) input.value = '';
  if (oniz)  oniz.style.display  = 'none';
  if (ph)    ph.style.display    = 'block';
};

window.ilanKapakYukle = async function() {
  if (!window._ilanResimDosya) return null;
  return resimYukleR2(window._ilanResimDosya, 'ustam_ilanlar');
};

// ════════════════════════════════════════════════════════════════════════
// GENÇ-Z — 1 kapak fotoğrafı
// ════════════════════════════════════════════════════════════════════════
window._gzResimDosya = null;

window.gzResimSec = async function(files) {
  const f = files[0];
  if (!f) return;
  if (f.size > MAX_BOYUT) {
    alert('⚠ Fotoğraf max 1.5MB olmalı! squoosh.app ile küçültün.');
    return;
  }
  const sikis = await gorselSikistir(f);
  window._gzResimDosya = sikis.file;
  const img  = document.getElementById('gzResimImg');
  const oniz = document.getElementById('gzResimOnizleme');
  const ph   = document.getElementById('gzResimPlaceholder');
  if (img)  img.src = sikis.url;
  if (oniz) oniz.style.display = 'block';
  if (ph)   ph.style.display   = 'none';
};

window.gzResimDrop = function(e) {
  e.preventDefault();
  window.gzResimSec(e.dataTransfer.files);
};

window.gzResimTemizle = function() {
  window._gzResimDosya = null;
  const input = document.getElementById('gzResimInput');
  const oniz  = document.getElementById('gzResimOnizleme');
  const ph    = document.getElementById('gzResimPlaceholder');
  if (input) input.value = '';
  if (oniz)  oniz.style.display  = 'none';
  if (ph)    ph.style.display    = 'block';
};

window.gzKapakYukle = async function() {
  if (!window._gzResimDosya) return null;
  return resimYukleR2(window._gzResimDosya, 'gencz_icerikler');
};
