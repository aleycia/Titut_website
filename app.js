/* SIM & E-Learning SMK Negeri 2 Surakarta */
const SUPABASE_URL = "https://tih9utjvyo0617pbdnp3lq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Tih9uTjVYO0617pbdNp3lQ_1pwLPeyg";
const configured = SUPABASE_URL.startsWith("https://") && !SUPABASE_URL.includes("GANTI_") && !SUPABASE_ANON_KEY.includes("GANTI_");
const db = configured && window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const $ = (s) => document.querySelector(s); const $$ = (s) => [...document.querySelectorAll(s)];
let currentUser = null, profile = null, currentPage = "dashboard";

const titles = {
  dashboard: "Beranda",
  elearning: "E-Learning (Materi & Tugas)",
  siswa: "Data Siswa",
  guru: "Data Guru",
  jadwal: "Jadwal Pelajaran",
  nilai: "Nilai Akademik",
  presensi: "Presensi",
  pengumuman: "Pengumuman"
};

function toast(msg){
  const el = $("#toast");
  if(!el) return alert(msg);
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 3500);
}

function dateToday(){
  return new Intl.DateTimeFormat("id-ID", {weekday:"long", day:"numeric", month:"long", year:"numeric"}).format(new Date());
}

function showAuth(signup = false){
  $("#auth-screen").classList.remove("hidden");
  $("#app").classList.add("hidden");
  $("#login-form").classList.toggle("hidden", signup);
  $("#signup-form").classList.toggle("hidden", !signup);
  $("#auth-title").textContent = signup ? "Buat akun baru" : "Masuk ke akun";
  $("#switch-copy").textContent = signup ? "Sudah punya akun?" : "Belum punya akun?";
  $("#switch-auth").textContent = signup ? "Masuk di sini" : "Daftar di sini";
}

function showApp(user, prof){
  currentUser = user;
  profile = prof || {};
  $("#auth-screen").classList.add("hidden");
  $("#app").classList.remove("hidden");
  
  let displayName = "Pengguna";
  if(profile && profile.full_name) {
    displayName = profile.full_name;
  } else if(user && user.email) {
    displayName = user.email.split("@")[0];
  }
  $("#user-name").textContent = displayName;
  $("#user-role").textContent = (profile && profile.role) ? profile.role : "Siswa / Guru";
  $("#user-avatar").textContent = (displayName[0] || "S").toUpperCase();
  $("#today-label").textContent = dateToday();
  $("#year").textContent = new Date().getFullYear();
  renderPage("dashboard");
}

async function loadProfile(user){
  if(!db) return null;
  try {
    const {data} = await db.from("profiles").select("*").eq("id", user.id).maybeSingle();
    return data;
  } catch(e) {
    return null;
  }
}

async function initSession(){
  if(!db){ showAuth(); return; }
  try {
    const {data:{session}} = await db.auth.getSession();
    if(session){
      showApp(session.user, await loadProfile(session.user));
    } else {
      showAuth();
    }
    db.auth.onAuthStateChange(async (_event, session) => {
      if(session){
        showApp(session.user, await loadProfile(session.user));
      } else {
        currentUser = null;
        showAuth();
      }
    });
  } catch(err) {
    showAuth();
  }
}

$("#switch-auth").addEventListener("click", () => {
  const isSignupHidden = $("#signup-form").classList.contains("hidden");
  showAuth(isSignupHidden);
});

// FITUR LOGIN
$("#login-form").addEventListener("submit", async e => {
  e.preventDefault();
  if(!db) return toast("Supabase belum terhubung.");
  
  const email = $("#login-email").value.trim();
  const password = $("#login-password").value;
  
  toast("Memproses masuk...");
  const {data, error} = await db.auth.signInWithPassword({ email, password });
  if(error){
    toast("Gagal masuk: " + error.message);
  } else {
    toast("Berhasil masuk!");
  }
});

// FITUR PENDAFTARAN (SIGNUP)
$("#signup-form").addEventListener("submit", async e => {
  e.preventDefault();
  if(!db) return toast("Supabase belum terhubung.");
  
  const fullName = $("#signup-name").value.trim();
  const email = $("#signup-email").value.trim();
  const password = $("#signup-password").value;
  
  toast("Membuat akun...");
  const {data, error} = await db.auth.signUp({
    email: email,
    password: password,
    options: {
      data: { full_name: fullName }
    }
  });

  if(error){
    toast("Gagal daftar: " + error.message);
  } else {
    toast("Akun berhasil dibuat! Silakan masuk.");
    showAuth(false); // Kembalikan ke form login
  }
});

