// GEN-Z — Ortak Ürün, Kullanıcı & Puan/Rozet Verisi
// ══════════════════════════════════════════════════════

/* ───────────────────────────────────────────────
   PUAN SİSTEMİ
   Her kullanıcının 5 puan havuzu var:
     alisPuan    → ürün satın aldığında kazanılır (+2/sipariş)
     satisPuan   → ürün sattığında kazanılır (+5/satış)
     eldenElePuan→ elden-ele bağışta kazanılır (+5/bağış)
     yorumPuan   → yorum yazınca kazanılır (+3/yorum)
     davetPuan   → davet ettiği kişi kayıt olunca (+10/davet)
   toplamPuan = hepsinin toplamı
   Firestore: kullanicilar/{uid}.puanlar = { alis, satis, eldenEle, yorum, davet, toplam }
─────────────────────────────────────────────── */

/* ── PUAN MİKTARLARI ── */
const PUAN_DEGERLERI = {
  alis:     2,   // her satın alımda
  satis:    5,   // her satışta (satıcıya)
  eldenEle: 5,   // her elden-ele bağışta
  yorum:    3,   // her yorum yazımında
  davet:   10,   // davet edilen kişi kayıt olunca
};

/* ── ROZET SEVİYELERİ (kategori bazlı, ayrı ayrı) ── */
const ROZET_SEVIYELERI = {
  alis: [
    { min: 0,    label: '🛒 Yeni Alıcı',      renk: '#888',    bg: 'rgba(136,136,136,.12)' },
    { min: 10,   label: '🛍️ Alıcı',           renk: '#5CF0B4', bg: 'rgba(92,240,180,.12)'  },
    { min: 50,   label: '💫 Sadık Alıcı',     renk: '#7B5CF0', bg: 'rgba(123,92,240,.15)'  },
    { min: 150,  label: '⭐ VIP Alıcı',        renk: '#F0C55C', bg: 'rgba(240,197,92,.15)'  },
    { min: 400,  label: '👑 Efsane Alıcı',    renk: '#F0C55C', bg: 'rgba(240,197,92,.2)'   },
  ],
  satis: [
    { min: 0,    label: '🏪 Yeni Satıcı',     renk: '#888',    bg: 'rgba(136,136,136,.12)' },
    { min: 25,   label: '📦 Aktif Satıcı',    renk: '#5CF0B4', bg: 'rgba(92,240,180,.12)'  },
    { min: 100,  label: '🔥 Başarılı Satıcı', renk: '#ff9966', bg: 'rgba(255,153,102,.12)'  },
    { min: 300,  label: '💎 Uzman Satıcı',    renk: '#7B5CF0', bg: 'rgba(123,92,240,.15)'  },
    { min: 1000, label: '🏆 Usta Satıcı',     renk: '#F0C55C', bg: 'rgba(240,197,92,.2)'   },
  ],
  eldenEle: [
    { min: 0,   label: '🫶 Yardımsever',      renk: '#888',    bg: 'rgba(136,136,136,.12)' },
    { min: 25,  label: '🥈 Gümüş Kalp',       renk: '#aaa',    bg: 'rgba(170,170,170,.12)' },
    { min: 50,  label: '🥇 Altın Kalp',       renk: '#F0C55C', bg: 'rgba(240,197,92,.15)'  },
    { min: 100, label: '💎 Elmas Kalp',       renk: '#5CF0B4', bg: 'rgba(92,240,180,.2)'   },
  ],
  yorum: [
    { min: 0,   label: '✍️ Yorumcu',          renk: '#888',    bg: 'rgba(136,136,136,.12)' },
    { min: 15,  label: '📝 Eleştirmen',       renk: '#7B5CF0', bg: 'rgba(123,92,240,.12)'  },
    { min: 50,  label: '🎙️ İçerik Ustası',   renk: '#F0C55C', bg: 'rgba(240,197,92,.15)'  },
  ],
  davet: [
    { min: 0,   label: '📨 Davetçi',          renk: '#888',    bg: 'rgba(136,136,136,.12)' },
    { min: 30,  label: '🌟 Elçi',             renk: '#5CF0B4', bg: 'rgba(92,240,180,.12)'  },
    { min: 100, label: '🚀 Büyüme Motoru',    renk: '#F0C55C', bg: 'rgba(240,197,92,.2)'   },
  ],
};

