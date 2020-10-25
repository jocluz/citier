<template>
  <div class="search">
    <!-- INPUT TO SEARCH CITIES -->
    <el-input
      suffix-icon="el-icon-search"
      class="search__input"
      v-model="search"
      placeholder="Search a city"
      @input="filterCities"
    ></el-input>

    <!-- CITIES LIST WITH LAZY LOADING -->
    <el-card class="box-card search__list">
      <infinite-scroll :items="cities" @refetch="loadMore">
        <template v-slot:item="{ item }">
          <div class="search__list__item">
            <div class="search__list__item__title">
              <TextHighlight :queries="[search]">{{ item.name }}</TextHighlight>
            </div>
            <div class="search__list__item__desc">
              <TextHighlight :queries="[search]">{{ item.subcountry }} - {{ item.country }}</TextHighlight>
            </div>
          </div>
        </template>
      </infinite-scroll>

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

const MAX_RETRIES = 3;

export default Vue.extend({
  name: "Search",
  components: {
    InfiniteScroll,
    TextHighlight
  },
  computed: {
    ...mapGetters("cities", ["cities", "nextLink"])
  },
  data() {
    return {
      loading: false,
      retries: MAX_RETRIES,
      search: ""
    };
  },
  created() {
    this.fetchCities();
  },
  methods: {
    ...mapActions("cities", ["getCities"]),
    ...mapMutations("cities", ["clearCities"]),
    async fetchCities(filter = "") {
      try {
        this.loading = true;
        await this.getCities(filter);
        this.retries = MAX_RETRIES;
        this.loading = false;
      } catch (error) {
        this.loading = false;
        if (this.retries) {
          this.retries--;
          setTimeout(() => {
            this.fetchCities(filter);
          }, 1000);
        } else {
          this.$message.error({
            type: "error",
            message: error.response.data.message
          });
        }
      }
    },
    loadMore() {
      if (!this.nextLink || this.loading) return;
      this.fetchCities(this.search);
    },
    filterCities: debounce(function(search) {
      this.clearCities();
      this.fetchCities(search);
    }, 500)
  }
});
</script>

<style scoped lang="scss">
.search {
  display: flex;
  flex-direction: column;

  &__list {
    min-width: 400px;
    overflow-y: auto;
    flex-grow: 1;

    &__item {
      cursor: pointer;
      padding: 1rem;
      -webkit-box-shadow: 0 10px 6px -6px #7777770d;
      -moz-box-shadow: 0 10px 6px -6px #7777770d;
      box-shadow: 0 10px 6px -6px #7777770d;

      &__title {
        font-size: 1.4rem;
        font-weight: 400;
        color: #009898;
      }

      &__desc {
        color: #98b3b3;
      }

      &:hover {
        background-color: #b5ab621a;
        -webkit-transition: all 0.5s linear;
        transition: all 0.5s linear;
      }
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
}
</style>
