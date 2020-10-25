<template>
  <div>
    <div v-for="(item, index) in items" :key="index">
      <slot name="item" :item="item"></slot>
    </div>

    <div v-if="items.length" v-observe-visibility="handleScrollToBottom"></div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { ObserveVisibility } from "vue-observe-visibility";

export default Vue.extend({
  name: "InfiniteScroll",
  props: {
    items: {
      required: true,
      type: Array,
      default: () => []
    }
  },
  directives: {
    ObserveVisibility
  },
  methods: {
    handleScrollToBottom(isVisible: boolean): void {
      if (!isVisible) return;
      this.$emit("refetch");
    }
  }
});
</script>
