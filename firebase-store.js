// GEN-Z Firestore Ürün Modülü
// Mağaza, stil odaları ve kategori sayfaları bu modülü kullanır

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, query,
  where, orderBy, limit, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyASkzJZdiW-Yj5HhxRub0UVtKPkERjCAVQ",
  authDomain: "gen-z-io.firebaseapp.com",
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

// window._genzStore set at bottom of file

/* ── Platform bazlı: Mağaza ürünleri ── */
export async function getMagazaUrunler(opts = {}) {
  try {
    const q = query(
      collection(db, 'magaza_urunler'),
      where('durum', '==', 'onaylandi'),
      where('platform', '==', 'magaza'),
      orderBy('ts', 'desc'),
      limit(opts.limit || 200)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) {
    // composite index yoksa platform filtresi olmadan dene
    try {
      const q2 = query(
        collection(db, 'magaza_urunler'),
        where('durum', '==', 'onaylandi'),
        orderBy('ts', 'desc'),
        limit(opts.limit || 200)
      );
      const snap2 = await getDocs(q2);
      return snap2.docs.map(d => ({ id: d.id, ...d.data() }))
        .filter(u => !u.platform || u.platform === 'magaza');
    } catch(e2) {
      console.warn('getMagazaUrunler hatası:', e2);
      return [];
    }
  }
}

/* ── Platform bazlı: Genç-Z içerikleri ── */
export async function getGenczUrunler(opts = {}) {
  try {
    const q = query(
      collection(db, 'magaza_urunler'),
      where('durum', '==', 'onaylandi'),
      where('platform', '==', 'gencz'),
      orderBy('ts', 'desc'),
      limit(opts.limit || 200)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) {
    try {
      const q2 = query(
        collection(db, 'magaza_urunler'),
        where('durum', '==', 'onaylandi'),
        orderBy('ts', 'desc'),
        limit(opts.limit || 200)
      );
      const snap2 = await getDocs(q2);
      return snap2.docs.map(d => ({ id: d.id, ...d.data() }))
        .filter(u => u.platform === 'gencz');
    } catch(e2) {
      console.warn('getGenczUrunler hatası:', e2);
      return [];
    }
  }
}

/* ── Ustam ilanları ── */
export async function getUstaIlanlar(opts = {}) {
  try {
    const q = query(
      collection(db, 'usta_ilanlar'),
      where('durum', '==', 'onaylandi'),
      orderBy('ts', 'desc'),
      limit(opts.limit || 100)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) {
    console.warn('getUstaIlanlar hatası:', e);
    return [];
  }
}

/* ── normalize: Firestore dokümanını ortak formata dönüştür ── */
export function normalize(u, platform = 'magaza') {
  const GRAD_PAIRS = [
    ['rgba(240,197,92,0.18)', 'rgba(123,92,240,0.1)'],
    ['rgba(92,240,180,0.15)', 'rgba(123,92,240,0.1)'],
    ['rgba(240,92,130,0.15)', 'rgba(92,140,240,0.1)'],
    ['rgba(92,180,240,0.15)', 'rgba(240,140,92,0.1)'],
    ['rgba(180,92,240,0.15)', 'rgba(92,240,197,0.1)'],
  ];
  const idx = Math.abs((u.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % GRAD_PAIRS.length;
  const grad = GRAD_PAIRS[idx];
  const initials = (u.magazaAd || u.ustaAd || 'M').split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
  const resim = (u.resimler && u.resimler.length > 0) ? u.resimler[0] : null;
  const CAT_EMOJI_GENCZ = { muzik:'🎵', tasarim:'🎨', yazilim:'💻', video:'📹', fotograf:'📷', yazi:'📝', moda:'👗', oyun:'🎮' };
  const CAT_EMOJI_MAGAZA = { bakim:'🧴', dekor:'🖼️', giyim:'👗', yiyecek:'🍵', kirtasiye:'🖊️', teknoloji:'🎧', bahce:'🌱', sanat:'🖼️' };
  const catEmoji = platform === 'gencz' ? CAT_EMOJI_GENCZ : CAT_EMOJI_MAGAZA;
  return {
    id: u.id,
    name: u.ad || u.name || '',
    price: u.kdvDahilFiyat || u.fiyat || 0,
    oldPrice: u.eskiFiyat || null,
    rating: u.rating || 0,
    reviews: u.reviewCount || 0,
    badge: u.badge || null,
    tags: u.etiketler || [],
    category: u.kategori || 'diger',
    desc: u.aciklama || '',
    emoji: catEmoji[u.kategori] || '📦',
    resim: resim,
    resimler: u.resimler || [],
    gradA: grad[0],
    gradB: grad[1],
    platform: u.platform || platform,
    seller: {
      id: u.magazaId || u.ustaId || u.id,
      name: u.magazaAd || u.ustaAd || 'Satıcı',
      initials: initials,
      sales: u.satisAdedi || 0,
      joined: u.ts ? new Date(u.ts.seconds * 1000).getFullYear().toString() : '2025',
      rating: u.magazaRating || u.ustaRating || 0,
      ratingCount: u.magazaRatingCount || u.ustaRatingCount || 0,
      desc: u.magazaAciklama || u.ustaAciklama || '',
    }
  };
}

// window globals güncelle
window._genzStore = {
  getOnayliUrunler, getKategoriUrunler, getStilUrunler, getEvStilUrunler,
  getUrun, getMagaza, firestoreToDatajs,
  getMagazaUrunler, getGenczUrunler, getUstaIlanlar, normalize
};
