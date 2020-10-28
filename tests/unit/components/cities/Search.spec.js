import { shallowMount } from "@vue/test-utils";
import Vuex from "vuex";
import Search from "@/components/cities/Search.vue";
import DebounceSearchInput from "@/components/DebounceSearchInput.vue";
import flushPromises from "flush-promises";

jest.useFakeTimers();

describe("Search.vue", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Search, {
      store: new Vuex.Store({
        modules: {
          cities: {
            namespaced: true,
            mutations: {
              clearCities: jest.fn()
            },
            actions: {
              getCities: jest.fn().mockImplementation(() => Promise.resolve({}))
            }
          }
        }
      })
    });
  });

  it("should render the search component", () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper).toBeDefined();
  });

  it("should have empty search", () => {
    expect(wrapper.vm.search).toBe("");
  });

  it("should fire a search if the user starts typing", async () => {
    const getCitiesSpy = jest.spyOn(wrapper.vm, "getCities");
    const clearCitiesSpy = jest.spyOn(wrapper.vm, "clearCities");

    const searchInputComponent = wrapper.findComponent(DebounceSearchInput);
    expect(searchInputComponent.exists()).toBe(true);

    const filter = "arg";
    searchInputComponent.vm.$emit("search", filter);
    await flushPromises();

    expect(clearCitiesSpy).toHaveBeenCalled();
    expect(getCitiesSpy).toHaveBeenCalledWith(filter);
    expect(wrapper.vm.loading).toBe(false);
  });

  it("should show a message if fails getting cities after 3 retries", async () => {
    const clearCitiesSpy = jest.spyOn(wrapper.vm, "clearCities");
    wrapper.vm.getCities = jest.fn().mockRejectedValue({});
    wrapper.vm.$message.error = jest.fn().mockReturnValue({});

    const filter = "arg";
    const searchInputComponent = wrapper.findComponent(DebounceSearchInput);
    searchInputComponent.vm.$emit("search", filter);
    jest.runAllTimers();
    await flushPromises();
    jest.runAllTimers();
    await flushPromises();
    jest.runAllTimers();
    await flushPromises();
    jest.runAllTimers();
    await flushPromises();

    expect(clearCitiesSpy).toHaveBeenCalled();
    expect(wrapper.vm.getCities).toHaveBeenCalledTimes(4);
    expect(wrapper.vm.$message.error).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.$message.error).toHaveBeenCalledWith({
      type: "error",
      message: `Failed to load cities. Please try again.`
    });
    expect(wrapper.vm.loading).toBe(false);
  });

  it("should not stop spinner if the request is cancelled and another is running", async () => {
    await flushPromises();

    const clearCitiesSpy = jest.spyOn(wrapper.vm, "clearCities");
    wrapper.vm.getCities = jest.fn().mockResolvedValue({ canceled: true });

    const filter = "arg";
    const searchInputComponent = wrapper.findComponent(DebounceSearchInput);
    searchInputComponent.vm.$emit("search", filter);
    await flushPromises();

    expect(clearCitiesSpy).toHaveBeenCalled();
    expect(wrapper.vm.getCities).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.loading).toBe(true);
  });
});
