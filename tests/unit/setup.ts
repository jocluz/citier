import Vue from "vue";
import Vuex from "vuex";
import { Card, Loading, Message, Input, Button, Link } from "element-ui";

Vue.use(Vuex);
Vue.use(Card);
Vue.use(Loading);
Vue.use(Input);
Vue.use(Button);
Vue.use(Link);
Vue.prototype.$message = Message;
