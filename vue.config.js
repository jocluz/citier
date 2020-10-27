module.exports = {
  devServer: {
    host: "localhost"
  },
  css: {
    loaderOptions: {
      sass: {
        prependData: `
          @import '@/assets/scss/index.scss';
        `
      }
    }
  }
};
