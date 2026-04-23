(function () {
  const USER = 'valencialifesciences@gmail.com';
  const PASS = 'Vishal@9998';
  const KEY = 'apollo_auth_v1';

  const authed = sessionStorage.getItem(KEY) === '1';

  function removeBlocker() {
    const s = document.getElementById('auth-blocker-style');
    if (s) s.remove();
  }

  function showLogin() {
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', showLogin);
      return;
    }
    document.body.innerHTML = '';
    removeBlocker();

    const style = document.createElement('style');
    style.textContent = `
      html, body { margin:0; padding:0; min-height:100vh; background:#070912; color:#e5e7eb;
        font-family: 'Inter', system-ui, -apple-system, Segoe UI, sans-serif; }
      .gate-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
      .gate-card { width:100%; max-width:420px; background:#0d1121; border:1px solid #1c2440;
        border-radius:16px; padding:36px 32px; box-shadow:0 30px 80px rgba(0,0,0,.5); }
      .gate-title { font-size:22px; font-weight:700; margin:0 0 4px; letter-spacing:-.01em; }
      .gate-sub { color:#94a3b8; font-size:13px; margin:0 0 24px; }
      .gate-field { margin-bottom:14px; }
      .gate-label { display:block; font-size:12px; color:#94a3b8; margin-bottom:6px; font-weight:500; }
      .gate-input { width:100%; box-sizing:border-box; background:#141a2e; border:1px solid #1c2440;
        color:#e5e7eb; padding:11px 13px; border-radius:10px; font-size:14px; outline:none;
        transition:border-color .15s; }
      .gate-input:focus { border-color:#6366f1; }
      .gate-btn { width:100%; background:#6366f1; color:white; border:none; padding:12px;
        border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; margin-top:6px;
        transition:background .15s; }
      .gate-btn:hover { background:#4f46e5; }
      .gate-err { color:#f43f5e; font-size:12px; margin-top:10px; min-height:16px; }
      .gate-brand { font-size:11px; color:#64748b; text-align:center; margin-top:18px;
        letter-spacing:.08em; text-transform:uppercase; }
    `;
    document.head.appendChild(style);

    const wrap = document.createElement('div');
    wrap.className = 'gate-wrap';
    wrap.innerHTML = `
      <form class="gate-card" id="gate-form" autocomplete="off">
        <h1 class="gate-title">Apollo Workbench</h1>
        <p class="gate-sub">Sign in to continue.</p>
        <div class="gate-field">
          <label class="gate-label" for="gate-user">Email</label>
          <input class="gate-input" id="gate-user" type="email" required autofocus>
        </div>
        <div class="gate-field">
          <label class="gate-label" for="gate-pass">Password</label>
          <input class="gate-input" id="gate-pass" type="password" required>
        </div>
        <button class="gate-btn" type="submit">Sign in</button>
        <div class="gate-err" id="gate-err"></div>
        <div class="gate-brand">Private · Authorized Access</div>
      </form>
    `;
    document.body.appendChild(wrap);

    document.getElementById('gate-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const u = document.getElementById('gate-user').value.trim();
      const p = document.getElementById('gate-pass').value;
      const err = document.getElementById('gate-err');
      if (u.toLowerCase() === USER.toLowerCase() && p === PASS) {
        sessionStorage.setItem(KEY, '1');
        location.reload();
      } else {
        err.textContent = 'Invalid email or password.';
        document.getElementById('gate-pass').value = '';
        document.getElementById('gate-pass').focus();
      }
    });
  }

  if (authed) {
    removeBlocker();
  } else {
    showLogin();
  }
})();
