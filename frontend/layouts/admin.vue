<template>
    <div class="layout">
        <nav>
            <img class="logo" src="../public/assets/IsuzuLogo.png" alt="">
        </nav> 
        <main class="content">
            <slot></slot>
        </main>
    </div>
</template>

<style scoped>
.layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
}

img{
    height: 80px;
}

nav{
    height: 150px;
    background: #ffffff;
    display: flex;
    justify-content:center;
    align-items: center;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
}

.content {
    flex: 1;
    overflow-y: auto;
    width: 100%;
}


@media (min-width: 768px) {
    img{
        height: 90px;
    }
}
@media (max-width: 425px) {
    img{
        height: 50px;
    }
    nav{
        height: 120px;
    }
}

@media (min-width: 1024px) {
    img{
        height: 100px;
    }
    nav{
        height: 180px;
    }
}
</style>
