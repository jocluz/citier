<template>
  <infinite-scroll :items="items" :itemId="itemId" @refetch="$emit('loadMore')">
    <template v-slot:item="{ item }">
      <div
        class="search-results__item"
        @click="$emit('itemClicked', item)"
        :class="{
          saving: showSpinner(item),
          selected: isSelected(item)
        }"
      >
        <div class="info">
          <div class="info__title">
            <TextHighlight :queries="[highlight]">{{
              item.name
            }}</TextHighlight>
          </div>
          <div class="info__desc">
            <TextHighlight :queries="[highlight]">
              {{ item.subcountry }} - {{ item.country }}
            </TextHighlight>
          </div>
        </div>
        <i :class="`el-icon-${showSpinner(item) ? 'loading' : iconClass}`"></i>
      </div>
    </template>
  </infinite-scroll>
</template>

<script lang="ts">
import Vue from "vue";
import { mapGetters } from "vuex";
import InfiniteScroll from "../InfiniteScroll.vue";
import TextHighlight from "vue-text-highlight";

export default Vue.extend({
  name: "SearchResults",
  components: {
    InfiniteScroll,
    TextHighlight
  },
  props: {
    items: {
      type: Array,
      required: true
    },
    selectedItems: {
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
      default: "check"
    },
    loading: {
      type: Object,
      required: true
    },
    highlight: {
      type: String,
      default: ""
    }
  },
  computed: {
    ...mapGetters("cities", ["cities", "preferredCities"])
  },
  methods: {
    showSpinner(item): boolean {
      return this.loading[item[this.itemId]];
    },
    isSelected(item) {
      return this.selectedItems[item[this.itemId]];
    }
  }
});
</script>

<style scoped lang="scss">
.search-results {
  &__item {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 1rem;
    -webkit-box-shadow: 0 10px 6px -6px #7777770d;
    -moz-box-shadow: 0 10px 6px -6px #7777770d;
    box-shadow: 0 10px 6px -6px #7777770d;

    .info {
      flex-grow: 1;
      &__title {
        font-size: 1.4rem;
        font-weight: 400;
        color: #009898;
      }

      &__desc {
        color: #98b3b3;
      }
    }

    &:hover {
      background-color: #edffb8;
      -webkit-transition: all 0.5s linear;
      transition: all 0.5s linear;

      .el-icon-check {
        color: #009898;
        -webkit-transition: all 0.5s linear;
        transition: all 0.5s linear;
      }
    }

    &.saving {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.5;
    }

    &.selected {
      background-color: #e4e4e48a;
      .el-icon-check {
        color: #009898;
        -webkit-transition: all 0.5s linear;
        transition: all 0.5s linear;
      }
    }

    .el-icon-loading {
      color: #009898;
    }

    .el-icon-check {
      color: transparent;
    }

    .el-icon-check,
    .el-icon-loading {
      font-weight: 700;
      font-size: 1.5rem;
    }
  }
}
</style>
