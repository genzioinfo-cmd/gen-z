/**
 * GEN-Z — İlan & Genç-Z Modülü
 * modpanel-ilan-gencz.js
 * getApp() kullanır — Firebase çakışması yok
 */
import { getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let db;
try {
  db = getFirestore(getApp());
} catch(e) {
  // App henüz init edilmemişse bekle
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
  const app = initializeApp({
    apiKey:"AIzaSyASkzJZdiW-Yj5HhxRub0UVtKPkERjCAVQ",
    authDomain:"gen-z-io.firebaseapp.com",
    projectId:"gen-z-io"
  });
  db = getFirestore(app);
}

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
window.ilanModalAc = function() {
  // Ustanın kategorisini belirle
  const katRaw = (_ustaVeri?.kategori || _ustaVeri?.isKolu || '').toLowerCase();
  const hizmetler = USTA_KAT_HIZMETLER[katRaw] || null;

  // Modal içeriği oluştur
  const modalEl = document.getElementById('ilanModalIcerik');
  if (!modalEl) return;

  const hizmetOptions = hizmetler
    ? hizmetler.map(h => `<div class="gz-kat-kart" onclick="ilanHizmetSec(this)" data-hizmet="${h}">${h}</div>`).join('')
    : Object.entries(USTA_KAT_HIZMETLER).map(([k,v]) =>
        `<optgroup label="${k.toUpperCase()}">${v.map(h=>`<option>${h}</option>`).join('')}</optgroup>`
      ).join('');

  modalEl.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:.9rem;">

      ${hizmetler ? `
      <div class="sm-blok">
        <div class="sm-blok-baslik">🔧 Hizmet Seçin</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.4rem;margin-top:.3rem;" id="ilanHizmetGrid">
          ${hizmetOptions}
        </div>
        <input class="fi" id="ilanHizmetOzel" placeholder="Listede yok? Buraya yaz…" style="margin-top:.5rem;font-size:.7rem;">
      </div>` : `
      <div class="sm-blok">
        <div class="sm-blok-baslik">🔧 Hizmet Türü</div>
        <select class="fi" id="ilanHizmetSec" style="font-size:.72rem;">${hizmetOptions}</select>
      </div>`}

      <div class="sm-blok">
        <div class="sm-blok-baslik">📝 İlan Detayları</div>
        <div style="display:flex;flex-direction:column;gap:.6rem;">
          <div>
            <label class="dan-lbl">İlan Başlığı *</label>
            <input class="fi" id="ilanBaslik" placeholder="Örn: Ankara'da Elektrik Tesisatı" style="font-size:.72rem;">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem;">
            <div>
              <label class="dan-lbl">Başlangıç Fiyatı (₺)</label>
              <input class="fi" id="ilanFiyat" type="number" placeholder="0" min="0" style="font-size:.72rem;">
            </div>
            <div>
              <label class="dan-lbl">Fiyat Tipi</label>
              <select class="fi" id="ilanFiyatTip" style="font-size:.72rem;">
                <option value="saat">Saatlik</option>
                <option value="is">İş Başı</option>
                <option value="m2">m² başına</option>
                <option value="gorusme">Görüşmeye göre</option>
              </select>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem;">
            <div>
              <label class="dan-lbl">Şehir</label>
              <input class="fi" id="ilanSehir" placeholder="Ankara" style="font-size:.72rem;" value="${_ustaVeri?.sehir||''}">
            </div>
            <div>
              <label class="dan-lbl">İlçe</label>
              <input class="fi" id="ilanIlce" placeholder="Çankaya" style="font-size:.72rem;" value="${_ustaVeri?.ilce||''}">
            </div>
          </div>
          <div>
            <label class="dan-lbl">Açıklama</label>
            <textarea class="fi" id="ilanAciklama" placeholder="Deneyiminizi, kullandığınız malzemeleri, garantiyi anlatın…" style="font-size:.72rem;min-height:80px;resize:vertical;"></textarea>
          </div>
          <div>
            <label class="dan-lbl">Müsait Günler / Saatler</label>
            <input class="fi" id="ilanMusait" placeholder="Hafta içi 08:00-18:00, Cumartesi 09:00-14:00" style="font-size:.72rem;" value="${_ustaVeri?.availability||''}">
          </div>
        </div>
      </div>

      <div class="ferr" id="ilanErr" style="display:none;"></div>
      <button onclick="ilanGonder()" style="padding:1rem;background:linear-gradient(135deg,#5a3eb0,#7B5CF0);color:#fff;border:none;border-radius:6px;font-family:'Syne',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.1em;cursor:pointer;">✦ Admin Onayına Gönder</button>
    </div>
  `;

  // Kart seçimi için CSS
  if (!document.getElementById('ilanKatCSS')) {
    const s = document.createElement('style');
    s.id = 'ilanKatCSS';
    s.textContent = `.gz-kat-kart{padding:.45rem .7rem;background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:6px;font-size:.65rem;cursor:pointer;transition:all .15s;text-align:center;} .gz-kat-kart:hover{border-color:var(--accent);} .gz-kat-kart.secili{background:rgba(123,92,240,.15);border-color:var(--accent);color:var(--accent2);font-weight:700;}`;
    document.head.appendChild(s);
  }

  document.getElementById('ilanModal').classList.add('open');
};

window.ilanHizmetSec = function(el) {
  document.querySelectorAll('#ilanHizmetGrid .gz-kat-kart').forEach(k=>k.classList.remove('secili'));
  el.classList.add('secili');
};

window.ilanModalKapat = function(e) {
  if (e && e.target !== document.getElementById('ilanModal')) return;
  document.getElementById('ilanModal').classList.remove('open');
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
    await addDoc(collection(db,'ustam_ilanlar'),{
      ustaUid    : _aktifUid,
      ustaAdi    : _ustaVeri?.displayName || _ustaVeri?.ad || '',
      ustaEmail  : _ustaVeri?.email || '',
      kategori   : (_ustaVeri?.kategori||_ustaVeri?.isKolu||hizmet).toLowerCase(),
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
    document.getElementById('ilanModal').classList.remove('open');
    toast('✦ İlanınız admin onayına gönderildi!');
    ustaYukle();
  } catch(e) {
    errEl.textContent='Hata: '+e.message; errEl.style.display='block';
  }
};


/* ══════════════════════════════════════════════════════════════
   GENÇ-Z İÇERİK PANELİ — Kategoriye göre dinamik form
══════════════════════════════════════════════════════════════ */

const GENCZ_KATEGORILER = {
  'Şiir & Edebiyat'    : { ikon:'📝', alanlar:['baslik','sure','tarz','aciklama','icerikMetin'] },
  'Kitap & Hikaye'     : { ikon:'📚', alanlar:['baslik','sayfa','tur','aciklama','dosyaLink'] },
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
  // Sadece ilk kez oluştur
  if (grid.dataset.hazir === '1') return;
  grid.dataset.hazir = '1';
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

window.gzIcerikGonder = async function() {
  if (!_gzSeciliKat) { toast('Lütfen bir kategori seçin.','err'); return; }
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
    await addDoc(collection(db,'gencz_icerikler'),{
      uid      : _aktifUid,
      email    : _ustaVeri?.email||'',
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

async function genczYukle() {
  if (!_aktifUid) return;
  try {
    const snap = await getDocs(query(
      collection(db,'gencz_icerikler'),
      where('uid','==',_aktifUid),
      orderBy('ts','desc')
    )).catch(()=>null);
    _gzIcerikler = snap ? snap.docs.map(d=>({id:d.id,...d.data()})) : [];

    // Özet
    const s = (id,v) => { const el=document.getElementById(id); if(el)el.textContent=v; };
    s('gzIcerikSay',  _gzIcerikler.length);
    s('gzOnayliSay',  _gzIcerikler.filter(i=>i.durum==='onaylandi').length);
    s('gzBekliyor',   _gzIcerikler.filter(i=>i.durum==='bekliyor').length);

    gzListeRender();
    genczKatGridOlustur();
  } catch(e) { console.error(e); }
}

function gzListeRender() {
  const el = document.getElementById('gzIcerikListesi');
  if (!el) return;
  let liste = _gzIcerikler;
  if (_gzFiltreSec!=='hepsi') liste=liste.filter(i=>i.durum===_gzFiltreSec);
  if (!liste.length) { el.innerHTML='<div style="text-align:center;padding:2rem;color:var(--t2);font-style:italic;">İçerik bulunamadı</div>'; return; }
  el.innerHTML=`<table><thead><tr><th>Kategori</th><th>Başlık</th><th>Açıklama</th><th>Tarih</th><th>Durum</th></tr></thead><tbody>
    ${liste.map(i=>{
      const durum=i.durum||'bekliyor';
      const durumT=durum==='onaylandi'?'✅ Onaylı':durum==='reddedildi'?'❌ Reddedildi':'⏳ Bekliyor';
      const tarih=i.ts?.toDate?i.ts.toDate().toLocaleDateString('tr-TR'):'—';
      return `<tr>
        <td style="font-size:.65rem;">${GENCZ_KATEGORILER[i.kategori]?.ikon||''} ${i.kategori||'—'}</td>
        <td style="font-weight:600;font-size:.72rem;">${i.baslik||'—'}</td>
        <td style="font-size:.65rem;color:var(--t2);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${i.aciklama||'—'}</td>
        <td style="font-size:.65rem;color:var(--t2);">${tarih}</td>
        <td><span style="font-size:.6rem;font-weight:700;">${durumT}</span></td>
      </tr>`;
    }).join('')}</tbody></table>`;
}

window.gzFiltre=function(tip,btn){
  _gzFiltreSec=tip;
  document.querySelectorAll('#sayfa-gencz-icerik .f-btn').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  gzListeRender();
};

// Genç-z sayfasına geçince grid oluştur — window.git hazır olana kadar bekle
function patchGit() {
  if (!window.git) { setTimeout(patchGit, 200); return; }
  const _orig = window.git;
  window.git = function(id, btn) {
    _orig(id, btn);
    if (id==='gencz-yeni') genczKatGridOlustur();
    if (id==='gencz-icerik'||id==='gencz-ozet') genczYukle();
  };
}
patchGit();
