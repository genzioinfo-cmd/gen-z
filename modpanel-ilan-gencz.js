/**
 * GEN-Z — İlan & Genç-Z Modülü
 * modpanel-ilan-gencz.js
 * getApp() kullanır — Firebase çakışması yok
 */
import { getApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, updateDoc, deleteDoc, doc }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// db lazy — her zaman hazır olan app'i kullan
const _db = () => getFirestore(getApps().length ? getApps()[0] : getApp());

// CSS: gz-kat-kart (modülden inject et)
(function() {
  if (document.getElementById('gzKatCSS')) return;
  const s = document.createElement('style');
  s.id = 'gzKatCSS';
  s.textContent = `
    .gz-kat-kart {
      padding:.5rem .8rem;background:rgba(255,255,255,.03);
      border:1px solid var(--border);border-radius:8px;
      font-size:.65rem;cursor:pointer;transition:all .15s;
      text-align:center;color:var(--cream);
    }
    .gz-kat-kart:hover { border-color:var(--accent);background:rgba(123,92,240,.08); }
    .gz-kat-kart.secili {
      background:rgba(123,92,240,.25) !important;
      border-color:var(--accent) !important;
      border-width:2px !important;
      color:var(--accent2) !important;
      font-weight:700 !important;
      transform:scale(1.03);
    }
  `;
  document.head.appendChild(s);
})();


/* ══════════════════════════════════════════════════════════════
   USTA İLAN EKLEME — Kategoriye göre dinamik form
══════════════════════════════════════════════════════════════ */

// Usta kategorilerine göre hizmet alanları
const USTA_KAT_HIZMETLER = {
  elektrik : ['Elektrik Tesisatı','Sigorta & Pano Yenileme','Aydınlatma Montajı','Topraklama','Arıza Tespiti & Onarım','Akıllı Ev Sistemleri'],
  dogalgaz : ['Kombi Bakım & Onarım','Doğalgaz Tesisatı','Kaçak Tespiti','Isıtma Sistemi Projesi','Baca Temizliği'],
  su       : ['Pis Su Tesisatı','Temiz Su Hattı','Tıkanıklık Açma','Banyo Renovasyon','Mutfak Tesisatı','Hidrofor Montajı'],
  boya     : ['İç Cephe Boya','Dış Cephe Boya','Dekoratif Duvar','Alçı & Sıva','Macun & Zımpara','Duvar Kağıdı'],
  insaat   : ['Kaba İnşaat','Tadilat & Renovasyon','Duvar Örme & Yıkım','Çatı & İzolasyon','Şap Döşeme','Beton İşleri'],
  klima    : ['Klima Montajı','Klima Bakım & Onarım','Yerden Isıtma','Kalorifer Tesisatı','Isı Pompası','VRF Sistemi'],
  seramik  : ['Seramik Döşeme','Fayans','Parke','Laminat','Mermer & Granit','Epoksi Zemin'],
  marangoz : ['Mutfak Dolabı','Gardrop','Kapı & Pencere','Ahşap Tamir','Özgün Tasarım','Dekoratif Ahşap'],
  cam      : ['PVC Pencere','Alüminyum Doğrama','Cam Balkon','Sürgülü Kapı','Ofis Bölme','Cam Balustrat'],
  alcipan  : ['Asma Tavan','Bölme Duvar','Alçı Dekorasyon','Ses Yalıtımı','Isı Yalıtımı','Kartonpiyer'],
  demir    : ['Kaynak İşleri','Korkuluk & Demir','Çelik Kapı','Metal Konstrüksiyon','Ferforje'],
  nakliye  : ['Ev Taşıma','Ofis Taşıma','Eşya Depolama','Paketleme','Piyano Taşıma'],
  temizlik : ['Ev Temizliği','Ofis Temizliği','İnşaat Sonrası','Halı Yıkama','Dezenfeksiyon','Derin Temizlik'],
  bahce    : ['Çim Biçme','Peyzaj Tasarımı','Sulama Sistemi','Ağaç Budama','Çiçek Dikimi'],
  guvenlik : ['Kamera Kurulum','Alarm Sistemi','Parmak İzi Sistemi','Otomatik Kapı','Bina Güvenliği'],
  araba    : ['Motor Revizyonu','Fren Sistemi','Süspansiyon','Periyodik Bakım','Yağ Değişimi','Elektrik Arıza','Kaporta & Boya','Oto Cam','Lastik Değişimi','Detailing'],
  beyazes  : ['Çamaşır Makinesi','Buzdolabı','Bulaşık Makinesi','Fırın & Ocak','Klima','TV & Elektronik'],
  elektronik:['Bilgisayar Tamiri','Telefon Tamiri','Yazıcı Bakım','Ağ Kurulumu','CCTV'],
  kombi    : ['Kombi Bakım','Arıza Tamiri','Baca Temizliği','Isıtma Projesi','Radyatör'],
  hafriyat : ['Temel Kazısı','Hafriyat Nakliye','Ekskavatör Kiralama','Sondaj'],
};

