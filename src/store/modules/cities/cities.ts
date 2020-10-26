import { Module, ActionContext } from "vuex";
import * as citiesApi from "../../../api/cities.api";
import {
  State,
  CitiesList,
  CityParams,
  PreferredCities,
  PreferredCitiesPatch,
  CityInfo
} from "./types";

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
    },
    preferredCities: {}
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
    },
    preferredCities(state: State) {
      return state.preferredCities;
    },
    isCityPreferred: (state: State) => (geonameid: string) => {
      return state.preferredCities[geonameid];
    }
  },

  mutations: {
    setCities(state: State, citiesList: CitiesList) {
      state.citiesList.data.push(...citiesList.data);
      state.citiesList.total = citiesList.total;
      state.citiesList.links = citiesList.links;
      state.citiesList.filter = citiesList.filter || "";
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
    },
    setPreferredCities(state: State, preferredCities: Array<string>) {
      state.preferredCities = preferredCities.reduce((acc: {}, val: string) => {
        acc[val] = {
          geonameid: val
        };
        return acc;
      }, {});
    },
    updatePreferredCities(
      state: State,
      update: { city: CityInfo; selected: boolean }
    ) {
      const preferred: PreferredCities = {
        ...state.preferredCities
      };
      if (!update.selected) {
        delete preferred[update.city.geonameid];
      } else {
        preferred[update.city.geonameid] = update.city;
      }
      state.preferredCities = preferred;
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
          items = await citiesApi.getCities(params, lastCall);
          commit("setCities", items);
          cancel = null;
          return items;
        }

        if (getters.prevLink) {
          const params: CityParams = parseParams(getters.lastLink);
          if (filter) params.filter = filter;
          items = await citiesApi.getCities(params, lastCall);
          commit("setCities", items);
          cancel = null;
          return items;
        }

        const params: CityParams = { offset: "0", limit: "30" };
        if (filter) params.filter = filter;
        items = await citiesApi.getCities(params, lastCall);
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
    },
    async getPreferredCities({ commit, state }: ActionContext<State, {}>) {
      const preferredCities = await citiesApi.getPreferredCities();
      commit("setPreferredCities", preferredCities.data);
      return state.preferredCities;
    },
    async savePreferredCities(
      { commit, state }: ActionContext<State, {}>,
      preferred: { city: CityInfo; selected: boolean }
    ) {
      const city = preferred.city;
      const selected = preferred.selected;
      const preferredPatch: PreferredCitiesPatch = {
        [city.geonameid]: selected
      };

      await citiesApi.savePreferredCities(preferredPatch);
      commit("updatePreferredCities", { city, selected });
      return state.preferredCities;
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
