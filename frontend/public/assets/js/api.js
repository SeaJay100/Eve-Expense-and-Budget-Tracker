(() => {
    const loginUrl = new URL('../../pages/login.html', document.currentScript.src);
    const apiRoot = window.EVE_CONFIG.apiBaseUrl.replace(/\/users\/?$/, '');

    function logOut(expired = false) {
        sessionStorage.removeItem('eve.token');
        const target = new URL(loginUrl);
        if (expired) target.searchParams.set('expired', '1');
        window.location.replace(target.href);
    }

    async function request(path, { method = 'GET', body } = {}) {
        const token = sessionStorage.getItem('eve.token');
        if (!token) {
            logOut();
            throw new Error('Please log in to continue.');
        }
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 15000);
        try {
            const response = await fetch(`${apiRoot}${path}`, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
                },
                ...(body === undefined ? {} : { body: JSON.stringify(body) }),
                cache: 'no-store',
                signal: controller.signal,
            });
            const data = await response.json().catch(() => null);
            if (response.status === 401) logOut(true);
            if (!data?.message && [404, 405].includes(response.status) &&
                method === 'DELETE' && path.startsWith('/categories/')) {
                throw new Error('Category deletion is unavailable on this server. Update the Eve backend and try again.');
            }
            if (!response.ok) throw new Error(data?.message || 'Unable to complete your request.');
            return data;
        } catch (error) {
            if (error.name === 'AbortError') throw new Error('The server took too long to respond. Please try again.');
            if (error instanceof TypeError) throw new Error('Unable to reach the server. Please try again.');
            throw error;
        } finally {
            window.clearTimeout(timeout);
        }
    }

    window.EVE_API = { request, logOut };
})();