// Usta ilanı modal aç
// Form içeriğini oluştur — sayfa yüklenince çağrılır
function ilanFormIcerikOlustur() {
  const katRaw = (window._ustaVeri?.kategori || window._ustaVeri?.isKolu || '').toLowerCase();
  const hizmetler = USTA_KAT_HIZMETLER[katRaw] || null;

  const hizmetOptions = hizmetler
    ? hizmetler.map(h => `<div class="gz-kat-kart" onclick="ilanHizmetSec(this)" data-hizmet="${h}">${h}</div>`).join('')
    : Object.entries(USTA_KAT_HIZMETLER).map(([k,v]) =>
        `<optgroup label="${k.toUpperCase()}">${v.map(h=>`<option>${h}</option>`).join('')}</optgroup>`
      ).join('');

  return `
    <div style="display:flex;flex-direction:column;gap:.9rem;">
      ${hizmetler ? `
      <div class="fa">
        <label>🔧 Hizmet Seçin *</label>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.4rem;" id="ilanHizmetGrid">
          ${hizmetOptions}
        </div>
        <input class="fi" id="ilanHizmetOzel" placeholder="Listede yok? Buraya yaz…" style="margin-top:.5rem;font-size:.7rem;">
      </div>` : `
      <div class="fa">
        <label>🔧 Hizmet Türü *</label>
        <select class="fi" id="ilanHizmetSec" style="font-size:.72rem;">${hizmetOptions}</select>
      </div>`}

      <div class="f2">
        <div class="fa">
          <label>İlan Başlığı *</label>
          <input class="fi" id="ilanBaslik" placeholder="Örn: Ankara'da Elektrik Tesisatı" style="font-size:.72rem;">
        </div>
        <div class="fa">
          <label>Başlangıç Fiyatı (₺)</label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;">
            <input class="fi" id="ilanFiyat" type="number" placeholder="0" min="0" style="font-size:.72rem;">
            <select class="fi" id="ilanFiyatTip" style="font-size:.72rem;">
              <option value="saat">Saatlik</option>
              <option value="is">İş Başı</option>
              <option value="m2">m² başına</option>
              <option value="gorusme">Görüşmeye göre</option>
            </select>
          </div>
        </div>
      </div>

      <div class="f2">
        <div class="fa">
          <label>Şehir</label>
          <input class="fi" id="ilanSehir" placeholder="Ankara" style="font-size:.72rem;" value="${window._ustaVeri?.sehir||''}">
        </div>
        <div class="fa">
          <label>İlçe</label>
          <input class="fi" id="ilanIlce" placeholder="Çankaya" style="font-size:.72rem;" value="${window._ustaVeri?.ilce||''}">
        </div>
      </div>

      <div class="fa">
        <label>Açıklama</label>
        <textarea class="fi" id="ilanAciklama" placeholder="Deneyiminizi, kullandığınız malzemeleri, garantiyi anlatın…" style="font-size:.72rem;min-height:80px;resize:vertical;"></textarea>
      </div>

      <div class="fa">
        <label>Müsait Günler / Saatler</label>
        <input class="fi" id="ilanMusait" placeholder="Hafta içi 08:00-18:00, Cumartesi 09:00-14:00" style="font-size:.72rem;" value="${window._ustaVeri?.availability||''}">
      </div>

      <div class="ferr" id="ilanErr" style="display:none;"></div>
      <div class="fok" id="ilanOk" style="display:none;"></div>

      <div style="display:flex;gap:.6rem;">
        <button onclick="ilanGonder()" class="submit-btn" style="flex:2;">✦ Admin Onayına Gönder</button>
        <button onclick="ilanFormSifirla()" style="padding:.9rem 1.2rem;background:transparent;border:1px solid rgba(201,168,76,.22);color:var(--t2);font-family:'DM Sans',sans-serif;font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;cursor:pointer;border-radius:3px;">✕ Sıfırla</button>
      </div>
    </div>`;
}

