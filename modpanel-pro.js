/**
 * GEN-Z Modpanel Pro
 * modpanel-pro.js
 *
 * KÜÇÜK İŞLETME (ücretsiz): temel özellikler
 * BÜYÜK İŞLETME (999₺ Pro): tüm özellikler açık
 */

import { getApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getFirestore, collection, doc, addDoc, updateDoc, getDoc, getDocs,
  query, where, orderBy, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

let db;
try { db = getFirestore(getApp()); } catch(e) { db = getFirestore(); }

// ── Yardımcılar ─────────────────────────────────────────────────────────
const para   = n => Number(n||0).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});
const paraK  = n => n>=1000000?(n/1000000).toFixed(1)+'M':n>=1000?(n/1000).toFixed(1)+'K':Number(n||0).toLocaleString('tr-TR');
const tst    = (id,v) => { const e=document.getElementById(id); if(e) e.textContent=v; };
const elId   = id => document.getElementById(id);
const html   = (id,v) => { const e=elId(id); if(e) e.innerHTML=v; };

// ── Pro durum kontrolü ───────────────────────────────────────────────────
let _isPro = false;

async function proKontrol() {
  const mag = window._magaza;
  const uid = window._aktifUid;
  if(!mag && !uid) return false;

  // Admin her zaman pro
  try {
    const userSnap = await getDoc(doc(db,'kullanicilar',uid));
    const ud = userSnap.data() || {};
    if(ud.rol==='admin'||(ud.roller||[]).includes('admin')) { _isPro=true; return true; }
    // Pro modül satın alındı mı?
    if(mag?.proModul===true) { _isPro=true; return true; }
    if(ud.proModul===true)   { _isPro=true; return true; }
  } catch(e) {}
  _isPro = false;
  return false;
}

// ── Pro kilit overlay ────────────────────────────────────────────────────
function proKilitHTML(ozellik='Bu özellik') {
  return `
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:320px;text-align:center;padding:2rem;">
    <div style="font-size:56px;margin-bottom:1.2rem;filter:drop-shadow(0 0 24px rgba(201,168,76,.3));">🔒</div>
    <div style="font-family:'Syne',sans-serif;font-size:1.4rem;font-weight:800;color:var(--cream);margin-bottom:.5rem;">${ozellik}</div>
    <div style="font-size:.75rem;color:var(--t2);max-width:360px;line-height:1.8;margin-bottom:1.8rem;">
      Bu özellik <strong style="color:var(--gold);">Büyük İşletme Modülü</strong>'ne dahildir.<br>
      Analitik, muhasebe, müşteri yönetimi ve daha fazlası için yükseltin.
    </div>
    <!-- Pro Paket Kartı -->
    <div style="background:linear-gradient(135deg,rgba(201,168,76,.08),rgba(123,92,240,.08));border:1px solid rgba(201,168,76,.3);border-radius:16px;padding:1.8rem 2.4rem;margin-bottom:1.5rem;width:100%;max-width:380px;">
      <div style="font-size:.55rem;letter-spacing:.3em;text-transform:uppercase;color:var(--gold);margin-bottom:.6rem;">⚡ Büyük İşletme Modülü</div>
      <div style="font-family:'Syne',sans-serif;font-size:2.8rem;font-weight:800;color:var(--cream);margin-bottom:.3rem;">999₺</div>
      <div style="font-size:.65rem;color:var(--t2);margin-bottom:1.2rem;">tek seferlik · ömür boyu kullanım</div>
      <div style="text-align:left;font-size:.68rem;color:var(--t2);line-height:2.1;">
        ✦ Gelişmiş Analitik & Grafikler<br>
        ✦ Müşteri CRM Sistemi<br>
        ✦ Kampanya & Kupon Yönetimi<br>
        ✦ Tam Muhasebe (KDV, Fatura, Vergi)<br>
        ✦ Barkod, QR Kod, Raf Sistemi<br>
        ✦ Usta: Profil, Muhasebe, Yorumlar<br>
        ✦ Genç-Z: Dijital Mağaza, Portföy<br>
        ✦ Öncelikli Destek 🎖️
      </div>
    </div>
    <button onclick="proSatinAl()" style="padding:1rem 3rem;background:linear-gradient(135deg,#c9a84c,#d4a83e);color:#000;border:none;border-radius:8px;font-family:'Syne',sans-serif;font-size:.78rem;font-weight:800;letter-spacing:.1em;cursor:pointer;transition:all .2s;"
      onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
      ✦ Hemen Yükselt — 999₺
    </button>
    <div style="font-size:.6rem;color:var(--t2);margin-top:.8rem;">Güvenli ödeme · Anında aktivasyon</div>
  </div>`;
}

// Pro satın al
window.proSatinAl = async function() {
  // Gerçek ödeme entegrasyonu buraya gelecek
  // Şimdilik demo mod
  if(!confirm('999₺ Büyük İşletme Modülü satın almak istiyor musunuz?\n\n✦ Tek seferlik ödeme\n✦ Anında aktivasyon\n✦ Ömür boyu kullanım')) return;
  
  try {
    const mag = window._magaza;
    const uid = window._aktifUid;
    if(mag) await updateDoc(doc(db,'magazalar',mag.id),{ proModul:true, proModulTs:serverTimestamp() });
    if(uid) await updateDoc(doc(db,'kullanicilar',uid),{ proModul:true, proModulTs:serverTimestamp() });
    _isPro = true;
    if(typeof toast==='function') toast('🎉 Büyük İşletme Modülü aktif edildi! Tüm özellikler açıldı.');
    // Mevcut sayfayı yenile
    const aktif = document.querySelector('.sayfa.on');
    if(aktif && window.proModulYukle) window.proModulYukle(aktif.id.replace('sayfa-',''));
  } catch(e) {
    if(typeof toast==='function') toast('Hata: '+e.message,'err');
  }
};

// ═══════════════════════════════════════════════════════════════════════════
//  🏪 MAĞAZA PRO — ANALİTİK
// ═══════════════════════════════════════════════════════════════════════════

window.proModulYukle = async function(sayfa) {
  await proKontrol();
  const mag = window._magaza;

  if(!_isPro) {
    const hedefler = {
      'analitik':'Gelişmiş Analitik',
      'musteriler':'Müşteri Yönetimi',
      'kampanyalar':'Kampanya & Kupon',
      'muhasebe':'Tam Muhasebe',
      'magaza-ayarlar':'Mağaza Ayarları',
    };
    html('sayfa-'+sayfa, `<div class="sh"><span class="eyebrow">Pro Özellik</span><h1>${hedefler[sayfa]||'Pro Özellik'}</h1></div>` + proKilitHTML(hedefler[sayfa]||'Bu Özellik'));
    return;
  }

  switch(sayfa) {
    case 'analitik':     return magAnalitikYukle(mag);
    case 'musteriler':   return magMusterilerYukle(mag);
    case 'kampanyalar':  return magKampanyalarYukle(mag);
    case 'muhasebe':     return magMuhasebeYukle(mag);
    case 'magaza-ayarlar': return magAyarlarYukle(mag);
  }
};

// ── Sayfa HTML şablonları oluştur ────────────────────────────────────────
function sayfaOlustur(id, eyebrow, baslik, vurgu) {
  let cont = document.getElementById('sayfa-'+id);
  if(!cont) {
    cont = document.createElement('div');
    cont.className = 'sayfa';
    cont.id = 'sayfa-'+id;
    const panel = document.getElementById('panel');
    if(panel) panel.querySelector('.icerik')?.appendChild(cont) || panel.appendChild(cont);
  }
  cont.innerHTML = `<div class="sh"><span class="eyebrow">${eyebrow}</span><h1>${baslik} <em>${vurgu}</em></h1></div><div id="${id}-icerik"><div style="text-align:center;padding:3rem;color:var(--t2);">Yükleniyor…</div></div>`;
  return cont;
}

