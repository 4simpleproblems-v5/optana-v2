/**
 * navigation-mini.js - Optana V2
 * Adapted from 4SP Max for Optana V2.
 */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDfIuq2y083etdlmz_Wqe3i6ArwSEUizGE",
  authDomain: "optana-v2.firebaseapp.com",
  projectId: "optana-v2",
  storageBucket: "optana-v2.firebasestorage.app",
  messagingSenderId: "834077597335",
  appId: "1:834077597335:web:997fc7dda09bd857a113d2",
  measurementId: "G-ZSWRN6E7S7"
};

const DEFAULT_THEME = {
    'name': 'Dark',
    'logo-src': '/images/logo.png', 
    'navbar-bg': '#040404',
    'navbar-border': 'rgba(255, 255, 255, 0.08)',
    'avatar-gradient': 'linear-gradient(135deg, #FF8C42 0%, #f59e0b 100%)',
    'avatar-border': '#252525',
    'menu-bg': '#111111',
    'menu-border': '#252525',
    'menu-divider': '#252525',
    'menu-text': '#c0c0c0',
    'menu-username-text': '#ffffff', 
    'menu-email-text': '#808080', 
    'menu-item-hover-bg': '#252525', 
    'menu-item-hover-text': '#ffffff',
    'glass-menu-bg': 'rgba(17, 17, 17, 0.8)',
    'glass-menu-border': 'rgba(37, 37, 37, 0.8)',
    'logged-out-icon-bg': '#111111',
    'logged-out-icon-border': '#252525',
    'logged-out-icon-color': '#c0c0c0',
    'tab-hover-bg': 'rgba(255, 140, 66, 0.05)',
    'tab-active-border': '#FF8C42',
};

window.applyTheme = (theme) => {
    const root = document.documentElement;
    if (!root) return;
    for (const [key, value] of Object.entries(DEFAULT_THEME)) {
        if (key !== 'logo-src' && key !== 'name') {
            root.style.setProperty(`--${key}`, value);
        }
    }
};

let auth;
let db;