window.ilanFormSifirla = function() {
  const el = document.getElementById('ilanFormIcerik');
  if(el) el.innerHTML = ilanFormIcerikOlustur();
};

// Sayfa açılınca formu doldur
window.ilanSayfasiAc = function() {
  const el = document.getElementById('ilanFormIcerik');
  if(el && el.children.length <= 1) {
    el.innerHTML = ilanFormIcerikOlustur();
  }
  if(typeof ustaYukle === 'function') ustaYukle();
};

window.ilanGonder = async function() {
  const errEl = document.getElementById('ilanErr');
  errEl.style.display = 'none';

  // Hizmet
  const seciliKart = document.querySelector('#ilanHizmetGrid .gz-kat-kart.secili');
  const hizmetOzel = document.getElementById('ilanHizmetOzel')?.value.trim();
  const hizmetSec  = document.getElementById('ilanHizmetSec')?.value;
  const hizmet     = hizmetOzel || seciliKart?.dataset.hizmet || hizmetSec || '';

  const baslik  = document.getElementById('ilanBaslik')?.value.trim();
  const fiyat   = parseFloat(document.getElementById('ilanFiyat')?.value)||0;
  const fiyatTip= document.getElementById('ilanFiyatTip')?.value||'is';
  const sehir   = document.getElementById('ilanSehir')?.value.trim();
  const ilce    = document.getElementById('ilanIlce')?.value.trim();
  const aciklama= document.getElementById('ilanAciklama')?.value.trim();
  const musait  = document.getElementById('ilanMusait')?.value.trim();

  if (!baslik) { errEl.textContent='İlan başlığı zorunludur.'; errEl.style.display='block'; return; }
  if (!hizmet) { errEl.textContent='Hizmet türü seçin.'; errEl.style.display='block'; return; }

  try {
    await addDoc(collection(_db(),'ustam_ilanlar'),{
      ustaUid    : window._aktifUid,
      ustaAdi    : window._ustaVeri?.displayName || window._ustaVeri?.ad || '',
      ustaEmail  : window._ustaVeri?.email || '',
      kategori   : (window._ustaVeri?.kategori || window._ustaVeri?.isKolu || hizmet).toLowerCase(),
      hizmet,
      ad         : baslik,
      fiyat,
      fiyatTip,
      sehir,
      ilce,
      aciklama,
      musaitlik  : musait,
      durum      : 'bekliyor',
      ts         : serverTimestamp()
    });
    const okEl = document.getElementById('ilanOk');
    if(okEl){ okEl.textContent='✦ İlanınız admin onayına gönderildi!'; okEl.style.display='block'; setTimeout(()=>okEl.style.display='none',4000); }
    ilanFormSifirla();
    if(typeof ustaYukle==='function') ustaYukle();
  } catch(e) {
    errEl.textContent='Hata: '+e.message; errEl.style.display='block';
  }
};


/* ══════════════════════════════════════════════════════════════
   GENÇ-Z İÇERİK PANELİ — Kategoriye göre dinamik form
══════════════════════════════════════════════════════════════ */

const GENCZ_KATEGORILER = {
  'Şiir & Edebiyat'    : { ikon:'📝', alanlar:['baslik','sure','tarz','aciklama','icerikMetin','publuu'] },
  'Kitap & Hikaye'     : { ikon:'📚', alanlar:['baslik','sayfa','tur','aciklama','publuu','dosyaLink'] },
  'Grafik Tasarım'     : { ikon:'🎨', alanlar:['baslik','format','program','aciklama','portfolyoLink'] },
  'Fotoğrafçılık'      : { ikon:'📷', alanlar:['baslik','teknik','ekipman','aciklama','portfolyoLink'] },
  'Müzik'              : { ikon:'🎵', alanlar:['baslik','tur','enstruman','aciklama','linkUrl'] },
  'Video & İçerik'     : { ikon:'🎬', alanlar:['baslik','sure','platform','aciklama','linkUrl'] },
  'İllüstrasyon'       : { ikon:'🖌️', alanlar:['baslik','teknik','format','aciklama','portfolyoLink'] },
  'El Sanatları'       : { ikon:'✂️', alanlar:['baslik','malzeme','boyut','aciklama','fiyat'] },
  'Dijital Sanat'      : { ikon:'💻', alanlar:['baslik','program','format','aciklama','portfolyoLink'] },
  'Diğer'              : { ikon:'⚡', alanlar:['baslik','aciklama','linkUrl'] },
};

