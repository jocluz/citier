<template>
  <div class="infinite-scroll">
    <div v-for="(item, index) in items" :key="item[itemId] || index">
      <slot name="item" :item="item"></slot>
    </div>

    <div
      class="infinite-scroll__observe-visibility"
      v-if="items.length"
      v-observe-visibility="handleScrollToBottom"
    ></div>
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
    },
    itemId: {
      type: String,
      required: false,
      default: "id"
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

<style lang="scss" scoped>
.infinite-scroll {
  &__observe-visibility {
    min-height: 5px;
  }
}
</style>
