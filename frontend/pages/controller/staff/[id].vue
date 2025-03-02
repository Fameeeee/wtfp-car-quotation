<template>
    <div class="layout">
        <AdminSidebar />
        <div class="content">
            <div class="header">
                <div class="title">Staff</div>
            </div>
            <div class="staff-table">
                <div class="back">
                    <button @click="goBack" class="back-btn">
                        < กลับ</button>
                </div>
                <div class="staff">
                    <div class="staff-img">
                        <svg width="100" height="100" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M15.71 12.71C16.6904 11.9387 17.406 10.8809 17.7572 9.68394C18.1085 8.48697 18.0779 7.21027 17.6698 6.03147C17.2617 4.85267 16.4963 3.83039 15.4801 3.10686C14.4639 2.38332 13.2474 1.99451 12 1.99451C10.7525 1.99451 9.53611 2.38332 8.51993 3.10686C7.50374 3.83039 6.73834 4.85267 6.33021 6.03147C5.92208 7.21027 5.89151 8.48697 6.24276 9.68394C6.59401 10.8809 7.3096 11.9387 8.29 12.71C6.61007 13.383 5.14428 14.4994 4.04889 15.9399C2.95349 17.3805 2.26956 19.0913 2.07 20.89C2.05555 21.0213 2.06711 21.1542 2.10402 21.2811C2.14093 21.4079 2.20246 21.5263 2.28511 21.6293C2.45202 21.8375 2.69478 21.9708 2.96 22C3.22521 22.0292 3.49116 21.9518 3.69932 21.7849C3.90749 21.618 4.04082 21.3752 4.07 21.11C4.28958 19.1552 5.22168 17.3498 6.68822 16.0388C8.15475 14.7278 10.0529 14.003 12.02 14.003C13.9871 14.003 15.8852 14.7278 17.3518 16.0388C18.8183 17.3498 19.7504 19.1552 19.97 21.11C19.9972 21.3557 20.1144 21.5827 20.2991 21.747C20.4838 21.9114 20.7228 22.0015 20.97 22H21.08C21.3421 21.9698 21.5817 21.8373 21.7466 21.6313C21.9114 21.4252 21.9881 21.1624 21.96 20.9C21.7595 19.0962 21.0719 17.381 19.9708 15.9382C18.8698 14.4954 17.3969 13.3795 15.71 12.71ZM12 12C11.2089 12 10.4355 11.7654 9.77772 11.3259C9.11992 10.8864 8.60723 10.2616 8.30448 9.53074C8.00173 8.79983 7.92251 7.99557 8.07686 7.21964C8.2312 6.44372 8.61216 5.73099 9.17157 5.17158C9.73098 4.61217 10.4437 4.2312 11.2196 4.07686C11.9956 3.92252 12.7998 4.00173 13.5307 4.30448C14.2616 4.60724 14.8863 5.11993 15.3259 5.77772C15.7654 6.43552 16 7.20888 16 8C16 9.06087 15.5786 10.0783 14.8284 10.8284C14.0783 11.5786 13.0609 12 12 12Z"
                                fill="#1E1E1E" />
                        </svg>
                    </div>
                    <div class="staff-details">
                        <div v-if="loading">Loading staff details...</div>
                        <div v-else-if="staffData">
                            <div class="row-1">
                                {{ staffData.firstName }} {{ staffData.lastName }}
                            </div>
                            <div class="row-2">
                                <p><strong>ตำแหน่ง :</strong> {{ staffData.role }}</p> 
                                <p><strong>จังหวัด : </strong> {{ staffData.city }}</p>
                                <p><strong>สาขา : </strong> {{ staffData.branch }}</p>
                            </div>
                            <div class="row-3">
                                <p><strong>อีเมลล์ :</strong> {{ staffData.email }}</p>
                                <p><strong>เบอร์โทรศัพท์ :</strong> {{ staffData.phoneNumber }}</p>
                                <p><strong>เพศ :</strong> {{ staffData.gender }}</p>
                            </div>
                        </div>
                        <div v-else>
                            <p>No staff found.</p>
                        </div>
                    </div>
                </div>
                <hr>
                <div class="table-controls">
                    <button class="filter-button">
                        <img src="/assets/sort.png" alt="Filter" />
                        Filter
                    </button>
                    <div class="search-bar">
                        <input type="text" v-model="searchQuery" placeholder="ค้นหา" />
                        <button @click="search">
                            <img src="/assets/magnifying-glass.png" alt="Search" width="20" />
                        </button>
                    </div>
                </div>
                <div class="history-data">
                    <div v-if="staffData && staffData.quotations">
                        <p v-for="(quotation, index) in staffData.quotations" :key="index">
                            {{ quotation.id }} {{ quotation.customer.firstname }} {{ quotation.customer.lastname }}
                        </p>
                    </div>
                </div>
                <div class="pagination">
                    <- 1 ->
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import AdminSidebar from '~/components/admin/AdminSidebar.vue';
import { useRouter, useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';
import axios from "axios";


const route = useRoute();
const router = useRouter();
const staffId = route.params.id;
const staffData = ref(null);
const loading = ref(true);
const searchQuery = ref("");

// const fetchStaffById = async () => {
//     loading.value = true;
//     try {
//         const response = await axios.get(`http://localhost:3001/staff/${staffId}`);
//         staffData.value = response.data;
//         console.log(staffData)
//     } catch (error) {
//         console.error("Error fetching staff data:", error);
//     } finally {
//         loading.value = false;
//     }
// };

const fetchStaffData = async () => {
    try {
        const response = await axios.get(`http://localhost:3001/staff/${staffId}`);
        staffData.value = response.data;
        console.log(staffData)
    } catch (error) {
        console.error("Error fetching staff data:", error);
    } finally {
        loading.value = false;
    }
};


// async function fetchQuotationsByStaffId() {
//     try {
//         // Fetch staff details from localhost
//         const staffResponse = await axios.get(`http://localhost:3001/staff/${staffId}`);
//         const staffData = staffResponse.data;

//         // Extract quotation IDs
//         const quotationIds = staffData.data?.quotations || [];

//         if (quotationIds.length === 0) {
//             console.log("No quotations found for this staff.");
//             return [];
//         }

//         // Fetch quotation details for each ID
//         const quotations = await Promise.all(
//             quotationIds.map(async (quotationId) => {
//                 const response = await axios.get(`http://localhost:3001/quotation/${quotationId}`);
//                 return response.data;
//             })
//         );

//         console.log("Fetched quotations:", quotations);
//         return quotations;
//     } catch (error) {
//         console.error("Error fetching quotations:", error);
//         return [];
//     }
// }

const goBack = () => {
    router.push('/controller/staff')
}

onMounted(() => {
    fetchStaffData();
});

definePageMeta({
    middleware: 'staff-auth',
    layout: false
})
</script>
<style scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Roboto', sans-serif;
}