const GENCZ_ALAN_LABELS = {
  baslik       : { label:'Başlık *',           type:'text',     placeholder:'Eserinizin adı' },
  aciklama     : { label:'Açıklama *',         type:'textarea', placeholder:'Eserinizi kısaca anlatın…' },
  tarz         : { label:'Tarz / Tür',         type:'text',     placeholder:'Serbest nazım, sonnet…' },
  sure         : { label:'Sayfa / Süre',       type:'text',     placeholder:'3 sayfa / 2:30 dk' },
  sayfa        : { label:'Sayfa Sayısı',       type:'number',   placeholder:'0' },
  tur          : { label:'Tür',                type:'text',     placeholder:'Roman, hikaye, deneme…' },
  format       : { label:'Format / Boyut',     type:'text',     placeholder:'A4, 1920x1080…' },
  program      : { label:'Kullanılan Program', type:'text',     placeholder:'Photoshop, Illustrator…' },
  teknik       : { label:'Teknik',             type:'text',     placeholder:'Suluboya, dijital…' },
  ekipman      : { label:'Ekipman',            type:'text',     placeholder:'Canon EOS R5…' },
  enstruman    : { label:'Enstrüman / Tür',    type:'text',     placeholder:'Gitar, elektronik…' },
  platform     : { label:'Platform',           type:'text',     placeholder:'YouTube, Instagram…' },
  malzeme      : { label:'Malzeme',            type:'text',     placeholder:'Keçe, ahşap, seramik…' },
  boyut        : { label:'Boyut',              type:'text',     placeholder:'20x30 cm' },
  fiyat        : { label:'Fiyat (₺)',          type:'number',   placeholder:'0 — 0 ise ücretsiz' },
  publuu       : { label:'📖 Publuu Kitap Linki', type:'url', placeholder:'https://publuu.com/flip-book/xxxxx' },
  portfolyoLink: { label:'Portföy / Galeri Linki', type:'url', placeholder:'https://…' },
  dosyaLink    : { label:'Dosya / Drive Linki',type:'url',      placeholder:'https://…' },
  linkUrl      : { label:'İçerik Linki',       type:'url',      placeholder:'https://…' },
  icerikMetin  : { label:'İçerik Metni',       type:'textarea', placeholder:'Şiir, kısa hikaye metnini buraya yapıştırın…' },
};

let _gzSeciliKat = null;
let _gzFiltreSec = 'hepsi';
let _gzIcerikler = [];

// Kategori grid'i oluştur
window.genczKatGridOlustur = function() {
  const grid = document.getElementById('gzKatGrid');
  if (!grid) return;
  // Her seferinde yeniden oluştur
  grid.innerHTML = '';
  Object.entries(GENCZ_KATEGORILER).forEach(([ad, meta]) => {
    const el = document.createElement('div');
    el.className = 'gz-kat-kart';
    el.innerHTML = `<div style="font-size:1.4rem;margin-bottom:.3rem;">${meta.ikon}</div><div style="font-size:.65rem;font-weight:600;">${ad}</div>`;
    el.onclick = () => gzKatSec(ad, el);
    grid.appendChild(el);
  });
};

