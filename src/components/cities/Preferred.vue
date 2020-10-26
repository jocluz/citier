<template>
  <div class="preferred">
    <div
      v-for="item in items"
      :key="item[itemId]"
      class="preferred__item"
      @click="$emit('itemClicked', item)"
      :class="{
        saving: showSpinner(item)
      }"
    >
      <div class="info">
        <div class="info__title">
          {{ item.name }}
        </div>
        <div class="info__desc">{{ item.subcountry }} - {{ item.country }}</div>
      </div>
      <i :class="`el-icon-${showSpinner(item) ? 'loading' : iconClass}`"></i>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "Preferred",
  props: {
    items: {
      type: Object,
      required: true
    },
    itemId: {
      type: String,
      required: false,
      default: "id"
    },
    iconClass: {
      type: String,
      default: "delete"
    },
    loading: {
      type: Object,
      required: true
    }
  },
  methods: {
    showSpinner(item): boolean {
      return this.loading[item[this.itemId]];
    }
  }
});
</script>

<style scoped lang="scss">
.preferred {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  padding: 10px;

  &__item {
    display: flex;
    align-items: center;
    margin: 0 10px 10px 0;
    padding: 0.5rem;
    border-radius: 4px;
    background: #edffb8;

    .el-icon-delete,
    .el-icon-loading {
      align-self: flex-start;
      color: #009898;
      font-size: 0.9rem;
      font-weight: 700;
      padding-top: 3px;
    }

    .info {
      margin-right: 10px;
      flex-grow: 1;

      &__title {
        font-size: 1rem;
        font-weight: 400;
        color: #009898;
      }

      &__desc {
        font-size: 0.8rem;
        color: #98b3b3;
      }
    }

    &.saving {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.5;
    }
  }
}
</style>