/* ── PUAN/ROZET HESAPLAMA ── */
function getRozetSeviye(kategori, puan) {
  const seviyeler = ROZET_SEVIYELERI[kategori];
  if (!seviyeler) return null;
  let bulunan = seviyeler[0];
  for (const s of seviyeler) { if (puan >= s.min) bulunan = s; }
  const idx = seviyeler.indexOf(bulunan);
  const sonraki = seviyeler[idx + 1] || null;
  return {
    ...bulunan,
    puan,
    ilerleme: sonraki ? Math.min(100, Math.round(((puan - bulunan.min) / (sonraki.min - bulunan.min)) * 100)) : 100,
    sonrakiMin: sonraki?.min || null,
    sonrakiLabel: sonraki?.label || null,
  };
}

function tumRozetler(puanlar = {}) {
  return {
    alis:     getRozetSeviye('alis',     puanlar.alis     || 0),
    satis:    getRozetSeviye('satis',    puanlar.satis    || 0),
    eldenEle: getRozetSeviye('eldenEle', puanlar.eldenEle || 0),
    yorum:    getRozetSeviye('yorum',    puanlar.yorum    || 0),
    davet:    getRozetSeviye('davet',    puanlar.davet    || 0),
  };
}

function toplamPuan(puanlar = {}) {
  return (puanlar.alis || 0) + (puanlar.satis || 0) + (puanlar.eldenEle || 0)
       + (puanlar.yorum || 0) + (puanlar.davet || 0);
}

/* ── PUAN EKLEME (localStorage + Firestore opsiyonel) ── */
async function puanEkle(kaynak, miktar) {
  // 1. localStorage güncelle
  try {
    const u = JSON.parse(localStorage.getItem('genz-user') || '{}');
    if (!u.puanlar) u.puanlar = { alis: 0, satis: 0, eldenEle: 0, yorum: 0, davet: 0 };
    u.puanlar[kaynak] = (u.puanlar[kaynak] || 0) + miktar;
    u.puanlar.toplam  = toplamPuan(u.puanlar);
    localStorage.setItem('genz-user', JSON.stringify(u));
  } catch(e) {}
  // 2. Firestore güncelle (arka planda, hata olursa sessiz geç)
  try {
    const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
    const { getFirestore, doc, getDoc, setDoc, serverTimestamp } =
      await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const { getApps } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const app = getApps()[0];
    if (!app) return;
    const uid = getAuth(app).currentUser?.uid;
    if (!uid) return;
    const db  = getFirestore(app);
    const ref = doc(db, 'kullanicilar', uid);
    const snap = await getDoc(ref);
    const mevcutPuanlar = snap.exists() ? (snap.data().puanlar || {}) : {};
    mevcutPuanlar[kaynak] = (mevcutPuanlar[kaynak] || 0) + miktar;
    mevcutPuanlar.toplam  = toplamPuan(mevcutPuanlar);
    await setDoc(ref, { puanlar: mevcutPuanlar, guncellendi: serverTimestamp() }, { merge: true });
  } catch(e) { /* arka plan hata — sessiz */ }
}

