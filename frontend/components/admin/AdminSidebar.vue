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
            <NuxtLink to="/controller/dashboard" :class="{ 'active': $route.path.startsWith('/controller/dashboard') }">
                <span v-if="isSidebarOpen">Dashboard</span>
                <i v-else class="icon-dashboard">
                    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M16.5 11.5V4H26.5V11.5H16.5ZM4 16.5V4H14V16.5H4ZM16.5 26.5V14H26.5V26.5H16.5ZM4 26.5V19H14V26.5H4ZM6.5 14H11.5V6.5H6.5V14ZM19 24H24V16.5H19V24ZM19 9H24V6.5H19V9ZM6.5 24H11.5V21.5H6.5V24Z"
                            fill="black" />
                    </svg>
                </i>
            </NuxtLink>
            <NuxtLink to="/controller/staff" :class="{ 'active': $route.path.startsWith('/controller/staff') }">
                <span v-if="isSidebarOpen">Staff</span>
                <i v-else class="icon-staff">
                    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M5.625 7.96875C5.625 6.60123 6.16825 5.28972 7.13523 4.32273C8.10222 3.35575 9.41373 2.8125 10.7812 2.8125C12.1488 2.8125 13.4603 3.35575 14.4273 4.32273C15.3943 5.28972 15.9375 6.60123 15.9375 7.96875C15.9375 9.33627 15.3943 10.6478 14.4273 11.6148C13.4603 12.5818 12.1488 13.125 10.7812 13.125C9.41373 13.125 8.10222 12.5818 7.13523 11.6148C6.16825 10.6478 5.625 9.33627 5.625 7.96875ZM17.8125 10.7812C17.8125 10.2272 17.9216 9.67865 18.1336 9.1668C18.3456 8.65496 18.6564 8.18989 19.0481 7.79814C19.4399 7.4064 19.905 7.09565 20.4168 6.88363C20.9286 6.67162 21.4772 6.5625 22.0312 6.5625C22.5853 6.5625 23.1339 6.67162 23.6457 6.88363C24.1575 7.09565 24.6226 7.4064 25.0144 7.79814C25.4061 8.18989 25.7169 8.65496 25.9289 9.1668C26.1409 9.67865 26.25 10.2272 26.25 10.7812C26.25 11.9001 25.8055 12.9732 25.0144 13.7644C24.2232 14.5555 23.1501 15 22.0312 15C20.9124 15 19.8393 14.5555 19.0481 13.7644C18.257 12.9732 17.8125 11.9001 17.8125 10.7812ZM1.875 23.9062C1.875 21.5442 2.81333 19.2788 4.48358 17.6086C6.15383 15.9383 8.41917 15 10.7812 15C13.1433 15 15.4087 15.9383 17.0789 17.6086C18.7492 19.2788 19.6875 21.5442 19.6875 23.9062V23.91L19.6862 24.0587C19.6836 24.2177 19.6406 24.3734 19.5612 24.5112C19.4818 24.6489 19.3687 24.7642 19.2325 24.8463C16.6814 26.3823 13.7591 27.1919 10.7812 27.1875C7.69125 27.1875 4.79875 26.3325 2.33125 24.8463C2.19481 24.7644 2.08146 24.6491 2.00186 24.5114C1.92226 24.3736 1.87903 24.2178 1.87625 24.0587L1.875 23.9062ZM21.5625 23.91L21.5613 24.09C21.5543 24.5066 21.4548 24.9165 21.27 25.29C21.5217 25.305 21.7754 25.3125 22.0312 25.3125C24.0262 25.3125 25.915 24.85 27.595 24.0263C27.7466 23.9521 27.8755 23.8385 27.9679 23.6972C28.0603 23.556 28.1128 23.3924 28.12 23.2238L28.125 22.9688C28.1252 21.941 27.8654 20.93 27.3699 20.0296C26.8744 19.1292 26.1592 18.3688 25.2909 17.819C24.4225 17.2693 23.4293 16.9481 22.4035 16.8853C21.3777 16.8226 20.3526 17.0202 19.4237 17.46C20.8141 19.3213 21.564 21.583 21.5613 23.9062L21.5625 23.91Z"
                            fill="black" />
                    </svg>
                </i>
            </NuxtLink>
            <NuxtLink to="/controller/customer" :class="{ 'active': $route.path.startsWith('/controller/customer') }">
                <span v-if="isSidebarOpen">Customer</span>
                <i v-else class="icon-customer">
                    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M18.1251 6.87498C18.1251 4.45875 16.1663 2.50002 13.75 2.50002L13.51 2.50646C11.2054 2.63109 9.37502 4.53931 9.37502 6.87498C9.37502 9.29127 11.3338 11.25 13.75 11.25L13.9901 11.2435C16.2947 11.1189 18.1251 9.2107 18.1251 6.87498ZM15 21.25C15 22.6161 15.3652 23.8969 16.0034 25H5.00006V20.5C5.00006 16.8653 7.79311 13.9015 11.292 13.7556L11.5625 13.75H15.9375C17.0762 13.75 18.1472 14.0483 19.0806 14.5731C16.6578 15.8164 15 18.3396 15 21.25ZM18.8264 26.3064L22.5 24.0625L26.1737 26.3064L25.1749 22.1191L28.4441 19.3186L24.1532 18.9746L22.5 15L20.8469 18.9746L16.5559 19.3186L19.8252 22.1191L18.8264 26.3064Z"
                            fill="black" />
                    </svg>
                </i>
            </NuxtLink>
            <NuxtLink to="/controller/history" :class="{ 'active': $route.path.startsWith('/controller/history') }">
                <span v-if="isSidebarOpen">History</span>
                <i v-else class="icon-history">
                    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M15 26.25C12.375 26.25 10.0521 25.4533 8.03125 23.86C6.01042 22.2667 4.69792 20.23 4.09375 17.75C4.01042 17.4375 4.07292 17.1512 4.28125 16.8912C4.48958 16.6312 4.77083 16.48 5.125 16.4375C5.45833 16.3958 5.76042 16.4583 6.03125 16.625C6.30208 16.7917 6.48958 17.0417 6.59375 17.375C7.09375 19.25 8.125 20.7813 9.6875 21.9688C11.25 23.1563 13.0208 23.75 15 23.75C17.4375 23.75 19.5054 22.9012 21.2037 21.2037C22.9021 19.5062 23.7508 17.4383 23.75 15C23.7492 12.5617 22.9004 10.4942 21.2037 8.7975C19.5071 7.10083 17.4392 6.25167 15 6.25C13.5625 6.25 12.2187 6.58333 10.9687 7.25C9.71875 7.91667 8.66667 8.83333 7.8125 10H10C10.3542 10 10.6513 10.12 10.8913 10.36C11.1313 10.6 11.2508 10.8967 11.25 11.25C11.2492 11.6033 11.1292 11.9004 10.89 12.1413C10.6508 12.3821 10.3542 12.5017 10 12.5H5C4.64583 12.5 4.34917 12.38 4.11 12.14C3.87083 11.9 3.75083 11.6033 3.75 11.25V6.25C3.75 5.89583 3.87 5.59917 4.11 5.36C4.35 5.12083 4.64667 5.00083 5 5C5.35333 4.99917 5.65042 5.11917 5.89125 5.36C6.13208 5.60083 6.25167 5.8975 6.25 6.25V7.9375C7.3125 6.60417 8.60958 5.57292 10.1412 4.84375C11.6729 4.11458 13.2925 3.75 15 3.75C16.5625 3.75 18.0262 4.04708 19.3912 4.64125C20.7562 5.23542 21.9438 6.03708 22.9538 7.04625C23.9638 8.05542 24.7658 9.24292 25.36 10.6088C25.9542 11.9746 26.2508 13.4383 26.25 15C26.2492 16.5617 25.9525 18.0254 25.36 19.3912C24.7675 20.7571 23.9654 21.9446 22.9538 22.9538C21.9421 23.9629 20.7546 24.765 19.3912 25.36C18.0279 25.955 16.5642 26.2517 15 26.25ZM16.25 14.5L19.375 17.625C19.6042 17.8542 19.7187 18.1458 19.7187 18.5C19.7187 18.8542 19.6042 19.1458 19.375 19.375C19.1458 19.6042 18.8542 19.7187 18.5 19.7187C18.1458 19.7187 17.8542 19.6042 17.625 19.375L14.125 15.875C14 15.75 13.9062 15.6096 13.8437 15.4537C13.7812 15.2979 13.75 15.1363 13.75 14.9688V10C13.75 9.64583 13.87 9.34917 14.11 9.11C14.35 8.87083 14.6467 8.75083 15 8.75C15.3533 8.74917 15.6504 8.86917 15.8913 9.11C16.1321 9.35083 16.2517 9.6475 16.25 10V14.5Z"
                            fill="black" />
                    </svg>
                </i>
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


.sidebar-open+.content {
    margin-left: 300px;
}


.sidebar-collapsed+.content {
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
