// GEN-Z Firebase Auth Modülü
// Tüm sayfalara <script type="module" src="firebase-auth.js"></script> ile eklenir

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, GoogleAuthProvider,
  signInWithPopup, signInWithRedirect, getRedirectResult, signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ── CONFIG ── */
const firebaseConfig = {
  apiKey: "AIzaSyASkzJZdiW-Yj5HhxRub0UVtKPkERjCAVQ",
  authDomain: "gen-z-io.firebaseapp.com",
  projectId: "gen-z-io",
  storageBucket: "gen-z-io.firebasestorage.app",
  messagingSenderId: "97338868944",
  appId: "1:97338868944:web:d7b429e416d8c505b14ad5",
  measurementId: "G-1CHTYFV70Y"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/* ── Kullanıcı Firestore'a yaz ── */
async function kullaniciyiKaydet(user, extraData = {}) {
  try {
    const ref = doc(db, 'kullanicilar', user.uid);
    const snap = await getDoc(ref);
    const data = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || extraData.username || '',
      photoURL: user.photoURL || null,
      guncellendi: serverTimestamp(),
      ...extraData
    };
    if (!snap.exists()) {
      data.olusturuldu = serverTimestamp();
      data.rol = 'gencz'; // Varsayılan: Gen-Z kullanıcı
    }
    await setDoc(ref, data, { merge: true });
  } catch(e) { console.warn('Firestore yazma hatası:', e); }
}

/* ── UI Güncelle ── */
function uiGuncelle(user) {
  const authBtn = document.getElementById('authBtn');
  if (!authBtn) return;
  if (user) {
    const displayName = user.displayName || user.email.split('@')[0];
    authBtn.textContent = '@' + displayName.replace('@','');
    // localStorage'ı da güncelle (eski sistemle uyumluluk)
    localStorage.setItem('genz-user', JSON.stringify({
      uid: user.uid,
      email: user.email,
      username: '@' + displayName.replace('@',''),
      photoURL: user.photoURL
    }));
    // profile paneli alanları
    const pu = document.getElementById('profile-username');
    const pe = document.getElementById('profile-email');
    if (pu) pu.textContent = '@' + displayName.replace('@','');
    if (pe) pe.textContent = user.email;
  } else {
    authBtn.textContent = 'Giriş Yap';
    localStorage.removeItem('genz-user');
  }
}

/* ── Auth State Listener ── */
onAuthStateChanged(auth, (user) => {
  uiGuncelle(user);
  // Sayfa bazlı callback varsa çağır
  if (typeof window.onGenzAuthChange === 'function') {
    window.onGenzAuthChange(user);
  }
});

/* ── Google Giriş ── */
window.googleSignIn = async function() {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch(e) {
    console.error('Google giriş hatası:', e);
    if (typeof showToast === 'function') showToast('Google girişi başarısız ⚠️');
  }
};

/* Redirect sonucu işle */
getRedirectResult(auth).then(async (result) => {
  if (result && result.user) {
    const user = result.user;
    await kullaniciyiKaydet(user);
    uiGuncelle(user);
    if (typeof showToast === 'function') showToast('Hoş geldin, ' + (user.displayName || user.email) + ' 👋');
  }
}).catch((e) => {
  if (e.code !== 'auth/no-auth-event') console.error('Redirect result hatası:', e);
});

/* ── E-posta Giriş ── */
window.doSignIn = async function() {
  const email = document.getElementById('signin-email')?.value.trim();
  const pass  = document.getElementById('signin-pass')?.value;
  if (!email || !pass) { if(typeof showToast==='function') showToast('Lütfen tüm alanları doldurun ⚠️'); return; }
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    await kullaniciyiKaydet(result.user);
    if (typeof closeAuth === 'function') closeAuth();
    if (typeof showToast === 'function') showToast('Hoş geldin 👋');
  } catch(e) {
    const msg = e.code === 'auth/invalid-credential' ? 'E-posta veya şifre hatalı ⚠️'
              : e.code === 'auth/too-many-requests'   ? 'Çok fazla deneme. Biraz bekle ⚠️'
              : 'Giriş başarısız ⚠️';
    if (typeof showToast === 'function') showToast(msg);
  }
};

/* ── E-posta Kayıt ── */
window.doSignUp = async function() {
  const username = document.getElementById('signup-username')?.value.trim();
  const email    = document.getElementById('signup-email')?.value.trim();
  const pass     = document.getElementById('signup-pass')?.value;
  // Rol seçimi varsa al (kayıt formunda rol seçimi opsiyonel)
  const rolEl    = document.getElementById('signup-rol');
  const seciliRol = rolEl ? rolEl.value : 'gencz';
  if (!username || !email || !pass) { if(typeof showToast==='function') showToast('Lütfen tüm alanları doldurun ⚠️'); return; }
  if (pass.length < 8) { if(typeof showToast==='function') showToast('Şifre en az 8 karakter olmalı ⚠️'); return; }
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(result.user, { displayName: username });
    await kullaniciyiKaydet(result.user, { username, rol: seciliRol || 'gencz' });
    if (typeof closeAuth === 'function') closeAuth();
    if (typeof showToast === 'function') showToast('Hesabın oluşturuldu, hoş geldin 🎉');
  } catch(e) {
    const msg = e.code === 'auth/email-already-in-use' ? 'Bu e-posta zaten kayıtlı ⚠️'
              : e.code === 'auth/weak-password'         ? 'Şifre çok zayıf ⚠️'
              : 'Kayıt başarısız ⚠️';
    if (typeof showToast === 'function') showToast(msg);
  }
};

/* ── Şifre Sıfırla ── */
window.doForgot = async function() {
  const email = document.getElementById('forgot-email')?.value.trim();
  if (!email) { if(typeof showToast==='function') showToast('E-posta adresinizi girin ⚠️'); return; }
  try {
    await sendPasswordResetEmail(auth, email);
    if (typeof showToast === 'function') showToast('Sıfırlama bağlantısı gönderildi ✉️');
    setTimeout(() => { if(typeof switchTab==='function') switchTab('signin'); }, 1500);
  } catch(e) {
    if (typeof showToast === 'function') showToast('Geçerli bir e-posta girin ⚠️');
  }
};

/* ── Çıkış ── */
window.doSignOut = async function() {
  try {
    await signOut(auth);
    localStorage.removeItem('genz-user');
    localStorage.removeItem('genz-sepet');
    const authBtn = document.getElementById('authBtn');
    if (authBtn) authBtn.textContent = 'Giriş Yap';
    if (typeof closeAuth === 'function') closeAuth();
    if (typeof showToast === 'function') showToast('Çıkış yapıldı 👋');
  } catch(e) { console.error(e); }
};

/* ── Auth expose ── */
window._genzAuth = { auth, db, googleProvider };
