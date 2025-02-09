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

        <div class="down-payment">
            <div class="down-payment-title">จำนวนเงินดาวน์</div>
            <div class="down-payment-details">
                <input type="text" placeholder="%" />
                <input type="text" placeholder="บาท" />
            </div>
        </div>

        <div class="interest-rate">
            <div class="interest-title">อัตราดอกเบี้ย</div>
            <div class="interest-details">
                <input type="text" placeholder="%" />
            </div>
        </div>

        <div class="monthly-rate">
            <div class="monthly-title">ค่างวดต่อเดือน</div>
            <div class="monthly-details">
                <input type="text" placeholder="บาท" />
            </div>
        </div>

        <div class="special-dis">
            <div class="special-title">ส่วนลดพิเศษ</div>
            <div class="special-details">
                <input type="text" placeholder="บาท" />
            </div>
        </div>

        <div class="note">
            <div class="note-title">หมายเหตุ</div>
            <div class="note-details">
                <input type="text" placeholder="หมายเหตุ" />
            </div>
        </div>

        <div class="add-more">
            <button class="add-more-btn">+ เพิ่มรูปแบบการชำระเงิน</button>
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
.down-payment,
.period,
.interest-rate,
.monthly-rate,
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
.down-payment-title,
.period-title,
.interest-title,
.monthly-title,
.special-title,
.note-title {
    font-size: 18px;
    font-weight: bold;
    width: 35%;
}

.cus-details,
.staff-details,
.down-payment-details,
.period-details,
.interest-details,
.monthly-details,
.special-details,
.note-details {
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 65%;
}

input,
select {
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #ccc;
    font-size: 16px;
}

.add-more-btn {
    border: none;
    padding: 5px 10px;
    background: #D9D9D9;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 10px;
    margin: 5px;
}

</style>
