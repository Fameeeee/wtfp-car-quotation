<template>
    <div class="main">
        <div class="customer">
            <div class="cus-title">ลูกค้า</div>
            <div class="cus-details">
                <input type="text" placeholder="ชื่อจริง" />
                <input type="text" placeholder="นามสกุล" />
            </div>
        </div>

        <div class="staff">
            <div class="staff-title">พนักงานขาย</div>
            <div class="staff-details">
                <input type="text" placeholder="ชื่อจริง" />
                <input type="text" placeholder="นามสกุล" />
            </div>
        </div>

        <div class="special-dis">
            <div class="special-title">ส่วนลดพิเศษ</div>
            <div class="special-details">
                <input type="text" placeholder="ส่วนลดพิเศษ" />
            </div>
        </div>

        <div class="note">
            <div class="note-title">หมายเหตุ</div>
            <div class="note-details">
                <input type="text" placeholder="หมายเหตุ" />
            </div>
        </div>
    </div>
</template>

<style scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Roboto', sans-serif;
}

.main {
    width: 80vw;
    display: flex;
    flex-direction: column;
    gap: 15px;
    align-items: center;
}

.customer,
.staff,
.special-dis,
.note {
    display: flex;
    width: 100%;
    /* align-items: center; */
    padding: 10px;
    gap: 10px;
}

.cus-title,
.staff-title,
.special-title,
.note-title {
    font-size: 18px;
    font-weight: bold;
    width: 35%;
}

.cus-details,
.staff-details,
.special-details,
.note-details {
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 65%;
}

input {
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #ccc;
    font-size: 16px;
}

</style>
