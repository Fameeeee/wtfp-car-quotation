<template>
    <!-- Mobile backdrop -->
    <div v-if="isOpen" class="fixed inset-0 bg-black/30 sm:hidden z-[90]" @click="$emit('toggle')"></div>

    <aside
        role="navigation"
        aria-label="Admin sidebar"
        class="sidebar h-screen min-h-screen shadow-md flex flex-col fixed left-0 top-0 bg-white transition-all duration-300 ease-in-out transform will-change-transform z-[100]"
        :class="[
            // width: desktop collapsed/expanded; mobile fixed drawer width
            isOpen ? 'sm:w-[280px] sm:min-w-[280px]' : 'sm:w-[80px] sm:min-w-[80px]',
            'w-[280px]',
            // slide in/out on mobile
            isOpen ? 'translate-x-0' : '-translate-x-full',
            'sm:translate-x-0'
        ]">
        <div class="first-row flex items-center justify-between p-5">
            <div class="logo" v-if="isOpen">
                <img class="max-w-[150px] my-5 transition-all duration-300 ease-in-out" src="/assets/IsuzuLogo.png"
                    alt="Isuzu Logo" />
            </div>
            <div class="hamburger cursor-pointer text-4xl text-center text-black p-2" @click="$emit('toggle')">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                    <path d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z" fill="black" />
                </svg>
            </div>
        </div>

        <nav class="flex flex-col gap-2.5 w-full px-2">
            <NuxtLink to="/controller/admin" :class="{ active: $route.path.startsWith('/controller/admin') }"
                class="flex items-center gap-3 text-black text-base font-bold transition-all duration-300 ease-in-out py-3 px-3 hover:bg-gray-100">
                <span v-if="isOpen" class="transition-opacity duration-200">Dashboard</span>
                <i v-else class="icon-dashboard">
                    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 13h8V3H3v10zM3 21h8v-6H3v6zM13 21h8V11h-8v10zM13 3v6h8V3h-8z" fill="black"/>
                    </svg>
                </i>
            </NuxtLink>

            <NuxtLink to="/controller/staff" :class="{ active: $route.path.startsWith('/controller/staff') }"
                class="flex items-center gap-3 text-black text-base font-bold transition-all duration-300 ease-in-out py-3 px-3 hover:bg-gray-100">
                <span v-if="isOpen" class="transition-opacity duration-200">Staff</span>
                <i v-else class="icon-staff">
                    <svg width="25" height="25" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink">
                        <rect width="30" height="30" fill="url(#pattern0_172_47)" />
                        <defs>
                            <pattern id="pattern0_172_47" patternContentUnits="objectBoundingBox" width="1" height="1">
                                <use xlink:href="#image0_172_47" transform="scale(0.01)" />
                            </pattern>
                            <image id="image0_172_47" width="100" height="100" preserveAspectRatio="none"
                                xlink:href="data:image/png;base64,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" />
                        </defs>
                    </svg>
                </i>
            </NuxtLink>

            <NuxtLink to="/controller/customer" :class="{ active: $route.path.startsWith('/controller/customer') }"
                class="flex items-center gap-3 text-black text-base font-bold transition-all duration-300 ease-in-out py-3 px-3 hover:bg-gray-100">
                <span v-if="isOpen" class="transition-opacity duration-200">Customer</span>
                <i v-else class="icon-customer">
                    <svg width="25" height="25" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink">
                        <rect width="30" height="30" fill="url(#pattern0_1244_105)" />
                        <defs>
                            <pattern id="pattern0_1244_105" patternContentUnits="objectBoundingBox" width="1"
                                height="1">
                                <use xlink:href="#image0_1244_105" transform="scale(0.01)" />
                            </pattern>
                            <image id="image0_1244_105" width="100" height="100" preserveAspectRatio="none"
                                xlink:href="data:image/png;base64,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" />
                        </defs>
                    </svg>
                </i>
            </NuxtLink>

            <NuxtLink to="/controller/history" :class="{ active: $route.path.startsWith('/controller/history') }"
                class="flex items-center gap-3 text-black text-base font-bold transition-all duration-300 ease-in-out py-3 px-3 hover:bg-gray-100">
                <span v-if="isOpen" class="transition-opacity duration-200">History</span>
                <i v-else class="icon-history">
                    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M12 21C9.9 21 8.04167 20.3627 6.425 19.088C4.80833 17.8133 3.75833 16.184 3.275 14.2C3.20833 13.95 3.25833 13.721 3.425 13.513C3.59167 13.305 3.81667 13.184 4.1 13.15C4.36667 13.1167 4.60833 13.1667 4.825 13.3C5.04167 13.4333 5.19167 13.6333 5.275 13.9C5.675 15.4 6.5 16.625 7.75 17.575C9 18.525 10.4167 19 12 19C13.95 19 15.6043 18.321 16.963 16.963C18.3217 15.605 19.0007 13.9507 19 12C18.9993 10.0493 18.3203 8.39533 16.963 7.038C15.6057 5.68067 13.9513 5.00133 12 5C10.85 5 9.775 5.26667 8.775 5.8C7.775 6.33333 6.93333 7.06667 6.25 8H8C8.28333 8 8.521 8.096 8.713 8.288C8.905 8.48 9.00067 8.71733 9 9C8.99933 9.28267 8.90333 9.52033 8.712 9.713C8.52067 9.90567 8.28333 10.0013 8 10H4C3.71667 10 3.47933 9.904 3.288 9.712C3.09667 9.52 3.00067 9.28267 3 9V5C3 4.71667 3.096 4.47933 3.288 4.288C3.48 4.09667 3.71733 4.00067 4 4C4.28267 3.99933 4.52033 4.09533 4.713 4.288C4.90567 4.48067 5.00133 4.718 5 5V6.35C5.85 5.28333 6.88767 4.45833 8.113 3.875C9.33833 3.29167 10.634 3 12 3C13.25 3 14.421 3.23767 15.513 3.713C16.605 4.18833 17.555 4.82967 18.363 5.637C19.171 6.44433 19.8127 7.39433 20.288 8.487C20.7633 9.57967 21.0007 10.7507 21 12C20.9993 13.2493 20.762 14.4203 20.288 15.513C19.814 16.6057 19.1723 17.5557 18.363 18.363C17.5537 19.1703 16.6037 19.812 15.513 20.288C14.4223 20.764 13.2513 21.0013 12 21ZM13 11.6L15.5 14.1C15.6833 14.2833 15.775 14.5167 15.775 14.8C15.775 15.0833 15.6833 15.3167 15.5 15.5C15.3167 15.6833 15.0833 15.775 14.8 15.775C14.5167 15.775 14.2833 15.6833 14.1 15.5L11.3 12.7C11.2 12.6 11.125 12.4877 11.075 12.363C11.025 12.2383 11 12.109 11 11.975V8C11 7.71667 11.096 7.47933 11.288 7.288C11.48 7.09667 11.7173 7.00067 12 7C12.2827 6.99933 12.5203 7.09533 12.713 7.288C12.9057 7.48067 13.0013 7.718 13 8V11.6Z"
                            fill="black" />
                    </svg>
                </i>
            </NuxtLink>

            <NuxtLink to="/controller/audit" :class="{ active: $route.path.startsWith('/controller/audit') }"
                class="flex items-center gap-3 text-black text-base font-bold transition-all duration-300 ease-in-out py-3 px-3 hover:bg-gray-100">
                <span v-if="isOpen" class="transition-opacity duration-200">Audit</span>
                <i v-else class="icon-audit">
                    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 3h18v2H3V3zm0 6h12v2H3V9zm0 6h18v2H3v-2z" fill="black" />
                    </svg>
                </i>
            </NuxtLink>
        </nav>

        <button
            class="logout bg-[#980000] text-white rounded-md cursor-pointer flex items-center justify-center mx-auto mt-auto mb-3 px-5 py-3 w-[90%] gap-2 transition-all duration-200"
            @click="Logout">
            <span v-if="isOpen" class="transition-opacity duration-200">Log Out</span>
            <i v-else class="icon-logout">
                <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M5 21C4.45 21 3.97933 20.8043 3.588 20.413C3.19667 20.0217 3.00067 19.5507 3 19V5C3 4.45 3.196 3.97933 3.588 3.588C3.98 3.19667 4.45067 3.00067 5 3H12V5H5V19H12V21H5ZM16 17L14.625 15.55L17.175 13H9V11H17.175L14.625 8.45L16 7L21 12L16 17Z"
                        fill="white" />
                </svg>
            </i>
        </button>
    </aside>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { clearToken } from '~/composables/useAuth'

defineProps({
    isOpen: {
        type: Boolean,
        required: true
    }
})

const emit = defineEmits(['toggle'])

const router = useRouter()

import { ref } from 'vue'

const isLoggingOut = ref(false)

const Logout = async () => {
    if (isLoggingOut.value) return
    isLoggingOut.value = true
    try {
        await clearToken()
    } finally {
        isLoggingOut.value = false
        router.push('/controller/login')
    }
}
</script>

<style scoped>
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

nav a.active {
    background-color: #f0f0f0;
    border-left: 4px solid #d32f2f;
}

nav a:hover {
    background-color: #e8e8e8;
}

.sidebar-collapsed nav a {
    justify-content: center;
}

.sidebar-collapsed nav a span {
    display: none;
}
</style>
