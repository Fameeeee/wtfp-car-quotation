<template>
    <div class="layout">
        <nav class="navbar">
            <NuxtLink to="/home">
                <img class="logo" src="../public/assets/IsuzuLogo.png" alt="">
            </NuxtLink>
            <div class="btn-group">
                <button class="ham btn dropdown" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <svg width="30" height="23" viewBox="0 0 30 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line y1="1.5" x2="30" y2="1.5" stroke="black" stroke-width="3" />
                        <line y1="11.5" x2="30" y2="11.5" stroke="black" stroke-width="3" />
                        <line y1="21.5" x2="30" y2="21.5" stroke="black" stroke-width="3" />
                    </svg>
                </button>
                <ul class="dropdown-menu">
                    <NuxtLink to="/home" class="menu">
                        <li class="list">Home</li>
                    </NuxtLink>
                    <hr>
                    <NuxtLink to="/history" class="menu">
                        <li class="list">History</li>
                    </NuxtLink>
                    <hr>
                    <NuxtLink to="#" class="menu" @click.prevent="handleLogout">
                        <li class="list logout btn btn-danger">Log Out</li>
                    </NuxtLink>
                </ul>
            </div>
        </nav>
        <main class="content">
            <slot />
        </main>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role')
  router.push('/');
};
</script>


<style scoped>
.layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
}

.navbar {
    height: 100px;
    width: 100%;
    background: white;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    z-index: 100;
}

.logo {
    height: 30px;
    width: auto;
}

.content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    width: 100%;
    display: flex;
    justify-content: center;
}

.dropdown-menu {
    padding: 5px;
    background: white;
    right: 0;
    left: auto;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    margin: 5px;
    min-width: 150px;
}

.menu {
    color: black;
    text-decoration: none;
    display: block;
}

.list {
    border-radius: 5px;
    padding: 10px 10px;
    font-size: 16px;
}

.list:hover {
    background-color: rgb(184, 184, 184);
}

hr {
    margin: 5px;
}

.ham {
    border: none;
    padding: 8px;
    background: none;
}

.logout {
    width: 100%;
    border: none;
    color: white;
}
</style>