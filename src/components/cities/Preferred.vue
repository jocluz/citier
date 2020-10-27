<template>
  <Section title="Your favorites cities">
    <template v-slot:header>
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
    </template>

    <template v-slot:body>
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

      <div
        v-else
        class="preferred search__preferred__loading"
        v-loading="loadingPreferred"
        element-loading-spinner="el-icon-loading"
      >
        <div
          v-for="item in preferredCities"
          :key="item.geonameid"
          class="preferred__item"
          :class="{
            saving: isSaving(item),
            loading: isLoading(item),
            error: withError(item)
          }"
        >
          <i v-if="isLoading(item)" class="el-icon-loading"></i>

          <i
            v-if="withError(item)"
            @click="refetchPreferredCity(item)"
            class="el-icon-warning"
          ></i>

          <div
            class="preferred__item__info"
            v-if="!isLoading(item) && !withError(item)"
          >
            <div class="info">
              <div class="info__title">
                {{ item.name }}
              </div>
              <div class="info__desc">
                {{ item.subcountry }} - {{ item.country }}
              </div>
            </div>
            <i
              :class="`el-icon-${isSaving(item) ? 'loading' : 'delete'}`"
              @click="saveCity(item, false)"
            ></i>
          </div>
        </div>
      </div>
    </template>
  </Section>
</template>

<script lang="ts">
import Vue from "vue";
import { mapGetters, mapActions } from "vuex";
import Section from "../Section.vue";
import EmptyState from "../EmptyState.vue";
import { CityInfo } from "../../store/modules/cities/types";
import { fetchWithRetry } from "./model";

export default Vue.extend({
  name: "Preferred",
  components: {
    EmptyState,
    Section
  },
  data() {
    return {
      saving: {},
      loadingPreferred: false
    };
  },
  created() {
    this.fetchPreferredCities();
  },
  computed: {
    ...mapGetters("cities", [
      "preferredCities",
      "preferredCitiesWithError",
      "preferredCitiesLoading"
    ]),
    hasPreferredCities(): boolean {
      return this.preferredCities && !!Object.keys(this.preferredCities).length;
    },
    showPreferredEmptyState(): boolean {
      return !this.hasPreferredCities && !this.loadingPreferred;
    }
  },
  methods: {
    ...mapActions("cities", [
      "savePreferredCities",
      "getPreferredCities",
      "resetPreferredCities",
      "reloadFailedPreferred",
      "getCityInfo"
    ]),
    async fetchPreferredCities() {
      try {
        this.loadingPreferred = true;
        const response = await fetchWithRetry(this.getPreferredCities);
        if (!response.canceled) {
          this.loadingPreferred = false;
        }
      } catch (error) {
        this.loadingPreferred = false;
        this.$message.error({
          type: "error",
          message: `Failed to load preferred cities. Please try again.`
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
    isSaving(item): boolean {
      return this.saving[item.geonameid];
    },
    isLoading(item): boolean {
      return this.preferredCitiesLoading[item.geonameid];
    },
    withError(item): boolean {
      return !this.isLoading(item) && !item.name;
    }
  }
});
</script>

<style scoped lang="scss">
.preferred {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  padding: 10px 10px 0 10px;
  -webkit-box-shadow: $main-shadow;
  -moz-box-shadow: $main-shadow;
  box-shadow: $main-shadow;

  max-height: 200px;
  overflow-y: auto;

  @include md {
    max-height: unset;
    overflow: hidden;
  }

  &__item {
    display: flex;
    align-items: center;
    margin: 0 10px 10px 0;
    padding: 0.5rem;
    border-radius: 4px;
    background: $main-color;

    &__info {
      display: flex;
    }

    .el-icon-delete {
      cursor: pointer;
    }

    .el-icon-delete,
    .el-icon-loading {
      align-self: flex-start;
      color: white;
      font-size: 0.9rem;
      font-weight: 700;
      padding-top: 3px;
    }

    .info {
      margin-right: 10px;
      flex-grow: 1;
      color: white;

      &__title {
        font-size: 1rem;
        font-weight: 400;
      }

      &__desc {
        font-size: 0.8rem;
      }
    }

    &.saving {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.5;

      .el-icon-loading {
        align-self: flex-start;
        color: white;
        font-size: 0.9rem;
        font-weight: 700;
        padding-top: 3px;
      }
    }

    &.loading {
      opacity: 0.5;

      .el-icon-loading {
        padding: 10px;
        font-size: 1.3rem;
        justify-content: center;
        display: flex;
        color: white;
      }
    }

    &.error {
      background: $error-color-light;
      cursor: pointer;
      .el-icon-warning {
        padding: 10px;
        font-size: 1.3rem;
        color: $error-color;
        justify-content: center;
        display: flex;
      }
    }
  }
}

.el-link {
  margin: 0 10px;
  padding: 0;
}

.refresh-preferred {
  color: $error-color;
}

::v-deep .section__header__title {
  flex-grow: 1;
}

.preferred.el-loading-parent--relative {
  min-height: 50px;
}
</style>
