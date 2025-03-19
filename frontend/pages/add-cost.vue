<template>
    <div class="container">
        <div class="topic">ค่าใช้จ่ายเพิ่มเติม</div>
        <div class="content">
            <div class="card">
                <div class="first-row">
                    <div class="label">พรบ.</div>
                    <div class="checkbox-group">
                        <div class="checkbox" :class="{ selected: cmiCheck === 'do' }" 
                        @click="cmiCheck = 'do'">ทำ</div>
                        <div class="checkbox" :class="{ selected: cmiCheck === 'not_do' }" 
                        @click="cmiCheck = 'not_do'">ไม่ทำ</div>
                    </div>
                </div>

                <div class="second-row">
                    <div class="label">ประกันภัย</div>
                    <div class="checkbox-group">
                        <div class="checkbox" :class="{ selected: insuranceCheck === 'do' }"
                            @click="insuranceCheck = 'do'">ทำ</div>
                        <div class="checkbox" :class="{ selected: insuranceCheck === 'not_do' }"
                            @click="insuranceCheck = 'not_do'">ไม่ทำ</div>
                    </div>
                </div>

                <div class="third-row">
                    <div class="label">ค่าน้ำมัน</div>
                    <input type="number" class="input-field" v-model="fuelValue" placeholder="ป้อนค่าน้ำมัน">
                </div>

                <div class="forth-row">
                    <div class="label">หมายเหตุ</div>
                    <div class="note-container">
                        <textarea class="note-input" v-model="noteText" maxlength="150"
                            placeholder="เพิ่มหมายเหตุ..."></textarea>
                        <div class="char-counter">{{ noteText.length }}/150</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="btn">
            <div class="back-btn" @click="goBack">กลับ</div>
            <div class="confirm-btn" @click="goNext">ต่อไป</div>
        </div>
    </div>
    <div v-if="showModal" class="modal-overlay">
        <div class="modal">
            <p class="modal-text">คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการเปลี่ยนแปลงของคุณ?</p>
            <div class="modal-btn">
                <button @click="discardChanges" class="confirm-btn">ยืนยัน</button>
                <button @click="closeModal" class="back-btn">กลับ</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const showModal = ref(false)
const cmiCheck = ref('');
const insuranceCheck = ref('');
const fuelValue = ref('');
const noteText = ref('');

const toggleCmiCheck = () => {
    cmiCheck.value = !cmiCheck.value;
};

const toggleInsuranceCheck = () => {
    insuranceCheck.value = !insuranceCheck.value;
};

const goBack = async () => {
    openModal();
};

const openModal = () => {
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
};

const discardChanges = () => {
    showModal.value = false;
    router.push('/select-accessories');
};

definePageMeta({
    middleware: 'staff-auth'
});
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
    margin: 0;
}

.topic {
    font-family: 'Roboto', sans-serif;
    font-weight: 800;
    font-size: 32px;
    color: #696969;
    margin-bottom: 20px;
}

.card {
    width: 90vw;
    max-width: 600px;
    padding: 2rem;
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    gap: 2rem;
}

.first-row,
.second-row,
.third-row,
.forth-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 1rem;
    font-weight: 500;
    color: #333;
}

.label {
    font-weight: 600;
    color: #444;
}

.input-field {
    width: 200px;
    padding: 8px;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 6px;
}

.note-container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    width: 200px;
}

.note-input {
    width: 100%;
    height: 60px;
    padding: 8px;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    resize: none;
}

.char-counter {
    font-size: 0.85rem;
    color: #777;
}

.checkbox-group {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    width: 200px;
}

.checkbox {
    padding: 8px 12px;
    font-size: 1rem;
    font-weight: 600;
    border: 2px solid #ccc;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
}

.checkbox:hover {
    background-color: #f3f3f3;
}

.checkbox.selected {
    background-color: #980000;
    border-color: #980000;
    color: white;
}

.btn {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 400px;
    padding: 1rem;
    background: white;
}


.confirm-btn {
    flex: 2;
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: white;
    background: linear-gradient(135deg, #980000 0%, #980000 100%);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.back-btn {
    flex: 1;
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    color: #4b5563;
    background-color: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal {
    background-color: white;
    position: absolute;
    display: block;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0, 0, 0.2);
    text-align: center;
    max-width: 400px;
    width: 90%;
    animation: fadeIn 0.3s ease-in-out;
    height: 200px;
}

.modal-btn {
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    margin-top: 1rem;
}
</style>