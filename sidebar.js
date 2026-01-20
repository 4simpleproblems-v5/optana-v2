// sidebar.js - Optana V2 Sidebar Injection
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth, db } from "./firebase-init.js";

const sidebarHTML = `
<aside id="optana-sidebar" class="fixed left-0 top-0 h-full w-64 bg-custom-dark-gray border-r border-custom-medium-gray flex flex-col z-50 transition-transform duration-300">
    <div class="p-6 border-b border-custom-medium-gray">
        <h1 class="text-2xl font-bold gradient-text">Optana V2</h1>
    </div>
    
    <div class="p-4 flex items-center space-x-3 border-b border-custom-medium-gray">
        <div id="sidebar-avatar" class="w-10 h-10 rounded-full bg-optana-orange flex items-center justify-center text-white overflow-hidden">
            <i class="fas fa-user"></i>
        </div>
        <div class="overflow-hidden">
            <p id="sidebar-username" class="text-sm font-medium text-white truncate">Loading...</p>
            <p id="sidebar-email" class="text-xs text-custom-light-gray truncate">...</p>
        </div>
    </div>

    <nav class="flex-grow p-4 space-y-2 overflow-y-auto">
        <a href="dashboard.html" class="nav-item flex items-center space-x-3 p-3 rounded-xl hover:bg-custom-medium-gray transition text-custom-light-gray hover:text-white">
            <i class="fas fa-columns w-5"></i>
            <span>Dashboard</span>
        </a>
        <a href="wishlists.html" class="nav-item flex items-center space-x-3 p-3 rounded-xl hover:bg-custom-medium-gray transition text-custom-light-gray hover:text-white">
            <i class="fas fa-gift w-5"></i>
            <span>Wishlists</span>
        </a>
        <a href="groups.html" class="nav-item flex items-center space-x-3 p-3 rounded-xl hover:bg-custom-medium-gray transition text-custom-light-gray hover:text-white">
            <i class="fas fa-users w-5"></i>
            <span>Groups</span>
        </a>
        <a href="favorites.html" class="nav-item flex items-center space-x-3 p-3 rounded-xl hover:bg-custom-medium-gray transition text-custom-light-gray hover:text-white">
            <i class="fas fa-heart w-5"></i>
            <span>Favorites</span>
        </a>
        <div class="pt-4 border-t border-custom-medium-gray">
            <a href="settings.html" class="nav-item flex items-center space-x-3 p-3 rounded-xl hover:bg-custom-medium-gray transition text-custom-light-gray hover:text-white">
                <i class="fas fa-cog w-5"></i>
                <span>Settings</span>
            </a>
        </div>
    </nav>

    <div class="p-4 border-t border-custom-medium-gray">
        <button id="sidebar-logout" class="w-full p-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition flex items-center justify-center space-x-2">
            <i class="fas fa-sign-out-alt"></i>
            <span>Sign Out</span>
        </button>
    </div>
</aside>

<button id="sidebar-toggle" class="fixed bottom-4 left-4 z-[60] w-12 h-12 bg-custom-dark-gray border border-custom-medium-gray rounded-full shadow-2xl flex items-center justify-center md:hidden">
    <i class="fas fa-bars text-white"></i>
</button>

<style>
    .nav-item.active {
        background-color: rgba(255, 140, 66, 0.1);
        color: #FF8C42;
        border: 1px solid rgba(255, 140, 66, 0.2);
    }
    @media (max-width: 768px) {
        #optana-sidebar { transform: translateX(-100%); }
        #optana-sidebar.open { transform: translateX(0); }
        .main-content { margin-left: 0 !important; }
    }
</style>
`;

function injectSidebar() {
    const container = document.createElement('div');
    container.innerHTML = sidebarHTML;
    document.body.appendChild(container);

    const toggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('optana-sidebar');
    if (toggle && sidebar) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    const logoutBtn = document.getElementById('sidebar-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await signOut(auth);
            window.location.href = '../index.html';
        });
    }

    // Set active class based on current page
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-item').forEach(item => {
        if (currentPath.includes(item.getAttribute('href'))) {
            item.classList.add('active');
        }
    });

    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = '../index.html';
            return;
        }

        const usernameEl = document.getElementById('sidebar-username');
        const emailEl = document.getElementById('sidebar-email');
        const avatarEl = document.getElementById('sidebar-avatar');

        if (usernameEl) usernameEl.textContent = user.displayName || user.email.split('@')[0];
        if (emailEl) emailEl.textContent = user.email;
        if (avatarEl && user.photoURL) {
            avatarEl.innerHTML = `<img src="${user.photoURL}" class="w-full h-full object-cover">`;
        }

        // Real-time update from Firestore if needed
        onSnapshot(doc(db, "users", user.uid), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                if (usernameEl) usernameEl.textContent = data.displayName || user.displayName || user.email.split('@')[0];
                if (avatarEl && data.photoURL) {
                    avatarEl.innerHTML = `<img src="${data.photoURL}" class="w-full h-full object-cover">`;
                }
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', injectSidebar);
