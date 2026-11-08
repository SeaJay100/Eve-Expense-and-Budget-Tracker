(() => {
    window.EVE_SESSION = { user: null };

    async function verifySession() {
        showStartup();

        try {
            const user = await window.EVE_API.request('/users/me');
            if (!user || typeof user.username !== 'string') {
                throw new Error('Unable to verify your account. Please try again.');
            }

            window.EVE_SESSION.user = user;
            window.dispatchEvent(new Event('eve:session-ready'));
        } catch (error) {
            window.EVE_SESSION.user = null;
            if (sessionStorage.getItem('eve.token')) {
                showLoadError(error.message, verifySession);
            }
        }
    }

    window.addEventListener('pageshow', event => {
        if (event.persisted) verifySession();
    });
    window.addEventListener('pagehide', () => {
        document.documentElement.setAttribute('data-app-loading', '');
    });
    verifySession();
})();