$("#logout-btn").addEventListener("click", async () => {
  if(db) await db.auth.signOut();
  showAuth();
});

$("#navigation").addEventListener("click", e => {
  const b = e.target.closest("[data-page]");
  if(b){
    renderPage(b.dataset.page);
    $("#sidebar").classList.remove("open");
  }
});

$("#menu-toggle").addEventListener("click", () => $("#sidebar").classList.toggle("open"));

function renderPage(page){
  currentPage = page;
  let pageTitle = titles[page] || "Beranda";
  $("#page-crumb").textContent = pageTitle;  $$(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.page === page));

  const content = $("#page-content");
  if(page === "dashboard"){
    let userNameClean = "Warga Sekolah";
    if(profile && profile.full_name) {
      userNameClean = profile.full_name;
    } else if(currentUser && currentUser.email) {
      userNameClean = currentUser.email.split("@")[0];
    }

    content.innerHTML = `
      <div class="welcome-box" style="background:linear-gradient(135deg, #1e3a8a, #2563eb); color:#fff; padding:30px; border-radius:16px; margin-bottom:24px;">
        <h1 style="font-size:24px; margin-bottom:8px;">Halo, ${escapeHtml(userNameClean)}! 👋</h1>
        <p style="color:#dbeafe; font-size:14px;">Selamat datang di Portal E-Learning dan SIM Akademik SMK Negeri 2 Surakarta.</p>
      </div>
      <div class="elearning-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:20px;">
        <div class="card" style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:20px;">
          <span class="badge" style="display:inline-block; padding:4px 10px; background:#e0e7ff; color:#3730a3; border-radius:20px; font-size:12px; font-weight:600; margin-bottom:12px;">Materi Terbaru</span>
          <h3 style="font-size:18px; color:#0f172a; margin-bottom:8px;">Pemrograman Perangkat Bergerak</h3>
          <p style="font-size:14px; color:#64748b; margin-bottom:12px;">Modul pembelajaran Flutter & Kotlin untuk kelas XI PPLG.</p>
          <button class="btn primary" onclick="renderPage('elearning')">Buka Materi →</button>
        </div>
        <div class="card" style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:20px;">
          <span class="badge" style="display:inline-block; padding:4px 10px; background:#e0e7ff; color:#3730a3; border-radius:20px; font-size:12px; font-weight:600; margin-bottom:12px;">Tugas Aktif</span>
          <h3 style="font-size:18px; color:#0f172a; margin-bottom:8px;">Praktikum Jaringan Komputer</h3>
          <p style="font-size:14px; color:#64748b; margin-bottom:12px;">Konfigurasi Routing BGP Mikrotik. Tenggat waktu: Besok.</p>
          <button class="btn primary" onclick="renderPage('elearning')">Kumpul Tugas →</button>
        </div>
      </div>`;
  } else if(page === "elearning"){
    content.innerHTML = `
      <div class="card" style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-bottom:20px;">
        <h3>📖 Ruang E-Learning & Tugas Siswa</h3>
        <p>Unduh modul pelajaran yang dibagikan guru atau kumpulkan tugas tepat waktu.</p>
      </div>
      <div class="elearning-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:20px;">
        <div class="card" style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:20px;">
          <span class="badge" style="display:inline-block; padding:4px 10px; background:#e0e7ff; color:#3730a3; border-radius:20px; font-size:12px; font-weight:600; margin-bottom:12px;">Materi</span>
          <h3>Matematika: Trigonometri Lanjut</h3>
          <p>Guru: Drs. Slamet, M.Pd</p>
          <button class="btn primary" onclick="toast('Mengunduh materi...')">Download Modul</button>
        </div>
        <div class="card" style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:20px;">
          <span class="badge" style="display:inline-block; padding:4px 10px; background:#e0e7ff; color:#3730a3; border-radius:20px; font-size:12px; font-weight:600; margin-bottom:12px;">Tugas (Deadline: 15 Okt)</span>
          <h3>Bahasa Inggris: Report Text Assignment</h3>
          <p>Kumpulkan dalam format PDF.</p>
          <button class="btn primary" onclick="toast('Form pengumpulan tugas dibuka')">Upload Tugas</button>
        </div>
      </div>`;
  } else {
    content.innerHTML = `
      <div class="card" style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:20px;">
        <h3>Halaman ${pageTitle}</h3>
        <p>Fitur pengelolaan data ${pageTitle} terhubung dengan basis data Supabase.</p>
      </div>`;
  }
}

function escapeHtml(v){
  if(!v) return "";
  return String(v).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[c]));
}

initSession();