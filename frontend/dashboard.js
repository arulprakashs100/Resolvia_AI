// ======================================================
// dashboard.js — ResolviaAI User Dashboard
// ======================================================

requireAuth();

// ===========================
// INJECT USER SIDEBAR
// ===========================
function injectSidebar(activePage) {
    const existing = document.getElementById("userSidebar");
    if (existing) return;

    const isActive = (page) => activePage === page ? "active" : "";

    const sidebar = document.createElement("aside");
    sidebar.id = "userSidebar";
    sidebar.className = "user-sidebar";
    sidebar.innerHTML = `
        <a href="dashboard.html" class="user-sidebar-header">
            Resolvia<span>AI</span>
        </a>
        <ul class="user-sidebar-menu">
            <li>
                <a href="dashboard.html" class="${isActive('dashboard')}">
                    <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                    Dashboard
                </a>
            </li>
            <li>
                <a href="create-ticket.html" class="${isActive('create')}">
                    <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                    Create Ticket
                </a>
            </li>
            <li class="sidebar-divider"></li>
            <li>
                <a href="profile.html" class="${isActive('profile')}">
                    <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    My Profile
                </a>
            </li>
            <li>
                <a href="settings.html" class="${isActive('settings')}">
                    <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                    Settings
                </a>
            </li>
        </ul>
    `;

    document.body.insertBefore(sidebar, document.body.firstChild);
}

// ===========================
// LOAD USER PROFILE
// ===========================
async function loadUserProfile() {
    try {
        const res  = await fetch(`${API_BASE_URL}/user/profile`, { headers: getAuthHeaders() });
        if (!res.ok) { handleLogout(); return; }
        const user = await res.json();

        const set = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
        set("userNameText",  user.name);
        set("userEmailText", user.email);

        if (user.id) localStorage.setItem("currentUserId", user.id);

        const av = document.getElementById("userAvatar");
        if (av) av.innerText = user.name.charAt(0).toUpperCase();

        const hour     = new Date().getHours();
        const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
        set("greetingText", greeting + ", " + user.name + "!");

    } catch (e) { console.error("Profile error:", e); }
}

// ===========================
// SUBMIT TICKET
// ===========================
async function handleTicketSubmit(event) {
    event.preventDefault();
    const title       = document.getElementById("ticketTitle").value.trim();
    const description = document.getElementById("ticketDescription").value.trim();
    const category    = document.getElementById("ticketCategory").value;

    if (!title || !description || !category) {
        showToast("Please fill in all fields", "warning");
        return false;
    }

    const btn = document.getElementById("submitBtn");
    if (btn) { btn.disabled = true; btn.textContent = "Submitting..."; }

    try {
        const res = await fetch(`${API_BASE_URL}/tickets`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ title, description, category })
        });

        if (!res.ok) {
            const data = await res.json();
            showToast(data.message || "Failed to create ticket", "error");
            if (btn) { btn.disabled = false; btn.textContent = "Submit Ticket"; }
            return false;
        }
        window.location.href = "ticket-success.html";

    } catch (e) {
        showToast("Server error. Please try again.", "error");
        if (btn) { btn.disabled = false; btn.textContent = "Submit Ticket"; }
    }
    return false;
}

// ===========================
// LOAD USER TICKETS
// ===========================
async function loadUserTickets() {
    showSpinner("ticketTableBody", 5);
    try {
        const res = await fetch(`${API_BASE_URL}/tickets/my`, { headers: getAuthHeaders() });
        if (!res.ok) return;
        const tickets       = await res.json();
        window._userTickets = tickets;
        renderCounts(tickets);
        renderTable(tickets);

        const open = tickets.filter(t => t.status !== "RESOLVED").length;
        const el   = document.getElementById("greetingSubText");
        if (el) {
            el.innerText = tickets.length === 0
                ? "No tickets yet. Create your first ticket!"
                : open > 0
                    ? `You have ${open} open ticket${open > 1 ? "s" : ""} awaiting resolution.`
                    : "All your tickets are resolved. Great!";
        }
    } catch (e) { console.error("Tickets error:", e); }
}

// ===========================
// FILTER TICKETS
// ===========================
function filterTickets(type, card) {
    document.querySelectorAll(".summary-card").forEach(c => c.classList.remove("active"));
    if (card) card.classList.add("active");
    const tickets = window._userTickets || [];
    let filtered  = tickets;
    const titleEl = document.getElementById("table-title");
    if (type === "Inprocess") {
        filtered = tickets.filter(t => t.status !== "RESOLVED");
        if (titleEl) titleEl.innerText = "Open Tickets";
    } else if (type === "Approve") {
        filtered = tickets.filter(t => t.status === "RESOLVED");
        if (titleEl) titleEl.innerText = "Resolved Tickets";
    } else {
        if (titleEl) titleEl.innerText = "All Tickets";
    }
    renderTable(filtered);
}

// ===========================
// COUNTS
// ===========================
function renderCounts(tickets) {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
    set("count-all",      tickets.length);
    set("count-open",     tickets.filter(t => t.status !== "RESOLVED").length);
    set("count-resolved", tickets.filter(t => t.status === "RESOLVED").length);
}