// ── ANALİTİK ────────────────────────────────────────────────────────────
async function magAnalitikYukle(mag) {
  let sips = window._siparisler||[];
  if(!sips.length) {
    try {
      const s=await getDocs(query(collection(db,'magaza_siparisler'),where('magazaId','==',mag.id),orderBy('ts','desc')));
      sips=s.docs.map(d=>({id:d.id,...d.data()}));
      window._siparisler=sips;
    } catch(e){}
  }

  const urunler = window._urunler||[];
  const tam = sips.filter(s=>s.durum==='tamamlandi');
  const now = new Date();
  const buAy = tam.filter(s=>{ const t=s.ts?.toDate?s.ts.toDate():new Date(); return t.getMonth()===now.getMonth()&&t.getFullYear()===now.getFullYear(); });
  const gecenAy = tam.filter(s=>{ const t=s.ts?.toDate?s.ts.toDate():new Date(); const g=new Date(now); g.setMonth(g.getMonth()-1); return t.getMonth()===g.getMonth()&&t.getFullYear()===g.getFullYear(); });

  const brutBu=buAy.reduce((t,s)=>t+(s.toplam||0),0);
  const brutGecen=gecenAy.reduce((t,s)=>t+(s.toplam||0),0);
  const netBu=brutBu*0.9;
  const ortBu=buAy.length?brutBu/buAy.length:0;
  const iadeSay=sips.filter(s=>s.durum==='iptal').length;
  const iadeOran=sips.length?(iadeSay/sips.length*100).toFixed(1):0;

  // Son 12 ay bar data
  const aylikVeri=Array.from({length:12},(_,i)=>{
    const hedef=new Date(now); hedef.setMonth(now.getMonth()-11+i);
    const val=tam.filter(s=>{ const t=s.ts?.toDate?s.ts.toDate():new Date(); return t.getMonth()===hedef.getMonth()&&t.getFullYear()===hedef.getFullYear(); }).reduce((t,s)=>t+(s.toplam||0),0);
    return {ay:hedef.toLocaleDateString('tr-TR',{month:'short'}),val};
  });
  const maxAy=Math.max(...aylikVeri.map(a=>a.val))||1;

  // En çok satan
  const us={};
  tam.forEach(s=>(s.urunler||[]).forEach(u=>{ const k=u.name||u.ad||'—'; if(!us[k])us[k]={adet:0,ciro:0}; us[k].adet+=u.adet||1; us[k].ciro+=(u.fiyat||0)*(u.adet||1); }));
  const top5=Object.entries(us).sort((a,b)=>b[1].ciro-a[1].ciro).slice(0,5);
  const maxCiro=top5[0]?.[1]?.ciro||1;

  // Sipariş durum dağılımı
  const durumlar={tamamlandi:0,kargo:0,beklemede:0,iptal:0};
  sips.forEach(s=>{ if(durumlar[s.durum]!==undefined) durumlar[s.durum]++; });

  const degisimHTML=(simdi,onceki)=>{
    if(!onceki) return '';
    const r=((simdi-onceki)/onceki*100).toFixed(1);
    return `<span style="font-size:.55rem;padding:.15rem .5rem;border-radius:20px;font-weight:700;background:${r>=0?'rgba(92,240,180,.12)':'rgba(255,80,80,.1)'};color:${r>=0?'#5CF0B4':'#ff6b6b'};">${r>=0?'▲':'▼'} ${Math.abs(r)}% geçen ay</span>`;
  };

  html('analitik-icerik',`
    <!-- KPI Kartlar -->
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(195px,1fr));gap:.9rem;margin-bottom:1.5rem;">
      ${[
        {ikon:'💰',lbl:'Bu Ay Ciro',val:'₺'+paraK(brutBu),alt:degisimHTML(brutBu,brutGecen),renk:'#7B5CF0'},
        {ikon:'💚',lbl:'Net Kazanç',val:'₺'+paraK(netBu),alt:'komisyon sonrası',renk:'#5CF0B4'},
        {ikon:'🛒',lbl:'Sipariş',val:buAy.length,alt:degisimHTML(buAy.length,gecenAy.length),renk:'#F0C55C'},
        {ikon:'📦',lbl:'Ort. Sepet',val:'₺'+para(ortBu),alt:'bu ay',renk:'#ff9966'},
        {ikon:'🔄',lbl:'İade Oranı',val:'%'+iadeOran,alt:iadeSay+' adet iptal',renk:'#ff6b6b'},
        {ikon:'✅',lbl:'Yayındaki Ürün',val:urunler.filter(u=>u.durum==='onaylandi').length,alt:'toplam: '+urunler.length,renk:'#a78bfa'},
      ].map(k=>`
        <div style="background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:12px;padding:1.2rem;">
          <div style="font-size:.56rem;color:var(--t2);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.4rem;">${k.ikon} ${k.lbl}</div>
          <div style="font-family:'Syne',sans-serif;font-size:1.6rem;font-weight:800;color:${k.renk};margin-bottom:.25rem;">${k.val}</div>
          <div style="font-size:.58rem;color:var(--t2);">${k.alt||''}</div>
        </div>
      `).join('')}
    </div>

    <div style="display:grid;grid-template-columns:2fr 1fr;gap:1rem;margin-bottom:1rem;">
      <!-- Aylık bar grafik -->
      <div style="background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:12px;padding:1.4rem;">
        <div style="font-size:.68rem;font-weight:700;color:var(--cream);margin-bottom:1.2rem;">📊 Aylık Satış (Son 12 Ay)</div>
        <div style="display:flex;align-items:flex-end;gap:6px;height:100px;">
          ${aylikVeri.map(a=>{
            const h=Math.max(4,(a.val/maxAy)*100);
            return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
              <div style="font-size:.45rem;color:var(--t2);">₺${paraK(a.val)}</div>
              <div title="₺${para(a.val)}" style="width:100%;height:${h}px;background:${a.val>0?'linear-gradient(180deg,#7B5CF0,#a78bfa)':'rgba(255,255,255,.04)'};border-radius:4px 4px 0 0;cursor:default;transition:opacity .2s;" onmouseover="this.style.opacity='.7'" onmouseout="this.style.opacity='1'"></div>
              <div style="font-size:.5rem;color:var(--t2);">${a.ay}</div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <!-- Durum dağılımı -->
      <div style="background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:12px;padding:1.4rem;">
        <div style="font-size:.68rem;font-weight:700;color:var(--cream);margin-bottom:1rem;">📦 Sipariş Durumları</div>
        ${Object.entries({tamamlandi:{lbl:'✅ Tamamlandı',renk:'#5CF0B4'},kargo:{lbl:'🚚 Kargoda',renk:'#F0C55C'},beklemede:{lbl:'⏳ Bekliyor',renk:'#a78bfa'},iptal:{lbl:'❌ İptal',renk:'#ff6b6b'}}).map(([k,v])=>`
          <div style="margin-bottom:.7rem;">
            <div style="display:flex;justify-content:space-between;font-size:.6rem;margin-bottom:.25rem;"><span style="color:var(--t2);">${v.lbl}</span><span style="color:${v.renk};font-weight:700;">${durumlar[k]}</span></div>
            <div style="height:5px;background:rgba(255,255,255,.06);border-radius:3px;"><div style="height:100%;width:${sips.length?Math.round(durumlar[k]/sips.length*100):0}%;background:${v.renk};border-radius:3px;transition:width .5s;"></div></div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- En çok satanlar -->
    <div style="background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:12px;padding:1.4rem;">
      <div style="font-size:.68rem;font-weight:700;color:var(--cream);margin-bottom:1rem;">🏆 En Çok Satan Ürünler</div>
      ${top5.length ? `<table style="width:100%;">
        <thead><tr style="font-size:.58rem;color:var(--t2);">
          <th style="text-align:left;padding:.4rem 0;">#</th>
          <th style="text-align:left;">Ürün</th>
          <th style="text-align:right;">Adet</th>
          <th style="text-align:right;">Ciro</th>
          <th style="text-align:left;padding-left:1rem;">Oran</th>
        </tr></thead>
        <tbody>${top5.map(([ad,u],i)=>`
          <tr style="border-top:1px solid rgba(255,255,255,.04);">
            <td style="padding:.5rem 0;font-size:.65rem;color:var(--t2);">${i+1}</td>
            <td style="font-size:.7rem;color:var(--cream);font-weight:600;">${ad}</td>
            <td style="text-align:right;font-size:.65rem;color:var(--t2);">${u.adet}</td>
            <td style="text-align:right;font-size:.7rem;color:var(--gold);font-weight:700;">₺${paraK(u.ciro)}</td>
            <td style="padding-left:1rem;">
              <div style="height:6px;background:rgba(255,255,255,.06);border-radius:3px;width:120px;">
                <div style="height:100%;width:${Math.round(u.ciro/maxCiro*100)}%;background:linear-gradient(90deg,#7B5CF0,#a78bfa);border-radius:3px;"></div>
              </div>
            </td>
          </tr>
        `).join('')}</tbody>
      </table>` : '<div style="color:var(--t2);text-align:center;padding:1.5rem;font-style:italic;">Henüz sipariş verisi yok</div>'}
    </div>
  `);
}

// ── MÜŞTERİLER (CRM) ────────────────────────────────────────────────────
async function magMusterilerYukle(mag) {
  let sips = window._siparisler||[];
  if(!sips.length) {
    try {
      const s=await getDocs(query(collection(db,'magaza_siparisler'),where('magazaId','==',mag.id)));
      sips=s.docs.map(d=>({id:d.id,...d.data()})); window._siparisler=sips;
    } catch(e){}
  }

  // Müşteri bazlı gruplama
  const mstMap={};
  sips.forEach(s=>{
    const k=s.musteriEmail||s.musteriUid||'bilinmiyor';
    if(!mstMap[k])mstMap[k]={ad:s.musteriAd||s.musteriEmail||'—',email:s.musteriEmail||'—',sipSay:0,toplam:0,ilk:s.ts,son:s.ts};
    mstMap[k].sipSay++;
    mstMap[k].toplam+=(s.toplam||0);
    if(s.ts&&s.ts>mstMap[k].son)mstMap[k].son=s.ts;
  });
  const musteriler=Object.values(mstMap).sort((a,b)=>b.toplam-a.toplam);
  const topMst=musteriler[0]?.toplam||1;

  html('musteriler-icerik',`
    <!-- Özet -->
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:.9rem;margin-bottom:1.5rem;">
      ${[
        {ikon:'👥',lbl:'Toplam Müşteri',val:musteriler.length,renk:'#7B5CF0'},
        {ikon:'🔄',lbl:'Tekrar Alışveriş',val:musteriler.filter(m=>m.sipSay>1).length,renk:'#5CF0B4'},
        {ikon:'💰',lbl:'Ort. Müşteri Değeri',val:'₺'+para(musteriler.length?musteriler.reduce((t,m)=>t+m.toplam,0)/musteriler.length:0),renk:'#F0C55C'},
        {ikon:'🏆',lbl:'En İyi Müşteri',val:'₺'+para(musteriler[0]?.toplam||0),renk:'#ff9966'},
      ].map(k=>`
        <div style="background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:12px;padding:1.1rem;">
          <div style="font-size:.56rem;color:var(--t2);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.4rem;">${k.ikon} ${k.lbl}</div>
          <div style="font-family:'Syne',sans-serif;font-size:1.4rem;font-weight:800;color:${k.renk};">${k.val}</div>
        </div>
      `).join('')}
    </div>

    <div style="background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:12px;padding:1.4rem;">
      <div style="font-size:.68rem;font-weight:700;color:var(--cream);margin-bottom:1rem;">👥 Müşteri Listesi (CLV'ye göre)</div>
      ${musteriler.length ? `<table style="width:100%;">
        <thead><tr style="font-size:.58rem;color:var(--t2);">
          <th style="text-align:left;padding:.4rem 0;">Müşteri</th>
          <th style="text-align:center;">Sipariş</th>
          <th style="text-align:right;">Toplam Harcama</th>
          <th style="text-align:right;">Ort. Sepet</th>
          <th style="text-align:left;padding-left:1rem;">CLV Skoru</th>
        </tr></thead>
        <tbody>${musteriler.slice(0,20).map((m,i)=>{
          const segment=m.toplam>topMst*0.7?'🥇 VIP':m.sipSay>2?'🔄 Sadık':'🆕 Yeni';
          return `<tr style="border-top:1px solid rgba(255,255,255,.04);">
            <td style="padding:.5rem 0;">
              <div style="font-size:.7rem;color:var(--cream);font-weight:600;">${m.ad}</div>
              <div style="font-size:.55rem;color:var(--t2);">${m.email}</div>
            </td>
            <td style="text-align:center;font-size:.65rem;color:var(--t2);">${m.sipSay}</td>
            <td style="text-align:right;font-size:.72rem;color:var(--gold);font-weight:700;">₺${para(m.toplam)}</td>
            <td style="text-align:right;font-size:.65rem;color:var(--t2);">₺${para(m.sipSay?m.toplam/m.sipSay:0)}</td>
            <td style="padding-left:1rem;">
              <div style="display:flex;align-items:center;gap:.5rem;">
                <div style="height:5px;width:${Math.round(m.toplam/topMst*80)}px;background:linear-gradient(90deg,#7B5CF0,#5CF0B4);border-radius:3px;"></div>
                <span style="font-size:.52rem;color:var(--t2);">${segment}</span>
              </div>
            </td>
          </tr>`;
        }).join('')}</tbody>
      </table>` : '<div style="color:var(--t2);text-align:center;padding:2rem;font-style:italic;">Henüz müşteri verisi yok</div>'}
    </div>
  `);
}

// ── KAMPANYALAR ──────────────────────────────────────────────────────────
async function magKampanyalarYukle(mag) {
  let kampanyalar=[];
  try {
    const s=await getDocs(query(collection(db,'kampanyalar'),where('magazaId','==',mag.id),orderBy('ts','desc')));
    kampanyalar=s.docs.map(d=>({id:d.id,...d.data()}));
  } catch(e){}

  html('kampanyalar-icerik',`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.2rem;">
      <div style="font-size:.68rem;color:var(--t2);">${kampanyalar.length} aktif kampanya</div>
      <button onclick="kampanyaModalAc()" style="padding:.55rem 1.2rem;background:linear-gradient(135deg,#5a3eb0,#7B5CF0);color:#fff;border:none;border-radius:6px;font-size:.6rem;font-weight:700;letter-spacing:.1em;cursor:pointer;">+ Yeni Kampanya</button>
    </div>

    <!-- Kupon oluşturucu -->
    <div style="background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:12px;padding:1.4rem;margin-bottom:1rem;">
      <div style="font-size:.68rem;font-weight:700;color:var(--cream);margin-bottom:1rem;">🎯 Hızlı Kupon Oluştur</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:.7rem;margin-bottom:.8rem;">
        <div>
          <label class="dan-lbl">Kupon Kodu</label>
          <div style="display:flex;gap:.4rem;">
            <input class="fi" id="kupKod" placeholder="GEN-Z10" style="font-size:.72rem;font-family:monospace;text-transform:uppercase;">
            <button onclick="kupKodUret()" style="padding:.5rem .7rem;background:rgba(255,255,255,.06);border:1px solid var(--border);border-radius:6px;font-size:.65rem;cursor:pointer;color:var(--t2);white-space:nowrap;">🎲 Üret</button>
          </div>
        </div>
        <div>
          <label class="dan-lbl">İndirim Türü</label>
          <select class="fi" id="kupTur" style="font-size:.72rem;" onchange="kupTurDeg()">
            <option value="yuzde">Yüzde (%)</option>
            <option value="tutar">Sabit Tutar (₺)</option>
            <option value="kargo">Ücretsiz Kargo</option>
          </select>
        </div>
        <div>
          <label class="dan-lbl" id="kupMiktarLbl">İndirim (%)</label>
          <input class="fi" id="kupMiktar" type="number" placeholder="10" min="1" max="100" style="font-size:.72rem;">
        </div>
        <div>
          <label class="dan-lbl">Min. Sepet (₺)</label>
          <input class="fi" id="kupMinSepet" type="number" placeholder="0" min="0" style="font-size:.72rem;">
        </div>
        <div>
          <label class="dan-lbl">Bitiş Tarihi</label>
          <input class="fi" id="kupBitis" type="date" style="font-size:.72rem;">
        </div>
        <div>
          <label class="dan-lbl">Kullanım Limiti</label>
          <input class="fi" id="kupLimit" type="number" placeholder="Sınırsız" min="1" style="font-size:.72rem;">
        </div>
      </div>
      <div id="kupErr" style="display:none;font-size:.65rem;color:#ff6b6b;margin-bottom:.5rem;"></div>
      <button onclick="kupOlustur('${mag.id}')" style="padding:.7rem 1.8rem;background:linear-gradient(135deg,#5a3eb0,#7B5CF0);color:#fff;border:none;border-radius:6px;font-size:.65rem;font-weight:700;cursor:pointer;">✦ Kuponu Kaydet</button>
    </div>

    <!-- Mevcut kampanyalar -->
    <div style="background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:12px;padding:1.4rem;">
      <div style="font-size:.68rem;font-weight:700;color:var(--cream);margin-bottom:1rem;">📋 Aktif Kampanyalar</div>
      ${kampanyalar.length ? kampanyalar.map(k=>{
        const bitis=k.bitis?new Date(k.bitis).toLocaleDateString('tr-TR'):'Süresiz';
        const aktif=!k.bitis||new Date(k.bitis)>new Date();
        return `<div style="display:flex;align-items:center;justify-content:space-between;padding:.9rem;background:rgba(255,255,255,.02);border:1px solid ${aktif?'rgba(92,240,180,.15)':'rgba(255,255,255,.05)'};border-radius:8px;margin-bottom:.6rem;gap:.8rem;flex-wrap:wrap;">
          <div>
            <div style="font-family:monospace;font-size:.85rem;font-weight:700;color:${aktif?'#5CF0B4':'var(--t2)'};">${k.kod}</div>
            <div style="font-size:.6rem;color:var(--t2);">${k.tur==='yuzde'?'%'+k.miktar+' indirim':k.tur==='tutar'?'₺'+k.miktar+' indirim':'Ücretsiz kargo'} · Min: ₺${k.minSepet||0} · ${bitis}</div>
          </div>
          <div style="display:flex;gap:.5rem;align-items:center;">
            <span style="font-size:.6rem;color:var(--t2);">${k.kullanimSay||0}/${k.limit||'∞'} kullanım</span>
            <span style="font-size:.58rem;padding:.2rem .6rem;border-radius:20px;font-weight:700;background:${aktif?'rgba(92,240,180,.1)':'rgba(255,255,255,.05)'};color:${aktif?'#5CF0B4':'var(--t2)'};">${aktif?'✅ Aktif':'⏰ Sona Erdi'}</span>
            <button onclick="kupSil('${k.id}')" style="padding:.25rem .6rem;background:rgba(255,80,80,.1);border:1px solid rgba(255,80,80,.2);border-radius:4px;font-size:.55rem;color:#ff6b6b;cursor:pointer;">Sil</button>
          </div>
        </div>`;
      }).join('') : '<div style="color:var(--t2);text-align:center;padding:2rem;font-style:italic;">Henüz kampanya yok</div>'}
    </div>
  `);
}

window.kupKodUret = function() {
  const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const kod='GNZ-'+Array.from({length:6},()=>chars[Math.floor(Math.random()*chars.length)]).join('');
  const inp=document.getElementById('kupKod'); if(inp) inp.value=kod;
};

window.kupTurDeg = function() {
  const tur=document.getElementById('kupTur')?.value;
  const lbl=document.getElementById('kupMiktarLbl');
  const inp=document.getElementById('kupMiktar');
  if(!lbl||!inp) return;
  if(tur==='kargo'){lbl.textContent='(Kargo hediye)';inp.disabled=true;inp.value='';}
  else{inp.disabled=false;lbl.textContent=tur==='yuzde'?'İndirim (%)':'İndirim (₺)';}
};

window.kupOlustur = async function(magId) {
  const errEl=document.getElementById('kupErr');
  const kod=(document.getElementById('kupKod')?.value||'').trim().toUpperCase();
  const tur=document.getElementById('kupTur')?.value||'yuzde';
  const miktar=parseFloat(document.getElementById('kupMiktar')?.value)||0;
  const minSepet=parseFloat(document.getElementById('kupMinSepet')?.value)||0;
  const bitis=document.getElementById('kupBitis')?.value||null;
  const limit=parseInt(document.getElementById('kupLimit')?.value)||null;

  if(!kod){errEl.textContent='Kupon kodu zorunludur.';errEl.style.display='block';return;}
  if(tur!=='kargo'&&!miktar){errEl.textContent='İndirim miktarı zorunludur.';errEl.style.display='block';return;}
  errEl.style.display='none';

  try {
    await addDoc(collection(db,'kampanyalar'),{magazaId:magId,kod,tur,miktar,minSepet,bitis,limit,kullanimSay:0,aktif:true,ts:serverTimestamp()});
    if(typeof toast==='function') toast('✦ Kupon oluşturuldu: '+kod);
    window.proModulYukle('kampanyalar');
  } catch(e){errEl.textContent='Hata: '+e.message;errEl.style.display='block';}
};

window.kupSil = async function(id) {
  if(!confirm('Bu kuponu silmek istediğinizden emin misiniz?')) return;
  try {
    await updateDoc(doc(db,'kampanyalar',id),{aktif:false,silindi:true});
    if(typeof toast==='function') toast('Kupon silindi.');
    window.proModulYukle('kampanyalar');
  } catch(e){}
};

// ── MUHASEBE ────────────────────────────────────────────────────────────
async function magMuhasebeYukle(mag) {
  let sips=window._siparisler||[];
  if(!sips.length){
    try{const s=await getDocs(query(collection(db,'magaza_siparisler'),where('magazaId','==',mag.id)));sips=s.docs.map(d=>({id:d.id,...d.data()}));window._siparisler=sips;}catch(e){}
  }

  const tam=sips.filter(s=>s.durum==='tamamlandi');
  const brutToplam=tam.reduce((t,s)=>t+(s.toplam||0),0);
  const komisyon=brutToplam*0.10;
  const kdvToplam=tam.reduce((t,s)=>t+(s.kdvTutar||(s.toplam||0)*0.167),0);
  const netKazanc=brutToplam-komisyon;
  const vergiTabani=netKazanc-kdvToplam;

  // Aylık breakdown son 6 ay
  const aylik=Array.from({length:6},(_,i)=>{
    const hedef=new Date(); hedef.setMonth(hedef.getMonth()-5+i);
    const ayS=tam.filter(s=>{const t=s.ts?.toDate?s.ts.toDate():new Date();return t.getMonth()===hedef.getMonth()&&t.getFullYear()===hedef.getFullYear();});
    const brut=ayS.reduce((t,s)=>t+(s.toplam||0),0);
    return {ay:hedef.toLocaleDateString('tr-TR',{month:'short',year:'2-digit'}),brut,net:brut*0.9,kdv:brut*0.167,kom:brut*0.1};
  });

  html('muhasebe-icerik',`
    <!-- Özet Kartlar -->
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(185px,1fr));gap:.9rem;margin-bottom:1.5rem;">
      ${[
        {ikon:'📈',lbl:'Toplam Brüt Gelir',val:'₺'+para(brutToplam),renk:'#7B5CF0'},
        {ikon:'💸',lbl:'Platform Komisyonu',val:'−₺'+para(komisyon),alt:'%10',renk:'#ff6b6b'},
        {ikon:'🏛',lbl:'Ödenecek KDV',val:'₺'+para(kdvToplam),alt:'tahmini',renk:'#ff9966'},
        {ikon:'💰',lbl:'Net Kazanç',val:'₺'+para(netKazanc),renk:'#5CF0B4'},
        {ikon:'📊',lbl:'Vergi Matrahı',val:'₺'+para(vergiTabani),alt:'KDV hariç net',renk:'#F0C55C'},
        {ikon:'🧾',lbl:'Tamamlanan Sipariş',val:tam.length,renk:'#a78bfa'},
      ].map(k=>`
        <div style="background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:12px;padding:1.1rem;">
          <div style="font-size:.56rem;color:var(--t2);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.35rem;">${k.ikon} ${k.lbl}</div>
          <div style="font-family:'Syne',sans-serif;font-size:1.35rem;font-weight:800;color:${k.renk};">${k.val}</div>
          ${k.alt?`<div style="font-size:.57rem;color:var(--t2);">${k.alt}</div>`:''}
        </div>
      `).join('')}
    </div>

    <!-- Aylık tablo -->
    <div style="background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:12px;padding:1.4rem;margin-bottom:1rem;">
      <div style="font-size:.68rem;font-weight:700;color:var(--cream);margin-bottom:1rem;">📅 Aylık Muhasebe Özeti</div>
      <div style="overflow-x:auto;">
        <table style="width:100%;min-width:560px;">
          <thead><tr style="font-size:.58rem;color:var(--t2);">
            <th style="text-align:left;padding:.4rem 0;">Dönem</th>
            <th style="text-align:right;">Brüt Gelir</th>
            <th style="text-align:right;">Komisyon</th>
            <th style="text-align:right;">KDV (tahmini)</th>
            <th style="text-align:right;">Net Kazanç</th>
          </tr></thead>
          <tbody>${aylik.map(a=>`
            <tr style="border-top:1px solid rgba(255,255,255,.04);">
              <td style="padding:.55rem 0;font-size:.68rem;color:var(--cream);font-weight:600;">${a.ay}</td>
              <td style="text-align:right;font-size:.68rem;color:var(--cream);">₺${para(a.brut)}</td>
              <td style="text-align:right;font-size:.65rem;color:#ff6b6b;">−₺${para(a.kom)}</td>
              <td style="text-align:right;font-size:.65rem;color:#ff9966;">₺${para(a.kdv)}</td>
              <td style="text-align:right;font-size:.7rem;color:#5CF0B4;font-weight:700;">₺${para(a.net)}</td>
            </tr>
          `).join('')}</tbody>
          <tfoot><tr style="border-top:2px solid rgba(255,255,255,.1);">
            <td style="padding:.55rem 0;font-size:.65rem;font-weight:700;color:var(--cream);">Toplam</td>
            <td style="text-align:right;font-size:.7rem;color:var(--cream);font-weight:700;">₺${para(aylik.reduce((t,a)=>t+a.brut,0))}</td>
            <td style="text-align:right;font-size:.65rem;color:#ff6b6b;font-weight:700;">−₺${para(aylik.reduce((t,a)=>t+a.kom,0))}</td>
            <td style="text-align:right;font-size:.65rem;color:#ff9966;font-weight:700;">₺${para(aylik.reduce((t,a)=>t+a.kdv,0))}</td>
            <td style="text-align:right;font-size:.75rem;color:#5CF0B4;font-weight:800;">₺${para(aylik.reduce((t,a)=>t+a.net,0))}</td>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Muhasebe notu -->
    <div style="background:rgba(240,197,92,.05);border:1px solid rgba(240,197,92,.2);border-radius:10px;padding:1.1rem;font-size:.65rem;color:var(--gold);line-height:1.9;">
      ⚖️ <strong>Muhasebe Notu:</strong> KDV hesapları tahminidir, kesin rakamlar için muhasebeciye danışın.
      Platform komisyonu %10 olarak hesaplanmıştır. İade edilen siparişler bu hesaplamaya dahil değildir.
    </div>
  `);
}

// ── MAĞAZA AYARLARI ──────────────────────────────────────────────────────
async function magAyarlarYukle(mag) {
  html('magaza-ayarlar-icerik',`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;max-width:760px;">
      <div style="background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:12px;padding:1.4rem;grid-column:1/-1;">
        <div style="font-size:.68rem;font-weight:700;color:var(--cream);margin-bottom:1rem;">🏪 Mağaza Bilgileri</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.7rem;">
          <div><label class="dan-lbl">Mağaza Adı</label><input class="fi" id="ayMagAd" value="${mag.ad||''}" style="font-size:.72rem;"></div>
          <div><label class="dan-lbl">Telefon</label><input class="fi" id="ayMagTel" value="${mag.tel||''}" style="font-size:.72rem;" placeholder="+90 5XX XXX XX XX"></div>
          <div style="grid-column:1/-1;"><label class="dan-lbl">Kısa Açıklama</label><textarea class="fi" id="ayMagAcik" style="font-size:.72rem;min-height:60px;resize:vertical;">${mag.aciklama||''}</textarea></div>
          <div><label class="dan-lbl">Şehir</label><input class="fi" id="ayMagSehir" value="${mag.sehir||''}" style="font-size:.72rem;"></div>
          <div><label class="dan-lbl">İlçe</label><input class="fi" id="ayMagIlce" value="${mag.ilce||''}" style="font-size:.72rem;"></div>
          <div><label class="dan-lbl">Web Sitesi</label><input class="fi" id="ayMagWeb" value="${mag.website||''}" style="font-size:.72rem;" placeholder="https://"></div>
          <div><label class="dan-lbl">Instagram</label><input class="fi" id="ayMagInsta" value="${mag.instagram||''}" style="font-size:.72rem;" placeholder="@kullanici"></div>
        </div>
        <button onclick="magAyarKaydet('${mag.id}')" style="margin-top:1rem;padding:.75rem 2rem;background:linear-gradient(135deg,#c9a84c,#d4a83e);color:#000;border:none;border-radius:6px;font-size:.65rem;font-weight:700;cursor:pointer;">✦ Değişiklikleri Kaydet</button>
      </div>

      <div style="background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:12px;padding:1.4rem;">
        <div style="font-size:.68rem;font-weight:700;color:var(--cream);margin-bottom:1rem;">🔔 Bildirim Tercihleri</div>
        ${['Yeni sipariş geldiğinde','İade talebi geldiğinde','Ürün onaylandığında','Stok kritik seviyeye düştüğünde','Yorum yapıldığında'].map((lbl,i)=>`
          <label style="display:flex;align-items:center;gap:.6rem;cursor:pointer;padding:.45rem 0;border-bottom:1px solid rgba(255,255,255,.04);">
            <input type="checkbox" checked style="accent-color:var(--accent);width:14px;height:14px;">
            <span style="font-size:.68rem;color:var(--t2);">${lbl}</span>
          </label>
        `).join('')}
      </div>

      <div style="background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:12px;padding:1.4rem;">
        <div style="font-size:.68rem;font-weight:700;color:var(--cream);margin-bottom:1rem;">📦 Kargo Ayarları</div>
        <div style="display:flex;flex-direction:column;gap:.6rem;">
          <div><label class="dan-lbl">Kargo Firması</label>
            <select class="fi" style="font-size:.72rem;">
              <option>Yurtiçi Kargo</option><option>Aras Kargo</option><option>MNG Kargo</option>
              <option>PTT Kargo</option><option>Sürat Kargo</option><option>UPS</option>
            </select>
          </div>
          <div><label class="dan-lbl">Ücretsiz Kargo Limiti (₺)</label><input class="fi" type="number" value="${mag.kargoLimit||150}" style="font-size:.72rem;"></div>
          <div><label class="dan-lbl">Ortalama Teslimat (Gün)</label><input class="fi" type="number" value="${mag.teslimatGun||3}" min="1" max="30" style="font-size:.72rem;"></div>
        </div>
      </div>
    </div>
  `);
}

window.magAyarKaydet = async function(magId) {
  const veri={
    ad:document.getElementById('ayMagAd')?.value.trim(),
    tel:document.getElementById('ayMagTel')?.value.trim(),
    aciklama:document.getElementById('ayMagAcik')?.value.trim(),
    sehir:document.getElementById('ayMagSehir')?.value.trim(),
    ilce:document.getElementById('ayMagIlce')?.value.trim(),
    website:document.getElementById('ayMagWeb')?.value.trim(),
    instagram:document.getElementById('ayMagInsta')?.value.trim(),
    guncellendi:serverTimestamp()
  };
  try {
    await updateDoc(doc(db,'magazalar',magId),veri);
    if(window._magaza) Object.assign(window._magaza,veri);
    if(typeof toast==='function') toast('✦ Mağaza bilgileri kaydedildi!');
  } catch(e) {
    if(typeof toast==='function') toast('Hata: '+e.message,'err');
  }
};

// ═══════════════════════════════════════════════════════════════════════════
//  🔨 USTA PRO MODÜLÜ
// ═══════════════════════════════════════════════════════════════════════════

window.ustaProModulYukle = async function(sayfa) {
  await proKontrol();
  if(!_isPro) {
    const map={'usta-profil-duzenle':'Profil & Bio Düzenleme','usta-muhasebe':'Kazanç & Muhasebe','usta-yorumlar':'Müşteri Yorumları'};
    html('sayfa-'+sayfa, `<div class="sh"><span class="eyebrow">Pro Özellik</span><h1>${map[sayfa]||'Pro Özellik'}</h1></div>`+proKilitHTML(map[sayfa]||'Bu Özellik'));
    return;
  }
  switch(sayfa) {
    case 'usta-profil-duzenle': return ustaProfilYukle();
    case 'usta-muhasebe':       return ustaMuhasebeYukle();
    case 'usta-yorumlar':       return ustaYorumlarYukle();
  }
};

async function ustaProfilYukle() {
  const ud = window._ustaVeri||{};
  html('usta-profil-duzenle-icerik',`
    <div style="max-width:640px;">
      <div style="background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:12px;padding:1.4rem;margin-bottom:1rem;">
        <div style="font-size:.68rem;font-weight:700;color:var(--cream);margin-bottom:1rem;">👤 Profil Bilgileri</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.7rem;">
          <div><label class="dan-lbl">Ad Soyad</label><input class="fi" id="upAd" value="${ud.displayName||ud.ad||''}" style="font-size:.72rem;"></div>
          <div><label class="dan-lbl">Telefon</label><input class="fi" id="upTel" value="${ud.tel||''}" style="font-size:.72rem;" placeholder="+90 5XX XXX XX XX"></div>
          <div><label class="dan-lbl">Şehir</label><input class="fi" id="upSehir" value="${ud.sehir||''}" style="font-size:.72rem;"></div>
          <div><label class="dan-lbl">İlçe</label><input class="fi" id="upIlce" value="${ud.ilce||''}" style="font-size:.72rem;"></div>
          <div style="grid-column:1/-1;"><label class="dan-lbl">Bio / Tanıtım Yazısı</label>
            <textarea class="fi" id="upBio" style="font-size:.72rem;min-height:80px;resize:vertical;" placeholder="Kendinizi ve hizmetlerinizi tanıtın…">${ud.bio||''}</textarea>
          </div>
          <div><label class="dan-lbl">Deneyim (Yıl)</label><input class="fi" id="upDeneyim" type="number" value="${ud.deneyimYil||''}" min="0" style="font-size:.72rem;"></div>
          <div><label class="dan-lbl">Çalışma Saatleri</label><input class="fi" id="upSaatler" value="${ud.calisma||''}" style="font-size:.72rem;" placeholder="Hf içi 08:00-18:00"></div>
          <div style="grid-column:1/-1;"><label class="dan-lbl">Referans / Portfolyo Linki</label><input class="fi" id="upPortfolyo" value="${ud.portfolyo||''}" style="font-size:.72rem;" placeholder="https://"></div>
        </div>
        <button onclick="ustaProfilKaydet()" style="margin-top:1rem;padding:.75rem 2rem;background:linear-gradient(135deg,#c9a84c,#d4a83e);color:#000;border:none;border-radius:6px;font-size:.65rem;font-weight:700;cursor:pointer;">✦ Profili Kaydet</button>
      </div>

      <div style="background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:12px;padding:1.4rem;">
        <div style="font-size:.68rem;font-weight:700;color:var(--cream);margin-bottom:.8rem;">🛠 Uzmanlık Alanları</div>
        <div style="font-size:.65rem;color:var(--t2);margin-bottom:.8rem;">Müşterilerin sizi daha kolay bulması için uzmanlık etiketleri ekleyin.</div>
        <div style="display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:.7rem;" id="ustaEtiketler">
          ${(ud.etiketler||[]).map(e=>`<span style="background:rgba(123,92,240,.15);border:1px solid rgba(123,92,240,.3);border-radius:20px;padding:.25rem .7rem;font-size:.62rem;color:#a78bfa;">${e} <button onclick="this.parentNode.remove()" style="background:none;border:none;cursor:pointer;color:rgba(167,139,250,.6);margin-left:.2rem;">×</button></span>`).join('')}
        </div>
        <div style="display:flex;gap:.5rem;">
          <input class="fi" id="ustaEtiketInp" placeholder="Örn: Boya, Sıva, İzolasyon" style="font-size:.72rem;">
          <button onclick="ustaEtiketEkle()" style="padding:.5rem 1rem;background:rgba(123,92,240,.15);border:1px solid rgba(123,92,240,.3);border-radius:6px;font-size:.62rem;color:#a78bfa;cursor:pointer;white-space:nowrap;">+ Ekle</button>
        </div>
      </div>
    </div>
  `);
}

window.ustaEtiketEkle = function() {
  const inp=document.getElementById('ustaEtiketInp');
  const kap=document.getElementById('ustaEtiketler');
  if(!inp||!kap||!inp.value.trim()) return;
  const span=document.createElement('span');
  span.style.cssText='background:rgba(123,92,240,.15);border:1px solid rgba(123,92,240,.3);border-radius:20px;padding:.25rem .7rem;font-size:.62rem;color:#a78bfa;';
  span.innerHTML=inp.value.trim()+' <button onclick="this.parentNode.remove()" style="background:none;border:none;cursor:pointer;color:rgba(167,139,250,.6);">×</button>';
  kap.appendChild(span);
  inp.value='';
};

window.ustaProfilKaydet = async function() {
  const uid=window._aktifUid; if(!uid) return;
  const etiketEls=document.querySelectorAll('#ustaEtiketler span');
  const etiketler=[...etiketEls].map(s=>s.textContent.replace('×','').trim()).filter(Boolean);
  const veri={
    displayName:document.getElementById('upAd')?.value.trim()||null,
    tel:document.getElementById('upTel')?.value.trim()||null,
    sehir:document.getElementById('upSehir')?.value.trim()||null,
    ilce:document.getElementById('upIlce')?.value.trim()||null,
    bio:document.getElementById('upBio')?.value.trim()||null,
    deneyimYil:parseInt(document.getElementById('upDeneyim')?.value)||null,
    calisma:document.getElementById('upSaatler')?.value.trim()||null,
    portfolyo:document.getElementById('upPortfolyo')?.value.trim()||null,
    etiketler,
    guncellendi:serverTimestamp()
  };
  try {
    await updateDoc(doc(db,'kullanicilar',uid),veri);
    if(window._ustaVeri) Object.assign(window._ustaVeri,veri);
    if(typeof toast==='function') toast('✦ Profil kaydedildi!');
  } catch(e){if(typeof toast==='function') toast('Hata: '+e.message,'err');}
};

async function ustaMuhasebeYukle() {
  const uid=window._aktifUid; if(!uid) return;
  let rdvler=[];
  try {
    const s=await getDocs(query(collection(db,'ustam_randevular'),where('ustaUid','==',uid),orderBy('ts','desc')));
    rdvler=s.docs.map(d=>({id:d.id,...d.data()}));
  } catch(e){}

  const tamamlanan=rdvler.filter(r=>r.durum==='tamamlandi'||r.durum==='onaylandi');
  const brutToplam=tamamlanan.reduce((t,r)=>t+(r.ucret||r.fiyat||0),0);
  const komisyon=brutToplam*0.10;
  const net=brutToplam-komisyon;
  const now=new Date();

  const aylik=Array.from({length:6},(_,i)=>{
    const h=new Date(now); h.setMonth(now.getMonth()-5+i);
    const ayR=tamamlanan.filter(r=>{const t=r.ts?.toDate?r.ts.toDate():new Date();return t.getMonth()===h.getMonth()&&t.getFullYear()===h.getFullYear();});
    const brut=ayR.reduce((t,r)=>t+(r.ucret||r.fiyat||0),0);
    return {ay:h.toLocaleDateString('tr-TR',{month:'short',year:'2-digit'}),brut,net:brut*0.9,say:ayR.length};
  });

  html('usta-muhasebe-icerik',`
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:.9rem;margin-bottom:1.5rem;">
      ${[
        {ikon:'💰',lbl:'Toplam Brüt',val:'₺'+para(brutToplam),renk:'#7B5CF0'},
        {ikon:'💸',lbl:'Platform Komisyonu',val:'−₺'+para(komisyon),renk:'#ff6b6b'},
        {ikon:'💚',lbl:'Net Kazanç',val:'₺'+para(net),renk:'#5CF0B4'},
        {ikon:'📅',lbl:'Tamamlanan İş',val:tamamlanan.length,renk:'#F0C55C'},
        {ikon:'⭐',lbl:'Ort. İş Ücreti',val:'₺'+para(tamamlanan.length?brutToplam/tamamlanan.length:0),renk:'#a78bfa'},
        {ikon:'📊',lbl:'Toplam Randevu',val:rdvler.length,renk:'#ff9966'},
      ].map(k=>`
        <div style="background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:12px;padding:1.1rem;">
          <div style="font-size:.56rem;color:var(--t2);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.35rem;">${k.ikon} ${k.lbl}</div>
          <div style="font-family:'Syne',sans-serif;font-size:1.35rem;font-weight:800;color:${k.renk};">${k.val}</div>
        </div>
      `).join('')}
    </div>

    <div style="background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:12px;padding:1.4rem;">
      <div style="font-size:.68rem;font-weight:700;color:var(--cream);margin-bottom:1rem;">📅 Aylık Kazanç Özeti</div>
      <table style="width:100%;">
        <thead><tr style="font-size:.58rem;color:var(--t2);">
          <th style="text-align:left;padding:.4rem 0;">Dönem</th>
          <th style="text-align:center;">İş Sayısı</th>
          <th style="text-align:right;">Brüt</th>
          <th style="text-align:right;">Komisyon</th>
          <th style="text-align:right;">Net</th>
        </tr></thead>
        <tbody>${aylik.map(a=>`
          <tr style="border-top:1px solid rgba(255,255,255,.04);">
            <td style="padding:.5rem 0;font-size:.68rem;color:var(--cream);font-weight:600;">${a.ay}</td>
            <td style="text-align:center;font-size:.65rem;color:var(--t2);">${a.say}</td>
            <td style="text-align:right;font-size:.68rem;color:var(--cream);">₺${para(a.brut)}</td>
            <td style="text-align:right;font-size:.65rem;color:#ff6b6b;">−₺${para(a.brut*0.1)}</td>
            <td style="text-align:right;font-size:.7rem;color:#5CF0B4;font-weight:700;">₺${para(a.net)}</td>
          </tr>
        `).join('')}</tbody>
      </table>
    </div>
  `);
}

async function ustaYorumlarYukle() {
  const uid=window._aktifUid; if(!uid) return;
  let yorumlar=[];
  try {
    const s=await getDocs(query(collection(db,'ustam_yorumlar'),where('ustaUid','==',uid),orderBy('ts','desc')));
    yorumlar=s.docs.map(d=>({id:d.id,...d.data()}));
  } catch(e){}

  const ort=yorumlar.length?yorumlar.reduce((t,y)=>t+(y.puan||5),0)/yorumlar.length:0;
  const dagMap={5:0,4:0,3:0,2:0,1:0};
  yorumlar.forEach(y=>{ const p=Math.round(y.puan||5); dagMap[p]=(dagMap[p]||0)+1; });

  html('usta-yorumlar-icerik',`
    <div style="display:grid;grid-template-columns:220px 1fr;gap:1rem;margin-bottom:1.2rem;">
      <div style="background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:12px;padding:1.4rem;text-align:center;">
        <div style="font-family:'Syne',sans-serif;font-size:3.5rem;font-weight:800;color:#F0C55C;line-height:1;">${ort.toFixed(1)}</div>
        <div style="font-size:1.2rem;margin:.3rem 0;">
          ${'★'.repeat(Math.round(ort))}${'☆'.repeat(5-Math.round(ort))}
        </div>
        <div style="font-size:.65rem;color:var(--t2);">${yorumlar.length} değerlendirme</div>
      </div>
      <div style="background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:12px;padding:1.4rem;">
        ${[5,4,3,2,1].map(p=>`
          <div style="display:flex;align-items:center;gap:.7rem;margin-bottom:.5rem;">
            <span style="font-size:.62rem;color:var(--t2);width:20px;">${p}★</span>
            <div style="flex:1;height:7px;background:rgba(255,255,255,.06);border-radius:4px;">
              <div style="height:100%;width:${yorumlar.length?Math.round(dagMap[p]/yorumlar.length*100):0}%;background:#F0C55C;border-radius:4px;transition:width .5s;"></div>
            </div>
            <span style="font-size:.6rem;color:var(--t2);width:20px;">${dagMap[p]}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:.7rem;">
      ${yorumlar.length ? yorumlar.map(y=>`
        <div style="background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:10px;padding:1.1rem;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.5rem;">
            <div>
              <div style="font-size:.72rem;font-weight:700;color:var(--cream);">${y.musteriAd||'Anonim'}</div>
              <div style="font-size:.6rem;color:#F0C55C;">${'★'.repeat(Math.round(y.puan||5))}</div>
            </div>
            <div style="font-size:.58rem;color:var(--t2);">${y.ts?.toDate?y.ts.toDate().toLocaleDateString('tr-TR'):''}</div>
          </div>
          <div style="font-size:.7rem;color:var(--t2);line-height:1.7;">${y.yorum||'—'}</div>
          ${y.hizmet?`<div style="margin-top:.4rem;font-size:.58rem;color:rgba(123,92,240,.7);">🔧 ${y.hizmet}</div>`:''}
        </div>
      `).join('') : '<div style="text-align:center;padding:3rem;color:var(--t2);font-style:italic;">Henüz yorum yok ✦</div>'}
    </div>
  `);
}

// ═══════════════════════════════════════════════════════════════════════════
//  ⚡ GENÇ-Z PRO MODÜLÜ
// ═══════════════════════════════════════════════════════════════════════════

window.genczProModulYukle = async function(sayfa) {
  await proKontrol();
  if(!_isPro) {
    const map={'gencz-magaza':'Dijital Mağaza','gencz-kazanc':'Kazanç Takibi','gencz-portfolyo':'Portföy Yönetimi','gencz-analitik':'İçerik Analitik'};
    html('sayfa-'+sayfa, `<div class="sh"><span class="eyebrow">Pro Özellik</span><h1>${map[sayfa]||'Pro Özellik'}</h1></div>`+proKilitHTML(map[sayfa]||'Bu Özellik'));
    return;
  }
  switch(sayfa) {
    case 'gencz-magaza':   return gzMagazaYukle();
    case 'gencz-kazanc':   return gzKazancYukle();
    case 'gencz-portfolyo':return gzPortfoyYukle();
    case 'gencz-analitik': return gzAnalitikYukle();
  }
};

async function gzMagazaYukle() {
  const uid=window._aktifUid; if(!uid) return;
  let icerikler=window._gzIcerikler||[];
  if(!icerikler.length){
    try{const s=await getDocs(query(collection(db,'gencz_icerikler'),where('uid','==',uid)));icerikler=s.docs.map(d=>({id:d.id,...d.data()}));}catch(e){}
  }
  const satilabilir=icerikler.filter(i=>i.durum==='onaylandi'&&i.fiyat>0);

  html('gencz-magaza-icerik',`
    <div style="background:rgba(123,92,240,.05);border:1px solid rgba(123,92,240,.2);border-radius:12px;padding:1.2rem;margin-bottom:1.2rem;font-size:.68rem;color:#a78bfa;line-height:1.8;">
      🛍 Onaylanan içerikleriniz dijital mağazanızda satışa sunulur. Fiyat belirlediğiniz içerikler müşteriler tarafından satın alınabilir.
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem;">
      ${satilabilir.length ? satilabilir.map(i=>`
        <div style="background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,rgba(123,92,240,.2),rgba(92,240,180,.1));height:80px;display:flex;align-items:center;justify-content:center;font-size:2.5rem;">
            ${window.GENCZ_KATEGORILER?.[i.kategori]?.ikon||'🎨'}
          </div>
          <div style="padding:1rem;">
            <div style="font-size:.72rem;font-weight:700;color:var(--cream);margin-bottom:.3rem;">${i.baslik||'—'}</div>
            <div style="font-size:.58rem;color:var(--t2);margin-bottom:.6rem;">${i.kategori||'—'}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-family:'Syne',sans-serif;font-size:1rem;font-weight:700;color:var(--gold);">₺${para(i.fiyat||0)}</span>
              <span style="font-size:.55rem;padding:.2rem .5rem;background:rgba(92,240,180,.1);border:1px solid rgba(92,240,180,.2);border-radius:20px;color:#5CF0B4;">✅ Satışta</span>
            </div>
          </div>
        </div>
      `).join('') : `
        <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--t2);">
          <div style="font-size:2.5rem;margin-bottom:.8rem;">🛍</div>
          <div style="font-size:.75rem;margin-bottom:.5rem;">Dijital mağazanız henüz boş</div>
          <div style="font-size:.65rem;">İçerik eklerken fiyat belirleyin, onaylandıktan sonra burada görünür.</div>
        </div>
      `}
    </div>
  `);
}

async function gzKazancYukle() {
  const uid=window._aktifUid; if(!uid) return;
  let satislar=[];
  try {
    const s=await getDocs(query(collection(db,'gencz_satislar'),where('uid','==',uid),orderBy('ts','desc')));
    satislar=s.docs.map(d=>({id:d.id,...d.data()}));
  } catch(e){}

  const brutToplam=satislar.reduce((t,s)=>t+(s.tutar||0),0);
  const net=brutToplam*0.9;

  html('gencz-kazanc-icerik',`
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:.9rem;margin-bottom:1.5rem;">
      ${[
        {ikon:'💰',lbl:'Toplam Kazanç',val:'₺'+para(brutToplam),renk:'#7B5CF0'},
        {ikon:'💚',lbl:'Net (Komisyon Sonrası)',val:'₺'+para(net),renk:'#5CF0B4'},
        {ikon:'🛍',lbl:'Toplam Satış',val:satislar.length,renk:'#F0C55C'},
        {ikon:'📊',lbl:'Ort. Eser Fiyatı',val:'₺'+para(satislar.length?brutToplam/satislar.length:0),renk:'#a78bfa'},
      ].map(k=>`
        <div style="background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:12px;padding:1.1rem;">
          <div style="font-size:.56rem;color:var(--t2);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.35rem;">${k.ikon} ${k.lbl}</div>
          <div style="font-family:'Syne',sans-serif;font-size:1.35rem;font-weight:800;color:${k.renk};">${k.val}</div>
        </div>
      `).join('')}
    </div>

    ${satislar.length ? `<div style="background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:12px;padding:1.4rem;">
      <div style="font-size:.68rem;font-weight:700;color:var(--cream);margin-bottom:1rem;">📋 Satış Geçmişi</div>
      <table style="width:100%;">
        <thead><tr style="font-size:.58rem;color:var(--t2);"><th style="text-align:left;padding:.4rem 0;">Eser</th><th>Kategori</th><th style="text-align:right;">Tutar</th><th style="text-align:right;">Net</th><th style="text-align:right;">Tarih</th></tr></thead>
        <tbody>${satislar.map(s=>`
          <tr style="border-top:1px solid rgba(255,255,255,.04);">
            <td style="padding:.5rem 0;font-size:.7rem;color:var(--cream);font-weight:600;">${s.icerikAd||'—'}</td>
            <td style="font-size:.62rem;color:var(--t2);text-align:center;">${s.kategori||'—'}</td>
            <td style="text-align:right;font-size:.68rem;color:var(--cream);">₺${para(s.tutar||0)}</td>
            <td style="text-align:right;font-size:.7rem;color:#5CF0B4;font-weight:700;">₺${para((s.tutar||0)*0.9)}</td>
            <td style="text-align:right;font-size:.6rem;color:var(--t2);">${s.ts?.toDate?s.ts.toDate().toLocaleDateString('tr-TR'):''}</td>
          </tr>
        `).join('')}</tbody>
      </table>
    </div>` : '<div style="text-align:center;padding:3rem;color:var(--t2);font-style:italic;">Henüz satış yok ✦<br><small>İçerik fiyatı belirleyin ve satışa başlayın.</small></div>'}
  `);
}

async function gzPortfoyYukle() {
  const uid=window._aktifUid; if(!uid) return;
  let icerikler=[];
  try{const s=await getDocs(query(collection(db,'gencz_icerikler'),where('uid','==',uid)));icerikler=s.docs.map(d=>({id:d.id,...d.data()}));}catch(e){}
  const onaylananlar=icerikler.filter(i=>i.durum==='onaylandi');

  html('gencz-portfolyo-icerik',`
    <div style="background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:12px;padding:1.4rem;margin-bottom:1rem;max-width:560px;">
      <div style="font-size:.68rem;font-weight:700;color:var(--cream);margin-bottom:1rem;">🔗 Portföy Linkiniz</div>
      <div style="display:flex;gap:.5rem;align-items:center;">
        <div style="flex:1;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:8px;padding:.7rem 1rem;font-size:.72rem;color:var(--t2);font-family:monospace;">
          gen-z.io/portfolyo/${uid.slice(0,8)}
        </div>
        <button onclick="navigator.clipboard.writeText('https://gen-z.io/portfolyo/${uid.slice(0,8)}').then(()=>toast&&toast('Link kopyalandı!'))" style="padding:.7rem 1rem;background:rgba(123,92,240,.15);border:1px solid rgba(123,92,240,.3);border-radius:8px;font-size:.62rem;color:#a78bfa;cursor:pointer;white-space:nowrap;">📋 Kopyala</button>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem;">
      ${onaylananlar.length ? onaylananlar.map(i=>`
        <div style="background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,rgba(123,92,240,.15),rgba(92,240,180,.08));height:70px;display:flex;align-items:center;justify-content:center;font-size:2rem;">
            ${window.GENCZ_KATEGORILER?.[i.kategori]?.ikon||'🎨'}
          </div>
          <div style="padding:.9rem;">
            <div style="font-size:.7rem;font-weight:700;color:var(--cream);">${i.baslik||'—'}</div>
            <div style="font-size:.58rem;color:var(--t2);margin-top:.2rem;">${i.kategori||'—'}</div>
            ${i.portfolyoLink||i.linkUrl?`<a href="${i.portfolyoLink||i.linkUrl}" target="_blank" style="display:inline-block;margin-top:.5rem;font-size:.58rem;color:#a78bfa;">↗ Görüntüle</a>`:''}
          </div>
        </div>
      `).join('') : '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--t2);font-style:italic;">Onaylı içerik yok</div>'}
    </div>
  `);
}

async function gzAnalitikYukle() {
  const uid=window._aktifUid; if(!uid) return;
  let icerikler=window._gzIcerikler||[];
  if(!icerikler.length){
    try{const s=await getDocs(query(collection(db,'gencz_icerikler'),where('uid','==',uid)));icerikler=s.docs.map(d=>({id:d.id,...d.data()}));}catch(e){}
  }

  const toplamGoruntulenme=icerikler.reduce((t,i)=>t+(i.goruntulenme||0),0);
  const toplamBegeni=icerikler.reduce((t,i)=>t+(i.begeni||0),0);
  const katDag={};
  icerikler.forEach(i=>{ katDag[i.kategori]=(katDag[i.kategori]||0)+1; });
  const maxKat=Math.max(...Object.values(katDag))||1;

  html('gencz-analitik-icerik',`
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:.9rem;margin-bottom:1.5rem;">
      ${[
        {ikon:'👁',lbl:'Toplam Görüntülenme',val:toplamGoruntulenme.toLocaleString('tr-TR'),renk:'#7B5CF0'},
        {ikon:'❤️',lbl:'Toplam Beğeni',val:toplamBegeni.toLocaleString('tr-TR'),renk:'#ff6b6b'},
        {ikon:'✅',lbl:'Yayındaki İçerik',val:icerikler.filter(i=>i.durum==='onaylandi').length,renk:'#5CF0B4'},
        {ikon:'⏳',lbl:'Onay Bekleyen',val:icerikler.filter(i=>i.durum==='bekliyor').length,renk:'#F0C55C'},
      ].map(k=>`
        <div style="background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:12px;padding:1.1rem;">
          <div style="font-size:.56rem;color:var(--t2);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.35rem;">${k.ikon} ${k.lbl}</div>
          <div style="font-family:'Syne',sans-serif;font-size:1.35rem;font-weight:800;color:${k.renk};">${k.val}</div>
        </div>
      `).join('')}
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
      <div style="background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:12px;padding:1.4rem;">
        <div style="font-size:.68rem;font-weight:700;color:var(--cream);margin-bottom:1rem;">📊 Kategori Dağılımı</div>
        ${Object.entries(katDag).map(([k,v])=>`
          <div style="margin-bottom:.6rem;">
            <div style="display:flex;justify-content:space-between;font-size:.62rem;margin-bottom:.25rem;">
              <span style="color:var(--t2);">${window.GENCZ_KATEGORILER?.[k]?.ikon||'🎨'} ${k}</span>
              <span style="color:var(--cream);font-weight:700;">${v}</span>
            </div>
            <div style="height:5px;background:rgba(255,255,255,.06);border-radius:3px;">
              <div style="height:100%;width:${Math.round(v/maxKat*100)}%;background:linear-gradient(90deg,#7B5CF0,#a78bfa);border-radius:3px;"></div>
            </div>
          </div>
        `).join('') || '<div style="color:var(--t2);font-size:.68rem;">Henüz içerik yok</div>'}
      </div>

      <div style="background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:12px;padding:1.4rem;">
        <div style="font-size:.68rem;font-weight:700;color:var(--cream);margin-bottom:1rem;">🏆 En Çok Görüntülenen</div>
        ${icerikler.sort((a,b)=>(b.goruntulenme||0)-(a.goruntulenme||0)).slice(0,5).map((i,idx)=>`
          <div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.6rem;padding:.5rem 0;border-bottom:1px solid rgba(255,255,255,.04);">
            <span style="font-size:.65rem;color:var(--t2);width:16px;">${idx+1}</span>
            <div style="flex:1;min-width:0;">
              <div style="font-size:.68rem;color:var(--cream);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${i.baslik||'—'}</div>
              <div style="font-size:.55rem;color:var(--t2);">${i.goruntulenme||0} görüntülenme · ${i.begeni||0} beğeni</div>
            </div>
          </div>
        `).join('') || '<div style="color:var(--t2);font-size:.68rem;text-align:center;padding:1rem;">Veri yok</div>'}
      </div>
    </div>
  `);
}

// ── Pro banner — Özet sayfalarında göster ────────────────────────────────
window.proBannerGoster = async function(konteyner) {
  await proKontrol();
  if(_isPro) return;
  const el=document.getElementById(konteyner);
  if(!el) return;
  el.innerHTML+=`
    <div style="margin-top:1.5rem;background:linear-gradient(135deg,rgba(201,168,76,.06),rgba(123,92,240,.06));border:1px solid rgba(201,168,76,.2);border-radius:14px;padding:1.4rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;">
      <div>
        <div style="font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:.4rem;">⚡ Büyük İşletme Modülü</div>
        <div style="font-size:.8rem;font-weight:700;color:var(--cream);margin-bottom:.3rem;">Analitiği, muhasebeyi, müşteri yönetimini açın</div>
        <div style="font-size:.65rem;color:var(--t2);">Tek seferlik 999₺ · Ömür boyu kullanım</div>
      </div>
      <button onclick="proSatinAl()" style="padding:.75rem 1.8rem;background:linear-gradient(135deg,#c9a84c,#d4a83e);color:#000;border:none;border-radius:8px;font-size:.68rem;font-weight:800;cursor:pointer;white-space:nowrap;">Yükselt ✦</button>
    </div>
  `;
};

console.log('[GEN-Z] modpanel-pro.js yüklendi ✦');

// ═══════════════════════════════════════════════════════════════════════════
//  PAKETLER SAYFASI
// ═══════════════════════════════════════════════════════════════════════════

window.paketlerYukle = async function() {
  await proKontrol();

  const planAd   = document.getElementById('mevcutPlanAd');
  const planBadge= document.getElementById('mevcutPlanBadge');
  const buyukKart= document.getElementById('paketBuyuk');
  const kucukKart= document.getElementById('paketKucuk');
  const btn      = document.getElementById('proSatinAlBtn');

  if(_isPro) {
    if(planAd)    planAd.textContent = 'Büyük İşletme';
    if(planBadge) {
      planBadge.textContent = '⚡ Pro Aktif';
      planBadge.style.background = 'rgba(92,240,180,.12)';
      planBadge.style.borderColor = 'rgba(92,240,180,.3)';
      planBadge.style.color = '#5CF0B4';
    }
    if(buyukKart) {
      buyukKart.style.borderColor = '#5CF0B4';
    }
    if(btn) {
      btn.textContent = '✅ Aktif — Büyük İşletme Modülü';
      btn.style.background = 'rgba(92,240,180,.15)';
      btn.style.border = '1px solid rgba(92,240,180,.3)';
      btn.style.color = '#5CF0B4';
      btn.onclick = null;
      btn.style.cursor = 'default';
    }
    if(kucukKart) kucukKart.style.opacity = '.6';
  } else {
    if(planAd)    planAd.textContent = 'Küçük İşletme';
    if(planBadge) planBadge.textContent = 'Ücretsiz';
  }
};

window.proSatinAlSayfadan = async function() {
  const btn = document.getElementById('proSatinAlBtn');
  if(btn) { btn.textContent = 'İşleniyor…'; btn.disabled = true; }

  // Demo — gerçek ödeme entegrasyonu buraya
  await new Promise(r => setTimeout(r, 1200));

  if(!confirm('999₺ Büyük İşletme Modülü satın almak istiyor musunuz?\n\n✦ Tek seferlik ödeme\n✦ Anında aktivasyon\n✦ Ömür boyu kullanım\n✦ 14 gün iade garantisi')) {
    if(btn) { btn.textContent = '✦ Hemen Yükselt — 999₺'; btn.disabled = false; }
    return;
  }

  try {
    const mag = window._magaza;
    const uid = window._aktifUid;
    if(mag) await updateDoc(doc(db,'magazalar',mag.id),{ proModul:true, proModulTs:serverTimestamp() });
    if(uid) await updateDoc(doc(db,'kullanicilar',uid),{ proModul:true, proModulTs:serverTimestamp() });
    _isPro = true;
    if(window._genzKullanici) { window._genzKullanici.proModul=true; }
    if(typeof toast==='function') toast('🎉 Büyük İşletme Modülü aktif! Tüm özellikler açıldı.');

    // Sayfayı güncelle
    await window.paketlerYukle();

  } catch(e) {
    if(typeof toast==='function') toast('Hata: '+e.message,'err');
    if(btn) { btn.textContent = '✦ Hemen Yükselt — 999₺'; btn.disabled = false; }
  }
};
