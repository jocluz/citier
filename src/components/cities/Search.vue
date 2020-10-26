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

    <!-- CITIES LIST WITH LAZY LOADING -->
    <el-card class="box-card search__list">
      <div class="search__list__preferred" v-if="!loading">
        <div
          v-for="item in preferredCities"
          :key="item.geonameid"
          class="search__list__preferred__item selected"
          @click="saveCity(item, false)"
          :class="{
            saving: isSaving(item)
          }"
        >
          <div class="search__list__item__info">
            <div class="search__list__item__info__title">
              {{ item.name }}
            </div>
            <div class="search__list__item__info__desc">
              {{ item.subcountry }} - {{ item.country }}
            </div>
          </div>
          <i
            :class="`el-icon-${isSaving(item) ? 'loading' : 'delete-solid'}`"
          ></i>
        </div>
      </div>

      <infinite-scroll :items="cities" itemId="geonameid" @refetch="loadMore">
        <template v-slot:item="{ item }">
          <div
            class="search__list__item"
            @click="saveCity(item, true)"
            v-if="!isCityPreferred(item.geonameid)"
            :class="{
              saving: isSaving(item)
            }"
          >
            <div class="search__list__item__info">
              <div class="search__list__item__info__title">
                <TextHighlight :queries="[search]">{{
                  item.name
                }}</TextHighlight>
              </div>
              <div class="search__list__item__info__desc">
                <TextHighlight :queries="[search]">
                  {{ item.subcountry }} - {{ item.country }}
                </TextHighlight>
              </div>
            </div>
            <i :class="`el-icon-${isSaving(item) ? 'loading' : 'check'}`"></i>
          </div>
        </template>
      </infinite-scroll>

      <div class="search__empty-state" v-if="showEmptyState">
        <i class="el-icon-search"></i>

        No results found
      </div>

      <div
        class="search__loading"
        element-loading-spinner="el-icon-loading"
        v-if="loading"
        v-loading="loading"
      ></div>
    </el-card>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapActions, mapGetters, mapMutations } from "vuex";
import InfiniteScroll from "../InfiniteScroll.vue";
import debounce from "lodash.debounce";
import TextHighlight from "vue-text-highlight";
import { CityInfo } from "../../store/modules/cities/types";

const MAX_RETRIES = 3;

export default Vue.extend({
  name: "Search",
  components: {
    InfiniteScroll,
    TextHighlight
  },
  data() {
    return {
      loading: false,
      loadingPreferredCities: false,
      saving: {},
      retries: MAX_RETRIES,
      search: ""
    };
  },
  computed: {
    ...mapGetters("cities", [
      "cities",
      "nextLink",
      "preferredCities",
      "isCityPreferred"
    ]),
    showEmptyState(): boolean {
      return !this.cities.length && !this.loading;
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
      "savePreferredCities"
    ]),
    ...mapMutations("cities", ["clearCities"]),
    async fetchCities(filter = "") {
      try {
        this.loading = true;
        await this.getCities(filter);
        this.retries = MAX_RETRIES;
        this.loading = false;
      } catch (error) {
        if (this.retries) {
          this.retries--;
          setTimeout(() => {
            this.fetchCities(filter);
          }, 1000);
        } else {
          this.loading = false;
          this.$message.error({
            type: "error",
            message: error.response.data.message
          });
        }
      }
    },
    async fetchPreferredCities() {
      try {
        this.loadingPreferredCities = true;
        await this.getPreferredCities();
        this.loadingPreferredCities = false;
      } catch (error) {
        this.loadingPreferredCities = false;
        this.$message.error({
          type: "error",
          message: error.response.data.message
        });
      }
    },
    loadMore(): void {
      if (!this.nextLink || this.loading) return;
      this.fetchCities(this.search);
    },
    filterCities: debounce(function(this: any, search: string): void {
      this.clearCities();
      this.fetchCities(search);
    }, 500),
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
