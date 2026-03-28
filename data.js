// GEN-Z Mağaza — Ortak Ürün & Kategori Verisi
/* ── KATEGORİLER (ileride doldurulacak) ── */

/* ── DEMO ÜRÜN VERİSİ ── */
const DEMO_PRODUCTS = [
  {
    id: 1, emoji: '🧴', name: 'Doğal Argan Yağı Şampuanı',
    price: 189, oldPrice: 249, rating: 4.8, reviews: 47,
    badge: 'new', tags: ['saç bakımı', 'doğal', '400ml', 'sülfatsız'],
    category: 'bakim',
    desc: 'Tamamen doğal argan yağı içeriğiyle formüle edilmiş, saç dökülmesini önleyen ve parlaklık veren sülfatsız şampuan. 400ml ekonomik boy.',
    gradA: 'rgba(92,240,180,0.15)', gradB: 'rgba(123,92,240,0.1)',
    seller: {
      id: 'ekosac', name: 'EkoSaç Market', initials: 'ES', sales: 127,
      joined: '2024', rating: 4.9, ratingCount: 61,
      desc: 'Doğal ve organik saç bakım ürünleri. Sülfatsız, parabensiz, vegan formüller.',
      comments: [
        { user: 'ay**', stars: 5, date: 'Mart 2025', text: 'Harika ürün, saçlarım çok daha sağlıklı görünüyor!' },
        { user: 'ze**', stars: 4, date: 'Şubat 2025', text: 'Kokusu güzel, bir sonraki siparişimde tekrar alacağım.' },
      ]
    }
  },
  {
    id: 2, emoji: '🕯️', name: 'El Yapımı Soya Mum Seti',
    price: 320, oldPrice: null, rating: 4.9, reviews: 28,
    badge: 'hot', tags: ['ev dekor', 'el yapımı', 'lavanta', '3\'lü set'],
    category: 'dekor',
    desc: 'El yapımı soya mumu seti. Lavanta, vanilya ve okaliptüs aromalı 3 farklı mum. Tamamen doğal, evcil hayvan dostu formül.',
    gradA: 'rgba(240,197,92,0.15)', gradB: 'rgba(240,140,60,0.1)',
    seller: {
      id: 'atesisik', name: 'Ateş & Işık', initials: 'AI', sales: 63,
      joined: '2024', rating: 5.0, ratingCount: 29,
      desc: 'El yapımı mumlar ve ev kokuları. Doğal malzemeler, özgün tasarımlar.',
      comments: [
        { user: 'me**', stars: 5, date: 'Mart 2025', text: 'Muhteşem koku ve ambalaj, hediye olarak aldım çok beğenildi.' },
      ]
    }
  },
  {
    id: 3, emoji: '🖼️', name: 'Dijital Sanat Poster Baskı',
    price: 95, oldPrice: 130, rating: 4.6, reviews: 15,
    badge: null, tags: ['poster', 'A3', 'dijital sanat', 'çerçevsiz'],
    category: 'sanat',
    desc: 'Özgün dijital sanat eserleri, A3 mat fotoğraf kağıdına baskı. Üretici tarafından imzalanmış sertifika ile birlikte gönderilir.',
    gradA: 'rgba(123,92,240,0.15)', gradB: 'rgba(240,197,92,0.08)',
    seller: {
      id: 'pixelfirca', name: 'Pixel & Fırça', initials: 'PF', sales: 8,
      joined: '2025', rating: 4.7, ratingCount: 9,
      desc: 'Dijital sanat ve illüstrasyon. Özgün eserler, sınırlı sayıda baskılar.',
      comments: [
        { user: 'ka**', stars: 5, date: 'Ocak 2025', text: 'Renkler gerçekten çok canlı, beklentimin üzerinde!' },
      ]
    }
  },
  {
    id: 4, emoji: '🧪', name: 'Vitamin C Serum 30ml',
    price: 275, oldPrice: 310, rating: 4.7, reviews: 93,
    badge: 'hot', tags: ['cilt bakımı', 'C vitamini', '30ml', 'parlak cilt'],
    category: 'bakim',
    desc: '%15 saf C vitamini içeren aydınlatıcı serum. Kolajen üretimini destekler, leke ve ton eşitsizliklerine karşı etkilidir. 30ml.',
    gradA: 'rgba(240,197,92,0.18)', gradB: 'rgba(92,240,180,0.1)',
    seller: {
      id: 'glowgen', name: 'GlowGen Lab', initials: 'GL', sales: 1240,
      joined: '2023', rating: 4.8, ratingCount: 312,
      desc: 'Bilimsel formüllerle cilt bakım ürünleri. Dermatolojik olarak test edilmiş.',
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
    category: 'giyim',
    desc: 'Kalın tuval kumaştan üretilmiş, su itici kaplama ile güçlendirilmiş. Dizüstü bölmesi, USB şarj portu ve 25L hacim.',
    gradA: 'rgba(92,160,240,0.15)', gradB: 'rgba(123,92,240,0.08)',
    seller: {
      id: 'urbancarry', name: 'UrbanCarry', initials: 'UC', sales: 52,
      joined: '2024', rating: 4.6, ratingCount: 38,
      desc: 'Şehir yaşamına uygun fonksiyonel çantalar ve aksesuarlar.',
      comments: [
        { user: 'al**', stars: 4, date: 'Ocak 2025', text: 'Kaliteli dikiş, kumaş sağlam. Dizüstü rahat giriyor.' },
      ]
    }
  },
  {
    id: 6, emoji: '🍵', name: 'Oolong Çay Koleksiyonu',
    price: 160, oldPrice: 195, rating: 4.9, reviews: 71,
    badge: null, tags: ['çay', 'oolong', '5\'li set', 'premium'],
    category: 'yiyecek',
    desc: 'Tayvan ve Çin kökenli 5 farklı oolong çeşidinden oluşan tatma seti. Her bir çeşit ayrı ayrı hava geçirmez ambalajda sunulur.',
    gradA: 'rgba(92,240,120,0.15)', gradB: 'rgba(240,197,92,0.08)',
    seller: {
      id: 'cayyolu', name: 'Çay Yolu', initials: 'ÇY', sales: 15200,
      joined: '2022', rating: 4.9, ratingCount: 890,
      desc: 'Premium çay çeşitleri. Dünya\'nın dört bir yanından özenle seçilmiş yapraklar.',
      comments: [
        { user: 'fa**', stars: 5, date: 'Mart 2025', text: 'Her çeşit çok lezzetli, özellikle milky oolong favorim oldu.' },
        { user: 'ni**', stars: 5, date: 'Şubat 2025', text: 'Ambalaj şık ve kokusu harika. Hediye olarak süper.' },
      ]
    }
  },
  {
    id: 7, emoji: '🖊️', name: 'Kişiselleştirilmiş Deri Ajanda',
    price: 380, oldPrice: null, rating: 4.7, reviews: 22,
    badge: null, tags: ['ajanda', 'deri', 'A5', 'isim baskısı'],
    category: 'kirtasiye',
    desc: 'Hakiki deri kaplı A5 ajanda. İsim veya monogram baskısı ücretsiz. 365 günlük iç sayfa, haftalık planlayıcı ve notlar bölümü.',
    gradA: 'rgba(240,140,60,0.15)', gradB: 'rgba(123,92,240,0.08)',
    seller: {
      id: 'derisanat', name: 'Deri & Sanat', initials: 'DS', sales: 3,
      joined: '2025', rating: 4.8, ratingCount: 4,
      desc: 'El işçiliğiyle hakiki deri ürünler. Kişiselleştirme seçenekleri.',
      comments: []
    }
  },
  {
    id: 8, emoji: '🎧', name: 'Vintage Retro Kulaklık',
    price: 890, oldPrice: 1200, rating: 4.4, reviews: 56,
    badge: 'sold', tags: ['kulaklık', 'retro', 'bluetooth', 'over-ear'],
    category: 'teknoloji',
    desc: '40mm sürücü üniteli Bluetooth 5.0 destekli retro tasarım kulaklık. 30 saat pil ömrü, katlanabilir tasarım ve çıkarılabilir kablo.',
    gradA: 'rgba(123,92,240,0.18)', gradB: 'rgba(92,160,240,0.08)',
    seller: {
      id: 'retrosound', name: 'RetroSound TR', initials: 'RS', sales: 420,
      joined: '2023', rating: 4.5, ratingCount: 188,
      desc: 'Retro tasarımlı modern ses ekipmanları. Nostalji ve kalite bir arada.',
      comments: [
        { user: 'em**', stars: 4, date: 'Mart 2025', text: 'Ses kalitesi fiyatına göre çok iyi, bass bolca var.' },
        { user: 'ya**', stars: 5, date: 'Ocak 2025', text: 'Tasarımı bayıldım, stüdyoda bile kullanıyorum.' },
      ]
    }
  },
  {
    id: 9, emoji: '🌱', name: 'Ev Bahçesi Tohum Seti',
    price: 130, oldPrice: null, rating: 4.8, reviews: 44,
    badge: 'new', tags: ['tohum', 'organik', '12\'li set', 'balkon'],
    category: 'bahce',
    desc: 'Balkon ve iç mekân için ideal 12 farklı otantik tohum çeşidi. Fesleğen, nane, kekik, biberiye dahil. Sertifikalı organik.',
    gradA: 'rgba(92,240,180,0.18)', gradB: 'rgba(92,240,120,0.1)',
    seller: {
      id: 'yesilbalkon', name: 'Yeşil Balkon', initials: 'YB', sales: 85,
      joined: '2024', rating: 4.8, ratingCount: 49,
      desc: 'Organik tohumlar ve bitki bakım ürünleri. Şehirde doğa yetiştiriciliği.',
      comments: [
        { user: 'ha**', stars: 5, date: 'Şubat 2025', text: 'Hepsi çimlendi! Fesleğen özellikle çok güçlü.' },
      ]
    }
  },
];

/* ── ROZET SİSTEMİ ── */
function getBadgeLevel(sales) {
  if (sales >= 100000) return { level: '100000', label: '🏅 Efsane', emoji: '🔴' };
  if (sales >= 10000)  return { level: '10000',  label: '🏅 Usta',   emoji: '🟣' };
  if (sales >= 1000)   return { level: '1000',   label: '🏅 Uzman',  emoji: '🟤' };
  if (sales >= 100)    return { level: '100',    label: '🏅 Deneyimli', emoji: '🟠' };
  if (sales >= 50)     return { level: '50',     label: '🏅 Gelişen', emoji: '🔵' };
  if (sales >= 10)     return { level: '10',     label: '🏅 Aktif',  emoji: '🟡' };
  if (sales >= 1)      return { level: '1',      label: '🏅 Yeni',   emoji: '🟢' };
  return { level: '0', label: '🏅 Başlangıç', emoji: '⚪' };
}

/* ── YARDIMCI FONKSİYONLAR ── */
function getProductById(id) {
  return DEMO_PRODUCTS.find(p => p.id === parseInt(id));
}
function getProductsBySeller(sellerId) {
  return DEMO_PRODUCTS.filter(p => p.seller.id === sellerId);
}
function getSellerById(sellerId) {
  const product = DEMO_PRODUCTS.find(p => p.seller.id === sellerId);
  return product ? product.seller : null;
}
function getAllSellers() {
  const map = {};
  DEMO_PRODUCTS.forEach(p => {
    if (!map[p.seller.id]) { map[p.seller.id] = { ...p.seller, products: [] }; }
    map[p.seller.id].products.push(p);
  });
  return Object.values(map);
}
function getProductsByCategory(catId) {
  if (catId === 'all') return DEMO_PRODUCTS;
  return DEMO_PRODUCTS.filter(p => p.category === catId);
}

// ── Eski category id → KATEGORILER grup index eşlemesi ──
const KATEGORI_MAP = {
  'bakim':      'grup_7',   // Kozmetik & Kişisel Bakım & Sağlık
  'dekor':      'grup_5',   // Ev & Yaşam
  'giyim':      'grup_0',   // Giyim & Moda
  'teknoloji':  'grup_8',   // Elektronik & Teknoloji
  'yiyecek':    'grup_6',   // Gıda & İçecek
  'sanat':      'grup_4',   // El Yapımı & Sanat & Koleksiyon
  'kirtasiye':  'grup_11',  // Kitap & Kırtasiye & Ofis
  'bahce':      'grup_5',   // Ev & Yaşam (bahçe alt kategorisi)
};

function getProductsByCategory(catId) {
  if (catId === 'all') return DEMO_PRODUCTS;
  // Eski id mi, yeni grup_N mi?
  const mapped = KATEGORI_MAP[catId] || catId;
  return DEMO_PRODUCTS.filter(p => {
    const pMapped = KATEGORI_MAP[p.category] || p.category;
    return pMapped === mapped;
  });
}
