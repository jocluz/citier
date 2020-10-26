<template>
  <div class="search">
    <!-- INPUT TO SEARCH CITIES -->
    <el-input
      suffix-icon="el-icon-search"
      class="search__input"
      v-model="search"
      placeholder="Search a city"
      @input="filterCities"
    >
    </el-input>

    <el-card class="box-card search__list">
      <!-- PREFERRED CITIES -->
      <i
        v-if="preferredCitiesWithError"
        class="el-icon-warning warning-icon"
        @click="refetchPreferred"
      ></i>
      <Preferred
        v-if="!loading"
        v-loading="loadingPreferred"
        element-loading-spinner="el-icon-loading"
        :loading="saving"
        :items="preferredCities"
        itemId="geonameid"
        @itemClicked="saveCity($event, false)"
      />

      <!-- CITIES LIST WITH LAZY LOADING -->
      <SearchResults
        :loading="saving"
        :items="cities"
        :selectedItems="preferredCities"
        :highlight="search"
        itemId="geonameid"
        @loadMore="loadMore"
        @itemClicked="toggleCity($event)"
      />

      <EmptyState v-if="showEmptyState" />

      <div
        class="search__loading"
        element-loading-spinner="el-icon-loading"
        v-loading="isLoadingData"
      ></div>
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
      "preferredCitiesWithError"
    ]),
    showEmptyState(): boolean {
      return !this.cities.length && !this.loading;
    },
    isLoadingData(): boolean {
      return this.loading || this.loadingPreferred;
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
      "reloadFailedPreferred"
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
            message: `Failed to load cities: ${error.response.data.message}`
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
            message: `Failed to load preferred cities: ${error.response.data.message}`
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
      const selected = this.preferredCities[city.geonameid] ? false : true;
      this.saveCity(city, selected);
    },
    async saveCity(city: CityInfo, selected: boolean) {
      const geonameid = city.geonameid;
      try {
        this.$set(this.saving, geonameid, true);
        await this.savePreferredCities({ city, selected });
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
        this.reloadFailedPreferred();
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
  display: flex;
  flex-direction: column;
  max-width: 500px;

  &__input {
    margin-bottom: 10px;
    border-radius: 4px;
    font-size: 1.2rem;
    box-shadow: 0 1px 12px 0 rgba(0, 0, 0, 0.1);
  }

  &__list {
    overflow-y: auto;
    flex-grow: 1;

    &__item,
    &__preferred__item {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 1rem;
      -webkit-box-shadow: 0 10px 6px -6px #7777770d;
      -moz-box-shadow: 0 10px 6px -6px #7777770d;
      box-shadow: 0 10px 6px -6px #7777770d;

      &__info {
        flex-grow: 1;
        &__title {
          font-size: 1.4rem;
          font-weight: 400;
          color: #009898;
        }

        &__desc {
          color: #98b3b3;
        }
      }

      &:hover {
        background-color: #edffb8;
        -webkit-transition: all 0.5s linear;
        transition: all 0.5s linear;

        .el-icon-check {
          color: #009898;
          -webkit-transition: all 0.5s linear;
          transition: all 0.5s linear;
        }
      }

      &.selected {
        background: #edffb8;

        .el-icon-delete-solid,
        .el-icon-loading {
          align-self: flex-start;
          color: #009898;
          font-size: 1rem;
        }
      }

      &.saving {
        cursor: not-allowed;
        pointer-events: none;
        opacity: 0.5;
      }

      .el-icon-loading {
        color: #009898;
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
          color: #009898;
        }

        &__desc {
          font-size: 0.8rem;
          color: #98b3b3;
        }
      }
    }
  }

  &__empty-state {
    display: flex;
    justify-content: center;
    padding: 50px;
    flex-direction: column;
    align-items: center;
    font-size: 1.2rem;
    font-weight: 600;
    color: #009898;
    opacity: 0.8;

    .el-icon-search {
      display: flex;
      font-weight: 800;
      font-size: 2rem;
      padding-bottom: 10px;
      opacity: 0.8;
    }
  }

  &__loading {
    position: absolute !important;
    bottom: 50px;
    left: 0;
    right: 0;
  }

  .warning-icon {
    position: absolute;
    right: 5px;
    top: 10px;
    font-size: 1.3rem;
    color: #ff2929;
    cursor: pointer;
  }

  ::v-deep .el-loading-spinner i {
    font-size: 2rem;
    color: #009898;
    font-weight: 700;
  }

  ::v-deep .el-card__body {
    position: relative;
    min-height: 200px;
    padding: 0;
  }

  ::v-deep .el-loading-mask {
    height: 4rem;
    position: absolute !important;
    bottom: 0;
    left: 0;
    right: 0;
  }

  ::v-deep .text__highlight {
    background: #c0c4cc38;
    font-weight: 700;
    color: inherit;
  }

  ::v-deep .el-input__inner {
    border: 1px solid #ebeef5;
  }
}
</style>
