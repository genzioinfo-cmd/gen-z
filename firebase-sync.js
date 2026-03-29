// GEN-Z Firebase Sync Modülü
// Sepet, adres, sipariş, bildirim verilerini Firestore ile senkronize eder.
// Tüm sayfalara <script type="module" src="firebase-sync.js"></script> ile eklenir.

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyASkzJZdiW-Yj5HhxRub0UVtKPkERjCAVQ",
  authDomain: "gen-z-io.firebaseapp.com",
  projectId: "gen-z-io",
  storageBucket: "gen-z-io.firebasestorage.app",
  messagingSenderId: "97338868944",
  appId: "1:97338868944:web:d7b429e416d8c505b14ad5"
};

const app  = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ── Hangi localStorage anahtarları Firestore'a taşınacak ──
const SYNC_KEYS = {
  'genz-sepet'    : 'sepet',
  'genz-adresler' : 'adresler',
  'genz-siparisler': 'siparisler',
  'genz-bildirimler': 'bildirimler',
  'genz-favoriler'  : 'favoriler',
  'genz-yorumlar'   : 'yorumlar',
};

// ── Firestore'dan kullanıcı verisini yükle → localStorage'a yaz ──
async function firestoredenYukle(uid) {
  try {
    const ref  = doc(db, 'kullanici_verileri', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data();
    Object.entries(SYNC_KEYS).forEach(([lsKey, fsKey]) => {
      if (data[fsKey] !== undefined) {
        localStorage.setItem(lsKey, JSON.stringify(data[fsKey]));
      }
    });
    window.dispatchEvent(new CustomEvent('genzSyncYuklendi'));

    // Pro modül badge güncelle
    const kulRef  = doc(db, 'kullanicilar', uid);
    const kulSnap = await getDoc(kulRef).catch(()=>null);
    if(kulSnap?.exists()) {
      const ud = kulSnap.data();
      window._genzKullanici = ud;
      _rolBadgeGuncelle(ud);
    }
  } catch(e) {
    console.warn('Firestore yükleme hatası:', e);
  }
}

function _rolBadgeGuncelle(ud) {
  const badge = document.getElementById('profileRoleBadge');
  if(!badge) return;
  const rol    = ud.rol || '';
  const roller = ud.roller || [];
  const isPro  = ud.proModul === true;
  const isAdmin= rol==='admin' || roller.includes('admin');

  let rozetler = [];
  if(isAdmin)              rozetler.push({txt:'👑 Admin',         bg:'rgba(201,168,76,.2)', renk:'#F0C55C', border:'rgba(201,168,76,.4)'});
  if(isPro)                rozetler.push({txt:'⚡ Büyük Mağaza',  bg:'rgba(201,168,76,.12)',renk:'#d4a83e', border:'rgba(201,168,76,.35)'});
  if(roller.includes('usta')||ud.ustaOnay)
                           rozetler.push({txt:'🔨 Usta',          bg:'rgba(123,92,240,.15)',renk:'#a78bfa', border:'rgba(123,92,240,.3)'});
  if(roller.includes('gencz')||ud.gencimDurum==='onaylandi'||ud.rol==='gencz')
                           rozetler.push({txt:'⚡ Genç-Z',        bg:'rgba(92,240,180,.1)', renk:'#5CF0B4', border:'rgba(92,240,180,.25)'});
  if(ud.magazaOnay||roller.includes('satici'))
                           rozetler.push({txt:'🏪 Satıcı',        bg:'rgba(255,153,102,.1)',renk:'#ff9966', border:'rgba(255,153,102,.25)'});

  if(!rozetler.length)     rozetler.push({txt:'👤 Üye',           bg:'rgba(255,255,255,.05)',renk:'var(--text3)', border:'rgba(255,255,255,.1)'});

  badge.innerHTML = rozetler.map(r=>
    `<span style="display:inline-flex;align-items:center;padding:.25rem .7rem;border-radius:20px;font-size:.65rem;font-weight:700;background:${r.bg};color:${r.renk};border:1px solid ${r.border};margin-right:.3rem;">${r.txt}</span>`
  ).join('');
}

// ── localStorage'ı Firestore'a kaydet ──
async function firestoreKaydet(uid, extraData = {}) {
  try {
    const payload = { guncellendi: serverTimestamp(), ...extraData };
    Object.entries(SYNC_KEYS).forEach(([lsKey, fsKey]) => {
      try {
        const raw = localStorage.getItem(lsKey);
        payload[fsKey] = raw ? JSON.parse(raw) : [];
      } catch { payload[fsKey] = []; }
    });
    const ref = doc(db, 'kullanici_verileri', uid);
    await setDoc(ref, payload, { merge: true });
  } catch(e) {
    console.warn('Firestore kaydetme hatası:', e);
  }
}

// ── Çıkışta tüm hassas localStorage verilerini temizle ──
function hassasVerileriTemizle() {
  // genz-sepet kasitli olarak silinmez — misafir kullanici sepeti korunur
  const KORU = ['genz-sepet', 'genz-theme', 'genz-lang'];
  Object.keys(SYNC_KEYS).forEach(k => {
    if (!KORU.includes(k)) localStorage.removeItem(k);
  });
  localStorage.removeItem('genz-user');
  window.dispatchEvent(new CustomEvent('genzSyncTemizlendi'));
}

// ── Otomatik senkronizasyon: localStorage değişince Firestore'a yaz ──
let _uid = null;
let _syncTimer = null;

function otomatikSenkron() {
  if (!_uid) return;
  clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => firestoreKaydet(_uid), 1500); // 1.5sn debounce
}

