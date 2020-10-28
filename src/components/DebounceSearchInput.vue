<template>
  <el-input
    suffix-icon="el-icon-search"
    class="search__input"
    clearable
    autofocus
    v-model="search"
    placeholder="Enter your search"
    @input="debounceFilter($event)"
  >
  </el-input>
</template>

<script lang="ts">
import Vue from "vue";
import debounce from "lodash.debounce";

export const SEARCH_DEBOUNCE_TIME = 500;

export default Vue.extend({
  name: "DebounceSearchInput",
  props: {
    value: {
      type: String
    }
  },
  computed: {
    search: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("input", value);
      }
    }
  },
  methods: {
    debounceFilter: debounce(
      function(this: Vue, search: string): void {
        this.$emit("search", search);
      },
      SEARCH_DEBOUNCE_TIME,
      { leading: true }
    )
  }
});
</script>

<style scoped lang="scss">
$input-shadow: 0 1px 12px 0 rgba(0, 0, 0, 0.1);
$input-border-color: #ebeef5;

.search__input {
  margin-bottom: 10px;
  border-radius: 4px;
  font-size: 1.2rem;
  box-shadow: $input-shadow;
}
::v-deep .el-input__inner {
  border: 1px solid $input-border-color;

  &:focus,
  &:hover {
    border-color: $main-color;
  }
}
::v-deep .el-input__suffix {
  color: $main-color;
}
</style>
