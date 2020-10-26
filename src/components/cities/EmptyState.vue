<template functional>
  <div class="empty-state">
    <i class="el-icon-search"></i>

    No results found
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "EmptyState"
});
</script>

<style scoped lang="scss">
.empty-state {
  display: flex;
  justify-content: center;
  padding: 50px;
  flex-direction: column;
  align-items: center;
  font-size: 1.2rem;
  font-weight: 600;
  color: #009898;
  opacity: 0.8;

  .el-icon-search {
    display: flex;
    font-weight: 800;
    font-size: 2rem;
    padding-bottom: 10px;
    opacity: 0.8;
  }
}
</style>
