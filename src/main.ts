import { createApp } from "vue";
import { VueFire, VueFireAuth } from "vuefire";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { firebaseApp } from "./config/firebase";

const app = createApp(App);
app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()],
});
app.use(router);
app.mount("#app");
