/**
 * proje-takip.js
 * GEN-Z Ustam — Proje Takip Sistemi
 * Firestore koleksiyonu: ustam_projeler
 */

import {
  getFirestore,
  collection, doc,
  addDoc, updateDoc, getDocs, onSnapshot,
  query, where, orderBy, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const db = getFirestore();
const COL = 'ustam_projeler';

/* ── Yardımcı ── */
export function simdi() { return serverTimestamp(); }

/**
 * Randevu onaylandığında otomatik proje oluştur.
 * Modpanel'de randevu onaylama fonksiyonunun sonuna ekle:
 *   import { projeOlustur } from './proje-takip.js';
 *   await projeOlustur(rdv);
 */
export async function projeOlustur(rdv) {
  const proje = {
    rdvId        : rdv.id,
    ustaUid      : rdv.ustaUid,
    ustaMagazaId : rdv.magazaId || null,
    musteriUid   : rdv.musteriUid,
    musteriAd    : rdv.musteriAd || 'Müşteri',
    ustaAdi      : rdv.ustaAdi  || 'Usta',
    isAdi        : rdv.hizmet   || 'Hizmet',
    sehir        : rdv.sehir    || '',
    aciklama     : rdv.mesaj    || '',
    durum        : 'devam',       // devam | tamamlandi | iptal
    ilerleme     : 0,             // 0 | 25 | 50 | 100
    onayBekliyor : false,
    adimlar      : [],
    ts           : serverTimestamp(),
    tamamlanmaTarihi: null,
  };
  const ref = await addDoc(collection(db, COL), proje);
  return ref.id;
}

/**
 * Usta ilerleme günceller (%25, %50, %100).
 * Her güncellemede müşteriye onay isteği gider (onayBekliyor = true).
 */
export async function ilerlemeyiGuncelle(projeId, yuzde) {
  const projeRef = doc(db, COL, projeId);
  const yeniAdim = {
    yuzde,
    ustaTs       : new Date().toISOString(),
    musteriOnay  : null,   // null=bekliyor, true=onaylandı, false=reddedildi
    musteriTs    : null,
  };

  // Mevcut adımları getir, sonra güncelle
  const { getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
  const snap = await getDoc(projeRef);
  const eskiAdimlar = snap.data()?.adimlar || [];

  await updateDoc(projeRef, {
    ilerleme     : yuzde,
    onayBekliyor : true,
    adimlar      : [...eskiAdimlar, yeniAdim],
    sonGuncelleme: serverTimestamp(),
  });
}

/**
 * Müşteri bir adımı onaylar ya da reddeder.
 * Reddederse proje iptal olur.
 * %100 onaylanırsa proje tamamlanır.
 */
export async function musteriOnayVer(projeId, onay /* true | false */) {
  const { getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
  const projeRef  = doc(db, COL, projeId);
  const snap      = await getDoc(projeRef);
  const data      = snap.data();
  if (!data) return;

  const adimlar = [...(data.adimlar || [])];
  // Son bekleyen adımı güncelle
  const sonIdx = adimlar.map(a => a.musteriOnay).lastIndexOf(null);
  if (sonIdx > -1) {
    adimlar[sonIdx] = {
      ...adimlar[sonIdx],
      musteriOnay : onay,
      musteriTs   : new Date().toISOString(),
    };
  }

  let yeniDurum = data.durum;
  let tamamlanmaTarihi = null;

  if (!onay) {
    yeniDurum = 'iptal';
  } else if (data.ilerleme === 100) {
    yeniDurum = 'tamamlandi';
    tamamlanmaTarihi = serverTimestamp();
  }

  await updateDoc(projeRef, {
    adimlar,
    onayBekliyor    : false,
    durum           : yeniDurum,
    tamamlanmaTarihi: tamamlanmaTarihi,
    sonGuncelleme   : serverTimestamp(),
  });
}

/**
 * Ustanın tüm projelerini dinle (realtime).
 * callback(projeler[]) şeklinde çağırır.
 */
export function ustaProjeleriDinle(ustaUid, callback) {
  const q = query(
    collection(db, COL),
    where('ustaUid', '==', ustaUid),
    orderBy('ts', 'desc')
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

/**
 * Müşterinin tüm projelerini dinle (realtime).
 */
export function musteriProjeleriDinle(musteriUid, callback) {
  const q = query(
    collection(db, COL),
    where('musteriUid', '==', musteriUid),
    orderBy('ts', 'desc')
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}
