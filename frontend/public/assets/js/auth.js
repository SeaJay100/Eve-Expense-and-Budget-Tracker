(() => {
    const form = document.querySelector(".auth-form");
    const message = document.getElementById("form-message");
    const isRegister = form.id === "register-form";
    const submitButton = form.querySelector('[type="submit"]');
    const defaultLabel = submitButton.textContent;
    const password = form.elements.password;
    const confirmation = form.elements.confirmPassword;

    function showMessage(text, type = "error") {
        message.textContent = text;
        message.dataset.type = type;
        message.hidden = false;
    }

    if (!isRegister) {
        const params = new URLSearchParams(window.location.search);
        if (params.get("registered") === "1") {
            showMessage("Your account is ready! Log in to open your dashboard.", "success");
        } else if (params.get("expired") === "1") {
            showMessage("Please log in again to continue.", "info");
        }
    }

    document.querySelectorAll("[data-password-toggle]").forEach((button) => {
        const input = document.getElementById(button.dataset.passwordToggle);
        const fieldName = input.id === "confirm-password" ? "confirm password" : "password";
        button.addEventListener("click", () => {
            const show = input.type === "password";
            input.type = show ? "text" : "password";
            button.textContent = show ? "Hide" : "Show";
            button.setAttribute("aria-label", `${show ? "Hide" : "Show"} ${fieldName}`);
            button.setAttribute("aria-pressed", String(show));
        });
    });

    function validatePasswords() {
        if (!isRegister) return;
        password.setCustomValidity(new TextEncoder().encode(password.value).length > 72
            ? "Please use a password that is no more than 72 bytes long."
            : "");
        confirmation.setCustomValidity(confirmation.value !== password.value
            ? "Your passwords do not match."
            : "");
    }

    password.addEventListener("input", validatePasswords);
    confirmation?.addEventListener("input", validatePasswords);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (submitButton.disabled) return;
        validatePasswords();
        const email = form.elements.email;
        email.value = email.value.trim();
        if (isRegister) {
            const name = form.elements.name;
            const username = form.elements.username;
            name.value = name.value.trim();
            username.value = username.value.trim();
        }
        if (!form.reportValidity()) return;

        message.hidden = true;
        submitButton.disabled = true;
        submitButton.textContent = isRegister ? "Creating account..." : "Logging in...";
        form.setAttribute("aria-busy", "true");

        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 15000);

        try {
            const payload = { email: email.value, password: password.value };
            if (isRegister) {
                payload.name = form.elements.name.value;
                payload.username = form.elements.username.value;
            }
            const response = await fetch(`${window.EVE_CONFIG.apiBaseUrl}/${isRegister ? "register" : "login"}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });
            const data = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(data?.message || "We couldn't complete your request. Please try again.");
            }
            if (!data || typeof data !== "object" || Array.isArray(data)) {
                throw new Error("The server returned an unexpected response. Please try again.");
            }

            if (isRegister) {
                window.location.assign("login.html?registered=1");
            } else {
                if (typeof data?.token !== "string" || !data.token) {
                    throw new Error("The server did not return a login token. Please try again.");
                }
                try {
                    sessionStorage.setItem("eve.token", data.token);
                } catch {
                    throw new Error("Please enable browser storage to stay logged in, then try again.");
                }
                window.location.assign("../index.html");
            }
        } catch (error) {
            showMessage(error.name === "AbortError"
                ? "The server took too long to respond. Please try again."
                : error instanceof TypeError
                    ? "Unable to reach the server. Please check your connection and try again."
                    : error.message);
        } finally {
            window.clearTimeout(timeout);
            submitButton.disabled = false;
            submitButton.textContent = defaultLabel;
            form.removeAttribute("aria-busy");
        }
    });
})();
