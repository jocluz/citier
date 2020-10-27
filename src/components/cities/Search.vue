<template>
  <div class="search">
    <!-- INPUT TO SEARCH CITIES -->
    <el-input
      suffix-icon="el-icon-search"
      class="search__input"
      v-model="search"
      clearable
      autofocus
      placeholder="Search a city"
      @input="filterCities"
      @change="filterCities(search)"
    >
    </el-input>

    <el-card class="box-card search__list">
      <div>
        <!-- PREFERRED CITIES -->
        <div class="section-header">
          <div class="section-header__title">Your favorites cities</div>
          <div v-if="!loadingPreferred">
            <el-link
              v-show="preferredCitiesWithError"
              class="refresh-preferred"
              type="danger"
              @click="refetchPreferred"
            >
              Reload failed
            </el-link>
            <el-link
              v-show="hasPreferredCities"
              type="primary"
              @click="resetPreferred"
            >
              Clear
            </el-link>
          </div>
        </div>

        <Preferred
          :saving="saving"
          v-loading="loadingPreferred"
          class="search__preferred__loading"
          element-loading-spinner="el-icon-loading"
          :loading="preferredCitiesLoading"
          :items="preferredCities"
          itemId="geonameid"
          @itemClicked="saveCity($event, false)"
          @errorClicked="refetchPreferredCity"
        />

        <EmptyState
          :icon="
            !preferredCities ? 'el-icon-warning' : 'el-icon-location-outline'
          "
          :message="
            !preferredCities
              ? 'Failed to load.'
              : `You don't have any favourite city`
          "
          :show-refresh="!preferredCities"
          @refresh-clicked="fetchPreferredCities"
          v-if="showPreferredEmptyState"
        />
      </div>

      <div class="search__results">
        <!-- CITIES LIST WITH LAZY LOADING -->
        <div class="section-header">
          <div>Search results</div>
          <div class="search-info">{{ searchInformation }}</div>
        </div>

        <SearchResults
          v-if="hasCities"
          :loading="saving"
          :items="cities"
          :selectedItems="preferredCities"
          :highlight="search"
          itemId="geonameid"
          @loadMore="loadMore"
          @itemClicked="toggleCity($event)"
        />

        <EmptyState
          :icon="!cities ? 'el-icon-warning' : 'el-icon-search'"
          :message="!cities ? 'Failed to load.' : 'No results found'"
          :show-refresh="!cities"
          @refresh-clicked="filterCities(search)"
          v-if="showSearchEmptyState"
        />

        <div
          class="search__loading"
          element-loading-spinner="el-icon-loading"
          v-loading="loading"
        ></div>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import debounce from "lodash.debounce";
import { mapActions, mapGetters, mapMutations } from "vuex";
import { CityInfo } from "../../store/modules/cities/types";
import Preferred from "./Preferred.vue";
import SearchResults from "./SearchResults.vue";
import EmptyState from "./EmptyState.vue";
import { MAX_RETRIES, RETRY_TIMEOUT, SEARCH_DEBOUNCE_TIME } from "./model";

export default Vue.extend({
  name: "Search",
  components: {
    Preferred,
    SearchResults,
    EmptyState
  },
  data() {
    return {
      loading: false,
      loadingPreferred: false,
      saving: {},
      citiesRetry: MAX_RETRIES,
      preferredRetry: MAX_RETRIES,
      search: ""
    };
  },
  computed: {
    ...mapGetters("cities", [
      "cities",
      "nextLink",
      "preferredCities",
      "preferredCitiesWithError",
      "preferredCitiesLoading",
      "searchInformation"
    ]),
    showSearchEmptyState(): boolean {
      return (!this.cities || !this.cities.length) && !this.loading;
    },
    showPreferredEmptyState(): boolean {
      return !this.hasPreferredCities && !this.loadingPreferred;
    },
    hasPreferredCities(): boolean {
      return this.preferredCities && !!Object.keys(this.preferredCities).length;
    },
    hasCities(): boolean {
      return this.cities && this.cities.length;
    }
  },
  created() {
    this.fetchPreferredCities();
    this.fetchCities();
  },
  methods: {
    ...mapActions("cities", [
      "getCities",
      "getPreferredCities",
      "savePreferredCities",
      "resetPreferredCities",
      "reloadFailedPreferred",
      "getCityInfo"
    ]),
    ...mapMutations("cities", ["clearCities"]),
    async fetchCities(filter = "") {
      try {
        this.loading = true;
        const { canceled } = await this.getCities(filter);
        this.citiesRetry = MAX_RETRIES;
        if (!canceled) {
          this.loading = false;
        }
      } catch (error) {
        if (this.citiesRetry) {
          this.citiesRetry--;
          setTimeout(() => {
            this.fetchCities(filter);
          }, RETRY_TIMEOUT);
        } else {
          this.loading = false;
          this.$message.error({
            type: "error",
            message: `Failed to load cities. Please try again.`
          });
        }
      }
    },
    async fetchPreferredCities() {
      try {
        this.loadingPreferred = true;
        const { canceled } = await this.getPreferredCities();
        this.preferredRetry = MAX_RETRIES;
        if (!canceled) {
          this.loadingPreferred = false;
        }
      } catch (error) {
        if (this.preferredRetry) {
          this.preferredRetry--;
          setTimeout(() => {
            this.fetchPreferredCities();
          }, RETRY_TIMEOUT);
        } else {
          this.loadingPreferred = false;
          this.$message.error({
            type: "error",
            message: `Failed to load preferred cities. Please try again.`
          });
        }
      }
    },
    loadMore(): void {
      if (!this.nextLink || this.loading) return;
      this.fetchCities(this.search);
    },
    filterCities: debounce(
      function(this: any, search: string): void {
        this.clearCities();
        this.fetchCities(search);
      },
      SEARCH_DEBOUNCE_TIME,
      { leading: true }
    ),
    toggleCity(city: CityInfo): void {
      const selected =
        this.preferredCities && this.preferredCities[city.geonameid]
          ? false
          : true;
      this.saveCity(city, selected);
    },
    async saveCity(city: CityInfo, selected: boolean) {
      const geonameid = city.geonameid;
      try {
        this.$set(this.saving, geonameid, true);
        await this.savePreferredCities([{ city, selected }]);
        this.saving[geonameid] = false;
      } catch (error) {
        this.saving[geonameid] = false;
        this.$message.error({
          type: "error",
          message: `Failed to save ${city.name} (${city.country}). Please try again.`,
          duration: 5000
        });
      }
    },
    refetchPreferred(): void {
      if (this.preferredCitiesWithError) {
        this.reloadFailedPreferred().catch(() => {
          this.$message.error({
            type: "error",
            message: `Failed to reload. Please try again.`
          });
        });
      }
    },
    refetchPreferredCity(city: CityInfo): void {
      if (!city) return;
      this.getCityInfo([city.geonameid]).catch(() => {
        this.$message.error({
          type: "error",
          message: `Failed to load ${city.name} (${city.country}) information. Please try again.`
        });
      });
    },
    async resetPreferred() {
      try {
        this.loadingPreferred = true;
        await this.resetPreferredCities();
        this.loadingPreferred = false;
      } catch (error) {
        this.loadingPreferred = false;
        this.$message.error({
          type: "error",
          message: `Failed to clear your favourite cities. Please try again.`
        });
      }
    },
    isSaving(city: CityInfo): boolean {
      return this.saving[city.geonameid];
    }
  }
});
</script>

