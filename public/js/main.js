// Shared utility functions for the frontend

var API_BASE = '';

function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    var user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function requireAuth(allowedRoles) {
    var token = getToken();
    var user = getUser();

    if (!token || !user) {
        window.location.href = '/index.html';
        return;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
            window.location.href = '/dashboard.html';
            return;
        }
    }
}

async function apiRequest(url, method, body) {
    var options = {
        method: method || 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getToken()
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    var response = await fetch(API_BASE + url, options);
    var data = await response.json();

    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/index.html';
            return;
        }
        throw new Error(data.message || 'Etwas ist schiefgelaufen');
    }

    return data;
}

function showAlert(message, type) {
    var alertBox = document.getElementById('alert-box');
    if (!alertBox) return;

    alertBox.innerHTML = '<div class="alert alert-' + type + '">' + message + '</div>';

    setTimeout(function() {
        alertBox.innerHTML = '';
    }, 4000);
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    var date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
}

// German role names
function getRoleName(role, lang) {
    if (!lang) lang = localStorage.getItem('lang') || 'de';
    if (lang === 'en') {
        if (role === 'admin') return 'Administrator';
        if (role === 'staff') return 'Staff';
        if (role === 'customer') return 'Customer';
    } else {
        if (role === 'admin') return 'Administrator';
        if (role === 'staff') return 'Mitarbeiter';
        if (role === 'customer') return 'Kunde';
    }
    return role;
}

function getSidebarLabels() {
    var lang = localStorage.getItem('lang') || 'de';
    if (lang === 'en') {
        return { dash: 'Dashboard', rooms: 'Rooms', bookings: 'Bookings', customers: 'Customers', staff: 'Staff', logout: 'Logout' };
    }
    return { dash: 'Dashboard', rooms: 'Zimmer', bookings: 'Buchungen', customers: 'Kunden', staff: 'Personal', logout: 'Abmelden' };
}

function loadSidebar(activePage) {
    var user = getUser();
    if (!user) return;

    var sidebar = document.getElementById('sidebar');
    var lb = getSidebarLabels();
    var navItems = '';

    navItems += '<li><a href="/dashboard.html" class="' + (activePage === 'dashboard' ? 'active' : '') + '"><span>' + lb.dash + '</span></a></li>';
    navItems += '<li><a href="/rooms.html" class="' + (activePage === 'rooms' ? 'active' : '') + '"><span>' + lb.rooms + '</span></a></li>';
    navItems += '<li><a href="/bookings.html" class="' + (activePage === 'bookings' ? 'active' : '') + '"><span>' + lb.bookings + '</span></a></li>';

    if (user.role === 'admin' || user.role === 'staff') {
        navItems += '<li><a href="/customers.html" class="' + (activePage === 'customers' ? 'active' : '') + '"><span>' + lb.customers + '</span></a></li>';
    }

    if (user.role === 'admin') {
        navItems += '<li><a href="/staff.html" class="' + (activePage === 'staff' ? 'active' : '') + '"><span>' + lb.staff + '</span></a></li>';
    }

    sidebar.innerHTML =
        '<div class="sidebar-header">' +
            '<h2>Zayd Hotel</h2>' +
            '<small>' + getRoleName(user.role) + '</small>' +
        '</div>' +
        '<ul class="sidebar-nav">' + navItems + '</ul>' +
        '<button class="logout-btn" onclick="logout()">' + lb.logout + '</button>';
}

// Init lang button on page load (called automatically below)
function initLangButton() {
    var lang = localStorage.getItem('lang') || 'de';
    document.documentElement.lang = lang;
    var btn = document.querySelector('.lang-switcher');
    if (btn && !btn.id) {
        btn.textContent = lang === 'de' ? 'EN' : 'DE';
    }
}

// Shared language toggle used by all inner pages (rooms, bookings, customers, staff)
function toggleLang() {
    var current = localStorage.getItem('lang') || 'de';
    var next = current === 'de' ? 'en' : 'de';
    localStorage.setItem('lang', next);
    document.documentElement.lang = next;

    // Update the button text on pages that don't have their own toggleLang
    var btn = document.querySelector('.lang-switcher');
    if (btn) btn.textContent = next === 'de' ? 'EN' : 'DE';

    // Re-render sidebar with new language
    var activePage = document.querySelector('.sidebar-nav a.active');
    var pageId = activePage ? activePage.getAttribute('href').replace('/','').replace('.html','') : 'dashboard';
    loadSidebar(pageId);
}

document.addEventListener('DOMContentLoaded', initLangButton);
