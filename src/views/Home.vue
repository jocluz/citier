<template>
  <div class="home">
    <Search />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Search from "@/components/Search.vue";

export default Vue.extend({
  name: "Home",
  components: {
    Search
  }
});
</script>