// localStorage değişikliklerini izle
const _orijinalSetItem = localStorage.setItem.bind(localStorage);
const _orijinalRemoveItem = localStorage.removeItem.bind(localStorage);

localStorage.setItem = function(key, value) {
  _orijinalSetItem(key, value);
  if (Object.keys(SYNC_KEYS).includes(key)) otomatikSenkron();
};

localStorage.removeItem = function(key) {
  _orijinalRemoveItem(key);
  if (Object.keys(SYNC_KEYS).includes(key)) otomatikSenkron();
};

// ── Auth state takibi ──
onAuthStateChanged(auth, async (user) => {
  if (user) {
    _uid = user.uid;
    await firestoredenYukle(user.uid); // Giriş → Firestore'dan yükle
  } else {
    if (_uid) {
      // Çıkış → önce kaydet sonra temizle
      await firestoreKaydet(_uid);
      hassasVerileriTemizle();
    }
    _uid = null;
  }
});

// ── Sayfa kapanmadan önce kaydet ──
window.addEventListener('beforeunload', () => {
  if (_uid) firestoreKaydet(_uid);
});

// ── Global erişim ──
window._genzSync = {
  kaydet: () => _uid && firestoreKaydet(_uid),
  yukle:  () => _uid && firestoredenYukle(_uid),
  temizle: hassasVerileriTemizle,
};

/* ══════════════════════════════════════════════════
   KVKK & GDPR — Zorunlu Rıza & Veri Yönetimi
   ══════════════════════════════════════════════════ */

/**
 * Kullanıcının KVKK/Gizlilik rızasını Firestore'a kaydet
 * Çağrı zamanı: ilk kayıt veya rıza güncellemesi
 */
export async function kvkkRizaKaydet(uid, secimler = {}) {
  try {
    const riza = {
      kvkkOkundu:          secimler.kvkk        ?? true,
      kullanımSartlari:    secimler.kullanim     ?? true,
      pazarlamaIzni:       secimler.pazarlama    ?? false,
      cerezIzni:           secimler.cerez        ?? false,
      ucuncuTarafPaylaşım: secimler.ucuncuTaraf  ?? false,
      rizaTarihi:          new Date().toISOString(),
      rizaIp:              'client-side',        // sunucu tarafında doldurulabilir
      rizaVersiyon:        '1.0',
    };
    await setDoc(doc(db, 'kullanici_verileri', uid), { kvkk: riza }, { merge: true });
    await setDoc(doc(db, 'kullanicilar', uid),      { kvkk: riza }, { merge: true });
    console.info('KVKK rızası kaydedildi');
    return true;
  } catch(e) {
    console.warn('KVKK kayıt hatası:', e);
    return false;
  }
}

/**
 * Kullanıcının kişisel verilerini dışa aktar (KVKK Madde 11 — Erişim Hakkı)
 */
export async function kisiselVeriDısaAktar(uid) {
  try {
    const [kulRef, verRef] = await Promise.all([
      getDoc(doc(db, 'kullanicilar', uid)),
      getDoc(doc(db, 'kullanici_verileri', uid)),
    ]);
    const veri = {
      profil:   kulRef.exists()  ? kulRef.data()  : {},
      veriler:  verRef.exists()  ? verRef.data()  : {},
      ihracTarihi: new Date().toISOString(),
    };
    // Hassas alanları çıkar
    delete veri.profil.passwordHash;
    const blob = new Blob([JSON.stringify(veri, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'kisisel-verilerim.json'; a.click();
    URL.revokeObjectURL(url);
    return true;
  } catch(e) {
    console.warn('Veri dışa aktarım hatası:', e);
    return false;
  }
}

/**
 * Kullanıcı hesabını ve tüm kişisel verilerini sil (KVKK Madde 7 — Silme Hakkı)
 * NOT: Firebase Auth silme işlemi için kullanıcının yeniden giriş yapması gerekebilir
 */
export async function hesabiSil(uid) {
  try {
    // 1. Firestore verilerini sil
    await Promise.all([
      setDoc(doc(db, 'kullanicilar', uid),      { silindi: true, silinmeTarihi: new Date().toISOString(), email: '[silindi]', displayName: '[silindi]' }, { merge: true }),
      setDoc(doc(db, 'kullanici_verileri', uid), { silindi: true, silinmeTarihi: new Date().toISOString(), sepet: [], favoriler: [], siparisler: [], adresler: [] }, { merge: true }),
    ]);
    // 2. localStorage temizle
    hassasVerileriTemizle();
    return true;
  } catch(e) {
    console.warn('Hesap silme hatası:', e);
    return false;
  }
}

// Global erişim
window._genzKVKK = { kvkkRizaKaydet, kisiselVeriDısaAktar, hesabiSil };

