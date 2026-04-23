(function () {
  const APOLLO_KEYS = ['apollo_companies_v1', 'apollo_crm_v1', 'apollo_favorites', 'apollo_co_header_collapsed'];
  let syncing = false;

  function removeBlocker() {
    const s = document.getElementById('auth-blocker-style');
    if (s) s.remove();
  }

  async function pullFromSupabase() {
    const { data, error } = await window.supaClient.from('user_data').select('key, value');
    if (error) { console.warn('[sync] pull failed:', error.message); return; }
    for (const row of data || []) {
      if (!APOLLO_KEYS.includes(row.key)) continue;
      localStorage.setItem(row.key, typeof row.value === 'string' ? row.value : JSON.stringify(row.value));
    }
  }

  async function pushKey(key, rawValue) {
    if (syncing) return;
    const { data: { user } } = await window.supaClient.auth.getUser();
    if (!user) return;
    let value;
    try { value = JSON.parse(rawValue); } catch { value = rawValue; }
    const { error } = await window.supaClient.from('user_data').upsert({
      user_id: user.id, key, value, updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,key' });
    if (error) console.warn('[sync] push failed for', key, error.message);
  }

  function hookLocalStorage() {
    const orig = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (k, v) {
      orig(k, v);
      if (APOLLO_KEYS.includes(k)) pushKey(k, v);
    };
  }

  async function startSignedInFlow() {
    syncing = true;
    try { await pullFromSupabase(); } catch (e) { console.warn('[sync] error:', e); }
    syncing = false;
    hookLocalStorage();
    removeBlocker();
  }

  function renderLogin(initialError) {
    const boot = () => {
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
          color:#e5e7eb; padding:11px 13px; border-radius:10px; font-size:14px; outline:none; transition:border-color .15s; }
        .gate-input:focus { border-color:#6366f1; }
        .gate-btn { width:100%; background:#6366f1; color:white; border:none; padding:12px; border-radius:10px;
          font-size:14px; font-weight:600; cursor:pointer; margin-top:6px; transition:background .15s; }
        .gate-btn:hover { background:#4f46e5; }
        .gate-btn:disabled { opacity:.6; cursor:wait; }
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
          <button class="gate-btn" type="submit" id="gate-submit">Sign in</button>
          <div class="gate-err" id="gate-err">${initialError || ''}</div>
          <div class="gate-brand">Supabase Auth · Secure</div>
        </form>
      `;
      document.body.appendChild(wrap);

      document.getElementById('gate-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        const email = document.getElementById('gate-user').value.trim();
        const password = document.getElementById('gate-pass').value;
        const err = document.getElementById('gate-err');
        const btn = document.getElementById('gate-submit');
        err.textContent = '';
        btn.disabled = true;
        btn.textContent = 'Signing in…';
        const { error } = await window.supaClient.auth.signInWithPassword({ email, password });
        if (error) {
          err.textContent = error.message || 'Sign-in failed.';
          btn.disabled = false;
          btn.textContent = 'Sign in';
          document.getElementById('gate-pass').value = '';
          document.getElementById('gate-pass').focus();
          return;
        }
        location.reload();
      });
    };
    if (!document.body) document.addEventListener('DOMContentLoaded', boot);
    else boot();
  }

  async function init() {
    if (!window.supaClient) {
      console.error('[auth] supaClient not initialized');
      renderLogin('Supabase client failed to load.');
      return;
    }
    const { data: { session } } = await window.supaClient.auth.getSession();
    if (session) {
      await startSignedInFlow();
    } else {
      renderLogin();
    }
  }

  init();
})();
