<template>
    <div class="flex flex-col min-h-screen bg-white">
        <!-- Navbar -->
        <nav class="h-[100px] w-full bg-white shadow-md flex justify-between items-center px-4">
            <NuxtLink to="/home" class="flex items-center">
                <img class="h-[30px] w-auto" src="/assets/IsuzuLogo.png" alt="Logo" />
            </NuxtLink>

            <!-- Dropdown Menu -->
            <div class="relative">
                <button class="text-gray-700 hover:text-gray-900 focus:outline-none" @click="toggleDropdown">
                    <svg width="35" height="35" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z" fill="black" />
                    </svg>
                </button>
                <div class="absolute right-0 w-48 mt-2 bg-white shadow-lg rounded-lg text-black z-50 border border-gray-400" v-if="isDropdownOpen">
                    <ul @click="closeDropdown">
                        <li>
                            <NuxtLink to="/home" class="block px-4 py-4 text-sm hover:bg-gray-100 border-b border-gray-400"> 
                                Home
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/history" class="block px-4 py-4 text-sm hover:bg-gray-100 border-b border-gray-400">
                                History
                            </NuxtLink>
                        </li>
                        <li>
                            <button @click="handleLogout"
                                class="block px-4 py-4 text-sm text-red-600 hover:bg-gray-100 w-full text-left">
                                Log Out
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

        <!-- Page Content -->
        <main class="flex-1">
            <slot />
        </main>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { clearToken } from '~/composables/useAuth'

const router = useRouter();
const isDropdownOpen = ref(false);
const isLoggingOut = ref(false)

const handleLogout = async () => {
    if (isLoggingOut.value) return
    isLoggingOut.value = true
    try {
        await clearToken()
        // do not clear entire localStorage (may include persisted app state);
        isDropdownOpen.value = false;
        router.push('/');
    } finally {
        isLoggingOut.value = false
    }
};

const closeDropdown = () => {
    isDropdownOpen.value = false;
};

const toggleDropdown = () => {
    isDropdownOpen.value = !isDropdownOpen.value;
};
</script>