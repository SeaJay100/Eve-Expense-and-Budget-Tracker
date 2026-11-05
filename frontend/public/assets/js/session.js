(() => {
    window.EVE_SESSION = { user: null };
    let status = document.getElementById('session-status');
    if (!status) {
        status = document.createElement('p');
        status.id = 'session-status';
        status.className = 'session-status';
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');
        document.querySelector('header').after(status);
    }
    let logout = document.getElementById('logout-button');
    if (!logout) {
        logout = document.createElement('button');
        logout.id = 'logout-button';
        logout.type = 'button';
        logout.className = 'logout-button';
        logout.textContent = 'Log out';
        document.querySelector('.addtransaction-btn').append(logout);
    }
    logout.addEventListener('click', () => window.EVE_API.logOut());

    async function verifySession() {
        document.documentElement.setAttribute('data-session-pending', '');
        status.hidden = false;
        status.textContent = 'Checking your session...';
        try {
            const user = await window.EVE_API.request('/users/me');
            if (!user || typeof user.username !== 'string') throw new Error('Invalid session response.');
            window.EVE_SESSION.user = user;
            const greeting = document.getElementById('dashboard-username');
            if (greeting) greeting.textContent = `, ${user.username}`;
            document.documentElement.removeAttribute('data-session-pending');
            status.hidden = true;
            window.dispatchEvent(new Event('eve:session-ready'));
        } catch (error) {
            window.EVE_SESSION.user = null;
            status.textContent = `${error.message} `;
            const retry = document.createElement('button');
            retry.type = 'button';
            retry.className = 'session-retry';
            retry.textContent = 'Try again';
            retry.addEventListener('click', verifySession);
            status.append(retry);
        }
    }

    window.addEventListener('pageshow', event => {
        if (event.persisted) verifySession();
    });
    window.addEventListener('pagehide', () => {
        document.documentElement.setAttribute('data-session-pending', '');
    });
    verifySession();
})();
