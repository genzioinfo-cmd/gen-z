// GEN-Z Mağaza — Ortak Veri
// Tüm ürünler artık Firestore'dan çekilir. Bu dosya sadece yardımcı map'leri içerir.

const DEMO_PRODUCTS = []; // Boş — production'da kullanılmaz

const KATEGORI_MAP = {
  'bakim':      'grup_7',
  'dekor':      'grup_5',
  'giyim':      'grup_0',
  'teknoloji':  'grup_8',
  'yiyecek':    'grup_6',
  'sanat':      'grup_4',
  'kirtasiye':  'grup_11',
  'bahce':      'grup_5',
};

function getProductsByCategory(catId) {
  if (catId === 'all') return DEMO_PRODUCTS;
  const mapped = KATEGORI_MAP[catId] || catId;
  return DEMO_PRODUCTS.filter(p => {
    const pMapped = KATEGORI_MAP[p.category] || p.category;
    return pMapped === mapped;
  });
}