// ===========================
// RENDER TABLE — 5 columns (no Resolved By)
// ===========================
function renderTable(tickets) {
    const tbody = document.getElementById("ticketTableBody");
    if (!tbody) return;
    if (tickets.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2.5rem;color:var(--text-muted);">No tickets found.</td></tr>`;
        return;
    }
    tbody.innerHTML = "";
    tickets.forEach(ticket => {
        const tr = document.createElement("tr");

        // All non-resolved tickets show as "In Progress"
        const isResolved   = ticket.status === "RESOLVED";
        const statusClass  = isResolved ? "badge-approve"   : "badge-inprocess";
        const statusText   = isResolved ? "Resolved"        : "In Progress";

        const pMap = {
            HIGH:   { bg:"#fee2e2", color:"#991b1b", border:"#fecaca" },
            MEDIUM: { bg:"#fef3c7", color:"#92400e", border:"#fde68a" },
            LOW:    { bg:"#f0fdf4", color:"#166534", border:"#bbf7d0" }
        };
        const p = ticket.priority ? pMap[ticket.priority] : null;
        const priorityBadge = p
            ? `<span style="background:${p.bg};color:${p.color};border:1px solid ${p.border};padding:3px 10px;border-radius:99px;font-size:0.75rem;font-weight:600;">${ticket.priority.charAt(0) + ticket.priority.slice(1).toLowerCase()}</span>`
            : `<span style="color:#9ca3af;">—</span>`;

        tr.innerHTML = `
            <td>${ticket.ticketNumber || "#" + ticket.id}</td>
            <td>${ticket.title}</td>
            <td>${formatDate(ticket.createdAt)}</td>
            <td>${ticket.category || "General"}</td>
            <td>${priorityBadge}</td>
            <td><span class="badge ${statusClass} clickable-badge" onclick="viewTicket(${ticket.id})">${statusText}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

// ===========================
// VIEW TICKET — always ticket-info.html
// ===========================
function viewTicket(id) {
    localStorage.setItem("currentViewTicketId", id);
    window.location.href = "ticket-info.html";
}

// ===========================
// STATUS TIMELINE (3 steps, no AI step)
// ===========================
function renderStatusTimeline(ticket) {
    const container = document.getElementById("statusTimeline");
    if (!container) return;

    const isResolved   = ticket.status === "RESOLVED";
    const isInProgress = ticket.status === "IN_PROGRESS";

    const steps = [
        { label: "Submitted",    done: true                       },
        { label: "Under Review", done: isInProgress || isResolved },
        { label: "Resolved",     done: isResolved                 }
    ];

    container.innerHTML = `
        <div style="display:flex;align-items:center;margin-bottom:2rem;">
            ${steps.map((step, i) => `
                <div style="display:flex;align-items:center;flex:1;">
                    <div style="display:flex;flex-direction:column;align-items:center;min-width:80px;">
                        <div style="width:34px;height:34px;border-radius:50%;
                            background:${step.done ? "#4f46e5" : "#e5e7eb"};
                            color:${step.done ? "#fff" : "#9ca3af"};
                            display:flex;align-items:center;justify-content:center;
                            font-weight:700;font-size:0.85rem;
                            border:2px solid ${step.done ? "#4f46e5" : "#d1d5db"};">
                            ${step.done ? "✓" : (i + 1)}
                        </div>
                        <div style="font-size:0.75rem;font-weight:${step.done ? "600" : "400"};
                            color:${step.done ? "#4f46e5" : "#9ca3af"};margin-top:6px;
                            text-align:center;white-space:nowrap;">${step.label}</div>
                    </div>
                    ${i < steps.length - 1
                        ? `<div style="flex:1;height:2px;background:${steps[i + 1].done ? "#4f46e5" : "#e5e7eb"};margin-bottom:18px;"></div>`
                        : ""}
                </div>
            `).join("")}
        </div>
    `;
}

// ===========================
// LOAD TICKET DETAILS
// ===========================
async function loadTicketDetails() {
    const id = localStorage.getItem("currentViewTicketId");
    if (!id) return;
    try {
        const res = await fetch(`${API_BASE_URL}/tickets/${id}`, { headers: getAuthHeaders() });
        if (!res.ok) return;
        const ticket = await res.json();

        const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.innerText = val || ""; };
        set("view-ticket-id",       ticket.ticketNumber || "#" + ticket.id);
        set("view-ticket-title",    ticket.title);
        set("view-ticket-desc",     ticket.description);
        set("view-ticket-category", ticket.category || "General");
        set("view-ticket-date",     formatDate(ticket.createdAt));

        renderStatusTimeline(ticket);

    } catch (e) { console.error("Ticket detail error:", e); }
}

// ===========================
// PAGE INIT
// ===========================
document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;

    if (path.includes("dashboard.html")) {
        injectSidebar("dashboard");
        loadUserProfile();
        loadUserTickets();
    } else if (path.includes("create-ticket.html")) {
        injectSidebar("create");
        loadUserProfile();
    } else if (path.includes("ticket-info.html")) {
        injectSidebar("dashboard");
        loadUserProfile();
        loadTicketDetails();
    } else if (path.includes("ticket-success.html")) {
        injectSidebar("dashboard");
        loadUserProfile();
    } else if (path.includes("profile.html")) {
        injectSidebar("profile");
    } else if (path.includes("settings.html")) {
        injectSidebar("settings");
        loadUserProfile();
    }
});

// Auto-refresh ticket details every 5 seconds on ticket-info page
setInterval(() => {
    if (window.location.pathname.includes("ticket-info.html")) loadTicketDetails();
}, 5000);