import { shallowMount } from "@vue/test-utils";
import Preferred from "@/components/cities/Preferred.vue";
import flushPromises from "flush-promises";
import store from "../../../../src/store";
import * as citiesApi from "../../../../src/api/cities.api";
import EmptyState from "../../../../src/components/EmptyState.vue";
import { Link } from "element-ui";

jest.mock("../../../../src/api/cities.api");

jest.useFakeTimers();

function mountWrapper(component, propsData = {}) {
  return shallowMount(component, {
    propsData,
    store
  });
}

describe("Preferred.vue", () => {
  it("should render the favorites component", async () => {
    citiesApi.getPreferredCities = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ data: [] }));

    const wrapper = mountWrapper(Preferred);
    await flushPromises();

    expect(wrapper.exists()).toBe(true);
    expect(wrapper).toBeDefined();
  });

  it("should call getPreferredCities", async () => {
    const wrapper = mountWrapper(Preferred);
    await flushPromises();

    expect(Object.keys(wrapper.vm.preferredCities).length).toBe(0);
  });

  it("should show 2 favorite city", async () => {
    citiesApi.getPreferredCities = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ data: [1, 2] }));

    citiesApi.getCity = jest.fn().mockImplementation(geonameid =>
      Promise.resolve({
        geonameid,
        name: `preferred_${geonameid}`,
        country: `country_${geonameid}`,
        subcountry: `subcountry_${geonameid}`
      })
    );

    const wrapper = mountWrapper(Preferred);
    await flushPromises();

    const preferredItems = wrapper.findAll(".preferred__item");
    expect(preferredItems.length).toBe(2);
    expect(Object.keys(wrapper.vm.preferredCities).length).toBe(2);
    expect(Object.keys(wrapper.vm.preferredCitiesLoading).length).toBe(2);
    expect(
      Object.values(wrapper.vm.preferredCitiesLoading).includes(true)
    ).toBe(false);
    expect(wrapper.vm.preferredCitiesWithError).toBe(null);
  });

  describe("Empty states", () => {
    it("should show empty state", async () => {
      citiesApi.getPreferredCities = jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve({ data: [] }));

      const wrapper = mountWrapper(Preferred);
      await flushPromises();

      const emptyState = wrapper.findComponent(EmptyState);
      expect(emptyState.exists()).toBe(true);
      const emptyStateParams = emptyState.attributes();
      expect(emptyStateParams.message).toBe(`You don't have favorite cities`);
      expect(emptyStateParams.icon).toBe(`el-icon-location-outline`);
    });

    it("should show empty state with error", async () => {
      citiesApi.getPreferredCities = jest
        .fn()
        .mockImplementation(() => Promise.reject("Network error"));

      const wrapper = mountWrapper(Preferred);
      jest.runAllTimers();
      await flushPromises();
      jest.runAllTimers();
      await flushPromises();
      jest.runAllTimers();
      await flushPromises();
      jest.runAllTimers();
      await flushPromises();

      const emptyState = wrapper.findComponent(EmptyState);
      expect(emptyState.exists()).toBe(true);
      const emptyStateParams = emptyState.attributes();
      expect(emptyStateParams.message).toBe(`Failed to load.`);
      expect(emptyStateParams.icon).toBe(`el-icon-warning`);
    });
  });

  describe("Reload failed", () => {
    it("should reload individual failed favorite", async () => {
      citiesApi.getPreferredCities = jest
        .fn()
        .mockImplementation(() => Promise.resolve({ data: [1, 2] }));

      citiesApi.getCity = jest.fn().mockImplementation(geonameid => {
        if (geonameid === 1)
          return Promise.resolve({
            geonameid,
            name: `preferred_${geonameid}`,
            country: `country_${geonameid}`,
            subcountry: `subcountry_${geonameid}`
          });

        return Promise.reject({});
      });

      const wrapper = mountWrapper(Preferred);
      await flushPromises();

      const preferredItems = wrapper.findAll(".preferred__item");
      expect(preferredItems.length).toBe(2);
      expect(wrapper.vm.preferredCitiesWithError.length).toBe(1);
      const headerIcons = wrapper.findAllComponents(Link);
      expect(headerIcons.length).toBe(2);
      expect(headerIcons.at(0).text()).toBe("Reload failed");

      citiesApi.getCity = jest.fn().mockImplementation(geonameid => {
        return Promise.resolve({
          geonameid,
          name: `preferred_${geonameid}`,
          country: `country_${geonameid}`,
          subcountry: `subcountry_${geonameid}`
        });
      });

      const failedItem = wrapper.findAll(".el-icon-warning");
      expect(failedItem.length).toBe(1);
      failedItem.at(0).trigger("click");
      await flushPromises();

      expect(wrapper.vm.preferredCitiesWithError).toBe(null);
    });

    it("should reload all failed favorite", async () => {
      citiesApi.getPreferredCities = jest
        .fn()
        .mockImplementation(() => Promise.resolve({ data: [1, 2, 3] }));

      citiesApi.getCity = jest.fn().mockImplementation(geonameid => {
        if (geonameid === 1)
          return Promise.resolve({
            geonameid,
            name: `preferred_${geonameid}`,
            country: `country_${geonameid}`,
            subcountry: `subcountry_${geonameid}`
          });

        return Promise.reject({});
      });

      const wrapper = mountWrapper(Preferred);
      await flushPromises();

      const preferredItems = wrapper.findAll(".preferred__item");
      expect(preferredItems.length).toBe(3);
      expect(wrapper.vm.preferredCitiesWithError.length).toBe(2);

      citiesApi.getCity = jest.fn().mockImplementation(geonameid => {
        return Promise.resolve({
          geonameid,
          name: `preferred_${geonameid}`,
          country: `country_${geonameid}`,
          subcountry: `subcountry_${geonameid}`
        });
      });

      const headerIcons = wrapper.findAllComponents(Link);
      expect(headerIcons.length).toBe(2);
      expect(headerIcons.at(0).text()).toBe("Reload failed");
      headerIcons.at(0).vm.$emit("click");
      await flushPromises();

      expect(wrapper.vm.preferredCitiesWithError).toBe(null);
    });
  });

  describe("Remove favorite", () => {
    it("should remove a favorite city", async () => {
      citiesApi.getPreferredCities = jest
        .fn()
        .mockImplementation(() => Promise.resolve({ data: [1, 2] }));

      citiesApi.getCity = jest.fn().mockImplementation(geonameid =>
        Promise.resolve({
          geonameid,
          name: `preferred_${geonameid}`,
          country: `country_${geonameid}`,
          subcountry: `subcountry_${geonameid}`
        })
      );

      const wrapper = mountWrapper(Preferred);
      await flushPromises();

      let preferredItems = wrapper.findAll(".preferred__item");
      expect(preferredItems.length).toBe(2);

      const firstDeleteIcon = wrapper.find(".el-icon-delete");
      expect(firstDeleteIcon.exists()).toBe(true);
      firstDeleteIcon.trigger("click");
      await flushPromises();

      preferredItems = wrapper.findAll(".preferred__item");
      expect(preferredItems.length).toBe(1);
    });

    it("should clear all favorites and show empty state", async () => {
      citiesApi.getPreferredCities = jest
        .fn()
        .mockImplementation(() => Promise.resolve({ data: [1, 2] }));

      citiesApi.getCity = jest.fn().mockImplementation(geonameid =>
        Promise.resolve({
          geonameid,
          name: `preferred_${geonameid}`,
          country: `country_${geonameid}`,
          subcountry: `subcountry_${geonameid}`
        })
      );

      const wrapper = mountWrapper(Preferred);
      await flushPromises();

      let preferredItems = wrapper.findAll(".preferred__item");
      expect(preferredItems.length).toBe(2);

      const headerIcons = wrapper.findAllComponents(Link);
      expect(headerIcons.length).toBe(2);
      expect(headerIcons.at(1).text()).toBe("Clear");
      headerIcons.at(1).vm.$emit("click");
      await flushPromises();

      preferredItems = wrapper.findAll(".preferred__item");
      expect(preferredItems.length).toBe(0);

      const emptyState = wrapper.findComponent(EmptyState);
      expect(emptyState.exists()).toBe(true);
      const emptyStateParams = emptyState.attributes();
      expect(emptyStateParams.message).toBe(`You don't have favorite cities`);
      expect(emptyStateParams.icon).toBe(`el-icon-location-outline`);
    });
  });
});
