import { Module, ActionContext } from "vuex";
import * as citiesService from "../../../api/cities.api";
import { State, CitiesList, CityParams } from "./types";

let cancel: any = null;
const CANCEL_MESSAGE = "canceled";

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
    },
    nextLink(state: State) {
      return state.citiesList.links.next;
    },
    prevLink(state: State) {
      return state.citiesList.links.prev;
    },
    lastLink(state: State) {
      return state.citiesList.links.last;
    },
    filter(state: State) {
      return state.citiesList.filter;
    }
  },

  mutations: {
    setCities(state: State, payload: any) {
      state.citiesList.data.push(...payload.data);
      state.citiesList.total = payload.total;
      state.citiesList.links = payload.links;
      state.citiesList.filter = payload.filter || "";
    },
    clearCities(state: State) {
      state.citiesList.data.splice(0, state.citiesList.data.length);
      state.citiesList.total = -1;
      state.citiesList.links = {
        first: "",
        next: "",
        prev: "",
        last: ""
      };
      state.citiesList.filter = "";
    }
  },

  actions: {
    async getCities(
      { commit, getters }: ActionContext<{}, {}>,
      filter: string
    ) {
      if (cancel) {
        await cancel(CANCEL_MESSAGE);
      }

      const lastCall = (cancelFn: Function) => {
        cancel = cancelFn;
      };

      try {
        let items: CitiesList | null = null;
        if (getters.nextLink) {
          const params: CityParams = parseParams(getters.nextLink);
          if (filter) params.filter = filter;
          items = await citiesService.getCities(params, lastCall);
          commit("setCities", items);
          cancel = null;
          return items;
        }

        if (getters.prevLink) {
          const params: CityParams = parseParams(getters.lastLink);
          if (filter) params.filter = filter;
          items = await citiesService.getCities(params, lastCall);
          commit("setCities", items);
          cancel = null;
          return items;
        }

        const params: CityParams = { offset: "0", limit: "30" };
        if (filter) params.filter = filter;
        items = await citiesService.getCities(params, lastCall);
        commit("setCities", items);
        cancel = null;

        return items;
      } catch (error) {
        cancel = null;
        if (error.message === CANCEL_MESSAGE) {
          return;
        }

        throw error;
      }
    }
  }
};

function parseParams(params: string): CityParams {
  const queryParams = new URLSearchParams(params.split("?")[1]);
  const filter = queryParams.get("filter");
  const offset = queryParams.get("offset");
  const limit = queryParams.get("limit");
  const parsedParams: CityParams = {};
  if (filter) parsedParams.filter = filter;
  if (offset) parsedParams.offset = offset;
  if (limit) parsedParams.limit = limit;
  return parsedParams;
}

export default citiesModule;
