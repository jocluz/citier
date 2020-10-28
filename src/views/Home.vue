<template>
  <div class="home">
    <Search />
    <PreferredLocation class="preferred-location" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Search from "@/components/cities/Search.vue";
import PreferredLocation from "@/components/cities/PreferredLocation.vue";

export default Vue.extend({
  name: "Home",
  components: {
    Search,
    PreferredLocation
  }
});
</script>

<style lang="scss" scoped>
.home {
  display: flex;
  flex-grow: 1;

  .preferred-location {
    display: none;
  }

  @include md {
    .preferred-location {
      display: block;
    }
    .search {
      min-width: 400px;
      max-width: 400px;
    }
  }
}
</style>
