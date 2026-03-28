// GEN-Z Firebase Config + Auth Modülü
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, GoogleAuthProvider,
  signInWithPopup, signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

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
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
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
      data.rol = 'gencz';
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
    localStorage.setItem('genz-user', JSON.stringify({
      uid: user.uid,
      email: user.email,
      username: '@' + displayName.replace('@',''),
      photoURL: user.photoURL
    }));
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
  if (typeof window.onGenzAuthChange === 'function') {
    window.onGenzAuthChange(user);
  }
});

/* ── Giriş sonrası yenile ── */
function girisYaptiktan(user, mesaj) {
  if (typeof showToast === 'function') {
    showToast(mesaj);
    setTimeout(() => window.location.reload(), 900);
  } else {
    window.location.reload();
  }
}

/* ── Google Giriş ── */
window.googleSignIn = async function() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await kullaniciyiKaydet(result.user);
    girisYaptiktan(result.user, 'Hoş geldin, ' + (result.user.displayName || result.user.email) + ' 👋');
  } catch(e) {
    if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') return;
    console.error('Google giriş hatası:', e);
    if (typeof showToast === 'function') showToast('Google girişi başarısız ⚠️');
  }
};

/* ── E-posta Giriş ── */
window.doSignIn = async function() {
  const email = document.getElementById('signin-email')?.value.trim();
  const pass  = document.getElementById('signin-pass')?.value;
  if (!email || !pass) { if(typeof showToast==='function') showToast('Lütfen tüm alanları doldurun ⚠️'); return; }
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    await kullaniciyiKaydet(result.user);
    girisYaptiktan(result.user, 'Hoş geldin 👋');
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
  const rolEl    = document.getElementById('signup-rol');
  const seciliRol = rolEl ? rolEl.value : 'gencz';
  if (!username || !email || !pass) { if(typeof showToast==='function') showToast('Lütfen tüm alanları doldurun ⚠️'); return; }
  if (pass.length < 8) { if(typeof showToast==='function') showToast('Şifre en az 8 karakter olmalı ⚠️'); return; }
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(result.user, { displayName: username });
    await kullaniciyiKaydet(result.user, { username, rol: seciliRol || 'gencz' });
    girisYaptiktan(result.user, 'Hesabın oluşturuldu, hoş geldin 🎉');
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
    await sendPasswordResetEmail(auth, email, {
      url: 'https://gen-z.io/sifre-sifirla.html',
      handleCodeInApp: false
    });
    if (typeof showToast === 'function') showToast('Sıfırlama bağlantısı gönderildi ✉️');
    setTimeout(() => { if(typeof switchTab==='function') switchTab('signin'); }, 1500);
  } catch(e) {
    const msg = e.code === 'auth/user-not-found'    ? 'Bu e-posta kayıtlı değil ⚠️'
              : e.code === 'auth/invalid-email'      ? 'Geçerli bir e-posta girin ⚠️'
              : e.code === 'auth/too-many-requests'  ? 'Çok fazla istek. Biraz bekle ⚠️'
              : 'Bir hata oluştu ⚠️';
    if (typeof showToast === 'function') showToast(msg);
  }
};

/* ── Çıkış ── */
window.doSignOut = async function() {
  try {
    await signOut(auth);
    localStorage.removeItem('genz-user');
    localStorage.removeItem('genz-sepet');
    if (typeof showToast === 'function') {
      showToast('Çıkış yapıldı 👋');
      setTimeout(() => { window.location.reload(); }, 800);
    } else {
      window.location.reload();
    }
  } catch(e) { console.error(e); }
};

window._genzAuth = { auth, db, googleProvider };