window.gzKatSec = function(ad, el) {
  _gzSeciliKat = ad;
  document.querySelectorAll('#gzKatGrid .gz-kat-kart').forEach(k=>k.classList.remove('secili'));
  el.classList.add('secili');

  const meta    = GENCZ_KATEGORILER[ad];
  const formDiv = document.getElementById('gzDinamikForm');
  const alanDiv = document.getElementById('gzFormAlanlar');
  const baslik  = document.getElementById('gzFormBaslik');

  baslik.textContent = meta.ikon + ' ' + ad + ' İçeriği';

  alanDiv.innerHTML = meta.alanlar.map(alan => {
    const cfg = GENCZ_ALAN_LABELS[alan];
    if (!cfg) return '';
    if (cfg.type === 'textarea') {
      return `<div><label class="dan-lbl">${cfg.label}</label>
        <textarea class="fi" id="gzAlan_${alan}" placeholder="${cfg.placeholder}" style="font-size:.72rem;min-height:70px;resize:vertical;"></textarea></div>`;
    }
    return `<div><label class="dan-lbl">${cfg.label}</label>
      <input class="fi" id="gzAlan_${alan}" type="${cfg.type||'text'}" placeholder="${cfg.placeholder}" style="font-size:.72rem;"></div>`;
  }).join('');

  formDiv.style.display = 'flex';
  const errEl = document.getElementById('gzErr');
  const okEl  = document.getElementById('gzOk');
  if(errEl){errEl.style.display='none';} if(okEl){okEl.style.display='none';}
};

// Publuu önizleme
window.publuuOnizle = function(url) {
  const div    = document.getElementById('publuuOnizleDiv');
  const iframe = document.getElementById('publuuIframe');
  if(!div || !iframe) return;
  if(!url || !url.includes('publuu.com')) { div.style.display='none'; return; }
  // Publuu embed URL formatı
  let embedUrl = url.trim();
  if(embedUrl.includes('/flip-book/')) {
    embedUrl = embedUrl.replace('publuu.com/flip-book/','publuu.com/embed/');
  }
  iframe.src = embedUrl;
  div.style.display = 'block';
};

window.gzIcerikGonder = async function() {
  if (!_gzSeciliKat) { (typeof toast==='function'?toast:window.toast||console.log)('Lütfen bir kategori seçin.','err'); return; }
  const errEl = document.getElementById('gzErr');
  const okEl  = document.getElementById('gzOk');
  errEl.style.display = 'none';

  const meta   = GENCZ_KATEGORILER[_gzSeciliKat];
  const veri   = {};
  let eksik    = false;

  meta.alanlar.forEach(alan => {
    const el = document.getElementById('gzAlan_'+alan);
    if (el) {
      veri[alan] = el.value.trim();
      if ((alan==='baslik'||alan==='aciklama') && !veri[alan]) eksik = true;
    }
  });

  if (eksik) { errEl.textContent='Başlık ve açıklama zorunludur.'; errEl.style.display='block'; return; }

  try {
    await addDoc(collection(_db(),'gencz_icerikler'),{
      uid      : window._aktifUid,
      email    : window._ustaVeri?.email||'',
      kategori : _gzSeciliKat,
      ...veri,
      durum    : 'bekliyor',
      ts       : serverTimestamp()
    });
    okEl.textContent = '✅ İçeriğiniz admin onayına gönderildi!';
    okEl.style.display = 'block';
    // Formu sıfırla
    meta.alanlar.forEach(alan => { const el=document.getElementById('gzAlan_'+alan); if(el) el.value=''; });
    _gzSeciliKat = null;
    document.querySelectorAll('#gzKatGrid .gz-kat-kart').forEach(k=>k.classList.remove('secili'));
    document.getElementById('gzDinamikForm').style.display='none';
    genczYukle();
  } catch(e) {
    errEl.textContent='Hata: '+e.message; errEl.style.display='block';
  }
};

window.genczYukle = async function genczYukle() {
  if (!window._aktifUid) return;
  try {
    const snap = await getDocs(query(
      collection(_db(),'gencz_icerikler'),
      where('uid','==',window._aktifUid)
    )).catch(()=>null);
    _gzIcerikler = snap ? snap.docs.map(d=>({id:d.id,...d.data()})) : [];
    // Client-side sırala (index gerektirmez)
    _gzIcerikler.sort((a,b)=>(b.ts?.seconds||0)-(a.ts?.seconds||0));

    // Özet
    const s = (id,v) => { const el=document.getElementById(id); if(el)el.textContent=v; };
    s('gzIcerikSay',  _gzIcerikler.length);
    s('gzOnayliSay',  _gzIcerikler.filter(i=>i.durum==='onaylandi').length);
    s('gzBekliyor',   _gzIcerikler.filter(i=>i.durum==='bekliyor').length);

    gzListeRender();
    genczKatGridOlustur();
  } catch(e) { console.error(e); }
}

