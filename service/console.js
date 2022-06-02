const console = {
  isDev: true,
  log(...args) {
    if (this.isDev) {
      global.console.log(...args);
    }
  },
  error(...args) {
    if (this.isDev) {
      global.console.error(...args);
    }
  },
};

module.exports = console;
