// Live Server on port 5502 uses the separate local Express server.
window.EVE_CONFIG = {
    apiBaseUrl: window.location.port === '5502' ? 'http://localhost:8000/api/users' : '/api/users',
};
