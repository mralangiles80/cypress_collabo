const { defineConfig } = require('cypress');
const artifactsFolder = 'artifacts/'

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://api.weather.gov',
    screenshotOnRunFailure: false,
    video: false,
    retries: 10,
    fixturesFolder: 'fixtures/',
    screenshotsFolder: artifactsFolder + 'screenshots/',
    downloadsFolder : artifactsFolder + 'downloads/',
     setupNodeEvents(on, config) {
          on("task", {
            log(message) {
              console.log(message);
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