(function() {
    const loadScript = (src) => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.type = 'text/javascript';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    };

    const loadCSS = (href) => {
        return new Promise((resolve) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = resolve;
            document.head.appendChild(link);
        });
    };

    const run = async () => {
        if (!document.getElementById('navbar-container')) {
            const navbarDiv = document.createElement('div');
            navbarDiv.id = 'navbar-container';
            document.body.prepend(navbarDiv);
        }
        
        injectStyles();
        window.applyTheme(DEFAULT_THEME);

        const container = document.getElementById('navbar-container');
        container.innerHTML = `
            <a href="/" class="flex items-center space-x-2 flex-shrink-0 overflow-hidden relative" style="z-index: 20;">
                <span class="text-2xl font-bold" style="background-image: linear-gradient(90deg, #FF8C42, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Optana V2</span>
            </a>
            <div id="auth-controls-wrapper" class="auth-controls-wrapper" style="z-index: 20;">
                <div class="auth-toggle-placeholder"></div>
            </div>
        `;

        await loadCSS("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css");
        
        try {
            await loadScript("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
            await loadScript("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js");
            await loadScript("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js");
            
            const app = firebase.initializeApp(FIREBASE_CONFIG);
            auth = firebase.auth();
            db = firebase.firestore();

            auth.onAuthStateChanged(async (user) => {
                const wrapper = document.getElementById('auth-controls-wrapper');
                if (!wrapper) return;

                if (user) {
                    const username = user.displayName || user.email.split('@')[0];
                    const initial = username.charAt(0).toUpperCase();
                    const avatarHtml = user.photoURL 
                        ? `<img src="${user.photoURL}" class="w-full h-full object-cover" style="border-radius: 12px;">`
                        : `<div class="w-full h-full flex items-center justify-center bg-optana-orange text-white font-bold" style="border-radius: 12px; background: var(--avatar-gradient);">${initial}</div>`;

                    wrapper.innerHTML = `
                        <div class="relative flex items-center">
                            <button id="auth-toggle" class="w-10 h-10 border border-custom-medium-gray overflow-hidden" style="border-radius: 14px;">
                                ${avatarHtml}
                            </button>
                            <div id="auth-menu-container" class="auth-menu-container closed">
                                <div class="border-b border-custom-medium-gray mb-2 pb-2">
                                    <p class="text-sm font-semibold text-white">${username}</p>
                                    <p class="text-xs text-custom-light-gray truncate">${user.email}</p>
                                </div>
                                <a href="/logged-in/dashboard.html" class="auth-menu-link">
                                    <i class="fas fa-columns w-4"></i> Dashboard
                                </a>
                                <a href="/logged-in/settings.html" class="auth-menu-link">
                                    <i class="fas fa-gear w-4"></i> Settings
                                </a>
                                <button id="logout-button" class="auth-menu-button text-red-500 hover:bg-red-500/10">
                                    <i class="fas fa-right-from-bracket w-4"></i> Log Out
                                </button>
                            </div>
                        </div>
                    `;

                    document.getElementById('logout-button').onclick = () => auth.signOut();
                } else {
                    wrapper.innerHTML = `
                        <div class="relative flex items-center">
                            <button id="auth-toggle" class="w-10 h-10 border border-custom-medium-gray flex items-center justify-center bg-custom-dark-gray text-custom-white-gray" style="border-radius: 14px;">
                                <i class="fas fa-user"></i>
                            </button>
                            <div id="auth-menu-container" class="auth-menu-container closed">
                                <a href="/connection.html" class="auth-menu-link">
                                    <i class="fas fa-lock w-4"></i> Authenticate
                                </a>
                            </div>
                        </div>
                    `;
                }

                const toggle = document.getElementById('auth-toggle');
                const menu = document.getElementById('auth-menu-container');
                if (toggle && menu) {
                    toggle.onclick = (e) => {
                        e.stopPropagation();
                        menu.classList.toggle('closed');
                        menu.classList.toggle('open');
                    };
                }
            });

            document.addEventListener('click', () => {
                const menu = document.getElementById('auth-menu-container');
                if (menu) {
                    menu.classList.add('closed');
                    menu.classList.remove('open');
                }
            });

        } catch (error) {
            console.error(error);
        }
    };

    const injectStyles = () => {
        const style = document.createElement('style');
        style.textContent = `
            body { padding-top: 64px !important; }
            #navbar-container {
                position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important;
                z-index: 9999 !important; background: var(--navbar-bg) !important;
                backdrop-filter: blur(12px) !important; -webkit-backdrop-filter: blur(12px) !important;
                border-bottom: 1px solid var(--navbar-border) !important;
                height: 64px !important; display: flex !important; align-items: center !important;
                justify-content: space-between !important; padding: 0 1.5rem !important;
            }
            .auth-menu-container {
                position: absolute; right: 0; top: 55px; width: 14rem;
                background: var(--menu-bg); border: 1px solid var(--menu-border);
                border-radius: 1.25rem; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.25rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.6); z-index: 10000;
                transition: opacity 0.2s, transform 0.2s;
            }
            .auth-menu-container.closed { opacity: 0; pointer-events: none; transform: translateY(-10px); }
            .auth-menu-container.open { opacity: 1; pointer-events: auto; transform: translateY(0); }
            .auth-menu-link, .auth-menu-button {
                display: flex; align-items: center; gap: 0.75rem; width: 100%;
                padding: 0.75rem 1rem; font-size: 0.875rem; color: var(--menu-text);
                border-radius: 0.75rem; transition: all 0.2s; text-align: left;
            }
            .auth-menu-link:hover, .auth-menu-button:hover {
                background: var(--menu-item-hover-bg); color: var(--menu-item-hover-text);
            }
        `;
        document.head.appendChild(style);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
})();