/* ═══════════════════════════════════════════════
   DEMO KULLANICILAR
   Normal üye (uye), Genç-Z programlı, Satıcı, Usta senaryoları
════════════════════════════════════════════════ */
const DEMO_KULLANICILAR = [
  {
    uid: 'demo_uye_01', username: '@zeynep_k', displayName: 'Zeynep Karaoğlu',
    rol: 'uye', sehir: 'İstanbul', ilce: 'Kadıköy',
    puanlar: { alis: 36, satis: 0, eldenEle: 15, yorum: 18, davet: 20, toplam: 89 },
    ilgiAlanlari: ['💄 Kozmetik & Kişisel Bakım & Sağlık', '👗 Moda', '🌿 Doğa'],
    kayitTarihi: '2025-01',
  },
  {
    uid: 'demo_gencz_01', username: '@berk_tasarim', displayName: 'Berk Taşlıyurt',
    rol: 'gencz', sehir: 'Ankara', ilce: 'Çankaya',
    puanlar: { alis: 20, satis: 85, eldenEle: 30, yorum: 27, davet: 60, toplam: 222 },
    ilgiAlanlari: ['🎨 Sanat', '💻 Teknoloji', '📸 Fotoğraf'],
    gencimDurum: 'onaylandi',
    kayitTarihi: '2024-09',
  },
  {
    uid: 'demo_satici_01', username: '@cayyolu_shop', displayName: 'Çay Yolu',
    rol: 'satici', sehir: 'İzmir', ilce: 'Konak',
    puanlar: { alis: 12, satis: 760, eldenEle: 0, yorum: 45, davet: 30, toplam: 847 },
    magazaOnay: true, partnerRoller: ['magaza'],
    kayitTarihi: '2022-11',
  },
  {
    uid: 'demo_usta_01', username: '@ahmet_elektrik', displayName: 'Ahmet Yılmaz',
    rol: 'usta', sehir: 'Ankara', ilce: 'Çankaya',
    puanlar: { alis: 6, satis: 0, eldenEle: 10, yorum: 51, davet: 10, toplam: 77 },
    ustaOnay: true, partnerRoller: ['usta'],
    kayitTarihi: '2023-03',
  },
  {
    uid: 'demo_uye_02', username: '@mert_yeni', displayName: 'Mert Deniz',
    rol: 'uye', sehir: 'Bursa', ilce: 'Nilüfer',
    puanlar: { alis: 2, satis: 0, eldenEle: 0, yorum: 3, davet: 0, toplam: 5 },
    ilgiAlanlari: ['🎮 Oyun', '📱 Teknoloji'],
    kayitTarihi: '2025-03',
  },
];

