<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="scss">
html {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow: hidden;
  display: flex;
  height: 100%;

  body {
    display: flex;
    flex-grow: 1;

    #app {
      display: flex;
      flex-grow: 1;
    }
  }
}
</style>
