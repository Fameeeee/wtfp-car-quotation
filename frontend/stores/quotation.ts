import { defineStore } from 'pinia';

export const useQuotationStore = defineStore('quotation', {
  state: () => ({
    selectedCar: {} as any,
    selectedAccessories: [] as any[],
    additionCost: {} as any,
    customerDetails: {} as any,
    cashPlan: {} as any,
    installmentPlans: [] as any[],
    paymentMethod: '' as 'cash' | 'installment' | '',
    selectedTemplate: 'standard' as string // Default template
  }),
  actions: {
    setSelectedCar(car: any) {
      this.selectedCar = car;
    },
    setSelectedAccessories(acc: any[]) {
      this.selectedAccessories = acc;
    },
    setAdditionCost(cost: any) {
      this.additionCost = cost;
    },
    setCustomerDetails(details: any) {
      this.customerDetails = details;
    },
    setCashPlan(plan: any) {
      this.cashPlan = plan;
    },
    setInstallmentPlans(plans: any[]) {
      this.installmentPlans = plans;
    },
    setPaymentMethod(method: 'cash' | 'installment') {
      this.paymentMethod = method;
    },
    setSelectedTemplate(template: string) {
      this.selectedTemplate = template;
    },
    clearAll() {
      this.selectedCar = {};
      this.selectedAccessories = [];
      this.additionCost = {};
      this.customerDetails = {};
      this.cashPlan = {};
      this.installmentPlans = [];
      this.paymentMethod = '';
      this.selectedTemplate = 'standard';
    }
  },
  persist: true
});
