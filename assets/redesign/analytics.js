(() => {
  'use strict';
  const measurementId = 'G-67HVLQ67PT';
  const storageKey = 'redaifu-analytics-consent-v1';
  const maxAge = 180 * 24 * 60 * 60 * 1000;
  const production = location.hostname === 'redaifu.com' && location.protocol === 'https:';
  const banner = document.querySelector('[data-analytics-banner]');
  const settings = document.querySelector('[data-analytics-settings]');
  if (!banner || !settings) return;
  let consent = null;
  let started = false;
  let returnFocus = null;
  const denied = { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
  const readChoice = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved && ['granted', 'denied'].includes(saved.choice) && Number.isFinite(saved.time) && Date.now() >= saved.time && Date.now() - saved.time < maxAge) return saved.choice;
    } catch { /* Storage may be blocked. Keep analytics off until a choice is made. */ }
    return null;
  };
  const eraseCookies = () => {
    document.cookie.split(';').map(item => item.trim().split('=')[0]).filter(name => /^_ga(?:_|$)/.test(name)).forEach(name => {
      ['', '; domain=redaifu.com', '; domain=.redaifu.com'].forEach(domain => {
        document.cookie = name + '=; Max-Age=0; path=/' + domain + '; SameSite=Lax; Secure';
      });
    });
  };
  const cleanReferrer = () => {
    try { const url = new URL(document.referrer); return /^https?:$/.test(url.protocol) ? url.origin + '/' : ''; } catch { return ''; }
  };
  const start = () => {
    if (!production || consent !== 'granted') return;
    window['ga-disable-' + measurementId] = false;
    if (started) { window.gtag('consent', 'update', { ...denied, analytics_storage: 'granted' }); return; }
    started = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', denied);
    window.gtag('consent', 'update', { ...denied, analytics_storage: 'granted' });
    window.gtag('js', new Date());
    // Only canonical page URLs and referrer origins: no query strings, fragments or form values.
    const canonical = document.querySelector('link[rel="canonical"]')?.href;
    const pageUrl = canonical && canonical.startsWith('https://redaifu.com/') ? canonical : 'https://redaifu.com/';
    window.gtag('config', measurementId, {
      send_page_view: false,
      page_location: pageUrl,
      page_referrer: cleanReferrer(),
      page_title: document.title,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_domain: 'redaifu.com',
      cookie_expires: 15552000,
      cookie_flags: 'SameSite=Lax;Secure'
    });
    window.gtag('event', 'page_view');
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.append(script);
  };
  const stop = () => {
    window['ga-disable-' + measurementId] = true;
    if (started) window.gtag('consent', 'update', denied);
    eraseCookies();
  };
  const applyChoice = (choice, persist = false) => {
    consent = choice;
    if (persist) {
      try { localStorage.setItem(storageKey, JSON.stringify({ choice, time: Date.now() })); } catch { /* Choice still applies to this page. */ }
    }
    if (choice === 'granted') start(); else stop();
    banner.hidden = choice !== null;
    settings.setAttribute('aria-expanded', String(!banner.hidden));
    if (persist && returnFocus) { returnFocus.focus(); returnFocus = null; }
  };
  const track = (name) => {
    if (production && consent === 'granted' && started && !window['ga-disable-' + measurementId]) {
      window.gtag('event', name, { send_to: measurementId });
    }
  };
  settings.hidden = false;
  settings.addEventListener('click', () => {
    returnFocus = settings;
    banner.hidden = false;
    settings.setAttribute('aria-expanded', 'true');
    banner.querySelector('[data-analytics-allow]').focus();
  });
  banner.querySelector('[data-analytics-allow]').addEventListener('click', () => applyChoice('granted', true));
  banner.querySelector('[data-analytics-deny]').addEventListener('click', () => applyChoice('denied', true));
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    try {
      const url = new URL(link.href);
      if (url.protocol === 'https:' && url.hostname === 'lin.ee' && url.pathname === '/VBoykaMo') track('line_click');
    } catch { /* Ignore links that are not valid URLs. */ }
  });
  // Emitted only after Web3Forms confirms successful submission; carries no form data.
  document.addEventListener('redaifu:contact-success', () => track('generate_lead'));
  window.addEventListener('storage', event => { if (event.key === storageKey || event.key === null) applyChoice(readChoice()); });
  applyChoice(readChoice());
})();
