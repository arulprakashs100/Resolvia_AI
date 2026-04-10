
function checkPasswordStrength(password) {
    const bar = document.getElementById("strengthBar");
    if (!bar) return;

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    bar.className = "password-strength-bar";
    if (strength <= 1) bar.classList.add("pass-weak");
    else if (strength === 2 || strength === 3) bar.classList.add("pass-medium");
    else bar.classList.add("pass-strong");
}


async function handleLogin(event) {
    event.preventDefault();

    const email    = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showToast(data.message || "Invalid credentials", "error");
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("role",  data.role);

        if (data.role === "ADMIN") {
            window.location.href = "admin-dashboard.html";
        } else {
            window.location.href = "dashboard.html";
        }

    } catch (error) {
        console.error(error);
        showToast("Server connection error. Is the backend running?", "error");
    }
}

const ADMIN_PASSKEY = "RESOLVIA@ADMIN2026";

async function handleRegister(event) {
    event.preventDefault();

    const name     = document.getElementById("fullName").value.trim();
    const email    = document.getElementById("email").value.trim();
    const password = document.getElementById("regPassword").value;
    const confirm  = document.getElementById("regConfirmPassword").value;
    const role     = document.getElementById("role").value;

    const emailLower = email.toLowerCase();
    const allowedDomains = ["gmail.com", "admin.com"];
    const emailDomain = emailLower.split("@")[1] || "";

    if (!allowedDomains.includes(emailDomain)) {
        showToast(
            "Only @gmail.com (User) or @admin.com (Admin) email addresses are allowed.",
            "error"
        );
        return false;
    }

    if (role === "user" && emailDomain !== "gmail.com") {
        showToast("User accounts must use a @gmail.com email address.", "error");
        return false;
    }
    if (role === "admin" && emailDomain !== "admin.com") {
        showToast("Admin accounts must use a @admin.com email address.", "error");
        return false;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
    if (!passwordRegex.test(password)) {
        showToast("Password must be at least 8 characters with letters, numbers & symbols.", "warning");
        return false;
    }

    if (password !== confirm) {
        document.getElementById("regMatchError").style.display = "block";
        return false;
    }

    if (role.toUpperCase() === "ADMIN") {
        if (!email.endsWith("@admin.com")) {
            showToast("Only @admin.com email IDs can register as ADMIN.", "error");
            return false;
        }
        const enteredPasskey = document.getElementById("adminPasskey").value;
        if (!enteredPasskey) {
            showToast("Admin passkey is required to register as Admin.", "warning");
            return false;
        }
        if (enteredPasskey !== ADMIN_PASSKEY) {
            showToast("Invalid admin passkey. Please contact your system administrator.", "error");
            return false;
        }
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                email,
                password,
                role: role.toUpperCase()
            })
        });

        const data = await response.json();

        if (!response.ok) {
            const msg = data.message || "Registration failed";
            if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("email")) {
                showToast("This email is already registered. Please use a different email or login instead.", "error");
            } else {
                showToast(msg, "error");
            }
            return false;
        }

        showToast("Registration successful! Please login.", "success");
        setTimeout(() => window.location.href = "login.html", 1500);

    } catch (error) {
        showToast("Server error. Please try again.", "error");
    }

    return false;
}


async function handleForgotPassword(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        if (!response.ok) {
            showToast("Email not registered", "error");
            return;
        }

        showToast("Email verified! Redirecting...", "success");
        setTimeout(() => {
            window.location.href = "reset-password.html?email=" + encodeURIComponent(email);
        }, 1200);

    } catch (error) {
        showToast("Server error. Please try again.", "error");
    }
}


async function handleResetPassword(event) {
    event.preventDefault();

    const password = document.getElementById("newPassword").value;
    const confirm  = document.getElementById("confirmPassword").value;
    const params   = new URLSearchParams(window.location.search);
    const email    = params.get("email");

    if (!email) {
        showToast("Invalid reset link. Please try forgot password again.", "error");
        return false;
    }

    if (password !== confirm) {
        document.getElementById("matchError").style.display = "block";
        return false;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, newPassword: password })
        });

        if (!response.ok) {
            showToast("Password reset failed. Please try again.", "error");
            return false;
        }

        showToast("Password updated successfully!", "success");
        setTimeout(() => window.location.href = "login.html", 1500);

    } catch (error) {
        showToast("Server error. Please try again.", "error");
    }

    return false;
}