// GEN-Z Analytics Olay Takibi
// Bu dosya otomatik olarak önemli olayları Firebase Analytics'e gönderir

document.addEventListener('DOMContentLoaded', () => {

  // ── Satın alma / Sipariş ──
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button, a, [data-action]');
    if (!btn) return;
    const text = btn.textContent?.trim().toLowerCase();
    const action = btn.dataset?.action;

    // Sepete ekle
    if (text?.includes('sepete ekle') || action === 'sepete-ekle') {
      window.genzLog?.('add_to_cart', {
        item_name: document.querySelector('h1, .urun-adi')?.textContent?.trim() || 'bilinmiyor'
      });
    }

    // Satın al / Sipariş ver
    if (text?.includes('satın al') || text?.includes('sipariş ver') || action === 'satin-al') {
      window.genzLog?.('begin_checkout');
    }

    // Favoriye ekle
    if (text?.includes('favori') || btn.closest('.favori-btn, .favorite-btn')) {
      window.genzLog?.('add_to_wishlist');
    }

    // Arama
    if (btn.closest('form[role="search"], .arama-form') || action === 'ara') {
      const query = document.querySelector('input[type="search"], .arama-input')?.value;
      if (query) window.genzLog?.('search', { search_term: query });
    }
  });

  // ── Arama kutusu ──
  document.querySelectorAll('input[type="search"], .arama-input').forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        window.genzLog?.('search', { search_term: input.value.trim() });
      }
    });
  });

  // ── Sayfa görüntüleme (ilk yükleme) ──
  window.genzLog?.('page_view', {
    page_path: location.pathname + location.hash,
    page_title: document.title
  });

});
