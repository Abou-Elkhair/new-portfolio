const CONSENT_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
  'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES',
  'SE', 'IS', 'LI', 'NO', 'GB', 'CH'
]);

export default {
  fetch(request) {
    const country = (request.headers.get('x-vercel-ip-country') || '').toUpperCase();
    const requiresConsent = !country || CONSENT_COUNTRIES.has(country);

    return Response.json(
      { requiresConsent },
      { headers: { 'Cache-Control': 'private, no-store, max-age=0' } }
    );
  }
};
