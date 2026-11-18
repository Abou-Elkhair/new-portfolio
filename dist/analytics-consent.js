(() => {
  'use strict';

  const clarityProjectId = document.documentElement.dataset.clarityProjectId || '';
  const previewMode = new URLSearchParams(window.location.search).get('analytics-preview') === 'consent';
  const preferenceKey = 'portfolio-clarity-consent-v1';
  const regionEndpoint = '/api/analytics-region';
  const collapseAfter = 30000;
  const preferencesButton = document.querySelector('[data-analytics-preferences]');

  let banner;
  let collapseTimer;
  let consentRequired = false;
  let clarityLoaded = false;

  const getPreference = () => {
    try {
      return window.localStorage.getItem(preferenceKey);
    } catch {
      return null;
    }
  };

  const setPreference = (preference) => {
    try {
      window.localStorage.setItem(preferenceKey, preference);
    } catch {
      // Storage might be disabled. The user choice still applies for this visit.
    }
  };

  const ensureClarityQueue = () => {
    if (typeof window.clarity === 'function') return;
    window.clarity = function clarityQueue() {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };
  };

  const grantAnalyticsStorage = () => {
    ensureClarityQueue();
    window.clarity('consentv2', {
      ad_Storage: 'denied',
      analytics_Storage: 'granted'
    });
  };

  const loadClarity = () => {
    if (!clarityProjectId) return;

    grantAnalyticsStorage();
    if (clarityLoaded) return;

    clarityLoaded = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${encodeURIComponent(clarityProjectId)}`;
    script.dataset.clarityTag = 'portfolio';
    document.head.appendChild(script);
  };

  const revokeAnalyticsStorage = () => {
    if (typeof window.clarity !== 'function') return;
    window.clarity('consentv2', {
      ad_Storage: 'denied',
      analytics_Storage: 'denied'
    });
    window.clarity('consent', false);
  };

  const createBanner = () => {
    if (banner) return banner;

    banner = document.createElement('aside');
    banner.className = 'analytics-consent';
    banner.setAttribute('aria-label', 'Cookie preferences');
    banner.innerHTML = `
      <div class="analytics-consent__bar">
        <div class="analytics-consent__panel">
          <p class="analytics-consent__copy">We use optional cookies to improve this portfolio.</p>
          <div class="analytics-consent__actions">
            <button class="analytics-consent__allow" type="button" data-analytics-allow>Allow</button>
            <button class="analytics-consent__reject" type="button" data-analytics-reject>Reject</button>
            <button class="analytics-consent__minimize" type="button" data-analytics-minimize aria-label="Minimise cookie message" title="Minimise cookie message">
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
            </button>
          </div>
        </div>
      </div>
      <button class="analytics-consent__toggle" type="button" data-analytics-toggle>Cookie settings</button>
    `;

    banner.querySelector('[data-analytics-allow]').addEventListener('click', () => {
      setPreference('granted');
      loadClarity();
      hideBanner();
    });

    banner.querySelector('[data-analytics-reject]').addEventListener('click', () => {
      setPreference('denied');
      revokeAnalyticsStorage();
      hideBanner();
    });

    banner.querySelector('[data-analytics-minimize]').addEventListener('click', collapseBanner);

    banner.querySelector('[data-analytics-toggle]').addEventListener('click', () => {
      showBanner();
    });

    document.body.appendChild(banner);
    return banner;
  };

  const hideBanner = () => {
    if (!banner) return;
    window.clearTimeout(collapseTimer);
    banner.hidden = true;
    banner.classList.remove('is-collapsed');
    document.body.classList.remove('has-analytics-consent');
  };

  const collapseBanner = () => {
    if (!banner || banner.hidden) return;
    banner.classList.add('is-collapsed');
    document.body.classList.remove('has-analytics-consent');
  };

  const showBanner = () => {
    const bannerElement = createBanner();
    window.clearTimeout(collapseTimer);
    bannerElement.hidden = false;
    bannerElement.classList.remove('is-collapsed');
    document.body.classList.add('has-analytics-consent');
    collapseTimer = window.setTimeout(collapseBanner, collapseAfter);
  };

  const setPreferencesControlVisible = (visible) => {
    if (preferencesButton) preferencesButton.hidden = !visible;
  };

  const getConsentRequirement = async () => {
    try {
      const response = await window.fetch(regionEndpoint, { credentials: 'same-origin', cache: 'no-store' });
      if (!response.ok) throw new Error('Region lookup failed');
      const result = await response.json();
      return result.requiresConsent === true;
    } catch {
      // Unknown location uses the privacy-preserving path.
      return true;
    }
  };

  const initialiseAnalytics = async () => {
    if (!clarityProjectId && !previewMode) return;

    consentRequired = await getConsentRequirement();

    if (!consentRequired) {
      loadClarity();
      return;
    }

    setPreferencesControlVisible(true);
    const preference = getPreference();
    if (preference === 'granted') {
      loadClarity();
      return;
    }
    if (preference === 'denied') return;
    showBanner();
  };

  if (preferencesButton) {
    preferencesButton.addEventListener('click', () => {
      if (consentRequired) showBanner();
    });
  }

  initialiseAnalytics();
})();