window.gzListeRender = function gzListeRender() {
  const el = document.getElementById('gzIcerikListesi');
  if (!el) return;
  let liste = _gzIcerikler;
  if (_gzFiltreSec!=='hepsi') liste=liste.filter(i=>i.durum===_gzFiltreSec);
  if (!liste.length) { el.innerHTML='<div style="text-align:center;padding:2rem;color:var(--t2);font-style:italic;">İçerik bulunamadı</div>'; return; }
  el.innerHTML=liste.map(i=>{
    const durum=i.durum||'bekliyor';
    const durumRenk=durum==='onaylandi'?'var(--green)':durum==='reddedildi'?'var(--red)':'var(--orange)';
    const durumT=durum==='onaylandi'?'✅ Onaylı':durum==='reddedildi'?'❌ Reddedildi':'⏳ Bekliyor';
    const tarih=i.ts?.toDate?i.ts.toDate().toLocaleDateString('tr-TR'):'—';
    const redSebebiHTML = durum==='reddedildi' && i.redSebep
      ? `<div style="margin-top:.5rem;padding:.5rem .7rem;background:rgba(224,85,85,.07);border:1px solid rgba(224,85,85,.2);border-radius:4px;">
          <div style="font-size:.5rem;letter-spacing:.12em;text-transform:uppercase;color:var(--red);margin-bottom:.2rem;">⚠️ Red Sebebi</div>
          <div style="font-size:.65rem;color:rgba(240,238,255,.75);line-height:1.6;">${i.redSebep}</div>
        </div>` : '';
    const tekrarBtn = durum==='reddedildi'
      ? `<button onclick="gzTekrarGonderModal('${i.id}')" style="margin-top:.5rem;padding:.4rem .9rem;background:rgba(92,240,180,.08);border:1px solid rgba(92,240,180,.3);color:#5CF0B4;border-radius:4px;font-family:'DM Sans',sans-serif;font-size:.58rem;letter-spacing:.1em;cursor:pointer;">🔄 Düzelt & Tekrar Gönder</button>` : '';
    const silBtn = `<button onclick="gzSil('${i.id}')" style="margin-top:.5rem;margin-left:.4rem;padding:.4rem .9rem;background:rgba(224,85,85,.07);border:1px solid rgba(224,85,85,.25);color:var(--red);border-radius:4px;font-family:'DM Sans',sans-serif;font-size:.58rem;letter-spacing:.1em;cursor:pointer;">🗑 Sil</button>`;
    return `<div style="background:rgba(255,255,255,.022);border:1px solid var(--border);border-radius:6px;padding:1rem 1.2rem;margin-bottom:.7rem;${durum==='reddedildi'?'border-color:rgba(224,85,85,.25);':''}">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;">
        <div>
          <span style="font-size:.5rem;background:rgba(123,92,240,.12);color:#a78bfa;border:1px solid rgba(123,92,240,.25);padding:.1rem .45rem;border-radius:10px;margin-right:.4rem;">${GENCZ_KATEGORILER[i.kategori]?.ikon||''} ${i.kategori||'—'}</span>
          <strong style="font-size:.75rem;">${i.baslik||'—'}</strong>
          <div style="font-size:.62rem;color:var(--t2);margin-top:.2rem;">${i.aciklama||'—'}</div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <span style="font-size:.6rem;font-weight:700;color:${durumRenk};">${durumT}</span>
          <div style="font-size:.55rem;color:var(--t2);margin-top:.15rem;">${tarih}</div>
        </div>
      </div>
      ${redSebebiHTML}
      <div>${tekrarBtn}${silBtn}</div>
    </div>`;
  }).join('');
};

window.gzFiltre=function(tip,btn){
  _gzFiltreSec=tip;
  document.querySelectorAll('#sayfa-gencz-icerik .f-btn').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  gzListeRender();
};