hr {
    margin: 10px 0;
}

.layout {
    display: flex;
    min-height: 100vh;
    background: #ececec;
    width: 100vw;
}

.content {
    display: flex;
    flex-direction: column;
    padding: 20px;
    flex: 1;
}

.title {
    font-size: 3rem;
}

.sidebar-collapsed+.content {
    margin-left: 80px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
}

.staff-table {
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    position: relative;
    height: 100%;
    min-height: 300px;
    overflow: hidden;
}

.back-btn {
    width: 100px;
    height: 40px;
    background: #E83842;
    color: white;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 5px;
    margin-bottom: 10px;
}

.staff {
    background: #ECECEC;
    border-radius: 5px;
    padding: 10px;
    display: flex;
    gap: 10px;
}

.staff-img {
    height: 150px;
    background: white;
    width: 150px;
    display: flex;
    justify-content: center;
    align-items: center;
}


.staff-details {
    background: #606060;
    padding: 10px;
}

.action-btn {
    background: #7bff29;
}

.history-data {
    background: #8a58ff;
}

.pagination {
    background: #ff70bf;
}

.row-1,
.row-2,
.row-3 {
    display: flex;
    gap: 15px;
    margin: 5px 0;
}

.row-1 {
    font-size: 22px;
    font-weight: bold;
}

.row-2,
.row-3 {
    font-size: 18px;
}

.table-controls {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.filter-button {
    background: #fff;
    border: 1px solid #0000001A;
    padding: 8px 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    border-radius: 5px;
    margin-right: 10px;
    transition: all 0.3s ease;
    height: 40px;
}

.filter-button img {
    width: 16px;
    height: 16px;
    margin-right: 5px;
}

.filter-button:hover {
    color: white;
}

.search-bar {
    display: flex;
    align-items: center;
    padding: 5px;
    border-radius: 5px;
    transition: all 0.3s ease;
}

.search-bar input {
    padding: 5px 10px;
    outline: none;
    border-radius: 5px;
    width: 200px;
    font-size: 1rem;
}

.search-bar button {
    padding: 5px;
    border: none;
    color: white;
    cursor: pointer;
    border-radius: 5px;
    margin-left: 5px;
}
</style>