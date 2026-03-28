/**
 * GEN-Z İade Yönetim Sistemi
 * iade.js — type="module"
 *
 * 6502 Sayılı Tüketicinin Korunması Hakkında Kanun &
 * Mesafeli Sözleşmeler Yönetmeliği'ne uygun (2025 güncel)
 *
 * Kaynak: Ticaret Bakanlığı Mesafeli Sözleşmeler Yönetmeliği
 *         Son değişiklik: Mayıs 2025
 */

import {
  getFirestore, collection, doc, addDoc, updateDoc, getDocs,
  getDoc, query, where, orderBy, serverTimestamp, Timestamp
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const db = getFirestore();

// ══════════════════════════════════════════════════════════════════════════
//  İADE SÜRESİ & KURAL VERİTABANI — Türk Tüketici Hukuku 2025
// ══════════════════════════════════════════════════════════════════════════

export const IADE_KURALLARI = {

  // ── STANDART 14 GÜN ──────────────────────────────────────────────────
  'Hazır Giyim':          { gun: 14, kargo: 'satici', not: 'Standart 14 gün. Deneme amaçlı kullanım sonrası iade edilebilir.' },
  'Kadın Giyim':          { gun: 14, kargo: 'satici' },
  'Erkek Giyim':          { gun: 14, kargo: 'satici' },
  'Çocuk & Bebek Giyim':  { gun: 14, kargo: 'satici' },
  'Spor Giyim':           { gun: 14, kargo: 'satici' },
  'Dış Giyim':            { gun: 14, kargo: 'satici' },
  'Outdoor & Dağcılık Kıyafeti': { gun: 14, kargo: 'satici' },
  'Şapka & Bere':         { gun: 14, kargo: 'satici' },
  'Kemer':                { gun: 14, kargo: 'satici' },
  'Kravat & Fular & Eşarp':{ gun: 14, kargo: 'satici' },
  'Eldiven':              { gun: 14, kargo: 'satici' },
  'Çanta & Cüzdan':       { gun: 14, kargo: 'satici' },
  'Sırt Çantası':         { gun: 14, kargo: 'satici' },
  'Bavul & Valiz':        { gun: 14, kargo: 'satici' },
  'Ayakkabı & Çanta':     { gun: 14, kargo: 'satici' },
  'Kadın Ayakkabı':       { gun: 14, kargo: 'satici' },
  'Erkek Ayakkabı':       { gun: 14, kargo: 'satici' },
  'Bot & Çizme':          { gun: 14, kargo: 'satici' },
  'Terlik & Sandalet':    { gun: 14, kargo: 'satici' },
  'Spor Ayakkabı':        { gun: 14, kargo: 'satici' },
  'Klasik & Deri Ayakkabı':{ gun: 14, kargo: 'satici' },
  'Topuklu Ayakkabı':     { gun: 14, kargo: 'satici' },
  'Aksesuar':             { gun: 14, kargo: 'satici' },
  'Takı & Mücevher':      { gun: 14, kargo: 'satici' },
  'Gümüş Takı':          { gun: 14, kargo: 'satici' },
  'Fantezi Takı':         { gun: 14, kargo: 'satici' },
  'Saat':                 { gun: 14, kargo: 'satici' },
  'Güneş Gözlüğü':       { gun: 14, kargo: 'satici' },
  'Ev Tekstili':          { gun: 14, kargo: 'satici' },
  'Yatak Örtüsü & Nevresim':{ gun: 14, kargo: 'satici', not: 'Ambalaj açılmamış olması şart değildir; hijyen açısından sorun yok.' },
  'Perde & Stor':         { gun: 14, kargo: 'satici' },
  'Halı & Kilim':         { gun: 14, kargo: 'satici' },
  'Yastık & Yastık Kılıfı':{ gun: 14, kargo: 'satici' },
  'Battaniye & Yorgan':   { gun: 14, kargo: 'satici' },
  'Kumaş / Tekstil':      { gun: 14, kargo: 'satici' },
  'El Yapımı':            { gun: 14, kargo: 'satici' },
  'Seramik & Çömlek':     { gun: 14, kargo: 'satici' },
  'Mobilya':              { gun: 14, kargo: 'satici', not: 'Montaj yapılmamışsa iade edilebilir. Montaj yapılmışsa iade hakkı kullanılamaz.' },
  'Dekorasyon':           { gun: 14, kargo: 'satici' },
  'Ev Aksesuarları':      { gun: 14, kargo: 'satici' },
  'Bahçe Ürünleri':       { gun: 14, kargo: 'satici' },

  // ── ELEKTRONİK — 14 GÜN (2025 güncel, cep telefonu istisnası kaldırıldı) ──
  'Cep Telefonu & Aksesuarı': {
    gun: 14,
    kargo: 'satici',
    not: 'Ticaret Bakanlığı 2025 düzenlemesiyle telefon, tablet ve bilgisayarlarda cayma hakkı istisnası kaldırıldı. Kutunun açılması iade hakkını ortadan kaldırmaz.',
    onemli: true
  },
  'Bilgisayar & Laptop': {
    gun: 14,
    kargo: 'satici',
    not: 'Mayıs 2025 düzenlemesiyle cayma hakkı istisnası kaldırıldı. Normal kullanım izleri iade hakkını engellemez.',
    onemli: true
  },
  'Ekran Kartı':          { gun: 14, kargo: 'satici' },
  'İşlemci':              { gun: 14, kargo: 'satici' },
  'Anakart':              { gun: 14, kargo: 'satici' },
  'RAM & Bellek':         { gun: 14, kargo: 'satici' },
  'Elektronik':           { gun: 14, kargo: 'satici' },

  // ── ALTIN TAKİ — Borsa bağlı, istisnalı ──────────────────────────────
  'Altın Takı': {
    gun: 0,
    istisna: true,
    istisnaAciklama: 'Altın ürünleri fiyatı finansal piyasa dalgalanmalarına bağlıdır. Mesafeli Sözleşmeler Yönetmeliği m.15/a kapsamında cayma hakkı kullanılamaz.',
    kargo: null
  },

  // ── GIDA — Kategori bazlı ────────────────────────────────────────────
  'Taze Meyve & Sebze': {
    gun: 0,
    istisna: true,
    istisnaAciklama: 'Çabuk bozulabilen gıda ürünü. Yönetmelik m.15/ç kapsamında iade hakkı yoktur.',
    kargo: null
  },
  'Et & Tavuk & Balık': {
    gun: 0,
    istisna: true,
    istisnaAciklama: 'Çabuk bozulabilen gıda ürünü. Yönetmelik m.15/ç kapsamında iade hakkı yoktur.',
    kargo: null
  },
  'Süt Ürünleri & Yumurta': {
    gun: 0,
    istisna: true,
    istisnaAciklama: 'Çabuk bozulabilen gıda ürünü. Yönetmelik m.15/ç kapsamında iade hakkı yoktur.',
    kargo: null
  },
  'Ekmek & Pastane': {
    gun: 0,
    istisna: true,
    istisnaAciklama: 'Çabuk bozulabilen gıda. İade hakkı yoktur.',
    kargo: null
  },
  'Tahıl & Bakliyat': {
    gun: 14,
    kargo: 'satici',
    not: 'Ambalaj açılmamış olması gerekmektedir. Başka ürünlerle karışmış olmamalı.'
  },
  'Şekerleme & Çikolata': {
    gun: 14,
    kargo: 'satici',
    not: 'Ambalaj açılmamış olması şarttır.'
  },
  'Organik & Doğal Gıda': { gun: 14, kargo: 'satici', not: 'Ambalaj açılmamış olmalıdır.' },
  'Atıştırmalık & Kuruyemiş': { gun: 14, kargo: 'satici', not: 'Ambalaj açılmamış olmalıdır.' },
  'Çay & Kahve & Bitki Çayı': { gun: 14, kargo: 'satici', not: 'Ambalaj açılmamış olmalıdır.' },
  'Bebek Maması & Gıda': { gun: 14, kargo: 'satici', not: 'Ambalaj açılmamış olmalıdır.' },
  'İçecek (Meyve Suyu, Kola vb.)': {
    gun: 14,
    kargo: 'satici',
    not: 'Ambalaj açılmamış olmalıdır.'
  },

  // ── HİJYEN — Ambalaj açılmışsa iade yok ────────────────────────────
  'Makyaj & Kozmetik': {
    gun: 14,
    kargo: 'satici',
    hijyenIstisnasi: true,
    not: 'Ambalaj açılmamışsa 14 gün içinde iade edilebilir. Ambalaj açılmışsa hijyen nedeniyle iade kabul edilmez (Yönetmelik m.15/ç).'
  },
  'Cilt Bakım': {
    gun: 14,
    kargo: 'satici',
    hijyenIstisnasi: true,
    not: 'Ambalaj açılmamışsa iade edilebilir. Açılmışsa iade edilemez.'
  },
  'Saç Bakım': {
    gun: 14,
    kargo: 'satici',
    hijyenIstisnasi: true,
    not: 'Ambalaj açılmamışsa iade edilebilir.'
  },
  'Vücut Bakım & Losyon': {
    gun: 14,
    kargo: 'satici',
    hijyenIstisnasi: true,
    not: 'Ambalaj açılmamışsa iade edilebilir.'
  },
  'Parfüm & Deodorant': {
    gun: 14,
    kargo: 'satici',
    hijyenIstisnasi: true,
    not: 'Test edilmemiş, ambalajı açılmamışsa iade edilebilir.'
  },
  'İç Giyim & Pijama': {
    gun: 14,
    kargo: 'satici',
    hijyenIstisnasi: true,
    not: 'Denenmemiş, ambalajı açılmamışsa iade edilebilir. Hijyen nedeniyle kullanılmış iç giyim iade edilemez.'
  },
  'Çorap': {
    gun: 14,
    kargo: 'satici',
    hijyenIstisnasi: true,
    not: 'Ambalaj açılmamışsa iade edilebilir.'
  },
  'Havlu & Banyo Tekstili': {
    gun: 14,
    kargo: 'satici',
    hijyenIstisnasi: true,
    not: 'Kullanılmamışsa iade edilebilir.'
  },
  'Medikal Cihaz & Sarf': {
    gun: 14,
    kargo: 'satici',
    hijyenIstisnasi: true,
    not: 'Ambalaj açılmamışsa iade edilebilir. Açılmışsa sağlık/hijyen nedeniyle iade kabul edilmez.'
  },
  'Eczane Ürünleri & Takviye': {
    gun: 14,
    kargo: 'satici',
    hijyenIstisnasi: true,
    not: 'Ambalaj açılmamışsa iade edilebilir.'
  },

  // ── DİJİTAL ÜRÜNLER — İade yok ───────────────────────────────────────
  'Dijital Ürün (Tasarım, Şablon)': {
    gun: 0,
    istisna: true,
    istisnaAciklama: 'Elektronik ortamda anında teslim edilen dijital içerik. Yönetmelik m.15/ğ kapsamında cayma hakkı kullanılamaz.'
  },
  'Yazılım & Lisans': {
    gun: 0,
    istisna: true,
    istisnaAciklama: 'Elektronik ortamda teslim edilen yazılım/lisans. Yönetmelik m.15/ğ kapsamında cayma hakkı kullanılamaz.'
  },

  // ── KİŞİYE ÖZEL ÜRÜNLER ──────────────────────────────────────────────
  'Gelinlik & Damatlik': {
    gun: 0,
    istisna: true,
    istisnaAciklama: 'Tüketicinin kişisel ihtiyaçları doğrultusunda özelleştirilen ürün. Yönetmelik m.15/b kapsamında cayma hakkı kullanılamaz. Ancak standart beden ürünlerde iade mümkündür.',
    sartliIstisna: true,
    sartAciklamasi: 'Standart beden ise 14 gün içinde iade edilebilir.'
  },
  'Kostüm & Parti Kıyafeti': { gun: 14, kargo: 'satici' },

  // ── KARGO ─────────────────────────────────────────────────────────────
  'Kargo': {
    gun: 0,
    istisna: true,
    istisnaAciklama: 'Hizmet ifası başlamışsa cayma hakkı kullanılamaz.'
  },

  // ── DEFAULT ───────────────────────────────────────────────────────────
  '_default': {
    gun: 14,
    kargo: 'satici',
    not: 'Standart 14 günlük cayma hakkı geçerlidir. (TKHK m.48, Mesafeli Sözleşmeler Yönetmeliği m.9)'
  }
};

// ══════════════════════════════════════════════════════════════════════════
//  YARDIMCI FONKSİYONLAR
// ══════════════════════════════════════════════════════════════════════════

export function iadeKuraliBul(kategori) {
  return IADE_KURALLARI[kategori] || IADE_KURALLARI['_default'];
}

export function iadeHakkiHesapla(teslimTarihi, kategori) {
  const kural = iadeKuraliBul(kategori);

  if (kural.istisna && !kural.sartliIstisna) {
    return {
      hakVar: false,
      istisna: true,
      aciklama: kural.istisnaAciklama,
      kalanGun: 0,
      kural
    };
  }

  const teslim = teslimTarihi instanceof Timestamp
    ? teslimTarihi.toDate()
    : new Date(teslimTarihi);

  const simdi = new Date();
  const gecenMs = simdi - teslim;
  const gecenGun = Math.floor(gecenMs / 86400000);
  const kalanGun = kural.gun - gecenGun;

  return {
    hakVar: kalanGun > 0,
    kalanGun: Math.max(0, kalanGun),
    gecenGun,
    bitisTarihi: new Date(teslim.getTime() + kural.gun * 86400000),
    hijyenIstisnasi: kural.hijyenIstisnasi || false,
    not: kural.not || null,
    kargo: kural.kargo,
    kural
  };
}

export function iadeSureMetni(gun) {
  if (gun === 0) return 'İade hakkı yok';
  return `${gun} gün cayma hakkı`;
}

// ══════════════════════════════════════════════════════════════════════════
//  KULLANICI — İADE TALEBİ OLUŞTUR
// ══════════════════════════════════════════════════════════════════════════

let _aktifIadeSiparis = null;

export function iadeModalAc(siparis) {
  _aktifIadeSiparis = siparis;
  const kural = iadeKuraliBul(siparis.kategori || siparis.urunler?.[0]?.kategori);
  const hesap = iadeHakkiHesapla(siparis.teslimTarihi || siparis.ts, siparis.kategori || siparis.urunler?.[0]?.kategori);

  const modal = document.getElementById('iadeModal');
  const icerik = document.getElementById('iadeModalIcerik');
  if (!modal || !icerik) return;

  let html = '';

  if (!hesap.hakVar) {
    html = `
      <div style="text-align:center;padding:1.5rem 0;">
        <div style="font-size:48px;margin-bottom:12px;">${hesap.istisna ? '🚫' : '⏰'}</div>
        <div style="font-size:1rem;font-weight:700;color:var(--text);margin-bottom:.6rem;">
          ${hesap.istisna ? 'Bu ürün iade edilemez' : 'İade süresi doldu'}
        </div>
        <div style="font-size:.75rem;color:var(--text2);line-height:1.7;max-width:340px;margin:0 auto;">
          ${hesap.istisna ? hesap.aciklama : `Teslim tarihinden itibaren ${kural.gun} günlük iade süresi dolmuştur. (${hesap.gecenGun} gün geçti)`}
        </div>
        ${!hesap.istisna ? `<div style="margin-top:1rem;padding:.7rem 1rem;background:rgba(92,240,180,.06);border:1px solid rgba(92,240,180,.15);border-radius:8px;font-size:.68rem;color:var(--accent3);">
          💡 Ürün ayıplı/hasarlı ise <strong>ayıplı mal hakkı</strong> geçerlidir — süre sınırı yoktur.
        </div>` : ''}
      </div>
    `;
  } else {
    const bitisTarihStr = hesap.bitisTarihi.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
    html = `
      <div style="background:rgba(92,240,180,.06);border:1px solid rgba(92,240,180,.15);border-radius:8px;padding:.9rem 1rem;margin-bottom:1rem;display:flex;align-items:center;gap:.8rem;">
        <span style="font-size:20px;">✅</span>
        <div>
          <div style="font-size:.72rem;font-weight:700;color:var(--accent3);">İade hakkınız var — ${hesap.kalanGun} gün kaldı</div>
          <div style="font-size:.62rem;color:var(--text2);">Son iade tarihi: ${bitisTarihStr} · Kargo: ${kural.kargo === 'satici' ? 'Satıcı öder' : 'Alıcı öder'}</div>
        </div>
      </div>

      ${hesap.hijyenIstisnasi ? `<div style="background:rgba(240,197,92,.06);border:1px solid rgba(240,197,92,.2);border-radius:8px;padding:.8rem 1rem;margin-bottom:1rem;font-size:.68rem;color:var(--gold);">
        ⚠️ ${kural.not}
      </div>` : ''}

      ${hesap.not && !hesap.hijyenIstisnasi ? `<div style="font-size:.65rem;color:var(--text2);background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:6px;padding:.7rem .9rem;margin-bottom:1rem;">
        📋 ${hesap.not}
      </div>` : ''}

      <div style="display:flex;flex-direction:column;gap:.7rem;">
        <div>
          <label style="font-size:.62rem;color:var(--text2);font-weight:700;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:.35rem;">İade Nedeni *</label>
          <select id="iadeNeden" style="width:100%;background:#0a0a0f;border:1px solid var(--border);border-radius:8px;padding:.65rem .9rem;font-size:.75rem;color:var(--text);outline:none;">
            <option value="">Seçin…</option>
            <option>Ürün açıklamayla uyuşmuyor</option>
            <option>Yanlış ürün gönderildi</option>
            <option>Ürün hasarlı/ayıplı geldi</option>
            <option>Beden/renk uyumsuzluğu</option>
            <option>Kalite beklentimi karşılamadı</option>
            <option>Ürüne ihtiyacım kalmadı</option>
            <option>Çok geç teslim edildi</option>
            <option>Diğer</option>
          </select>
        </div>
        <div>
          <label style="font-size:.62rem;color:var(--text2);font-weight:700;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:.35rem;">Açıklama</label>
          <textarea id="iadeAciklama" placeholder="İade nedeninizi detaylı açıklayın…" style="width:100%;background:#0a0a0f;border:1px solid var(--border);border-radius:8px;padding:.65rem .9rem;font-size:.75rem;color:var(--text);min-height:70px;resize:vertical;outline:none;font-family:inherit;"></textarea>
        </div>
        ${hesap.hijyenIstisnasi ? `<div>
          <label style="display:flex;align-items:center;gap:.5rem;cursor:pointer;font-size:.7rem;color:var(--text2);">
            <input type="checkbox" id="hijyenOnay" style="accent-color:var(--accent);width:15px;height:15px;">
            Ürünün ambalajının açılmadığını ve kullanılmadığını onaylıyorum
          </label>
        </div>` : ''}
        <div id="iadeHata" style="display:none;font-size:.68rem;color:#ff6b6b;padding:.5rem .7rem;background:rgba(255,80,80,.08);border-radius:6px;"></div>
        <button onclick="iadeGonder()" style="padding:.9rem;background:linear-gradient(135deg,#5a3eb0,#7B5CF0);color:#fff;border:none;border-radius:8px;font-size:.78rem;font-weight:700;cursor:pointer;letter-spacing:.05em;">
          🔄 İade Talebi Gönder
        </button>
        <div style="font-size:.6rem;color:var(--text3);text-align:center;line-height:1.6;">
          Talebiniz satıcıya iletilecektir. Onaylanması halinde iade kargosunu <strong>${kural.kargo === 'satici' ? 'satıcı' : 'siz'}</strong> öder.
          Ödeme iadeniz onaydan sonra 14 iş günü içinde yapılır.
        </div>
      </div>
    `;
  }

  icerik.innerHTML = html;
  modal.style.display = 'flex';
}

window.iadeModalKapat = function(e) {
  const modal = document.getElementById('iadeModal');
  if (!modal) return;
  if (e && e.target !== modal) return;
  modal.style.display = 'none';
  _aktifIadeSiparis = null;
};

window.iadeGonder = async function() {
  if (!_aktifIadeSiparis) return;
  const neden    = document.getElementById('iadeNeden')?.value;
  const aciklama = document.getElementById('iadeAciklama')?.value.trim();
  const hataEl   = document.getElementById('iadeHata');
  const hijyenEl = document.getElementById('hijyenOnay');

  if (!neden) { hataEl.textContent='Lütfen bir iade nedeni seçin.'; hataEl.style.display='block'; return; }
  if (hijyenEl && !hijyenEl.checked) { hataEl.textContent='Lütfen ambalaj onayını işaretleyin.'; hataEl.style.display='block'; return; }
  hataEl.style.display = 'none';

  const s = _aktifIadeSiparis;
  const uid = window._genzAuth?.auth?.currentUser?.uid
    || JSON.parse(localStorage.getItem('genz-user') || '{}')?.uid;
  const kat = s.kategori || s.urunler?.[0]?.kategori || '';
  const kural = iadeKuraliBul(kat);
  const kdvOran = s.kdvOran || 20;
  const brutTutar = s.toplam || 0;
  const kdvTutar  = brutTutar * (kdvOran / (100 + kdvOran));
  const netTutar  = brutTutar - kdvTutar;

  try {
    await addDoc(collection(db, 'iade_talepleri'), {
      // Sipariş bilgisi
      siparisId    : s.id,
      siparisKod   : s.kod || '',
      magazaId     : s.magazaId || '',
      magazaAd     : s.magazaAd || '',

      // Müşteri bilgisi
      musteriUid   : uid || null,
      musteriAd    : s.musteriAd || '',
      musteriEmail : s.musteriEmail || '',

      // Ürün bilgisi
      urunAd       : s.urunAd || s.urunler?.[0]?.name || '',
      kategori     : kat,
      iadeSureGun  : kural.gun,
      kargoSorumlu : kural.kargo,

      // İade bilgisi
      neden,
      aciklama     : aciklama || '',
      hijyenOnay   : hijyenEl ? hijyenEl.checked : true,

      // Muhasebe
      brutTutar,
      kdvOran,
      kdvTutar     : Math.round(kdvTutar * 100) / 100,
      netTutar     : Math.round(netTutar * 100) / 100,
      iadeTutari   : brutTutar, // tam iade varsayımı

      // Durum
      durum        : 'bekliyor',
      olusturuldu  : serverTimestamp(),
    });

    // Müşteri bildirimi
    if (uid) {
      await addDoc(collection(db, 'kullanicilar', uid, 'bildirimler'), {
        tip: 'iade',
        mesaj: `İade talebiniz alındı. Satıcı en geç 14 gün içinde yanıt verecek.`,
        link: 'profile.html?tab=orders',
        linkEtiket: 'Siparişlerim →',
        okundu: false,
        ts: serverTimestamp()
      }).catch(() => {});
    }

    document.getElementById('iadeModal').style.display = 'none';
    _aktifIadeSiparis = null;

    if (typeof showToast === 'function') showToast('🔄 İade talebiniz iletildi! Satıcı en geç 14 gün içinde yanıt verir.');

  } catch(e) {
    if (hataEl) { hataEl.textContent = 'Hata: ' + e.message; hataEl.style.display='block'; }
  }
};

// ══════════════════════════════════════════════════════════════════════════
//  SATICI — İADE TALEPLERİ (modpanel)
// ══════════════════════════════════════════════════════════════════════════

let _iadeTalepleri = [];
let _iadeFiltre    = 'hepsi';

export async function iadeTalepleriYukle(magazaId) {
  if (!magazaId) return;
  try {
    const snap = await getDocs(query(
      collection(db, 'iade_talepleri'),
      where('magazaId', '==', magazaId),
      orderBy('olusturuldu', 'desc')
    ));
    _iadeTalepleri = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    iadeTabloCiz();
    iadeBadgeGuncelle();
  } catch(e) { _iadeTalepleri = []; }
}

function iadeBadgeGuncelle() {
  const bekleyen = _iadeTalepleri.filter(t => t.durum === 'bekliyor').length;
  const badge = document.getElementById('iadeBadge');
  if (badge) { badge.textContent = bekleyen || ''; badge.style.display = bekleyen ? 'inline-flex' : 'none'; }
}

function iadeTabloCiz() {
  const el = document.getElementById('iadeTablo');
  if (!el) return;
  let liste = _iadeTalepleri;
  if (_iadeFiltre !== 'hepsi') liste = liste.filter(t => t.durum === _iadeFiltre);

  if (!liste.length) {
    el.innerHTML = `<table><tbody><tr class="bos-tr"><td colspan="9">İade talebi bulunamadı ✦</td></tr></tbody></table>`;
    return;
  }

  el.innerHTML = `<table style="min-width:900px;">
    <thead><tr>
      <th>Sipariş</th><th>Ürün</th><th>Kategori</th><th>Neden</th>
      <th>İade Tutarı</th><th>KDV</th><th>Kargo</th><th>Durum</th><th>İşlem</th>
    </tr></thead>
    <tbody>${liste.map(t => {
      const tarih = t.olusturuldu?.toDate ? t.olusturuldu.toDate().toLocaleDateString('tr-TR') : '—';
      const durumRenk = t.durum === 'onaylandi' ? 'var(--accent3)' : t.durum === 'reddedildi' ? '#ff6b6b' : 'var(--gold)';
      const durumTxt  = t.durum === 'onaylandi' ? '✅ Onaylandı' : t.durum === 'reddedildi' ? '❌ Reddedildi' : '⏳ Bekliyor';
      return `<tr>
        <td style="font-size:.62rem;font-family:monospace;">${t.siparisKod||'—'}<br><span style="color:var(--t2);font-size:.55rem;">${tarih}</span></td>
        <td style="font-size:.68rem;color:var(--cream);max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${t.urunAd||'—'}</td>
        <td style="font-size:.62rem;color:var(--t2);">${t.kategori||'—'}</td>
        <td style="font-size:.62rem;color:var(--t2);max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${t.neden||''}">${t.neden||'—'}</td>
        <td style="font-size:.68rem;color:var(--gold);font-weight:700;">₺${(t.iadeTutari||0).toLocaleString('tr-TR')}</td>
        <td style="font-size:.62rem;color:#ff9966;">₺${(t.kdvTutar||0).toLocaleString('tr-TR')}<br><span style="color:var(--t2);font-size:.55rem;">%${t.kdvOran||20}</span></td>
        <td style="font-size:.62rem;">${t.kargoSorumlu === 'satici' ? '<span style="color:var(--accent3);">Satıcı öder</span>' : '<span style="color:var(--gold);">Alıcı öder</span>'}</td>
        <td><span style="font-size:.58rem;font-weight:700;color:${durumRenk};">${durumTxt}</span></td>
        <td>
          <div style="display:flex;gap:.3rem;flex-wrap:wrap;">
            ${t.durum === 'bekliyor' ? `
              <button class="aksiyon duz" onclick="iadeOnayla('${t.id}')" style="font-size:.5rem;padding:.25rem .6rem;color:rgba(92,240,180,.9);border-color:rgba(92,240,180,.3);">✓ Onayla</button>
              <button class="aksiyon sil" onclick="iadeReddet('${t.id}')" style="font-size:.5rem;padding:.25rem .6rem;">✕ Reddet</button>
            ` : ''}
            <button class="aksiyon duz" onclick="iadeDetay('${t.id}')" style="font-size:.5rem;padding:.25rem .5rem;opacity:.7;">↗ Detay</button>
          </div>
        </td>
      </tr>`;
    }).join('')}</tbody>
  </table>`;
}

window.iadeFiltreSec = function(tip, btn) {
  _iadeFiltre = tip;
  document.querySelectorAll('#sayfa-iadeler .f-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  iadeTabloCiz();
};

window.iadeOnayla = async function(id) {
  const t = _iadeTalepleri.find(x => x.id === id);
  if (!t) return;
  if (!confirm(`₺${(t.iadeTutari||0).toLocaleString('tr-TR')} tutarındaki iade talebini onaylamak istiyor musun?\n\nNot: Bu işlem fatura iptali/iade faturası gerektirmektedir.`)) return;

  try {
    await updateDoc(doc(db, 'iade_talepleri', id), {
      durum: 'onaylandi',
      onayTarihi: serverTimestamp(),
      onaylayanUid: window._aktifUid || null
    });

    // Stok güncelle
    if (t.siparisId && t.urunId) {
      const urunRef = doc(db, 'magaza_urunler', t.urunId);
      const uSnap = await getDoc(urunRef);
      if (uSnap.exists()) {
        await updateDoc(urunRef, { stok: (uSnap.data().stok || 0) + (t.adet || 1) });
      }
    }

    // Müşteriye bildirim
    if (t.musteriUid) {
      await addDoc(collection(db, 'kullanicilar', t.musteriUid, 'bildirimler'), {
        tip: 'iade_onay',
        mesaj: `✅ İade talebiniz onaylandı! ₺${(t.iadeTutari||0).toLocaleString('tr-TR')} tutarındaki ödemeniz 14 iş günü içinde iade edilecektir.`,
        link: 'profile.html?tab=orders',
        linkEtiket: 'Siparişlerim →',
        okundu: false,
        ts: serverTimestamp()
      }).catch(() => {});
    }

    const idx = _iadeTalepleri.findIndex(x => x.id === id);
    if (idx > -1) _iadeTalepleri[idx].durum = 'onaylandi';
    iadeTabloCiz();
    iadeBadgeGuncelle();
    if (typeof toast === 'function') toast('✅ İade onaylandı! Müşteriye bildirim gönderildi.');

  } catch(e) {
    if (typeof toast === 'function') toast('Hata: ' + e.message, 'err');
  }
};

window.iadeReddet = async function(id) {
  const sebep = prompt('Reddetme sebebi (müşteriye iletilecek):');
  if (sebep === null) return;

  try {
    await updateDoc(doc(db, 'iade_talepleri', id), {
      durum: 'reddedildi',
      redSebep: sebep,
      redTarihi: serverTimestamp()
    });

    const t = _iadeTalepleri.find(x => x.id === id);
    if (t?.musteriUid) {
      await addDoc(collection(db, 'kullanicilar', t.musteriUid, 'bildirimler'), {
        tip: 'iade_red',
        mesaj: `❌ İade talebiniz reddedildi. Sebep: ${sebep || 'Belirtilmedi'}. Anlaşmazlık durumunda tüketici hakem heyetine başvurabilirsiniz.`,
        link: 'profile.html?tab=orders',
        linkEtiket: 'Siparişlerim →',
        okundu: false,
        ts: serverTimestamp()
      }).catch(() => {});
    }

    const idx = _iadeTalepleri.findIndex(x => x.id === id);
    if (idx > -1) { _iadeTalepleri[idx].durum = 'reddedildi'; _iadeTalepleri[idx].redSebep = sebep; }
    iadeTabloCiz();
    iadeBadgeGuncelle();
    if (typeof toast === 'function') toast('İade reddedildi. Müşteriye bildirim gönderildi.');

  } catch(e) {
    if (typeof toast === 'function') toast('Hata: ' + e.message, 'err');
  }
};

window.iadeDetay = function(id) {
  const t = _iadeTalepleri.find(x => x.id === id);
  if (!t) return;
  const modal = document.getElementById('iadeDetayModal');
  const icerik = document.getElementById('iadeDetayIcerik');
  if (!modal || !icerik) return;

  icerik.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:.8rem;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem;">
        ${[
          ['Sipariş Kodu', t.siparisKod||'—'],
          ['Ürün', t.urunAd||'—'],
          ['Kategori', t.kategori||'—'],
          ['Müşteri', t.musteriAd||'—'],
          ['İade Süresi', `${t.iadeSureGun||14} gün`],
          ['Kargo Sorumlusu', t.kargoSorumlu==='satici'?'Satıcı':'Alıcı'],
        ].map(([l,v])=>`
          <div style="background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:6px;padding:.7rem .9rem;">
            <div style="font-size:.55rem;color:var(--t2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:.2rem;">${l}</div>
            <div style="font-size:.72rem;color:var(--cream);">${v}</div>
          </div>
        `).join('')}
      </div>

      <div style="background:rgba(201,168,76,.05);border:1px solid rgba(201,168,76,.2);border-radius:8px;padding:1rem;">
        <div style="font-size:.58rem;color:var(--gold);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.7rem;">🧾 Muhasebe Notu</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.4rem;font-size:.68rem;">
          <span style="color:var(--t2);">Brüt İade Tutarı</span><strong>₺${(t.iadeTutari||0).toLocaleString('tr-TR')}</strong>
          <span style="color:var(--t2);">KDV Tutarı (%${t.kdvOran||20})</span><strong style="color:#ff9966;">₺${(t.kdvTutar||0).toFixed(2)}</strong>
          <span style="color:var(--t2);">Net Tutar (KDV hariç)</span><strong>₺${(t.netTutar||0).toFixed(2)}</strong>
        </div>
        <div style="margin-top:.7rem;font-size:.6rem;color:var(--t2);line-height:1.7;">
          ⚠️ İade onaylanırsa <strong>iade faturası</strong> kesilmesi gerekmektedir.<br>
          KDV mükellefi iseniz iade KDV'si matrahtan düşülebilir.<br>
          Muhasebecinizie iletmeyi unutmayın.
        </div>
      </div>

      <div style="background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:8px;padding:.9rem;">
        <div style="font-size:.58rem;color:var(--t2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:.5rem;">İade Nedeni</div>
        <div style="font-size:.72rem;color:var(--cream);">${t.neden||'—'}</div>
        ${t.aciklama?`<div style="font-size:.65rem;color:var(--t2);margin-top:.4rem;">${t.aciklama}</div>`:''}
        ${t.redSebep?`<div style="margin-top:.6rem;font-size:.65rem;color:#ff6b6b;">Ret sebebi: ${t.redSebep}</div>`:''}
      </div>
    </div>
  `;
  modal.classList.add('open');
};

window.iadeDetayKapat = function() {
  document.getElementById('iadeDetayModal')?.classList.remove('open');
};

console.log('[GEN-Z] iade.js yüklendi ✦');
