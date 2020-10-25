import { Module, ActionContext } from "vuex";
import * as citiesService from "../../../api/cities.api";
import { State, CitiesList } from "./types";

const citiesModule: Module<State, {}> = {
  namespaced: true,

  state: {
    citiesList: {
      data: [],
      total: -1,
      links: {
        first: "",
        next: "",
        prev: "",
        last: ""
      },
      filter: ""
    }
  },

  getters: {
    cities(state: State) {
      return state.citiesList.data;
    }
  },

  mutations: {
    setCities(state: State, citiesList: CitiesList) {
      state.citiesList.data.push(...citiesList.data);
      state.citiesList.total = citiesList.total;
      state.citiesList.links = citiesList.links;
      state.citiesList.filter = citiesList.filter;
    }
  },

  actions: {
    async getCities({ commit }: ActionContext<{}, {}>) {
      const params = { offset: 0, limit: 30, filter: null };
      const items: CitiesList = await citiesService.getCities(params);
      commit("setCities", items);
      return items;
    }
  }
};

export default citiesModule;
