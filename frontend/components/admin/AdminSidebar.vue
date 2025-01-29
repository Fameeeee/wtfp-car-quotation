<template>
    <aside class="sidebar">
        <img src="../../public/assets/IsuzuLogo.png" alt="" class="logo">
        <hr>
        <div class="link">
            <div class="link-to">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
                </svg>
                <NuxtLink to="/controller/dashboard" class="dashboard">Dashboard</NuxtLink>
            </div>
            <div class="link-to">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
                <NuxtLink to="/controller/dashboard" class="staff">Staff</NuxtLink>
            </div>
            <div class="link-to">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                <NuxtLink to="/controller/dashboard" class="customer">Customer</NuxtLink>
            </div>
            <div class="link-to">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                </svg>
                <NuxtLink to="/controller/dashboard" class="history">History</NuxtLink>
            </div>
        </div>
        <button class="logout-btn" @click.prevent="handleLogout">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
            </svg>
            <div class="logout">Logout</div>
        </button>
    </aside>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/controller/login');
};
</script>

<style scoped>
html,
body {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
}

hr {
    width: 90%;
    color: #000;
    margin: 5px;
}

svg{
    width: 1.2em;
    height: 1.2em;
}

.sidebar {
    background: #ffffff;
    width: 14vw;
    max-width: 16vw;
    display: flex;
    align-items: center;
    flex-direction: column;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    padding: 10px;
}

.logo {
    width: 12vw;
    margin: 15px;
}

.link {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

.link-to {
    margin-top: 10px;
    display: flex;
    justify-content: start;
    align-items: center;
    gap: 10px;
    font-size: 1.8vw;
    padding: 8px;
    border-radius: 5px;
    transition: background-color 0.2s ease;
}

.link-to:hover {
    background-color: #f0f0f0f0;
}

.logout-btn{
    border: none;
    background: #E20613;
    margin-top: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    font-size: 1.8vw;
    padding: 8px;
    border-radius: 5px;
    transition: background-color 0.2s ease;
    color: #ffffff;
    width: 100%;
}

.dashboard,
.staff,
.customer,
.history,
.logout {
    text-decoration: none;
    color: #000;
}

.logout {
    font-size: 1.8vw;
    text-align: center;
    color: #ffffff;
}

@media (max-width: 425px) {
    .dashboard,
    .staff,
    .customer,
    .history,
    .logout {
        display: none;
    }

    .link-to{
        margin-top: 5px;
    }

    svg{
        width: 2em;
        height: 2em;
    }
}
</style>
