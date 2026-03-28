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
  } catch(e) {
    console.warn('Firestore yükleme hatası:', e);
  }
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
  Object.keys(SYNC_KEYS).forEach(k => localStorage.removeItem(k));
  localStorage.removeItem('genz-user');
  localStorage.removeItem('genz-sepet'); // alias
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
