import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "element-ui/lib/theme-chalk/index.css";
import "@fortawesome/fontawesome-free/css/all.css";
import "@fortawesome/fontawesome-free/js/all.js";
import "leaflet/dist/leaflet.css";

import { Icon } from "leaflet";
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});

import { Card, Loading, Message, Input, Button, Link } from "element-ui";
Vue.use(Card);
Vue.use(Loading);
Vue.use(Input);
Vue.use(Button);
Vue.use(Link);

Vue.prototype.$message = Message;

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
