// ══════════════════════════════════════════════
//  GEN-Z — Ortak Kategori Listesi
//  Bu dosya: modpanel, magaza, ustam sayfaları
//  tarafından paylaşılır. Sadece buradan düzenle.
// ══════════════════════════════════════════════

const KATEGORILER = [
  { grup: '👔 Giyim & Moda', liste: [
    'Kadın Giyim','Erkek Giyim','Çocuk & Bebek Giyim','Unisex Giyim',
    'Hazır Giyim','İç Giyim & Pijama','Spor Giyim','Outdoor & Dağcılık Kıyafeti',
    'İş Kıyafeti / Forma','Gelinlik & Damatlik','Kostüm & Parti Kıyafeti',
    'Yüzme & Plaj Giyim','Hamile Giyim','Büyük Beden Giyim',
  ]},
  { grup: '🧵 Kumaş & Tekstil', liste: [
    'Kumaş / Tekstil','Pamuklu Kumaş','İpek Kumaş','Yün & Kaşmir Kumaş',
    'Sentetik Kumaş (Polyester, Naylon)','Keten Kumaş','Kadife & Kadifemsi',
    'Dantel & Tül','Denim Kumaş','Deri & Suni Deri','Örme Kumaş (Jersey, Triko)',
    'Sublimasyon & Baskılı Kumaş','Teknik Kumaş (Gore-Tex, Softshell)',
    'Elyaf & İplik','Dokuma Ürün','Halı & Kilim',
  ]},
  { grup: '💍 Aksesuar & Takı', liste: [
    'Aksesuar','Takı & Mücevher','Altın Takı','Gümüş Takı','Fantezi Takı',
    'Saat','Güneş Gözlüğü','Şapka & Bere','Kemer','Kravat & Fular & Eşarp',
    'Eldiven','Çorap','Çanta & Cüzdan','Sırt Çantası','Bavul & Valiz',
    'Anahtarlık & Küçük Aksesuar',
  ]},
  { grup: '👟 Ayakkabı', liste: [
    'Kadın Ayakkabı','Erkek Ayakkabı','Çocuk Ayakkabı','Spor Ayakkabı',
    'Bot & Çizme','Terlik & Sandalet','Klasik & Deri Ayakkabı','Topuklu Ayakkabı',
    'Çalışma Ayakkabısı (Safety)','Ortopedik Ayakkabı',
  ]},
  { grup: '✋ El Yapımı & Sanat & Koleksiyon', liste: [
    'El Yapımı','Seramik & Çömlek','Cam & Kristal El İşi','Tahta Oyma & Ahşap El İşi',
    'Deri El İşi','Nakış & Örgü','Mozaik & Vitray','Heykel & Biblo','Resim & Tablo (El Yapımı)',
    'Baskı Sanatı (Gravür, Serigrafi)','Fotoğraf Sanatı','Dijital Sanat & NFT',
    'Antika & Koleksiyon','Pul & Madeni Para Koleksiyon','Oyuncak & Model (Koleksiyon)',
    'Şarap & Viski Koleksiyon','Spor Memorabilyası',
  ]},
  { grup: '🏡 Ev & Yaşam', liste: [
    'Ev Tekstili','Yatak Örtüsü & Nevresim','Havlu & Banyo Tekstili','Perde & Stor',
    'Halı & Kilim & Paspas','Yastık & Yastık Kılıfı','Battaniye & Yorgan',
    'Mobilya','Aydınlatma & Lamba','Mutfak Eşyaları','Pişirme & Yemek Yapımı',
    'Dekorasyon & Aksesuar','Çerçeve & Tablo','Saat (Ev)','Mum & Oda Kokusu',
    'Temizlik & Hijyen Ürünleri','Bahçe & Dış Mekan','Alet & Hırdavat',
    'Yapı Malzemeleri','Boya & Kaplama','Banyo & Tesisat Ürünleri',
    'Güvenlik & Alarm Sistemleri','Akıllı Ev Ürünleri',
  ]},
  { grup: '🍎 Gıda & İçecek', liste: [
    'Taze Meyve & Sebze','Et & Tavuk & Balık','Süt Ürünleri & Yumurta',
    'Ekmek & Pastane','Tahıl & Bakliyat','Yağ & Sos & Baharat',
    'Organik & Doğal Gıda','Glutensiz & Diyet Ürün','Dondurulmuş Gıda',
    'Konserve & Hazır Gıda','Şekerleme & Çikolata','Atıştırmalık & Kuruyemiş',
    'Çay & Kahve & Bitki Çayı','İçecek (Meyve Suyu, Kola vb.)','Alkollü İçecek',
    'Su & Maden Suyu','Bebek Maması & Gıda','Hayvan Maması',
  ]},
  { grup: '💄 Kozmetik & Kişisel Bakım & Sağlık', liste: [
    'Makyaj & Kozmetik','Cilt Bakım','Saç Bakım','Vücut Bakım & Losyon',
    'Parfüm & Deodorant','Tıraş Ürünleri','Ağız & Diş Bakım',
    'El & Tırnak Bakım','Güneş Koruma','Erkek Bakım',
    'Bebek Bakım','Doğal & Organik Kozmetik','Medikal Cihaz & Sarf',
    'Eczane Ürünleri & Takviye','Vitamin & Mineral','Spor Takviyesi (Protein vb.)',
    'Cinsel Sağlık','Göz Bakım & Gözlük',
  ]},
  { grup: '💻 Elektronik & Teknoloji', liste: [
    'Cep Telefonu & Aksesuarı','Bilgisayar & Laptop','Tablet & iPad',
    'Ekran Kartı','İşlemci','Anakart','RAM & Bellek',
    'Televizyon & Monitör','Ses Sistemi & Kulaklık','Fotoğraf & Video Makinesi',
    'Oyun Konsolu & Aksesuar','Akıllı Saat & Bileklik','Drone & Robot',
    'Ev Elektroniği (Çamaşır, Bulaşık Makinesi vb.)','Küçük Ev Aletleri',
    'Yazıcı & Tarayıcı','Depolama & Hafıza (SSD, HDD)','Ağ & Modem & Router',
    'Batarya & Şarj Cihazı','Kablo & Adaptör','Yazılım & Lisans',
  ]},
  { grup: '🚗 Otomotiv', liste: [
    'Otomobil Parça & Aksesuar','Motosiklet Parça & Aksesuar',
    'Lastik & Jant','Yağ & Sıvı (Otomotiv)','Oto Bakım & Temizlik',
    'Araç İçi Aksesuar','Navigasyon & Araç Elektroniği','Bisiklet Parça & Aksesuar',
    'Elektrikli Araç Ekipmanı','Araç Güvenlik (Kask, Reflektör)',
  ]},
  { grup: '⚽ Spor & Fitness & Outdoor', liste: [
    'Spor Ekipmanı (Genel)','Fitness & Gym Ekipmanı','Koşu & Yürüyüş',
    'Bisiklet & Scooter','Yüzme & Su Sporları','Kamp & Trekking',
    'Dağ Sporları & Kayak','Top Sporları (Futbol, Basketbol vb.)',
    'Raket Sporları (Tenis, Badminton)','Dövüş Sporları','Golf',
    'Balıkçılık & Av','Yoga & Pilates','Dans & Jimnastik',
  ]},
  { grup: '📚 Kitap & Kırtasiye & Ofis', liste: [
    'Kitap (Roman, Bilim, Tarih vb.)','Dergi & Gazete','E-kitap & Dijital İçerik',
    'Kırtasiye & Kalem','Defter & Ajanda','Dosya & Klasör & Arşiv',
    'Ofis Mobilyası','Yazıcı Sarf Malzemesi','Posta & Paketleme Malzemesi',
    'Eğitim Materyali','Harita & Atlas',
  ]},
  { grup: '🧸 Oyuncak & Çocuk & Bebek', liste: [
    'Oyuncak (Genel)','Lego & Yapı Seti','Bebek & Peluş Oyuncak',
    'Tahta Oyuncak','Eğitici Oyuncak & Puzzle','Dış Mekan Oyuncak',
    'Oyun Konsolu Oyunu','Kart & Masa Oyunu','Bebek Arabası & Taşıyıcı',
    'Bebek Mobilyası','Bebek Tekstili','Emzirme & Mama Ürünleri',
  ]},
  { grup: '🎵 Müzik & Enstrüman & Hobi', liste: [
    'Enstrüman (Gitar, Keman vb.)','Ses & Kayıt Ekipmanı',
    'Müzik Aksesuarı (Tel, Reçine)','Boyama & Çizim Malzemeleri',
    'Fotoğrafçılık Ekipmanı','El İşi & Hobi Malzemeleri',
    'Bahçecilik & Tarım Aletleri','Model & Maket Yapımı',
  ]},
  { grup: '🐾 Hayvan & Pet', liste: [
    'Kedi Ürünleri','Köpek Ürünleri','Kuş Ürünleri','Balık & Akvaryum',
    'At & Çiftlik Hayvanı','Böcek & Egzotik Hayvan','Veteriner Ürünleri',
    'Çiftlik & Tarım Hayvanı Ekipmanı',
  ]},
  { grup: '🏭 Endüstriyel & İnşaat & B2B', liste: [
    'Terzilik Malzemeleri','Makine & Ekipman','Sanayi Kimyasalı',
    'Elektrik Malzemeleri','Boru & Vana & Tesisat','Güvenlik & İş Koruma',
    'Ambalaj & Baskı Malzemesi','Tarım İlacı & Gübre','Veteriner & Tarım',
    'Medikal Sarf & Ekipman','Laboratuvar Malzemeleri',
    'İnşaat Malzemeleri','Yapı Kimyasalı',
  ]},
  { grup: '🌐 Dijital Ürün & Hizmet', liste: [
    'Dijital Ürün (Tasarım, Şablon)','Yazılım & Uygulama',
    'Online Kurs & Eğitim','Danışmanlık Hizmeti','Fotoğraf & Video Hizmet',
    'Tercüme & Yazarlık','Grafik Tasarım Hizmeti','Web & Uygulama Geliştirme',
    'Sosyal Medya Hizmet','Hukuki & Mali Danışmanlık',
  ]},
];

// Ziyaretçi sayfaları için grup bazlı CATEGORIES (magaza.html, ustam.html sidebar)
const CATEGORIES = [
  { id: 'all', name: 'Tümü', icon: '🌐' },
  ...KATEGORILER.map((g, i) => ({
    id: 'grup_' + i,
    name: g.grup.replace(/^[\S]+\s/, ''), // emojiyi ayır
    icon: g.grup.split(' ')[0],
    liste: g.liste,
  }))
];

function tumKategoriler() {
  return KATEGORILER.flatMap(g => g.liste);
}
