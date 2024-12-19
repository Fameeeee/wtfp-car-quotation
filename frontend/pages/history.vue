<template>
    <div class="container">
        <div class="header">
            <div class="topic">ประวัติ</div>
            <div class="search"><img src="../public/assets/search.png" alt=""></div>
        </div>
        <div class="content">
            <div class="rectangle">
                <div class="title">
                    <div class="quote-title">ใบเสนอราคา</div>
                    <div class="quote-date">วันที่ 12 ตุลาคม 2567</div>
                </div>
                <hr>
                <div class="car-details">
                    <div class="model">V-CROSS</div>
                    <div class="details">3.0 Ddi M 4-door A/T</div>
                    <div class="customer-name">คุณ ธีธัช ธีรวโรภาส</div>
                </div>
            </div>
            
        </div>
    </div>
</template>

<style scoped>
body,
html {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 10px;
}

.topic {
    font-family: 'Roboto', sans-serif;
    font-weight: 600;
    font-size: 24px;
    text-align: center;
    color: #000000;
}

.search img {
    width: 45px;
}

.content {
    margin: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 10px;
}

.rectangle {
    margin-top: 10px;
    width: 90vw;
    height: fit-content;
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.2);
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 10px;
    padding: 8px;
}

.title {
    display: flex;
    justify-content: space-between;
    margin: auto 5px;
}

.quote-title {
    font-family: 'Roboto', sans-serif;
    font-weight: 800;
    font-size: 18px;
    color: #000000;
}

.quote-date {
    font-family: 'Roboto', sans-serif;
    font-weight: 300;
    font-size: 12px;
    display: flex;
    align-items: center;
    color: #000000;
}

hr {
    margin: 5px;
}

.car-details {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-left: 10px;
}

.model,
.details,
.customer-name {
    font-family: 'Roboto', sans-serif;
    font-weight: 600;
    font-size: 16px;
    align-items: center;
    color: #000000;
}

.details{
    font-weight: 500;
}
</style>