import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "../views/DashboardView.vue";
import AddTransactionView from "../views/AddTransactionView.vue";
import TransactionDetailsView from "../views/TransactionDetailsView.vue";
import AddVehicleView from "../views/AddVehicleView.vue";
import EditTransactionView from "../views/EditTransactionView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "dashboard",
      component: DashboardView,
    },
    {
      path: "/transactions/add",
      name: "add-transaction",
      component: AddTransactionView,
    },
    {
      path: "/transactions/:id",
      name: "transaction-details",
      component: TransactionDetailsView,
    },
    {
      path: "/transactions/:id/edit",
      name: "edit-transaction",
      component: EditTransactionView,
    },
    {
      path: "/vehicles/add",
      name: "add-vehicle",
      component: AddVehicleView,
    },
  ],
});
export default router;
