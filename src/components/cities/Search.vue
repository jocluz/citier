<template>
  <div class="search">
    <DebounceSearchInput v-model="search" @search="doSearch" />

    <el-card class="box-card results__card">
      <!-- Favorite cities -->
      <Preferred />

      <!-- Search results with infinite scroll -->
      <SearchResults
        :loading="loading"
        :search="search"
        @search="fetchCities(search)"
      />
    </el-card>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapActions, mapMutations } from "vuex";
import DebounceSearchInput from "../DebounceSearchInput.vue";
import Preferred from "./Preferred.vue";
import SearchResults from "./SearchResults.vue";
import { fetchWithRetry } from "./model";

export default Vue.extend({
  name: "Search",
  components: {
    DebounceSearchInput,
    Preferred,
    SearchResults
  },
  data() {
    return {
      loading: false,
      search: ""
    };
  },
  created() {
    this.fetchCities();
  },
  methods: {
    ...mapActions("cities", ["getCities"]),
    ...mapMutations("cities", ["clearCities"]),
    doSearch(search: string): void {
      this.clearCities();
      this.fetchCities(search);
    },
    async fetchCities(filter = "") {
      this.loading = true;
      await fetchWithRetry(this.getCities, filter)
        .then(response => {
          if (!response.canceled) {
            this.loading = false;
          }
        })
        .catch(() => {
          this.loading = false;
          this.$message.error({
            type: "error",
            message: `Failed to load cities. Please try again.`
          });
        });
    }
  }
});
</script>

<style scoped lang="scss">
.search {
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  .results__card {
    flex-grow: 1;
    display: flex;
  }

  ::v-deep .el-card__body {
    position: relative;
    min-height: 200px;
    padding: 0;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  ::v-deep .el-icon-check,
  ::v-deep .el-icon-loading {
    font-weight: 700;
    font-size: 1.5rem;
  }

  ::v-deep .el-icon-loading {
    color: $main-color;
  }
}
</style>