/* ═══════════════════════════════════════════════
   DEMO ÜRÜNLER (Mağaza)
════════════════════════════════════════════════ */
const DEMO_PRODUCTS = [
  {
    id: 1, emoji: '🧴', name: 'Doğal Argan Yağı Şampuanı',
    price: 189, oldPrice: 249, rating: 4.8, reviews: 47,
    badge: 'new', tags: ['saç bakımı', 'doğal', '400ml', 'sülfatsız'],
    category: 'bakim', kategori: 'Saç Bakım',
    desc: 'Tamamen doğal argan yağı içeriğiyle formüle edilmiş, saç dökülmesini önleyen ve parlaklık veren sülfatsız şampuan. 400ml ekonomik boy.',
    gradA: 'rgba(92,240,180,0.15)', gradB: 'rgba(123,92,240,0.1)',
    seller: {
      id: 'ekosac', uid: 'demo_satici_ekosac', name: 'EkoSaç Market', initials: 'ES', sales: 127,
      joined: '2024', rating: 4.9, ratingCount: 61,
      desc: 'Doğal ve organik saç bakım ürünleri. Sülfatsız, parabensiz, vegan formüller.',
      puanlar: { alis: 0, satis: 635, eldenEle: 0, yorum: 30, davet: 0, toplam: 665 },
      comments: [
        { user: 'ay**', stars: 5, date: 'Mart 2025', text: 'Harika ürün, saçlarım çok daha sağlıklı görünüyor!' },
        { user: 'ze**', stars: 4, date: 'Şubat 2025', text: 'Kokusu güzel, bir sonraki siparişimde tekrar alacağım.' },
      ]
    }
  },
  {
    id: 2, emoji: '🕯️', name: 'El Yapımı Soya Mum Seti',
    price: 320, oldPrice: null, rating: 4.9, reviews: 28,
    badge: 'hot', tags: ['ev dekor', 'el yapımı', 'lavanta', '3'lü set'],
    category: 'dekor', kategori: 'Mum & Oda Kokusu',
    desc: 'El yapımı soya mumu seti. Lavanta, vanilya ve okaliptüs aromalı 3 farklı mum. Tamamen doğal, evcil hayvan dostu formül.',
    gradA: 'rgba(240,197,92,0.15)', gradB: 'rgba(240,140,60,0.1)',
    seller: {
      id: 'atesisik', uid: 'demo_satici_atesisik', name: 'Ateş & Işık', initials: 'AI', sales: 63,
      joined: '2024', rating: 5.0, ratingCount: 29,
      desc: 'El yapımı mumlar ve ev kokuları. Doğal malzemeler, özgün tasarımlar.',
      puanlar: { alis: 0, satis: 315, eldenEle: 20, yorum: 27, davet: 10, toplam: 372 },
      comments: [
        { user: 'me**', stars: 5, date: 'Mart 2025', text: 'Muhteşem koku ve ambalaj, hediye olarak aldım çok beğenildi.' },
      ]
    }
  },
  {
    id: 3, emoji: '🖼️', name: 'Dijital Sanat Poster Baskı',
    price: 95, oldPrice: 130, rating: 4.6, reviews: 15,
    badge: null, tags: ['poster', 'A3', 'dijital sanat', 'çerçevsiz'],
    category: 'sanat', kategori: 'Dijital Sanat & NFT',
    desc: 'Özgün dijital sanat eserleri, A3 mat fotoğraf kağıdına baskı. Üretici tarafından imzalanmış sertifika ile birlikte gönderilir.',
    gradA: 'rgba(123,92,240,0.15)', gradB: 'rgba(240,197,92,0.08)',
    seller: {
      id: 'pixelfirca', uid: 'demo_gencz_01', name: 'Pixel & Fırça', initials: 'PF', sales: 8,
      joined: '2025', rating: 4.7, ratingCount: 9,
      desc: 'Dijital sanat ve illüstrasyon. Özgün eserler, sınırlı sayıda baskılar.',
      puanlar: { alis: 20, satis: 40, eldenEle: 30, yorum: 27, davet: 60, toplam: 177 },
      comments: [
        { user: 'ka**', stars: 5, date: 'Ocak 2025', text: 'Renkler gerçekten çok canlı, beklentimin üzerinde!' },
      ]
    }
  },
  {
    id: 4, emoji: '🧪', name: 'Vitamin C Serum 30ml',
    price: 275, oldPrice: 310, rating: 4.7, reviews: 93,
    badge: 'hot', tags: ['cilt bakımı', 'C vitamini', '30ml', 'parlak cilt'],
    category: 'bakim', kategori: 'Cilt Bakım',
    desc: '%15 saf C vitamini içeren aydınlatıcı serum. Kolajen üretimini destekler, leke ve ton eşitsizliklerine karşı etkilidir. 30ml.',
    gradA: 'rgba(240,197,92,0.18)', gradB: 'rgba(92,240,180,0.1)',
    seller: {
      id: 'glowgen', uid: 'demo_satici_glowgen', name: 'GlowGen Lab', initials: 'GL', sales: 1240,
      joined: '2023', rating: 4.8, ratingCount: 312,
      desc: 'Bilimsel formüllerle cilt bakım ürünleri. Dermatolojik olarak test edilmiş.',
      puanlar: { alis: 0, satis: 6200, eldenEle: 0, yorum: 180, davet: 50, toplam: 6430 },
      comments: [
        { user: 'su**', stars: 5, date: 'Mart 2025', text: 'Lekelerim gözle görülür şekilde azaldı, kesinlikle tavsiye.' },
        { user: 'bu**', stars: 4, date: 'Şubat 2025', text: 'Teslimat hızlı, ürün kaliteli. Tekrar alacağım.' },
      ]
    }
  },
  {
    id: 5, emoji: '🎒', name: 'Mini Tuval Sırt Çantası',
    price: 445, oldPrice: null, rating: 4.5, reviews: 34,
    badge: 'new', tags: ['çanta', 'tuval', 'unisex', 'günlük'],
    category: 'giyim', kategori: 'Çanta & Cüzdan',
    desc: 'Kalın tuval kumaştan üretilmiş, su itici kaplama ile güçlendirilmiş. Dizüstü bölmesi, USB şarj portu ve 25L hacim.',
    gradA: 'rgba(92,160,240,0.15)', gradB: 'rgba(123,92,240,0.08)',
    seller: {
      id: 'urbancarry', uid: 'demo_satici_urbancarry', name: 'UrbanCarry', initials: 'UC', sales: 52,
      joined: '2024', rating: 4.6, ratingCount: 38,
      desc: 'Şehir yaşamına uygun fonksiyonel çantalar ve aksesuarlar.',
      puanlar: { alis: 0, satis: 260, eldenEle: 0, yorum: 57, davet: 20, toplam: 337 },
      comments: [
        { user: 'al**', stars: 4, date: 'Ocak 2025', text: 'Kaliteli dikiş, kumaş sağlam. Dizüstü rahat giriyor.' },
      ]
    }
  },
  {
    id: 6, emoji: '🍵', name: 'Oolong Çay Koleksiyonu',
    price: 160, oldPrice: 195, rating: 4.9, reviews: 71,
    badge: null, tags: ['çay', 'oolong', '5'li set', 'premium'],
    category: 'yiyecek', kategori: 'Çay & Kahve & Bitki Çayı',
    desc: 'Tayvan ve Çin kökenli 5 farklı oolong çeşidinden oluşan tatma seti.',
    gradA: 'rgba(92,240,120,0.15)', gradB: 'rgba(240,197,92,0.08)',
    seller: {
      id: 'cayyolu', uid: 'demo_satici_01', name: 'Çay Yolu', initials: 'ÇY', sales: 15200,
      joined: '2022', rating: 4.9, ratingCount: 890,
      desc: 'Premium çay çeşitleri. Dünya'nın dört bir yanından özenle seçilmiş yapraklar.',
      puanlar: { alis: 12, satis: 76000, eldenEle: 0, yorum: 45, davet: 30, toplam: 76087 },
      comments: [
        { user: 'fa**', stars: 5, date: 'Mart 2025', text: 'Her çeşit çok lezzetli.' },
        { user: 'ni**', stars: 5, date: 'Şubat 2025', text: 'Ambalaj şık ve kokusu harika.' },
      ]
    }
  },
  {
    id: 7, emoji: '🖊️', name: 'Kişiselleştirilmiş Deri Ajanda',
    price: 380, oldPrice: null, rating: 4.7, reviews: 22,
    badge: null, tags: ['ajanda', 'deri', 'A5', 'isim baskısı'],
    category: 'kirtasiye', kategori: 'Defter & Ajanda',
    desc: 'Hakiki deri kaplı A5 ajanda. İsim veya monogram baskısı ücretsiz.',
    gradA: 'rgba(240,140,60,0.15)', gradB: 'rgba(123,92,240,0.08)',
    seller: {
      id: 'derisanat', uid: 'demo_satici_derisanat', name: 'Deri & Sanat', initials: 'DS', sales: 3,
      joined: '2025', rating: 4.8, ratingCount: 4,
      desc: 'El işçiliğiyle hakiki deri ürünler. Kişiselleştirme seçenekleri.',
      puanlar: { alis: 4, satis: 15, eldenEle: 5, yorum: 6, davet: 0, toplam: 30 },
      comments: []
    }
  },
  {
    id: 8, emoji: '🎧', name: 'Vintage Retro Kulaklık',
    price: 890, oldPrice: 1200, rating: 4.4, reviews: 56,
    badge: 'sold', tags: ['kulaklık', 'retro', 'bluetooth', 'over-ear'],
    category: 'teknoloji', kategori: 'Ses Sistemi & Kulaklık',
    desc: '40mm sürücü üniteli Bluetooth 5.0 destekli retro tasarım kulaklık. 30 saat pil ömrü.',
    gradA: 'rgba(123,92,240,0.18)', gradB: 'rgba(92,160,240,0.08)',
    seller: {
      id: 'retrosound', uid: 'demo_satici_retrosound', name: 'RetroSound TR', initials: 'RS', sales: 420,
      joined: '2023', rating: 4.5, ratingCount: 188,
      desc: 'Retro tasarımlı modern ses ekipmanları.',
      puanlar: { alis: 0, satis: 2100, eldenEle: 0, yorum: 120, davet: 40, toplam: 2260 },
      comments: [
        { user: 'em**', stars: 4, date: 'Mart 2025', text: 'Ses kalitesi fiyatına göre çok iyi.' },
        { user: 'ya**', stars: 5, date: 'Ocak 2025', text: 'Tasarımı bayıldım.' },
      ]
    }
  },
  {
    id: 9, emoji: '🌱', name: 'Ev Bahçesi Tohum Seti',
    price: 130, oldPrice: null, rating: 4.8, reviews: 44,
    badge: 'new', tags: ['tohum', 'organik', '12'li set', 'balkon'],
    category: 'bahce', kategori: 'Bahçe & Dış Mekan',
    desc: 'Balkon ve iç mekân için ideal 12 farklı otantik tohum çeşidi. Fesleğen, nane, kekik dahil.',
    gradA: 'rgba(92,240,180,0.18)', gradB: 'rgba(92,240,120,0.1)',
    seller: {
      id: 'yesilbalkon', uid: 'demo_satici_yesilbalkon', name: 'Yeşil Balkon', initials: 'YB', sales: 85,
      joined: '2024', rating: 4.8, ratingCount: 49,
      desc: 'Organik tohumlar ve bitki bakım ürünleri.',
      puanlar: { alis: 0, satis: 425, eldenEle: 15, yorum: 39, davet: 10, toplam: 489 },
      comments: [
        { user: 'ha**', stars: 5, date: 'Şubat 2025', text: 'Hepsi çimlendi!' },
      ]
    }
  },
];

/* ═══════════════════════════════════════════════
   DEMO ELDEN-ELE BAĞIŞLAR
════════════════════════════════════════════════ */
const DEMO_ELDENELE = [
  {
    id: 'ee1', emoji: '👗', name: 'Lacivert Yazlık Elbise',
    desc: 'M beden, 2 kez giyildi, temiz ve sağlam.',
    konum: 'İstanbul / Kadıköy', puan: '+5',
    donorInitials: 'ZK', donorName: 'ze**',
    puanKazanildi: 5,
  },
  {
    id: 'ee2', emoji: '📚', name: 'Yazılım Kitapları Seti (3 Adet)',
    desc: 'Clean Code, The Pragmatic Programmer, DDIA. Az kullanılmış.',
    konum: 'Ankara / Çankaya', puan: '+5',
    donorInitials: 'BT', donorName: 'be**',
    puanKazanildi: 5,
  },
  {
    id: 'ee3', emoji: '🎮', name: 'PS4 Oyun Koleksiyonu',
    desc: '8 oyun, orijinal kutulu. Spider-Man, RDR2 dahil.',
    konum: 'İzmir / Bornova', puan: '+5',
    donorInitials: 'MD', donorName: 'me**',
    puanKazanildi: 5,
  },
];

/* ═══════════════════════════════════════════════
   DEMO USTA İLANLARI (Ustam sayfası)
════════════════════════════════════════════════ */
// (ustam.html içindeki DEMO_USTALAR ile birleşik kullanılır)
// Ustalar için puan bilgisi DEMO_KULLANICILAR'dan gelir

/* ═══════════════════════════════════════════════
   ROZET SİSTEMİ — ESKİ getBadgeLevel (geriye dönük uyumluluk)
════════════════════════════════════════════════ */
function getBadgeLevel(sales) {
  if (sales >= 100000) return { level: '100000', label: '🏅 Efsane',      emoji: '🔴' };
  if (sales >= 10000)  return { level: '10000',  label: '🏅 Usta',        emoji: '🟣' };
  if (sales >= 1000)   return { level: '1000',   label: '🏅 Uzman',       emoji: '🟤' };
  if (sales >= 100)    return { level: '100',    label: '🏅 Deneyimli',   emoji: '🟠' };
  if (sales >= 50)     return { level: '50',     label: '🏅 Gelişen',     emoji: '🔵' };
  if (sales >= 10)     return { level: '10',     label: '🏅 Aktif',       emoji: '🟡' };
  if (sales >= 1)      return { level: '1',      label: '🏅 Yeni',        emoji: '🟢' };
  return                      { level: '0',      label: '🏅 Başlangıç',   emoji: '⚪' };
}

/* ── YARDIMCI FONKSİYONLAR ── */
function getProductById(id)          { return DEMO_PRODUCTS.find(p => p.id === parseInt(id)); }
function getProductsBySeller(sid)    { return DEMO_PRODUCTS.filter(p => p.seller.id === sid); }
function getSellerById(sid)          { const p = DEMO_PRODUCTS.find(p => p.seller.id === sid); return p ? p.seller : null; }
function getAllSellers()              {
  const map = {};
  DEMO_PRODUCTS.forEach(p => { if (!map[p.seller.id]) map[p.seller.id] = { ...p.seller, products: [] }; map[p.seller.id].products.push(p); });
  return Object.values(map);
}
function getDemoKullanici(uid)       { return DEMO_KULLANICILAR.find(u => u.uid === uid); }

const KATEGORI_MAP = {
  'bakim':     'grup_7',  'dekor':    'grup_5',  'giyim':    'grup_0',
  'teknoloji': 'grup_8',  'yiyecek':  'grup_6',  'sanat':    'grup_4',
  'kirtasiye': 'grup_11', 'bahce':    'grup_5',
};

function getProductsByCategory(catId) {
  if (catId === 'all') return DEMO_PRODUCTS;
  const mapped = KATEGORI_MAP[catId] || catId;
  return DEMO_PRODUCTS.filter(p => { const pm = KATEGORI_MAP[p.category] || p.category; return pm === mapped; });
}
