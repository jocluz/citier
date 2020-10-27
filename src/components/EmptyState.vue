<template functional>
  <div class="empty-state">
    <i :class="`${props.icon}`"></i>

    {{ props.message }}

    <el-link
      type="primary"
      v-if="props.showRefresh"
      @click="
        listeners['refresh-clicked'] ? listeners['refresh-clicked']() : null
      "
    >
      Refresh
    </el-link>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "EmptyState",
  props: {
    icon: {
      type: String,
      required: false,
      default: "el-icon-search"
    },
    message: {
      type: String,
      required: false,
      default: "No results found"
    },
    showRefresh: {
      type: Boolean,
      required: false
    }
  }
});
</script>

<style lang="scss">
.empty-state {
  $empty-state-text-color: #c2c2c2;
  display: flex;
  justify-content: center;
  padding: 20px;
  flex-direction: column;
  align-items: center;
  font-size: 1.2rem;
  font-weight: 600;
  color: $empty-state-text-color;
  opacity: 0.8;

  [class^="el-icon"] {
    display: flex;
    font-size: 2rem;
    padding-bottom: 10px;
    opacity: 0.8;
  }
}
</style>
