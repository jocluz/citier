<template>
  <Section class="search-results" title="Search results">
    <template v-slot:header>
      <div class="search-info">{{ searchInformation }}</div>
    </template>

    <template v-slot:body>
      <infinite-scroll
        :items="cities"
        itemId="geonameid"
        v-if="hasItems"
        @refetch="loadMore"
      >
        <template v-slot:item="{ item }">
          <div
            class="search-results__item"
            @click="toggleCity(item)"
            :class="{
              saving: showSpinner(item),
              selected: isSelected(item)
            }"
          >
            <div class="info">
              <div class="info__title">
                <TextHighlight :queries="[search, search.trim()]">{{
                  item.name
                }}</TextHighlight>
              </div>
              <div class="info__desc">
                <TextHighlight :queries="[search, search.trim()]">
                  {{ item.subcountry }} - {{ item.country }}
                </TextHighlight>
              </div>
            </div>
            <i
              :class="`el-icon-${showSpinner(item) ? 'loading' : 'check'}`"
            ></i>
          </div>
        </template>
      </infinite-scroll>

      <EmptyState
        :icon="!cities ? 'el-icon-warning' : 'el-icon-search'"
        :message="!cities ? 'Failed to load.' : 'No results found'"
        :show-refresh="!cities"
        @refresh-clicked="$emit('search', search)"
        v-if="showEmptyState"
      />

      <div
        class="search-results__loading"
        element-loading-spinner="el-icon-loading"
        v-loading="loading"
      ></div>
    </template>
  </Section>
</template>

<script lang="ts">
import Vue from "vue";
import { mapGetters, mapActions } from "vuex";
import { CityInfo } from "../../store/modules/cities/types";
import Section from "../Section.vue";
import EmptyState from "../EmptyState.vue";
import InfiniteScroll from "../InfiniteScroll.vue";
import TextHighlight from "vue-text-highlight";

export default Vue.extend({
  name: "SearchResults",
  components: {
    Section,
    EmptyState,
    InfiniteScroll,
    TextHighlight
  },
  props: {
    loading: {
      type: Boolean
    },
    search: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      saving: {}
    };
  },
  computed: {
    ...mapGetters("cities", [
      "cities",
      "nextLink",
      "searchInformation",
      "preferredCities"
    ]),
    showEmptyState(): boolean {
      return (!this.cities || !this.cities.length) && !this.loading;
    },
    hasItems(): boolean {
      return !!(this.cities && this.cities.length);
    }
  },
  methods: {
    ...mapActions("cities", ["savePreferredCities"]),
    loadMore(): void {
      if (!this.nextLink || this.loading) return;
      this.$emit("search");
    },
    async toggleCity(city: CityInfo) {
      const selected =
        this.preferredCities && this.preferredCities[city.geonameid]
          ? false
          : true;
      try {
        this.$set(this.saving, city.geonameid, true);
        await this.savePreferredCities([{ city, selected }]);
        this.saving[city.geonameid] = false;
      } catch (error) {
        this.saving[city.geonameid] = false;
        this.$message.error({
          type: "error",
          message: `Failed to save ${city.name} (${city.country}). Please try again.`,
          duration: 5000
        });
      }
    },
    showSpinner(item): boolean {
      return this.saving[item.geonameid];
    },
    isSelected(item): boolean {
      return !!(this.preferredCities && this.preferredCities[item.geonameid]);
    }
  }
});
</script>

<style scoped lang="scss">
$text-highlight-color: #c0c4cc38;

.search-results {
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  &__item {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 1rem;
    -webkit-box-shadow: $main-shadow;
    -moz-box-shadow: $main-shadow;
    box-shadow: $main-shadow;
    background-color: transparent;

    .info {
      flex-grow: 1;
      &__title {
        font-size: 1.2rem;
        font-weight: 400;
        color: $main-color;
      }

      &__desc {
        color: $text-color;
      }
    }

    @include md {
      &:hover {
        background-color: $secondary-color;
        -webkit-transition: all 0.5s linear;
        transition: all 0.5s linear;
        .el-icon-check {
          color: $main-color;
        }
      }
    }

    &.saving {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.5;
    }

    &.selected {
      .el-icon-check {
        color: $main-color;
      }
    }

    .el-icon-check {
      color: transparent;
    }
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
}

::v-deep .text__highlight {
  background: $text-highlight-color;
  font-weight: 700;
  color: inherit;
}

.search-info {
  font-size: 0.8rem;
  padding-left: 10px;
}
</style>
