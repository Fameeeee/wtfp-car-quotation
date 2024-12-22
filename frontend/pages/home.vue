<template>
    <div class="container">
        <div class="topic">หน้าหลัก</div>
        <div class="content">
            <NuxtLink to="/select" class="link">
                <button class="group-button">
                    <span class="button-title">สร้างใบเสนอราคา</span>
                </button>
            </NuxtLink>

            <NuxtLink to="/history" class="link">
                <button class="group-button">
                    <span class="button-title">ประวัติการทำรายการ</span>
                </button>
            </NuxtLink>
        </div>
    </div>
</template>

<script setup>

</script>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px;
}

.content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.topic {
    font-family: 'Roboto', sans-serif;
    font-weight: 800;
    font-size: 32px;
    color: #696969;
    margin-bottom: 20px;
}

.group-button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 90vw;
    height: 100px; 
    padding: 10px 20px;
    background: #FFFFFF;
    border: 1px solid rgba(0, 0, 0, 0.5);
    border-radius: 20px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.button-title {
    font-family: 'Roboto', sans-serif;
    font-weight: 600;
    font-size: 32px;
    color: #696969;
}

.link {
    text-decoration: none;
}

@media (min-width: 768px) {
    .group-button {
        width: 95vw;
    }
}
</style>