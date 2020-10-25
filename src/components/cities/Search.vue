<template>
  <div class="search">
    <div v-if="loading">Loading...</div>
    <div class="search__list">
      <InfiniteScroll :items="cities" @refetch="fetchCities">
        <template v-slot:item="{ item }">
          <div class="search__list__item">
            <div class="search__list__item__title">{{ item.name }}</div>
            <div class="search__list__item__desc">{{ item.subcountry }} - {{ item.country }}</div>
          </div>
        </template>
      </InfiniteScroll>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import InfiniteScroll from "../InfiniteScroll.vue";
import { mapGetters, mapActions } from "vuex";

export default Vue.extend({
  name: "Search",
  computed: {
    ...mapGetters("cities", ["cities"])
  },
  components: {
    InfiniteScroll
  },
  data() {
    return {
      loading: false
    };
  },
  created() {
    this.fetchCities();
  },
  methods: {
    ...mapActions("cities", ["getCities"]),
    async fetchCities() {
      if (this.loading) return;

      try {
        this.loading = true;
        await this.getCities();
        this.loading = false;
      } catch (error) {
        this.loading = false;
        console.log(error);
      }
    }
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
        color: #c0c4cc;
      }
    }
  }
}
</style>
