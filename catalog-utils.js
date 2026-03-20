(function () {
    const STORAGE_KEY = 'kd_whatsapp_number';

    function normalizePhone(rawPhone) {
        const digits = String(rawPhone || '').replace(/\D/g, '');
        if (!digits) {
            return '';
        }

        const normalizedDigits = digits.startsWith('55') ? digits : `55${digits}`;
        if (!/^\d{12,13}$/.test(normalizedDigits)) {
            return '';
        }

        return normalizedDigits;
    }

    function getConfiguredPhone() {
        const metaPhone = normalizePhone(document.querySelector('meta[name="kd-whatsapp-number"]')?.content);
        const windowPhone = normalizePhone(window.KD_WHATSAPP_NUMBER);
        const savedPhone = normalizePhone(window.localStorage.getItem(STORAGE_KEY));

        return metaPhone || windowPhone || savedPhone;
    }

    function persistPhone(phone) {
        if (!phone) {
            return '';
        }

        window.localStorage.setItem(STORAGE_KEY, phone);
        return phone;
    }

    function ensureConfiguredPhone() {
        const configuredPhone = getConfiguredPhone();
        if (configuredPhone) {
            return configuredPhone;
        }

        const userInput = window.prompt(
            'Informe o numero do WhatsApp com DDD para concluir o redirecionamento. Ex.: 5592999999999'
        );
        const normalizedPhone = normalizePhone(userInput);

        if (!normalizedPhone) {
            window.alert('Nao foi possivel abrir o WhatsApp sem um numero valido.');
            return '';
        }

        return persistPhone(normalizedPhone);
    }

    function trackPixel(eventName, payload) {
        if (typeof window.fbq === 'function') {
            window.fbq('track', eventName, payload);
        }
    }

    function openWhatsApp(message, options) {
        const settings = options || {};
        const phone = ensureConfiguredPhone();

        if (!phone) {
            return;
        }

        trackPixel(settings.eventName || 'Lead', settings.eventData || {});
        const encodedMessage = encodeURIComponent(message);

        window.setTimeout(() => {
            window.location.href = `https://wa.me/${phone}?text=${encodedMessage}`;
        }, settings.delayMs || 100);
    }

    window.KDCatalog = {
        getConfiguredPhone,
        openWhatsApp,
        persistPhone,
        trackPixel
    };
})();
