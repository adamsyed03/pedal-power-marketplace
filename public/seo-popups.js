/* Lead popup, desktop contact widget and mobile sticky CTA for static SEO pages.
   Mirrors the lead popup in src/app/App.tsx: opens after 8 s or 35 % scroll,
   once per device class, and saves the phone number to the Supabase `leads` table. */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://cirrgscedpitegcahklq.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_E8KefAY_I0CO_mKMDCpMcg_RT2dXiBB';
  var ADS_CONVERSION = 'AW-18415875509/rDHlCKvGk-ocELXrr81E';
  var PHONE_HREF = 'tel:+381631505003';
  var WHATSAPP_HREF = 'https://wa.me/381631505003?text=' + encodeURIComponent('Zdravo, želim da zakažem test vožnju Pogon električnog bicikla.');

  var icons = {
    chat: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>',
    check: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>',
    calendar: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>',
    phone: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>'
  };

  var storageKey = function () {
    return window.matchMedia('(min-width: 768px)').matches ? 'pogon_popup_done_desktop' : 'pogon_popup_done_mobile';
  };
  var storageGet = function (key) { try { return localStorage.getItem(key); } catch (e) { return null; } };
  var storageSet = function (key, value) { try { localStorage.setItem(key, value); } catch (e) { /* private mode */ } };

  var track = function (source) {
    if (typeof window.gtag === 'function') window.gtag('event', 'conversion', { send_to: ADS_CONVERSION });
    if (typeof window.fbq === 'function') window.fbq('track', 'Lead', { content_name: 'Website lead form', content_category: source });
  };

  var submitLead = function (phone, source) {
    var request = fetch(SUPABASE_URL + '/rest/v1/leads', {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ name: 'Popup lead', phone: phone, source: source, language: 'sr', city: null, comment: 'Stranica: ' + location.pathname })
    }).then(function (response) {
      if (!response.ok) throw new Error('Lead request failed');
      track(source);
    });
    var timeout = new Promise(function (_, reject) { setTimeout(function () { reject(new Error('timeout')); }, 6000); });
    return Promise.race([request, timeout]);
  };

  /* ---------- Lead popup ---------- */
  var overlay = document.createElement('div');
  overlay.className = 'lp-overlay';
  overlay.hidden = true;
  overlay.innerHTML =
    '<div class="lp-dialog" role="dialog" aria-modal="true" aria-labelledby="lp-title">' +
      '<div class="lp-body">' +
        '<button type="button" class="lp-close" aria-label="Zatvori">&times;</button>' +
        '<div class="lp-form-view">' +
          '<img class="lp-logo" src="/Logo.png" alt="POGON" width="1024" height="1024">' +
          '<h2 class="lp-title" id="lp-title">Hoćeš<br><span>test vožnju?</span></h2>' +
          '<p class="lp-text">Ostavi broj. Pozvaćemo te da dogovorimo termin. Bez obaveze kupovine.</p>' +
          '<form novalidate>' +
            '<div class="lp-field"><span class="lp-prefix">+381</span><input type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="Broj telefona" aria-label="Broj telefona"></div>' +
            '<p class="lp-error" role="alert" hidden></p>' +
            '<button type="submit" class="lp-submit">Pozovite me</button>' +
          '</form>' +
          '<div class="lp-or">ili</div>' +
          '<a class="lp-whatsapp" href="' + WHATSAPP_HREF + '" target="_blank" rel="noreferrer">' + icons.chat + 'Piši nam na WhatsApp</a>' +
        '</div>' +
        '<div class="lp-done" hidden>' +
          '<div class="lp-check">' + icons.check + '</div>' +
          '<h2>Hvala!</h2><p>Javićemo ti se uskoro.</p>' +
          '<button type="button" class="lp-done-close">Zatvori</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  var form = overlay.querySelector('form');
  var input = overlay.querySelector('input');
  var field = overlay.querySelector('.lp-field');
  var errorEl = overlay.querySelector('.lp-error');
  var submitBtn = overlay.querySelector('.lp-submit');
  var formView = overlay.querySelector('.lp-form-view');
  var doneView = overlay.querySelector('.lp-done');
  var popupShown = false;
  var popupSource = 'lead-popup';
  var lastFocus = null;

  var setError = function (message) {
    errorEl.textContent = message;
    errorEl.hidden = !message;
    field.classList.toggle('has-error', !!message);
  };

  var openPopup = function (source) {
    popupShown = true;
    popupSource = source;
    lastFocus = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add('lp-locked');
    requestAnimationFrame(function () { overlay.classList.add('is-open'); });
    setTimeout(function () { (doneView.hidden ? input : overlay.querySelector('.lp-done-close')).focus({ preventScroll: true }); }, 60);
  };

  var closePopup = function () {
    if (overlay.hidden) return;
    overlay.classList.remove('is-open');
    document.body.classList.remove('lp-locked');
    storageSet(storageKey(), '1');
    setTimeout(function () { overlay.hidden = true; }, 220);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  };

  overlay.addEventListener('mousedown', function (event) { if (event.target === overlay) closePopup(); });
  overlay.querySelector('.lp-close').addEventListener('click', closePopup);
  overlay.querySelector('.lp-done-close').addEventListener('click', closePopup);
  overlay.querySelector('.lp-whatsapp').addEventListener('click', closePopup);
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape') closePopup(); });
  input.addEventListener('input', function () { setError(''); });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var digits = input.value.replace(/\D/g, '').replace(/^0+/, '');
    if (digits.length < 6) { setError('Unesite ispravan broj telefona.'); return; }
    setError('');
    submitBtn.disabled = true;
    submitBtn.textContent = '…';
    var finish = function () {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Pozovite me';
      formView.hidden = true;
      doneView.hidden = false;
      overlay.querySelector('.lp-done-close').focus({ preventScroll: true });
    };
    /* Same as the Serbian popup in the app: show the thank-you state even if saving fails. */
    submitLead('+381' + digits, popupSource).then(finish, finish);
  });

  /* ---------- Desktop contact widget ---------- */
  var widget = document.createElement('div');
  widget.className = 'cw';
  widget.innerHTML =
    '<div class="cw-panel" id="cw-panel" hidden>' +
      '<div class="cw-head"><div><p class="cw-kicker">POGON</p><h3>Tu smo da pomognemo</h3></div>' +
      '<button type="button" class="cw-x" aria-label="Zatvori">&times;</button></div>' +
      '<p>Razgovarajte sa Pogon stručnjakom i pronađite pravi bicikl za vas.</p>' +
      '<button type="button" class="cw-book">' + icons.chat + 'Zakaži razgovor</button>' +
    '</div>' +
    '<button type="button" class="cw-toggle" aria-controls="cw-panel" aria-expanded="false">' +
      '<span class="cw-toggle-icon">' + icons.chat + '</span><span>Kontaktirajte nas</span>' +
    '</button>';

  var panel = widget.querySelector('.cw-panel');
  var toggle = widget.querySelector('.cw-toggle');
  var setPanel = function (open) {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.addEventListener('click', function () { setPanel(panel.hidden); });
  widget.querySelector('.cw-x').addEventListener('click', function () { setPanel(false); });
  widget.querySelector('.cw-book').addEventListener('click', function () { setPanel(false); openPopup('specialist-contact'); });
  document.addEventListener('pointerdown', function (event) { if (!widget.contains(event.target)) setPanel(false); });

  /* ---------- Mobile sticky CTA ---------- */
  var sticky = document.createElement('div');
  sticky.className = 'sticky-cta';
  sticky.innerHTML =
    '<div class="sticky-cta-inner">' +
      '<button type="button" class="sticky-book">' + icons.calendar + 'Zakaži test vožnju</button>' +
      '<a class="sticky-icon sticky-phone" href="' + PHONE_HREF + '" aria-label="Pozovite nas">' + icons.phone + '</a>' +
      '<a class="sticky-icon sticky-wa" href="' + WHATSAPP_HREF + '" target="_blank" rel="noreferrer" aria-label="WhatsApp">' + icons.chat.replace('width="16" height="16"', 'width="20" height="20"') + '</a>' +
    '</div>';
  sticky.querySelector('.sticky-book').addEventListener('click', function () { openPopup('mobile-sticky-cta'); });

  document.body.appendChild(sticky);
  document.body.appendChild(widget);
  document.body.appendChild(overlay);
  document.body.classList.add('has-sticky-cta');

  /* ---------- Auto-open: 8 s or 35 % scroll, once per device class ---------- */
  try { localStorage.removeItem('pogon_popup_done'); } catch (e) { /* */ }
  if (storageGet(storageKey()) === '1') return;
  var autoShow = function () {
    if (popupShown) return;
    window.removeEventListener('scroll', onScroll);
    openPopup('lead-popup');
  };
  var onScroll = function () {
    var pct = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
    if (pct >= 0.35) autoShow();
  };
  setTimeout(autoShow, 8000);
  window.addEventListener('scroll', onScroll, { passive: true });
})();
