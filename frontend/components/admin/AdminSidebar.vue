<template>
    <aside class="sidebar" :class="{ 'sidebar-open': isSidebarOpen, 'sidebar-collapsed': !isSidebarOpen }">
        <div class="first-row">
            <div class="logo" v-if="isSidebarOpen">
                <img src="../../public/assets/IsuzuLogo.png" alt="Isuzu Logo" />
            </div>
            <div class="hamburger" @click="toggleSidebar">
                ☰
            </div>
        </div>
        <nav class="link">
            <NuxtLink to="/controller/dashboard" :class="{ 'active': $route.path === '/controller/dashboard' }">
                <span v-if="isSidebarOpen">Dashboard</span>
                <i v-else class="icon-dashboard">D</i>
            </NuxtLink>
            <NuxtLink to="/controller/staff" :class="{ 'active': $route.path === '/controller/staff' }">
                <span v-if="isSidebarOpen">Staff</span>
                <i v-else class="icon-staff">S</i>
            </NuxtLink>
            <NuxtLink to="/controller/customer" :class="{ 'active': $route.path === '/controller/customer' }">
                <span v-if="isSidebarOpen">Customer</span>
                <i v-else class="icon-customer">C</i>
            </NuxtLink>
            <NuxtLink to="/controller/history" :class="{ 'active': $route.path === '/controller/history' }">
                <span v-if="isSidebarOpen">History</span>
                <i v-else class="icon-history">H</i>
            </NuxtLink>
        </nav>
        <button class="logout" @click="Logout">
            <span v-if="isSidebarOpen">Log Out</span>
            <i v-else class="icon-logout">L</i>
        </button>
    </aside>
    <slot></slot>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const isSidebarOpen = ref(false);
const router = useRouter();

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
};

const Logout = () => {
    localStorage.removeItem('access_token')
    router.push('/controller/login')
}
</script>

<style scoped>
.sidebar {
    width: 300px;
    min-width: 300px;
    height: 100vh;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    top: 0;
    background: white;
    transition: width 0.3s ease;
    z-index: 100;
}


.sidebar-open + .content {
    margin-left: 300px; 
}


.sidebar-collapsed + .content {
    margin-left: 80px;
}

.sidebar-collapsed {
    width: 80px;
    min-width: 80px;
}

.logo img {
    max-width: 150px;
    margin: 20px 0;
    transition: max-width 0.3s ease;
}

.hamburger {
    cursor: pointer;
    font-size: 2rem;
    padding: 10px;
    text-align: center;
}

.first-row {
    display: flex;
    align-items: center;
    padding: 20px;
    justify-content: space-between;
}

nav {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    padding: 10px;
}

nav a {
    padding: 12px 10px;
    text-decoration: none;
    color: #000;
    font-size: 1rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: background-color 0.3s ease, padding 0.3s ease;
}

nav a i {
    font-size: 1.5rem;
    transition: font-size 0.3s ease;
}

nav a.active {
    background-color: #f0f0f0;
    border-left: 4px solid #d32f2f;
}

nav a:hover {
    background-color: #e8e8e8;
}

.logout {
    margin-top: auto;
    width: 90%;
    padding: 12px 15px;
    background-color: #d32f2f;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 5px;
    text-decoration: none;
    font-size: 1rem;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-left: auto;
    margin-right: auto;
}

.sidebar-collapsed nav a {
    justify-content: center;
}

.sidebar-collapsed nav a span {
    display: none;
}

.sidebar-collapsed nav a i {
    font-size: 1.5rem;
}
</style>
