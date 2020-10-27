<template>
  <div class="preferred">
    <div
      v-for="item in items"
      :key="item[itemId]"
      class="preferred__item"
      :class="{
        saving: isSaving(item),
        loading: isLoading(item),
        error: withError(item)
      }"
    >
      <i v-if="isLoading(item)" class="el-icon-loading"></i>

      <i
        v-if="withError(item)"
        @click="$emit('errorClicked', item)"
        class="el-icon-warning"
      ></i>

      <div
        class="preferred__item__info"
        v-if="!isLoading(item) && !withError(item)"
      >
        <div class="info">
          <div class="info__title">
            {{ item.name }}
          </div>
          <div class="info__desc">
            {{ item.subcountry }} - {{ item.country }}
          </div>
        </div>
        <i
          :class="`el-icon-${isSaving(item) ? 'loading' : iconClass}`"
          @click="$emit('itemClicked', item)"
        ></i>
      </div>
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
      default: () => ({})
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
    saving: {
      type: Object,
      required: true
    },
    loading: {
      type: Object,
      required: true
    }
  },
  methods: {
    isSaving(item): boolean {
      return this.saving[item[this.itemId]];
    },
    isLoading(item): boolean {
      return this.loading[item[this.itemId]];
    },
    withError(item): boolean {
      return !this.isLoading(item) && !item.name;
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
  padding: 10px 10px 0 10px;
  -webkit-box-shadow: $main-shadow;
  -moz-box-shadow: $main-shadow;
  box-shadow: $main-shadow;

  &__item {
    display: flex;
    align-items: center;
    margin: 0 10px 10px 0;
    padding: 0.5rem;
    border-radius: 4px;
    background: $main-color;

    &__info {
      display: flex;
    }

    .el-icon-delete {
      cursor: pointer;
    }

    .el-icon-delete,
    .el-icon-loading {
      align-self: flex-start;
      color: white;
      font-size: 0.9rem;
      font-weight: 700;
      padding-top: 3px;
    }

    .info {
      margin-right: 10px;
      flex-grow: 1;
      color: white;

      &__title {
        font-size: 1rem;
        font-weight: 400;
      }

      &__desc {
        font-size: 0.8rem;
      }
    }

    &.saving {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.5;
    }

    &.loading {
      opacity: 0.5;

      .el-icon-loading {
        padding: 10px;
        font-size: 1.3rem;
        justify-content: center;
        display: flex;
      }
    }

    &.error {
      background: $error-color-light;
      -webkit-transition: all 0.5s linear;
      transition: all 0.5s linear;
      cursor: pointer;
      .el-icon-warning {
        padding: 10px;
        font-size: 1.3rem;
        color: $error-color;
        justify-content: center;
        display: flex;
      }
    }
  }
}
</style>
