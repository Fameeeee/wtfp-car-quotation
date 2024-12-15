<script setup lang="ts">

</script>

<template>
    <div class="layout">
        <nav class="navbar">
            <NuxtLink to="/home">
                <svg class="logo" width="148" height="75" viewBox="0 0 148 75" fill="none"
                    xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <rect width="148" height="75" fill="url(#pattern0_159_76)" />
                    <defs>
                        <pattern id="pattern0_159_76" patternContentUnits="objectBoundingBox" width="1" height="1">
                            <use xlink:href="#image0_159_76"
                                transform="matrix(0.00444444 0 0 0.00877037 0 -0.486667)" />
                        </pattern>
                        <image id="image0_159_76" width="225" height="225"
                            xlink:href="data:image/png;base64,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YJfHw8NqtvKDQFh6nYk0rM5fXiJk5q3LeXvOSnLTqWzgZCJbOn+tdrW66oNwODlZw7pWVj3/M+842hSBaRCwJYCjtnyJrieAo3qGRLAlgKO2fImuJ4CjeoZEsCWAo7Z8ia4ngKN6hkSwJYCjtnyJrieAo3qGRLAlgKO2fImuJ4CjeoZEsCWAo7Z8ia4ngKN6hkSwJYCjtnyJrieAo3qGRLAlgKO2fImuJ4CjeoZEsCWAo7Z8ia4ngKN6hkSwJYCjtnyJrieAo3qGRLAlgKO2fImuJ4CjeoZEsCWAo7Z8ia4ngKN6hkSwJYCjtnyJrieAo3qGRLAlgKO2fImuJ4CjeoZEsCWAo7Z8ia4ngKN6hkSwJYCjtnyJrieAo3qGRLAlgKO2fImuJ4CjeoZEsCWAo7Z8ia4ngKN6hkSwJYCjtnyJrieAo3qGRLAlgKO2fImuJ4CjeoZEsCWAo7Z8ia4ngKN6hkSwJYCjtnyJrieAo3qGRLAlgKO2fImuJ4CjeoZEsCWAo7Z8ia4ngKN6hkSwJYCjtnyJrieAo3qGRLAlgKO2fImuJ4CjeoZEsCWAo7Z8ia4ngKN6hkSwJYCjtnyJrieAo3qGRLAlgKO2fImuJ4CjeoZEsCWAo7Z8ia4ngKN6hkSwJYCjtnyJrieAo3qGRLAlgKO2fImuJ4CjeoZEsCWAo7Z8ia4ngKN6hkSwJYCjtnyJrieAo3qGRLAlgKO2fImuJ4CjeoZEsCWAo7Z8ia4ngKN6hkSwJYCjtnyJrieAo3qGRLAlgKO2fImuJ4CjeoZEsCWAo7Z8ia4ngKN6hkSwJYCjtnyJrieAo3qGRLAlgKO2fImuJ4CjeoZEsCWAo7Z8ia4ngKN6hkSwJYCjtnyJrieAo3qGRLAlgKO2fImuJ4CjeoZEsCWAo7Z8ia4ngKN6hkSwJYCjtnyJrieAo3qGRLAlgKO2fImuJ4CjeoZEsCXwf865SSw5fv6MAAAAAElFTkSuQmCC" />
                    </defs>
                </svg>
            </NuxtLink>
            <div class="btn-group">
                <button class="ham btn dropdown" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <img src="../public/assets/ham.png" alt="">
                </button>
                <ul class="dropdown-menu">
                    <NuxtLink to="/home" class="menu">
                        <li class="list home">Home</li>
                    </NuxtLink>
                    <hr>
                    <NuxtLink to="/history" class="menu">
                        <li class="list history">History</li>
                    </NuxtLink>
                    <hr>
                    <NuxtLink to="/" class="menu">
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

<style scoped>
.layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.navbar {
    height: 100px;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    display: flex;
    justify-content: space-between;
    align-items: center
}

.logo {
    display: block;
    margin: auto;
}

.content {
    flex-grow: 1;
    overflow-y: auto;
    padding: 1rem;

}

.dropdown-menu {
    padding: 5px;
    background: wheat;
}

.menu {
    color: black;
    text-decoration: none;
}

.list {
    border-radius: 5px;
    padding: 5px 10px;
    font-size: larger;
}

.list:hover {
    background-color: rgb(184, 184, 184);
}

hr {
    margin: 5px;
}

.ham {
    border: none;
    margin-right: 20px;
}

.logout {
    width: 100%;
    border: none;
}

@media (max-width: 768px) {
    .navbar {
        height: auto; 
    }
}

</style>
