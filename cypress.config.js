const { defineConfig } = require('cypress');

module.exports = defineConfig({
  reporter: 'mochawesome',
  e2e: {
    supportFile: false,
    video: false
  }
})