(() => {
    const status = document.getElementById("session-status");

    function logOut(expired = false) {
        try {
            sessionStorage.removeItem("eve.token");
        } finally {
            window.location.replace(expired ? "pages/login.html?expired=1" : "pages/login.html");
        }
    }

    document.getElementById("logout-button").addEventListener("click", () => logOut());

    async function verifySession() {
        document.documentElement.setAttribute("data-session-pending", "");
        status.hidden = false;
        status.textContent = "Checking your session...";

        let token;
        try {
            token = sessionStorage.getItem("eve.token");
        } catch {
            window.location.replace("pages/login.html");
            return;
        }
        if (!token) {
            window.location.replace("pages/login.html");
            return;
        }

        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 15000);
        try {
            const response = await fetch(`${window.EVE_CONFIG.apiBaseUrl}/me`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
                signal: controller.signal,
            });
            if (response.status === 401 || response.status === 403) {
                logOut(true);
                return;
            }
            if (!response.ok) throw new Error("Session verification failed.");
            const user = await response.json();
            if (!user || typeof user.username !== "string") {
                throw new Error("Invalid session response.");
            }
            document.getElementById("dashboard-username").textContent = `, ${user.username}`;
            document.documentElement.removeAttribute("data-session-pending");
            status.hidden = true;
        } catch {
            // Keep the token on connection errors so users can retry without logging in again.
            status.textContent = "We couldn't verify your session. Check that the server is running and try again. ";
            const retry = document.createElement("button");
            retry.type = "button";
            retry.className = "session-retry";
            retry.textContent = "Try again";
            retry.addEventListener("click", verifySession);
            status.append(retry);
        } finally {
            window.clearTimeout(timeout);
        }
    }

    // Recheck when a dashboard is restored by the browser's Back button.
    window.addEventListener("pageshow", (event) => {
        if (event.persisted) verifySession();
    });
    verifySession();
})();
