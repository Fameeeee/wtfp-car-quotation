<template>
    <transition name="fade-in-bottom">
        <div v-if="show" class="modal-overlay" @click.self="close">
            <div class="modal-content">
                <div class="modal-head">
                    <h2 class="title">รุ่นรถ</h2>
                    <button class="close-btn" @click="close">X</button>
                </div>


                <div class="car-model">
                    <button v-for="(model, index) in modalData" :key="index" class="car-price">
                        <div>
                            {{ model.name }}
                        </div>
                        <div>
                            {{ model.price }}
                        </div>
                    </button>
                </div>


                <!-- <ul>
                    <li v-for="(model, index) in modalData" :key="index" class="car-model">
                        <div>
                            {{ model.name }}{{ model.price }}
                        </div>
                    </li>
                </ul> -->

            </div>
        </div>
    </transition>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    show: Boolean,
    modalData: Array,
});

const emit = defineEmits(['close']);

const close = () => {
    emit('close');
};
</script>

<style scoped>

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: flex-end;
    z-index: 1000;
}

.modal-content {
    width: 100%;
    max-width: 400px;
    background: #ffffff;
    border-radius: 10px 10px 0 0;
    padding: 20px;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    animation: slide-in-bottom 0.3s ease-out;
}

.modal-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0px 10px;
}

.close-btn {
    background: #ffffff;
    color: #000000;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 30px;
}

.car-model {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    padding: 10px;
    gap: 10px;
}

.car-price {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 10px;
    font-family: 'Roboto', sans-serif;
    font-size: 16px;
    background: #ffffff;
}

.fade-in-bottom-enter-active {
    transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}

.fade-in-bottom-leave-active {
    transition: transform 0.3s ease-in, opacity 0.3s ease-in;
}

.fade-in-bottom-enter-from {
    transform: translateY(100%);
    opacity: 0;
}

.fade-in-bottom-enter-to {
    transform: translateY(0);
    opacity: 1;
}

.fade-in-bottom-leave-from {
    transform: translateY(0);
    opacity: 1;
}

.fade-in-bottom-leave-to {
    transform: translateY(100%);
    opacity: 0;
}

@keyframes slide-in-bottom {
    from {
        transform: translateY(100%);
    }

    to {
        transform: translateY(0);
    }
}
</style>