<style scoped lang="scss">
.search {
  $text-highlight-color: #c0c4cc38;
  $input-shadow: 0 1px 12px 0 rgba(0, 0, 0, 0.1);
  $input-border-color: #ebeef5;
  display: flex;
  flex-direction: column;
  max-width: 500px;

  &__input {
    margin-bottom: 10px;
    border-radius: 4px;
    font-size: 1.2rem;
    box-shadow: $input-shadow;
  }

  &__list {
    display: flex;
    flex-grow: 1;

    .section-header {
      display: flex;
      align-items: center;
      background: $secondary-color;
      padding: 5px 10px;
      color: $main-color;
      box-shadow: $main-shadow;

      .el-link {
        margin: 0 10px;
        padding: 0;
      }

      .refresh-preferred {
        color: $error-color;
      }

      .search-info {
        font-size: 0.8rem;
        padding-left: 10px;
      }

      &__title {
        flex-grow: 1;
      }
    }

    &__item,
    &__preferred__item {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 1rem;
      -webkit-box-shadow: $main-shadow;
      -moz-box-shadow: $main-shadow;
      box-shadow: $main-shadow;

      &__info {
        flex-grow: 1;
        &__title {
          font-size: 1.4rem;
          font-weight: 400;
          color: $main-color;
        }

        &__desc {
          color: $text-color;
        }
      }

      &:hover {
        background-color: $secondary-color;
        -webkit-transition: all 0.5s linear;
        transition: all 0.5s linear;

        .el-icon-check {
          color: $main-color;
          -webkit-transition: all 0.5s linear;
          transition: all 0.5s linear;
        }
      }

      &.saving {
        cursor: not-allowed;
        pointer-events: none;
        opacity: 0.5;
      }

      .el-icon-loading {
        color: $main-color;
      }

      .el-icon-check {
        color: transparent;
      }

      .el-icon-check,
      .el-icon-loading {
        font-weight: 700;
        font-size: 1.5rem;
      }
    }

    &__item {
      &.selected {
        display: none;
      }
    }

    &__preferred {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      padding: 10px;
    }

    &__preferred__item {
      margin: 0 10px 10px 0;
      padding: 0.5rem;
      border-radius: 4px;

      .search__list__item__info {
        flex-grow: 1;
        &__title {
          font-size: 1rem;
          font-weight: 400;
          color: $main-color;
        }

        &__desc {
          font-size: 0.8rem;
          color: $text-color;
        }
      }
    }
  }

  &__results {
    overflow-y: hidden;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  &__empty-state {
    display: flex;
    justify-content: center;
    padding: 50px;
    flex-direction: column;
    align-items: center;
    font-size: 1.2rem;
    font-weight: 600;
    color: $main-color;
    opacity: 0.8;

    .el-icon-search {
      display: flex;
      font-weight: 800;
      font-size: 2rem;
      padding-bottom: 10px;
      opacity: 0.8;
    }
  }

  .preferred.el-loading-parent--relative {
    min-height: 50px;
  }

  &__loading {
    position: sticky !important;
    bottom: 50px;
    left: 0;
    right: 0;

    ::v-deep .el-loading-mask {
      height: 4rem;
      position: absolute !important;
      bottom: 0;
      left: 0;
      right: 0;
    }
  }

  .refresh-icon {
    font-size: 1rem;
    color: $error-color;
    cursor: pointer;
    padding-left: 10px;
    justify-content: flex-end;
    display: flex;
    flex-grow: 1;
    align-self: center;
  }

  ::v-deep .el-loading-spinner i {
    font-size: 2rem;
    color: $main-color;
    font-weight: 700;
  }

  ::v-deep .el-card__body {
    position: relative;
    min-height: 200px;
    padding: 0;

    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  ::v-deep .text__highlight {
    background: $text-highlight-color;
    font-weight: 700;
    color: inherit;
  }

  ::v-deep .el-input__inner {
    border: 1px solid $input-border-color;
  }
}
</style>
