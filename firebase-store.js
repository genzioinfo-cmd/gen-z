// GEN-Z Firestore Ürün Modülü
// Mağaza, stil odaları ve kategori sayfaları bu modülü kullanır

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, query,
  where, orderBy, limit, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyASkzJZdiW-Yj5HhxRub0UVtKPkERjCAVQ",
  authDomain: "gen-z.io",
  projectId: "gen-z-io",
  storageBucket: "gen-z-io.firebasestorage.app",
  messagingSenderId: "97338868944",
  appId: "1:97338868944:web:d7b429e416d8c505b14ad5"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ── Onaylı ürünleri getir ── */
export async function getOnayliUrunler(opts = {}) {
  try {
    const q = query(
      collection(db, 'magaza_urunler'),
      where('durum', '==', 'onaylandi'),
      orderBy('ts', 'desc'),
      limit(opts.limit || 200)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) {
    console.warn('Ürün yükleme hatası:', e);
    return [];
  }
}

/* ── Kategoriye göre ürünler ── */
export async function getKategoriUrunler(kategori, lmt = 100) {
  try {
    const q = query(
      collection(db, 'magaza_urunler'),
      where('durum', '==', 'onaylandi'),
      where('kategori', '==', kategori),
      orderBy('ts', 'desc'),
      limit(lmt)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) {
    console.warn('Kategori ürün hatası:', e);
    return [];
  }
}

/* ── Stil Odası ürünleri (zone + cinsiyet + yaş) ── */
export async function getStilUrunler(zone, gender = null, age = null) {
  try {
    let q = query(
      collection(db, 'magaza_urunler'),
      where('durum', '==', 'onaylandi'),
      where('stilZone', '==', zone)
    );
    const snap = await getDocs(q);
    let urunler = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Client-side filtre (Firestore composite index gerektirmeden)
    if (gender) urunler = urunler.filter(u => !u.stilGender || u.stilGender === gender || u.stilGender === '');
    if (age)    urunler = urunler.filter(u => !u.stilAge    || u.stilAge    === age    || u.stilAge    === '');

    return urunler;
  } catch(e) {
    console.warn('Stil odası ürün hatası:', e);
    return [];
  }
}

/* ── Ev Stil Odası ürünleri (oda + bölge) ── */
export async function getEvStilUrunler(oda, bolge = null) {
  try {
    let q = query(
      collection(db, 'magaza_urunler'),
      where('durum', '==', 'onaylandi'),
      where('evOda', '==', oda)
    );
    const snap = await getDocs(q);
    let urunler = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (bolge) urunler = urunler.filter(u => !u.evBolge || u.evBolge === bolge);

    return urunler;
  } catch(e) {
    console.warn('Ev stil odası ürün hatası:', e);
    return [];
  }
}

/* ── Tek ürün ── */
export async function getUrun(id) {
  try {
    const snap = await getDoc(doc(db, 'magaza_urunler', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch(e) { return null; }
}

/* ── Mağaza bilgisi ── */
export async function getMagaza(magazaId) {
  try {
    const snap = await getDoc(doc(db, 'magazalar', magazaId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch(e) { return null; }
}

/* ── Ürünü data.js formatına dönüştür (geriye uyumluluk) ── */
export function firestoreToDatajs(u) {
  return {
    id: u.id,
    ad: u.ad || u.name || '',
    fiyat: u.kdvDahilFiyat || u.fiyat || 0,
    marka: u.magazaAd || '',
    kategori: u.kategori || '',
    emoji: u.resimler?.[0] ? null : '🛍',
    resimler: u.resimler || [],
    renkler: u.renkler || ['#c9a84c'],
    bedenler: u.bedenler || [],
    aciklama: u.aciklama || '',
    stok: u.stok || 0,
    stilZone: u.stilZone || null,
    stilGender: u.stilGender || null,
    stilAge: u.stilAge || null,
    evOda: u.evOda || null,
    evBolge: u.evBolge || null,
  };
}

window._genzStore = { getOnayliUrunler, getKategoriUrunler, getStilUrunler, getEvStilUrunler, getUrun, getMagaza, firestoreToDatajs };