window.gzTekrarGonderModal = function(id) {
  const i = _gzIcerikler.find(x=>x.id===id);
  if(!i) return;
  // Modal yoksa oluştur
  let modal = document.getElementById('gzTekrarModal');
  if(!modal){
    modal = document.createElement('div');
    modal.id = 'gzTekrarModal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,.75);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:1rem;';
    modal.innerHTML = `
      <div style="background:#0d0d14;border:1px solid rgba(123,92,240,.25);border-radius:8px;padding:1.6rem;width:min(460px,94vw);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
          <h3 style="font-family:'Syne',sans-serif;font-size:1rem;font-weight:300;">🔄 Tekrar Gönder</h3>
          <button onclick="document.getElementById('gzTekrarModal').remove()" style="background:none;border:none;color:var(--t2);font-size:1.2rem;cursor:pointer;">✕</button>
        </div>
        <p style="font-size:.68rem;color:var(--t2);margin-bottom:1rem;line-height:1.7;">Admin'e bir not bırakabilirsin. Örn: "Görsel güncellendi", "Açıklama düzeltildi"</p>
        <label style="display:block;font-size:.5rem;letter-spacing:.2em;text-transform:uppercase;color:var(--t2);margin-bottom:.4rem;">Notun (isteğe bağlı)</label>
        <textarea id="gzTekrarNot" placeholder="Örn: Görseli değiştirdim, fiyatı güncelledim…"
          style="width:100%;min-height:90px;background:rgba(255,255,255,.03);border:1px solid rgba(123,92,240,.2);border-radius:4px;padding:.7rem 1rem;font-family:'DM Sans',sans-serif;font-size:.72rem;color:var(--cream);outline:none;resize:vertical;line-height:1.6;"></textarea>
        <div style="display:flex;gap:.6rem;margin-top:1rem;justify-content:flex-end;">
          <button onclick="document.getElementById('gzTekrarModal').remove()" style="padding:.6rem 1.2rem;background:none;border:1px solid var(--border);color:var(--t2);border-radius:4px;font-family:'DM Sans',sans-serif;font-size:.62rem;cursor:pointer;">İptal</button>
          <button id="gzTekrarOnayla" style="padding:.6rem 1.4rem;background:rgba(92,240,180,.1);border:1px solid rgba(92,240,180,.3);color:#5CF0B4;border-radius:4px;font-family:'DM Sans',sans-serif;font-size:.62rem;font-weight:700;cursor:pointer;">🔄 Onaya Gönder</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }
  document.getElementById('gzTekrarNot').value = '';
  document.getElementById('gzTekrarOnayla').onclick = () => gzTekrarGonderOnayla(id);
};

window.gzTekrarGonderOnayla = async function(id) {
  const not = document.getElementById('gzTekrarNot')?.value.trim();
  try {
    const guncelleme = { durum:'bekliyor', redSebep:null, guncellendi:serverTimestamp() };
    if(not) guncelleme.duzeltmeNotu = not;
    await updateDoc(doc(_db(),'gencz_icerikler',id), guncelleme);
    const i = _gzIcerikler.find(x=>x.id===id);
    if(i){ i.durum='bekliyor'; i.redSebep=null; }
    document.getElementById('gzTekrarModal')?.remove();
    if(typeof toast==='function') toast('✅ İçerik tekrar onaya gönderildi!');
    gzListeRender();
  } catch(e) {
    if(typeof toast==='function') toast('Hata: '+e.message,'err');
  }
};

window.gzSil = async function(id) {
  if(!confirm('Bu içeriği silmek istediğine emin misin?')) return;
  try {
    await deleteDoc(doc(_db(),'gencz_icerikler',id));
    _gzIcerikler = _gzIcerikler.filter(x=>x.id!==id);
    if(typeof toast==='function') toast('🗑 İçerik silindi.');
    gzListeRender();
    const s=(elId,v)=>{const el=document.getElementById(elId);if(el)el.textContent=v;};
    s('gzIcerikSay', _gzIcerikler.length);
    s('gzOnayliSay', _gzIcerikler.filter(i=>i.durum==='onaylandi').length);
    s('gzBekliyor',  _gzIcerikler.filter(i=>i.durum==='bekliyor').length);
  } catch(e) {
    if(typeof toast==='function') toast('Hata: '+e.message,'err');
  }
};

// Genç-z sayfasına geçince grid oluştur — window.git hazır olana kadar bekle
function patchGit() {
  if (!window.git) { setTimeout(patchGit, 200); return; }
  const _orig = window.git;
  window.git = function(id, btn) {
    _orig(id, btn);
    if (id==='gencz-yeni') genczKatGridOlustur();
    if (id==='gencz-icerik'||id==='gencz-ozet') genczYukle();
    if (id==='usta-ilanlar') ilanSayfasiAc();
  };
}
patchGit();
