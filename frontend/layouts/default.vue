<template>
    <div class="flex flex-col min-h-screen bg-white">
        <!-- Navbar -->
        <nav class="h-[100px] w-full bg-white shadow-md flex justify-between items-center px-4">
            <NuxtLink to="/home" class="flex items-center">
                <img class="h-[30px] w-auto" src="/assets/IsuzuLogo.png" alt="Logo" />
            </NuxtLink>

            <!-- Dropdown Menu -->
            <div class="relative" ref="menuRef" v-if="isLoggedIn">
                <button
                    class="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 shadow-sm hover:shadow transition focus:outline-none focus:ring-2 focus:ring-rose-300"
                    @click="toggleDropdown" aria-haspopup="menu" :aria-expanded="isDropdownOpen ? 'true' : 'false'"
                    aria-label="Open menu">
                    <span class="hidden sm:block text-sm text-gray-700">Menu</span>
                    <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z" fill="#111" />
                        </svg>
                    </span>
                </button>

                <Transition enter-active-class="transition ease-out duration-150"
                    enter-from-class="opacity-0 translate-y-1" enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 translate-y-1">
                    <div v-if="isDropdownOpen"
                        class="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white/95 backdrop-blur border border-gray-200 shadow-xl ring-1 ring-black/5 z-50">
                        <div class="px-4 py-3 border-b border-gray-100">
                            <p class="text-sm text-gray-500">Signed in as</p>
                            <p class="text-sm font-medium text-gray-900">{{ isManager ? 'Manager' : 'Staff' }}</p>
                        </div>
                        <ul role="menu" class="py-1 text-sm text-gray-800">
                            <li>
                                <NuxtLink to="/home" class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                                    @click="closeDropdown" role="menuitem">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3l9-8z" fill="#111" />
                                    </svg>
                                    <span>Home</span>
                                </NuxtLink>
                            </li>
                            <li>
                                <NuxtLink to="/history" class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                                    @click="closeDropdown" role="menuitem">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M13 3a9 9 0 1 0 8.485 6h-2.062A7.002 7.002 0 0 1 12 19a7 7 0 1 1 6.928-8H17l3.5 3.5L24 11h-2a9 9 0 0 0-9-8zM11 7h2v6h-4v-2h2V7z"
                                            fill="#111" />
                                    </svg>
                                    <span>History</span>
                                </NuxtLink>
                            </li>
                            <li v-if="isManager">
                                <NuxtLink to="/controller/dashboard"
                                    class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50" @click="closeDropdown"
                                    role="menuitem">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
                                            fill="#111" />
                                    </svg>
                                    <span>Admin Site</span>
                                </NuxtLink>
                            </li>
                            <li class="my-1 border-t border-gray-100"></li>
                            <li>
                                <button @click="handleLogout" role="menuitem"
                                    class="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-rose-50 text-rose-600">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M5 21c-.55 0-1.021-.196-1.413-.587A1.926 1.926 0 0 1 3 19V5c0-.55.196-1.021.587-1.412C3.979 3.196 4.45 3 5 3h7v2H5v14h7v2H5zm11-4l-1.375-1.45L17.175 13H9v-2h8.175l-2.55-2.55L16 7l5 5-5 5z"
                                            fill="#dc2626" />
                                    </svg>
                                    <span>Log Out</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                </Transition>
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
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { clearToken, isManager as isManagerFn, getToken } from '~/composables/useAuth.ts'
import { useNotification } from '~/composables/useNotification'

const router = useRouter();
const toast = useNotification();
const isDropdownOpen = ref(false);
const isLoggingOut = ref(false)
const isManager = ref(false);
const menuRef = ref(null)
const isLoggedIn = ref(false);

// Initialize auth state only on client to avoid hydration mismatch
onMounted(() => {
    try {
        isLoggedIn.value = !!getToken();
        isManager.value = isManagerFn();
    } catch (e) {
        isLoggedIn.value = false;
        isManager.value = false;
    }
})

const handleLogout = async () => {
    if (isLoggingOut.value) return
    isLoggingOut.value = true
    try {
        await clearToken()
        isLoggedIn.value = false;
        isManager.value = false;
        isDropdownOpen.value = false;
        toast.success('ออกจากระบบสำเร็จ');
        setTimeout(() => {
            router.push('/');
        }, 800);
    } catch (error) {
        toast.error('เกิดข้อผิดพลาดในการออกจากระบบ');
        console.error('Logout error:', error);
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

const onClickOutside = (e) => {
    if (!isDropdownOpen.value) return
    const el = menuRef.value
    if (el && !el.contains(e.target)) {
        isDropdownOpen.value = false
    }
}

const onKeydown = (e) => {
    if (e.key === 'Escape') {
        isDropdownOpen.value = false
    }
}

onMounted(() => {
    window.addEventListener('click', onClickOutside)
    window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
    window.removeEventListener('click', onClickOutside)
    window.removeEventListener('keydown', onKeydown)
})
</script>