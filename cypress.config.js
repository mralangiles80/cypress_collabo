const { defineConfig } = require('cypress');
const artifactsFolder = 'artifacts/'

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://api.weather.gov',
    supportFile: false,
    video: false,
    screenshotOnRunFailure: false,
    screenshotsFolder: artifactsFolder + 'screenshots/',
    downloadsFolder : artifactsFolder + 'downloads/',
    setupNodeEvents(on, config) {
      on("task", {
        log(args) {
        console.log(...args);
        return null;
        }
      });
    },
  },
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: artifactsFolder + 'reports/',
    reportFilename: "report-[status]_[datetime]-[name]",
    timestamp: 'dd-mm-yyyy-hhmmss',
  }
})