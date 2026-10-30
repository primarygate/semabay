/* SEMA BAY — login ID + password (HTML-only; uses SBStore, no npm). */
(function (global) {
  'use strict';
  var user = null;
  var pending = null;
  var listeners = [];

  function api(path, opts) {
    if (!global.SBStore) {
      return Promise.reject(new Error('Storage is not available.'));
    }
    return global.SBStore.api(path, opts);
  }

  function notify() {
    listeners.forEach(function (fn) {
      try {
        fn(user);
      } catch (e) {}
    });
    paintHeader();
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function paintHeader() {
    var slot = document.getElementById('sbAuthSlot');
    if (!slot) return;
    if (user) {
      slot.innerHTML =
        '<span class="sb-user" title="Signed in">@' +
        escapeHtml(user.loginId) +
        '</span>' +
        '<button type="button" class="sb-auth-btn sb-auth-out" id="sbSignOut">Sign out</button>';
      var out = document.getElementById('sbSignOut');
      if (out) out.onclick = function () { logout(); };
    } else {
      slot.innerHTML =
        '<button type="button" class="sb-auth-btn" id="sbSignIn">Sign in</button>' +
        '<button type="button" class="sb-auth-btn sb-auth-primary" id="sbCreate">Create account</button>';
      var si = document.getElementById('sbSignIn');
      var cr = document.getElementById('sbCreate');
      if (si) si.onclick = function () { openAuth('login'); };
      if (cr) cr.onclick = function () { openAuth('register'); };
    }
  }

  function ensureModal() {
    var el = document.getElementById('sbAuthModal');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'sbAuthModal';
    el.className = 'sb-auth-modal';
    el.hidden = true;
    el.innerHTML =
      '<div class="sb-auth-card" role="dialog" aria-modal="true" aria-labelledby="sbAuthTitle">' +
      '<button type="button" class="sb-auth-x" id="sbAuthClose" aria-label="Close">×</button>' +
      '<h2 id="sbAuthTitle">Sign in</h2>' +
      '<p class="sb-auth-lead" id="sbAuthLead">Create a login ID and password to use SEMA BAY services.</p>' +
      '<form id="sbAuthForm" novalidate>' +
      '<label class="sb-auth-field"><span>Login ID</span>' +
      '<input id="sbAuthId" name="loginId" autocomplete="username" maxlength="32" placeholder="e.g. hussein_01" required/></label>' +
      '<label class="sb-auth-field"><span>Password</span>' +
      '<input id="sbAuthPass" name="password" type="password" autocomplete="current-password" maxlength="72" placeholder="At least 6 characters" required/></label>' +
      '<p class="sb-auth-error" id="sbAuthError" role="alert" hidden></p>' +
      '<button type="submit" class="sb-auth-submit" id="sbAuthSubmit">Sign in</button>' +
      '</form>' +
      '<p class="sb-auth-switch" id="sbAuthSwitch"></p>' +
      '</div>';
    document.body.appendChild(el);
    el.addEventListener('click', function (e) {
      if (e.target === el) closeAuth();
    });
    document.getElementById('sbAuthClose').onclick = closeAuth;
    document.getElementById('sbAuthForm').addEventListener('submit', onSubmit);
    return el;
  }

  var mode = 'login';

  function setMode(next) {
    mode = next === 'register' ? 'register' : 'login';
    var title = document.getElementById('sbAuthTitle');
    var lead = document.getElementById('sbAuthLead');
    var submit = document.getElementById('sbAuthSubmit');
    var sw = document.getElementById('sbAuthSwitch');
    var pass = document.getElementById('sbAuthPass');
    if (mode === 'register') {
      title.textContent = 'Create account';
      lead.textContent = 'Choose a login ID and password to access chat and other SEMA BAY services.';
      submit.textContent = 'Create account';
      pass.autocomplete = 'new-password';
      sw.innerHTML = 'Already have an account? <button type="button" id="sbAuthGoLogin">Sign in</button>';
      document.getElementById('sbAuthGoLogin').onclick = function () { setMode('login'); };
    } else {
      title.textContent = 'Sign in';
      lead.textContent = 'Use your login ID and password to continue.';
      submit.textContent = 'Sign in';
      pass.autocomplete = 'current-password';
      sw.innerHTML = 'New here? <button type="button" id="sbAuthGoReg">Create account</button>';
      document.getElementById('sbAuthGoReg').onclick = function () { setMode('register'); };
    }
    document.getElementById('sbAuthError').hidden = true;
  }

  function openAuth(nextMode, after) {
    ensureModal();
    pending = typeof after === 'function' ? after : null;
    setMode(nextMode || 'login');
    document.getElementById('sbAuthModal').hidden = false;
    document.documentElement.style.overflow = 'hidden';
    setTimeout(function () {
      document.getElementById('sbAuthId').focus();
    }, 30);
  }

  function closeAuth() {
    var modal = document.getElementById('sbAuthModal');
    if (modal) modal.hidden = true;
    document.documentElement.style.overflow = '';
    pending = null;
  }

  function onSubmit(e) {
    e.preventDefault();
    var id = document.getElementById('sbAuthId').value.trim();
    var pass = document.getElementById('sbAuthPass').value;
    var err = document.getElementById('sbAuthError');
    var btn = document.getElementById('sbAuthSubmit');
    err.hidden = true;
    btn.disabled = true;
    var path = mode === 'register' ? '/auth/register' : '/auth/login';
    api(path, { method: 'POST', body: JSON.stringify({ loginId: id, password: pass }) })
      .then(function (data) {
        user = data.user;
        notify();
        var done = pending;
        closeAuth();
        if (done) done(user);
      })
      .catch(function (ex) {
        err.textContent = ex.message || 'Could not continue.';
        err.hidden = false;
      })
      .then(function () {
        btn.disabled = false;
      });
  }

  function logout() {
    return api('/auth/logout', { method: 'POST', body: '{}' })
      .catch(function () {})
      .then(function () {
        user = null;
        notify();
      });
  }

  function refresh() {
    return api('/auth/me')
      .then(function (data) {
        user = data.user || null;
        notify();
        return user;
      })
      .catch(function () {
        user = null;
        notify();
        return null;
      });
  }

  function requireAuth(after) {
    if (user) {
      if (typeof after === 'function') after(user);
      return Promise.resolve(user);
    }
    return new Promise(function (resolve) {
      openAuth('login', function (u) {
        resolve(u);
        if (typeof after === 'function') after(u);
      });
    });
  }

  global.SBAuth = {
    api: api,
    refresh: refresh,
    require: requireAuth,
    open: openAuth,
    logout: logout,
    user: function () {
      return user;
    },
    onChange: function (fn) {
      listeners.push(fn);
    },
  };

  function boot() {
    ensureModal();
    paintHeader();
    refresh();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
