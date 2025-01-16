<template>
    <div class="container">
        <div class="topic">รุ่นรถ</div>
        <div class="content">
            <NuxtLink :to="getModelLink('วี-ครอส 4x4')" class="link">
                <div class="rectangle">
                    <div class="model">
                        <div class="model-name">วี-ครอส 4x4</div>
                        <img src="../public/assets/car-model/vcross/vcross4x4.png" alt="วี-ครอส 4x4" class="model-img">
                    </div>
                </div>
            </NuxtLink>

            <NuxtLink :to="getModelLink('ปิกอัพ 4 ประตู')" class="link">
                <div class="rectangle">
                    <div class="model">
                        <div class="model-name">ปิกอัพ 4 ประตู</div>
                        <img src="../public/assets/car-model/4door/4door.png" alt="ปิกอัพ 4 ประตู" class="model-img">
                    </div>
                </div>
            </NuxtLink>

            <NuxtLink :to="getModelLink('ปิกอัพ 2 ประตู')" class="link">
                <div class="rectangle">
                    <div class="model">
                        <div class="model-name">ปิกอัพ 2 ประตู</div>
                        <img src="../public/assets/car-model/2door/2door.png" alt="ปิกอัพ 2 ประตู" class="model-img">
                    </div>
                </div>
            </NuxtLink>

            <NuxtLink :to="getModelLink('สปาร์ค')" class="link">
                <div class="rectangle">
                    <div class="model">
                        <div class="model-name">สปาร์ค</div>
                        <img src="../public/assets/car-model/spark/spark.png" alt="สปาร์ค" class="model-img">
                    </div>
                </div>
            </NuxtLink>

            <NuxtLink :to="getModelLink('เอ็กซ์-ซีรี่ย์')" class="link">
                <div class="rectangle">
                    <div class="model">
                        <div class="model-name">เอ็กซ์-ซีรี่ย์</div>
                        <img src="../public/assets/car-model/x-series/x-series.png" alt="เอ็กซ์-ซีรี่ย์" class="model-img">
                    </div>
                </div>
            </NuxtLink>

            <NuxtLink :to="getModelLink('มิว-เอ็กซ์')" class="link">
                <div class="rectangle">
                    <div class="model">
                        <div class="model-name">มิว-เอ็กซ์</div>
                        <img src="../public/assets/car-model/mu-x/mu-x.png" alt="มิว-เอ็กซ์" class="model-img">
                    </div>
                </div>
            </NuxtLink>
        </div>
    </div>
</template>

<script setup>
definePageMeta({
        middleware: 'auth'
    })
const getModelLink = (modelName) => `/create/${encodeURIComponent(modelName)}`;
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

.rectangle {
    display: flex;
    align-items: center;
    width: 90vw;
    height: 100px; 
    padding: 10px 20px;
    background: #FFFFFF;
    border: 1px solid rgba(0, 0, 0, 0.5);
    border-radius: 20px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.model {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.model-name {
    font-family: 'Roboto', sans-serif;
    font-size: 24px;
    font-weight: 600;
    color: #696969;
}

.model-img {
    width: 120px;
    height: auto;
}

.link {
    text-decoration: none;
}

@media (min-width: 768px) {
    .rectangle {
        width: 95vw;
    }
}
</style>