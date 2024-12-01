import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "dashboard",
      component: () => import("../views/DashboardView.vue"),
    },
    {
      path: "/transactions/add",
      name: "add-transaction",
      component: () => import("../views/AddTransactionView.vue"),
    },
    {
      path: "/transactions/:id",
      name: "transaction-details",
      component: () => import("../views/TransactionDetailsView.vue"),
    },
    {
      path: "/transactions/:id/edit",
      name: "edit-transaction",
      component: () => import("../views/EditTransactionView.vue"),
    },
    {
      path: "/vehicles/add",
      name: "add-vehicle",
      component: () => import("../views/AddVehicleView.vue"),
    },
    {
      path: "/vehicles/:id/edit",
      name: "edit-vehicle",
      component: () => import("../views/EditVehicleView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("../views/SettingsView.vue"),
      meta: { requiresAuth: true },
    },
  ],
});
export default router;
