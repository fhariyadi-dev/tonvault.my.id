// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDUztZqiCDzXgH6Vggd6vZyAJW6HVFLagY",
  authDomain: "website-the-old-norse.firebaseapp.com",
  databaseURL: "https://website-the-old-norse-default-rtdb.firebaseio.com",
  projectId: "website-the-old-norse",
  storageBucket: "website-the-old-norse.firebasestorage.app",
  messagingSenderId: "706823120270",
  appId: "1:706823120270:web:9cbc711a91d121e65330df",
  measurementId: "G-98ZTGCYEFE"
};


let db = null;
try {
    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    db = firebase.database();
    console.log("🟢 FIREBASE CLOUD CONNECTED: Sistem online & tersinkronisasi.");

} catch (e) {
    console.warn("⚠️ FIREBASE ERROR: Menggunakan penyimpanan lokal.");
    firebaseSynced = true;
    if (typeof initSession === 'function') initSession();
}

const LOGS_WEBHOOK_URL = "https://discord.com/api/webhooks/1555218411791843338/_EZBSTspRWxg8WuZ775-gJh4YvTJbzV6VYXyTBoo_Xzy5h8RPqPqU8yFsa6A3eUsgA81";
const ORDERS_WEBHOOK_URL = "https://discord.com/api/webhooks/1555218886545121320/8qNeM3ETqWv-e90vUHkbsN_uDD-wRj9iVXk3UY4a4bea-zIq6JqcB0ie-2Z12vsMD8_u";
const PROFILE_WEBHOOK_URL = "https://discord.com/api/webhooks/1532561498159976651/T_Sp0q6povwP3ch2f9y__gmWgdWpUJ2GRCSTdcAYLj8zPk3s-L_LVF63OCzOVJF9_Y8N";
const VAULT_LOGS_WEBHOOK_URL = "https://discord.com/api/webhooks/1532561688002428988/Y2_uA_BIu-9aAV347DghjYR6LFIRk-oZqL7ttbZ0Z2yYxTGyUo-U5HMGCRu6bnywAr9B";
const METAL_SCRAP_WEBHOOK_URL = "https://discord.com/api/webhooks/1532561842017403001/ZznknpZrbb780buFdqIOA9aSRi6TIAFoQpX-S1aacmZcTyd0j53IXkWPo8U5WgjZBqNO";
const LAUNDRY_WEBHOOK_URL = "https://discord.com/api/webhooks/1556239742461288582/b5SQNOgQgtIfY9K6QglAy0H0wdgFiR8TEgc7z0k97PYfqVmiyTQuvQLdKLtgXqAmPKJB";

// =====================================================================
// 🚨 OPSI DARURAT: DAFTAR AKUN MANUAL ANTI-GAGAL 🚨
// =====================================================================
const AKUN_MANUAL = {
    "xyroo": { pass: "xy123", rank: "Moderator", divisi: "Internal" },
  "developer": { pass: "dev123", rank: "Developer", divisi: "Internal" },
};

function initEmergencyAccounts() {
  if (typeof window.customAccounts === 'undefined') window.customAccounts = {};
  if (typeof window.savedProfiles === 'undefined') window.savedProfiles = {};

  for (let user in AKUN_MANUAL) {
    let data = AKUN_MANUAL[user];
    if (!window.customAccounts[user]) {
      window.customAccounts[user] = { pass: data.pass, rank: data.rank };
    }
    if (!window.savedProfiles[user]) {
      window.savedProfiles[user] = {
        // Tambahkan pengaman agar tidak error jika user undefined
        name: user ? user.toUpperCase() : "UNKNOWN",
        phone: '0812-9999',
        idcard: 'TON-9999',
        job: data.rank,
        avatar: '',
        groupType: data.divisi
      };
    }
  }
  customAccounts = { ...window.customAccounts, ...customAccounts };
  savedProfiles = { ...window.savedProfiles, ...savedProfiles };
}

// ==========================================
// 🛡️ KONFIGURASI KEAMANAN DISCORD OAUTH2
// ==========================================
const DISCORD_CLIENT_ID = "1530553213483221083";
const TON_SERVER_ID = "1305954933685878877";
const REDIRECT_URI = "https://tonvault.my.id/";

let currentLoggedInUser = '';
let currentUserRole = '';
let userCart = [];
let globalOrders = [];

let currentCatalogTab = 'all';
let activeInventoryFilter = 'all';
let currentMarketplaceFilter = 'all';
let appliedDiscount = 0;
let appliedPromoName = '';

// VARIABEL GLOBAL UPLOADER FOTO
let icUploadedBase64 = '';
let newItemUploadedBase64 = '';
let uploadedProofThumbnails = [];

// STATE TRANSACTION PROCESS
let activeTxStatusFilter = 'Pending';
let activeTxSearchQuery = '';
let activeTxSortOrder = 'newest';
let activeTxItemFilter = 'all';
let activeTxPage = 1;
let activeTxPerPage = 10;

// LOAD DATA PERSISTEN & STATE MODERATOR
let adminTransactions = getSafeStorage('ton_admin_transactions') || [];
let orgLeaderboard = getSafeStorage('ton_org_leaderboard') || [];
let vaultBalance = getSafeStorage('ton_vault_balance') || 0;
let stockProofLogs = getSafeStorage('ton_stock_proof_logs') || [];
let metalScrapLogs = getSafeStorage('ton_metal_scrap') || [];
let auditLogs = getSafeStorage('ton_audit_logs') || [];
let internalMessages = getSafeStorage('ton_internal_messages') || [];
let laundryData = []; // Array untuk menampung riwayat cuci uang


// 🚀 STATE KHUSUS MODERATOR & SECURITY
let isVaultLockdown = getSafeStorage('ton_vault_lockdown') || false;
let blacklistedUsers = getSafeStorage('ton_blacklisted_users') || [];
let savedProfiles = getSafeStorage('ton_all_profiles') || {}; 

// HANYA MASTER AKUN YANG TERSISA, AKUN HANTU TELAH DIHAPUS
let defaultCustomAccounts = {
  "xyroo": { pass: "xyroo13", rank: "Moderator" },
  "developer": { pass: "dev123", rank: "Developer" }
};

let savedAccounts = getSafeStorage('ton_custom_accounts') || {};
let customAccounts = { ...savedAccounts, ...defaultCustomAccounts };

function ensureDeveloperAccountSeed() {
  const developerAccount = { pass: 'dev123', rank: 'Developer' };
  const developerProfile = {
    name: 'DEVELOPER',
    phone: '0812-0000',
    idcard: 'TON-DEV-0001',
    job: 'Developer',
    avatar: '',
    groupType: 'Internal'
  };

  if (typeof customAccounts !== 'undefined') customAccounts.developer = developerAccount;
  if (typeof savedProfiles !== 'undefined') savedProfiles.developer = developerProfile;
  if (typeof window !== 'undefined') {
    window.customAccounts = customAccounts;
    window.savedProfiles = savedProfiles;
  }
  try {
    if (typeof customAccounts !== 'undefined') localStorage.setItem('ton_custom_accounts', JSON.stringify(customAccounts));
    if (typeof savedProfiles !== 'undefined') localStorage.setItem('ton_all_profiles', JSON.stringify(savedProfiles));
  } catch (e) {}
}

// DATA STOK MASTER TERINTEGRASI
let defaultInventory = [
  { name: "Pistol Kacang", cat: "weapon", badge: "NORMAL", desc: "Senjata api laras pendek standar untuk pertahanan diri.", price: 9000, base: 7500, stock: 15, img: "https://i.imgur.com/OTIXFQy.png", restricted: false },
  { name: "Pistol .50", cat: "weapon", badge: "NORMAL", desc: "Pistol kaliber berat dengan daya stopping power tinggi.", price: 12000, base: 10000, stock: 10, img: "https://i.imgur.com/Xsnv90s.png", restricted: false },
  { name: "Ceramic Pistol", cat: "weapon", badge: "NORMAL", desc: "Pistol berbahan keramik polimer, ringan dan taktis.", price: 34000, base: 28000, stock: 8, img: "https://i.imgur.com/wrBvHHx.png", restricted: false },
  { name: "Machine Pistol", cat: "weapon", badge: "NORMAL", desc: "Pistol otomatis dengan rate of fire sangat cepat.", price: 34000, base: 28000, stock: 8, img: "https://i.imgur.com/BWq6YCX.png", restricted: true },
  { name: "Micro SMG", cat: "weapon", badge: "NORMAL", desc: "Submachine gun berukuran ringkas untuk pertempuran jarak dekat.", price: 36000, base: 30000, stock: 10, img: "https://i.imgur.com/EulYM2J.png", restricted: true },
  { name: "Mini SMG", cat: "weapon", badge: "NORMAL", desc: "Senjata otomatis ringan dengan mobilitas tinggi.", price: 35000, base: 29000, stock: 10, img: "https://i.imgur.com/BnnY0we.png", restricted: true },
  { name: "X17 Modular", cat: "weapon", badge: "NORMAL", desc: "Senjata modifikasi modern dengan akurasi terjamin.", price: 39000, base: 32000, stock: 6, img: "https://i.imgur.com/cjFtTP5.png", restricted: true },
  { name: "Navy Revolver", cat: "weapon", badge: "NORMAL", desc: "Revolver klasik dengan kerusakan fatal per peluru.", price: 75000, base: 65000, stock: 5, img: "https://i.imgur.com/dKMVMTh.png", restricted: true },
  { name: "KVR / Vector", cat: "weapon", badge: "NORMAL", desc: "SMG taktis modern dengan recoil rendah dan fire rate tinggi.", price: 80000, base: 70000, stock: 5, img: "https://i.imgur.com/QeUQFT2.png", restricted: true },
  { name: "Double Action", cat: "weapon", badge: "COMING SOON", desc: "Revolver double action dengan mekanisme tembak cepat.", price: 0, base: 0, stock: 0, img: "https://i.imgur.com/xm9n8C1.png", restricted: true },
  { name: "Revolver Black", cat: "weapon", badge: "COMING SOON", desc: "Varian revolver hitam kustom eksklusif.", price: 0, base: 0, stock: 0, img: "https://i.imgur.com/1GymHIh.png", restricted: true },
  { name: "Assault Rifle", cat: "weapon", badge: "NORMAL", desc: "Senjata serbu standar untuk pertempuran skala besar.", price: 170000, base: 150000, stock: 3, img: "https://i.imgur.com/D5k6n0x.png", restricted: true },
  { name: "Carbine Rifle", cat: "weapon", badge: "COMING SOON", desc: "Senjata serbu laras sedang dengan akurasi jarak jauh yang sangat stabil.", price: 0, base: 0, stock: 0, img: "https://i.imgur.com/jMAOs0V.png", restricted: true },
  { name: "Pump Shotgun", cat: "weapon", badge: "NORMAL", desc: "Senjata laras panjang penetrasi tinggi untuk jarak dekat.", price: 71000, base: 60000, stock: 4, img: "https://i.imgur.com/1ypltGL.png", restricted: true },
  { name: "Ammo 0.50", cat: "ammo", badge: "NORMAL", desc: "Peluru kaliber .50 untuk pistol berat.", price: 1500, base: 1000, stock: 50, img: "https://i.imgur.com/Y9ARS48.png", restricted: false },
  { name: "Ammo 380", cat: "ammo", badge: "NORMAL", desc: "Peluru standar kaliber .380.", price: 2000, base: 1400, stock: 50, img: "https://i.imgur.com/Y9ARS48.png", restricted: false },
  { name: "Ammo 44 Navy", cat: "ammo", badge: "NORMAL", desc: "Peluru khusus untuk Navy Revolver.", price: 5800, base: 4500, stock: 30, img: "https://i.imgur.com/Y9ARS48.png", restricted: false },
  { name: "Ammo 45Acp Vector", cat: "ammo", badge: "NORMAL", desc: "Peluru kaliber .45 ACP untuk SMG/Vector.", price: 5500, base: 4200, stock: 40, img: "https://i.imgur.com/Y9ARS48.png", restricted: false },
  { name: "Ammo 9mm", cat: "ammo", badge: "NORMAL", desc: "Peluru universal kaliber 9mm.", price: 4000, base: 3000, stock: 60, img: "https://i.imgur.com/Y9ARS48.png", restricted: false },
  { name: "Ammo Shotgun", cat: "ammo", badge: "NORMAL", desc: "Selongsong peluru sebar (shells) untuk Shotgun.", price: 5500, base: 4000, stock: 30, img: "https://i.imgur.com/Y9ARS48.png", restricted: false },
  { name: "Ammo Virtus/Carbine (5.56mm)", cat: "ammo", badge: "COMING SOON", desc: "Peluru senapan serbu kaliber 5.56mm.", price: 0, base: 0, stock: 0, img: "https://i.imgur.com/Y9ARS48.png", restricted: false },
  { name: "Ammo Assault Riffle (7.76mm)", cat: "ammo", badge: "NORMAL", desc: "Peluru senapan serbu kaliber berat 7.62/7.76mm.", price: 7000, base: 5500, stock: 25, img: "https://i.imgur.com/Y9ARS48.png", restricted: false },
  { name: "Vest Merah 50%", cat: "vest", badge: "NORMAL", desc: "Rompi anti-peluru ringan dengan ketahanan armor 50%.", price: 2000, base: 1500, stock: 20, img: "https://i.imgur.com/fn4cyuc.png", restricted: false },
  { name: "Vest Biru 90%", cat: "vest", badge: "NORMAL", desc: "Rompi anti-peluru berat dengan ketahanan armor maksimal 90%.", price: 5000, base: 3800, stock: 15, img: "https://i.imgur.com/QB3dTtQ.png", restricted: false },
  { name: "Weed Bag", cat: "durgs", badge: "NORMAL", desc: "Paket kanabis siap edar dalam kantong klip.", price: 400, base: 250, stock: 100, img: "https://i.imgur.com/pTSqAeZ.png", restricted: false },
  { name: "Meth Bag", cat: "durgs", badge: "NORMAL", desc: "Paket metamfetamin kristal kemasan klip.", price: 700, base: 450, stock: 80, img: "https://i.imgur.com/YOFVaFI.png", restricted: false },
  { name: "Cocaine Bag", cat: "durgs", badge: "NORMAL", desc: "Paket bubuk kokain murni kualitas tinggi.", price: 3000, base: 2200, stock: 50, img: "https://i.imgur.com/bexkxma.png", restricted: false },
  { name: "Poppy", cat: "durgs", badge: "NORMAL", desc: "Bahan mentah tanaman poppy untuk pengolahan medis/narkotika.", price: 25, base: 15, stock: 200, img: "https://i.imgur.com/wiqdJK7.png", restricted: false },
  { name: "Baggy", cat: "durgs", badge: "NORMAL", desc: "Plastik klip kemasan kosong untuk distribusi.", price: 65, base: 40, stock: 300, img: "https://i.imgur.com/3pwwEbl.png", restricted: false },
  { name: "Seed", cat: "durgs", badge: "NORMAL", desc: "Benih tanaman kualitas unggul siap tanam.", price: 900, base: 600, stock: 100, img: "https://i.imgur.com/cVQsd8E.png", restricted: false },
  { name: "Morphine", cat: "durgs", badge: "NORMAL", desc: "Cairan morfin medis penahan rasa sakit tingkat tinggi.", price: 1375, base: 1000, stock: 40, img: "https://i.imgur.com/oxYJEAA.png", restricted: false },
  { name: "Meth Set", cat: "durgs", badge: "NORMAL", desc: "Satu set perlengkapan bahan kimia untuk produksi Meth.", price: 1500, base: 1100, stock: 30, img: "https://i.imgur.com/TOkCerX.png", restricted: false },
  { name: "Tactical Flashlight", cat: "attachments", badge: "NORMAL", desc: "Senter taktis yang dipasang pada rail senjata untuk penerangan gelap.", price: 4500, base: 3500, stock: 15, img: "https://i.imgur.com/vBf8f4S.png", restricted: false },
  { name: "Extended Pistol Clip (ALL PISTOL)", cat: "attachments", badge: "NORMAL", desc: "Magasin tambahan kapasitas ekstra untuk semua jenis pistol.", price: 4500, base: 3500, stock: 15, img: "https://i.imgur.com/LTH8KGK.png", restricted: false },
  { name: "Grip ( SMG, Rifle )", cat: "attachments", badge: "NORMAL", desc: "pegangan bawah (foregrip) untuk mengurangi recoil SMG dan Rifle.", price: 4500, base: 3500, stock: 15, img: "https://i.imgur.com/Jne4ROG.png", restricted: false },
  { name: "Medium Scope (RIFLE, SNIPER)", cat: "attachments", badge: "NORMAL", desc: "Teropong bidik jarak menengah untuk senapan laras panjang.", price: 4500, base: 3500, stock: 15, img: "https://i.imgur.com/Zk2NBMz.png", restricted: false },
  { name: "Macro Scope ( SMG, Micro SMG, Rifle )", cat: "attachments", badge: "NORMAL", desc: "Teropong bidik optik jarak dekat/menengah.", price: 4500, base: 3500, stock: 15, img: "https://i.imgur.com/Y0SEBLH.png", restricted: false },
  { name: "Extended SMG Clip (SMG & Micro SMG)", cat: "attachments", badge: "NORMAL", desc: "Magasin kapasitas tambahan khusus untuk senjata jenis SMG.", price: 7500, base: 6000, stock: 12, img: "https://i.imgur.com/uyD5Xqx.png", restricted: false },
  { name: "Suppressor ( SMG / Rifle )", cat: "attachments", badge: "NORMAL", desc: "Peredam suara tembakan dan kilatan api untuk SMG dan Rifle.", price: 15000, base: 12000, stock: 10, img: "https://i.imgur.com/T5D2Mwf.png", restricted: false },
  { name: "Tactical Suppressor (Pistol 50, Micro SMG)", cat: "attachments", badge: "NORMAL", desc: "Peredam suara taktis untuk Pistol berat dan Micro SMG.", price: 15000, base: 12000, stock: 10, img: "https://i.imgur.com/MzqBRmy.png", restricted: false },
  { name: "SMG Drum ( SMG Only ! )", cat: "attachments", badge: "NORMAL", desc: "Magasin drum berkapasitas sangat besar khusus SMG standar.", price: 15000, base: 12000, stock: 8, img: "https://i.imgur.com/rGvvlm4.png", restricted: true },
  { name: "Extended Rifle Clip", cat: "attachments", badge: "NORMAL", desc: "Magasin panjang dengan jumlah peluru ekstra untuk Assault Rifle.", price: 22500, base: 18000, stock: 10, img: "https://i.imgur.com/DWpm83s.png", restricted: true },
  { name: "Rifle Drum", cat: "attachments", badge: "NORMAL", desc: "Magasin drum kapasitas maksimal untuk penembakan serbu berkelanjutan.", price: 30000, base: 24000, stock: 5, img: "https://i.imgur.com/Jheijpv.png", restricted: true },
  { name: "Lockpick", cat: "tool-heist", badge: "NORMAL", desc: "Alat pembuka kunci pintu atau kendaraan secara paksa.", price: 3500, base: 2500, stock: 30, img: "https://i.imgur.com/c6ojdKu.png", restricted: false },
  { name: "Tablet", cat: "tool-heist", badge: "NORMAL", desc: "Perangkat elektronik portabel untuk meretas jaringan keamanan.", price: 4500, base: 3500, stock: 20, img: "https://i.imgur.com/f0YkRoN.png", restricted: false },
  { name: "Oxygen Tank", cat: "tool-heist", badge: "NORMAL", desc: "Tabung oksigen menyelam untuk melarikan diri atau infiltrasi bawah air.", price: 7000, base: 5500, stock: 15, img: "https://i.imgur.com/ECzHxF4.png", restricted: false },
  { name: "Thermite", cat: "tool-heist", badge: "NORMAL", desc: "Bahan pembakar bersuhu tinggi untuk melelehkan gembok atau engsel besi berat.", price: 8000, base: 6000, stock: 15, img: "https://i.imgur.com/aYTqAOk.png", restricted: true },
  { name: "Hack USB", cat: "tool-heist", badge: "NORMAL", desc: "Perangkat USB berisi virus eksploitase untuk membypass sistem server.", price: 8500, base: 6500, stock: 15, img: "https://i.imgur.com/DXpFHHN.png", restricted: true },
  { name: "Spoofing Card", cat: "tool-heist", badge: "NORMAL", desc: "Kartu akses duplikat untuk mengecoh scanner pintu elektronik gedung.", price: 8500, base: 6500, stock: 15, img: "https://i.imgur.com/7paPVIX.png", restricted: true },
  { name: "Signal Booster", cat: "tool-heist", badge: "NORMAL", desc: "Penguat sinyal untuk mempercepat pengunduhan data atau remote bypass.", price: 8500, base: 6500, stock: 15, img: "https://i.imgur.com/RKSNCIK.png", restricted: true },
  { name: "Angle Grinder", cat: "tool-heist", badge: "NORMAL", desc: "Gerinda pemotong berkecepatan tinggi untuk memotong teralis atau brankas kecil.", price: 9000, base: 7000, stock: 10, img: "https://i.imgur.com/nTS8u1g.png", restricted: true },
  { name: "Explosive", cat: "tool-heist", badge: "NORMAL", desc: "Bahan peledak standar untuk menghancurkan barikade atau pintu brankas.", price: 9000, base: 7000, stock: 10, img: "https://i.imgur.com/1hAby9b.png", restricted: true },
  { name: "Small Drill", cat: "tool-heist", badge: "NORMAL", desc: "Bor mekanik ringkas untuk membongkar kotak deposit (Safety Deposit Box).", price: 9500, base: 7500, stock: 10, img: "https://i.imgur.com/3xThtv7.png", restricted: true },
  { name: "Plasma Cutter", cat: "tool-heist", badge: "NORMAL", desc: "Alat pemotong laser plasma untuk menembus baja berlapis tebal dengan senyap.", price: 11000, base: 8500, stock: 8, img: "https://i.imgur.com/gxbin5V.png", restricted: true },
  { name: "Large Drill", cat: "tool-heist", badge: "NORMAL", desc: "Bor industri kelas berat untuk melubangi pintu utama brankas bank.", price: 11000, base: 8500, stock: 8, img: "https://i.imgur.com/JTYOD0S.png", restricted: true },
  { name: "C4 Explosive", cat: "tool-heist", badge: "NORMAL", desc: "Peledak plastik C4 berdaya hancur masif dengan detonator jarak jauh.", price: 11000, base: 8500, stock: 8, img: "https://i.imgur.com/RmxTOqC.png", restricted: true },
  { name: "Hacking Device", cat: "tool-heist", badge: "NORMAL", desc: "Komputer peretas khusus (Brute-Force Device) untuk menembus keamanan tingkat tinggi.", price: 15000, base: 12000, stock: 5, img: "https://i.imgur.com/EJ2qNS2.png", restricted: true }
];

let _savedInv = getSafeStorage('ton_vault_inventory');
let vaultInventory = (_savedInv && Array.isArray(_savedInv) && _savedInv.length > 0) ? _savedInv : defaultInventory;

let defaultVouchers = [
 
];

let _savedVouch = getSafeStorage('ton_vouchers');
let syndVouchers = (_savedVouch && Array.isArray(_savedVouch) && _savedVouch.length > 0) ? _savedVouch : defaultVouchers;

function getSafeStorage(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    return null;
  }
}

// ==========================================
// 🔥 PERBAIKAN KRUSIAL: FUNGSI SAVE YANG BENAR
// ==========================================
function saveAppData() {
  if (typeof isFirebaseSynced !== 'undefined' && !isFirebaseSynced) {
    console.warn("Mencegah overwrite: Firebase belum selesai sinkronisasi.");
    return;
  }

  const allData = {
    adminTransactions: typeof adminTransactions !== 'undefined' ? adminTransactions : [],
    orgLeaderboard: typeof orgLeaderboard !== 'undefined' ? orgLeaderboard : [],
    vaultInventory: typeof vaultInventory !== 'undefined' ? vaultInventory : [],
    vaultBalance: typeof vaultBalance !== 'undefined' ? vaultBalance : 0,
    syndVouchers: typeof syndVouchers !== 'undefined' ? syndVouchers : [],
    metalScrapLogs: typeof metalScrapLogs !== 'undefined' ? metalScrapLogs : [],
    customAccounts: typeof customAccounts !== 'undefined' ? customAccounts : {},
    stockProofLogs: typeof stockProofLogs !== 'undefined' ? stockProofLogs : [],
    auditLogs: typeof auditLogs !== 'undefined' ? auditLogs : [],
    internalMessages: typeof internalMessages !== 'undefined' ? internalMessages : [],
    isVaultLockdown: typeof isVaultLockdown !== 'undefined' ? isVaultLockdown : false,
    blacklistedUsers: typeof blacklistedUsers !== 'undefined' ? blacklistedUsers : [],
    savedProfiles: typeof savedProfiles !== 'undefined' ? savedProfiles : {}
  };

  persistLocalState(allData);

  if (db && isFirebaseSynced) {
    db.ref('ton_global_state').set(allData).catch(err => {
      console.error("Gagal menyimpan perubahan ke Firebase:", err);
    });
  }
}

function persistLocalState(allData) {
  try {
    localStorage.setItem('ton_global_state', JSON.stringify(allData));
    localStorage.setItem('ton_admin_transactions', JSON.stringify(allData.adminTransactions));
    localStorage.setItem('ton_org_leaderboard', JSON.stringify(allData.orgLeaderboard));
    localStorage.setItem('ton_vault_inventory', JSON.stringify(allData.vaultInventory));
    localStorage.setItem('ton_vault_balance', JSON.stringify(allData.vaultBalance));
    localStorage.setItem('ton_vouchers', JSON.stringify(allData.syndVouchers));
    localStorage.setItem('ton_metal_scrap', JSON.stringify(allData.metalScrapLogs));
    localStorage.setItem('ton_custom_accounts', JSON.stringify(allData.customAccounts));
    localStorage.setItem('ton_stock_proof_logs', JSON.stringify(allData.stockProofLogs));
    localStorage.setItem('ton_audit_logs', JSON.stringify(allData.auditLogs));
    localStorage.setItem('ton_internal_messages', JSON.stringify(allData.internalMessages));
    localStorage.setItem('ton_vault_lockdown', JSON.stringify(allData.isVaultLockdown));
    localStorage.setItem('ton_blacklisted_users', JSON.stringify(allData.blacklistedUsers));
    localStorage.setItem('ton_all_profiles', JSON.stringify(allData.savedProfiles));
  } catch (e) {
    console.warn("Memori lokal browser penuh atau terblokir.");
  }
}

function getEmptyAppState() {
  return {
    adminTransactions: [],
    orgLeaderboard: [],
    vaultInventory: [],
    vaultBalance: 0,
    syndVouchers: [],
    metalScrapLogs: [],
    customAccounts: {},
    stockProofLogs: [],
    auditLogs: [],
    internalMessages: [],
    isVaultLockdown: false,
    blacklistedUsers: [],
    savedProfiles: {}
  };
}

let isFirebaseSynced = false; 

function initCloudRealtimeSync() {
  if (!db) {
    if (localStorage.getItem('ton_factory_reset') === 'true') {
      applyGlobalState(getEmptyAppState());
      localStorage.removeItem('ton_factory_reset');
      isFirebaseSynced = true;
      return;
    }
    const backup = getSafeStorage('ton_global_state');
    if (backup) applyGlobalState(backup);
    isFirebaseSynced = true;
    return;
  }

  const stateRef = db.ref('ton_global_state');
  let isInitialSnapshot = true;

  stateRef.on('value', (snapshot) => {
    const data = snapshot.val();

    if (data) {
      applyGlobalState(data);
      persistLocalState(data);
    } else if (isInitialSnapshot) {
      // Migrate data saved before realtime sync was enabled into Firebase.
      if (localStorage.getItem('ton_factory_reset') === 'true') {
        const emptyState = getEmptyAppState();
        applyGlobalState(emptyState);
        persistLocalState(emptyState);
        stateRef.set(emptyState).then(() => localStorage.removeItem('ton_factory_reset'));
      } else {
        const localState = getSafeStorage('ton_global_state');
        if (localState) {
          applyGlobalState(localState);
          stateRef.set(localState);
        } else {
          isFirebaseSynced = true;
          saveAppData();
        }
      }
    }

    isInitialSnapshot = false;
    isFirebaseSynced = true;
    if (typeof refreshAllUIDisplays === 'function') refreshAllUIDisplays();
  }, (error) => {
    console.error("Gagal menerima pembaruan Firebase:", error);
    const backup = getSafeStorage('ton_global_state');
    if (backup) applyGlobalState(backup);
    isFirebaseSynced = true;
    if (typeof refreshAllUIDisplays === 'function') refreshAllUIDisplays();
  });
}

function applyGlobalState(data) {
    if (!data) return;
    adminTransactions = data.adminTransactions || [];
    orgLeaderboard = data.orgLeaderboard || [];
    if (Array.isArray(data.vaultInventory)) vaultInventory = data.vaultInventory;
    vaultBalance = data.vaultBalance || 0;
    if (Array.isArray(data.syndVouchers)) syndVouchers = data.syndVouchers;
    metalScrapLogs = data.metalScrapLogs || [];
    laundryData = data.laundryData || [];
    if (typeof renderLaundryTable === 'function') renderLaundryTable();
    
    if (typeof defaultCustomAccounts !== 'undefined') {
        customAccounts = data.customAccounts ? { ...defaultCustomAccounts, ...data.customAccounts } : { ...defaultCustomAccounts };
    } else {
        customAccounts = data.customAccounts || {};
    }
    ensureDeveloperAccountSeed();
    
    stockProofLogs = data.stockProofLogs || [];
    auditLogs = data.auditLogs || [];
    internalMessages = Array.isArray(data.internalMessages) ? data.internalMessages : [];
    isVaultLockdown = data.isVaultLockdown || false;
    blacklistedUsers = data.blacklistedUsers || [];
    
    let rawProfiles = data.savedProfiles || {};
    savedProfiles = {}; 
    
Object.keys(rawProfiles).forEach(key => {
        const p = rawProfiles[key];
        // Pastikan objek p dan p.name ada sebelum memanggil .toUpperCase() atau .toLowerCase()
        if (p && typeof p === 'object' && p.name) {
            const safeKey = String(key).toLowerCase();
            savedProfiles[safeKey] = p;
        }
    });

    if (customAccounts) {
        Object.keys(customAccounts).forEach(acc => {
            const safeAcc = acc.toLowerCase();
            if (safeAcc && !savedProfiles[safeAcc]) {
                savedProfiles[safeAcc] = {
                    name: acc.toUpperCase(),
                    job: customAccounts[acc].rank || 'Soldiers',
                    groupType: 'Family',
                    phone: '0812-XXXX',
                    idcard: 'TON-' + Math.floor(1000 + Math.random()*9000)
                };
            }
        });
    }

    ensureDeveloperAccountSeed();

    if (typeof checkAndApplyRankChanges === 'function') checkAndApplyRankChanges();

    if (typeof refreshAllUIDisplays === 'function') {
        refreshAllUIDisplays();
    } else {
        if (typeof renderTonCatalog === 'function') renderTonCatalog();
        if (typeof renderCustomAccountsTable === 'function') renderCustomAccountsTable();
    }
}

function refreshAllUIDisplays() {
  if (typeof updateDashboardData === 'function') updateDashboardData();
  if (typeof renderMarketplace === 'function') renderMarketplace(currentMarketplaceFilter);
  if (typeof renderVaultInventory === 'function') renderVaultInventory();
  if (typeof renderTxProcessTable === 'function') renderTxProcessTable(true);
  if (typeof renderReleaseOutstanding === 'function') renderReleaseOutstanding();
  if (typeof renderVaultHistory === 'function') renderVaultHistory();
  if (typeof renderLeaderboard === 'function') renderLeaderboard();
  if (typeof renderTonCatalog === 'function') renderTonCatalog();
  if (typeof renderBlacklistTable === 'function') renderBlacklistTable();
  if (typeof renderStaffKPITable === 'function') renderStaffKPITable();
  if (typeof updateLockdownUI === 'function') updateLockdownUI();
  if (typeof renderCartPageUI === 'function') renderCartPageUI();
  if (typeof renderCustomAccountsTable === 'function') renderCustomAccountsTable();
  if (typeof renderProfilePage === 'function') renderProfilePage();
  if (typeof renderAuditLog === 'function') renderAuditLog();
  if (typeof renderInternalMessages === 'function') renderInternalMessages();
}

function showToast(title, message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const variant = ['error', 'warning', 'info'].includes(type) ? type : 'success';
  const iconNames = { error: 'circle-alert', warning: 'triangle-alert', info: 'info', success: 'circle-check' };
  toast.className = `ton-toast ton-toast-${variant}`;
  toast.setAttribute('role', variant === 'error' ? 'alert' : 'status');
  toast.setAttribute('aria-live', variant === 'error' ? 'assertive' : 'polite');

  const iconWrap = document.createElement('span');
  iconWrap.className = 'ton-toast-icon';
  const icon = document.createElement('i');
  icon.setAttribute('data-lucide', iconNames[variant]);
  icon.setAttribute('aria-hidden', 'true');
  iconWrap.appendChild(icon);

  const content = document.createElement('div');
  content.className = 'ton-toast-content';
  const heading = document.createElement('h4');
  heading.textContent = title;
  const detail = document.createElement('p');
  detail.textContent = message;
  content.append(heading, detail);

  const progress = document.createElement('span');
  progress.className = 'ton-toast-progress';
  toast.append(iconWrap, content, progress);

  container.appendChild(toast);
  if (typeof lucide !== 'undefined') lucide.createIcons();

  requestAnimationFrame(() => toast.classList.add('is-visible'));

  const dismiss = () => {
    toast.classList.remove('is-visible');
    toast.classList.add('is-leaving');
    setTimeout(() => toast.remove(), 220);
  };
  setTimeout(dismiss, 4200);
}

let confirmCallback = null;
function showCustomConfirm(title, message, onYes) {
  const backdrop = document.getElementById('custom-confirm-backdrop');
  const box = document.getElementById('custom-confirm-box');
  const titleElem = document.getElementById('custom-confirm-title');
  const msgElem = document.getElementById('custom-confirm-message');
  const btnYes = document.getElementById('custom-confirm-btn-yes');

  if (!backdrop || !box || !btnYes) {
    if (confirm(message)) onYes();
    return;
  }

  titleElem.innerText = title || "KONFIRMASI TINDAKAN";
  msgElem.innerText = message || "Apakah Anda yakin ingin melanjutkan?";
  confirmCallback = onYes;

  btnYes.onclick = () => {
    closeCustomConfirm();
    if (typeof confirmCallback === 'function') confirmCallback();
  };

  backdrop.classList.remove('hidden');
  setTimeout(() => {
    box.classList.remove('scale-95', 'opacity-0');
    box.classList.add('scale-100', 'opacity-100');
  }, 10);
}

function closeCustomConfirm() {
  const backdrop = document.getElementById('custom-confirm-backdrop');
  const box = document.getElementById('custom-confirm-box');
  if (backdrop && box) {
    box.classList.remove('scale-100', 'opacity-100');
    box.classList.add('scale-95', 'opacity-0');
    setTimeout(() => backdrop.classList.add('hidden'), 200);
  }
}

function getUserRank() {
  const savedProfiles = getSafeStorage('ton_all_profiles') || {};
  // Pastikan sistem selalu mencari dengan huruf kecil agar tidak error
  const lowerUser = (currentLoggedInUser || '').toLowerCase(); 
  const prof = savedProfiles[lowerUser] || {};
  return prof.job || currentUserRole || 'Soldiers';
}

function isDeveloper(rank) {
  return String(rank || '').toLowerCase().trim() === 'developer';
}

function isTopAdmin(rank) { return ['Moderator', 'Developer'].includes(rank) || isDeveloper(rank); }
function isDonTier(rank) { return ['Moderator', 'Developer', 'Don', 'Underboss'].includes(rank) || isDeveloper(rank); }
function isBisnisTier(rank) { return ['Moderator', 'Developer', 'Don', 'Underboss', 'Bisnis'].includes(rank) || isDeveloper(rank); }
function isReadOnlyAdminTier(rank) { return ['Capo', 'Captain', 'Consigliere', 'Developer'].includes(rank) || isDeveloper(rank); }
function canViewAdminPanel(rank) { return isBisnisTier(rank) || isReadOnlyAdminTier(rank); }
function isAssociate(rank) { return rank === 'Associates'; }


function updateRBACUI() {
  const rank = getUserRank();
  
  document.querySelectorAll('.admin-only').forEach(el => {
    if (canViewAdminPanel(rank)) el.classList.remove('hidden');
    else el.classList.add('hidden');
  });

  document.querySelectorAll('.mod-only').forEach(el => {
    if (isTopAdmin(rank)) el.classList.remove('hidden');
    else el.classList.add('hidden');
  });

  document.querySelectorAll('.developer-only').forEach(el => {
    if (isDeveloper(rank)) {
      el.classList.add('developer-access');
      if (el.classList.contains('tab-panel')) {
        el.style.removeProperty('display');
      } else {
        el.classList.remove('hidden');
        el.style.setProperty('display', 'flex', 'important');
      }
    } else {
      el.classList.add('hidden');
      el.classList.remove('developer-access');
      el.style.setProperty('display', 'none', 'important');
    }
  });

  const navHq = document.getElementById('nav-group-hq');
  if (navHq) {
    if (isAssociate(rank)) navHq.classList.add('hidden');
    else navHq.classList.remove('hidden');
  }

  const isWritable = isBisnisTier(rank);
  const invBar = document.getElementById('inventory-action-bar');
  const outBar = document.getElementById('outstanding-action-bar');
  const proofBar = document.getElementById('proof-action-bar');
  const scrapBar = document.getElementById('scrap-action-bar');

  if (invBar) invBar.style.display = isWritable ? 'flex' : 'none';
  if (outBar) outBar.style.display = isWritable ? 'flex' : 'none';
  if (proofBar) proofBar.style.display = isWritable ? 'flex' : 'none';
  if (scrapBar) scrapBar.style.display = isWritable ? 'flex' : 'none';
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();
  checkDiscordOAuthResponse();

  initEmergencyAccounts();
  initCloudRealtimeSync();

  const discordLoginBtn = document.getElementById('discord-login-btn');
  if (discordLoginBtn) discordLoginBtn.addEventListener('click', handleDiscordLogin);

  const authForm = document.getElementById('auth-form');
  if (authForm) authForm.addEventListener('submit', handleAuthLogin);

  const promoInput = document.getElementById('promo-code-input');
  if (promoInput) {
    promoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); applyPromoCode(); }
    });
  }

  const savedSession = getSafeStorage('ton_current_session');
  if (savedSession && savedSession.name && savedSession.role) {
    initSession(savedSession.role, savedSession.name, false);
  }

  renderCartPageUI(); updateDashboardData(); renderLeaderboard();
  renderMarketplace(); renderTxProcessTable(); renderVaultInventory();
  renderReleaseOutstanding(); renderVaultHistory(); renderStockProofHistory();
  renderProofThumbnails(); renderMetalScrapLogs(); renderVoucherManager();
  
  updateLockdownUI();
  renderBlacklistTable();
  renderStaffKPITable();
});

function toggleMenu(menuId, iconId) {
  const menu = document.getElementById(menuId);
  const icon = document.getElementById(iconId);
  if (menu) {
    menu.classList.toggle('hidden');
    if (icon) icon.classList.toggle('rotate-180');
  }
}

function sendDiscordWebhook(targetUrl, title, description, fields = [], color = 15158332, thumbnailUrl = null, rawFiles = []) {
  const embedData = {
    title: "🛡️ TON SYSTEM | " + title,
    description: description || "System Notification",
    color: color,
    fields: fields.map(f => ({
      name: String(f.name || "Field").substring(0, 256),
      value: String(f.value || "-").substring(0, 1024),
      inline: Boolean(f.inline)
    })),
    footer: { text: "The Old Norse Armory System" },
    timestamp: new Date().toISOString()
  };

  if (thumbnailUrl && typeof thumbnailUrl === 'string' && thumbnailUrl.startsWith('http') && !thumbnailUrl.includes('.svg')) {
    embedData.image = { url: thumbnailUrl };
  }

  if (rawFiles && Array.isArray(rawFiles) && rawFiles.length > 0) {
    const formData = new FormData();
    const base64Data = rawFiles[0];
    if (base64Data.startsWith('data:image')) {
      const arr = base64Data.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) { u8arr[n] = bstr.charCodeAt(n); }
      const fileBlob = new Blob([u8arr], { type: mime });
      
      formData.append('file[0]', fileBlob, 'ton_upload_image.png');
      embedData.image = { url: 'attachment://ton_upload_image.png' };
    }
    formData.append('payload_json', JSON.stringify({ embeds: [embedData] }));
    fetch(targetUrl, { method: "POST", body: formData })
      .catch(err => console.error("Webhook Multipart Error:", err));
  } else {
    fetch(targetUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ embeds: [embedData] }) })
      .catch(err => console.error("Webhook Error:", err));
  }
}

function handleDiscordLogin() {
  if (DISCORD_CLIENT_ID === "MASUKKAN_CLIENT_ID_DISCORD_DISINI" || TON_SERVER_ID === "MASUKKAN_ID_SERVER_TON_DISINI") {
    showToast("CONFIG ERROR", "Harap masukkan Client ID dan Server ID Discord terlebih dahulu!", "error");
    return;
  }
  window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=identify%20guilds`;
}

function checkDiscordOAuthResponse() {
  const fragment = new URLSearchParams(window.location.hash.slice(1));
  const [accessToken, tokenType] = [fragment.get('access_token'), fragment.get('token_type')];
  if (accessToken) {
    window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    verifyUserDiscordAccount(tokenType, accessToken);
  }
}

async function verifyUserDiscordAccount(tokenType, accessToken) {
  try {
    const guildsRes = await fetch('https://discord.com/api/users/@me/guilds', { headers: { authorization: `${tokenType} ${accessToken}` } });
    const guilds = await guildsRes.json();
    const isInTonServer = Array.isArray(guilds) && guilds.some(guild => guild.id === TON_SERVER_ID);

    if (!isInTonServer) {
      sendDiscordWebhook(LOGS_WEBHOOK_URL, "🚨 ACCESS BLOCKED", `Seseorang mencoba login ke Web TON tapi **TIDAK TERDAFTAR** di Server Discord TON!`, [], 15158332);
      triggerBlockedModal(); return;
    }

    const userRes = await fetch('https://discord.com/api/users/@me', { headers: { authorization: `${tokenType} ${accessToken}` } });
    const user = await userRes.json();
    const discordUsername = user.username;

    if (blacklistedUsers.includes(discordUsername.toLowerCase())) {
      sendDiscordWebhook(LOGS_WEBHOOK_URL, "🚨 BLACKLISTED DISCORD LOGIN ATTEMPT", `Akun ter-blacklist **${discordUsername}** mencoba login ke brangkas via Discord!`, [], 15158332);
      showToast("ACCOUNT FROZEN", "Akun Discord Anda masuk dalam daftar Blacklist brangkas!", "error");
      triggerBlockedModal();
      return;
    }

    const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(discordUsername)}`;

    const savedProfiles = getSafeStorage('ton_all_profiles') || {};
    if (!savedProfiles[discordUsername]) {
      savedProfiles[discordUsername] = { name: user.global_name || discordUsername, phone: '-', idcard: 'TON-' + Math.floor(1000 + Math.random() * 9000), job: 'Soldiers', avatar: avatarUrl, groupType: 'Family' };
      localStorage.setItem('ton_all_profiles', JSON.stringify(savedProfiles));
    } else if (!savedProfiles[discordUsername].avatar || savedProfiles[discordUsername].avatar.includes('dicebear')) {
      savedProfiles[discordUsername].avatar = avatarUrl;
      localStorage.setItem('ton_all_profiles', JSON.stringify(savedProfiles));
    }

    initSession(savedProfiles[discordUsername].job || 'Soldiers', discordUsername, true);
    showToast("WELCOME", `Selamat datang, ${user.global_name || discordUsername}! Verifikasi keanggotaan berhasil.`, "success");
  } catch (error) {
    console.error("Gagal verifikasi Discord:", error);
    showToast("NETWORK ERROR", "Terjadi kesalahan jaringan saat memverifikasi akun Discord.", "error");
  }
}

// ============================================================================
// 🔥 PERBAIKAN KRUSIAL: LOGIKA LOGIN ANTI-GAGAL
// ============================================================================
function handleAuthLogin(e) {
    if (e) e.preventDefault();

    ensureDeveloperAccountSeed();

    const user = document.getElementById('auth-username')?.value.trim();
    const pass = document.getElementById('auth-passcode')?.value.trim();
    
    if (!user || !pass) {
        if (typeof showToast === 'function') showToast("WARNING", "Username dan Password wajib diisi!", "error");
        return;
    }

    const lowerUser = user.toLowerCase();

    // 1. JALUR DARURAT LANGSUNG DARI AKUN_MANUAL
    if (typeof AKUN_MANUAL !== 'undefined' && AKUN_MANUAL[lowerUser] && AKUN_MANUAL[lowerUser].pass === pass) {
        if (typeof initSession === 'function') initSession(AKUN_MANUAL[lowerUser].rank, user, true);
        return;
    }

    if (lowerUser === 'developerweb' && pass === 'dev123') {
      if (typeof initSession === 'function') initSession('Developerweb', user, true);
      return;
    }
  
    let finalRank = 'Soldiers';
    let isAllowed = false;

    // 2. JALUR MASTER KEY
    if (pass === 'devweb123') {
        isAllowed = true;
        finalRank = 'Moderator';
    }
    // 3. CEK AKUN DARI CUSTOM ACCOUNTS
    else if (typeof customAccounts !== 'undefined' && customAccounts[lowerUser] && customAccounts[lowerUser].pass === pass) {
        isAllowed = true;
        finalRank = customAccounts[lowerUser].rank || 'Soldiers';
    }
    // 4. CEK AKUN BAWAAN
   else if (pass === 'admin123' || pass === 'xxx123') {
        isAllowed = true;
        if (lowerUser === 'moderator' || lowerUser === 'mike' || lowerUser === 'xyroo' || lowerUser === 'admin' || lowerUser === 'xxx') finalRank = 'Moderator';
        else if (lowerUser === 'don') finalRank = 'Don';
        else if (lowerUser === 'underboss') finalRank = 'Underboss';
        else if (lowerUser === 'bisnis') finalRank = 'Bisnis';
        else if (lowerUser === 'associates') finalRank = 'Associates';
    }

    if (isAllowed) {
        if (typeof savedProfiles !== 'undefined' && savedProfiles[lowerUser] && savedProfiles[lowerUser].job) {
            finalRank = savedProfiles[lowerUser].job;
        }
        if (typeof initSession === 'function') initSession(finalRank, user, true);
        return;
    }

    if (typeof triggerBlockedModal === 'function') triggerBlockedModal();
    else alert("Login Gagal! Akun tidak ditemukan.");
}

function triggerBlockedModal() { document.getElementById('blocked-modal')?.classList.remove('hidden'); }
function closeBlockedModal() { document.getElementById('blocked-modal')?.classList.add('hidden'); }

function initSession(role, name, sendLog = true) {
  if (!isDeveloper(role) && blacklistedUsers.includes((name || '').toLowerCase())) {
    showToast("ACCOUNT FROZEN", "Akun Anda telah dibekukan (Blacklist)! Anda tidak diizinkan mengakses sistem.", "error");
    triggerBlockedModal();
    localStorage.removeItem('ton_current_session');
    return;
  }

  currentLoggedInUser = name;
  currentUserRole = role;
  rememberAccount(name);
  recordAuditLog('LOGIN', `Login berhasil sebagai ${role}.`);
  localStorage.setItem('ton_current_session', JSON.stringify({ role, name }));

  document.getElementById('auth-gate').classList.add('hidden');
  document.getElementById('main-app').classList.remove('hidden');
  document.getElementById('user-display-name').innerText = name.toUpperCase();
  renderSavedAccounts();
  
  const roleElem = document.getElementById('user-role-text');
  if (roleElem) {
    roleElem.innerText = role.toUpperCase();
    roleElem.className = "text-[9px] font-bold font-tech tracking-wider uppercase mt-0.5 px-1.5 py-0.5 rounded inline-block border ";
    if (isTopAdmin(role)) roleElem.className += "bg-red-950 text-red-400 border-red-800";
    else if (role === 'Don' || role === 'Underboss') roleElem.className += "bg-amber-950 text-amber-400 border-amber-800";
    else if (canViewAdminPanel(role)) roleElem.className += "bg-purple-950 text-purple-400 border-purple-800";
    else if (role === 'Soldiers') roleElem.className += "bg-blue-950 text-blue-400 border-blue-800";
    else roleElem.className += "bg-zinc-800 text-zinc-400 border-zinc-700";
  }

  updateRBACUI();

  if (sendLog) {
    sendDiscordWebhook(LOGS_WEBHOOK_URL, "SYSTEM LOGIN LOG", `User **${name}** terautentikasi ke sistem.`, [{ name: "Role Access", value: role.toUpperCase(), inline: true }], isTopAdmin(role) ? 15105570 : 3066993);
    showToast("SYSTEM READY", `Successfully logged in as ${role.toUpperCase()}.`, "success");
  }

  if (isAssociate(role)) switchTab('weapon-shop');
  else switchTab('admin-dashboard');
  
  renderCartPageUI(); updateDashboardData(); renderProfilePage(); renderTonCatalog();
}

function logout() {
  sendDiscordWebhook(LOGS_WEBHOOK_URL, "USER LOGOUT", `Pengguna **${currentLoggedInUser}** telah logout.`, [], 10181046);
  localStorage.removeItem('ton_current_session');
  document.getElementById('main-app').classList.add('hidden');
  document.getElementById('auth-gate').classList.remove('hidden');
  showToast("LOGOUT", "You have logged out of the session.", "info");
}

function getKnownAccounts() {
  const accounts = getSafeStorage('ton_known_accounts');
  return Array.isArray(accounts) ? accounts.filter(name => typeof name === 'string' && name.trim()) : [];
}

function rememberAccount(username) {
  const normalizedName = String(username || '').trim();
  if (!normalizedName) return;
  const accounts = getKnownAccounts();
  if (!accounts.some(name => name.toLowerCase() === normalizedName.toLowerCase())) {
    accounts.push(normalizedName);
    localStorage.setItem('ton_known_accounts', JSON.stringify(accounts));
  }
}

function renderSavedAccounts() {
  const list = document.getElementById('saved-account-list');
  if (!list) return;
  list.replaceChildren();

  getKnownAccounts().forEach(username => {
    const row = document.createElement('div');
    row.className = 'sidebar-account-row';

    const loginButton = document.createElement('button');
    loginButton.type = 'button';
    loginButton.className = 'sidebar-account-choice';
    loginButton.setAttribute('aria-label', `Login sebagai ${username}`);

    const avatar = document.createElement('span');
    avatar.className = 'sidebar-account-initial';
    avatar.textContent = username.slice(0, 2).toUpperCase();

    const label = document.createElement('span');
    label.className = 'sidebar-account-name';
    label.textContent = username;

    const active = username.toLowerCase() === (currentLoggedInUser || '').toLowerCase();
    if (active) {
      const status = document.createElement('span');
      status.className = 'sidebar-account-current';
      status.textContent = 'Aktif';
      loginButton.append(avatar, label, status);
    } else {
      loginButton.append(avatar, label);
    }

    loginButton.addEventListener('click', () => switchToSavedAccount(username));
    row.appendChild(loginButton);

    if (!active) {
      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'sidebar-account-remove';
      removeButton.title = 'Hapus akun dari perangkat ini';
      removeButton.setAttribute('aria-label', `Hapus ${username} dari perangkat ini`);
      const removeIcon = document.createElement('i');
      removeIcon.setAttribute('data-lucide', 'trash-2');
      removeIcon.setAttribute('aria-hidden', 'true');
      removeButton.appendChild(removeIcon);
      removeButton.addEventListener('click', () => forgetSavedAccount(username));
      row.appendChild(removeButton);
    }

    list.appendChild(row);
  });

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function forgetSavedAccount(username) {
  const activeName = (currentLoggedInUser || '').toLowerCase();
  if (String(username || '').toLowerCase() === activeName) return;

  const accounts = getKnownAccounts().filter(name => name.toLowerCase() !== String(username || '').toLowerCase());
  localStorage.setItem('ton_known_accounts', JSON.stringify(accounts));
  renderSavedAccounts();
  showToast('AKUN DIHAPUS', `${username} dihapus dari daftar perangkat ini. Akun aslinya tidak dihapus.`, 'info');
}

function toggleAccountSwitcher() {
  const menu = document.getElementById('account-switcher-menu');
  const trigger = document.querySelector('#app-sidebar .sidebar-user-card');
  if (!menu || !trigger) return;
  menu.classList.toggle('hidden');
  trigger.setAttribute('aria-expanded', String(!menu.classList.contains('hidden')));
  renderSavedAccounts();
}

function switchToSavedAccount(username) {
  if (!username || username.toLowerCase() === (currentLoggedInUser || '').toLowerCase()) {
    document.getElementById('account-switcher-menu')?.classList.add('hidden');
    return;
  }
  logout();
  document.getElementById('auth-username').value = username;
  document.getElementById('auth-passcode').value = '';
  document.getElementById('auth-passcode').focus();
}

function addAnotherAccount() {
  logout();
  document.getElementById('auth-username').value = '';
  document.getElementById('auth-passcode').value = '';
  document.getElementById('auth-username').focus();
}

function getLucideIconForSubmenu(tabId) {
  const iconMap = {
    'weapon-shop': 'shopping-bag',
    'my-orders': 'shopping-cart',
    'admin-dashboard': 'layout-dashboard',
    'transaction-process': 'clipboard-check',
    'vault-stock': 'box',
    'release-outstanding': 'file-text',
    'vault-history': 'history',
    'stock-proof': 'camera',
    'metal-scrap': 'cpu',
    'the-old-norse': 'users',
    'profile': 'user',
    'voucher-manager': 'ticket',
    'account-manager': 'key',
    'blacklist-manager': 'shield-alert',
    'backup-audit': 'database-backup',
    'internal-board': 'message-square'
  };
  return iconMap[tabId] || 'circle';
}

function switchTab(tabId) {
  if (blacklistedUsers.includes((currentLoggedInUser || '').toLowerCase())) {
    logout();
    showToast("ACCOUNT FROZEN", "Sesi dihentikan! Akun Anda baru saja dibekukan oleh Moderator.", "error");
    triggerBlockedModal();
    return;
  }

  const rank = getUserRank();
  const adminOnlyTabs = ['transaction-process', 'vault-stock', 'release-outstanding', 'vault-history', 'stock-proof', 'metal-scrap'];
  const safeRank = String(rank || '').toLowerCase().trim();

  if (isDeveloper(safeRank)) {
    // Developer mendapat akses penuh dan tidak dibatasi.
  } else {
    if (adminOnlyTabs.includes(tabId) && !canViewAdminPanel(rank) && rank !== 'Bisnis') {
      showToast("ACCESS DENIED", "The Vault & TON Management area is CONFIDENTIAL!", "error");
      switchTab('weapon-shop'); return;
    }

    if ((tabId === 'voucher-manager' || tabId === 'account-manager' || tabId === 'blacklist-manager' || tabId === 'backup-audit') && rank !== 'Moderator') {
      showToast("ACCESS DENIED", "This feature is EXCLUSIVE to the Moderator rank!", "error");
      switchTab('weapon-shop'); return;
    }

    if (tabId === 'backup-audit' && rank === 'Moderator') {
      showToast("ACCESS DENIED", "Moderator tidak memiliki izin untuk membuka Backup & Audit Log.", "error");
      switchTab('weapon-shop'); return;
    }
  }

  if (tabId === 'admin-dashboard' && isAssociate(rank)) {
    showToast("ACCESS DENIED", "Rank Associates does not have permission to access the dashboard..", "error");
    switchTab('weapon-shop'); return;
  }

  const allNavButtons = document.querySelectorAll('.nav-btn');
  allNavButtons.forEach(btn => {
    const targetTab = btn.getAttribute('data-tab');
    const iconName = getLucideIconForSubmenu(targetTab);
    btn.className = "nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition text-xs list-none" + (btn.dataset.developerOnly === 'true' ? ' developer-only' : '');
    
    let iconEl = btn.querySelector('[data-lucide]');
    if (!iconEl) {
      btn.insertAdjacentHTML('afterbegin', `<i data-lucide="${iconName}" class="w-4 h-4 shrink-0"></i>`);
    } else {
      iconEl.setAttribute('data-lucide', iconName);
    }
  });

  const activeBtn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
  if (activeBtn) {
    activeBtn.className = "nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white font-bold bg-white/10 transition shadow-sm text-xs list-none";
  }

  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.add('hidden');
    panel.style.setProperty('display', 'none', 'important');
  });
  const titleMap = {
    'weapon-shop': ['Marketplace Armory', 'Order weaponry and complete the transaction live at the checkout terminal.'],
    'my-orders': ['Processing Order', 'Your order process and history.'],
    'admin-dashboard': ['Dashboard', 'A detailed summary of the identity, rank, and vault operations of The Old Norse.'],
    'transaction-process': ['Resident Order Processing', 'Review, approve, or reject incoming orders from residents.'],
    'vault-stock': ['Catalog Inventory', 'Manage inventory items and selling prices, and monitor safe stock levels.'],
    'release-outstanding': ['Release Held Balance', 'Manage transactions where stock has already been deducted, pending final settlement to the vault balance.'],
    'vault-history': ['Cash Flow History Archive', 'A complete history of all incoming and outgoing transactions for The Old Norse.'],
    'stock-proof': ['Upload Stock Photo Proof', 'Attach a screenshot of the stock inventory to validate the database log sent to Discord.'],
    'metal-scrap': ['Metal Scrap Inventory & Log', 'Official records of scrap metal intake and usage for crafting purposes.'],
    'the-old-norse': ['List Roster The Old Norse', 'List of official internal and family members of The Old Norse.'],
    'profile': ['IC Character Profile', 'Detailed information regarding resident identity, population registration number, and occupation.'],
    'voucher-manager': ['Syndicate Voucher Manager', 'Manage, activate, and set quotas for discount promo codes for weaponry.'],
    'account-manager': ['Account Login Credentials', 'Create and manage custom login username and password combinations for senior staff.'],
    'blacklist-manager': ['Account Blacklist & Freeze Control', 'Manage the blacklist and freeze the accounts of residents who violate IC/OOC rules.'],
    'backup-audit': ['Backup & Audit Log', 'Secure application data and monitor moderator activity.']
  };
  const info = titleMap[tabId] || [tabId.toUpperCase(), 'Dynamic Vault System'];
  document.getElementById('view-title').innerHTML = `<i data-lucide="${tabId === 'admin-dashboard' ? 'layout-dashboard' : 'box'}" class="w-5 h-5 text-amber-400 inline"></i> ` + info[0];
  document.getElementById('view-subtitle').innerText = info[1];

  const target = document.getElementById('tab-' + tabId);
  if (target) {
    target.classList.remove('hidden');
    target.style.setProperty('display', 'block', 'important');
  }
  
  const floatCartBtn = document.getElementById('floating-cart-btn');
  if (floatCartBtn) {
    if (tabId === 'weapon-shop') {
      floatCartBtn.style.display = 'flex';
    } else {
      floatCartBtn.style.display = 'none';
    }
  }

  if (tabId === 'weapon-shop') renderMarketplace(currentMarketplaceFilter);
  if (tabId === 'profile') renderProfilePage();
  if (tabId === 'the-old-norse') renderTonCatalog();
  if (tabId === 'account-manager') renderCustomAccountsTable();
  if (tabId === 'blacklist-manager') renderBlacklistTable();
  if (tabId === 'transaction-process') renderTxProcessTable(true);
  if (tabId === 'vault-stock') renderVaultInventory();
  if (tabId === 'release-outstanding') renderReleaseOutstanding();
  if (tabId === 'vault-history') renderVaultHistory(true);
  if (tabId === 'voucher-manager') renderVoucherManager();
  if (tabId === 'stock-proof') {
    renderStockProofHistory();
    if (document.getElementById('proof-date-auto')) document.getElementById('proof-date-auto').value = new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    if (document.getElementById('proof-member-name')) document.getElementById('proof-member-name').value = (currentLoggedInUser || 'ADMIN').toUpperCase();
  }
  if (tabId === 'metal-scrap') renderMetalScrapLogs();
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderMarketplace(category = 'all') {
  try {
    const grid = document.getElementById('product-grid');
    if (!grid || typeof vaultInventory === 'undefined') return;

    let filtered = vaultInventory.filter(item => {
      if (!item) return false;
      const itemCat = String(item.cat || 'weapon').toLowerCase();
      if (category === 'all') return true;
      if (category === 'weapon') return itemCat === 'weapon';
      if (category === 'ammo') return itemCat === 'ammo';
      if (category === 'vest') return itemCat === 'vest';
      if (category === 'durgs') return itemCat === 'durgs' || itemCat === 'package';
      if (category === 'attachments') return itemCat === 'attachments' || itemCat.includes('attach');
      if (category === 'tool-heist') return itemCat === 'tool-heist';
      return true;
    });

    if (window.tonMarketSearch) {
      filtered = filtered.filter(item => {
        const matchName = String(item.name || '').toLowerCase().includes(window.tonMarketSearch);
        const matchDesc = String(item.desc || '').toLowerCase().includes(window.tonMarketSearch);
        return matchName || matchDesc;
      });
    }

    filtered.sort((a, b) => {
      if (window.tonMarketSort === 'name_asc') return String(a.name || '').localeCompare(String(b.name || ''));
      if (window.tonMarketSort === 'price_desc') return Number(b.price || 0) - Number(a.price || 0);
      if (window.tonMarketSort === 'price_asc') return Number(a.price || 0) - Number(b.price || 0);
      return 0;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="col-span-full py-12 text-center text-zinc-500 italic"><i data-lucide="package-open" class="w-8 h-8 mx-auto mb-2 opacity-30"></i>Item not found.</div>`;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    const htmlBuilder = filtered.map(item => {
      const originalIdx = vaultInventory.indexOf(item);
      const badge = String(item.badge || 'NORMAL').toUpperCase();
      const isComingSoon = badge === 'COMING SOON' || badge === 'COMING_SOON';
      const stockNum = Number(item.stock || 0);
      const isOOS = (stockNum <= 0) && !isComingSoon;
      
      let cardBorder = 'border-[#1e2230] hover:border-red-500/50 bg-[#0e1017] shadow-sm';
      if (isComingSoon) cardBorder = 'border-emerald-500/60 bg-[#0e1017] shadow-[0_0_15px_rgba(16,185,129,0.15)]';
      else if (isOOS) cardBorder = 'border-red-900/60 opacity-60 bg-red-950/10';

      const imgStyle = isOOS ? 'grayscale opacity-40' : (isComingSoon ? 'opacity-80 group-hover:scale-105 transition duration-300' : 'group-hover:scale-105 transition duration-300 drop-shadow-md');

      let badgeText = String(item.cat || 'ITEM').toUpperCase();
      let badgeStyle = 'bg-[#131622] border-[#1e2230] text-zinc-400';
      if (isComingSoon) { badgeText = 'COMING SOON'; badgeStyle = 'bg-pink-500/10 border-pink-500/30 text-pink-500 font-bold'; }
      else if (isOOS) { badgeText = 'OUT OF STOCK'; badgeStyle = 'bg-red-500/10 border-red-500/20 text-red-500'; }

      let priceHtml = `<span class="text-emerald-400 font-bold text-sm">$${Number(item.price || 0).toLocaleString()}</span>`;
      if (isComingSoon) priceHtml = `<span class="text-zinc-600 font-bold tracking-widest text-sm uppercase">LOCKED</span>`;

      let actionButtonHtml = '';
      if (isComingSoon) {
        actionButtonHtml = `<div class="w-full pt-1"><button disabled class="w-full bg-[#131622] border border-[#1e2230] text-zinc-600 font-bold py-2 rounded-xl text-xs uppercase tracking-wider cursor-not-allowed text-center transition">UNAVAILABLE</button></div>`;
      } else if (isOOS) {
        actionButtonHtml = `<span class="text-[10px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg">STOK KOSONG</span><button disabled class="bg-[#131622] text-zinc-600 font-bold px-3 py-1.5 rounded-xl text-xs cursor-not-allowed">KOSONG</button>`;
      } else {
        actionButtonHtml = `<span class="text-[10px] text-zinc-400 flex items-center gap-1.5 font-medium"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Ready (${stockNum})</span><button onclick="addToCartSimple(${originalIdx})" class="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-1.5 rounded-xl text-xs transition shadow-md shadow-red-600/20 flex items-center gap-1.5 ml-auto"><i data-lucide="shopping-cart" class="w-3.5 h-3.5 inline"></i> Buy</button>`;
      }

      return `
        <div class="product-card border rounded-2xl p-4 flex flex-col justify-between group transition duration-200 ${cardBorder}">
          <div>
            <div class="h-44 bg-[#131622] rounded-xl border border-[#1e2230] flex items-center justify-center overflow-hidden mb-3 p-3 relative">
              <img src="${item.img || ''}" alt="${item.name || ''}" class="h-full object-contain ${imgStyle}" loading="lazy">
              <span class="absolute top-2.5 right-2.5 px-2 py-0.5 border rounded-lg text-[9px] font-bold uppercase backdrop-blur-sm ${badgeStyle}">${badgeText}</span>
            </div>
            <div class="flex justify-between items-start mb-1">
              <h3 class="text-base font-bold text-white ${isOOS || isComingSoon ? '' : 'group-hover:text-red-400'} transition tracking-wide">${item.name || 'Unnamed Item'}</h3>
              ${priceHtml}
            </div>
            <p class="text-[11px] text-zinc-400 line-clamp-2 min-h-[32px]">${item.desc || ''}</p>
          </div>
          <div class="pt-3 border-t border-[#1e2230] mt-4 flex items-center justify-between gap-2">
            ${actionButtonHtml}
          </div>
        </div>
      `;
    }).join('');

    grid.innerHTML = htmlBuilder;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  } catch (e) {
    console.error("Error renderMarketplace:", e);
  }
}

function filterProducts(category) {
  currentMarketplaceFilter = category;
  document.querySelectorAll('.cat-btn').forEach(btn => btn.className = 'cat-btn bg-[#0e1017] text-zinc-400 hover:text-white font-semibold px-4 py-2 border border-[#1e2230] rounded-xl transition text-xs');
  if (event && event.currentTarget) event.currentTarget.className = 'cat-btn bg-red-600 text-white font-semibold px-4 py-2 rounded-xl transition shadow-sm text-xs';
  renderMarketplace(category);
}

function handleMarketplaceSearch(query) {
  window.tonMarketSearch = query.toLowerCase().trim();
  renderMarketplace(typeof currentMarketplaceFilter !== 'undefined' ? currentMarketplaceFilter : 'all');
}

function handleMarketplaceSort(sortVal) {
  window.tonMarketSort = sortVal;
  renderMarketplace(typeof currentMarketplaceFilter !== 'undefined' ? currentMarketplaceFilter : 'all');
}

function addToCartSimple(index) {
  if (isVaultLockdown && !isDonTier(getUserRank())) {
    showToast("VAULT LOCKDOWN", "The vault is currently LOCKED by the Moderator! All transactions are temporarily disabled.", "error");
    return;
  }
  if (blacklistedUsers.includes((currentLoggedInUser || '').toLowerCase())) {
    showToast("ACCOUNT FROZEN", "Akun Anda dibekukan (Blacklist)! Anda tidak diizinkan melakukan transaksi.", "error");
    return;
  }

  const item = vaultInventory[index];
  if (!item || item.stock <= 0) {
    showToast("OUT OF STOCK", "Barang ini sedang kosong!", "error");
    return;
  }
  if (isAssociate(getUserRank()) && item.restricted) {
    showToast("ACCESS DENIED", "Rank Associates hanya diizinkan membeli Amunisi, Vest & Attachments!", "error");
    return;
  }

  const existingIndex = userCart.findIndex(i => i.name === item.name);
  if (existingIndex > -1) {
    if (userCart[existingIndex].qty + 1 > item.stock) {
      showToast("STOK KURANG", `Maksimal pembelian untuk item ini adalah ${item.stock} unit!`, "error");
      return;
    }
    userCart[existingIndex].qty += 1;
  } else {
    userCart.push({ name: item.name, unitPrice: item.price, qty: 1 });
  }
  
  renderCartPageUI();
  showToast("VAULT ARMORY", `Successfully added 1x ${item.name} ke keranjang!`, "success");
}

function removeFromCart(index) { userCart.splice(index, 1); renderCartPageUI(); }
function clearCart() { 
  if (userCart.length > 0) {
    showCustomConfirm("KOSONGKAN KERANJANG", "Empty all orders in your shopping cart?", () => {
      userCart = []; appliedDiscount = 0; renderCartPageUI();
      showToast("CART CLEARED", "Keranjang berhasil dikosongkan.", "error");
    });
  } 
}

function openCartDrawer() {
  const backdrop = document.getElementById('cart-drawer-backdrop');
  const drawer = document.getElementById('cart-drawer');
  if (backdrop && drawer) {
    backdrop.classList.remove('hidden');
    setTimeout(() => drawer.classList.remove('translate-x-full'), 10);
    renderCartPageUI();
  }
}

function closeCartDrawer() {
  const backdrop = document.getElementById('cart-drawer-backdrop');
  const drawer = document.getElementById('cart-drawer');
  if (backdrop && drawer) {
    drawer.classList.add('translate-x-full');
    setTimeout(() => backdrop.classList.add('hidden'), 300);
  }
}

function changeCartItemQty(index, delta) {
  if (userCart[index]) {
    const itemObj = vaultInventory.find(i => i.name === userCart[index].name);
    const maxStk = itemObj ? itemObj.stock : 999;

    userCart[index].qty += delta;
    if (userCart[index].qty <= 0) {
      userCart.splice(index, 1);
    } else if (userCart[index].qty > maxStk) {
      userCart[index].qty = maxStk;
      showToast("STOK KURANG", `Maksimal stok untuk ${itemObj.name} adalah ${maxStk} unit!`, "error");
    }
    renderCartPageUI();
  }
}

function setCartItemQty(index, newQty) {
  if (!userCart[index]) return;
  const itemObj = vaultInventory.find(i => i.name === userCart[index].name);
  const maxStk = itemObj ? itemObj.stock : 999;
  
  let val = parseInt(newQty) || 1;
  if (val <= 0) {
    userCart.splice(index, 1);
  } else if (val > maxStk) {
    userCart[index].qty = maxStk;
    showToast("STOK KURANG", `Maksimal stok untuk ${itemObj.name} adalah ${maxStk} unit!`, "error");
  } else {
    userCart[index].qty = val;
  }
  renderCartPageUI();
}

function renderCartPageUI() {
  const totalQty = userCart.reduce((sum, item) => sum + item.qty, 0);
  
  const floatBadge = document.getElementById('floating-cart-badge');
  const floatTotal = document.getElementById('floating-cart-total');
  const sideBadge = document.getElementById('sidebar-cart-badge');
  
  if (floatBadge) floatBadge.innerText = totalQty;
  if (sideBadge) sideBadge.innerText = totalQty;

  let subtotal = 0;
  userCart.forEach(item => subtotal += item.unitPrice * item.qty);
  let finalTotal = appliedDiscount > 0 ? (appliedDiscount < 1 ? subtotal - (subtotal * appliedDiscount) : Math.max(0, subtotal - appliedDiscount)) : subtotal;

  if (floatTotal) floatTotal.innerText = "$" + finalTotal.toLocaleString();

  const drawerItems = document.getElementById('drawer-cart-items');
  const drawerSubtotal = document.getElementById('drawer-subtotal');
  const drawerTotal = document.getElementById('drawer-cart-total');

  if (drawerSubtotal) drawerSubtotal.innerText = "$" + subtotal.toLocaleString();
  if (drawerTotal) drawerTotal.innerText = "$" + finalTotal.toLocaleString();

  if (!drawerItems) return;

  // Tampilan ketika keranjang kosong yang lebih modern
  if (userCart.length === 0) {
    drawerItems.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full text-center px-4 opacity-70">
        <div class="w-16 h-16 rounded-full bg-[#131622] border border-[#1e2230] flex items-center justify-center text-zinc-500 mb-4 shadow-inner">
          <i data-lucide="shopping-cart" class="w-7 h-7"></i>
        </div>
        <p class="text-sm font-bold text-white tracking-wide uppercase">Keranjang Kosong</p>
        <p class="text-[11px] text-zinc-500 mt-1">Pilih barang dari katalog persenjataan.</p>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }

  drawerItems.innerHTML = '';
  userCart.forEach((item, idx) => {
    const itemObj = vaultInventory.find(i => i.name === item.name);
    const maxStk = itemObj ? itemObj.stock : 999;

    // Desain Kartu Item Cart yang Ramping, Horizontal, dan Rapi
    drawerItems.innerHTML += `
      <div class="group flex items-center justify-between bg-[#131622]/80 hover:bg-[#161a29] p-3.5 rounded-xl border border-[#1e2230] hover:border-cyan-500/30 transition-all duration-200 shadow-sm mb-2.5">
        
        <!-- Kiri: Info Barang -->
        <div class="flex flex-col flex-grow min-w-0 pr-3">
          <h4 class="font-bold text-white text-[13px] truncate tracking-wide" title="${item.name}">${item.name}</h4>
          <span class="text-[10px] text-zinc-500 font-mono mt-0.5">$${item.unitPrice.toLocaleString()} / unit</span>
        </div>

        <!-- Kanan: Kontrol & Harga -->
        <div class="flex items-center gap-3 shrink-0">
          
          <!-- Input QTY Elegan (Model Pill) -->
          <div class="flex items-center bg-[#0e1017] border border-[#1e2230] rounded-lg p-0.5 shadow-inner">
            <button onclick="changeCartItemQty(${idx}, -1)" class="w-6 h-6 rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-white flex items-center justify-center transition">
              <i data-lucide="minus" class="w-3 h-3"></i>
            </button>
            <input type="number" value="${item.qty}" min="1" max="${maxStk}" onchange="setCartItemQty(${idx}, this.value)" class="w-7 bg-transparent text-center font-bold text-white text-[11px] focus:outline-none p-0">
            <button onclick="changeCartItemQty(${idx}, 1)" class="w-6 h-6 rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-white flex items-center justify-center transition">
              <i data-lucide="plus" class="w-3 h-3"></i>
            </button>
          </div>

          <!-- Total Harga per Item -->
          <div class="w-[60px] text-right">
            <span class="font-bold text-emerald-400 text-[13px] font-mono">$${(item.unitPrice * item.qty).toLocaleString()}</span>
          </div>

          <!-- Tombol Hapus (Muncul samar, jelas saat hover) -->
          <button onclick="removeFromCart(${idx})" class="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition opacity-50 group-hover:opacity-100" title="Hapus Barang">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `;
  });
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function applyPromoCode() {
  const codeElem = document.getElementById('promo-code-input');
  if (!codeElem) return;
  
  const code = codeElem.value.trim().toUpperCase();
  const userRank = getUserRank();

  if (code === '') {
    if (appliedDiscount > 0) {
      appliedDiscount = 0;
      appliedPromoName = '';
      showToast("VOUCHER DIHAPUS", "Penggunaan voucher telah dibatalkan.", "error");
      renderCartPageUI();
    } else {
      showToast("WARNING", "Harap masukkan kode voucher terlebih dahulu!", "error");
    }
    return;
  }

  const matchedVoucher = syndVouchers.find(v => v.code === code);

  if (!matchedVoucher) {
    appliedDiscount = 0;
    appliedPromoName = '';
    codeElem.value = '';
    showToast("VOUCHER DITOLAK", "Voucher Tidak Tersedia untuk Digunakan", "error");
    renderCartPageUI();
    return;
  }

  if (matchedVoucher.expiresAt && Date.now() > matchedVoucher.expiresAt) {
    appliedDiscount = 0;
    appliedPromoName = '';
    codeElem.value = '';
    showToast("VOUCHER EXPIRED", `Voucher ${code} sudah melewati batas waktu (Kadaluarsa)!`, "error");
    renderCartPageUI();
    return;
  }

  if (!matchedVoucher.active) {
    appliedDiscount = 0;
    appliedPromoName = '';
    codeElem.value = '';
    showToast("VOUCHER NON-AKTIF", `Voucher ${code} saat ini belum diaktifkan oleh Moderator!`, "error");
    renderCartPageUI();
    return;
  }

  if (matchedVoucher.allowed === 'don_tier' && !isDonTier(userRank)) {
    appliedDiscount = 0;
    appliedPromoName = '';
    codeElem.value = '';
    showToast("VOUCHER EKSKLUSIF", "Voucher ini khusus untuk rank Moderator, Don, Underboss & Admin!", "error");
    renderCartPageUI();
    return;
  }

  if (matchedVoucher.type === 'percent') {
    appliedDiscount = matchedVoucher.val / 100;
    appliedPromoName = `${matchedVoucher.code} (${matchedVoucher.val}%)`;
    showToast("VOUCHER AKTIF", `Diskon ${matchedVoucher.val}% berhasil diterapkan untuk ${userRank}!`, "success");
  } else {
    appliedDiscount = matchedVoucher.val;
    appliedPromoName = `${matchedVoucher.code} ($${matchedVoucher.val.toLocaleString()})`;
    showToast("VOUCHER AKTIF", `Potongan tunai $${matchedVoucher.val.toLocaleString()} berhasil diterapkan!`, "success");
  }
  renderCartPageUI();
}

function checkoutCart() {
  try {
    if (typeof isVaultLockdown !== 'undefined' && isVaultLockdown) {
      const rank = typeof getUserRank === 'function' ? getUserRank() : 'Soldiers';
      if (typeof isDonTier === 'function' && !isDonTier(rank)) {
        if (typeof showToast === 'function') showToast("VAULT LOCKDOWN", "Brangkas sedang DIKUNCI oleh Moderator! Transaksi ditangguhkan.", "error");
        return;
      }
    }

    if (!userCart || !Array.isArray(userCart) || userCart.length === 0) {
      if (typeof showToast === 'function') showToast("WARNING", "Keranjang kosong! Silakan pilih barang terlebih dahulu.", "error");
      return;
    }

    const orderId = "ORD-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    let subtotal = 0;
    userCart.forEach(i => subtotal += ((Number(i.unitPrice) || 0) * (Number(i.qty) || 1)));

    let discountNominal = 0;
    let finalSpent = subtotal;

    if (typeof appliedDiscount !== 'undefined' && appliedDiscount > 0) {
      if (appliedDiscount < 1) { 
        discountNominal = subtotal * appliedDiscount;
        finalSpent = subtotal - discountNominal;
      } else { 
        discountNominal = appliedDiscount;
        finalSpent = Math.max(0, subtotal - appliedDiscount);
      }
    }

    const activeUser = (typeof currentLoggedInUser !== 'undefined' && currentLoggedInUser) ? currentLoggedInUser : "BUYER";
    const userRank = (typeof getUserRank === 'function') ? String(getUserRank()).toUpperCase() : "SOLDIERS";
    const promoStr = (typeof appliedPromoName !== 'undefined' && appliedPromoName) ? appliedPromoName : '';

   // Tarik data profil untuk mendapatkan Nama IC
    const lowerUser = activeUser.toLowerCase();
    const icName = (typeof savedProfiles !== 'undefined' && savedProfiles[lowerUser]) 
                   ? savedProfiles[lowerUser].name 
                   : "Unknown Citizen";

    const newTx = {
      id: orderId, 
      buyer: activeUser, 
      role: userRank,
      package: "No", 
      qty: userCart.reduce((s, i) => s + (Number(i.qty) || 1), 0), 
      total: finalSpent,
      subtotal: subtotal, 
      promoName: promoStr, 
      discountAmount: discountNominal,
      processed: "Pending", 
      time: new Date().toLocaleString('en-US', { hour12: true }),
      waiting: "Just now", 
      priority: finalSpent > 50000 ? "HIGH" : "MEDIUM", 
      status: "Pending",
      items: JSON.parse(JSON.stringify(userCart)),
      
      // 👇 DATA BARU YANG DIPERLUAS 👇
      icCharacterName: icName,               // Menyimpan Nama IC pembeli
      paymentMethod: "Cash on Delivery",     // Contoh field kustom baru
      serverTimestamp: Date.now()            // Format waktu absolut untuk sorting
    };

    if (!Array.isArray(adminTransactions)) adminTransactions = [];
    adminTransactions.unshift(newTx);

    if (!Array.isArray(orgLeaderboard)) orgLeaderboard = [];
    let existingSpender = orgLeaderboard.find(s => s.name === activeUser);
    if (existingSpender) existingSpender.spent = (Number(existingSpender.spent) || 0) + finalSpent;
    else orgLeaderboard.push({ name: activeUser, role: userRank, spent: finalSpent, top: false });

    // PERBAIKAN: Persiapkan update khusus untuk stok Firebase
    const inventoryUpdates = {};
    if (!Array.isArray(vaultInventory)) vaultInventory = [];
    userCart.forEach(cartItem => {
      const invIndex = vaultInventory.findIndex(i => i.name === cartItem.name);
      if (invIndex !== -1) {
        let invItem = vaultInventory[invIndex];
        invItem.stock = Math.max(0, Number(invItem.stock) - Number(cartItem.qty));
        if (invItem.stock === 0) invItem.badge = 'OUT OF STOCK';
        else if (invItem.stock <= 5) invItem.badge = 'LOW';
        
        inventoryUpdates[`ton_global_state/vaultInventory/${invIndex}/stock`] = invItem.stock;
        inventoryUpdates[`ton_global_state/vaultInventory/${invIndex}/badge`] = invItem.badge;
      }
    });

    // KIRIM SEMUA UPDATE SPESIFIK KE SERVER FIREBASE
    if (typeof db !== 'undefined' && db) {
        const updates = { ...inventoryUpdates };
        updates['ton_global_state/adminTransactions'] = adminTransactions;
        updates['ton_global_state/orgLeaderboard'] = orgLeaderboard;
        db.ref().update(updates).catch(e => console.warn(e));
    }

    if (typeof saveAppData === 'function') saveAppData(); 

    if (typeof sendDiscordWebhook === 'function' && typeof ORDERS_WEBHOOK_URL !== 'undefined') {
        sendDiscordWebhook(ORDERS_WEBHOOK_URL, "PESANAN BARU MASUK", `Pesanan dari **${activeUser}**`, [
          { name: "Order ID", value: orderId, inline: true }, { name: "Total Payable", value: "$" + finalSpent.toLocaleString(), inline: true }
        ], 15844367);
    }

    userCart.length = 0; 
    if (typeof appliedDiscount !== 'undefined') appliedDiscount = 0;
    if (typeof appliedPromoName !== 'undefined') appliedPromoName = '';

    if (typeof renderCartPageUI === 'function') renderCartPageUI();
    if (typeof updateDashboardData === 'function') updateDashboardData();
    if (typeof renderTxProcessTable === 'function') renderTxProcessTable(true);
    if (typeof renderVaultInventory === 'function') renderVaultInventory();
    if (typeof renderReleaseOutstanding === 'function') renderReleaseOutstanding();
    if (typeof renderVaultHistory === 'function') renderVaultHistory();
    if (typeof renderLeaderboard === 'function') renderLeaderboard();
    if (typeof closeCartDrawer === 'function') closeCartDrawer();

    if (typeof showToast === 'function') showToast("ORDER PLACED", `Pesanan ID ${orderId} berhasil dikirim!`, "success");
    if (typeof switchTab === 'function') switchTab('my-orders');

  } catch (err) {
    console.error("ERROR CHKOUT:", err);
    if (typeof showToast === 'function') showToast("SYSTEM ERROR", "Terjadi kesalahan sistem. Tekan F12 (Console).", "error");
  }
}

function filterTxStatus(status) {
  activeTxStatusFilter = status; activeTxPage = 1;
  document.querySelectorAll('[id^="tx-btn-"]').forEach(btn => {
    btn.className = "bg-[#131622] text-zinc-400 border border-[#1e2230] hover:text-white px-4 py-1.5 rounded-xl transition flex items-center gap-1.5";
  });
  const activeBtn = document.getElementById('tx-btn-' + status);
  if (activeBtn) activeBtn.className = "bg-amber-500 text-black font-semibold px-4 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm";
  renderTxProcessTable();
}

function handleTxSearch(query) { activeTxSearchQuery = query.toLowerCase().trim(); activeTxPage = 1; renderTxProcessTable(); }
function handleTxSort(sortVal) { activeTxSortOrder = sortVal; activeTxPage = 1; renderTxProcessTable(); }
function handleTxItemFilter(itemVal) { activeTxItemFilter = itemVal; activeTxPage = 1; renderTxProcessTable(); }
function handleTxPerPage(perPageVal) { activeTxPerPage = parseInt(perPageVal) || 10; activeTxPage = 1; renderTxProcessTable(); }
function changeTxPage(delta) { activeTxPage += delta; renderTxProcessTable(); }

function calculateWaitingDuration(timeStr) {
  if (!timeStr) return "Just now";
  const orderTime = new Date(timeStr.replace(' ', 'T')).getTime();
  if (isNaN(orderTime)) return "Just now";
  const diffMs = Date.now() - orderTime;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function renderTxProcessTable(isRefresh = false) {
  const table = document.getElementById('transaction-process-table');
  if (!table) return;
  if (isRefresh) {
    const refreshTimeElem = document.getElementById('tx-refreshed-time');
    if (refreshTimeElem) refreshTimeElem.innerText = new Date().toLocaleTimeString('en-US');
  }

  const counts = { Pending: 0, "Waiting Release": 0, Released: 0, Approved: 0, Rejected: 0 };
  adminTransactions.forEach(tx => { 
    if (counts[tx.status] !== undefined) counts[tx.status]++;
    tx.waiting = calculateWaitingDuration(tx.time);
  });
  
  Object.keys(counts).forEach(key => {
    const countElem = document.getElementById('count-' + key);
    if (countElem) countElem.innerText = counts[key];
  });
  const pendTodayElem = document.getElementById('tx-pending-today-count');
  if (pendTodayElem) pendTodayElem.innerText = counts.Pending;

  let filtered = adminTransactions.filter(tx => {
    if (activeTxStatusFilter !== 'All' && tx.status !== activeTxStatusFilter) return false;
    if (activeTxSearchQuery) {
      const matchId = tx.id.toLowerCase().includes(activeTxSearchQuery);
      const matchBuyer = tx.buyer.toLowerCase().includes(activeTxSearchQuery);
      if (!matchId && !matchBuyer) return false;
    }
    if (activeTxItemFilter !== 'all') {
      const hasItem = tx.items && tx.items.some(i => i.name.toLowerCase() === activeTxItemFilter.toLowerCase());
      if (!hasItem && tx.package !== activeTxItemFilter) return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    if (activeTxSortOrder === 'newest') return b.id.localeCompare(a.id);
    if (activeTxSortOrder === 'oldest') return a.id.localeCompare(b.id);
    if (activeTxSortOrder === 'highest') return b.total - a.total;
    if (activeTxSortOrder === 'lowest') return a.total - b.total;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / activeTxPerPage));
  if (activeTxPage > totalPages) activeTxPage = totalPages;
  if (activeTxPage < 1) activeTxPage = 1;

  const startIndex = (activeTxPage - 1) * activeTxPerPage;
  const paginatedData = filtered.slice(startIndex, startIndex + activeTxPerPage);

  const curPageElem = document.getElementById('tx-current-page-num');
  const totPageElem = document.getElementById('tx-total-page-num');
  const prevBtn = document.getElementById('tx-btn-prev');
  const nextBtn = document.getElementById('tx-btn-next');
  if (curPageElem) curPageElem.innerText = activeTxPage;
  if (totPageElem) totPageElem.innerText = totalPages;
  if (prevBtn) prevBtn.disabled = (activeTxPage === 1);
  if (nextBtn) nextBtn.disabled = (activeTxPage === totalPages || totalPages === 1);

  table.innerHTML = '';
  if (paginatedData.length === 0) {
    table.innerHTML = `<tr><td colspan="12" class="p-8 text-center text-zinc-500 italic">No transactions found matching your filter criteria.</td></tr>`;
    return;
  }

  const userRank = getUserRank();
  const isWritable = isBisnisTier(userRank);
  const isTop = isTopAdmin(userRank);

  paginatedData.forEach(tx => {
    const prioColor = tx.priority === 'HIGH' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    const statColor = tx.status === 'Released' || tx.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : (tx.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500 text-black font-semibold');

    let actionButtonsHtml = `<button onclick="openTxDetailModal('${tx.id}')" class="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition" title="View Detail"><i data-lucide="eye" class="w-3.5 h-3.5"></i></button>`;
    
    // KUNCI PERBAIKAN: Sembunyikan tombol Approve & Reject jika pesanan sudah masuk antrean Release atau selesai
    if (isWritable) {
      if (tx.status === 'Pending') {
        actionButtonsHtml += `
          <button onclick="quickApproveTx('${tx.id}')" class="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-lg transition ml-1" title="Approve & Send to Release Queue"><i data-lucide="check" class="w-3.5 h-3.5"></i></button>
          <button onclick="quickRejectTx('${tx.id}')" class="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition ml-1" title="Reject & Refund"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
        `;
      } else if (tx.status === 'Rejected' && isTop) {
        // Tombol hapus permanen tetap muncul jika statusnya Rejected (khusus Top Admin)
        actionButtonsHtml += `
          <button onclick="quickRejectTx('${tx.id}')" class="p-1.5 bg-zinc-500/10 text-zinc-400 hover:bg-red-600 hover:text-white rounded-lg transition ml-1" title="Delete Permanently"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
        `;
      }
    }

    let voucherBadgeHtml = '';
    if (tx.promoName) {
      voucherBadgeHtml = `<span class="block text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-1.5 py-0.5 rounded-md mt-1 w-max" title="Voucher Diskon Applied"><i data-lucide="ticket" class="w-2.5 h-2.5 inline mr-0.5"></i> ${tx.promoName}</span>`;
    }

    table.innerHTML += `
      <tr class="hover:bg-white/[0.02] transition border-b border-[#1e2230] last:border-0">
        <td class="p-4 font-mono text-zinc-300 font-semibold">${tx.id}</td>
        <td class="p-4 font-semibold text-white flex items-center gap-2"><i data-lucide="user" class="w-3.5 h-3.5 text-zinc-500"></i> ${tx.buyer}</td>
        <td class="p-3.5"><span class="px-2.5 py-0.5 bg-[#131622] border border-[#1e2230] text-zinc-300 rounded-full text-[10px] font-semibold uppercase">${tx.role}</span></td>
        <td class="p-4 text-zinc-400">${tx.package}</td>
        <td class="p-4 font-semibold text-white">${tx.qty}</td>
        <td class="p-4">
          <span class="font-bold text-amber-400 text-sm block">$${tx.total.toLocaleString()}</span>
          ${voucherBadgeHtml}
        </td>
        <td class="p-4 text-zinc-300">${tx.processed}</td>
        <td class="p-4 font-mono text-zinc-400 text-[11px]">${tx.time}</td>
        <td class="p-4 text-amber-400 font-semibold font-mono">${tx.waiting}</td>
        <td class="p-4"><span class="px-2.5 py-0.5 text-[10px] font-semibold rounded-full uppercase ${prioColor}">${tx.priority}</span></td>
        <td class="p-4"><span class="px-2.5 py-0.5 text-[10px] font-semibold rounded-full uppercase ${statColor}">${tx.status}</span></td>
        <td class="p-4 text-right whitespace-nowrap">${actionButtonsHtml}</td>
      </tr>
    `;
  });
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

let currentModalTxId = null;
function openTxDetailModal(txId) {
  const tx = adminTransactions.find(t => t.id === txId);
  if (!tx) return;
  currentModalTxId = txId;
  document.getElementById('modal-tx-id').innerText = `Transaction Detail — ${tx.id}`;
  document.getElementById('modal-tx-buyer').innerText = tx.buyer;
  document.getElementById('modal-tx-role').innerText = tx.role;
  document.getElementById('modal-tx-date').innerText = tx.time;
  document.getElementById('modal-tx-duration').innerText = tx.waiting;
  
  const subElem = document.getElementById('modal-tx-subtotal');
  const vouElem = document.getElementById('modal-tx-voucher');
  if (subElem) subElem.innerText = "$" + (tx.subtotal ? tx.subtotal.toLocaleString() : tx.total.toLocaleString());
  if (vouElem) {
    if (tx.promoName) {
      vouElem.innerHTML = `${tx.promoName} <span class="text-red-400 font-mono">[- $${tx.discountAmount ? tx.discountAmount.toLocaleString() : '0'}]</span>`;
      vouElem.className = "font-tech font-bold text-purple-400";
    } else {
      vouElem.innerText = "None (No Voucher Used)";
      vouElem.className = "font-mono text-zinc-500 text-[11px]";
    }
  }

  document.getElementById('modal-tx-total').innerText = `$${tx.total.toLocaleString()}`;
  document.getElementById('modal-tx-profit').innerText = `$${Math.round(tx.total * 0.05).toLocaleString()}`;

  const itemsContainer = document.getElementById('modal-tx-items');
  itemsContainer.innerHTML = '';
  tx.items.forEach(i => {
    itemsContainer.innerHTML += `
      <div class="flex justify-between items-center py-1.5 border-b border-[#1e2230] last:border-0">
        <span class="text-white font-medium">${i.name}</span>
        <span class="text-zinc-400">x${i.qty}</span>
        <span class="text-zinc-400 font-mono">$${i.unitPrice ? i.unitPrice.toLocaleString() : i.price.toLocaleString()}</span>
        <span class="text-amber-400 font-bold font-mono">$${(i.qty * (i.unitPrice || i.price)).toLocaleString()}</span>
      </div>
    `;
  });

  const modalActions = document.getElementById('modal-action-buttons');
  if (modalActions) {
    const isFinalized = ['Released', 'Approved', 'Rejected'].includes(tx.status);
    modalActions.style.display = (isBisnisTier(getUserRank()) && (!isFinalized || isTopAdmin(getUserRank()))) ? 'grid' : 'none';
  }

  document.getElementById('tx-detail-modal').classList.remove('hidden');
}

function closeTxDetailModal() { document.getElementById('tx-detail-modal').classList.add('hidden'); }
function approveModalOrder() { if (currentModalTxId) quickApproveTx(currentModalTxId); closeTxDetailModal(); }
function rejectModalOrder() { if (currentModalTxId) quickRejectTx(currentModalTxId); closeTxDetailModal(); }

function quickApproveTx(txId) {
  const userRank = getUserRank();
  if (!isBisnisTier(userRank)) { 
    showToast("ACCESS DENIED", "Read-Only mode cannot validate orders!", "error"); 
    return; 
  }
  
  const txIndex = adminTransactions.findIndex(t => t.id === txId);
  if (txIndex !== -1) {
    const tx = adminTransactions[txIndex];
    const isFinalized = ['Released', 'Approved', 'Rejected'].includes(tx.status);
    
    if (isFinalized && !isBisnisTier(userRank)) {
      showToast("ACCESS DENIED", "You do not have permission to modify completed transactions!", "error");
      return;
    }

    // Pindah ke Antrean Release
    if (tx.status === 'Pending') {
      tx.status = 'Waiting Release';
      tx.processed = currentLoggedInUser || 'ADMIN';
    } 
    // Pencairan dari Antrean Release -> Masuk Brangkas
    else if (tx.status === 'Waiting Release') {
      vaultBalance += tx.total;
      tx.status = 'Released'; 
      tx.processed = currentLoggedInUser || 'ADMIN'; 
    }

    // KUNCI PERBAIKAN: Sinkronisasi Multipel ke Firebase Secara Bersamaan
    if (typeof db !== 'undefined' && db) {
        const updates = {};
        updates['ton_global_state/adminTransactions'] = adminTransactions;
        updates['ton_global_state/vaultBalance'] = vaultBalance;
        db.ref().update(updates);
    }

    // Simpan lokal dan paksa render semua komponen UI Keuangan
    saveAppData();
    updateDashboardData(); 
    
    showToast("PROCESSED", `TXID ${tx.id} berhasil diproses!`, "success");
  }
}

function quickRejectTx(txId) {
  const userRank = getUserRank();
  if (!isBisnisTier(userRank)) {
    showToast("ACCESS DENIED", "Read-Only mode cannot reject orders!", "error");
    return;
  }

  const txIndex = adminTransactions.findIndex(t => t.id === txId);
  if (txIndex === -1) {
    showToast("ERROR", "Transaction not found!", "error");
    return;
  }

  const tx = adminTransactions[txIndex];

  // ==========================================
  // FITUR HAPUS PERMANEN (JIKA SUDAH REJECTED)
  // ==========================================
  if (tx.status === 'Rejected') {
    if (!isTopAdmin(userRank)) {
      showToast("ACCESS DENIED", "Hanya Moderator yang berhak menghapus riwayat permanen!", "error");
      return;
    }
    showCustomConfirm("HAPUS PERMANEN", `Hapus riwayat pesanan ${tx.id} secara permanen?`, () => {
      adminTransactions.splice(txIndex, 1);
      
      if (typeof db !== 'undefined' && db) {
        db.ref('ton_global_state/adminTransactions').set(adminTransactions);
      }
      
      if (typeof saveAppData === 'function') saveAppData(); 
      if (typeof updateDashboardData === 'function') updateDashboardData();
      if (typeof renderTxProcessTable === 'function') renderTxProcessTable(true);
      
      showToast("DELETED", "Riwayat pesanan berhasil dihapus permanen.", "success");
    });
    return;
  }

  const isFinalized = ['Released', 'Approved', 'Rejected'].includes(tx.status);
  if (isFinalized && !isTopAdmin(userRank)) {
    showToast("ACCESS DENIED", "You do not have permission to modify completed transactions!", "error");
    return;
  }

  // ==========================================
  // FITUR TOLAK PESANAN
  // ==========================================
  showCustomConfirm("REJECT ORDER", `Tolak pesanan ${tx.id} dari ${tx.buyer}? Stok akan dikembalikan.`, () => {
    try {
        // 1. Kembalikan stok ke Vault
        if (tx.items && Array.isArray(tx.items)) {
          tx.items.forEach(cartItem => {
            const invIndex = vaultInventory.findIndex(i => i.name === cartItem.name);
            if (invIndex !== -1) {
              vaultInventory[invIndex].stock += cartItem.qty;
              if (vaultInventory[invIndex].stock > 5) vaultInventory[invIndex].badge = 'NORMAL';
              else if (vaultInventory[invIndex].stock > 0) vaultInventory[invIndex].badge = 'LOW';
            }
          });
        }

        // 2. Kurangi rekap pengeluaran warga di Leaderboard
        let spenderIndex = orgLeaderboard.findIndex(s => s.name === tx.buyer);
        if (spenderIndex !== -1) {
          orgLeaderboard[spenderIndex].spent -= tx.total;
          if (orgLeaderboard[spenderIndex].spent <= 0) {
             orgLeaderboard.splice(spenderIndex, 1); 
          }
        }

        // 3. Ubah status secara lokal
        tx.status = 'Rejected';
        tx.processed = currentLoggedInUser || 'ADMIN';

        // 4. Paksa update ke Firebase secara akurat & spesifik
        if (typeof db !== 'undefined' && db) {
            // Tembak update status hanya pada index pesanan ini saja
            db.ref('ton_global_state/adminTransactions/' + txIndex).update({
                status: 'Rejected',
                processed: tx.processed
            });
            // Update sinkronisasi inventaris dan uang
            db.ref('ton_global_state/vaultInventory').set(vaultInventory);
            db.ref('ton_global_state/orgLeaderboard').set(orgLeaderboard);
        }

        // 5. Simpan dan Segarkan Tampilan (WAJIB PAKAI TRUE)
        if (typeof saveAppData === 'function') saveAppData(); 
        if (typeof updateDashboardData === 'function') updateDashboardData();
        if (typeof renderTxProcessTable === 'function') renderTxProcessTable(true);

        showToast("ORDER REJECTED", `Pesanan ${tx.id} ditolak dan statistik uang di-update.`, "error");
    } catch (err) {
        console.error("Gagal menolak pesanan:", err);
        showToast("ERROR", "Sistem gagal memproses penolakan. Cek console.", "error");
    }
  });
}

function releaseAllOutstanding() {
  if (!isBisnisTier(getUserRank())) { showToast("ACCESS DENIED", "Mode Read-Only tidak dapat merilis saldo!", "error"); return; }
  
  const waitingReleaseTx = adminTransactions.filter(t => t.status === 'Waiting Release');
  if (waitingReleaseTx.length === 0) { showToast("WARNING", "Tidak ada pesanan dengan status Waiting Release!", "error"); return; }
  
  showCustomConfirm("Release all balances", `Otentikasi dan rilis total ${waitingReleaseTx.length} pesanan ke dalam kas brangkas?`, () => {
    let totalReleasedCash = 0;
    
    // Proses semua antrean sekaligus
    waitingReleaseTx.forEach(tx => {
      tx.status = 'Released';
      tx.processed = currentLoggedInUser || 'ADMIN';
      vaultBalance += tx.total;
      totalReleasedCash += tx.total;
    });

    // KUNCI PERBAIKAN: Sinkronisasi Multipel ke Firebase Secara Bersamaan
    if (typeof db !== 'undefined' && db) {
        const updates = {};
        updates['ton_global_state/adminTransactions'] = adminTransactions;
        updates['ton_global_state/vaultBalance'] = vaultBalance;
        db.ref().update(updates);
    }

    // Simpan lokal dan paksa render semua komponen UI Keuangan
    saveAppData();
    updateDashboardData();
    
    sendDiscordWebhook(ORDERS_WEBHOOK_URL, "🟢 MASS SALDO RELEASED", `Sebanyak **${waitingReleaseTx.length} pesanan** telah dirilis oleh **${currentLoggedInUser.toUpperCase()}**. Total saldo **$${totalReleasedCash.toLocaleString()}** masuk ke brangkas!`, [], 3066993);
    showToast("SUCCESS", `Berhasil merilis ${waitingReleaseTx.length} pesanan sebesar $${totalReleasedCash.toLocaleString()} ke Brangkas!`, "success");
  });
}
function filterVaultInventory(category) {
  activeInventoryFilter = category;
  document.querySelectorAll('#vault-inventory-filters button').forEach(btn => {
    btn.className = 'cat-btn-inv bg-[#131622] text-zinc-400 border border-[#1e2230] hover:text-white px-4 py-2 rounded-xl transition text-xs';
  });
  const activeBtn = document.getElementById('inv-btn-' + category);
  if (activeBtn) {
    activeBtn.className = 'cat-btn-inv bg-red-600 text-white px-4 py-2 rounded-xl transition shadow-sm text-xs';
  } else if (event && event.currentTarget) {
    event.currentTarget.className = 'cat-btn-inv bg-red-600 text-white px-4 py-2 rounded-xl transition shadow-sm text-xs';
  }
  renderVaultInventory();
}

function renderVaultInventory() {
  try {
    const grid = document.getElementById('vault-inventory-grid') || document.getElementById('inventory-grid') || document.getElementById('logs-inventory-grid');
    if (!grid || typeof vaultInventory === 'undefined') return;
    
    const activeFilter = typeof activeInventoryFilter !== 'undefined' ? activeInventoryFilter : 'all';
    
    const filteredItems = vaultInventory.filter(item => {
      if (!item) return false;
      const itemCat = String(item.cat || 'weapon').toLowerCase();
      if (activeFilter === 'all') return true;
      if (activeFilter === 'weapon') return itemCat === 'weapon';
      if (activeFilter === 'ammo') return itemCat === 'ammo';
      if (activeFilter === 'vest') return itemCat === 'vest';
      if (activeFilter === 'durgs') return itemCat === 'durgs' || itemCat === 'package';
      if (activeFilter === 'attachments') return itemCat === 'attachments' || itemCat.includes('attach');
      if (activeFilter === 'tool-heist') return itemCat === 'tool-heist';
      return true;
    });
    
    const countElem = document.getElementById('total-inventory-count');
    if (countElem) countElem.innerText = filteredItems.length;
    
    grid.innerHTML = '';
    if (filteredItems.length === 0) {
      grid.innerHTML = `<div class="col-span-full py-12 text-center text-zinc-500 italic"><i data-lucide="box" class="w-8 h-8 mx-auto mb-2 opacity-30"></i>Belum ada barang di kategori ini.</div>`;
      if (typeof lucide !== 'undefined') lucide.createIcons(); return;
    }

    const isWritable = ['Admin', 'Moderator', 'Don', 'Underboss', 'Bisnis'].includes(typeof getUserRank === 'function' ? getUserRank() : 'Admin');

    filteredItems.forEach((item) => {
      const originalIdx = vaultInventory.indexOf(item);
      const badge = String(item.badge || 'NORMAL').toUpperCase();
      const isComingSoon = badge === 'COMING SOON' || badge === 'COMING_SOON';
      
      let badgeStyle = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      if (isComingSoon) badgeStyle = 'bg-pink-500/10 text-pink-500 border border-pink-500/30 font-bold';
      else if (badge === 'OUT OF STOCK') badgeStyle = 'bg-red-500/10 text-red-500 border border-red-500/20';
      else if (badge === 'LOW') badgeStyle = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      
      let stockButtonsHtml = '';
      if (isWritable) {
        stockButtonsHtml = `
          <button onclick="changeStock(${originalIdx}, -1)" class="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-600 hover:text-white flex items-center justify-center transition font-bold shrink-0" title="Kurangi Stok">-</button>
          <button onclick="changeStock(${originalIdx}, 1)" class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition font-bold shrink-0" title="Tambah Stok">+</button>
          <button onclick="openEditItemModal(${originalIdx})" class="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600 hover:text-white flex items-center justify-center transition ml-0.5 shrink-0" title="Edit Item Details"><i data-lucide="edit-3" class="w-3.5 h-3.5"></i></button>
          <button onclick="deleteInventoryItem(${originalIdx})" class="w-7 h-7 rounded-lg bg-[#131622] hover:bg-red-600 text-zinc-400 hover:text-white flex items-center justify-center transition ml-0.5 border border-[#1e2230] shrink-0" title="Hapus Barang Permanen"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
        `;
      }

      grid.innerHTML += `
        <div class="bg-[#0e1017] border border-[#1e2230] rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-500 transition shadow-sm">
          <div>
            <div class="h-36 bg-[#131622] rounded-xl border border-[#1e2230] flex items-center justify-center overflow-hidden mb-5 p-3 relative group">
              <img src="${item.img || ''}" alt="${item.name || ''}" class="h-full object-contain group-hover:scale-105 transition duration-300">
            </div>
            <div class="flex items-center justify-between gap-2 pt-1 mb-2">
              <h3 class="font-bold text-white text-base truncate leading-relaxed">${item.name || 'Unnamed Item'} <span class="px-2 py-0.5 bg-[#131622] border border-[#1e2230] text-zinc-400 text-[10px] rounded-md ml-1.5 align-middle">${String(item.cat || 'item').toUpperCase()}</span></h3>
              <span class="px-2.5 py-1 text-[9px] font-bold rounded-full uppercase shrink-0 ${badgeStyle}">${badge === 'NORMAL' ? 'NORMAL' : badge}</span>
            </div>
            <p class="text-xs text-zinc-400 line-clamp-2 min-h-[32px] mt-2 leading-relaxed">${item.desc || ''}</p>
          </div>
          
          <div class="border-t border-[#1e2230] pt-3 mt-4 space-y-3">
            <div class="w-full bg-[#131622]/60 p-2.5 rounded-xl border border-[#1e2230]">
              <span class="text-[10px] text-zinc-500 block uppercase tracking-wider font-semibold">Selling / Base Price</span>
              <div class="flex items-baseline gap-1.5 flex-wrap mt-0.5">
                <span class="text-lg font-bold font-tech text-amber-400 break-all leading-none">$${Number(item.price || 0).toLocaleString()}</span>
                <span class="text-xs text-zinc-500 font-mono">($${Number(item.base || item.price || 0).toLocaleString()})</span>
              </div>
            </div>

            <div class="flex items-center justify-between gap-2 pt-0.5">
              <div class="flex items-center gap-1.5 bg-[#131622] px-2.5 py-1.5 rounded-xl border border-[#1e2230]">
                <span class="text-[10px] text-zinc-400 uppercase font-semibold">Stock:</span>
                <span class="text-sm font-bold text-white font-mono leading-none">${Number(item.stock || 0)}</span>
              </div>
              <div class="flex items-center gap-1 shrink-0 ml-auto">
                ${stockButtonsHtml}
              </div>
            </div>
          </div>
        </div>
      `;
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
  } catch (err) {
    console.error("Error renderVaultInventory:", err);
  }
}

function changeStock(index, delta) {
  if (!isBisnisTier(getUserRank())) return;
  if (vaultInventory[index]) {
    vaultInventory[index].stock = Math.max(0, vaultInventory[index].stock + delta);
    if (vaultInventory[index].stock === 0) vaultInventory[index].badge = 'OUT OF STOCK';
    else if (vaultInventory[index].stock <= 5) vaultInventory[index].badge = 'LOW';
    else vaultInventory[index].badge = 'NORMAL';
    
    saveAppData();
    renderVaultInventory();
    renderMarketplace(currentMarketplaceFilter);
  }
}

function deleteInventoryItem(index) {
  if (!isBisnisTier(getUserRank())) {
    showToast("ACCESS DENIED", "Your rank does not have permission to delete items!", "error");
    return;
  }
  if (vaultInventory[index]) {
    const itemName = vaultInventory[index].name;
    showCustomConfirm("DELETE ITEM", `Are you sure you want to permanently delete [${itemName}] from the catalog?`, () => {
      vaultInventory.splice(index, 1);
      saveAppData();
      renderVaultInventory();
      renderMarketplace(currentMarketplaceFilter);
      showToast("ITEM DELETED", `Item [${itemName}] has been removed from the system!`, "error");
    });
  }
}

function addNewInventoryItem() {
  if (!isBisnisTier(getUserRank())) { 
    showToast("ACCESS DENIED", "Mode Read-Only tidak dapat menambah barang!", "error"); 
    return; 
  }
  openAddItemModal();
}

function openAddItemModal() {
  const modal = document.getElementById('add-item-modal');
  if (modal) {
    document.getElementById('new-item-name').value = '';
    document.getElementById('new-item-price').value = '';
    document.getElementById('new-item-base').value = '';
    document.getElementById('new-item-stock').value = '10';
    document.getElementById('new-item-img-url').value = '';
    document.getElementById('new-item-desc').value = '';
    if (document.getElementById('new-item-file')) document.getElementById('new-item-file').value = '';
    newItemUploadedBase64 = '';
    
    modal.classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

function closeAddItemModal() {
  const modal = document.getElementById('add-item-modal');
  if (modal) modal.classList.add('hidden');
}

window.tonUploadImgBase64 = window.tonUploadImgBase64 || '';
window.tonMarketSearch = window.tonMarketSearch || '';
window.tonMarketSort = window.tonMarketSort || 'name_asc';

function handleNewItemImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const maxDim = 400; let width = img.width; let height = img.height;
      if (width > height) { if (width > maxDim) { height = Math.round((height * maxDim) / width); width = maxDim; } }
      else { if (height > maxDim) { width = Math.round((width * maxDim) / height); height = maxDim; } }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      window.tonUploadImgBase64 = canvas.toDataURL('image/jpeg', 0.75);
      if (typeof showToast === 'function') showToast("IMAGE READY", "Foto barang siap disimpan!", "success");
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function submitNewItem() {
  try {
    const nameInput = document.getElementById('new-item-name');
    const priceInput = document.getElementById('new-item-price');
    
    if (!nameInput || !priceInput) { 
      if (typeof showToast === 'function') showToast("ERROR", "Form input tidak ditemukan!", "error"); 
      return; 
    }

    const name = nameInput.value.trim();
    const cat = document.getElementById('new-item-cat')?.value || 'weapon';
    const price = parseInt(priceInput.value) || 0;
    const base = parseInt(document.getElementById('new-item-base')?.value) || price;
    let stock = parseInt(document.getElementById('new-item-stock')?.value) || 0;
    const restricted = document.getElementById('new-item-restricted')?.value === 'true';
    const desc = document.getElementById('new-item-desc')?.value.trim() || 'Custom Syndicate Armory Item';
    const urlImg = document.getElementById('new-item-img-url')?.value.trim();
    const statusVal = document.getElementById('new-item-status')?.value || 'ready';
    
    const finalImg = window.tonUploadImgBase64 || urlImg;

    if (!name) { if (typeof showToast === 'function') showToast("WARNING", "Nama barang wajib diisi!", "error"); return; }
    if (price <= 0) { if (typeof showToast === 'function') showToast("WARNING", "Harga jual harus lebih dari 0!", "error"); return; }
    if (!finalImg) { if (typeof showToast === 'function') showToast("PHOTO MANDATORY", "Wajib upload foto atau masukkan URL gambar!", "error"); return; }

    let badgeVal = "NORMAL";
    if (statusVal === 'coming_soon') {
      badgeVal = "COMING SOON";
      stock = 0;
    } else if (stock <= 0) {
      badgeVal = "OUT OF STOCK";
    } else if (stock <= 5) {
      badgeVal = "LOW";
    }

    vaultInventory.unshift({
      name: name, cat: cat, badge: badgeVal, desc: desc,
      price: price, base: base, stock: stock,
      img: finalImg, restricted: restricted
    });

    if (typeof saveAppData === 'function') saveAppData(); 
    
    renderVaultInventory(); 
    const activeFilter = typeof currentMarketplaceFilter !== 'undefined' ? currentMarketplaceFilter : 'all';
    renderMarketplace(activeFilter);
    
    if (typeof closeAddItemModal === 'function') closeAddItemModal();
    if (typeof showToast === 'function') showToast("ITEM ADDED", `${name} berhasil ditambahkan!`, "success");
  } catch (err) {
    console.error("Error submitNewItem:", err);
    if (typeof closeAddItemModal === 'function') closeAddItemModal();
  }
}

var currentEditItemIndex = null;
var editItemUploadedBase64 = '';

function openEditItemModal(index) {
  if (!isBisnisTier(getUserRank())) { 
    showToast("ACCESS DENIED", "Mode Read-Only tidak dapat mengedit barang!", "error"); 
    return; 
  }
  const item = vaultInventory[index];
  if (!item) {
    showToast("ERROR", "Data barang tidak ditemukan di memori!", "error");
    return;
  }

  const modal = document.getElementById('edit-item-modal');
  if (!modal) { 
    showToast("ERROR HTML", "Kode Modal Edit belum dipasang di index.html!", "error"); 
    return; 
  }

  currentEditItemIndex = index;
  editItemUploadedBase64 = ''; 

  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };

  setVal('edit-item-name', item.name || '');
  setVal('edit-item-cat', item.cat || 'weapon');
  setVal('edit-item-price', item.price || 0);
  setVal('edit-item-base', item.base || 0);
  setVal('edit-item-stock', item.stock || 0);
  setVal('edit-item-restricted', String(Boolean(item.restricted)));
  setVal('edit-item-desc', item.desc || '');
  setVal('edit-item-img-url', '');
  
  const isComingSoon = (item.badge === 'COMING SOON' || item.badge === 'COMING_SOON');
  const statusSelect = document.getElementById('edit-item-status');
  if (statusSelect) {
    statusSelect.value = isComingSoon ? 'coming_soon' : 'ready';
  }

  if (document.getElementById('edit-item-file')) document.getElementById('edit-item-file').value = '';

  modal.classList.remove('hidden');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeEditItemModal() {
  const modal = document.getElementById('edit-item-modal');
  if (modal) modal.classList.add('hidden');
  currentEditItemIndex = null;
}

function handleEditItemImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const maxDim = 400; let width = img.width; let height = img.height;
      if (width > height) { if (width > maxDim) { height = Math.round((height * maxDim) / width); width = maxDim; } }
      else { if (height > maxDim) { width = Math.round((width * maxDim) / height); height = maxDim; } }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      editItemUploadedBase64 = canvas.toDataURL('image/jpeg', 0.75);
      showToast("IMAGE READY", "Foto baru siap disimpan!", "success");
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function submitEditItem() {
  if (currentEditItemIndex === null || currentEditItemIndex === undefined) {
    showToast("ERROR SISTEM", "Sesi edit terputus! Harap tutup modal dan klik tombol ikon pensil lagi.", "error");
    return;
  }
  
  const item = vaultInventory[currentEditItemIndex];
  if (!item) {
    showToast("ERROR SISTEM", "Data barang tidak ditemukan pada indeks ke-" + currentEditItemIndex, "error");
    return;
  }

  const nameInput = document.getElementById('edit-item-name');
  if (!nameInput) {
    showToast("ERROR HTML", "Input ID 'edit-item-name' tidak ditemukan!", "error");
    return;
  }

  const name = nameInput.value.trim();
  const cat = document.getElementById('edit-item-cat')?.value || 'weapon';
  const price = parseInt(document.getElementById('edit-item-price')?.value) || 0;
  const base = parseInt(document.getElementById('edit-item-base')?.value) || price;
  let stock = parseInt(document.getElementById('edit-item-stock')?.value) || 0;
  const restricted = document.getElementById('edit-item-restricted')?.value === 'true';
  const desc = document.getElementById('edit-item-desc')?.value.trim() || 'Custom Syndicate Armory Item';
  const urlImg = document.getElementById('edit-item-img-url')?.value.trim();
  
  const statusSelect = document.getElementById('edit-item-status');
  const statusVal = statusSelect ? statusSelect.value : 'ready';

  if (!name) { showToast("WARNING", "Nama barang tidak boleh kosong!", "error"); return; }
  if (price <= 0) { showToast("WARNING", "Harga jual harus lebih dari 0!", "error"); return; }

  const oldImg = item.img;
  const finalImg = editItemUploadedBase64 || urlImg || oldImg;

  let badgeVal = "NORMAL";
  if (statusVal === 'coming_soon') {
    badgeVal = "COMING SOON";
    stock = 0; 
  } else if (stock <= 0) {
    badgeVal = "OUT OF STOCK";
  } else if (stock <= 5) {
    badgeVal = "LOW";
  }

  vaultInventory[currentEditItemIndex] = {
    name: name, cat: cat, badge: badgeVal, desc: desc,
    price: price, base: base, stock: stock,
    img: finalImg, restricted: restricted
  };

  saveAppData(); 
  renderVaultInventory(); 
  renderMarketplace(currentMarketplaceFilter);
  closeEditItemModal();
  showToast("ITEM UPDATED", `Barang [${name}] berhasil diperbarui menjadi ${badgeVal}!`, "success");
}

function renderReleaseOutstanding() {
  const table = document.getElementById('release-outstanding-table');
  if (!table) return;

  // HANYA ambil pesanan yang ada di antrean "Waiting Release"
  const waitingTx = adminTransactions.filter(t => t.status === 'Waiting Release');
  const totalOutstanding = waitingTx.reduce((sum, tx) => sum + tx.total, 0);

  // KUNCI PERBAIKAN: Menyamakan ID elemen dengan yang ada di file HTML
  const totalElem = document.getElementById('out-total-held');
  if (totalElem) totalElem.innerText = "$" + totalOutstanding.toLocaleString();

  // Memperbarui semua lencana angka merah/kuning di sidebar maupun dasbor
  const waitingCounts = document.querySelectorAll('#out-waiting-count, #outstanding-count');
  waitingCounts.forEach(el => {
    el.innerText = waitingTx.length;
  });

  const canRelease = isBisnisTier(getUserRank());
  const releaseBtn = document.getElementById('release-all-btn') || document.querySelector('button[onclick="releaseAllOutstanding()"]');
  if (releaseBtn) {
    releaseBtn.style.display = canRelease && waitingTx.length > 0 ? 'inline-flex' : 'none';
  }

  if (waitingTx.length === 0) {
    table.innerHTML = `<tr><td colspan="8" class="p-8 text-center text-zinc-500 italic">No transactions are awaiting release at this time.</td></tr>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }

  table.innerHTML = '';
  waitingTx.forEach(tx => {
    const itemNames = tx.items ? tx.items.map(i => `${i.name} (x${i.qty})`).join(", ") : `${tx.qty} items`;
    
    const actionBtn = canRelease
      ? `<button onclick="quickApproveTx('${tx.id}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5">
          <i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> Release Now
        </button>`
      : `<span class="text-[10px] text-zinc-500 italic">Read Only</span>`;

    table.innerHTML += `
      <tr class="hover:bg-white/[0.02] transition border-b border-[#1e2230] last:border-0">
        <td class="p-3.5"><input type="checkbox" class="rounded bg-zinc-800 border-[#1e2230]" disabled></td>
        <td class="p-3.5 font-mono text-zinc-400 text-[11px]">${tx.time}</td>
        <td class="p-3.5 font-mono text-white font-bold text-xs">${tx.id}</td>
        <td class="p-3.5 font-bold text-white flex items-center gap-2"><i data-lucide="user" class="w-3.5 h-3.5 text-zinc-500"></i> ${tx.buyer}</td>
        <td class="p-3.5 text-zinc-300 max-w-xs truncate" title="${itemNames}">${itemNames}</td>
        <td class="p-3.5"><span class="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase rounded-full">${tx.processed}</span></td>
        <td class="p-3.5 font-bold text-amber-400">$${tx.total.toLocaleString()}</td>
        <td class="p-3.5 text-right">${actionBtn}</td>
      </tr>
    `;
  }); 
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderVaultHistory(isRefresh = false) {
  const table = document.getElementById('vault-history-table');
  if (!table) return;

  let totalInflow = 0;
  let completedCount = 0;
  let rejectedCount = 0;

  adminTransactions.forEach(tx => {
    if (tx.status === 'Approved' || tx.status === 'Released') {
      totalInflow += tx.total;
      completedCount++;
    } else if (tx.status === 'Rejected') {
      rejectedCount++;
    }
  });

  const inflowElem = document.getElementById('hist-total-inflow');
  const countElem = document.getElementById('hist-total-count');
  const rejElem = document.getElementById('hist-total-rejected');
  if (inflowElem) inflowElem.innerText = "$" + totalInflow.toLocaleString();
  if (countElem) countElem.innerText = completedCount;
  if (rejElem) rejElem.innerText = rejectedCount;

  const searchQuery = document.getElementById('hist-search-input')?.value.toLowerCase().trim() || '';
  const statusFilter = document.getElementById('hist-status-filter')?.value || 'ALL';

  const filtered = adminTransactions.filter(tx => {
    if (statusFilter !== 'ALL' && tx.status !== statusFilter) return false;
    if (searchQuery) {
      const matchId = tx.id.toLowerCase().includes(searchQuery);
      const matchBuyer = tx.buyer.toLowerCase().includes(searchQuery);
      if (!matchId && !matchBuyer) return false;
    }
    return true;
  });

  table.innerHTML = '';
  if (filtered.length === 0) {
    table.innerHTML = `<tr><td colspan="8" class="p-8 text-center text-zinc-500 italic">No transaction history found matching criteria.</td></tr>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }

  filtered.forEach(tx => {
    const statColor = tx.status === 'Approved' || tx.status === 'Released' 
      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
      : (tx.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20');
    
    const itemNames = tx.items ? tx.items.map(i => `${i.name} (x${i.qty})`).join(", ") : `${tx.qty} items`;

    table.innerHTML += `
      <tr class="hover:bg-white/[0.02] transition border-b border-[#1e2230] last:border-0">
        <td class="p-3.5 font-mono text-zinc-400 text-[11px]">${tx.time}</td>
        <td class="p-3.5 font-mono text-white font-bold">${tx.id}</td>
        <td class="p-3.5 font-bold text-white flex items-center gap-1.5"><i data-lucide="user" class="w-3.5 h-3.5 text-zinc-500"></i> ${tx.buyer}</td>
        <td class="p-3.5"><span class="px-2 py-0.5 bg-[#131622] border border-[#1e2230] text-zinc-300 rounded-md text-[10px] font-semibold uppercase">${tx.role}</span></td>
        <td class="p-3.5 text-zinc-300 max-w-xs truncate" title="${itemNames}">${itemNames}</td>
        <td class="p-3.5 font-bold text-emerald-400 text-sm">$${tx.total.toLocaleString()}</td>
        <td class="p-3.5"><span class="px-2.5 py-0.5 text-[10px] font-semibold rounded-full uppercase ${statColor}">${tx.status}</span></td>
        <td class="p-3.5 text-right font-bold text-white uppercase">${tx.processed || 'ADMIN'}</td>
      </tr>
    `;
  });
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function handleProofFileUpload(event) {
  if (!isBisnisTier(getUserRank())) {
    showToast("ACCESS DENIED", "Mode Read-Only tidak dapat mengunggah bukti screenshot!", "error");
    return;
  }
  const files = event.target.files;
  if (!files || files.length === 0) return;

  if (uploadedProofThumbnails.length + files.length > 10) {
    showToast("WARNING", "Maksimal total lampiran adalah 10 foto!", "error");
    return;
  }

  let count = 0;
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedProofThumbnails.push(e.target.result);
      count++;
      if (count === files.length) {
        renderProofThumbnails();
        showToast("UPLOAD SUKSES", `${count} foto berhasil diunggah dari laptop/PC!`, "success");
      }
    };
    reader.readAsDataURL(file);
  });
}

function renderProofThumbnails() {
  const container = document.getElementById('proof-thumbnails-container');
  const countText = document.getElementById('proof-image-count-text');
  if (countText) countText.innerText = `${uploadedProofThumbnails.length} / 10 images selected`;
  if (!container) return;
  if (uploadedProofThumbnails.length === 0) {
    container.innerHTML = `<div class="col-span-full py-6 text-center text-zinc-500 italic"><i data-lucide="image-off" class="w-6 h-6 mx-auto mb-1 opacity-40"></i>There is no image proof yet for the selected stock.</div>`;
    if (typeof lucide !== 'undefined') lucide.createIcons(); return;
  }
  container.innerHTML = '';
  uploadedProofThumbnails.forEach((url, idx) => {
    container.innerHTML += `
      <div class="relative group h-20 bg-[#131622] rounded-xl border border-[#1e2230] overflow-hidden shadow-sm">
        <img src="${url}" class="w-full h-full object-cover">
        <button onclick="removeProofThumbnail(${idx})" class="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow">✕</button>
      </div>
    `;
  });
}

function promptAddProofUrl() {
  if (!isBisnisTier(getUserRank())) {
    showToast("ACCESS DENIED", "Mode Read-Only tidak dapat mengunggah bukti screenshot!", "error");
    return;
  }
  const url = prompt("Masukkan URL Gambar Bukti Screenshot / Discord Attachment:");
  if (url && url.startsWith('http')) {
    if (uploadedProofThumbnails.length >= 10) { alert("Maksimal 10 gambar!"); return; }
    uploadedProofThumbnails.push(url); renderProofThumbnails();
  }
}

function removeProofThumbnail(idx) { uploadedProofThumbnails.splice(idx, 1); renderProofThumbnails(); }
function clearProofForm() { document.getElementById('proof-details-input').value = ''; uploadedProofThumbnails = []; renderProofThumbnails(); }

function submitStockProof() {
  if (!isBisnisTier(getUserRank())) return;
  const detailsElem = document.getElementById('proof-details-input');
  if (!detailsElem || !detailsElem.value.trim()) { showToast("WARNING", "Harap isi deskripsi Verification Details terlebih dahulu!", "error"); return; }
  if (uploadedProofThumbnails.length === 0) { showToast("WARNING", "Harap tambahkan minimal 1 foto/URL gambar bukti screenshot!", "error"); return; }
  
  const details = detailsElem.value.trim();
  const dateStr = new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  const activeMember = (currentLoggedInUser || "ADMIN").toUpperCase();
  
  const attachedImages = [...uploadedProofThumbnails];

  stockProofLogs.unshift({ 
    member: activeMember, 
    date: dateStr, 
    details: details, 
    proofCount: attachedImages.length, 
    images: attachedImages,
    posted: true 
  });

  const firstImage = attachedImages[0];
  const isBase64 = firstImage.startsWith('data:image');
  const urlParam = isBase64 ? null : firstImage;
  const rawParam = isBase64 ? attachedImages : [];

  sendDiscordWebhook(
    VAULT_LOGS_WEBHOOK_URL, 
    "🚨 VAULT STOCK PROOF VERIFIED & LOGGED", 
    `Bukti verifikasi stok brangkas baru saja diunggah oleh **${activeMember}**!`, 
    [
      { name: "📋 Verification Details", value: `\`\`\`${details}\`\`\``, inline: false }, 
      { name: "👤 Logged By", value: activeMember, inline: true },
      { name: "🖼️ Visual Proofs Attached", value: `${attachedImages.length} Screenshots Validated`, inline: true }, 
      { name: "⏰ Verification Time", value: dateStr, inline: false }
    ], 
    3447003, 
    urlParam, 
    rawParam
  );

  clearProofForm(); 
  renderStockProofHistory();  
  showToast("SUCCESS", "Bukti verifikasi stok berhasil disimpan dan foto masuk ke Discord!", "success");
}

function renderStockProofHistory() {
  const table = document.getElementById('stock-proof-history-table');
  if (!table) return;
  if (stockProofLogs.length === 0) {
    table.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-zinc-500 italic">There is no record of safe stock verification (Clean).</td></tr>`;
    return;
  }
  table.innerHTML = '';
  stockProofLogs.forEach((log, idx) => {
    const postBtn = `<span class="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-semibold uppercase inline-block"><i data-lucide="check-circle-2" class="w-3 h-3 inline"></i> Sent to Discord</span>`;
    const viewPhotoBtn = `
      <button onclick="openProofViewerModal(${idx})" class="px-3 py-1 bg-blue-500/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 rounded-lg text-xs font-semibold transition shadow-sm flex items-center gap-1.5 mx-auto">
        <i data-lucide="eye" class="w-3.5 h-3.5"></i> Lihat Foto (${log.proofCount || 1})
      </button>
    `;
    table.innerHTML += `
      <tr class="hover:bg-white/[0.02] transition border-b border-[#1e2230] last:border-0">
        <td class="p-3.5 font-bold text-white flex items-center gap-2"><i data-lucide="user" class="w-3.5 h-3.5 text-zinc-500"></i> ${log.member}</td>
        <td class="p-3.5 font-mono text-zinc-400 text-[11px]">${log.date}</td>
        <td class="p-3.5 font-semibold text-blue-400">${log.details}</td>
        <td class="p-3.5 text-center">${viewPhotoBtn}</td>
        <td class="p-3.5 text-right">${postBtn}</td>
      </tr>
    `;
  });
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderMetalScrapLogs() {
  const table = document.getElementById('metal-scrap-table');
  if (!table) return;
  let totalIn = 0; let totalOut = 0;
  metalScrapLogs.forEach(l => { if (l.type === 'IN') totalIn += l.qty; else totalOut += l.qty; });
  const totalStock = totalIn - totalOut;
  document.getElementById('scrap-total-stock').innerText = `${totalStock.toLocaleString()} unit`;
  document.getElementById('scrap-total-in').innerText = `+${totalIn.toLocaleString()} unit`;
  document.getElementById('scrap-total-out').innerText = `-${totalOut.toLocaleString()} unit`;

  if (metalScrapLogs.length === 0) {
    table.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-zinc-500 italic">There are no records yet of metal scrap coming in or going out.</td></tr>`;
    return;
  }
  table.innerHTML = '';
  metalScrapLogs.forEach(log => {
    const badge = log.type === 'IN' ? `<span class="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px] rounded-full uppercase">PEMASUKAN (IN)</span>` : `<span class="px-2.5 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 font-bold text-[10px] rounded-full uppercase">PENGELUARAN (OUT)</span>`;
    const valText = log.type === 'IN' ? `+${log.qty.toLocaleString()}` : `-${log.qty.toLocaleString()}`;
    const valColor = log.type === 'IN' ? 'text-emerald-400' : 'text-red-500';
    table.innerHTML += `
      <tr class="hover:bg-white/[0.02] transition border-b border-[#1e2230] last:border-0">
        <td class="p-3.5 font-mono text-zinc-400 text-[11px]">${log.time}</td>
        <td class="p-3.5">${badge}</td>
        <td class="p-3.5 font-bold text-sm ${valColor}">${valText} unit</td>
        <td class="p-3.5 text-zinc-300 font-medium">${log.reason}</td>
        <td class="p-3.5 text-right font-bold text-white uppercase">${log.user}</td>
      </tr>
    `;
  });
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

let scrapCallback = null;

function showCustomPrompt(title, message, defaultValue, onSubmitted) {
  const backdrop = document.getElementById('custom-prompt-backdrop');
  const titleElem = document.getElementById('custom-prompt-title');
  const msgElem = document.getElementById('custom-prompt-message');
  const inputElem = document.getElementById('custom-prompt-input');

  if (!backdrop || !inputElem) {
    const val = prompt(message, defaultValue);
    if (val !== null) onSubmitted(val);
    return;
  }

  titleElem.innerText = title || "INPUT DATA";
  msgElem.innerText = message || "Masukkan nilai:";
  inputElem.value = defaultValue || "";
  scrapCallback = onSubmitted;

  backdrop.classList.remove('hidden');
  setTimeout(() => {
    inputElem.focus();
    inputElem.select();
  }, 50);

  inputElem.onkeypress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitCustomPrompt();
    }
  };
}

function submitCustomPrompt() {
  const inputElem = document.getElementById('custom-prompt-input');
  const val = inputElem ? inputElem.value : "";
  
  const backdrop = document.getElementById('custom-prompt-backdrop');
  if (backdrop) {
    backdrop.classList.add('hidden');
  }

  if (typeof scrapCallback === 'function') {
    const cb = scrapCallback;
    scrapCallback = null;
    cb(val);
  }
}

function addScrapLog(type) {
  if (!isBisnisTier(getUserRank())) return;

  showCustomPrompt(
    type === 'IN' ? "Pemasukan Metal Scrap" : "Pengeluaran Metal Scrap",
    `Masukkan jumlah (unit) besi scrap yang ${type === 'IN' ? 'MASUK' : 'KELUAR'}:`,
    "100",
    (qtyStr) => {
      const qty = parseInt(qtyStr);
      if (isNaN(qty) || qty <= 0) {
        showToast("WARNING", "Jumlah kuantitas harus berupa angka valid lebih dari 0!", "error");
        return;
      }

      setTimeout(() => {
        showCustomPrompt(
          "Keterangan Alur Scrap",
          "Masukkan alasan atau keterangan alur material:",
          type === 'IN' ? "Hasil peleburan scrap" : "Bahan crafting senjata",
          (reason) => {
            if (!reason) return;
            
            const timeStr = new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
            const activeUser = (currentLoggedInUser || "ADMIN").toUpperCase();
            
            metalScrapLogs.unshift({ type: type, qty, reason, time: timeStr, user: activeUser });
            saveAppData();

            sendDiscordWebhook(METAL_SCRAP_WEBHOOK_URL, `🔩 METAL SCRAP LOG (${type === 'IN' ? 'PEMASUKAN' : 'PENGELUARAN'})`, `Catatan material scrap baru dicatat oleh **${activeUser}**`, [
              { name: "Tipe Alur", value: type === 'IN' ? "🟢 Pemasukan (+IN)" : "🔴 Pengeluaran (-OUT)", inline: true },
              { name: "Jumlah Qty", value: `${qty.toLocaleString()} Unit`, inline: true }, 
              { name: "Keterangan", value: reason, inline: false }
            ], type === 'IN' ? 3066993 : 15158332);

            renderMetalScrapLogs();
            showToast("SCRAP LOGGED", `Catatan ${type === 'IN' ? 'Pemasukan' : 'Pengeluaran'} Metal Scrap berhasil disimpan!`, "success");
          }
        );
      }, 200);
    }
  );
}

function switchCatalogTab(tabName) {
  currentCatalogTab = tabName;
  const dropdown = document.getElementById('catalog-filter-dropdown');
  if (dropdown && dropdown.value !== tabName) {
    dropdown.value = tabName;
  }
  renderTonCatalog();
}

// ==========================================
// 📋 RENDER ROSTER CATALOG (BULLETPROOF FILTER)
// ==========================================
function renderTonCatalog() {
  const tableBody = document.getElementById('ton-catalog-table');
  if (!tableBody) return;
  const savedProfiles = getSafeStorage('ton_all_profiles') || {};
  const allUsers = Object.keys(savedProfiles);

  const filteredUsers = allUsers.filter(user => {
    const profile = savedProfiles[user] || {};
    if (user.toLowerCase() === 'developer' || String(profile.job || '').toLowerCase() === 'developer') return false;

    // 🛡️ PERBAIKAN MUTLAK: Tangkap apapun teksnya, hapus spasi, jadikan huruf kecil
    const tabSaatIni = String(currentCatalogTab || 'All').toLowerCase().trim();
    
    // Jika teks dropdown mengandung kata "all", loloskan semua orang!
    if (tabSaatIni.includes('all')) return true;
    
    // Jika tidak, cocokkan dengan divisi masing-masing (Internal / Family)
    const grupUser = String(profile.groupType || 'Family').toLowerCase().trim();
    return grupUser === tabSaatIni;
  });

  const rank = getUserRank();
  const canModifyRoster = isDonTier(rank);

  const thActions = document.getElementById('th-roster-actions');
  const noteAdmin = document.getElementById('roster-admin-note');
  if (thActions) thActions.style.display = canModifyRoster ? 'table-cell' : 'none';
  if (noteAdmin) noteAdmin.style.display = canModifyRoster ? 'inline' : 'none';

  if (filteredUsers.length === 0) {
    const colCount = canModifyRoster ? 4 : 3;
    tableBody.innerHTML = `<tr><td colspan="${colCount}" class="p-4 text-center text-zinc-500 italic">There are no members registered in the category yet [${currentCatalogTab}].</td></tr>`;
    return;
  }
  
  const rankOptions = ["Moderator", "Don", "Underboss", "Bisnis", "Consigliere", "Captain", "Capo", "Soldiers", "Associates"];
  tableBody.innerHTML = '';
  
  filteredUsers.forEach((username, idx) => {
    const prof = savedProfiles[username] || {};
    if (!prof || typeof prof !== 'object' || !prof.name) return;
    
    const rankInputId = `catalog-rank-${idx}`;
    const groupSelectId = `catalog-group-${idx}`;
    const safeName = escapeHtml(prof.name || '-');
    const safeUsername = escapeHtml(username);
    const currentJob = prof.job || 'Soldiers';
    const safeJob = escapeHtml(currentJob);
    const currentGroup = prof.groupType || 'Family';
    const safeGroup = escapeHtml(currentGroup);
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
    const avatarUrl = (prof.avatar && prof.avatar.startsWith('http')) ? prof.avatar : defaultAvatar;
    const safeAvatarUrl = escapeHtml(avatarUrl);
    const safeDefaultAvatar = escapeHtml(defaultAvatar);
    const safeUsernameArgument = escapeHtml(JSON.stringify(username));

    let groupCellHtml = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${currentGroup === 'Internal' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}">${safeGroup}</span>`;
    let rankCellHtml = `<span class="font-bold text-white">${safeJob}</span>`;
    let actionCellHtml = '';

    if (canModifyRoster) {
      groupCellHtml = `<select id="${groupSelectId}" class="bg-[#131622] border border-[#1e2230] text-white px-2 py-1 rounded-lg text-xs font-bold"><option value="Internal" ${currentGroup === 'Internal' ? 'selected' : ''}>Internal</option><option value="Family" ${currentGroup === 'Family' ? 'selected' : ''}>Family</option></select>`;
      let rankSelectOptions = rankOptions.map(r => `<option value="${r}" ${currentJob === r ? 'selected' : ''}>${r}</option>`).join('');
      rankCellHtml = `<select id="${rankInputId}" class="w-full bg-[#131622] border border-[#1e2230] text-white px-2.5 py-1 rounded-lg text-xs font-bold">${rankSelectOptions}</select>`;
      actionCellHtml = `<td class="p-3.5 text-right space-x-1.5"><button onclick="adminUpdateCatalogUser(${safeUsernameArgument}, '${rankInputId}', '${groupSelectId}')" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded-lg text-xs uppercase shadow-sm">Update</button><button onclick="adminDeleteUser(${safeUsernameArgument})" class="bg-red-600 hover:bg-red-500 text-white font-bold px-2 py-1 rounded-lg text-xs uppercase shadow-sm"><i data-lucide="trash-2" class="w-3.5 h-3.5 inline"></i></button></td>`;
    }

    tableBody.innerHTML += `
      <tr class="hover:bg-white/[0.02] transition border-b border-[#1e2230] last:border-0">
        <td class="p-3.5"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-full border border-[#1e2230] overflow-hidden shrink-0 bg-red-500/10"><img src="${safeAvatarUrl}" onerror="this.src='${safeDefaultAvatar}'" class="w-full h-full object-cover"></div><div><p class="font-bold text-white text-xs">${safeName}</p><p class="font-mono text-[11px] text-zinc-500">${safeUsername}</p></div></div></td>
        <td class="p-3.5">${groupCellHtml}</td>
        <td class="p-3.5">${rankCellHtml}</td>
        ${actionCellHtml}
      </tr>
    `;
  });
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function adminUpdateCatalogUser(targetUsername, rankInputId, groupSelectId) {
    if (!targetUsername) return;

    const newRank = document.getElementById(rankInputId)?.value || 'Soldiers';
    const newGroup = document.getElementById(groupSelectId)?.value || 'Family';
    const lowerTarget = targetUsername.toLowerCase();

    if (typeof savedProfiles === 'undefined') window.savedProfiles = {};
    if (typeof customAccounts === 'undefined') window.customAccounts = {};

    if (savedProfiles[lowerTarget]) {
        savedProfiles[lowerTarget].job = newRank;
        savedProfiles[lowerTarget].groupType = newGroup;
    }
    if (customAccounts[lowerTarget]) {
        customAccounts[lowerTarget].rank = newRank;
    }

    if (typeof saveAppData === 'function') {
        saveAppData();
    }

    if (typeof renderTonCatalog === 'function') renderTonCatalog();
    if (typeof renderCustomAccountsTable === 'function') renderCustomAccountsTable();
    
    if (typeof showToast === 'function') {
        showToast("ROSTER UPDATED", `Data ${targetUsername} berhasil diperbarui jadi ${newRank}!`, "success");
    }
}

function adminDeleteUser(targetUsername) {
  const currentRank = getUserRank();
  if (!isTopAdmin(currentRank)) {
    showToast("ACCESS DENIED", "Only admins and moderators have the authority to permanently delete member data!", "error");
    return;
  }
  showCustomConfirm("Remove Member", `Permanently delete member ${targetUsername} from the system?`, () => {
    const savedProfiles = getSafeStorage('ton_all_profiles') || {};
    const deletedName = savedProfiles[targetUsername]?.name || targetUsername;
    const deletedRank = savedProfiles[targetUsername]?.job || 'No Rank';
    delete savedProfiles[targetUsername];
    localStorage.setItem('ton_all_profiles', JSON.stringify(savedProfiles));
    sendDiscordWebhook(PROFILE_WEBHOOK_URL, "🗑️ ROSTER MEMBER REMOVED / DELETED", `Administrator **${currentLoggedInUser || 'ADMIN'}** has removed a member from The Old Norse roster.`, [
      { name: "👤 Member Removed", value: `**${targetUsername}**`, inline: true },
      { name: "📝 Character Name (IC)", value: deletedName, inline: true },
      { name: "💼 Last Position Held", value: deletedRank, inline: true }
    ], 15158332);
    showToast("MEMBER DELETED", `Member [${targetUsername}] has been removed from the system!`, "error");
    renderTonCatalog();
  });
}

function handleProfileImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const maxDim = 300; 
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxDim) { height = Math.round((height * maxDim) / width); width = maxDim; }
      } else {
        if (height > maxDim) { width = Math.round((width * maxDim) / height); height = maxDim; }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      icUploadedBase64 = canvas.toDataURL('image/jpeg', 0.75);
      
      const imgElem = document.getElementById('profile-avatar-img');
      const sideImg = document.getElementById('sidebar-user-avatar');
      const sideInit = document.getElementById('sidebar-user-initials');
      
      if (imgElem) imgElem.src = icUploadedBase64;
      if (sideImg && sideInit) {
        sideImg.src = icUploadedBase64;
        sideImg.classList.remove('hidden');
        sideInit.classList.add('hidden');
      }
      
      showToast("AVATAR READY", "Foto otomatis dikompres agar ringan & siap disimpan permanen!", "success");
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function renderProfilePage() {
  const activeName = currentLoggedInUser || 'GUEST';
  const activeRole = getUserRank().toUpperCase();
  const nameElem = document.getElementById('profile-name');
  const badgeElem = document.getElementById('profile-rank-badge');
  if (nameElem) nameElem.innerText = activeName;
  if (badgeElem) badgeElem.innerText = activeRole;

  const profiles = getSafeStorage('ton_all_profiles') || {};
  const prof = profiles[activeName.toLowerCase()] || profiles[activeName] || { name: '', phone: '', idcard: '', job: '', avatar: '' };
  updateUserAvatars(prof.avatar, activeName);

  if (document.getElementById('ic-name')) document.getElementById('ic-name').value = prof.name || '';
  if (document.getElementById('ic-phone')) document.getElementById('ic-phone').value = prof.phone || '';
  if (document.getElementById('ic-idcard')) document.getElementById('ic-idcard').value = prof.idcard || '';
  if (document.getElementById('ic-avatar')) {
    const isBase64 = prof.avatar && prof.avatar.startsWith('data:image');
    document.getElementById('ic-avatar').value = isBase64 ? '' : (prof.avatar || '');
  }

  const icJob = document.getElementById('ic-job');
  const icJobLabel = document.getElementById('ic-job-label');
  if (icJob && icJobLabel) {
    icJob.value = prof.job || activeRole || 'Soldiers';
    if (!isDonTier(getUserRank())) {
      icJob.disabled = true; icJob.classList.add('opacity-50', 'cursor-not-allowed', 'border-red-900/50');
      icJobLabel.innerHTML = 'Rank <span class="text-red-500 font-bold">(🔒 LOCKED BY ADMIN)</span>';
    } else {
      icJob.disabled = false; icJob.classList.remove('opacity-50', 'cursor-not-allowed', 'border-red-900/50');
      icJobLabel.innerHTML = 'Pekerjaan / Gang / Jabatan <span class="text-emerald-400 font-bold">(🔓 ADMIN ACCESS)</span>';
    }
  }
}

function updateUserAvatars(customUrl, userName) {
  const activeName = userName || currentLoggedInUser || 'GUEST';
  const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(activeName)}`;
  const finalUrl = (customUrl && (customUrl.startsWith('http') || customUrl.startsWith('data:image'))) ? customUrl : defaultAvatar;
  const profileImg = document.getElementById('profile-avatar-img');
  const sidebarImg = document.getElementById('sidebar-user-avatar');
  const sidebarInitials = document.getElementById('sidebar-user-initials');

  if (profileImg) { profileImg.src = finalUrl; profileImg.onerror = () => { profileImg.src = defaultAvatar; }; }
  if (sidebarImg && sidebarInitials) {
    sidebarImg.src = finalUrl; sidebarImg.classList.remove('hidden'); sidebarInitials.classList.add('hidden');
    sidebarImg.onerror = () => { sidebarImg.src = defaultAvatar; sidebarImg.onerror = null; };
  }
}

function saveUserProfile() {
  const activeName = currentLoggedInUser || 'GUEST';
  const profileKey = activeName.toLowerCase();
  const profiles = getSafeStorage('ton_all_profiles') || {};
  const existing = profiles[profileKey] || profiles[activeName] || {};
  
  const nameInput = document.getElementById('ic-name');
  const phoneInput = document.getElementById('ic-phone');
  const idcardInput = document.getElementById('ic-idcard');
  const jobInput = document.getElementById('ic-job');
  const avatarInput = document.getElementById('ic-avatar');

  if (!nameInput || !phoneInput || !idcardInput) {
    showToast("ERROR", "Form Profile IC tidak lengkap di HTML!", "error");
    return;
  }

  let validatedJob = existing.job || 'Soldiers';
  if (isDonTier(getUserRank()) && jobInput) {
    validatedJob = jobInput.value || 'Soldiers';
  }

  const urlVal = avatarInput?.value.trim() || '';
  const finalAvatar = icUploadedBase64 || urlVal || existing.avatar || '';

const profileData = {
    name: nameInput.value.trim(),
    phone: phoneInput.value.trim(),
    idcard: idcardInput.value.trim(),
    job: validatedJob,
    avatar: finalAvatar,
    groupType: existing.groupType || 'Family',
    
    // 👇 DATA BARU YANG DIPERLUAS 👇
    bloodType: "O+",
    faction: "Civilians",
    lastUpdated: new Date().toISOString()
  };

  if (!profileData.name || !profileData.phone || !profileData.idcard) { 
    showToast("WARNING", "Mohon lengkapi Nama Karakter, Telepon, dan ID Card!", "error"); 
    return; 
  }

  try {
    profiles[profileKey] = profileData;
    if (activeName !== profileKey) delete profiles[activeName];
    savedProfiles = profiles;
    window.savedProfiles = savedProfiles;
    saveAppData();
    updateUserAvatars(profileData.avatar, activeName);
    renderProfilePage(); 
    renderTonCatalog();
    
    const isBase64 = profileData.avatar && profileData.avatar.startsWith('data:image');
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(activeName)}`;
    
    const urlParam = (isBase64 || !profileData.avatar) ? null : profileData.avatar;
    const rawParam = isBase64 ? [profileData.avatar] : [];

    sendDiscordWebhook(
      PROFILE_WEBHOOK_URL, 
      "NEW IN-CHARACTER (IC) PROFILE REGISTERED", 
      `Data diri IC dan Foto Profil baru saja diperbarui oleh **${activeName}**`, 
      [
        { name: "🪪 Akun Login (Role)", value: `**${activeName}** (${getUserRank().toUpperCase()})`, inline: false },
        { name: "👤 Nama Karakter (IC)", value: profileData.name || "-", inline: true },
        { name: "📞 Nomor Telepon", value: profileData.phone || "-", inline: true },
        { name: "🆔 ID Card / Kependudukan", value: profileData.idcard || "-", inline: true },
        { name: "💼 Pekerjaan / Jabatan", value: profileData.job || "Soldiers", inline: true }
      ], 
      3447003, 
      urlParam, 
      rawParam 
    );
    
    icUploadedBase64 = ''; 
    showToast("PROFILE SAVED", "Data In-Character (IC) dan Foto Profil berhasil disimpan dan dikirim ke Discord!", "success");
  } catch (e) {
    showToast("MEMORI PENUH", "Gagal menyimpan foto! Gunakan URL gambar eksternal yang lebih pendek.", "error");
  }
}

function updateDashboardData() {
  // 1. KUNCI PERBAIKAN MUTLAK: HANYA HITUNG TRANSAKSI YANG SUDAH SELESAI
  let newLeaderboard = [];
  
  if (adminTransactions && Array.isArray(adminTransactions)) {
    adminTransactions.forEach(tx => {
      // HANYA menghitung pesanan yang uangnya benar-benar sudah masuk (Released / Approved)
      if (tx.status === 'Released' || tx.status === 'Approved') {
        let existing = newLeaderboard.find(s => s.name === tx.buyer);
        if (existing) {
          existing.spent += tx.total;
        } else {
          newLeaderboard.push({ name: tx.buyer, role: tx.role, spent: tx.total, top: false });
        }
      }
    });
  }
  
  // Terapkan data yang sudah 100% bersih ke variabel global
  orgLeaderboard = newLeaderboard;
  
  // Paksa hapus data hantu di Firebase dengan data yang baru
  if (typeof db !== 'undefined' && db) {
    db.ref('ton_global_state/orgLeaderboard').set(orgLeaderboard);
  }

  // 2. UPDATE UI BALANCE & SYNC TIME
  const balElem = document.getElementById('sidebar-vault-balance');
  if (balElem) balElem.innerText = "$" + vaultBalance.toLocaleString();
  const syncTime = document.getElementById('synced-time');
  if (syncTime) syncTime.innerText = new Date().toLocaleTimeString('en-US');

  // 3. UPDATE TOTAL ORG SPENDING
  let orgSpendTotal = 0;
  if (orgLeaderboard.length > 0) {
     orgSpendTotal = orgLeaderboard.reduce((s, i) => s + i.spent, 0);
  }
  const orgSpendElem = document.getElementById('hq-org-spending');
  if (orgSpendElem) orgSpendElem.innerText = "$" + orgSpendTotal.toLocaleString();

  // 4. UPDATE TOP SPENDER WIDGET (DASHBOARD ATAS)
  if (orgLeaderboard.length > 0) {
    orgLeaderboard.sort((a,b) => b.spent - a.spent);
    if (document.getElementById('hq-top-spender-name')) document.getElementById('hq-top-spender-name').innerText = orgLeaderboard[0].name;
    if (document.getElementById('hq-top-spender-val')) document.getElementById('hq-top-spender-val').innerHTML = `$${orgLeaderboard[0].spent.toLocaleString()} <span class="text-[10px] text-zinc-500">total</span>`;
  } else {
    if (document.getElementById('hq-top-spender-name')) document.getElementById('hq-top-spender-name').innerText = "None";
    if (document.getElementById('hq-top-spender-val')) document.getElementById('hq-top-spender-val').innerHTML = `$0 <span class="text-[10px] text-zinc-500">total</span>`;
  }

  // 5. UPDATE MY ORDERS WIDGET
  const myOrdersList = document.getElementById('my-orders-list');
  if (myOrdersList) {
    const myOrders = adminTransactions.filter(o => o.buyer === currentLoggedInUser || o.buyer === "ADMIN");
    myOrdersList.innerHTML = myOrders.length === 0 ? `<p class="text-zinc-500 italic">No orders yet.</p>` : '';
    myOrders.forEach(o => {
      myOrdersList.innerHTML += `<div class="bg-[#131622] p-3.5 rounded-xl border border-[#1e2230] flex justify-between items-center"><div><span class="font-mono text-zinc-400 text-[11px] font-bold">${o.id}</span><p class="font-bold text-white text-xs">${o.items ? o.items.map(i => `${i.name} (x${i.qty})`).join(', ') : 'Weapon Items'}</p></div><div class="text-right"><span class="font-tech font-bold text-amber-400 text-base">$${o.total.toLocaleString()}</span><p class="text-[10px] font-bold uppercase ${o.status === 'Released' || o.status === 'Approved' ? 'text-emerald-400' : 'text-amber-500'}">${o.status}</p></div></div>`;
    });
  }
  
  // 6. RENDER ULANG SEMUA KOMPONEN
  if(typeof renderTxProcessTable === 'function') renderTxProcessTable(); 
  if(typeof renderReleaseOutstanding === 'function') renderReleaseOutstanding(); 
  if(typeof renderVaultHistory === 'function') renderVaultHistory(); 
  if(typeof renderLeaderboard === 'function') renderLeaderboard();
  if(typeof updateLockdownUI === 'function') updateLockdownUI();
  if(typeof renderBlacklistTable === 'function') renderBlacklistTable();
  if(typeof renderStaffKPITable === 'function') renderStaffKPITable();
}

function triggerSystemReset() {
  if (!isDeveloper(getUserRank())) {
        showToast("ACCESS DENIED", "Hanya Developer yang memiliki akses reset seluruh riwayat sistem.", "error");
        return;
    }

    showCustomConfirm(
        "CONFIRMATION 1/2: SYSTEM RESET",
        "Warning: Transaction history, cash, and logs will be permanently deleted. (DATA ROSTER & AKUN TETAP AMAN). Are you sure?",
        () => {
            setTimeout(() => {
                showCustomConfirm(
                    "FINAL CONFIRMATION 2/2: REPEAT WARNING",
                    "This action cannot be undone! Are you absolutely 100% sure you want to delete transaction history?",
                    () => {
                        localStorage.removeItem('ton_admin_transactions');
                        localStorage.removeItem('ton_org_leaderboard');
                        localStorage.removeItem('ton_metal_scrap');
                        
                        adminTransactions = [];
                        orgLeaderboard = [];
                        metalScrapLogs = [];
                        vaultBalance = 0;

                        if (typeof saveAppData === 'function') saveAppData();

                        showToast("SYSTEM RESET", "Riwayat transaksi berhasil direset! Data Roster AMAN.", "success");

                        setTimeout(() => {
                            location.reload();
                        }, 1500);
                    }
                );
            }, 300);
        }
    );
}

function openProofViewerModal(index) {
  const log = stockProofLogs[index];
  if (!log || !log.images || log.images.length === 0) {
    showToast("WARNING", "Tidak ada data foto tersimpan pada log ini.", "error");
    return;
  }

  let oldModal = document.getElementById('proof-viewer-modal');
  if (oldModal) oldModal.remove();

  const modal = document.createElement('div');
  modal.id = 'proof-viewer-modal';
  modal.className = 'fixed inset-0 z-[250] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 transition-opacity';
  
  let imagesHtml = '';
  log.images.forEach((imgUrl, i) => {
    imagesHtml += `
      <div class="space-y-1">
        <span class="text-[10px] font-mono text-zinc-400">Lampiran #${i + 1}</span>
        <div class="bg-black rounded-lg border border-[#1e2230] overflow-hidden flex items-center justify-center max-h-[70vh]">
          <img src="${imgUrl}" class="max-w-full max-h-[70vh] object-contain mx-auto" alt="Proof Image">
        </div>
      </div>
    `;
  });

  modal.innerHTML = `
    <div class="w-full max-w-4xl bg-[#0e1017] border border-blue-500/50 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.2)] p-6 relative overflow-hidden flex flex-col max-h-[90vh]">
      <div class="flex items-center justify-between border-b border-[#1e2230] pb-3 mb-4 shrink-0">
        <div class="flex items-center gap-2">
          <i data-lucide="image" class="w-5 h-5 text-blue-400"></i>
          <div>
            <h3 class="font-bold font-tech text-white uppercase text-base tracking-wider">VISUAL PROOF VIEWER</h3>
            <p class="text-[10px] text-zinc-400 font-mono">Uploaded by ${log.member} on ${log.date}</p>
          </div>
        </div>
        <button onclick="document.getElementById('proof-viewer-modal').remove()" class="text-zinc-500 hover:text-white p-1 rounded-lg bg-[#131622] hover:bg-red-600 transition">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>
      
      <div class="text-xs text-blue-300 bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl mb-4 shrink-0 font-medium">
        <strong>Details:</strong> "${log.details}"
      </div>

      <div class="overflow-y-auto space-y-6 pr-2 flex-1 scrollbar-thin">
        ${imagesHtml}
      </div>

      <div class="mt-4 pt-3 border-t border-[#1e2230] flex justify-end shrink-0">
        <button onclick="document.getElementById('proof-viewer-modal').remove()" class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-tech font-bold text-xs uppercase rounded-xl shadow transition">
          Tutup Viewer
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderCustomAccountsTable() {
  const tbody = document.getElementById('custom-accounts-table');
  if (!tbody) return;

  tbody.innerHTML = '';
  
  // Filter akun agar Developer tidak masuk ke tabel
  const users = Object.keys(customAccounts).filter(username => {
    const account = customAccounts[username] || {};
    return username.toLowerCase() !== 'developer' && String(account.rank || '').toLowerCase() !== 'developer';
  });

  // Tampilan Kosong (Empty State) yang lebih elegan
  if (users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="py-12 text-center">
          <div class="flex flex-col items-center justify-center text-zinc-500">
            <div class="w-12 h-12 rounded-xl bg-zinc-800/30 border border-zinc-700/50 flex items-center justify-center mb-3">
              <i data-lucide="users" class="w-6 h-6 opacity-50"></i>
            </div>
            <span class="text-xs italic font-medium">Belum ada akun login custom yang terdaftar.</span>
          </div>
        </td>
      </tr>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }

  users.forEach((username) => {
    const acc = customAccounts[username];
    const safeUsername = escapeHtml(username);
    const safePassword = escapeHtml(acc.pass || '');
    const safeRank = escapeHtml(acc.rank || 'Soldiers').toUpperCase();
    const safeUsernameArgument = escapeHtml(JSON.stringify(username));
    
    // Inisial untuk Avatar
    const initials = safeUsername.substring(0, 2).toUpperCase();

    // Dinamika Warna Badge berdasarkan Pangkat (Rank)
    let rankBadgeStyle = 'bg-blue-500/10 text-blue-400 border-blue-500/20'; // Default: Soldiers
    
    if (safeRank.includes('MODERATOR') || safeRank.includes('ADMIN')) {
      rankBadgeStyle = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.15)]';
    } else if (safeRank.includes('DON') || safeRank.includes('UNDERBOSS')) {
      rankBadgeStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    } else if (safeRank.includes('BISNIS') || safeRank.includes('CAPO') || safeRank.includes('CAPTAIN')) {
      rankBadgeStyle = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    } else if (safeRank.includes('ASSOCIATES')) {
      rankBadgeStyle = 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }

    // HTML Baris Tabel (Ramping, Modern, dengan efek Hover yang elegan)
    tbody.innerHTML += `
      <tr class="group hover:bg-[#161a29] transition-all duration-200 border-b border-[#1e2230] last:border-0">
        
        <!-- Kolom 1: Username & Avatar Inisial -->
        <td class="px-4 py-3">
          <div class="flex items-center gap-3.5">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-zinc-800/80 to-[#131622] border border-[#1e2230] flex items-center justify-center font-bold text-zinc-300 text-[11px] tracking-wider shadow-inner shrink-0 group-hover:border-zinc-500/50 transition-colors">
              ${initials}
            </div>
            <span class="font-bold text-white text-[13px] tracking-wide truncate">${safeUsername}</span>
          </div>
        </td>

        <!-- Kolom 2: Password Custom (Desain Token) -->
        <td class="px-4 py-3">
          <div class="flex items-center gap-2">
            <i data-lucide="key" class="w-3.5 h-3.5 text-zinc-500"></i>
            <span class="font-mono text-xs text-zinc-300 bg-[#0e1017] border border-[#1e2230] px-2.5 py-1 rounded-md tracking-wider shadow-inner">
              ${safePassword}
            </span>
          </div>
        </td>

        <!-- Kolom 3: Rank Assigned (Badge Warna Warni) -->
        <td class="px-4 py-3">
          <span class="px-2.5 py-0.5 text-[9px] font-extrabold rounded uppercase border tracking-wider ${rankBadgeStyle}">
            ${safeRank}
          </span>
        </td>

        <!-- Kolom 4: Aksi Hapus -->
        <td class="px-4 py-3 text-right">
          <button onclick="deleteCustomAccount(${safeUsernameArgument})" class="w-7 h-7 rounded-lg bg-[#0e1017] hover:bg-red-500/20 text-zinc-500 hover:text-red-400 border border-[#1e2230] hover:border-red-500/30 flex items-center justify-center transition-all ml-auto opacity-60 group-hover:opacity-100" title="Hapus Akun">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </td>

      </tr>
    `;
  });

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function addCustomAccount() {
    const rawUsers = document.getElementById('new-bisnis-user')?.value || document.getElementById('new-username')?.value || '';
    const pass = document.getElementById('new-bisnis-pass')?.value.trim() || document.getElementById('new-password')?.value.trim();
    const rawRank = document.getElementById('new-bisnis-rank')?.value || document.getElementById('new-rank')?.value || 'Soldiers';
    const rank = rawRank.trim();

    const usernames = Array.from(new Map(
        rawUsers.split(/[\n,;]+/).map(name => name.trim()).filter(Boolean).map(name => [name.toLowerCase(), name])
    ).values());
    if (usernames.length === 0 || !pass) {
        showToast('DATA BELUM LENGKAP', 'Masukkan minimal satu username dan password.', 'warning');
        return;
    }

    if (String(rank).toLowerCase() === 'developer' || usernames.some(name => name.toLowerCase() === 'developer')) {
        showToast("ACCESS DENIED", "Akun Developer hanya bisa dibuat oleh sistem.", "error");
        return;
    }

    if (typeof customAccounts === 'undefined') window.customAccounts = {};
    if (typeof savedProfiles === 'undefined') window.savedProfiles = {};

    const created = [];
    const skipped = [];
    const invalid = [];
    usernames.forEach(username => {
        const lowerUser = username.toLowerCase();
        if (!/^[a-z0-9_-]{1,32}$/.test(lowerUser)) {
            invalid.push(username);
            return;
        }
        if (customAccounts[lowerUser]) {
            skipped.push(username);
            return;
        }

        customAccounts[lowerUser] = { pass: pass, rank: rank };
        savedProfiles[lowerUser] = {
            name: username.toUpperCase(),
            phone: '0812-' + Math.floor(1000 + Math.random() * 9000),
            idcard: 'TON-' + Math.floor(1000 + Math.random() * 9000),
            job: rank,
            avatar: '',
            groupType: 'Family'
        };
        created.push(username);
    });

    if (created.length === 0) {
        const details = invalid.length ? `Username tidak valid: ${invalid.join(', ')}.` : 'Semua username sudah terdaftar.';
        showToast('TIDAK ADA AKUN BARU', details, 'warning');
        return;
    }

    if (typeof saveAppData === 'function') saveAppData();
    if (typeof renderCustomAccountsTable === 'function') renderCustomAccountsTable();
    if (typeof renderTonCatalog === 'function') renderTonCatalog();
    const summary = `${created.length} akun berhasil dibuat${skipped.length ? `; ${skipped.length} username duplikat dilewati` : ''}${invalid.length ? `; ${invalid.length} username tidak valid dilewati` : ''}.`;
    showToast('AKUN BERHASIL DIBUAT', summary, 'success');

    if (document.getElementById('new-bisnis-user')) document.getElementById('new-bisnis-user').value = '';
    if (document.getElementById('new-bisnis-pass')) document.getElementById('new-bisnis-pass').value = '';
    if (document.getElementById('new-username')) document.getElementById('new-username').value = '';
    if (document.getElementById('new-password')) document.getElementById('new-password').value = '';
}
  
function deleteCustomAccount(username) {
    const currentRank = (typeof getUserRank === 'function' ? getUserRank() : currentUserRole || '').toLowerCase();
    if (!isTopAdmin(currentRank)) {
        if(typeof showToast === 'function') showToast("AKSES DITOLAK", "Hanya Moderator yang bisa menghapus akun.", "error");
        return;
    }

    if (typeof showCustomConfirm === 'function') {
        showCustomConfirm("Hapus Akun", `Yakin hapus akun "${username}"?`, () => executeDelete(username));
    } else if (confirm(`Yakin hapus akun "${username}"?`)) {
        executeDelete(username);
    }

    function executeDelete(targetUser) {
        const lowerTarget = targetUser.toLowerCase();
        
        if (typeof customAccounts !== 'undefined' && customAccounts[lowerTarget]) {
            delete customAccounts[lowerTarget];
        }
        
        if (typeof savedProfiles !== 'undefined') {
            const realKey = Object.keys(savedProfiles).find(k => k.toLowerCase() === lowerTarget);
            if (realKey) delete savedProfiles[realKey];
            if (savedProfiles[targetUser]) delete savedProfiles[targetUser];
        }

        if (typeof saveAppData === 'function') saveAppData();
        if (typeof renderCustomAccountsTable === 'function') renderCustomAccountsTable();
        if (typeof renderTonCatalog === 'function') renderTonCatalog();
        
        if (typeof showToast === 'function') showToast("AKUN DIHAPUS", `Akun "${targetUser}" berhasil dihapus bersih!`, "success");
    }
}

function toggleVaultLockdown() {
  if (!isDonTier(getUserRank())) {
    showToast("ACCESS DENIED", "Only the Superiors & Moderators have the right to set the Lockdown status!", "error");
    return;
  }
  
  isVaultLockdown = !isVaultLockdown;
  saveAppData();
  updateLockdownUI();
  
  const statusText = isVaultLockdown ? "🔒 EMERGENCY CLOSED ( LOCKDOWN )" : "🔓 OPEN ( OPERATIONAL )";
  const embedColor = isVaultLockdown ? 15158332 : 3066993;
  
  sendDiscordWebhook(
    LOGS_WEBHOOK_URL, 
    "🚨 VAULT OPERATIONAL STATUS CHANGED", 
    `Status operasional brangkas dan pasar persenjataan telah diubah menjadi: **${statusText}** oleh **${currentLoggedInUser.toUpperCase()}**.`, 
    [], 
    embedColor
  );

  showToast("LOCKDOWN STATUS", `Safe now: ${statusText}`, isVaultLockdown ? "error" : "success");
}

function updateLockdownUI() {
  const banner = document.getElementById('lockdown-warning-banner');
  const btnText = document.getElementById('lockdown-btn-text');
  const btnIcon = document.getElementById('lockdown-btn-icon');
  
  if (banner) {
    if (isVaultLockdown) banner.classList.remove('hidden');
    else banner.classList.add('hidden');
  }
  
  if (btnText && btnIcon) {
    if (isVaultLockdown) {
      btnText.innerText = "BUKA KEMBALI BRANGKAS (UNLOCK)";
      btnIcon.setAttribute('data-lucide', 'unlock');
      document.getElementById('btn-lockdown-container')?.classList.replace('bg-red-600', 'bg-emerald-600');
    } else {
      btnText.innerText = "Activate Emergency Mode";
      btnIcon.setAttribute('data-lucide', 'lock');
      document.getElementById('btn-lockdown-container')?.classList.replace('bg-emerald-600', 'bg-red-600');
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

function renderBlacklistTable() {
  const tbody = document.getElementById('blacklist-users-table');
  const countElem = document.getElementById('total-blacklist-count');
  if (!tbody) return;
  
  if (countElem) countElem.innerText = blacklistedUsers.length;
  tbody.innerHTML = '';

  if (blacklistedUsers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="2" class="p-6 text-center text-zinc-500 italic">No accounts have been blacklisted yet.</td></tr>`;
    return;
  }

  blacklistedUsers.forEach((user) => {
    tbody.innerHTML += `
      <tr class="hover:bg-white/[0.02] transition border-b border-[#1e2230] last:border-0">
        <td class="p-3.5 font-bold text-red-400 font-mono flex items-center gap-2">
          <i data-lucide="shield-alert" class="w-4 h-4 shrink-0"></i> ${user.toUpperCase()}
        </td>
        <td class="p-3.5 text-right">
          <button onclick="removeBlacklistUser('${user}')" class="px-3.5 py-1.5 bg-[#131622] hover:bg-emerald-600 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold uppercase transition border border-[#1e2230]">
            Pulihkan (Unfreeze)
          </button>
        </td>
      </tr>
    `;
  });
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function addBlacklistUser() {
  if (getUserRank() !== 'Moderator') {
    showToast("ACCESS DENIED", "Hanya Moderator yang berhak membekukan akun!", "error");
    return;
  }
  const inputElem = document.getElementById('new-blacklist-username');
  const targetUser = inputElem?.value.trim().toLowerCase();

  if (!targetUser) { showToast("WARNING", "Masukkan username Discord/IC yang ingin dibekukan!", "error"); return; }
  if (blacklistedUsers.includes(targetUser)) { showToast("DUPLIKAT", `Akun "${targetUser}" sudah ada di dalam daftar Blacklist!`, "error"); return; }

  blacklistedUsers.push(targetUser);
  saveAppData();
  if (inputElem) inputElem.value = '';
  renderBlacklistTable();
  
  sendDiscordWebhook(LOGS_WEBHOOK_URL, "🛡️ USER ACCOUNT FROZEN", `Moderator **${currentLoggedInUser.toUpperCase()}** telah membekukan (blacklist) akun: **${targetUser.toUpperCase()}**.`, [], 15158332);
  showToast("USER FROZEN", `Akun [${targetUser.toUpperCase()}] berhasil dibekukan!`, "error");
}

function removeBlacklistUser(targetUser) {
  if (getUserRank() !== 'Moderator') {
    showToast("ACCESS DENIED", "Hanya Moderator yang berhak memulihkan akun!", "error");
    return;
  }
  showCustomConfirm("PULIHKAN AKUN", `Lepaskan status Blacklist dari akun [${targetUser.toUpperCase()}]?`, () => {
    blacklistedUsers = blacklistedUsers.filter(u => u !== targetUser);
    saveAppData();
    renderBlacklistTable();
    sendDiscordWebhook(LOGS_WEBHOOK_URL, "🟢 USER ACCOUNT RESTORED", `Moderator **${currentLoggedInUser.toUpperCase()}** telah memulihkan akun: **${targetUser.toUpperCase()}**.`, [], 3066993);
    showToast("USER RESTORED", `Akun [${targetUser.toUpperCase()}] telah dipulihkan!`, "success");
  });
}

function renderStaffKPITable() {
  const tbody = document.getElementById('staff-kpi-table');
  if (!tbody) return;

  let staffStats = {};
  
  adminTransactions.forEach(tx => {
    if (['Approved', 'Released', 'Rejected'].includes(tx.status) && tx.processed && tx.processed !== 'Pending') {
      const staffName = tx.processed.toUpperCase();
      if (!staffStats[staffName]) {
        staffStats[staffName] = { approved: 0, rejected: 0, totalVal: 0 };
      }
      if (tx.status === 'Approved' || tx.status === 'Released') {
        staffStats[staffName].approved++;
        staffStats[staffName].totalVal += tx.total;
      } else if (tx.status === 'Rejected') {
        staffStats[staffName].rejected++;
      }
    }
  });

  const staffNames = Object.keys(staffStats);
  if (staffNames.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-zinc-500 italic">There is no order processing activity by the cashier staff yet.</td></tr>`;
    return;
  }

  staffNames.sort((a, b) => staffStats[b].approved - staffStats[a].approved);

  tbody.innerHTML = '';
  staffNames.forEach((name, idx) => {
    const stat = staffStats[name];
    const totalHandled = stat.approved + stat.rejected;
    const approvalRate = totalHandled > 0 ? Math.round((stat.approved / totalHandled) * 100) : 0;
    
    let badgeColor = idx === 0 ? "bg-amber-500 text-black font-bold" : "bg-[#131622] text-zinc-300 border border-[#1e2230]";

    tbody.innerHTML += `
      <tr class="hover:bg-white/[0.02] transition border-b border-[#1e2230] last:border-0">
        <td class="p-3.5 font-semibold text-white flex items-center gap-2.5">
          <span class="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] ${badgeColor}">#${idx + 1}</span>
          ${name}
        </td>
        <td class="p-3.5 text-center font-semibold text-emerald-400 text-sm">${stat.approved}</td>
        <td class="p-3.5 text-center font-semibold text-red-500 text-sm">${stat.rejected}</td>
        <td class="p-3.5 text-center font-mono text-xs text-zinc-300">${approvalRate}%</td>
        <td class="p-3.5 text-right font-bold text-amber-400 text-sm">$${stat.totalVal.toLocaleString()}</td>
      </tr>
    `;
  });
}

function renderLeaderboard() {
  const container = document.getElementById('spending-leaderboard-list');
  if (!container) return;

  // Memaksa container untuk menggunakan flex vertikal yang rapat
  container.className = "flex flex-col gap-2.5 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin";

  // Tampilan estetik jika belum ada data belanja
  if (orgLeaderboard.length === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-10 text-center bg-[#131622]/50 border border-dashed border-[#1e2230] rounded-xl">
        <div class="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center mb-2">
          <i data-lucide="bar-chart-2" class="w-5 h-5 text-zinc-600"></i>
        </div>
        <p class="text-zinc-500 text-xs">Belum ada riwayat pembelanjaan dari warga.</p>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }

  // Urutkan berdasarkan pengeluaran terbanyak
  orgLeaderboard.sort((a, b) => b.spent - a.spent);
  container.innerHTML = '';

  orgLeaderboard.forEach((user, idx) => {
    let rankBadge = '';
    let rankBoxStyle = 'bg-[#0e1017] border-[#1e2230] text-zinc-400';
    
    // Memberikan warna khusus untuk Top 1, Top 2, dan Top 3
    if (idx === 0) {
      rankBadge = '<span class="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-[9px] rounded uppercase tracking-wider hidden sm:inline-block">Top 1 Spender</span>';
      rankBoxStyle = 'bg-amber-500/20 border-amber-500/30 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.2)]';
    } else if (idx === 1) {
      rankBadge = '<span class="px-2 py-0.5 bg-zinc-400/10 text-zinc-300 border border-zinc-400/20 font-bold text-[9px] rounded uppercase tracking-wider hidden sm:inline-block">Top 2</span>';
      rankBoxStyle = 'bg-zinc-500/20 border-zinc-400/30 text-zinc-300';
    } else if (idx === 2) {
      rankBadge = '<span class="px-2 py-0.5 bg-orange-700/10 text-orange-500 border border-orange-700/20 font-bold text-[9px] rounded uppercase tracking-wider hidden sm:inline-block">Top 3</span>';
      rankBoxStyle = 'bg-orange-900/40 border-orange-700/30 text-orange-500';
    }

    // HTML List Ramping & Presisi (flex-row, h-auto, w-full)
    container.innerHTML += `
      <div class="flex flex-row items-center justify-between py-2.5 px-3.5 bg-[#131622] hover:bg-[#161a29] rounded-xl border border-[#1e2230] hover:border-zinc-500/40 transition-all w-full h-auto shadow-sm">
        
        <!-- Kiri: Nomor Urut, Nama & Role -->
        <div class="flex items-center gap-3.5 min-w-0">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 border ${rankBoxStyle}">
            ${idx + 1}
          </div>
          
          <div class="flex flex-col min-w-0">
            <span class="font-bold text-white text-[13px] leading-tight truncate max-w-[120px] sm:max-w-[200px]">${escapeHtml(user.name)}</span>
            <span class="text-[9px] text-zinc-500 uppercase font-semibold mt-0.5 tracking-wider truncate">${escapeHtml(user.role || 'SOLDIERS')}</span>
          </div>
        </div>

        <!-- Kanan: Badge & Total Pengeluaran -->
        <div class="flex items-center gap-3 text-right shrink-0">
          ${rankBadge}
          <span class="text-[14px] sm:text-[15px] font-bold text-emerald-400 font-mono tracking-wide">$${user.spent.toLocaleString()}</span>
        </div>

      </div>
    `;
  });
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function filterSidebarMenu(query) {
  const q = query.toLowerCase().trim();
  const nav = document.querySelector('aside nav');
  if (!nav) return;

  const allButtons = nav.querySelectorAll('button');
  const dropdownMenus = nav.querySelectorAll('#menu-order, #menu-vault');

  if (!q) {
    allButtons.forEach(btn => btn.style.display = '');
    dropdownMenus.forEach(menu => menu.classList.add('hidden'));
    updateRBACUI(); 
    return;
  }

  allButtons.forEach(btn => {
    const rbacContainer = btn.closest('.admin-only, .mod-only, #nav-group-hq');
    if (rbacContainer && rbacContainer.classList.contains('hidden')) {
      btn.style.display = 'none';
      return;
    }

    const text = btn.innerText.toLowerCase();
    if (text.includes(q)) {
      btn.style.display = 'flex';
      
      const parentDropdown = btn.closest('#menu-order, #menu-vault');
      if (parentDropdown) {
        parentDropdown.classList.remove('hidden');
        const parentToggle = nav.querySelector(`[onclick*="${parentDropdown.id}"]`);
        if (parentToggle) parentToggle.style.display = 'flex';
      }
    } else {
      btn.style.display = 'none';
    }
  });

  dropdownMenus.forEach(menu => {
    const visibleChildren = Array.from(menu.querySelectorAll('button')).filter(b => b.style.display !== 'none');
    const parentToggle = nav.querySelector(`[onclick*="${menu.id}"]`);
    if (visibleChildren.length > 0 && parentToggle) {
      parentToggle.style.display = 'flex';
      menu.classList.remove('hidden');
    }
  });
}

// ============================================================================
// 🪄 FITUR PENGAMAT LIVE (AUTO-KICK & AUTO-RANK) TANPA REFRESH
function checkAndApplyRankChanges() {
    if (!currentLoggedInUser) return; 

    const lowerUser = currentLoggedInUser.toLowerCase();

    // 1. CEK LIVE: APAKAH AKUN DIBEKUKAN
    if (typeof blacklistedUsers !== 'undefined' && blacklistedUsers.includes(lowerUser)) {
        executeForceKick("ACCOUNT FROZEN", "Sesi dihentikan seketika! Akun Anda baru saja dibekukan oleh Moderator.");
        return;
    }

    // 2. CEK LIVE: APAKAH AKUN DIHAPUS (DELETED)?
    let perlindunganMaster = ['admin', 'moderator', 'don', 'underboss', 'bisnis', 'associates', 'xxx', 'xyroo'];
    if (typeof AKUN_MANUAL !== 'undefined') {
        perlindunganMaster = perlindunganMaster.concat(Object.keys(AKUN_MANUAL).map(u => u.toLowerCase()));
    }
    
    const isMaster = perlindunganMaster.includes(lowerUser);
    const inProfile = typeof savedProfiles !== 'undefined' && savedProfiles[lowerUser];
    const inCustom = typeof customAccounts !== 'undefined' && customAccounts[lowerUser];

    // TAMBAHKAN PENGECEKAN AMAN: Pastikan savedProfiles benar-benar sudah ada isinya (bukan objek kosong) sebelum menendang
    if (!isMaster && !inProfile && !inCustom && Object.keys(savedProfiles).length > 2) {
        executeForceKick("ACCOUNT DELETED", "Sesi dihentikan! Akun Anda baru saja dihapus permanen oleh Administrator.");
        return;
    }

    // 🪄 3. CEK LIVE: PERUBAHAN PANGKAT / ROLE
    let latestRank = currentUserRole;
    if (inProfile && inProfile.job) {
        latestRank = inProfile.job;
    } else if (inCustom && inCustom.rank) {
        latestRank = inCustom.rank;
    }

    if (latestRank !== currentUserRole) {
        currentUserRole = latestRank; 
        
        localStorage.setItem('ton_current_session', JSON.stringify({ role: currentUserRole, name: currentLoggedInUser }));
        const roleElem = document.getElementById('user-role-text');
        if (roleElem) roleElem.innerText = currentUserRole.toUpperCase();

        if (typeof updateRBACUI === 'function') updateRBACUI();

        if (typeof canViewAdminPanel === 'function' && !canViewAdminPanel(currentUserRole)) {
            if (typeof switchTab === 'function') switchTab('weapon-shop');
        }
        if (typeof showToast === 'function') showToast("RANK UPDATED", `Sistem mendeteksi perubahan: Pangkat Anda dinaikkan menjadi ${currentUserRole.toUpperCase()}`, "success");
    }
}

// 🥾 FUNGSI BARU: TENDANGAN KELUAR SEKETIKA (LIVE AUTO-KICK)
function executeForceKick(title, message) {
    // 1. Hapus memori sesi login di laptop si target
    localStorage.removeItem('ton_current_session');
    currentLoggedInUser = '';
    currentUserRole = '';

    // 2. Paksa tutup semua modal atau laci yang sedang mereka buka
    document.querySelectorAll('[id$="-modal"]').forEach(m => m.classList.add('hidden'));
    const cartDrawer = document.getElementById('cart-drawer-backdrop');
    if (cartDrawer) cartDrawer.classList.add('hidden');

    // 3. Sembunyikan aplikasi utama, kembalikan mereka ke gerbang login
    const mainApp = document.getElementById('main-app');
    const authGate = document.getElementById('auth-gate');
    if (mainApp) mainApp.classList.add('hidden');
    if (authGate) authGate.classList.remove('hidden');

    // 4. Munculkan peringatan merah dan kunci layar mereka
    if (typeof showToast === 'function') showToast(title, message, "error");
    if (typeof triggerBlockedModal === 'function') triggerBlockedModal();
}

function renderVoucherManager() {
  const table = document.getElementById('voucher-manager-table');
  const countElem = document.getElementById('total-voucher-count');
  if (!table) return;

  if (countElem) countElem.innerText = syndVouchers.length;

  if (syndVouchers.length === 0) {
    table.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-zinc-500 italic">There are no voucher codes stored in the system yet.</td></tr>`;
    return;
  }

  table.innerHTML = '';
  syndVouchers.forEach((v, idx) => {
    const isExpired = v.expiresAt && Date.now() > v.expiresAt;

    const typeLabel = v.type === 'percent' ? `${v.val}% (Persentase)` : `$${v.val.toLocaleString()} (Tunai)`;
    const allowedLabel = v.allowed === 'don_tier' ? `<span class="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] rounded-full font-semibold uppercase">High-ranking officials</span>` : `<span class="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] rounded-full font-semibold uppercase">All Warga</span>`;
    
    let expLabel = `<span class="text-zinc-500 font-mono text-[11px]">Without limit</span>`;
    if (v.expiresAt) {
      const expDate = new Date(v.expiresAt);
      const formattedDate = expDate.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
      expLabel = isExpired ? `<span class="text-red-500 font-bold font-mono text-[11px] line-through">${formattedDate} (Expired)</span>` : `<span class="text-amber-400 font-mono text-[11px]">${formattedDate} WIB</span>`;
    }

    let activeBadge = v.active ? `<span class="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-block">Aktif</span>` : `<span class="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-block">Non-Aktif</span>`;
    if (isExpired) activeBadge = `<span class="px-2.5 py-1 bg-zinc-800 text-zinc-500 border border-zinc-700 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-block">Expired</span>`;

    const toggleBtnText = v.active ? 'Non-Aktifkan' : 'Activate Now';
    const toggleBtnStyle = v.active ? 'bg-[#131622] text-zinc-300 hover:bg-red-600 hover:text-white border border-[#1e2230]' : 'bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm';

    table.innerHTML += `
      <tr class="hover:bg-white/[0.02] transition border-b border-[#1e2230] last:border-0 ${isExpired ? 'opacity-60' : ''}">
        <td class="p-3.5 font-mono font-bold text-white text-sm">${v.code}</td>
        <td class="p-3.5 font-semibold text-emerald-400 text-xs">${typeLabel}</td>
        <td class="p-3.5">${allowedLabel}</td>
        <td class="p-3.5">${expLabel}</td>
        <td class="p-3.5 text-zinc-300 max-w-xs truncate">${v.desc || '-'}</td>
        <td class="p-3.5 text-center">${activeBadge}</td>
        <td class="p-3.5 text-right space-x-1.5 whitespace-nowrap">
          <button onclick="toggleVoucherStatus(${idx})" class="px-3 py-1.5 rounded-xl text-xs transition ${toggleBtnStyle}" ${isExpired ? 'disabled title="Sudah Kadaluarsa"' : ''}>${toggleBtnText}</button>
          <button onclick="deleteVoucher(${idx})" class="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white rounded-xl transition" title="Hapus Permanen"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        </td>
      </tr>
    `;
  });
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function createNewVoucher() {
  if (getUserRank() !== 'Moderator') { 
    showToast("ACCESS DENIED", "Hanya Moderator yang berhak mengelola Voucher!", "error"); 
    return; 
  }
  
  const codeElem = document.getElementById('new-voucher-code');
  const typeElem = document.getElementById('new-voucher-type');
  const valElem = document.getElementById('new-voucher-val');
  const allowedElem = document.getElementById('new-voucher-allowed');
  const durationElem = document.getElementById('new-voucher-duration');
  const descElem = document.getElementById('new-voucher-desc');

  const code = codeElem.value.trim().toUpperCase().replace(/\s+/g, '');
  const type = typeElem.value;
  const val = parseInt(valElem.value);
  const allowed = allowedElem.value;
  const hoursDuration = parseInt(durationElem.value) || 0;
  const desc = descElem.value.trim() || 'Syndicate Promo Code';

  if (!code) { showToast("WARNING", "Kode voucher tidak boleh kosong!", "error"); return; }
  if (isNaN(val) || val <= 0) { showToast("WARNING", "Nilai diskon harus berupa angka lebih dari 0!", "error"); return; }

  const exists = syndVouchers.some(v => v.code === code);
  if (exists) { showToast("DUPLIKAT", `Kode voucher ${code} sudah ada di tabel!`, "error"); return; }

  let expiresAt = null;
  if (hoursDuration > 0) {
    expiresAt = Date.now() + (hoursDuration * 60 * 60 * 1000);
  }

  syndVouchers.push({ code, type, val, allowed, active: true, expiresAt, desc });
  saveAppData();

  codeElem.value = ''; valElem.value = ''; descElem.value = ''; durationElem.value = '0';
  renderVoucherManager();
  showToast("VOUCHER DISIMPAN", `Voucher ${code} berhasil dibuat dan langsung AKTIF!`, "success");
}

function toggleVoucherStatus(index) {
  if (getUserRank() !== 'Moderator') {
    showToast("ACCESS DENIED", "Hanya Moderator yang berhak mengelola Voucher!", "error");
    return;
  }
  if (syndVouchers[index]) {
    if (syndVouchers[index].expiresAt && Date.now() > syndVouchers[index].expiresAt) {
      showToast("WARNING", "Voucher ini sudah kadaluarsa dan tidak bisa diaktifkan lagi!", "error");
      return;
    }
    syndVouchers[index].active = !syndVouchers[index].active;
    saveAppData();
    renderVoucherManager();
    const statText = syndVouchers[index].active ? 'ACTIVATED' : 'DEACTIVATED';
    showToast("STATUS UPDATED", `Voucher ${syndVouchers[index].code} berhasil ${statText}.`, "success");
  }
}

function deleteVoucher(index) {
  if (getUserRank() !== 'Moderator') {
    showToast("ACCESS DENIED", "Only Moderators have the authority to manage vouchers!", "error");
    return;
  }
  if (syndVouchers[index]) {
    showCustomConfirm("HAPUS VOUCHER", `Permanently delete promo code ${syndVouchers[index].code} from the system?`, () => {
      const deletedCode = syndVouchers[index].code;
      syndVouchers.splice(index, 1);
      saveAppData();
      renderVoucherManager();
      showToast("VOUCHER DIHAPUS", `Promo code ${deletedCode} has been removed from the system.`, "error");
    });
  }
}


// ==========================================
// 🔑 ROBOT INJEKSI: TOMBOL GANTI PASSWORD
// ==========================================
setInterval(() => {
    const badgeElem = document.getElementById('profile-rank-badge');
    const btnId = 'change-pwd-btn-force';
    if (badgeElem && !document.getElementById(btnId)) {
        const btnHtml = `<button id="${btnId}" onclick="promptChangePasswordModal()" class="mt-2.5 flex items-center gap-1.5 text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-lg hover:bg-amber-500 hover:text-black transition shadow-sm uppercase font-bold"><i data-lucide="key" class="w-3.5 h-3.5"></i> GANTI PASSWORD</button>`;
        badgeElem.insertAdjacentHTML('afterend', btnHtml);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}, 1000);

function promptChangePasswordModal() {
  const activeName = (currentLoggedInUser || '').toLowerCase();
  if (!customAccounts[activeName]) {
    showToast("AKSES DITOLAK", "Fitur ini khusus untuk akun member (Roster).", "error");
    return;
  }

  const promptInput = document.getElementById('custom-prompt-input');
  if (promptInput) promptInput.type = 'password';

  showCustomPrompt("VERIFIKASI KEAMANAN (1/2)", "Masukkan Password LAMA Anda:", "", (oldPass) => {
      if (!oldPass) { if (promptInput) promptInput.type = 'text'; return; }
      if (customAccounts[activeName].pass !== oldPass) {
        showToast("GAGAL", "Password lama yang Anda masukkan SALAH!", "error");
        if (promptInput) promptInput.type = 'text'; 
        return;
      }

      setTimeout(() => {
          if (promptInput) promptInput.type = 'password'; 
          showCustomPrompt("UBAH PASSWORD (2/2)", "Masukkan Password BARU Anda (Min. 4 karakter):", "", (newPass) => {
              if (promptInput) promptInput.type = 'text'; 
              if (!newPass || newPass.length < 4) {
                showToast("GAGAL", "Ganti password dibatalkan atau terlalu pendek!", "error");
                return;
              }
              customAccounts[activeName].pass = newPass;
              saveAppData();
              showToast("BERHASIL", "Password Anda berhasil diubah!", "success");
            }
          );
      }, 300);
  });
}


// ============================================================================
// 🛡️ PENYEMPURNAAN HAK AKSES MODERATOR (SISTEM KEBAL HURUF BESAR/KECIL)
// ============================================================================

// 1. Pembersih Pembaca Pangkat (Menghapus Spasi Gaib & Huruf Kapital)
function isTopAdmin(rank) { return ['moderator'].includes(String(rank).toLowerCase().trim()); }
function isTopAdmin(rank) { return isDeveloper(rank) || ['moderator'].includes(String(rank).toLowerCase().trim()); }
function isDonTier(rank) { return ['moderator', 'don', 'underboss'].includes(String(rank).toLowerCase().trim()); }
function isBisnisTier(rank) { return ['moderator', 'don', 'underboss', 'bisnis'].includes(String(rank).toLowerCase().trim()); }
function isBisnisTier(rank) { return isDeveloper(rank) || ['moderator', 'don', 'underboss', 'bisnis'].includes(String(rank).toLowerCase().trim()); }
function canViewAdminPanel(rank) { return isDeveloper(rank) || isBisnisTier(rank) || isReadOnlyAdminTier(rank); }
function isReadOnlyAdminTier(rank) { return ['capo', 'captain', 'consigliere'].includes(String(rank).toLowerCase().trim()); }
function canViewAdminPanel(rank) { return isBisnisTier(rank) || isReadOnlyAdminTier(rank); }
function isAssociate(rank) { return String(rank).toLowerCase().trim() === 'associates'; }

// 3. Menimpa fungsi Aksi Moderator agar fleksibel
function addBlacklistUser() {
  if (!isTopAdmin(getUserRank())) { showToast("ACCESS DENIED", "Hanya Moderator yang berhak membekukan akun!", "error"); return; }
  const inputElem = document.getElementById('new-blacklist-username');
  const targetUser = inputElem?.value.trim().toLowerCase();
  if (!targetUser) { showToast("WARNING", "Masukkan username Discord/IC yang ingin dibekukan!", "error"); return; }
  if (blacklistedUsers.includes(targetUser)) { showToast("DUPLIKAT", `Akun "${targetUser}" sudah ada di dalam daftar Blacklist!`, "error"); return; }
  blacklistedUsers.push(targetUser); saveAppData();
  if (inputElem) inputElem.value = ''; renderBlacklistTable();
  sendDiscordWebhook(LOGS_WEBHOOK_URL, "🛡️ USER ACCOUNT FROZEN", `Moderator **${currentLoggedInUser.toUpperCase()}** telah membekukan (blacklist) akun: **${targetUser.toUpperCase()}**.`, [], 15158332);
  showToast("USER FROZEN", `Akun [${targetUser.toUpperCase()}] berhasil dibekukan!`, "error");
}

function removeBlacklistUser(targetUser) {
  if (!isTopAdmin(getUserRank())) { showToast("ACCESS DENIED", "Hanya Moderator yang berhak memulihkan akun!", "error"); return; }
  showCustomConfirm("PULIHKAN AKUN", `Lepaskan status Blacklist dari akun [${targetUser.toUpperCase()}]?`, () => {
    blacklistedUsers = blacklistedUsers.filter(u => u !== targetUser);
    saveAppData(); renderBlacklistTable();
    sendDiscordWebhook(LOGS_WEBHOOK_URL, "🟢 USER ACCOUNT RESTORED", `Moderator **${currentLoggedInUser.toUpperCase()}** telah memulihkan akun: **${targetUser.toUpperCase()}**.`, [], 3066993);
    showToast("USER RESTORED", `Akun [${targetUser.toUpperCase()}] telah dipulihkan!`, "success");
  });
}

function createNewVoucher() {
  if (!isTopAdmin(getUserRank())) { showToast("ACCESS DENIED", "Hanya Moderator yang berhak mengelola Voucher!", "error"); return; }
  const codeElem = document.getElementById('new-voucher-code'); const typeElem = document.getElementById('new-voucher-type'); const valElem = document.getElementById('new-voucher-val'); const allowedElem = document.getElementById('new-voucher-allowed'); const durationElem = document.getElementById('new-voucher-duration'); const descElem = document.getElementById('new-voucher-desc');
  const code = codeElem.value.trim().toUpperCase().replace(/\s+/g, ''); const type = typeElem.value; const val = parseInt(valElem.value); const allowed = allowedElem.value; const hoursDuration = parseInt(durationElem.value) || 0; const desc = descElem.value.trim() || 'Syndicate Promo Code';
  if (!code) { showToast("WARNING", "Kode voucher tidak boleh kosong!", "error"); return; } if (isNaN(val) || val <= 0) { showToast("WARNING", "Nilai diskon harus berupa angka lebih dari 0!", "error"); return; }
  if (syndVouchers.some(v => v.code === code)) { showToast("DUPLIKAT", `Kode voucher ${code} sudah ada di tabel!`, "error"); return; }
  let expiresAt = hoursDuration > 0 ? Date.now() + (hoursDuration * 60 * 60 * 1000) : null;
  syndVouchers.push({ code, type, val, allowed, active: true, expiresAt, desc }); saveAppData();
  codeElem.value = ''; valElem.value = ''; descElem.value = ''; durationElem.value = '0'; renderVoucherManager();
  showToast("VOUCHER DISIMPAN", `Voucher ${code} berhasil dibuat dan langsung AKTIF!`, "success");
}

function toggleVoucherStatus(index) {
  if (!isTopAdmin(getUserRank())) { showToast("ACCESS DENIED", "Hanya Moderator yang berhak mengelola Voucher!", "error"); return; }
  if (syndVouchers[index]) {
    if (syndVouchers[index].expiresAt && Date.now() > syndVouchers[index].expiresAt) { showToast("WARNING", "Voucher ini sudah kadaluarsa dan tidak bisa diaktifkan lagi!", "error"); return; }
    syndVouchers[index].active = !syndVouchers[index].active; saveAppData(); renderVoucherManager();
    showToast("STATUS UPDATED", `Voucher ${syndVouchers[index].code} berhasil diupdate.`, "success");
  }
}

function deleteVoucher(index) {
  if (!isTopAdmin(getUserRank())) { showToast("ACCESS DENIED", "Only Moderators have the authority to manage vouchers!", "error"); return; }
  if (syndVouchers[index]) {
    showCustomConfirm("HAPUS VOUCHER", `Permanently delete promo code ${syndVouchers[index].code} from the system?`, () => {
      const deletedCode = syndVouchers[index].code; syndVouchers.splice(index, 1); saveAppData(); renderVoucherManager();
      showToast("VOUCHER DIHAPUS", `Promo code ${deletedCode} has been removed.`, "error");
    });
  }
}

function triggerSystemReset() {
  if (!isDeveloper(getUserRank())) { showToast("ACCESS DENIED", "The System Reset feature is EXCLUSIVE to the Developer rank!", "error"); return; }
  showCustomConfirm("CONFIRMATION 1/2: SYSTEM RESET", "Warning: Transaction history, cash, and logs will be permanently deleted. (DATA ROSTER & AKUN TETAP AMAN). Are you sure?", () => {
    setTimeout(() => { showCustomConfirm("FINAL CONFIRMATION 2/2: REPEAT WARNING", "This action cannot be undone! Are you absolutely sure?", () => {
        localStorage.removeItem('ton_admin_transactions'); localStorage.removeItem('ton_org_leaderboard'); localStorage.removeItem('ton_metal_scrap');
        adminTransactions = []; orgLeaderboard = []; metalScrapLogs = []; vaultBalance = 0;
        if (typeof saveAppData === 'function') saveAppData();
        showToast("SYSTEM RESET", "Riwayat transaksi berhasil direset! Data Roster AMAN.", "success");
        setTimeout(() => { location.reload(); }, 1500);
      }); }, 300);
  });
}

function deleteCustomAccount(username) {
    if (!isTopAdmin(getUserRank())) { showToast("AKSES DITOLAK", "Hanya Moderator yang bisa menghapus akun.", "error"); return; }
    if (typeof showCustomConfirm === 'function') { showCustomConfirm("Hapus Akun", `Yakin hapus akun "${username}"?`, () => executeDelete(username));
    } else if (confirm(`Yakin hapus akun "${username}"?`)) { executeDelete(username); }

    function executeDelete(targetUser) {
        const lowerTarget = targetUser.toLowerCase();
        if (typeof customAccounts !== 'undefined' && customAccounts[lowerTarget]) delete customAccounts[lowerTarget];
        if (typeof savedProfiles !== 'undefined') {
            const realKey = Object.keys(savedProfiles).find(k => k.toLowerCase() === lowerTarget);
            if (realKey) delete savedProfiles[realKey]; if (savedProfiles[targetUser]) delete savedProfiles[targetUser];
        }
        if (typeof saveAppData === 'function') saveAppData();
        if (typeof renderCustomAccountsTable === 'function') renderCustomAccountsTable();
        if (typeof renderTonCatalog === 'function') renderTonCatalog();
        if (typeof showToast === 'function') showToast("AKUN DIHAPUS", `Akun "${targetUser}" berhasil dihapus bersih!`, "success");
    }
}

// Menimpa pembuka gembok halaman
function switchTab(tabId) {
  if (blacklistedUsers.includes((currentLoggedInUser || '').toLowerCase())) {
    logout(); showToast("ACCOUNT FROZEN", "Sesi dihentikan! Akun Anda baru saja dibekukan oleh Moderator.", "error"); triggerBlockedModal(); return;
  }
  const rank = getUserRank();
  const adminOnlyTabs = ['transaction-process', 'vault-stock', 'release-outstanding', 'vault-history', 'stock-proof', 'metal-scrap'];
  
  if (adminOnlyTabs.includes(tabId) && !canViewAdminPanel(rank) && !isBisnisTier(rank)) {
    showToast("ACCESS DENIED", "The Vault & TON Management area is CONFIDENTIAL!", "error"); switchTab('weapon-shop'); return;
  }
  if ((tabId === 'voucher-manager' || tabId === 'account-manager' || tabId === 'blacklist-manager') && !isTopAdmin(rank)) {
    showToast("ACCESS DENIED", "This feature is EXCLUSIVE to the Moderator rank!", "error"); switchTab('weapon-shop'); return;
  }
  if (tabId === 'backup-audit' && !isDeveloper(rank)) {
    showToast("ACCESS DENIED", "Backup & Audit Log hanya dapat diakses Developer!", "error"); switchTab('weapon-shop'); return;
  }
  if (tabId === 'admin-dashboard' && isAssociate(rank)) {
    showToast("ACCESS DENIED", "Rank Associates does not have permission to access the dashboard..", "error"); switchTab('weapon-shop'); return;
  }

  const allNavButtons = document.querySelectorAll('.nav-btn');
  allNavButtons.forEach(btn => {
    const targetTab = btn.getAttribute('data-tab'); const iconName = getLucideIconForSubmenu(targetTab);
    btn.className = "nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition text-xs list-none" + (btn.dataset.developerOnly === 'true' ? ' developer-only' : '');
    let iconEl = btn.querySelector('[data-lucide]');
    if (!iconEl) btn.insertAdjacentHTML('afterbegin', `<i data-lucide="${iconName}" class="w-4 h-4 shrink-0"></i>`);
    else iconEl.setAttribute('data-lucide', iconName);
  });

  const activeBtn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
  if (activeBtn) activeBtn.className = "nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white font-bold bg-white/10 transition shadow-sm text-xs list-none" + (activeBtn.dataset.developerOnly === 'true' ? ' developer-only developer-access' : '');

  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.add('hidden');
    panel.style.setProperty('display', 'none', 'important');
  });
  const titleMap = {
    'weapon-shop': ['Marketplace Armory', 'Order weaponry and complete the transaction live at the checkout terminal.'], 'my-orders': ['Processing Order', 'Your order process and history.'], 'admin-dashboard': ['Dashboard', 'A detailed summary of the identity, rank, and vault operations of The Old Norse.'], 'transaction-process': ['Resident Order Processing', 'Review, approve, or reject incoming orders from residents.'], 'vault-stock': ['Catalog Inventory', 'Manage inventory items and selling prices, and monitor safe stock levels.'], 'release-outstanding': ['Release Held Balance', 'Manage transactions where stock has already been deducted, pending final settlement to the vault balance.'], 'vault-history': ['Cash Flow History Archive', 'A complete history of all incoming and outgoing transactions for The Old Norse.'], 'stock-proof': ['Upload Stock Photo Proof', 'Attach a screenshot of the stock inventory to validate the database log sent to Discord.'], 'metal-scrap': ['Metal Scrap Inventory & Log', 'Official records of scrap metal intake and usage for crafting purposes.'], 'the-old-norse': ['List Roster The Old Norse', 'List of official internal and family members of The Old Norse.'], 'profile': ['IC Character Profile', 'Detailed information regarding resident identity, population registration number, and occupation.'], 'voucher-manager': ['Syndicate Voucher Manager', 'Manage, activate, and set quotas for discount promo codes for weaponry.'], 'account-manager': ['Account Login Credentials', 'Create and manage custom login username and password combinations for senior staff.'], 'blacklist-manager': ['Account Blacklist & Freeze Control', 'Manage the blacklist and freeze the accounts of residents who violate IC/OOC rules.']
  };
  titleMap['backup-audit'] = ['Backup & Audit Log', 'Secure application data and monitor moderator activity.'];
  titleMap['internal-board'] = ['Internal Message Board', 'Komunikasi internal untuk pengumuman dan koordinasi anggota.'];
  const info = titleMap[tabId] || [tabId.toUpperCase(), 'Dynamic Vault System'];
  document.getElementById('view-title').innerHTML = `<i data-lucide="${tabId === 'admin-dashboard' ? 'layout-dashboard' : 'box'}" class="w-5 h-5 text-amber-400 inline"></i> ` + info[0];
  document.getElementById('view-subtitle').innerText = info[1];
  const target = document.getElementById('tab-' + tabId);
  if (target) {
    target.classList.remove('hidden');
    target.style.setProperty('display', 'block', 'important');
  }
  
  const floatCartBtn = document.getElementById('floating-cart-btn');
  if (floatCartBtn) floatCartBtn.style.display = tabId === 'weapon-shop' ? 'flex' : 'none';

  if (tabId === 'weapon-shop') renderMarketplace(currentMarketplaceFilter);
  if (tabId === 'profile') renderProfilePage();
  if (tabId === 'the-old-norse') renderTonCatalog();
  if (tabId === 'account-manager') renderCustomAccountsTable();
  if (tabId === 'blacklist-manager') renderBlacklistTable();
  if (tabId === 'transaction-process') renderTxProcessTable(true);
  if (tabId === 'vault-stock') renderVaultInventory();
  if (tabId === 'release-outstanding') renderReleaseOutstanding();
  if (tabId === 'vault-history') renderVaultHistory(true);
  if (tabId === 'voucher-manager') renderVoucherManager();
  if (tabId === 'stock-proof') {
    renderStockProofHistory();
    if (document.getElementById('proof-date-auto')) document.getElementById('proof-date-auto').value = new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    if (document.getElementById('proof-member-name')) document.getElementById('proof-member-name').value = (currentLoggedInUser || 'ADMIN').toUpperCase();
  }
  if (tabId === 'metal-scrap') renderMetalScrapLogs();
  if (typeof lucide !== 'undefined') lucide.createIcons();
}


// ============================================================================
// 📦 PENYEMPURNAAN FITUR PRE-ORDER (PO) SYSTEM
// ============================================================================

// 1. ROBOT INJEKSI HTML: Menambahkan opsi "Pre-Order" ke dalam dropdown secara otomatis
setInterval(() => {
    ['new-item-status', 'edit-item-status'].forEach(id => {
        const selectElem = document.getElementById(id);
        if (selectElem && !selectElem.querySelector('option[value="pre_order"]')) {
            selectElem.insertAdjacentHTML('beforeend', '<option value="pre_order" class="text-purple-400 font-bold">Pre-Order (PO)</option>');
        }
    });
}, 1000);

// 2. TIMPA FUNGSI SIMPAN BARANG BARU
function submitNewItem() {
  try {
    const name = document.getElementById('new-item-name')?.value.trim();
    const cat = document.getElementById('new-item-cat')?.value || 'weapon';
    const price = parseInt(document.getElementById('new-item-price')?.value) || 0;
    const base = parseInt(document.getElementById('new-item-base')?.value) || price;
    let stock = parseInt(document.getElementById('new-item-stock')?.value) || 0;
    const restricted = document.getElementById('new-item-restricted')?.value === 'true';
    const desc = document.getElementById('new-item-desc')?.value.trim() || 'Custom Syndicate Armory Item';
    const urlImg = document.getElementById('new-item-img-url')?.value.trim();
    const statusVal = document.getElementById('new-item-status')?.value || 'ready';
    const finalImg = window.tonUploadImgBase64 || urlImg;

    if (!name || price <= 0 || !finalImg) { showToast("WARNING", "Lengkapi form: Nama, Harga, dan Foto!", "error"); return; }

    let badgeVal = "NORMAL";
    if (statusVal === 'coming_soon') { badgeVal = "COMING SOON"; stock = 0; }
    else if (stock <= 0) { badgeVal = "OUT OF STOCK"; } 
    else if (statusVal === 'pre_order') { badgeVal = "PRE-ORDER"; } // <-- DETEKSI PO
    else if (stock <= 5) { badgeVal = "LOW"; }

    vaultInventory.unshift({ name, cat, badge: badgeVal, desc, price, base, stock, img: finalImg, restricted });
    saveAppData(); renderVaultInventory(); renderMarketplace(currentMarketplaceFilter); closeAddItemModal();
    showToast("ITEM ADDED", `${name} berhasil ditambahkan!`, "success");
  } catch (err) { console.error(err); closeAddItemModal(); }
}

// 3. TIMPA FUNGSI EDIT BARANG
function openEditItemModal(index) {
  if (!isBisnisTier(getUserRank())) { showToast("ACCESS DENIED", "Mode Read-Only tidak dapat mengedit barang!", "error"); return; }
  const item = vaultInventory[index]; if (!item) return;
  currentEditItemIndex = index; editItemUploadedBase64 = ''; 

  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  setVal('edit-item-name', item.name || ''); setVal('edit-item-cat', item.cat || 'weapon');
  setVal('edit-item-price', item.price || 0); setVal('edit-item-base', item.base || 0);
  setVal('edit-item-stock', item.stock || 0); setVal('edit-item-restricted', String(Boolean(item.restricted)));
  setVal('edit-item-desc', item.desc || ''); setVal('edit-item-img-url', '');
  
  const statusSelect = document.getElementById('edit-item-status');
  if (statusSelect) {
    if (item.badge === 'COMING SOON') statusSelect.value = 'coming_soon';
    else if (item.badge === 'PRE-ORDER') statusSelect.value = 'pre_order'; // <-- MENAMPILKAN PO DI MODAL
    else statusSelect.value = 'ready';
  }
  if (document.getElementById('edit-item-file')) document.getElementById('edit-item-file').value = '';
  document.getElementById('edit-item-modal').classList.remove('hidden'); lucide.createIcons();
}

function submitEditItem() {
  if (currentEditItemIndex === null) return;
  const item = vaultInventory[currentEditItemIndex]; if (!item) return;

  const name = document.getElementById('edit-item-name')?.value.trim();
  const cat = document.getElementById('edit-item-cat')?.value || 'weapon';
  const price = parseInt(document.getElementById('edit-item-price')?.value) || 0;
  const base = parseInt(document.getElementById('edit-item-base')?.value) || price;
  let stock = parseInt(document.getElementById('edit-item-stock')?.value) || 0;
  const restricted = document.getElementById('edit-item-restricted')?.value === 'true';
  const desc = document.getElementById('edit-item-desc')?.value.trim() || '';
  const urlImg = document.getElementById('edit-item-img-url')?.value.trim();
  const statusVal = document.getElementById('edit-item-status')?.value || 'ready';

  if (!name || price <= 0) return;
  const finalImg = editItemUploadedBase64 || urlImg || item.img;

  let badgeVal = "NORMAL";
  if (statusVal === 'coming_soon') { badgeVal = "COMING SOON"; stock = 0; }
  else if (stock <= 0) { badgeVal = "OUT OF STOCK"; } 
  else if (statusVal === 'pre_order') { badgeVal = "PRE-ORDER"; } // <-- DETEKSI PO
  else if (stock <= 5) { badgeVal = "LOW"; }

  vaultInventory[currentEditItemIndex] = { name, cat, badge: badgeVal, desc, price, base, stock, img: finalImg, restricted };
  saveAppData(); renderVaultInventory(); renderMarketplace(currentMarketplaceFilter); closeEditItemModal();
  showToast("ITEM UPDATED", `Barang berhasil diperbarui menjadi ${badgeVal}!`, "success");
}

// ============================================================================
// 1. FUNGSI RENDER MARKETPLACE (FINAL + PRE-ORDER + W-FULL H-FULL)
// ============================================================================
function renderMarketplace(category = 'all') {
  try {
    const grid = document.getElementById('product-grid');
    if (!grid || typeof vaultInventory === 'undefined') return;

    let filtered = vaultInventory.filter(item => {
      if (!item) return false;
      const itemCat = String(item.cat || 'weapon').toLowerCase();
      if (category === 'all') return true;
      if (category === 'weapon') return itemCat === 'weapon';
      if (category === 'ammo') return itemCat === 'ammo';
      if (category === 'vest') return itemCat === 'vest';
      if (category === 'durgs') return itemCat === 'durgs' || itemCat === 'package';
      if (category === 'attachments') return itemCat === 'attachments' || itemCat.includes('attach');
      if (category === 'tool-heist') return itemCat === 'tool-heist'; return true;
    });

    if (window.tonMarketSearch) {
      filtered = filtered.filter(item => {
        const matchName = String(item.name || '').toLowerCase().includes(window.tonMarketSearch);
        const matchDesc = String(item.desc || '').toLowerCase().includes(window.tonMarketSearch);
        return matchName || matchDesc;
      });
    }

    filtered.sort((a, b) => {
      if (window.tonMarketSort === 'name_asc') return String(a.name || '').localeCompare(String(b.name || ''));
      if (window.tonMarketSort === 'price_desc') return Number(b.price || 0) - Number(a.price || 0);
      if (window.tonMarketSort === 'price_asc') return Number(a.price || 0) - Number(b.price || 0);
      return 0;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="col-span-full py-12 text-center text-zinc-500 italic"><i data-lucide="package-open" class="w-8 h-8 mx-auto mb-2 opacity-30"></i>Item not found.</div>`;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    const htmlBuilder = filtered.map(item => {
      const originalIdx = vaultInventory.indexOf(item);
      const badge = String(item.badge || 'NORMAL').toUpperCase();
      const isComingSoon = badge === 'COMING SOON' || badge === 'COMING_SOON';
      const isPreOrder = badge === 'PRE-ORDER';
      const stockNum = Number(item.stock || 0);
      const isOOS = (stockNum <= 0) && !isComingSoon && !isPreOrder;
      
      let cardBorder = 'border-[#1e2230] hover:border-red-500/50 bg-[#0e1017] shadow-sm';
      if (isComingSoon) cardBorder = 'border-emerald-500/60 bg-[#0e1017] shadow-[0_0_15px_rgba(16,185,129,0.15)]';
      else if (isPreOrder) cardBorder = 'border-purple-500/50 hover:border-purple-400 bg-[#0e1017] shadow-[0_0_15px_rgba(168,85,247,0.10)]';
      else if (isOOS) cardBorder = 'border-red-900/60 opacity-60 bg-red-950/10';

      const imgStyle = isOOS ? 'grayscale opacity-40' : (isComingSoon ? 'opacity-80 group-hover:scale-105 transition duration-300' : 'group-hover:scale-105 transition duration-300 drop-shadow-md');

      let badgeText = String(item.cat || 'ITEM').toUpperCase();
      let badgeStyle = 'bg-[#131622] border-[#1e2230] text-zinc-400';
      if (isComingSoon) { badgeText = 'COMING SOON'; badgeStyle = 'bg-pink-500/10 border-pink-500/30 text-pink-500 font-bold'; }
      else if (isPreOrder) { badgeText = 'PRE-ORDER'; badgeStyle = 'bg-purple-500/10 border-purple-500/30 text-purple-400 font-bold'; }
      else if (isOOS) { badgeText = 'OUT OF STOCK'; badgeStyle = 'bg-red-500/10 border-red-500/20 text-red-500'; }

      let priceHtml = `<span class="text-emerald-400 font-bold text-sm">$${Number(item.price || 0).toLocaleString()}</span>`;
      if (isComingSoon) priceHtml = `<span class="text-zinc-600 font-bold tracking-widest text-sm uppercase">LOCKED</span>`;
      else if (isPreOrder) priceHtml = `<span class="text-purple-400 font-bold text-sm">$${Number(item.price || 0).toLocaleString()}</span>`;

      let actionButtonHtml = '';
      if (isComingSoon) {
        actionButtonHtml = `<div class="w-full pt-1"><button disabled class="w-full bg-[#131622] border border-[#1e2230] text-zinc-600 font-bold py-2 rounded-xl text-xs uppercase tracking-wider cursor-not-allowed text-center transition">UNAVAILABLE</button></div>`;
      } else if (isOOS) {
        actionButtonHtml = `<span class="text-[10px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg">STOK KOSONG</span><button disabled class="bg-[#131622] text-zinc-600 font-bold px-3 py-1.5 rounded-xl text-xs cursor-not-allowed">KOSONG</button>`;
      } else if (isPreOrder) {
        actionButtonHtml = `<span class="text-[10px] text-purple-400 flex items-center gap-1.5 font-medium"><span class="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span> Sisa Slot (${stockNum})</span><button onclick="addToCartSimple(${originalIdx})" class="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-3 py-1.5 rounded-xl text-xs transition shadow-md shadow-purple-600/20 flex items-center gap-1.5 ml-auto"><i data-lucide="clock" class="w-3.5 h-3.5 inline"></i> Pre-Order</button>`;
      } else {
        actionButtonHtml = `<span class="text-[10px] text-zinc-400 flex items-center gap-1.5 font-medium"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Ready (${stockNum})</span><button onclick="addToCartSimple(${originalIdx})" class="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-1.5 rounded-xl text-xs transition shadow-md shadow-red-600/20 flex items-center gap-1.5 ml-auto"><i data-lucide="shopping-cart" class="w-3.5 h-3.5 inline"></i> Buy</button>`;
      }

      return `
        <div class="product-card w-full h-full border rounded-2xl p-4 flex flex-col justify-between group transition duration-200 ${cardBorder}">
          <div>
            <div class="h-44 bg-[#131622] rounded-xl border border-[#1e2230] flex items-center justify-center overflow-hidden mb-3 p-3 relative">
              <img src="${item.img || ''}" alt="${item.name || ''}" class="h-full object-contain ${imgStyle}" loading="lazy">
              <span class="absolute top-2.5 right-2.5 px-2 py-0.5 border rounded-lg text-[9px] font-bold uppercase backdrop-blur-sm ${badgeStyle}">${badgeText}</span>
            </div>
            <div class="flex justify-between items-start mb-1">
              <h3 class="text-base font-bold text-white transition tracking-wide group-hover:text-red-400">${item.name || 'Unnamed Item'}</h3>
              ${priceHtml}
            </div>
            <p class="text-[11px] text-zinc-400 line-clamp-2 min-h-[32px]">${item.desc || ''}</p>
          </div>
          <div class="pt-3 border-t border-[#1e2230] mt-4 flex items-center justify-between gap-2">
            ${actionButtonHtml}
          </div>
        </div>
      `;
    }).join('');

    grid.innerHTML = htmlBuilder;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  } catch (e) {
    console.error("Error renderMarketplace:", e);
  }
}

// ============================================================================
// TIMPA FUNGSI RENDER INVENTORY (FIX GRID LAYOUT FINAL)
// ============================================================================
function renderVaultInventory() {
  try {
    const grid = document.getElementById('vault-inventory-grid') || document.getElementById('inventory-grid') || document.getElementById('logs-inventory-grid');
    if (!grid) return;

    // 🚨 KUNCI PERBAIKAN: Paksa container HTML menjadi Grid 4 Kolom dari JS
    grid.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full";
    
    const activeFilter = typeof activeInventoryFilter !== 'undefined' ? activeInventoryFilter : 'all';
    
    const filteredItems = typeof vaultInventory !== 'undefined' ? vaultInventory.filter(item => {
      const itemCat = String(item.cat || 'weapon').toLowerCase();
      if (activeFilter === 'all') return true;
      return (itemCat === activeFilter || (activeFilter === 'durgs' && itemCat === 'package') || (activeFilter === 'attachments' && itemCat.includes('attach')));
    }) : [];
    
    const totCount = document.getElementById('total-inventory-count'); 
    if(totCount) totCount.innerText = filteredItems.length;
    
    grid.innerHTML = '';
    if (filteredItems.length === 0) return;

    const isWritable = typeof isBisnisTier === 'function' ? isBisnisTier(typeof getUserRank === 'function' ? getUserRank() : '') : false;

    filteredItems.forEach((item) => {
      const originalIdx = vaultInventory.indexOf(item);
      const badge = String(item.badge || 'NORMAL').toUpperCase();
      
      let badgeStyle = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      if (badge === 'COMING SOON') badgeStyle = 'bg-pink-500/10 text-pink-500 border border-pink-500/30 font-bold';
      else if (badge === 'PRE-ORDER') badgeStyle = 'bg-purple-500/10 text-purple-400 border border-purple-500/30 font-bold'; 
      else if (badge === 'OUT OF STOCK') badgeStyle = 'bg-red-500/10 text-red-500 border border-red-500/20';
      else if (badge === 'LOW') badgeStyle = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      
      let stockBtns = isWritable ? 
        `<button onclick="changeStock(${originalIdx}, -1)" class="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center font-bold shrink-0">-</button>
         <button onclick="changeStock(${originalIdx}, 1)" class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold shrink-0">+</button>
         <button onclick="openEditItemModal(${originalIdx})" class="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center ml-0.5 shrink-0"><i data-lucide="edit-3" class="w-3.5 h-3.5"></i></button>
         <button onclick="deleteInventoryItem(${originalIdx})" class="w-7 h-7 rounded-lg bg-[#131622] text-zinc-400 hover:bg-red-600 hover:text-white flex items-center justify-center ml-0.5 border border-[#1e2230] shrink-0"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>` 
         : '';

      grid.innerHTML += `
        <div class="bg-[#0e1017] w-full h-full border border-[#1e2230] rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-500 transition shadow-sm">
          <div>
            <div class="h-36 bg-[#131622] rounded-xl border border-[#1e2230] flex items-center justify-center overflow-hidden mb-5 p-3 relative group">
              <img src="${item.img || ''}" class="h-full object-contain group-hover:scale-105 transition duration-300">
            </div>
            <div class="flex items-center justify-between gap-2 pt-1 mb-2">
              <h3 class="font-bold text-white text-base truncate leading-relaxed">${item.name} <span class="px-2 py-0.5 bg-[#131622] border border-[#1e2230] text-zinc-400 text-[10px] rounded-md ml-1.5 align-middle">${String(item.cat).toUpperCase()}</span></h3>
              <span class="px-2.5 py-1 text-[9px] font-bold rounded-full uppercase shrink-0 ${badgeStyle}">${badge}</span>
            </div>
            <p class="text-xs text-zinc-400 line-clamp-2 min-h-[32px] mt-2">${item.desc}</p>
          </div>
          <div class="border-t border-[#1e2230] pt-3 mt-4 space-y-3">
            <div class="w-full bg-[#131622]/60 p-2.5 rounded-xl border border-[#1e2230]">
              <span class="text-[10px] text-zinc-500 block uppercase font-semibold">Selling / Base Price</span>
              <div class="flex items-baseline gap-1.5 mt-0.5"><span class="text-lg font-bold font-tech text-amber-400">$${Number(item.price).toLocaleString()}</span><span class="text-xs text-zinc-500 font-mono">($${Number(item.base||item.price).toLocaleString()})</span></div>
            </div>
            <div class="flex items-center justify-between gap-2 pt-0.5">
              <div class="flex items-center gap-1.5 bg-[#131622] px-2.5 py-1.5 rounded-xl border border-[#1e2230]"><span class="text-[10px] text-zinc-400 uppercase font-semibold">Stock / Slot:</span><span class="text-sm font-bold text-white font-mono">${Number(item.stock)}</span></div>
              <div class="flex items-center gap-1 shrink-0 ml-auto">${stockBtns}</div>
            </div>
          </div>
        </div>
      `;
    }); 
    if(typeof lucide !== 'undefined') lucide.createIcons();
  } catch (err) {
    console.error("Error renderVaultInventory:", err);
  }
}

// ============================================================================
// 🛡️ PERBAIKAN MUTLAK: MENGEMBALIKAN FOLDER UTAMA & FITUR BISNIS
// ============================================================================

function updateRBACUI() {
  const rank = getUserRank();
  const safeRank = String(rank).toLowerCase().trim();
  const isWritable = isBisnisTier(rank); // Bisnis, Don, Moderator (Punya fitur Edit/Aksi)
  const canView = canViewAdminPanel(rank); // Capo ke atas (Bisa melihat menu)

  // 🚨 KUNCI UTAMA YANG KEMBALI DITAMBAHKAN: Membuka Folder Induk (Transaction & Order)
  document.querySelectorAll('.admin-only').forEach(el => {
    if (canView) el.classList.remove('hidden');
    else el.classList.add('hidden');
  });

  // Fitur eksklusif khusus Moderator
  document.querySelectorAll('.mod-only').forEach(el => {
    if (isTopAdmin(rank)) el.classList.remove('hidden');
    else el.classList.add('hidden');
  });

  document.querySelectorAll('.developer-only').forEach(el => {
    if (isDeveloper(rank)) {
      el.classList.add('developer-access');
      if (el.classList.contains('tab-panel')) {
        el.style.removeProperty('display');
      } else {
        el.classList.remove('hidden');
        el.style.setProperty('display', 'flex', 'important');
      }
    } else {
      el.classList.add('hidden');
      el.classList.remove('developer-access');
      el.style.setProperty('display', 'none', 'important');
    }
  });

  // Menampilkan sub-menu di kiri layar
  const adminTabs = ['transaction-process', 'vault-stock', 'release-outstanding', 'vault-history', 'stock-proof', 'metal-scrap'];
  adminTabs.forEach(tab => {
     const btn = document.querySelector(`.nav-btn[data-tab="${tab}"]`);
     if (btn) btn.style.display = canView ? 'flex' : 'none';
  });

  // 🟢 Menampilkan Tombol "+ Add Item" & Aksi Khusus untuk Bisnis, Don, dan Moderator
  const actionBars = ['inventory-action-bar', 'outstanding-action-bar', 'proof-action-bar', 'scrap-action-bar'];
  actionBars.forEach(id => {
      const bar = document.getElementById(id);
      if (bar) bar.style.display = isWritable ? 'flex' : 'none';
  });

  // Sembunyikan Dashboard khusus untuk pangkat paling bawah (Associates)
  const navHq = document.getElementById('nav-group-hq');
  if (navHq) {
    if (isAssociate(rank)) navHq.classList.add('hidden');
    else navHq.classList.remove('hidden');
  }
}

// 2. TIMPA switchTab agar mereka diizinkan masuk ke halaman tersebut
function switchTab(tabId) {
  if (blacklistedUsers.includes((currentLoggedInUser || '').toLowerCase())) {
    logout(); showToast("ACCOUNT FROZEN", "Sesi dihentikan! Akun Anda baru saja dibekukan oleh Moderator.", "error"); triggerBlockedModal(); return;
  }
  
  const rank = getUserRank();
  const safeRank = String(rank).toLowerCase().trim();
  const canView = canViewAdminPanel(rank); 

  // Pengecekan Akses Menu Admin / Transaksi
  const adminOnlyTabs = ['transaction-process', 'vault-stock', 'release-outstanding', 'vault-history', 'stock-proof', 'metal-scrap'];
  
  // Jika mencoba masuk ke menu Admin TAPI pangkatnya tidak diizinkan melihat (canView)
  if (adminOnlyTabs.includes(tabId) && !canView) {
    showToast("ACCESS DENIED", "Area Manajemen Vault ini BERSIFAT RAHASIA!", "error");
    switchTab('weapon-shop'); return;
  }

  if ((tabId === 'voucher-manager' || tabId === 'account-manager' || tabId === 'blacklist-manager') && !isTopAdmin(rank)) {
    showToast("ACCESS DENIED", "Fitur ini EKSKLUSIF hanya untuk Moderator!", "error"); switchTab('weapon-shop'); return;
  }
  if (tabId === 'admin-dashboard' && isAssociate(rank)) {
    showToast("ACCESS DENIED", "Rank Associates tidak diizinkan melihat dashboard.", "error"); switchTab('weapon-shop'); return;
  }

  const allNavButtons = document.querySelectorAll('.nav-btn');
  allNavButtons.forEach(btn => {
    const targetTab = btn.getAttribute('data-tab'); const iconName = getLucideIconForSubmenu(targetTab);
    btn.className = "nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition text-xs list-none" + (btn.dataset.developerOnly === 'true' ? ' developer-only' : '');
    if (btn.style.display !== 'none') {
        let iconEl = btn.querySelector('[data-lucide]');
        if (!iconEl) btn.insertAdjacentHTML('afterbegin', `<i data-lucide="${iconName}" class="w-4 h-4 shrink-0"></i>`);
        else iconEl.setAttribute('data-lucide', iconName);
    }
  });

  const activeBtn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
  if (activeBtn) activeBtn.className = "nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white font-bold bg-white/10 transition shadow-sm text-xs list-none";

  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.add('hidden');
    panel.style.setProperty('display', 'none', 'important');
  });
  const titleMap = {
    'weapon-shop': ['Marketplace Armory', 'Order weaponry and complete the transaction live at the checkout terminal.'], 'my-orders': ['Processing Order', 'Your order process and history.'], 'admin-dashboard': ['Dashboard', 'A detailed summary of the identity, rank, and vault operations of The Old Norse.'], 'transaction-process': ['Resident Order Processing', 'Review, approve, or reject incoming orders from residents.'], 'vault-stock': ['Catalog Inventory', 'Manage inventory items and selling prices, and monitor safe stock levels.'], 'release-outstanding': ['Release Held Balance', 'Manage transactions where stock has already been deducted, pending final settlement to the vault balance.'], 'vault-history': ['Cash Flow History Archive', 'A complete history of all incoming and outgoing transactions for The Old Norse.'], 'stock-proof': ['Upload Stock Photo Proof', 'Attach a screenshot of the stock inventory to validate the database log sent to Discord.'], 'metal-scrap': ['Metal Scrap Inventory & Log', 'Official records of scrap metal intake and usage for crafting purposes.'], 'the-old-norse': ['List Roster The Old Norse', 'List of official internal and family members of The Old Norse.'], 'profile': ['IC Character Profile', 'Detailed information regarding resident identity, population registration number, and occupation.'], 'voucher-manager': ['Syndicate Voucher Manager', 'Manage, activate, and set quotas for discount promo codes for weaponry.'], 'account-manager': ['Account Login Credentials', 'Create and manage custom login username and password combinations for senior staff.'], 'blacklist-manager': ['Account Blacklist & Freeze Control', 'Manage the blacklist and freeze the accounts of residents who violate IC/OOC rules.']
  };
  const info = titleMap[tabId] || [tabId.toUpperCase(), 'Dynamic Vault System'];
  document.getElementById('view-title').innerHTML = `<i data-lucide="${tabId === 'admin-dashboard' ? 'layout-dashboard' : 'box'}" class="w-5 h-5 text-amber-400 inline"></i> ` + info[0];
  document.getElementById('view-subtitle').innerText = info[1];
  const target = document.getElementById('tab-' + tabId);
  if (target) target.classList.remove('hidden');
  
  const floatCartBtn = document.getElementById('floating-cart-btn');
  if (floatCartBtn) floatCartBtn.style.display = tabId === 'weapon-shop' ? 'flex' : 'none';

  if (tabId === 'weapon-shop') renderMarketplace(currentMarketplaceFilter);
  if (tabId === 'profile') renderProfilePage();
  if (tabId === 'the-old-norse') renderTonCatalog();
  if (tabId === 'account-manager') renderCustomAccountsTable();
  if (tabId === 'blacklist-manager') renderBlacklistTable();
  if (tabId === 'transaction-process') renderTxProcessTable(true);
  if (tabId === 'vault-stock') renderVaultInventory();
  if (tabId === 'release-outstanding') renderReleaseOutstanding();
  if (tabId === 'vault-history') renderVaultHistory(true);
  if (tabId === 'voucher-manager') renderVoucherManager();
  if (tabId === 'stock-proof') {
    renderStockProofHistory();
    if (document.getElementById('proof-date-auto')) document.getElementById('proof-date-auto').value = new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    if (document.getElementById('proof-member-name')) document.getElementById('proof-member-name').value = (currentLoggedInUser || 'ADMIN').toUpperCase();
  }
  if (tabId === 'metal-scrap') renderMetalScrapLogs();
  if (typeof lucide !== 'undefined') lucide.createIcons();
}


// ============================================================================
// 🛡️ REVISI HAK AKSES: DON KEMBALI MENDAPATKAN HAK EDIT HARGA & STOK
// ============================================================================

// 1. Moderator adalah pemegang kekuasaan tertinggi mutlak
function isTopAdmin(rank) { return ['moderator'].includes(String(rank).toLowerCase().trim()); }

// 2. Don Tier (Akses ubah Roster & Lockdown)
function isDonTier(rank) { return ['moderator', 'don', 'underboss'].includes(String(rank).toLowerCase().trim()); }

// 🚨 3. KUNCI UTAMA: Hak Tulis / Edit / Approve HANYA untuk Moderator, DON, & Bisnis
// (Don dimasukkan kembali ke sini agar bisa mengedit harga)
function isBisnisTier(rank) { return ['moderator', 'don', 'bisnis'].includes(String(rank).toLowerCase().trim()); }
function isBisnisTier(rank) { return isDeveloper(rank) || ['moderator', 'don', 'bisnis'].includes(String(rank).toLowerCase().trim()); }
function canViewAdminPanel(rank) { return isDeveloper(rank) || isBisnisTier(rank) || isReadOnlyAdminTier(rank); }

// 🚨 4. KUNCI KEDUA: Underboss, Consigliere, Captain, Capo TETAP di kelompok Read-Only (Penonton)
// (Don sudah dikeluarkan dari sini)
function isReadOnlyAdminTier(rank) { return ['underboss', 'consigliere', 'captain', 'capo'].includes(String(rank).toLowerCase().trim()); }

function canViewAdminPanel(rank) { return isBisnisTier(rank) || isReadOnlyAdminTier(rank); }
function isAssociate(rank) { return String(rank).toLowerCase().trim() === 'associates'; }


// ============================================================================
// 🛡️ REVISI MUTLAK: MENGHILANGKAN 4 TOMBOL AKSI UNTUK RANK READ-ONLY
// ============================================================================

function renderVaultInventory() {
  try {
    const grid = document.getElementById('vault-inventory-grid') || document.getElementById('inventory-grid');
    if (!grid) return;
    const activeFilter = typeof activeInventoryFilter !== 'undefined' ? activeInventoryFilter : 'all';
    
    const filteredItems = vaultInventory.filter(item => {
      const itemCat = String(item.cat || 'weapon').toLowerCase();
      if (activeFilter === 'all') return true;
      return (itemCat === activeFilter || (activeFilter === 'durgs' && itemCat === 'package') || (activeFilter === 'attachments' && itemCat.includes('attach')));
    });
    
    if (document.getElementById('total-inventory-count')) document.getElementById('total-inventory-count').innerText = filteredItems.length;
    grid.innerHTML = '';
    if (filteredItems.length === 0) return;

    // 🚨 KUNCI UTAMA: Mengecek apakah user adalah Moderator atau Bisnis
    const isWritable = isBisnisTier(getUserRank()); 

    filteredItems.forEach((item) => {
      const originalIdx = vaultInventory.indexOf(item);
      const badge = String(item.badge || 'NORMAL').toUpperCase();
      
      let badgeStyle = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      if (badge === 'COMING SOON') badgeStyle = 'bg-pink-500/10 text-pink-500 border border-pink-500/30 font-bold';
      else if (badge === 'PRE-ORDER') badgeStyle = 'bg-purple-500/10 text-purple-400 border border-purple-500/30 font-bold'; 
      else if (badge === 'OUT OF STOCK') badgeStyle = 'bg-red-500/10 text-red-500 border border-red-500/20';
      else if (badge === 'LOW') badgeStyle = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      
      // 🚨 JIKA isWritable FALSE (Seperti Underboss, Don, dll), MAKA KE-4 TOMBOL INI AKAN KOSONG/HILANG
      let stockBtns = isWritable ? 
        `<button onclick="changeStock(${originalIdx}, -1)" class="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center font-bold shrink-0">-</button>
         <button onclick="changeStock(${originalIdx}, 1)" class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold shrink-0">+</button>
         <button onclick="openEditItemModal(${originalIdx})" class="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center ml-0.5 shrink-0"><i data-lucide="edit-3" class="w-3.5 h-3.5"></i></button>
         <button onclick="deleteInventoryItem(${originalIdx})" class="w-7 h-7 rounded-lg bg-[#131622] text-zinc-400 hover:bg-red-600 hover:text-white flex items-center justify-center ml-0.5 border border-[#1e2230] shrink-0"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>` 
         : '';

      grid.innerHTML += `
        <div class="bg-[#0e1017] border border-[#1e2230] rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-500 transition shadow-sm">
          <div>
            <div class="h-36 bg-[#131622] rounded-xl border border-[#1e2230] flex items-center justify-center overflow-hidden mb-5 p-3 relative group"><img src="${item.img || ''}" class="h-full object-contain group-hover:scale-105 transition duration-300"></div>
            <div class="flex items-center justify-between gap-2 pt-1 mb-2"><h3 class="font-bold text-white text-base truncate leading-relaxed">${item.name} <span class="px-2 py-0.5 bg-[#131622] border border-[#1e2230] text-zinc-400 text-[10px] rounded-md ml-1.5 align-middle">${String(item.cat).toUpperCase()}</span></h3><span class="px-2.5 py-1 text-[9px] font-bold rounded-full uppercase shrink-0 ${badgeStyle}">${badge}</span></div>
            <p class="text-xs text-zinc-400 line-clamp-2 min-h-[32px] mt-2">${item.desc}</p>
          </div>
          <div class="border-t border-[#1e2230] pt-3 mt-4 space-y-3">
            <div class="w-full bg-[#131622]/60 p-2.5 rounded-xl border border-[#1e2230]">
              <span class="text-[10px] text-zinc-500 block uppercase font-semibold">Selling / Base Price</span>
              <div class="flex items-baseline gap-1.5 mt-0.5"><span class="text-lg font-bold font-tech text-amber-400">$${Number(item.price).toLocaleString()}</span><span class="text-xs text-zinc-500 font-mono">($${Number(item.base||item.price).toLocaleString()})</span></div>
            </div>
            <div class="flex items-center justify-between gap-2 pt-0.5">
              <div class="flex items-center gap-1.5 bg-[#131622] px-2.5 py-1.5 rounded-xl border border-[#1e2230]"><span class="text-[10px] text-zinc-400 uppercase font-semibold">Stock / Slot:</span><span class="text-sm font-bold text-white font-mono">${Number(item.stock)}</span></div>
              <div class="flex items-center gap-1 shrink-0 ml-auto">${stockBtns}</div>
            </div>
          </div>
        </div>
      `;
    }); lucide.createIcons();
  } catch (err) {}
}



// ============================================================================
// 🛡️ KUNCI MUTLAK LOCKDOWN: HANYA MODERATOR YANG BISA MENGKLIK
// ============================================================================

// 1. Robot Penyembunyi Tombol (Menghilangkan tombol dari layar Don/Underboss)
setInterval(() => {
    document.querySelectorAll('button').forEach(btn => {
        const onclickStr = btn.getAttribute('onclick') || '';
        // Cari tombol yang memiliki fungsi lockdown
        if (onclickStr.toLowerCase().includes('lockdown')) {
            if (!isTopAdmin(getUserRank())) {
                btn.style.display = 'none'; // Sembunyikan jika bukan Moderator
            } else {
                btn.style.display = ''; // Munculkan jika Moderator
            }
        }
    });
}, 1000);

// 2. Sistem Pencegat (Mencegah paksaan klik dari Inspect Element / Console)
const fungsiLockdownAsli = window.toggleVaultLockdown || window.toggleLockdown;

if (typeof fungsiLockdownAsli === 'function') {
    const pengamanLockdown = function() {
        if (!isTopAdmin(getUserRank())) {
            if (typeof showToast === 'function') {
                showToast("ACCESS DENIED", "Otoritas ditolak! Hanya Moderator yang diizinkan mengaktifkan Lockdown.", "error");
            }
            return; // Tendang! Jangan izinkan sistem terkunci
        }
        // Jika yang klik benar-benar Moderator, lanjutkan fungsi aslinya
        fungsiLockdownAsli.apply(this, arguments);
    };

    // Timpa fungsi asli di sistem dengan fungsi yang sudah diamankan
    if (window.toggleVaultLockdown) window.toggleVaultLockdown = pengamanLockdown;
    if (window.toggleLockdown) window.toggleLockdown = pengamanLockdown;
}

// ============================================================================
// 🚀 FINAL RELEASE RBAC: ATURAN HIERARKI KESELURUHAN MUTLAK (REVISI ASSOCIATES)
// ============================================================================

// 1. FUNGSI PEMBACA RANK UTAMA
function getUserRank() {
  const lowerUser = (typeof currentLoggedInUser !== 'undefined' ? currentLoggedInUser : '').toLowerCase();
  if (typeof savedProfiles !== 'undefined' && savedProfiles[lowerUser] && savedProfiles[lowerUser].job) {
      return savedProfiles[lowerUser].job;
  }
  return typeof currentUserRole !== 'undefined' ? currentUserRole : 'Soldiers';
}

function isTopAdmin(rank) { return isDeveloper(rank) || ['moderator'].includes(String(rank).toLowerCase().trim()); }
function isDonTier(rank) { return isDeveloper(rank) || ['moderator', 'don'].includes(String(rank).toLowerCase().trim()); }
function isBisnisTier(rank) { return isDeveloper(rank) || ['moderator', 'don', 'bisnis'].includes(String(rank).toLowerCase().trim()); }
function isReadOnlyAdminTier(rank) { return isDeveloper(rank) || ['underboss', 'consigliere', 'hood father', 'hoodfather', 'captain', 'capo'].includes(String(rank).toLowerCase().trim()); }
function canViewAdminPanel(rank) { return isDeveloper(rank) || isBisnisTier(rank) || isReadOnlyAdminTier(rank); }
function isAssociate(rank) { return String(rank).toLowerCase().trim() === 'associates'; }

// 2. TIMPA SISTEM UI MENU KIRI (SIDEBAR)
function updateRBACUI() {
  const rank = getUserRank();
  const safeRank = String(rank).toLowerCase().trim();
  const isWritable = isBisnisTier(rank); 
  const canView = canViewAdminPanel(rank);

  // Fitur khusus Moderator
  document.querySelectorAll('.mod-only').forEach(el => {
    if (isTopAdmin(rank)) el.classList.remove('hidden');
    else el.classList.add('hidden');
  });

  // Buka Folder Transaction & Order untuk Writable & Read-Only
  document.querySelectorAll('.admin-only').forEach(el => {
    if (canView) el.classList.remove('hidden');
    else el.classList.add('hidden');
  });

  // Menampilkan Sub-Menu Transaksi
  const adminTabs = ['transaction-process', 'vault-stock', 'release-outstanding', 'vault-history', 'stock-proof', 'metal-scrap'];
  adminTabs.forEach(tab => {
     const btn = document.querySelector(`.nav-btn[data-tab="${tab}"]`);
     if (btn) btn.style.display = canView ? 'flex' : 'none';
  });

  // 🚨 BLOKIR Tombol List Roster di menu kiri KHUSUS UNTUK BISNIS
  const rosterBtn = document.querySelector(`.nav-btn[data-tab="the-old-norse"]`);
  if (rosterBtn) {
     rosterBtn.style.display = safeRank === 'bisnis' ? 'none' : 'flex';
  }

  // Tampilkan Tombol Aksi (+ Add Item) khusus Writable (Mod, Don, Bisnis)
  const actionBars = ['inventory-action-bar', 'outstanding-action-bar', 'proof-action-bar', 'scrap-action-bar'];
  actionBars.forEach(id => {
      const bar = document.getElementById(id);
      if (bar) bar.style.display = isWritable ? 'flex' : 'none';
  });

  // 🟢 DASHBOARD TERBUKA UNTUK SEMUA RANK (Termasuk Associates & Soldiers)
  const navHq = document.getElementById('nav-group-hq');
  if (navHq) {
     navHq.classList.remove('hidden');
  }
}

// 3. TIMPA SISTEM PERPINDAHAN HALAMAN (SATELIT PENGAWAS MUTLAK)
function switchTab(tabId) {
  if (!isDeveloper(getUserRank()) && typeof blacklistedUsers !== 'undefined' && blacklistedUsers.includes((currentLoggedInUser || '').toLowerCase())) {
    if(typeof logout === 'function') logout(); 
    if(typeof showToast === 'function') showToast("ACCOUNT FROZEN", "Sesi dihentikan! Akun Anda dibekukan.", "error"); 
    if(typeof triggerBlockedModal === 'function') triggerBlockedModal(); return;
  }
  
  const rank = getUserRank();
  const safeRank = String(rank).toLowerCase().trim();
  const canView = canViewAdminPanel(rank); 

  const adminOnlyTabs = ['transaction-process', 'vault-stock', 'release-outstanding', 'vault-history', 'stock-proof', 'metal-scrap'];
  if (adminOnlyTabs.includes(tabId) && !canView) {
    if(typeof showToast === 'function') showToast("ACCESS DENIED", "Area Manajemen Vault BERSIFAT RAHASIA!", "error"); switchTab('weapon-shop'); return;
  }

  if ((tabId === 'voucher-manager' || tabId === 'account-manager' || tabId === 'blacklist-manager') && !isTopAdmin(rank)) {
    if(typeof showToast === 'function') showToast("ACCESS DENIED", "Fitur ini EKSKLUSIF hanya untuk Moderator!", "error"); switchTab('weapon-shop'); return;
  }
  if (tabId === 'backup-audit' && !isDeveloper(rank)) {
    if(typeof showToast === 'function') showToast("ACCESS DENIED", "Backup & Audit Log hanya dapat diakses Developer!", "error"); switchTab('weapon-shop'); return;
  }

  // 🚨 CEGAT ROLE BISNIS MASUK KE ROSTER
  if (tabId === 'the-old-norse' && safeRank === 'bisnis') {
    if(typeof showToast === 'function') showToast("ACCESS DENIED", "Role Bisnis tidak memiliki hak akses ke List Roster!", "error"); switchTab('weapon-shop'); return;
  }

  const allNavButtons = document.querySelectorAll('.nav-btn');
  allNavButtons.forEach(btn => {
    const targetTab = btn.getAttribute('data-tab'); const iconName = typeof getLucideIconForSubmenu === 'function' ? getLucideIconForSubmenu(targetTab) : 'box';
    btn.className = "nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition text-xs list-none" + (btn.dataset.developerOnly === 'true' ? ' developer-only' : '');
    if (btn.style.display !== 'none') {
        let iconEl = btn.querySelector('[data-lucide]');
        if (!iconEl) btn.insertAdjacentHTML('afterbegin', `<i data-lucide="${iconName}" class="w-4 h-4 shrink-0"></i>`);
        else iconEl.setAttribute('data-lucide', iconName);
    }
  });

  const activeBtn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
  if (activeBtn) activeBtn.className = "nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white font-bold bg-white/10 transition shadow-sm text-xs list-none";

  document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.add('hidden'));
  const titleMap = {
    'weapon-shop': ['Marketplace Armory', 'Order weaponry and complete the transaction live.'], 'my-orders': ['Processing Order', 'Your order process and history.'], 'admin-dashboard': ['Dashboard', 'A detailed summary of the identity, rank, and vault operations.'], 'transaction-process': ['Resident Order Processing', 'Review, approve, or reject incoming orders.'], 'vault-stock': ['Catalog Inventory', 'Manage inventory items and monitor stock.'], 'release-outstanding': ['Release Held Balance', 'Manage pending final settlement to the vault balance.'], 'vault-history': ['Cash Flow History Archive', 'A complete history of transactions.'], 'stock-proof': ['Upload Stock Photo Proof', 'Attach a screenshot to validate the log.'], 'metal-scrap': ['Metal Scrap Inventory', 'Official records of scrap metal.'], 'the-old-norse': ['List Roster The Old Norse', 'List of official internal and family members.'], 'profile': ['IC Character Profile', 'Detailed information regarding resident identity.'], 'voucher-manager': ['Syndicate Voucher Manager', 'Manage promo codes.'], 'account-manager': ['Account Login Credentials', 'Manage login username and password.'], 'blacklist-manager': ['Account Blacklist Control', 'Manage the blacklist and freeze accounts.']
  };
  titleMap['backup-audit'] = ['Backup & Audit Log', 'Secure application data and monitor moderator activity.'];
  const info = titleMap[tabId] || [tabId.toUpperCase(), 'Dynamic Vault System'];
  const viewTitle = document.getElementById('view-title'); if(viewTitle) viewTitle.innerHTML = `<i data-lucide="${tabId === 'admin-dashboard' ? 'layout-dashboard' : 'box'}" class="w-5 h-5 text-amber-400 inline"></i> ` + info[0];
  const viewSub = document.getElementById('view-subtitle'); if(viewSub) viewSub.innerText = info[1];
  const target = document.getElementById('tab-' + tabId);
  if (target) {
    target.classList.remove('hidden');
    target.style.setProperty('display', 'block', 'important');
  }
  
  const floatCartBtn = document.getElementById('floating-cart-btn');
  if (floatCartBtn) floatCartBtn.style.display = tabId === 'weapon-shop' ? 'flex' : 'none';

  if (tabId === 'weapon-shop' && typeof renderMarketplace === 'function') renderMarketplace(typeof currentMarketplaceFilter !== 'undefined' ? currentMarketplaceFilter : 'all');
  if (tabId === 'profile' && typeof renderProfilePage === 'function') renderProfilePage();
  if (tabId === 'the-old-norse' && typeof renderTonCatalog === 'function') renderTonCatalog();
  if (tabId === 'account-manager' && typeof renderCustomAccountsTable === 'function') renderCustomAccountsTable();
  if (tabId === 'blacklist-manager' && typeof renderBlacklistTable === 'function') renderBlacklistTable();
  if (tabId === 'transaction-process' && typeof renderTxProcessTable === 'function') renderTxProcessTable(true);
  if (tabId === 'vault-stock' && typeof renderVaultInventory === 'function') renderVaultInventory();
  if (tabId === 'release-outstanding' && typeof renderReleaseOutstanding === 'function') renderReleaseOutstanding();
  if (tabId === 'vault-history' && typeof renderVaultHistory === 'function') renderVaultHistory(true);
  if (tabId === 'voucher-manager' && typeof renderVoucherManager === 'function') renderVoucherManager();
  if (tabId === 'backup-audit' && typeof renderAuditLog === 'function') renderAuditLog();
  if (tabId === 'backup-audit' && typeof renderAuditLog === 'function') renderAuditLog();
  if (tabId === 'stock-proof' && typeof renderStockProofHistory === 'function') {
    renderStockProofHistory();
    const dateAuto = document.getElementById('proof-date-auto'); if(dateAuto) dateAuto.value = new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    const memberName = document.getElementById('proof-member-name'); if(memberName) memberName.value = (typeof currentLoggedInUser !== 'undefined' ? currentLoggedInUser : 'ADMIN').toUpperCase();
  }
  if (tabId === 'metal-scrap' && typeof renderMetalScrapLogs === 'function') renderMetalScrapLogs();
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// 4. TIMPA KARTU INVENTORY (SEMBUNYIKAN TOMBOL EDIT UNTUK READ-ONLY)
function renderVaultInventory() {
  try {
    const grid = document.getElementById('vault-inventory-grid') || document.getElementById('inventory-grid');
    if (!grid) return;
    const activeFilter = typeof activeInventoryFilter !== 'undefined' ? activeInventoryFilter : 'all';
    const filteredItems = typeof vaultInventory !== 'undefined' ? vaultInventory.filter(item => {
      const itemCat = String(item.cat || 'weapon').toLowerCase();
      if (activeFilter === 'all') return true;
      return (itemCat === activeFilter || (activeFilter === 'durgs' && itemCat === 'package') || (activeFilter === 'attachments' && itemCat.includes('attach')));
    }) : [];
    
    const totCount = document.getElementById('total-inventory-count'); if(totCount) totCount.innerText = filteredItems.length;
    grid.innerHTML = '';
    if (filteredItems.length === 0) return;

    const isWritable = isBisnisTier(getUserRank()); 

    filteredItems.forEach((item) => {
      const originalIdx = vaultInventory.indexOf(item);
      const badge = String(item.badge || 'NORMAL').toUpperCase();
      
      let badgeStyle = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      if (badge === 'COMING SOON') badgeStyle = 'bg-pink-500/10 text-pink-500 border border-pink-500/30 font-bold';
      else if (badge === 'PRE-ORDER') badgeStyle = 'bg-purple-500/10 text-purple-400 border border-purple-500/30 font-bold'; 
      else if (badge === 'OUT OF STOCK') badgeStyle = 'bg-red-500/10 text-red-500 border border-red-500/20';
      else if (badge === 'LOW') badgeStyle = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      
      let stockBtns = isWritable ? 
        `<button onclick="changeStock(${originalIdx}, -1)" class="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center font-bold shrink-0">-</button>
         <button onclick="changeStock(${originalIdx}, 1)" class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold shrink-0">+</button>
         <button onclick="openEditItemModal(${originalIdx})" class="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center ml-0.5 shrink-0"><i data-lucide="edit-3" class="w-3.5 h-3.5"></i></button>
         <button onclick="deleteInventoryItem(${originalIdx})" class="w-7 h-7 rounded-lg bg-[#131622] text-zinc-400 hover:bg-red-600 hover:text-white flex items-center justify-center ml-0.5 border border-[#1e2230] shrink-0"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>` 
         : '';

      grid.innerHTML += `
        <div class="bg-[#0e1017] border border-[#1e2230] rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-500 transition shadow-sm">
          <div>
            <div class="h-36 bg-[#131622] rounded-xl border border-[#1e2230] flex items-center justify-center overflow-hidden mb-5 p-3 relative group"><img src="${item.img || ''}" class="h-full object-contain group-hover:scale-105 transition duration-300"></div>
            <div class="flex items-center justify-between gap-2 pt-1 mb-2"><h3 class="font-bold text-white text-base truncate leading-relaxed">${item.name} <span class="px-2 py-0.5 bg-[#131622] border border-[#1e2230] text-zinc-400 text-[10px] rounded-md ml-1.5 align-middle">${String(item.cat).toUpperCase()}</span></h3><span class="px-2.5 py-1 text-[9px] font-bold rounded-full uppercase shrink-0 ${badgeStyle}">${badge}</span></div>
            <p class="text-xs text-zinc-400 line-clamp-2 min-h-[32px] mt-2">${item.desc}</p>
          </div>
          <div class="border-t border-[#1e2230] pt-3 mt-4 space-y-3">
            <div class="w-full bg-[#131622]/60 p-2.5 rounded-xl border border-[#1e2230]">
              <span class="text-[10px] text-zinc-500 block uppercase font-semibold">Selling / Base Price</span>
              <div class="flex items-baseline gap-1.5 mt-0.5"><span class="text-lg font-bold font-tech text-amber-400">$${Number(item.price).toLocaleString()}</span><span class="text-xs text-zinc-500 font-mono">($${Number(item.base||item.price).toLocaleString()})</span></div>
            </div>
            <div class="flex items-center justify-between gap-2 pt-0.5">
              <div class="flex items-center gap-1.5 bg-[#131622] px-2.5 py-1.5 rounded-xl border border-[#1e2230]"><span class="text-[10px] text-zinc-400 uppercase font-semibold">Stock / Slot:</span><span class="text-sm font-bold text-white font-mono">${Number(item.stock)}</span></div>
              <div class="flex items-center gap-1 shrink-0 ml-auto">${stockBtns}</div>
            </div>
          </div>
        </div>
      `;
    }); if(typeof lucide !== 'undefined') lucide.createIcons();
  } catch (err) {}
}

// 5. TIMPA LIST ROSTER (MASUKKAN HOOD FATHER & BATASI HAK EDIT)
function renderTonCatalog() {
  const tableBody = document.getElementById('ton-catalog-table');
  if (!tableBody) return;
  const savedProfiles = (typeof getSafeStorage === 'function' ? getSafeStorage('ton_all_profiles') : window.savedProfiles) || {};
  const allUsers = Object.keys(savedProfiles);

  const filteredUsers = allUsers.filter(user => {
    const profile = savedProfiles[user] || {};
    if (user.toLowerCase() === 'developer' || String(profile.job || '').toLowerCase() === 'developer') return false;

    const tabSaatIni = String(typeof currentCatalogTab !== 'undefined' ? currentCatalogTab : 'All').toLowerCase().trim();
    if (tabSaatIni.includes('all')) return true;
    const grupUser = String(profile.groupType || 'Family').toLowerCase().trim();
    return grupUser === tabSaatIni;
  });

  const rank = getUserRank();
  const canModifyRoster = isDonTier(rank); // HANYA MODERATOR & DON YANG BISA EDIT ROSTER

  const thActions = document.getElementById('th-roster-actions');
  const noteAdmin = document.getElementById('roster-admin-note');
  if (thActions) thActions.style.display = canModifyRoster ? 'table-cell' : 'none';
  if (noteAdmin) noteAdmin.style.display = canModifyRoster ? 'inline' : 'none';

  if (filteredUsers.length === 0) {
    const colCount = canModifyRoster ? 4 : 3;
    tableBody.innerHTML = `<tr><td colspan="${colCount}" class="p-4 text-center text-zinc-500 italic">There are no members registered in the category yet.</td></tr>`;
    return;
  }
  
  // 🚨 SUSUNAN RANK BARU TERMASUK HOOD FATHER 🚨
  const rankOptions = ["Moderator", "Don", "Underboss", "Consigliere", "Bisnis", "Hood father", "Captain", "Capo", "Soldiers", "Associates"];
  tableBody.innerHTML = '';
  
  filteredUsers.forEach((username, idx) => {
    const prof = savedProfiles[username] || {};
    if (!prof || typeof prof !== 'object' || !prof.name) return;
    
    const rankInputId = `catalog-rank-${idx}`;
    const groupSelectId = `catalog-group-${idx}`;
    const safeName = prof.name || '-';
    const currentJob = prof.job || 'Soldiers';
    const currentGroup = prof.groupType || 'Family';
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
    const avatarUrl = (prof.avatar && prof.avatar.startsWith('http')) ? prof.avatar : defaultAvatar;

    let groupCellHtml = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${currentGroup === 'Internal' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}">${currentGroup}</span>`;
    let rankCellHtml = `<span class="font-bold text-white">${currentJob}</span>`;
    let actionCellHtml = '';

    if (canModifyRoster) {
      groupCellHtml = `<select id="${groupSelectId}" class="bg-[#131622] border border-[#1e2230] text-white px-2 py-1 rounded-lg text-xs font-bold"><option value="Internal" ${currentGroup === 'Internal' ? 'selected' : ''}>Internal</option><option value="Family" ${currentGroup === 'Family' ? 'selected' : ''}>Family</option></select>`;
      let rankSelectOptions = rankOptions.map(r => `<option value="${r}" ${currentJob === r ? 'selected' : ''}>${r}</option>`).join('');
      rankCellHtml = `<select id="${rankInputId}" class="w-full bg-[#131622] border border-[#1e2230] text-white px-2.5 py-1 rounded-lg text-xs font-bold">${rankSelectOptions}</select>`;
      actionCellHtml = `<td class="p-3.5 text-right space-x-1.5"><button onclick="adminUpdateCatalogUser('${username}', '${rankInputId}', '${groupSelectId}')" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded-lg text-xs uppercase shadow-sm">Update</button><button onclick="adminDeleteUser('${username}')" class="bg-red-600 hover:bg-red-500 text-white font-bold px-2 py-1 rounded-lg text-xs uppercase shadow-sm"><i data-lucide="trash-2" class="w-3.5 h-3.5 inline"></i></button></td>`;
    }

    tableBody.innerHTML += `
      <tr class="hover:bg-white/[0.02] transition border-b border-[#1e2230] last:border-0">
        <td class="p-3.5"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-full border border-[#1e2230] overflow-hidden shrink-0 bg-red-500/10"><img src="${avatarUrl}" onerror="this.src='${defaultAvatar}'" class="w-full h-full object-cover"></div><div><p class="font-bold text-white text-xs">${safeName}</p><p class="font-mono text-[11px] text-zinc-500">${username}</p></div></div></td>
        <td class="p-3.5">${groupCellHtml}</td>
        <td class="p-3.5">${rankCellHtml}</td>
        ${actionCellHtml}
      </tr>
    `;
  });
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ============================================================================
// 💉 INJEKSI RANK CAPO: MENGEMBALIKAN CAPO KE MENU DROPDOWN
// ============================================================================
setInterval(() => {
    document.querySelectorAll('select').forEach(select => {
        // Cek apakah dropdown ini memiliki opsi Captain
        const optCaptain = select.querySelector('option[value="Captain"]') || select.querySelector('option[value="captain"]');
        // Cek apakah Capo sudah ada atau belum
        const optCapo = select.querySelector('option[value="Capo"]') || select.querySelector('option[value="capo"]');
        
        // Jika ada opsi Captain tapi Capo hilang, sisipkan Capo tepat di bawahnya!
        if (optCaptain && !optCapo) {
            optCaptain.insertAdjacentHTML('afterend', '<option value="Capo">Capo</option>');
        }
    });
}, 1000);


// ============================================================================
// 🏆 FINAL RELEASE: KODE MASTER HIERARKI MUTLAK (ALL-IN-ONE)
// ============================================================================

// 1. FUNGSI PEMBACA RANK UTAMA
function getUserRank() {
  const lowerUser = (typeof currentLoggedInUser !== 'undefined' ? currentLoggedInUser : '').toLowerCase();
  if (typeof savedProfiles !== 'undefined' && savedProfiles[lowerUser] && savedProfiles[lowerUser].job) {
      return savedProfiles[lowerUser].job;
  }
  return typeof currentUserRole !== 'undefined' ? currentUserRole : 'Soldiers';
}

function isTopAdmin(rank) { return isDeveloper(rank) || ['moderator'].includes(String(rank).toLowerCase().trim()); }
function isDonTier(rank) { return isDeveloper(rank) || ['moderator', 'don'].includes(String(rank).toLowerCase().trim()); }
function isBisnisTier(rank) { return isDeveloper(rank) || ['moderator', 'don', 'bisnis'].includes(String(rank).toLowerCase().trim()); }
function isReadOnlyAdminTier(rank) { return isDeveloper(rank) || ['underboss', 'consigliere', 'hood father', 'hoodfather', 'captain', 'capo'].includes(String(rank).toLowerCase().trim()); }
function canViewAdminPanel(rank) { return isDeveloper(rank) || isBisnisTier(rank) || isReadOnlyAdminTier(rank); }
function isAssociate(rank) { return String(rank).toLowerCase().trim() === 'associates'; }

// 2. TIMPA SISTEM UI MENU KIRI (SIDEBAR)
function updateRBACUI() {
  const rank = getUserRank();
  const safeRank = String(rank).toLowerCase().trim();
  const isWritable = isBisnisTier(rank); 
  const canView = canViewAdminPanel(rank);

  document.querySelectorAll('.mod-only').forEach(el => {
    if (isTopAdmin(rank)) el.classList.remove('hidden');
    else el.classList.add('hidden');
  });

  document.querySelectorAll('.developer-only').forEach(el => {
    if (isDeveloper(rank)) {
      el.classList.add('developer-access');
      if (el.classList.contains('tab-panel')) {
        el.style.removeProperty('display');
      } else {
        el.classList.remove('hidden');
        el.style.setProperty('display', 'flex', 'important');
      }
    } else {
      el.classList.add('hidden');
      el.classList.remove('developer-access');
      el.style.setProperty('display', 'none', 'important');
    }
  });

  document.querySelectorAll('.admin-only').forEach(el => {
    if (canView) el.classList.remove('hidden');
    else el.classList.add('hidden');
  });

  const adminTabs = ['transaction-process', 'vault-stock', 'release-outstanding', 'vault-history', 'stock-proof', 'metal-scrap'];
  adminTabs.forEach(tab => {
     const btn = document.querySelector(`.nav-btn[data-tab="${tab}"]`);
     if (btn) btn.style.display = canView ? 'flex' : 'none';
  });

  // 🟢 Tombol List Roster SELALU MUNCUL untuk semuanya (Bisnis bisa melihat)
  const rosterBtn = document.querySelector(`.nav-btn[data-tab="the-old-norse"]`);
  if (rosterBtn) rosterBtn.style.display = 'flex';

  const actionBars = ['inventory-action-bar', 'outstanding-action-bar', 'proof-action-bar', 'scrap-action-bar'];
  actionBars.forEach(id => {
      const bar = document.getElementById(id);
      if (bar) bar.style.display = isWritable ? 'flex' : 'none';
  });

  // 🟢 DASHBOARD TERBUKA UNTUK SEMUA RANK (Termasuk Associates & Soldiers)
  const navHq = document.getElementById('nav-group-hq');
  if (navHq) navHq.classList.remove('hidden');
}

// 3. TIMPA SISTEM PERPINDAHAN HALAMAN
function switchTab(tabId) {
  if (!isDeveloper(getUserRank()) && typeof blacklistedUsers !== 'undefined' && blacklistedUsers.includes((currentLoggedInUser || '').toLowerCase())) {
    if(typeof logout === 'function') logout(); 
    if(typeof showToast === 'function') showToast("ACCOUNT FROZEN", "Sesi dihentikan! Akun Anda dibekukan.", "error"); 
    if(typeof triggerBlockedModal === 'function') triggerBlockedModal(); return;
  }
  
  const rank = getUserRank();
  const safeRank = String(rank).toLowerCase().trim();
  const canView = canViewAdminPanel(rank); 

  const adminOnlyTabs = ['transaction-process', 'vault-stock', 'release-outstanding', 'vault-history', 'stock-proof', 'metal-scrap'];
  if (adminOnlyTabs.includes(tabId) && !canView) {
    if(typeof showToast === 'function') showToast("ACCESS DENIED", "Area Manajemen Vault BERSIFAT RAHASIA!", "error"); switchTab('weapon-shop'); return;
  }

  if ((tabId === 'voucher-manager' || tabId === 'account-manager' || tabId === 'blacklist-manager') && !isTopAdmin(rank)) {
    if(typeof showToast === 'function') showToast("ACCESS DENIED", "Fitur ini EKSKLUSIF hanya untuk Moderator!", "error"); switchTab('weapon-shop'); return;
  }
  if (tabId === 'backup-audit' && !isDeveloper(rank)) {
    if(typeof showToast === 'function') showToast("ACCESS DENIED", "Backup & Audit Log hanya dapat diakses Developer!", "error"); switchTab('weapon-shop'); return;
  }

  const allNavButtons = document.querySelectorAll('.nav-btn');
  allNavButtons.forEach(btn => {
    const targetTab = btn.getAttribute('data-tab'); const iconName = typeof getLucideIconForSubmenu === 'function' ? getLucideIconForSubmenu(targetTab) : 'box';
    btn.className = "nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition text-xs list-none" + (btn.dataset.developerOnly === 'true' ? ' developer-only' : '');
    if (btn.style.display !== 'none') {
        let iconEl = btn.querySelector('[data-lucide]');
        if (!iconEl) btn.insertAdjacentHTML('afterbegin', `<i data-lucide="${iconName}" class="w-4 h-4 shrink-0"></i>`);
        else iconEl.setAttribute('data-lucide', iconName);
    }
  });

  const activeBtn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
  if (activeBtn) activeBtn.className = "nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white font-bold bg-white/10 transition shadow-sm text-xs list-none";

  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.add('hidden');
    panel.style.setProperty('display', 'none', 'important');
  });
  const titleMap = {
    'weapon-shop': ['Marketplace Armory', 'Order weaponry and complete the transaction live.'], 'my-orders': ['Processing Order', 'Your order process and history.'], 'admin-dashboard': ['Dashboard', 'A detailed summary of the identity, rank, and vault operations.'], 'transaction-process': ['Resident Order Processing', 'Review, approve, or reject incoming orders.'], 'vault-stock': ['Catalog Inventory', 'Manage inventory items and monitor stock.'], 'release-outstanding': ['Release Held Balance', 'Manage pending final settlement to the vault balance.'], 'vault-history': ['Cash Flow History Archive', 'A complete history of transactions.'], 'stock-proof': ['Upload Stock Photo Proof', 'Attach a screenshot to validate the log.'], 'metal-scrap': ['Metal Scrap Inventory', 'Official records of scrap metal.'], 'the-old-norse': ['List Roster The Old Norse', 'List of official internal and family members.'], 'profile': ['IC Character Profile', 'Detailed information regarding resident identity.'], 'voucher-manager': ['Syndicate Voucher Manager', 'Manage promo codes.'], 'account-manager': ['Account Login Credentials', 'Manage login username and password.'], 'blacklist-manager': ['Account Blacklist Control', 'Manage the blacklist and freeze accounts.']
  };
  titleMap['backup-audit'] = ['Backup & Audit Log', 'Secure application data and monitor moderator activity.'];
  const info = titleMap[tabId] || [tabId.toUpperCase(), 'Dynamic Vault System'];
  const viewTitle = document.getElementById('view-title'); if(viewTitle) viewTitle.innerHTML = `<i data-lucide="${tabId === 'admin-dashboard' ? 'layout-dashboard' : 'box'}" class="w-5 h-5 text-amber-400 inline"></i> ` + info[0];
  const viewSub = document.getElementById('view-subtitle'); if(viewSub) viewSub.innerText = info[1];
  const target = document.getElementById('tab-' + tabId);
  if (target) {
    target.classList.remove('hidden');
    target.style.setProperty('display', 'block', 'important');
  }
  
  const floatCartBtn = document.getElementById('floating-cart-btn');
  if (floatCartBtn) floatCartBtn.style.display = tabId === 'weapon-shop' ? 'flex' : 'none';

  if (tabId === 'weapon-shop' && typeof renderMarketplace === 'function') renderMarketplace(typeof currentMarketplaceFilter !== 'undefined' ? currentMarketplaceFilter : 'all');
  if (tabId === 'profile' && typeof renderProfilePage === 'function') renderProfilePage();
  if (tabId === 'the-old-norse' && typeof renderTonCatalog === 'function') renderTonCatalog();
  if (tabId === 'account-manager' && typeof renderCustomAccountsTable === 'function') renderCustomAccountsTable();
  if (tabId === 'blacklist-manager' && typeof renderBlacklistTable === 'function') renderBlacklistTable();
  if (tabId === 'transaction-process' && typeof renderTxProcessTable === 'function') renderTxProcessTable(true);
  if (tabId === 'vault-stock' && typeof renderVaultInventory === 'function') renderVaultInventory();
  if (tabId === 'release-outstanding' && typeof renderReleaseOutstanding === 'function') renderReleaseOutstanding();
  if (tabId === 'vault-history' && typeof renderVaultHistory === 'function') renderVaultHistory(true);
  if (tabId === 'voucher-manager' && typeof renderVoucherManager === 'function') renderVoucherManager();
  if (tabId === 'backup-audit' && typeof renderAuditLog === 'function') renderAuditLog();
  if (tabId === 'stock-proof' && typeof renderStockProofHistory === 'function') {
    renderStockProofHistory();
    const dateAuto = document.getElementById('proof-date-auto'); if(dateAuto) dateAuto.value = new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    const memberName = document.getElementById('proof-member-name'); if(memberName) memberName.value = (typeof currentLoggedInUser !== 'undefined' ? currentLoggedInUser : 'ADMIN').toUpperCase();
  }
  if (tabId === 'metal-scrap' && typeof renderMetalScrapLogs === 'function') renderMetalScrapLogs();
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// 4. TIMPA KARTU INVENTORY (SEMBUNYIKAN TOMBOL EDIT UNTUK READ-ONLY)
function renderVaultInventory() {
  try {
    const grid = document.getElementById('vault-inventory-grid') || document.getElementById('inventory-grid');
    if (!grid) return;
    const activeFilter = typeof activeInventoryFilter !== 'undefined' ? activeInventoryFilter : 'all';
    const filteredItems = typeof vaultInventory !== 'undefined' ? vaultInventory.filter(item => {
      const itemCat = String(item.cat || 'weapon').toLowerCase();
      if (activeFilter === 'all') return true;
      return (itemCat === activeFilter || (activeFilter === 'durgs' && itemCat === 'package') || (activeFilter === 'attachments' && itemCat.includes('attach')));
    }) : [];
    
    const totCount = document.getElementById('total-inventory-count'); if(totCount) totCount.innerText = filteredItems.length;
    grid.innerHTML = '';
    if (filteredItems.length === 0) return;

    const isWritable = isBisnisTier(getUserRank()); 

    filteredItems.forEach((item) => {
      const originalIdx = vaultInventory.indexOf(item);
      const badge = String(item.badge || 'NORMAL').toUpperCase();
      
      let badgeStyle = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      if (badge === 'COMING SOON') badgeStyle = 'bg-pink-500/10 text-pink-500 border border-pink-500/30 font-bold';
      else if (badge === 'PRE-ORDER') badgeStyle = 'bg-purple-500/10 text-purple-400 border border-purple-500/30 font-bold'; 
      else if (badge === 'OUT OF STOCK') badgeStyle = 'bg-red-500/10 text-red-500 border border-red-500/20';
      else if (badge === 'LOW') badgeStyle = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      
      let stockBtns = isWritable ? 
        `<button onclick="changeStock(${originalIdx}, -1)" class="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center font-bold shrink-0">-</button>
         <button onclick="changeStock(${originalIdx}, 1)" class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold shrink-0">+</button>
         <button onclick="openEditItemModal(${originalIdx})" class="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center ml-0.5 shrink-0"><i data-lucide="edit-3" class="w-3.5 h-3.5"></i></button>
         <button onclick="deleteInventoryItem(${originalIdx})" class="w-7 h-7 rounded-lg bg-[#131622] text-zinc-400 hover:bg-red-600 hover:text-white flex items-center justify-center ml-0.5 border border-[#1e2230] shrink-0"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>` 
         : '';

      grid.innerHTML += `
        <div class="bg-[#0e1017] border border-[#1e2230] rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-500 transition shadow-sm">
          <div>
            <div class="h-36 bg-[#131622] rounded-xl border border-[#1e2230] flex items-center justify-center overflow-hidden mb-5 p-3 relative group"><img src="${item.img || ''}" class="h-full object-contain group-hover:scale-105 transition duration-300"></div>
            <div class="flex items-center justify-between gap-2 pt-1 mb-2"><h3 class="font-bold text-white text-base truncate leading-relaxed">${item.name} <span class="px-2 py-0.5 bg-[#131622] border border-[#1e2230] text-zinc-400 text-[10px] rounded-md ml-1.5 align-middle">${String(item.cat).toUpperCase()}</span></h3><span class="px-2.5 py-1 text-[9px] font-bold rounded-full uppercase shrink-0 ${badgeStyle}">${badge}</span></div>
            <p class="text-xs text-zinc-400 line-clamp-2 min-h-[32px] mt-2">${item.desc}</p>
          </div>
          <div class="border-t border-[#1e2230] pt-3 mt-4 space-y-3">
            <div class="w-full bg-[#131622]/60 p-2.5 rounded-xl border border-[#1e2230]">
              <span class="text-[10px] text-zinc-500 block uppercase font-semibold">Selling / Base Price</span>
              <div class="flex items-baseline gap-1.5 mt-0.5"><span class="text-lg font-bold font-tech text-amber-400">$${Number(item.price).toLocaleString()}</span><span class="text-xs text-zinc-500 font-mono">($${Number(item.base||item.price).toLocaleString()})</span></div>
            </div>
            <div class="flex items-center justify-between gap-2 pt-0.5">
              <div class="flex items-center gap-1.5 bg-[#131622] px-2.5 py-1.5 rounded-xl border border-[#1e2230]"><span class="text-[10px] text-zinc-400 uppercase font-semibold">Stock / Slot:</span><span class="text-sm font-bold text-white font-mono">${Number(item.stock)}</span></div>
              <div class="flex items-center gap-1 shrink-0 ml-auto">${stockBtns}</div>
            </div>
          </div>
        </div>
      `;
    }); if(typeof lucide !== 'undefined') lucide.createIcons();
  } catch (err) {}
}

// 5. TIMPA LIST ROSTER (MASUKKAN HOOD FATHER & BATASI HAK EDIT KHUSUS MOD/DON)
function renderTonCatalog() {
  const tableBody = document.getElementById('ton-catalog-table');
  if (!tableBody) return;
  const savedProfiles = (typeof getSafeStorage === 'function' ? getSafeStorage('ton_all_profiles') : window.savedProfiles) || {};
  const allUsers = Object.keys(savedProfiles);

  const filteredUsers = allUsers.filter(user => {
    const profile = savedProfiles[user] || {};
    if (user.toLowerCase() === 'developer' || String(profile.job || '').toLowerCase() === 'developer') return false;

    const tabSaatIni = String(typeof currentCatalogTab !== 'undefined' ? currentCatalogTab : 'All').toLowerCase().trim();
    if (tabSaatIni.includes('all')) return true;
    const grupUser = String(profile.groupType || 'Family').toLowerCase().trim();
    return grupUser === tabSaatIni;
  });

  const rank = getUserRank();
  const canModifyRoster = isDonTier(rank); // 🚨 HANYA MODERATOR & DON YANG BISA EDIT ROSTER (Bisnis cuma bisa lihat)

  const thActions = document.getElementById('th-roster-actions');
  const noteAdmin = document.getElementById('roster-admin-note');
  if (thActions) thActions.style.display = canModifyRoster ? 'table-cell' : 'none';
  if (noteAdmin) noteAdmin.style.display = canModifyRoster ? 'inline' : 'none';

  if (filteredUsers.length === 0) {
    const colCount = canModifyRoster ? 4 : 3;
    tableBody.innerHTML = `<tr><td colspan="${colCount}" class="p-4 text-center text-zinc-500 italic">There are no members registered in the category yet.</td></tr>`;
    return;
  }
  
  // 🚨 SUSUNAN RANK BARU TERMASUK HOOD FATHER 🚨
  const rankOptions = ["Moderator", "Don", "Underboss", "Consigliere", "Bisnis", "Hood father", "Captain", "Capo", "Soldiers", "Associates"];
  tableBody.innerHTML = '';
  
  filteredUsers.forEach((username, idx) => {
    const prof = savedProfiles[username] || {};
    if (!prof || typeof prof !== 'object' || !prof.name) return;
    
    const rankInputId = `catalog-rank-${idx}`;
    const groupSelectId = `catalog-group-${idx}`;
    const safeName = prof.name || '-';
    const currentJob = prof.job || 'Soldiers';
    const currentGroup = prof.groupType || 'Family';
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
    const avatarUrl = (prof.avatar && prof.avatar.startsWith('http')) ? prof.avatar : defaultAvatar;

    let groupCellHtml = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${currentGroup === 'Internal' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}">${currentGroup}</span>`;
    let rankCellHtml = `<span class="font-bold text-white">${currentJob}</span>`;
    let actionCellHtml = '';

    if (canModifyRoster) {
      groupCellHtml = `<select id="${groupSelectId}" class="bg-[#131622] border border-[#1e2230] text-white px-2 py-1 rounded-lg text-xs font-bold"><option value="Internal" ${currentGroup === 'Internal' ? 'selected' : ''}>Internal</option><option value="Family" ${currentGroup === 'Family' ? 'selected' : ''}>Family</option></select>`;
      let rankSelectOptions = rankOptions.map(r => `<option value="${r}" ${currentJob === r ? 'selected' : ''}>${r}</option>`).join('');
      rankCellHtml = `<select id="${rankInputId}" class="w-full bg-[#131622] border border-[#1e2230] text-white px-2.5 py-1 rounded-lg text-xs font-bold">${rankSelectOptions}</select>`;
      actionCellHtml = `<td class="p-3.5 text-right space-x-1.5"><button onclick="adminUpdateCatalogUser('${username}', '${rankInputId}', '${groupSelectId}')" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded-lg text-xs uppercase shadow-sm">Update</button><button onclick="adminDeleteUser('${username}')" class="bg-red-600 hover:bg-red-500 text-white font-bold px-2 py-1 rounded-lg text-xs uppercase shadow-sm"><i data-lucide="trash-2" class="w-3.5 h-3.5 inline"></i></button></td>`;
    }

    tableBody.innerHTML += `
      <tr class="hover:bg-white/[0.02] transition border-b border-[#1e2230] last:border-0">
        <td class="p-3.5"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-full border border-[#1e2230] overflow-hidden shrink-0 bg-red-500/10"><img src="${avatarUrl}" onerror="this.src='${defaultAvatar}'" class="w-full h-full object-cover"></div><div><p class="font-bold text-white text-xs">${safeName}</p><p class="font-mono text-[11px] text-zinc-500">${username}</p></div></div></td>
        <td class="p-3.5">${groupCellHtml}</td>
        <td class="p-3.5">${rankCellHtml}</td>
        ${actionCellHtml}
      </tr>
    `;
  });
  if (typeof lucide !== 'undefined') lucide.createIcons();
}


// ============================================================================
// 🧹 PERBAIKAN BUG KERANJANG: RESET OTOMATIS SAAT LOGOUT / GANTI AKUN
// ============================================================================

// Menangkap fungsi logout bawaan sistem
// ============================================================================
// 🧹 BUG KERANJANG FIXED: RESET OTOMATIS & ANTI-BENTROK
// ============================================================================

window.fungsiLogoutUtama = window.fungsiLogoutUtama || window.logout || function(){}; 

window.logout = function() {
    // 1. Kosongkan array data keranjang di memori
    if (typeof cart !== 'undefined') cart = []; 
    if (typeof window.cart !== 'undefined') window.cart = [];
    
    // 2. Hapus memori keranjang dari browser
    localStorage.removeItem('cart');
    localStorage.removeItem('ton_cart');
    localStorage.removeItem('ton_marketplace_cart');
    sessionStorage.removeItem('cart');
    sessionStorage.removeItem('ton_cart');

    // 3. Matikan lambang angka merah di menu
    if (typeof updateCartCount === 'function') updateCartCount();
    document.querySelectorAll('.cart-badge, #cart-count, #sidebar-cart-badge').forEach(badge => {
        badge.innerText = '0';
        badge.style.display = 'none';
    });

    // 4. HANCURKAN TOMBOL FLOATING CART
    const floatCartBtn = document.getElementById('floating-cart-btn');
    if (floatCartBtn) floatCartBtn.style.display = 'none';

    // 5. Tutup modal keranjang jika terbuka
    const cartModal = document.getElementById('cart-modal');
    if (cartModal) cartModal.classList.add('hidden');

    // 6. Lanjutkan proses Logout ke fungsi bawaan
    if (typeof window.fungsiLogoutUtama === 'function' && window.fungsiLogoutUtama !== window.logout) {
        window.fungsiLogoutUtama.apply(this, arguments);
    } else {
        const appContainer = document.getElementById('app-container');
        const loginContainer = document.getElementById('login-container');
        if(appContainer) appContainer.classList.add('hidden');
        if(loginContainer) loginContainer.classList.remove('hidden');
        if(typeof currentLoggedInUser !== 'undefined') currentLoggedInUser = null;
        if(typeof currentUserRole !== 'undefined') currentUserRole = null;
    }
};

// ============================================================================
// 🧹 PERBAIKAN BUG KERANJANG: RESET OTOMATIS & HILANGKAN TOMBOL SAAT LOGOUT
// ============================================================================

const fungsiLogoutAsli = window.logout || function(){}; // Jaga-jaga jika fungsi asli belum dimuat

window.logout = function() {
    // 1. Kosongkan array data keranjang di memori
    if (typeof cart !== 'undefined') cart = []; 
    if (typeof window.cart !== 'undefined') window.cart = [];
    
    // 2. Hapus memori keranjang dari penyimpanan browser 
    localStorage.removeItem('cart');
    localStorage.removeItem('ton_cart');
    localStorage.removeItem('ton_marketplace_cart');
    sessionStorage.removeItem('cart');
    sessionStorage.removeItem('ton_cart');

    // 3. Paksa update UI angka (Badge) menjadi kosong
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    } 
    
    // Manual fallback untuk mematikan lambang angka di menu
    document.querySelectorAll('.cart-badge, #cart-count, #sidebar-cart-badge').forEach(badge => {
        badge.innerText = '0';
        badge.style.display = 'none';
    });

    // 🚨 4. HANCURKAN TOMBOL FLOATING CART DI HALAMAN LOGIN 🚨
    const floatCartBtn = document.getElementById('floating-cart-btn');
    if (floatCartBtn) {
        floatCartBtn.style.display = 'none';
    }

    // Tutup juga panel/modal keranjang jika kebetulan sedang terbuka saat logout
    const cartModal = document.getElementById('cart-modal');
    if (cartModal) {
        cartModal.classList.add('hidden');
    }

    // 5. Lanjutkan proses mengeluarkan akun (Logout) ke fungsi bawaannya
    if (typeof fungsiLogoutAsli === 'function' && fungsiLogoutAsli !== window.logout) {
        fungsiLogoutAsli.apply(this, arguments);
    } else {
        // Fallback jika fungsi asli ter-override mutlak
        const appContainer = document.getElementById('app-container');
        const loginContainer = document.getElementById('login-container');
        if(appContainer) appContainer.classList.add('hidden');
        if(loginContainer) loginContainer.classList.remove('hidden');
        currentLoggedInUser = null;
        currentUserRole = null;
    }
};


// Mengambil elemen yang dibutuhkan
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const themeText = document.getElementById('theme-text');
const htmlElement = document.documentElement; // Merujuk ke tag <html>

// 1. Cek apakah pengguna sudah pernah memilih tema sebelumnya
const savedTheme = localStorage.getItem('theme');
if (savedTheme && themeIcon && themeText) {
    htmlElement.setAttribute('data-theme', savedTheme);
    updateButtonUI(savedTheme);
}

// 2. Event Listener saat tombol diklik
if (themeToggleBtn && themeIcon && themeText) themeToggleBtn.addEventListener('click', () => {
    // Cek tema yang sedang aktif saat ini
    const currentTheme = htmlElement.getAttribute('data-theme');
    
    // Tentukan tema baru
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Terapkan tema baru ke HTML
    htmlElement.setAttribute('data-theme', newTheme);
    
    // Simpan pilihan ke localStorage agar tidak hilang saat di-refresh
    localStorage.setItem('theme', newTheme); 
    
    // Perbarui teks dan ikon tombol
    updateButtonUI(newTheme);
});

// 3. Fungsi untuk mengubah tampilan tombol
function updateButtonUI(theme) {
  if (!themeIcon || !themeText) return;
  if (theme === 'light') {
        themeIcon.textContent = '🌙';
        themeText.textContent = 'Dark Mode';
    } else {
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Light Mode';
    }
}

function recordAuditLog(action, details = '') {
  const actor = currentLoggedInUser || 'SYSTEM';
  auditLogs = Array.isArray(auditLogs) ? auditLogs : [];
  auditLogs.unshift({
    id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    actor,
    role: currentUserRole || 'SYSTEM',
    action,
    details
  });
  auditLogs = auditLogs.slice(0, 500);
  saveAppData();
  if (typeof renderAuditLog === 'function') renderAuditLog();
}

function exportAppBackup() {
  if (!isDeveloper(getUserRank())) {
    showToast('ACCESS DENIED', 'Backup hanya dapat dibuat oleh Developer.', 'error');
    return;
  }
  saveAppData();
  const backup = getSafeStorage('ton_global_state');
  if (!backup) {
    showToast('BACKUP GAGAL', 'Data aplikasi belum tersedia untuk diekspor.', 'error');
    return;
  }

  const payload = {
    backupVersion: 1,
    exportedAt: new Date().toISOString(),
    exportedBy: currentLoggedInUser || 'SYSTEM',
    data: backup
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ton-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  recordAuditLog('BACKUP_EXPORTED', 'Backup data aplikasi diunduh.');
  showToast('BACKUP BERHASIL', 'File backup JSON berhasil diunduh.', 'success');
}

function handleBackupImport(event) {
  if (!isDeveloper(getUserRank())) {
    if (event?.target) event.target.value = '';
    showToast('ACCESS DENIED', 'Restore backup hanya dapat dilakukan oleh Developer.', 'error');
    return;
  }
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(reader.result);
      const importedData = payload?.data || payload;
      const requiredFields = ['adminTransactions', 'vaultInventory', 'savedProfiles'];
      if (!importedData || typeof importedData !== 'object' || !requiredFields.every(field => field in importedData)) {
        throw new Error('Format backup tidak valid.');
      }
      applyGlobalState(importedData);
      saveAppData();
      recordAuditLog('BACKUP_IMPORTED', `Backup ${file.name} dipulihkan.`);
      refreshAllUIDisplays();
      showToast('RESTORE BERHASIL', 'Data backup berhasil dipulihkan dan disinkronkan.', 'success');
    } catch (error) {
      showToast('RESTORE GAGAL', error.message || 'File backup tidak dapat dibaca.', 'error');
    }
  };
  reader.readAsText(file);
}

function clearAuditLogs() {
  if (!isDeveloper(getUserRank())) {
    showToast('ACCESS DENIED', 'Hanya Developer yang dapat menghapus audit log.', 'error');
    return;
  }
  showCustomConfirm('HAPUS AUDIT LOG', 'Semua catatan audit akan dihapus permanen. Lanjutkan?', () => {
    auditLogs = [];
    saveAppData();
    renderAuditLog();
    showToast('AUDIT LOG DIHAPUS', 'Seluruh catatan audit telah dihapus.', 'success');
  });
}

function renderAuditLog() {
  const table = document.getElementById('audit-log-table');
  const count = document.getElementById('audit-log-count');
  if (!table) return;
  const query = (document.getElementById('audit-log-search')?.value || '').toLowerCase();
  const rows = (Array.isArray(auditLogs) ? auditLogs : []).filter(log =>
    [log.actor, log.role, log.action, log.details].join(' ').toLowerCase().includes(query)
  );
  if (count) count.textContent = `${rows.length} log`;
  table.innerHTML = rows.length ? rows.map(log => `
    <tr>
      <td class="p-3.5 text-zinc-400 whitespace-nowrap">${new Date(log.timestamp).toLocaleString('id-ID')}</td>
      <td class="p-3.5 font-semibold text-white">${escapeHtml(log.actor)}</td>
      <td class="p-3.5 text-zinc-400">${escapeHtml(log.role)}</td>
      <td class="p-3.5"><span class="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">${escapeHtml(log.action)}</span></td>
      <td class="p-3.5 text-zinc-300">${escapeHtml(log.details || '-')}</td>
    </tr>`).join('') : '<tr><td colspan="5" class="p-8 text-center text-zinc-500">Belum ada aktivitas tercatat.</td></tr>';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function postInternalMessage() {
  const input = document.getElementById('internal-message-input');
  const message = input?.value.trim();
  if (!message) {
    showToast('PESAN KOSONG', 'Tulis pesan sebelum mengirim.', 'error');
    return;
  }

  internalMessages = Array.isArray(internalMessages) ? internalMessages : [];
  internalMessages.unshift({
    id: `MSG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    message,
    author: currentLoggedInUser || 'SYSTEM',
    role: currentUserRole || 'Member',
    createdAt: new Date().toISOString()
  });
  internalMessages = internalMessages.slice(0, 300);
  input.value = '';
  saveAppData();
  recordAuditLog('MESSAGE_POSTED', 'Pesan baru ditambahkan ke internal message board.');
  renderInternalMessages();
  showToast('PESAN TERKIRIM', 'Pesan berhasil dibagikan ke anggota.', 'success');
}

function deleteInternalMessage(messageId) {
  if (!isTopAdmin(getUserRank())) {
    showToast('ACCESS DENIED', 'Hanya Moderator yang dapat menghapus pesan.', 'error');
    return;
  }
  const message = internalMessages.find(item => item.id === messageId);
  internalMessages = internalMessages.filter(item => item.id !== messageId);
  saveAppData();
  recordAuditLog('MESSAGE_DELETED', `Pesan dari ${message?.author || 'unknown'} dihapus.`);
  renderInternalMessages();
}

function renderInternalMessages() {
  const list = document.getElementById('internal-message-list') || document.querySelector('.message-board-list');
  const count = document.getElementById('internal-message-count');
  if (!list) return;

  const viewTitle = document.getElementById('view-title');
  const viewSubtitle = document.getElementById('view-subtitle');
  if (viewTitle && !document.getElementById('tab-internal-board')?.classList.contains('hidden')) {
    viewTitle.innerHTML = '<i data-lucide="message-square" class="w-5 h-5 text-cyan-400 inline"></i> Internal Message Board';
    if (viewSubtitle) viewSubtitle.textContent = 'Papan komunikasi internal untuk pengumuman dan koordinasi anggota.';
  }

  const query = (document.getElementById('internal-message-search')?.value || '').toLowerCase();
  const messages = (Array.isArray(internalMessages) ? internalMessages : []).filter(item =>
    `${item.author} ${item.role} ${item.message}`.toLowerCase().includes(query)
  );

  if (count) count.textContent = `${messages.length} pesan`;

  if (messages.length === 0) {
    list.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16 px-4 bg-[#0e1017] border border-dashed border-[#1e2230] rounded-2xl text-center w-full">
        <div class="w-16 h-16 rounded-full bg-[#131622] border border-[#1e2230] flex items-center justify-center text-cyan-400 mb-4 shadow-inner">
          <i data-lucide="message-square-off" class="w-8 h-8 opacity-70"></i>
        </div>
        <h3 class="text-white font-bold text-sm mb-1">Belum Ada Pengumuman</h3>
        <p class="text-zinc-500 text-xs">Pesan yang dikirim akan muncul di sini untuk seluruh anggota.</p>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }

  let htmlContent = '';

  messages.forEach((item) => {
    const senderName = item.author || 'Anonymous';
    const senderRole = (item.role || 'MEMBER').toUpperCase();
    const msgText = item.message || '';
    const msgDate = new Date(item.createdAt).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
    
    const initials = senderName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    let roleBadgeStyle = 'bg-zinc-800 text-zinc-400 border-zinc-700';
    let avatarStyle = 'bg-zinc-800 border-zinc-600 text-zinc-300';
    let dotColor = 'bg-zinc-500';

    if (senderRole.includes('DEVELOPER') || senderRole.includes('MODERATOR')) {
      roleBadgeStyle = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      avatarStyle = 'bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border-cyan-500/30 text-cyan-400';
      dotColor = 'bg-cyan-400';
    } else if (senderRole.includes('DON') || senderRole.includes('UNDERBOSS')) {
      roleBadgeStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      avatarStyle = 'bg-gradient-to-br from-amber-900/40 to-orange-900/40 border-amber-500/30 text-amber-400';
      dotColor = 'bg-amber-400';
    } else if (senderRole.includes('BISNIS')) {
      roleBadgeStyle = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      avatarStyle = 'bg-gradient-to-br from-purple-900/40 to-fuchsia-900/40 border-purple-500/30 text-purple-400';
      dotColor = 'bg-purple-400';
    } else {
      roleBadgeStyle = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      avatarStyle = 'bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-blue-500/30 text-blue-400';
      dotColor = 'bg-blue-400';
    }

    const deleteBtnHtml = isTopAdmin(getUserRank()) ? `
      <button onclick="deleteInternalMessage('${item.id}')" class="w-8 h-8 rounded-full bg-[#131622] hover:bg-red-500/20 text-zinc-500 hover:text-red-400 border border-[#1e2230] hover:border-red-500/30 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 flex-shrink-0" title="Hapus Pesan">
        <i data-lucide="trash-2" class="w-4 h-4"></i>
      </button>
    ` : '';

    htmlContent += `
      <div class="group relative bg-[#0e1017] border border-[#1e2230] rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:border-[#2a3042] shadow-sm hover:shadow-md flex items-start gap-4 w-full text-left mb-3">
        
        <div class="flex-shrink-0 relative mt-0.5">
          <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-sm tracking-wider border shadow-inner ${avatarStyle}">
            ${initials || 'US'}
          </div>
          <div class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0e1017] shadow-sm ${dotColor}"></div>
        </div>

        <div class="flex-1 min-w-0 flex flex-col gap-2">
          
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-2 flex-wrap mt-0.5">
              <span class="font-bold text-white text-[14px] tracking-wide">${escapeHtml(senderName)}</span>
              <span class="px-2 py-0.5 text-[9px] font-bold rounded uppercase border ${roleBadgeStyle}">${senderRole}</span>
              <span class="text-[10px] text-zinc-500 font-mono ml-1 flex items-center gap-1">
                <i data-lucide="clock" class="w-3 h-3"></i> ${msgDate}
              </span>
            </div>
            ${deleteBtnHtml}
          </div>

          <!-- KUNCI PERBAIKAN: Tidak ada spasi / enter di dalam tag div ini -->
          <div class="bg-[#131622] border border-[#1e2230] rounded-2xl rounded-tl-sm px-4 py-3 text-zinc-300 text-[13px] sm:text-sm leading-relaxed whitespace-pre-wrap break-words w-full text-left shadow-inner">${escapeHtml(msgText)}</div>
          
        </div>

      </div>
    `;
  });

  list.className = "flex flex-col w-full max-w-4xl mx-auto";
  list.innerHTML = htmlContent;
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
}
function triggerFullSystemReset() {
  if (!isDeveloper(getUserRank())) {
    showToast('ACCESS DENIED', 'Hanya Developer yang dapat menghapus seluruh data aplikasi.', 'error');
    return;
  }

  showCustomConfirm(
    'FACTORY RESET 1/2',
    'PERINGATAN: Semua data aplikasi akan dihapus, termasuk akun custom, profil, inventory, transaksi, pesan, voucher, blacklist, saldo, dan audit log. Buat backup terlebih dahulu. Lanjutkan?',
    () => {
      setTimeout(() => showCustomConfirm(
        'FACTORY RESET 2/2',
        'TINDAKAN INI TIDAK DAPAT DIBATALKAN. Seluruh data Firebase dan cache lokal akan dihapus permanen. Anda benar-benar yakin?',
        () => {
          const storageKeys = [
            'ton_global_state', 'ton_admin_transactions', 'ton_org_leaderboard',
            'ton_vault_balance', 'ton_vault_inventory', 'ton_vouchers',
            'ton_metal_scrap', 'ton_custom_accounts', 'ton_stock_proof_logs',
            'ton_audit_logs', 'ton_vault_lockdown', 'ton_blacklisted_users',
            'ton_all_profiles', 'ton_current_session'
          ];
          localStorage.setItem('ton_factory_reset', 'true');
          storageKeys.forEach(key => localStorage.removeItem(key));

          adminTransactions = [];
          orgLeaderboard = [];
          vaultInventory = [];
          vaultBalance = 0;
          syndVouchers = [];
          metalScrapLogs = [];
          customAccounts = {};
          stockProofLogs = [];
          auditLogs = [];
          internalMessages = [];
          isVaultLockdown = false;
          blacklistedUsers = [];
          savedProfiles = {};

          const clearCloud = db ? db.ref('ton_global_state').remove() : Promise.resolve();
          clearCloud.then(() => {
            showToast('FACTORY RESET SELESAI', 'Seluruh data aplikasi telah dihapus.', 'success');
            setTimeout(() => location.reload(), 1200);
          }).catch(error => {
            console.error('Factory reset Firebase error:', error);
            showToast('RESET GAGAL', 'Cache lokal sudah dihapus, tetapi Firebase gagal dihapus.', 'error');
          });
        }
      ), 300);
    }
  );
}

// ============================================================================
// FINAL OVERRIDE MUTLAK: RENDER VAULT INVENTORY (ANTI-GANGGUAN)
// ============================================================================
window.renderVaultInventory = function() {
  try {
    const grid = document.getElementById('vault-inventory-grid') || document.getElementById('inventory-grid') || document.getElementById('logs-inventory-grid');
    if (!grid) return;

    // 1. HAPUS SEMUA CLASS BAWAAN YANG MERUSAK LAYOUT
    grid.className = ""; 
    
    // 2. SUNTIKKAN STYLE GRID SECARA PAKSA & RESPONSIVE
    grid.setAttribute(
        "style", 
        "display: grid !important; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)) !important; gap: 1.5rem !important; width: 100% !important; align-items: stretch !important; justify-content: start !important;"
    );
    
    const activeFilter = typeof activeInventoryFilter !== 'undefined' ? activeInventoryFilter : 'all';
    
    const filteredItems = typeof vaultInventory !== 'undefined' ? vaultInventory.filter(item => {
      const itemCat = String(item.cat || 'weapon').toLowerCase();
      if (activeFilter === 'all') return true;
      return (itemCat === activeFilter || (activeFilter === 'durgs' && itemCat === 'package') || (activeFilter === 'attachments' && itemCat.includes('attach')));
    }) : [];
    
    const totCount = document.getElementById('total-inventory-count'); 
    if(totCount) totCount.innerText = filteredItems.length;
    
    grid.innerHTML = '';
    if (filteredItems.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1 / -1;" class="py-12 text-center text-zinc-500 italic">Data kosong.</div>`;
      return;
    }

    const isWritable = typeof isBisnisTier === 'function' ? isBisnisTier(typeof getUserRank === 'function' ? getUserRank() : '') : false;

    filteredItems.forEach((item) => {
      const originalIdx = vaultInventory.indexOf(item);
      const badge = String(item.badge || 'NORMAL').toUpperCase();
      
      let badgeStyle = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      if (badge === 'COMING SOON') badgeStyle = 'bg-pink-500/10 text-pink-500 border border-pink-500/30 font-bold';
      else if (badge === 'PRE-ORDER') badgeStyle = 'bg-purple-500/10 text-purple-400 border border-purple-500/30 font-bold'; 
      else if (badge === 'OUT OF STOCK') badgeStyle = 'bg-red-500/10 text-red-500 border border-red-500/20';
      else if (badge === 'LOW') badgeStyle = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      
      let stockBtns = isWritable ? 
        `<button onclick="changeStock(${originalIdx}, -1)" class="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center font-bold shrink-0">-</button>
         <button onclick="changeStock(${originalIdx}, 1)" class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold shrink-0">+</button>
         <button onclick="openEditItemModal(${originalIdx})" class="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center ml-0.5 shrink-0"><i data-lucide="edit-3" class="w-3.5 h-3.5"></i></button>
         <button onclick="deleteInventoryItem(${originalIdx})" class="w-7 h-7 rounded-lg bg-[#131622] text-zinc-400 hover:bg-red-600 hover:text-white flex items-center justify-center ml-0.5 border border-[#1e2230] shrink-0"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>` 
         : '';

      // 3. TAMBAHKAN STYLE WIDTH & HEIGHT 100% PADA KARTU
      grid.innerHTML += `
        <div style="width: 100%; height: 100%;" class="bg-[#0e1017] border border-[#1e2230] rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-500 transition shadow-sm">
          <div>
            <div class="h-36 bg-[#131622] rounded-xl border border-[#1e2230] flex items-center justify-center overflow-hidden mb-5 p-3 relative group">
              <img src="${item.img || ''}" class="h-full object-contain group-hover:scale-105 transition duration-300">
            </div>
            <div class="flex items-center justify-between gap-2 pt-1 mb-2">
              <h3 class="font-bold text-white text-base truncate leading-relaxed">${item.name} <span class="px-2 py-0.5 bg-[#131622] border border-[#1e2230] text-zinc-400 text-[10px] rounded-md ml-1.5 align-middle">${String(item.cat).toUpperCase()}</span></h3>
              <span class="px-2.5 py-1 text-[9px] font-bold rounded-full uppercase shrink-0 ${badgeStyle}">${badge}</span>
            </div>
            <p class="text-xs text-zinc-400 line-clamp-2 min-h-[32px] mt-2">${item.desc}</p>
          </div>
          <div class="border-t border-[#1e2230] pt-3 mt-4 space-y-3">
            <div class="w-full bg-[#131622]/60 p-2.5 rounded-xl border border-[#1e2230]">
              <span class="text-[10px] text-zinc-500 block uppercase font-semibold">Selling / Base Price</span>
              <div class="flex items-baseline gap-1.5 mt-0.5"><span class="text-lg font-bold font-tech text-amber-400">$${Number(item.price).toLocaleString()}</span><span class="text-xs text-zinc-500 font-mono">($${Number(item.base||item.price).toLocaleString()})</span></div>
            </div>
            <div class="flex items-center justify-between gap-2 pt-0.5">
              <div class="flex items-center gap-1.5 bg-[#131622] px-2.5 py-1.5 rounded-xl border border-[#1e2230]"><span class="text-[10px] text-zinc-400 uppercase font-semibold">Stock / Slot:</span><span class="text-sm font-bold text-white font-mono">${Number(item.stock)}</span></div>
              <div class="flex items-center gap-1 shrink-0 ml-auto">${stockBtns}</div>
            </div>
          </div>
        </div>
      `;
    }); 
    if(typeof lucide !== 'undefined') lucide.createIcons();
  } catch (err) {
    console.error("Error renderVaultInventory:", err);
  }
};

// ============================================================================
// ULTIMATE OVERRIDE: INTERNAL MESSAGE BOARD (UI FINAL & RESPONSIF)
// ============================================================================
window.renderMessageBoard = function() {
  try {
    // Mencari berbagai kemungkinan ID container pesan di HTML Anda
    const container = document.getElementById('message-container') || 
                      document.getElementById('board-messages') || 
                      document.getElementById('internal-messages-list') || 
                      document.querySelector('.message-board-list') ||
                      document.querySelector('div[id*="message"]') ||
                      document.querySelector('div[id*="board"]');
                      
    if (!container) {
      console.warn("Container message board tidak ditemukan.");
      return;
    }

    // Memaksa container menggunakan tata letak flex vertikal yang rapat dan berada di tengah
    container.className = "flex flex-col gap-3 w-full max-w-4xl mx-auto my-4 px-2";

    const messages = typeof internalMessages !== 'undefined' ? internalMessages : 
                     (typeof messagesList !== 'undefined' ? messagesList : 
                     (typeof chatMessages !== 'undefined' ? chatMessages : []));

    if (!messages || messages.length === 0) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 px-4 bg-[#0e1017] border border-[#1e2230] rounded-2xl text-center shadow-md">
          <div class="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
            <i data-lucide="message-square-off" class="w-6 h-6"></i>
          </div>
          <h3 class="text-white font-bold text-sm mb-1">Belum Ada Pesan</h3>
          <p class="text-zinc-500 text-xs">Kirimkan pengumuman atau koordinasi baru melalui kolom di atas.</p>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    let htmlContent = '';

    messages.forEach((msg, idx) => {
      const senderName = msg.sender || msg.name || 'Anonymous';
      const senderRole = (msg.role || 'MEMBER').toUpperCase();
      const msgText = msg.text || msg.message || '';
      const msgDate = msg.date || msg.time || 'Baru saja';
      
      const initials = senderName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

      let roleBadgeStyle = 'bg-zinc-800 text-zinc-400 border-zinc-700';
      if (senderRole.includes('DEVELOPER') || senderRole.includes('DEV')) {
        roleBadgeStyle = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      } else if (senderRole.includes('MODERATOR') || senderRole.includes('ADMIN')) {
        roleBadgeStyle = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      }

      htmlContent += `
        <div class="group relative bg-[#0e1017] hover:bg-[#12151f] border border-[#1e2230] hover:border-cyan-500/30 rounded-2xl p-4 transition-all duration-200 shadow-sm flex flex-col gap-2.5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-300 font-bold text-xs tracking-wider shadow-inner">
                ${initials || 'US'}
              </div>
              <div class="flex flex-col">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-white text-xs sm:text-sm tracking-wide">${senderName}</span>
                  <span class="px-2 py-0.5 text-[9px] font-bold rounded-md uppercase border ${roleBadgeStyle}">${senderRole}</span>
                </div>
                <span class="text-[10px] text-zinc-500 font-mono mt-0.5 flex items-center gap-1">
                  <i data-lucide="clock" class="w-3 h-3 inline"></i> ${msgDate}
                </span>
              </div>
            </div>
            <button onclick="deleteMessage(${idx})" class="w-7 h-7 rounded-lg bg-[#131622] hover:bg-red-500/10 text-zinc-500 hover:text-red-400 border border-[#1e2230] flex items-center justify-center transition opacity-50 group-hover:opacity-100" title="Hapus Pesan">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
          <div class="text-zinc-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words bg-[#131622]/50 border border-[#1e2230]/70 p-3 rounded-xl ml-12">
            ${msgText}
          </div>
        </div>
      `;
    });

    container.innerHTML = htmlContent;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  } catch (err) {
    console.error("Error renderMessageBoard:", err);
  }
};

// Eksekusi langsung fungsi dan paksa interval agar mendeteksi perubahan DOM
if (typeof window.renderMessageBoard === 'function') {
  window.renderMessageBoard();
}

// ============================================================================
// PERBAIKAN FINAL UI MESSAGE BOARD (CLEAN, MODERN & SIMETRIS)
// ============================================================================
window.renderMessageBoard = function() {
  try {
    const container = document.getElementById('message-container') || 
                      document.getElementById('board-messages') || 
                      document.getElementById('internal-messages-list') || 
                      document.querySelector('.message-board-list');
                      
    if (!container) return;

    // Tata letak kontainer utama dengan lebar maksimal yang proporsional
    container.className = "flex flex-col gap-3.5 w-full max-w-4xl mx-auto py-3 px-2";

    const messages = typeof internalMessages !== 'undefined' ? internalMessages : 
                     (typeof messagesList !== 'undefined' ? messagesList : 
                     (typeof chatMessages !== 'undefined' ? chatMessages : []));

    if (!messages || messages.length === 0) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 px-4 bg-[#0e1017] border border-[#1e2230] rounded-2xl text-center shadow-md">
          <div class="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
            <i data-lucide="message-square-off" class="w-6 h-6"></i>
          </div>
          <h3 class="text-white font-bold text-sm mb-1">Belum Ada Pesan</h3>
          <p class="text-zinc-500 text-xs">Kirimkan pengumuman atau koordinasi baru melalui kolom di atas.</p>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    let htmlContent = '';

    messages.forEach((msg, idx) => {
      const senderName = msg.sender || msg.name || 'Anonymous';
      const senderRole = (msg.role || 'MEMBER').toUpperCase();
      const msgText = msg.text || msg.message || '';
      const msgDate = msg.date || msg.time || 'Baru saja';
      
      const initials = senderName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

      let roleBadgeStyle = 'bg-zinc-800 text-zinc-400 border-zinc-700';
      if (senderRole.includes('DEVELOPER') || senderRole.includes('DEV')) {
        roleBadgeStyle = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.15)]';
      } else if (senderRole.includes('MODERATOR') || senderRole.includes('ADMIN')) {
        roleBadgeStyle = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      }

      // Struktur HTML Card yang dirapikan secara grid/flex agar rapi ke bawah
      htmlContent += `
        <div class="group relative bg-[#0e1017] hover:bg-[#12151f] border border-[#1e2230] hover:border-cyan-500/30 rounded-2xl p-4.5 transition-all duration-200 shadow-sm flex flex-col gap-3">
          
          <!-- Baris Atas: Profil, Nama, Role, Waktu, & Tombol Hapus -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold text-xs tracking-wider shrink-0 shadow-inner">
                ${initials || 'US'}
              </div>
              <div class="flex flex-col">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-bold text-white text-sm tracking-wide">${senderName}</span>
                  <span class="px-2 py-0.5 text-[9px] font-bold rounded-md uppercase border ${roleBadgeStyle}">${senderRole}</span>
                </div>
                <span class="text-[10px] text-zinc-500 font-mono mt-0.5 flex items-center gap-1">
                  <i data-lucide="clock" class="w-3 h-3 inline"></i> ${msgDate}
                </span>
              </div>
            </div>

            <button onclick="deleteMessage(${idx})" class="w-7 h-7 rounded-lg bg-[#131622] hover:bg-red-500/10 text-zinc-500 hover:text-red-400 border border-[#1e2230] flex items-center justify-center transition opacity-60 group-hover:opacity-100 shrink-0" title="Hapus Pesan">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>

          <!-- Baris Bawah: Kotak Isi Pesan (Bubble) -->
          <div class="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap break-words bg-[#131622]/70 border border-[#1e2230] p-3.5 rounded-xl shadow-inner">
            ${msgText}
          </div>

        </div>
      `;
    });

    container.innerHTML = htmlContent;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  } catch (err) {
    console.error("Error renderMessageBoard:", err);
  }
};

// Eksekusi langsung
if (typeof window.renderMessageBoard === 'function') {
  window.renderMessageBoard();
}

// ============================================================================
// ULTIMATE REDESIGN: INTERNAL MESSAGE BOARD (MODERN & COMPACT UI)
// ============================================================================
window.renderMessageBoard = function() {
  try {
    const container = document.getElementById('message-container') || 
                      document.getElementById('board-messages') || 
                      document.getElementById('internal-messages-list') || 
                      document.querySelector('.message-board-list');
                      
    if (!container) return;

    // Tata letak kontainer utama dengan lebar maksimal yang proporsional dan rapat di tengah
    container.className = "flex flex-col gap-3 w-full max-w-4xl mx-auto py-3 px-2";

    const messages = typeof internalMessages !== 'undefined' ? internalMessages : 
                     (typeof messagesList !== 'undefined' ? messagesList : 
                     (typeof chatMessages !== 'undefined' ? chatMessages : []));

    if (!messages || messages.length === 0) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 px-4 bg-[#0e1017] border border-[#1e2230] rounded-2xl text-center shadow-md">
          <div class="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
            <i data-lucide="message-square-off" class="w-6 h-6"></i>
          </div>
          <h3 class="text-white font-bold text-sm mb-1">Belum Ada Pesan</h3>
          <p class="text-zinc-500 text-xs">Kirimkan pengumuman atau koordinasi baru melalui kolom di atas.</p>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    let htmlContent = '';

    messages.forEach((msg, idx) => {
      const senderName = msg.sender || msg.name || 'Anonymous';
      const senderRole = (msg.role || 'MEMBER').toUpperCase();
      const msgText = msg.text || msg.message || '';
      const msgDate = msg.date || msg.time || 'Baru saja';
      
      // Ambil inisial nama untuk avatar
      const initials = senderName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

      // Warna badge role
      let roleBadgeStyle = 'bg-zinc-800 text-zinc-400 border-zinc-700';
      if (senderRole.includes('DEVELOPER') || senderRole.includes('DEV')) {
        roleBadgeStyle = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.15)]';
      } else if (senderRole.includes('MODERATOR') || senderRole.includes('ADMIN')) {
        roleBadgeStyle = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      }

      // Struktur Card Pesan yang Kompak dan Elegan
      htmlContent += `
        <div class="group relative bg-[#0e1017] hover:bg-[#12151f] border border-[#1e2230] hover:border-cyan-500/40 rounded-2xl p-4 transition-all duration-200 shadow-sm flex flex-col gap-3">
          
          <!-- Baris Atas: Avatar, Nama, Role, Waktu, & Tombol Hapus -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <!-- Kotak Avatar Inisial -->
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold text-xs tracking-wider shrink-0 shadow-inner">
                ${initials || 'US'}
              </div>
              <!-- Info Pengirim -->
              <div class="flex flex-col">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-bold text-white text-sm tracking-wide">${senderName}</span>
                  <span class="px-2 py-0.5 text-[9px] font-bold rounded-md uppercase border ${roleBadgeStyle}">${senderRole}</span>
                </div>
                <span class="text-[10px] text-zinc-500 font-mono mt-0.5 flex items-center gap-1">
                  <i data-lucide="clock" class="w-3 h-3 inline"></i> ${msgDate}
                </span>
              </div>
            </div>

            <!-- Tombol Hapus -->
            <button onclick="deleteMessage(${idx})" class="w-7 h-7 rounded-lg bg-[#131622] hover:bg-red-500/10 text-zinc-500 hover:text-red-400 border border-[#1e2230] flex items-center justify-center transition opacity-60 group-hover:opacity-100 shrink-0" title="Hapus Pesan">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>

          <!-- Baris Bawah: Bubble Konten Pesan yang Rapi & Sejajar -->
          <div class="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap break-words bg-[#131622]/80 border border-[#1e2230] p-3.5 rounded-xl shadow-inner ml-13">
            ${msgText}
          </div>

        </div>
      `;
    });

    container.innerHTML = htmlContent;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  } catch (err) {
    console.error("Error renderMessageBoard:", err);
  }
};

// Eksekusi langsung fungsi
if (typeof window.renderMessageBoard === 'function') {
  window.renderMessageBoard();
}

// ============================================================================
// AUTO-INJECT UNIVERSAL FIX: MESSAGE BOARD UI REDESIGN
// ============================================================================
(function() {
  // 1. Suntikkan CSS langsung ke <head> browser agar 100% tembus
  const styleId = 'universal-message-board-fix';
  let styleEl = document.getElementById(styleId);
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }
  
  styleEl.innerHTML = `
    .forced-msg-card {
      background-color: #0e1017 !important;
      border: 1px solid #1e2230 !important;
      border-radius: 1rem !important;
      padding: 16px !important;
      margin-bottom: 12px !important;
      max-width: 800px !important;
      margin-left: auto !important;
      margin-right: auto !important;
      width: 100% !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important;
      transition: all 0.2s ease !important;
      box-sizing: border-box !important;
    }
    .forced-msg-card:hover {
      border-color: rgba(6, 182, 212, 0.4) !important;
      background-color: #12151f !important;
    }
    .forced-msg-bubble {
      background-color: #131622 !important;
      border: 1px solid #1e2230 !important;
      border-radius: 0.75rem !important;
      padding: 12px 14px !important;
      color: #e4e4e7 !important;
      font-size: 0.875rem !important;
      line-height: 1.5 !important;
      margin-top: 10px !important;
      word-break: break-word !important;
    }
  `;

  // 2. Fungsi render global yang mencari kontainer pesan secara otomatis
  window.renderMessageBoard = function() {
    try {
      // Cari elemen kontainer berdasarkan berbagai kemungkinan ID atau lokasi di bawah search input
      let container = document.getElementById('message-container') || 
                      document.getElementById('board-messages') || 
                      document.getElementById('internal-messages-list') ||
                      document.querySelector('.message-board-list');

      if (!container) {
        // Cari otomatis berdasarkan input pencarian "Cari pesan..."
        const searchInput = document.querySelector('input[placeholder*="Cari pesan"]');
        if (searchInput) {
          let parent = searchInput.parentElement;
          while (parent && parent !== document.body) {
            const nextEl = parent.nextElementSibling;
            if (nextEl) {
              container = nextEl;
              break;
            }
            parent = parent.parentElement;
          }
        }
      }

      if (!container) return;

      container.className = "w-full flex flex-col py-2";

      const messages = typeof internalMessages !== 'undefined' ? internalMessages : 
                       (typeof messagesList !== 'undefined' ? messagesList : 
                       (typeof chatMessages !== 'undefined' ? chatMessages : []));

      if (!messages || messages.length === 0) {
        container.innerHTML = `
          <div class="forced-msg-card text-center py-10 text-zinc-500 italic">
            Belum ada pesan atau pengumuman internal.
          </div>
        `;
        return;
      }

      let htmlContent = '';

      messages.forEach((msg, idx) => {
        const senderName = msg.sender || msg.name || 'Anonymous';
        const senderRole = (msg.role || 'MEMBER').toUpperCase();
        const msgText = msg.text || msg.message || '';
        const msgDate = msg.date || msg.time || 'Baru saja';
        
        const initials = senderName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

        let roleBadgeStyle = 'bg-zinc-800 text-zinc-400 border-zinc-700';
        if (senderRole.includes('DEVELOPER') || senderRole.includes('DEV')) {
          roleBadgeStyle = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.15)]';
        } else if (senderRole.includes('MODERATOR') || senderRole.includes('ADMIN')) {
          roleBadgeStyle = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
        }

        htmlContent += `
          <div class="forced-msg-card flex flex-col">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold text-xs tracking-wider shrink-0 shadow-inner">
                  ${initials || 'US'}
                </div>
                <div class="flex flex-col">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-bold text-white text-sm tracking-wide">${senderName}</span>
                    <span class="px-2 py-0.5 text-[9px] font-bold rounded-md uppercase border ${roleBadgeStyle}">${senderRole}</span>
                  </div>
                  <span class="text-[10px] text-zinc-500 font-mono mt-0.5 flex items-center gap-1">
                    <i data-lucide="clock" class="w-3 h-3 inline"></i> ${msgDate}
                  </span>
                </div>
              </div>

              <button onclick="deleteMessage(${idx})" class="w-7 h-7 rounded-lg bg-[#131622] hover:bg-red-500/10 text-zinc-500 hover:text-red-400 border border-[#1e2230] flex items-center justify-center transition shrink-0" title="Hapus Pesan">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>

            <div class="forced-msg-bubble">
              ${msgText}
            </div>
          </div>
        `;
      });

      container.innerHTML = htmlContent;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (err) {
      console.error("Error universal renderMessageBoard:", err);
    }
  };

  // Jalankan otomatis
  if (typeof window.renderMessageBoard === 'function') {
    window.renderMessageBoard();
  }
})();


// ============================================================================
// FINAL CLEAN FIX: RENDER MESSAGE BOARD YANG AMAN & PRESISI
// ============================================================================

// 1. Membersihkan sisa observer atau style global sebelumnya yang merusak layout
if (window.__messageObserver) {
  window.__messageObserver.disconnect();
}
const oldStyle = document.getElementById('global-message-fix-style');
if (oldStyle) oldStyle.remove();

// 2. Fungsi renderMessageBoard khusus yang tidak menyentuh komponen lain
window.renderMessageBoard = function() {
  try {
    // Targetkan secara spesifik kontainer pesan internal
    const container = document.getElementById('message-container') || 
                      document.getElementById('board-messages') || 
                      document.getElementById('internal-messages-list') || 
                      document.querySelector('.message-board-list');
                      
    if (!container) return;

    // Atur tata letak kontainer pesan agar rapi di tengah dengan lebar maksimal yang proporsional
    container.className = "flex flex-col gap-3.5 w-full max-w-3xl mx-auto py-4 px-3";

    const messages = typeof internalMessages !== 'undefined' ? internalMessages : 
                     (typeof messagesList !== 'undefined' ? messagesList : 
                     (typeof chatMessages !== 'undefined' ? chatMessages : []));

    if (!messages || messages.length === 0) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 px-4 bg-[#0e1017] border border-[#1e2230] rounded-2xl text-center shadow-md">
          <div class="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
            <i data-lucide="message-square-off" class="w-6 h-6"></i>
          </div>
          <h3 class="text-white font-bold text-sm mb-1">Belum Ada Pesan</h3>
          <p class="text-zinc-500 text-xs">Kirimkan pengumuman atau koordinasi baru melalui kolom di atas.</p>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    let htmlContent = '';

    messages.forEach((msg, idx) => {
      const senderName = msg.sender || msg.name || 'Anonymous';
      const senderRole = (msg.role || 'MEMBER').toUpperCase();
      const msgText = msg.text || msg.message || '';
      const msgDate = msg.date || msg.time || 'Baru saja';
      
      const initials = senderName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

      let roleBadgeStyle = 'bg-zinc-800 text-zinc-400 border-zinc-700';
      if (senderRole.includes('DEVELOPER') || senderRole.includes('DEV')) {
        roleBadgeStyle = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.15)]';
      } else if (senderRole.includes('MODERATOR') || senderRole.includes('ADMIN')) {
        roleBadgeStyle = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      }

      htmlContent += `
        <div class="group relative bg-[#0e1017] hover:bg-[#12151f] border border-[#1e2230] hover:border-cyan-500/40 rounded-2xl p-4.5 transition-all duration-200 shadow-sm flex flex-col gap-3 w-full">
          
          <!-- Baris Atas: Profil, Nama, Role, Waktu, & Tombol Hapus -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold text-xs tracking-wider shrink-0 shadow-inner">
                ${initials || 'US'}
              </div>
              <div class="flex flex-col">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-bold text-white text-sm tracking-wide">${senderName}</span>
                  <span class="px-2 py-0.5 text-[9px] font-bold rounded-md uppercase border ${roleBadgeStyle}">${senderRole}</span>
                </div>
                <span class="text-[10px] text-zinc-500 font-mono mt-0.5 flex items-center gap-1">
                  <i data-lucide="clock" class="w-3 h-3 inline"></i> ${msgDate}
                </span>
              </div>
            </div>

            <button onclick="deleteMessage(${idx})" class="w-7 h-7 rounded-lg bg-[#131622] hover:bg-red-500/10 text-zinc-500 hover:text-red-400 border border-[#1e2230] flex items-center justify-center transition opacity-60 group-hover:opacity-100 shrink-0" title="Hapus Pesan">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>

          <!-- Baris Bawah: Bubble Konten Pesan -->
          <div class="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap break-words bg-[#131622]/80 border border-[#1e2230] p-3.5 rounded-xl shadow-inner">
            ${msgText}
          </div>

        </div>
      `;
    });

    container.innerHTML = htmlContent;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  } catch (err) {
    console.error("Error renderMessageBoard:", err);
  }
};

// Eksekusi fungsi secara aman
if (typeof window.renderMessageBoard === 'function') {
  window.renderMessageBoard();
}

// ============================================================================
// PERBAIKAN TOTAL: MESSAGE BOARD KOMPAK & CUSTOM MODAL INPUT GAMBAR
// ============================================================================

// 1. RENDER MESSAGE BOARD (Kompak, Rapat, Terpusat, & Elegan)
window.renderMessageBoard = function() {
  try {
    const container = document.getElementById('message-container') || 
                      document.getElementById('board-messages') || 
                      document.getElementById('internal-messages-list') || 
                      document.querySelector('.message-board-list');
                      
    if (!container) return;

    // Kontainer utama dibatasi lebarnya dan diletakkan di tengah agar tidak melebar penuh
    container.className = "flex flex-col gap-3 w-full max-w-2xl mx-auto py-3 px-2";

    const messages = typeof internalMessages !== 'undefined' ? internalMessages : 
                     (typeof messagesList !== 'undefined' ? messagesList : 
                     (typeof chatMessages !== 'undefined' ? chatMessages : []));

    if (!messages || messages.length === 0) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-10 px-4 bg-[#0e1017] border border-[#1e2230] rounded-2xl text-center shadow-md">
          <div class="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2">
            <i data-lucide="message-square-off" class="w-5 h-5"></i>
          </div>
          <h3 class="text-white font-bold text-xs mb-0.5">Belum Ada Pesan</h3>
          <p class="text-zinc-500 text-[11px]">Kirimkan pengumuman atau koordinasi baru melalui kolom di atas.</p>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    let htmlContent = '';

    messages.forEach((msg, idx) => {
      const senderName = msg.sender || msg.name || 'Anonymous';
      const senderRole = (msg.role || 'MEMBER').toUpperCase();
      const msgText = msg.text || msg.message || '';
      const msgDate = msg.date || msg.time || 'Baru saja';
      const imgUrl = msg.image || msg.img || msg.attachment || '';
      
      const initials = senderName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

      let roleBadgeStyle = 'bg-zinc-800 text-zinc-400 border-zinc-700';
      if (senderRole.includes('DEVELOPER') || senderRole.includes('DEV')) {
        roleBadgeStyle = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      } else if (senderRole.includes('MODERATOR') || senderRole.includes('ADMIN')) {
        roleBadgeStyle = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      }

      // Render gambar jika ada lampiran link foto
      let imageHtml = '';
      if (imgUrl) {
        imageHtml = `
          <div class="mt-2.5 rounded-xl overflow-hidden border border-[#1e2230] bg-[#131622] max-h-60 flex items-center justify-center">
            <img src="${imgUrl}" alt="Attachment" class="w-full object-cover max-h-60 hover:scale-102 transition duration-300" onerror="this.onerror=null; this.parentElement.innerHTML='<span class=\'text-xs text-red-400 p-3 italic\'>Gagal memuat gambar dari URL tersebut.</span>';">
          </div>
        `;
      }

      // Struktur Card Pesan yang Kompak, Rapat, dan Menyatu
      htmlContent += `
        <div class="group relative bg-[#0e1017] hover:bg-[#12151f] border border-[#1e2230] hover:border-cyan-500/40 rounded-2xl p-3.5 transition-all duration-200 shadow-sm flex flex-col gap-2.5">
          
          <!-- Header: Profil & Waktu -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold text-[11px] tracking-wider shrink-0 shadow-inner">
                ${initials || 'US'}
              </div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-bold text-white text-xs tracking-wide">${senderName}</span>
                <span class="px-1.5 py-0.5 text-[8px] font-bold rounded uppercase border ${roleBadgeStyle}">${senderRole}</span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                <i data-lucide="clock" class="w-3 h-3 inline"></i> ${msgDate}
              </span>
              <button onclick="deleteMessage(${idx})" class="w-6 h-6 rounded-lg bg-[#131622] hover:bg-red-500/10 text-zinc-500 hover:text-red-400 border border-[#1e2230] flex items-center justify-center transition opacity-50 group-hover:opacity-100 shrink-0" title="Hapus Pesan">
                <i data-lucide="trash-2" class="w-3 h-3"></i>
              </button>
            </div>
          </div>

          <!-- Bubble Isi Teks Pesan -->
          <div class="text-zinc-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words bg-[#131622]/80 border border-[#1e2230] p-3 rounded-xl shadow-inner">
            ${msgText}
            ${imageHtml}
          </div>

        </div>
      `;
    });

    container.innerHTML = htmlContent;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  } catch (err) {
    console.error("Error renderMessageBoard:", err);
  }
};


// 2. CUSTOM MODAL UNTUK INPUT LINK FOTO (Menggantikan prompt() bawaan browser)
window.openImageInputModal = function(callback) {
  // Hapus modal lama jika ada
  const existingModal = document.getElementById('custom-img-modal');
  if (existingModal) existingModal.remove();

  const modalHtml = `
    <div id="custom-img-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div class="bg-[#0e1017] border border-[#1e2230] rounded-2xl w-full max-w-md p-5 shadow-2xl flex flex-col gap-4">
        
        <div class="flex items-center justify-between border-b border-[#1e2230] pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <i data-lucide="image" class="w-4 h-4"></i>
            </div>
            <h3 class="text-white font-bold text-sm">Lampirkan Gambar / Foto</h3>
          </div>
          <button id="close-img-modal" class="text-zinc-400 hover:text-white transition">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-xs text-zinc-400 font-medium">Masukkan URL Gambar / Screenshot / Discord Attachment:</label>
          <input type="url" id="modal-img-url-input" placeholder="https://example.com/image.png" class="bg-[#131622] border border-[#1e2230] focus:border-cyan-500/50 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition">
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-[#1e2230]">
          <button id="cancel-img-modal" class="px-4 py-2 rounded-xl bg-[#131622] hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition border border-[#1e2230]">
            Batal
          </button>
          <button id="submit-img-modal" class="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition shadow-md shadow-cyan-600/20 flex items-center gap-1.5">
            <i data-lucide="check" class="w-3.5 h-3.5"></i> Gunakan Gambar
          </button>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  if (typeof lucide !== 'undefined') lucide.createIcons();

  const inputEl = document.getElementById('modal-img-url-input');
  inputEl.focus();

  // Tombol aksi
  document.getElementById('close-img-modal').onclick = () => document.getElementById('custom-img-modal').remove();
  document.getElementById('cancel-img-modal').onclick = () => document.getElementById('custom-img-modal').remove();
  
  document.getElementById('submit-img-modal').onclick = () => {
    const url = inputEl.value.trim();
    document.getElementById('custom-img-modal').remove();
    if (typeof callback === 'function') callback(url);
  };

  // Tekan Enter untuk submit
  inputEl.onkeydown = (e) => {
    if (e.key === 'Enter') {
      const url = inputEl.value.trim();
      document.getElementById('custom-img-modal').remove();
      if (typeof callback === 'function') callback(url);
    }
  };
};

// Eksekusi render otomatis
if (typeof window.renderMessageBoard === 'function') {
  window.renderMessageBoard();
}

// ==========================================
// FITUR INTERNAL: MONEY LAUNDRY
// ==========================================

// ----------------------------------------------------
// FITUR AUTO-KALKULASI LAUNDRY (POTONGAN BERUNTUN)
// ----------------------------------------------------
function calculateLaundry() {
  const dirtyInput = document.getElementById('laundry-dirty-amount');
  const cut1Input = document.getElementById('laundry-cut-1');
  const cut2Input = document.getElementById('laundry-cut-2');
  const cleanInput = document.getElementById('laundry-clean-amount');

  if (!dirtyInput || !cut1Input || !cut2Input || !cleanInput) return;

  // Ambil nilai angka, jika kotak kosong jadikan 0
  let dirtyAmt = parseFloat(dirtyInput.value) || 0;
  let cut1 = parseFloat(cut1Input.value) || 0;
  let cut2 = parseFloat(cut2Input.value) || 0;

  // Logika Perhitungan Beruntun:
  // 1. Uang Merah dipotong % Pertama
  let sisaSetelahPotongan1 = dirtyAmt - (dirtyAmt * (cut1 / 100));
  
  // 2. SISA hasil potongan pertama dipotong lagi % Kedua
  let sisaSetelahPotongan2 = sisaSetelahPotongan1 - (sisaSetelahPotongan1 * (cut2 / 100));

  // 3. Tampilkan hasil akhirnya (dibulatkan agar tidak ada desimal)
  cleanInput.value = Math.round(sisaSetelahPotongan2);
}


// 1. Fungsi Tambah Catatan Cuci Uang
function submitLaundryJob() {
  const userRank = getUserRank();
  if (!isBisnisTier(userRank)) {
    showToast("ACCESS DENIED", "Hanya internal faksi yang berhak mengakses ini!", "error");
    return;
  }

  const dirtyInput = document.getElementById('laundry-dirty-amount');
  const washerInput = document.getElementById('laundry-washer-name');
  const cleanInput = document.getElementById('laundry-clean-amount');

  const dirtyAmt = parseInt(dirtyInput.value.replace(/[^0-9]/g, ''));
  const cleanAmt = parseInt(cleanInput.value.replace(/[^0-9]/g, ''));
  const washer = washerInput.value.trim();

  if (!dirtyAmt || !cleanAmt || !washer) {
    showToast("WARNING", "Harap isi semua nominal dan nama pencuci!", "error");
    return;
  }

  const newJobId = "LND-" + Math.random().toString(36).substr(2, 6).toUpperCase();
  const loggedBy = currentLoggedInUser || 'ADMIN';

  const newJob = {
    id: newJobId,
    dirty: dirtyAmt,
    clean: cleanAmt,
    washer: washer,
    status: 'WAITING',
    time: new Date().toLocaleTimeString('en-US'),
    loggedBy: loggedBy
  };

  laundryData.push(newJob);

  if (typeof db !== 'undefined' && db) {
    db.ref('ton_global_state/laundryData').set(laundryData);
  }

  // --- MENGGUNAKAN WEBHOOK KHUSUS LAUNDRY ---
  const embedFields = [
    { name: "Ref ID", value: newJobId, inline: true },
    { name: "Pencuci (Washer)", value: washer, inline: true },
    { name: "Dicatat Oleh", value: loggedBy, inline: true },
    { name: "Uang Merah (Kotor)", value: `$${dirtyAmt.toLocaleString()}`, inline: true },
    { name: "Estimasi Bersih", value: `$${cleanAmt.toLocaleString()}`, inline: true },
    { name: "Status", value: "⏳ WAITING", inline: true }
  ];
  if (typeof sendDiscordWebhook === 'function') {
    sendDiscordWebhook(LAUNDRY_WEBHOOK_URL, "🔴 LAUNDRY JOB SUBMITTED", `Uang merah telah diserahkan ke pencuci. Menunggu proses pencucian selesai.`, embedFields, 16711680);
  }
  // ------------------------------------------

  dirtyInput.value = ''; washerInput.value = ''; cleanInput.value = '';
  renderLaundryTable();
  showToast("RECORDED", `Uang merah $${dirtyAmt.toLocaleString()} diserahkan ke ${washer}.`, "success");
}

// 2. Fungsi ACC (Clear) Cucian Selesai
function accLaundryJob(jobId) {
  const userRank = getUserRank();
  if (!isBisnisTier(userRank)) return showToast("DENIED", "Read-only mode!", "error");

  const idx = laundryData.findIndex(j => j.id === jobId);
  if (idx !== -1 && laundryData[idx].status === 'WAITING') {
    showCustomConfirm("ACC LAUNDRY", `Uang sudah bersih? $${laundryData[idx].clean.toLocaleString()} akan dimasukkan ke brangkas!`, () => {
      
      laundryData[idx].status = 'CLEARED';
      vaultBalance += laundryData[idx].clean; 
      
      const accBy = currentLoggedInUser || 'ADMIN';

      if (typeof db !== 'undefined' && db) {
        db.ref('ton_global_state/laundryData').set(laundryData);
        db.ref('ton_global_state/vaultBalance').set(vaultBalance);
      }

      // --- MENGGUNAKAN WEBHOOK KHUSUS LAUNDRY ---
      const embedFieldsClear = [
        { name: "Ref ID", value: jobId, inline: true },
        { name: "Pencuci (Washer)", value: laundryData[idx].washer, inline: true },
        { name: "Di-ACC Oleh", value: accBy, inline: true },
        { name: "Uang Masuk Vault", value: `$${laundryData[idx].clean.toLocaleString()}`, inline: true }
      ];
      if (typeof sendDiscordWebhook === 'function') {
        sendDiscordWebhook(LAUNDRY_WEBHOOK_URL, "🟢 LAUNDRY CLEARED", `Uang bersih telah diterima dan saldo Vault otomatis bertambah.`, embedFieldsClear, 65280);
      }
      // ------------------------------------------

      renderLaundryTable();
      if (typeof updateDashboardData === 'function') updateDashboardData();
      showToast("CLEARED", "Uang bersih berhasil masuk ke sistem keuangan!", "success");
    });
  }
}

// 3. Render Tabel UI
function renderLaundryTable() {
  const tbody = document.getElementById('laundry-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (laundryData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-zinc-500 italic">Belum ada catatan pencucian uang.</td></tr>`;
    return;
  }

  // Urutkan dari yang terbaru
  const sortedData = [...laundryData].reverse();

  sortedData.forEach(job => {
    const isWaiting = job.status === 'WAITING';
    const statBadge = isWaiting 
      ? `<span class="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold rounded uppercase animate-pulse">WAITING</span>`
      : `<span class="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded uppercase">CLEARED</span>`;

    const actionBtn = isWaiting 
      ? `<button onclick="accLaundryJob('${job.id}')" class="px-3 py-1 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-600/30 rounded text-xs font-bold transition">ACC CLEAR</button>`
      : `<span class="text-zinc-600 text-xs italic">Done</span>`;

    tbody.innerHTML += `
      <tr class="border-b border-[#1e2230] hover:bg-[#161a29] transition">
        <td class="p-3 font-mono text-zinc-400 text-[11px]">${job.id}</td>
        <td class="p-3 font-semibold text-white">${job.washer}</td>
        <td class="p-3 font-bold text-red-400 font-mono">$${job.dirty.toLocaleString()}</td>
        <td class="p-3 font-bold text-emerald-400 font-mono">$${job.clean.toLocaleString()}</td>
        <td class="p-3 text-zinc-400 text-xs">${job.loggedBy}</td>
        <td class="p-3">${statBadge}</td>
        <td class="p-3 text-right">${actionBtn}</td>
      </tr>
    `;
  });
}

