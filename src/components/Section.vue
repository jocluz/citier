<template>
  <div class="section">
    <div class="section__header">
      <div class="section__header__title">{{ title }}</div>
      <slot name="header"></slot>
    </div>

    <slot name="body"></slot>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "Section",
  props: {
    title: {
      type: String,
      default: ""
    }
  }
});
</script>

<style scoped lang="scss">
.section__header {
  display: flex;
  align-items: center;
  background: $secondary-color;
  padding: 5px 10px;
  color: $main-color;
  box-shadow: $main-shadow;
}
</style>
