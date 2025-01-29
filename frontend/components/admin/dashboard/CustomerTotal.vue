<template>
    <div class="content">
        <div class="title">Number of Serviced Customer</div>
        <div class="result">120</div>
    </div>
</template>

<style scoped>
.content{
    background: #fff;
    width: 28vw;
    padding: 10px;
    box-shadow: 2px 4px 5px rgba(0, 0, 0, 0.25);
    border-radius: 5px;
}

.title{
    font-size: 1.5rem;
    font-weight: 700;
}

.result{
    font-size: 1.2rem;
}

@media (max-width: 425px) {
    .content {
        width: auto;
        margin: 5px 10px;
    }

    .title {
        font-size: 1rem;
        font-weight: 700;
    }

    .result {
        font-size: 0.8rem;
    }
}
</style>