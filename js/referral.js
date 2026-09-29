(() => {
    'use strict';

    const validCodes = new Set(['ALMA', 'MUHHAMED', 'VLAD']);
    const keys = {
        referral: 'turkluxx_referral',
        createdAt: 'turkluxx_referral_created_at',
        landingPage: 'turkluxx_referral_landing_page'
    };
    const normalize = value => {
        const code = (value || '').trim().toUpperCase();
        return validCodes.has(code) ? code : null;
    };

    // Always read storage so navigation and other tabs see the same attribution.
    window.getTurkLuxxReferralAttribution = () => {
        try {
            const referral = normalize(localStorage.getItem(keys.referral));
            if (referral) {
                return {
                    referral,
                    createdAt: localStorage.getItem(keys.createdAt),
                    landingPage: localStorage.getItem(keys.landingPage)
                };
            }
        } catch {
            // Storage may be blocked. Attribution must never break the website.
        }
        return { referral: 'DIRECT', createdAt: null, landingPage: null };
    };
    window.getTurkLuxxReferral = () => window.getTurkLuxxReferralAttribution().referral;

    const incoming = normalize(new URLSearchParams(window.location.search).get('ref'));
    if (!incoming) return;

    try {
        if (normalize(localStorage.getItem(keys.referral))) return;
        // Write the valid code last; incomplete metadata alone is not attribution.
        localStorage.setItem(keys.createdAt, new Date().toISOString());
        localStorage.setItem(keys.landingPage, window.location.href);
        localStorage.setItem(keys.referral, incoming);
    } catch {
        // No cookies, redirects, or UI fallback when localStorage is unavailable.
    }
})();
