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
    preferredCities: {
      data: {},
      withError: null,
      loading: {}
    },
    cancelRequest: null
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
      return state.preferredCities.data;
    },
    preferredCitiesWithError(state: State) {
      return state.preferredCities.withError;
    },
    preferredCitiesLoading(state: State) {
      return state.preferredCities.loading;
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
      state.citiesList.data = [];
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
      state.preferredCities.data = preferredCities.reduce(
        (acc: {}, val: string) => {
          acc[val] = {
            geonameid: val
          };
          return acc;
        },
        {}
      );
    },
    updatePreferredCities(
      state: State,
      payload: { city: CityInfo; selected: boolean }
    ) {
      const preferred: PreferredCities = {
        ...state.preferredCities.data
      };
      if (!payload.selected) {
        delete preferred[payload.city.geonameid];
      } else {
        preferred[payload.city.geonameid] = payload.city;
      }
      state.preferredCities.data = preferred;
    },
    addPreferredCitiesError(state: State, geonameid: string) {
      if (!state.preferredCities.withError)
        state.preferredCities.withError = [];
      state.preferredCities.withError.push(geonameid);
    },
    removePreferredCitiesError(state: State, geonameid: string) {
      if (!state.preferredCities.withError) return;
      const index = state.preferredCities.withError.indexOf(geonameid);
      if (index > -1) {
        state.preferredCities.withError.splice(index, 1);
      }
      if (!state.preferredCities.withError.length)
        state.preferredCities.withError = null;
    },
    setPreferredLoading(
      state: State,
      payload: { geonameId: string; loading: boolean }
    ) {
      state.preferredCities.loading = {
        ...state.preferredCities.loading,
        [payload.geonameId]: payload.loading
      };
    },
    setCancelRequest(state: State, cancelFn: any) {
      state.cancelRequest = cancelFn;
    }
  },

  actions: {
    async getCities(
      { commit, getters, state }: ActionContext<State, {}>,
      filter: string
    ) {
      if (state.cancelRequest) {
        await state.cancelRequest(CANCEL_MESSAGE);
      }

      const lastCall = (cancelFn: Function) => {
        commit("setCancelRequest", cancelFn);
      };

      try {
        let items: CitiesList | null = null;
        if (getters.nextLink) {
          const params: CityParams = parseParams(getters.nextLink);
          if (filter) params.filter = filter;
          items = await citiesApi.getCities(params, lastCall);
          commit("setCancelRequest", null);
          if (!state.cancelRequest) {
            commit("setCities", items);
          }
          return items;
        }

        if (getters.prevLink) {
          const params: CityParams = parseParams(getters.lastLink);
          if (filter) params.filter = filter;
          items = await citiesApi.getCities(params, lastCall);
          commit("setCancelRequest", null);
          if (!state.cancelRequest) {
            commit("setCities", items);
          }
          return items;
        }

        const params: CityParams = { offset: "0", limit: "30" };
        if (filter) params.filter = filter;
        items = await citiesApi.getCities(params, lastCall);
        commit("setCancelRequest", null);
        if (!state.cancelRequest) {
          commit("setCities", items);
        }
        return items;
      } catch (error) {
        if (error.message === CANCEL_MESSAGE) {
          return { canceled: true };
        }

        throw error;
      }
    },
    async getCityInfo(
      { commit }: ActionContext<State, {}>,
      ids: Array<string>
    ) {
      ids.forEach(geonameId => {
        commit("setPreferredLoading", { geonameId, loading: true });
        citiesApi
          .getCity(geonameId)
          .then(city => {
            commit("updatePreferredCities", { city, selected: true });
            commit("removePreferredCitiesError", geonameId);
            commit("setPreferredLoading", { geonameId, loading: false });
          })
          .catch(error => {
            commit("addPreferredCitiesError", geonameId);
            commit("setPreferredLoading", { geonameId, loading: false });
          });
      });
    },
    async getPreferredCities({
      commit,
      dispatch,
      state
    }: ActionContext<State, {}>) {
      const preferredCities = await citiesApi.getPreferredCities();
      commit("setPreferredCities", preferredCities.data);
      dispatch("getCityInfo", preferredCities.data);
      return state.preferredCities;
    },
    async reloadFailedPreferred({ dispatch, state }: ActionContext<State, {}>) {
      dispatch("getCityInfo", state.preferredCities.withError);
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
