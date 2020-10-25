<template>
  <div class="home">
    <Search />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Search from "@/components/cities/Search.vue";

export default Vue.extend({
  name: "Home",
  components: {
    Search
  }
});
</script>

<style lang="scss" scoped>
.home {
  display: flex;
  flex-grow: 1;
}
</style>
