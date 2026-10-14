/* SIM & E-Learning SMK Negeri 2 Surakarta */

const $ = (s) => document.querySelector(s); const $$ = (s) => [...document.querySelectorAll(s)];
let currentUser = null, currentPage = "dashboard";

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

function getUsersFromStorage(){
  return JSON.parse(localStorage.getItem("sim_users") || "[]");
}

function saveUsersToStorage(users){
  localStorage.setItem("sim_users", JSON.stringify(users));
}

function showAuth(signup = false){
  const authScreen = $("#auth-screen");
  const app = $("#app");
  const loginForm = $("#login-form");
  const signupForm = $("#signup-form");
  
  if(authScreen) authScreen.classList.remove("hidden");
  if(app) app.classList.add("hidden");
  if(loginForm) loginForm.classList.toggle("hidden", signup);
  if(signupForm) signupForm.classList.toggle("hidden", !signup);
  
  const authTitle = $("#auth-title");
  if(authTitle) authTitle.textContent = signup ? "Buat akun baru" : "Masuk ke akun";
  
  const switchCopy = $("#switch-copy");
  if(switchCopy) switchCopy.textContent = signup ? "Sudah punya akun?" : "Belum punya akun?";
  
  const switchAuth = $("#switch-auth");
  if(switchAuth) switchAuth.textContent = signup ? "Masuk di sini" : "Daftar di sini";
}

function showApp(user){
  currentUser = user;
  const authScreen = $("#auth-screen");
  const app = $("#app");
  
  if(authScreen) authScreen.classList.add("hidden");
  if(app) app.classList.remove("hidden");
  
  const displayName = user.name || user.email.split("@")[0] || "Pengguna";
  
  const userName = $("#user-name");
  if(userName) userName.textContent = displayName;
  
  const userRole = $("#user-role");
  if(userRole) userRole.textContent = user.role || "Siswa / Guru";
  
  const userAvatar = $("#user-avatar");
  if(userAvatar) userAvatar.textContent = (displayName[0] || "S").toUpperCase();
  
  const todayLabel = $("#today-label");
  if(todayLabel) todayLabel.textContent = dateToday();
  
  const yearEl = $("#year");
  if(yearEl) yearEl.textContent = new Date().getFullYear();
  
  renderPage("dashboard");
}

function initSession(){
  const savedUser = JSON.parse(localStorage.getItem("sim_current_user") || "null");
  if(savedUser){
    showApp(savedUser);
  } else {
    showAuth();
  }
}

const switchAuthBtn = $("#switch-auth");
if(switchAuthBtn){
  switchAuthBtn.addEventListener("click", () => {
    const signupForm = $("#signup-form");
    const isSignupHidden = signupForm ? signupForm.classList.contains("hidden") : true;
    showAuth(isSignupHidden);
  });
}

// PROSES LOGIN
const loginFormEl = $("#login-form");
if(loginFormEl){
  loginFormEl.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const email = $("#login-email").value.trim().toLowerCase();
    const password = $("#login-password").value;
    
    const users = getUsersFromStorage();
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if(foundUser){
      localStorage.setItem("sim_current_user", JSON.stringify(foundUser));
      toast("Berhasil masuk!");
      showApp(foundUser);
    } else {
      toast("Gagal masuk: Email atau kata sandi salah!");
    }
  });
}

// PROSES PENDAFTARAN (SIGNUP)
const signupFormEl = $("#signup-form");
if(signupFormEl){
  signupFormEl.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const name = $("#signup-name").value.trim();
    const email = $("#signup-email").value.trim().toLowerCase();
    const password = $("#signup-password").value;
    
    const users = getUsersFromStorage();
    const isExist = users.some(u => u.email === email);
    
    if(isExist){
      return toast("Gagal daftar: Email sudah terdaftar!");
    }
    
    const newUser = { id: Date.now(), name, email, password, role: "Siswa" };
    users.push(newUser);
    saveUsersToStorage(users);
    
    toast("Akun berhasil dibuat! Silakan masuk.");
    showAuth(false);
  });
}

const logoutBtn = $("#logout-btn");
if(logoutBtn){
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("sim_current_user");
    currentUser = null;
    showAuth();
    toast("Berhasil keluar.");
  });
}

const navigation = $("#navigation");
if(navigation){
  navigation.addEventListener("click", e => {
    const b = e.target.closest("[data-page]");
    if(b){
      renderPage(b.dataset.page);
      const sidebar = $("#sidebar");
      if(sidebar) sidebar.classList.remove("open");
    }
  });
}

const menuToggle = $("#menu-toggle");
if(menuToggle){
  menuToggle.addEventListener("click", () => {
    const sidebar = $("#sidebar");
    if(sidebar) sidebar.classList.toggle("open");
  });
}

function renderPage(page){
  currentPage = page;
  let pageTitle = titles[page] || "Beranda";
  const pageCrumb = $("#page-crumb"); if(pageCrumb) pageCrumb.textContent = pageTitle;  $$(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.page === page));

  const content = $("#page-content");
  if(!content) return;

  if(page === "dashboard"){
    let userNameClean = currentUser ? currentUser.name : "Warga Sekolah";

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
        <p>Pengelolaan data ${pageTitle} berjalan normal di portal SMK Negeri 2 Surakarta.</p>
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