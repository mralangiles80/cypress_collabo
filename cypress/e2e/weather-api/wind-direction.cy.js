const regionalOffices = require('../../fixtures/regional-offices.json')
var latitudes = [];
var longtitudes = [];

describe("Wind Direction API Tests", () => {

  const regionalOffice = regionalOffices[0]

  for (var i = regionalOffice.minLongtitude; i <= regionalOffice.maxLongtitude; i++) { longtitudes.push(i);  }
  for (var i = regionalOffice.minLatitude; i <= regionalOffice.maxLatitude; i++) { latitudes.push(i);  }
  const randomLatitude = latitudes[Math.floor(Math.random() * latitudes.length)];
  const randomLongtitude = longtitudes[Math.floor(Math.random() * longtitudes.length)];

  context("meets expectations for wind directions", () => {
    it("/" + regionalOffice.code + "/" + randomLatitude + "," + randomLongtitude + " must be a string", () => {
      cy.request("GET", `gridpoints/${regionalOffice.code}/${randomLatitude},${randomLongtitude}/forecast`).then((response) => {
        expect(response.status).to.eq(200);
        var forecastPeriods = response.body.properties.periods;
        forecastPeriods.forEach(function(forecastPeriod) {
          expect(forecastPeriod.windDirection).to.be.a('string');
        });
      })
    }),
    it("/" + regionalOffice.code + "/" + randomLatitude + "," + randomLongtitude + " must not be null", () => {
      cy.request("GET", `gridpoints/${regionalOffice.code}/${randomLatitude},${randomLongtitude}/forecast`).then((response) => {
        expect(response.status).to.eq(200);
        var forecastPeriods = response.body.properties.periods;
        forecastPeriods.forEach(function(forecastPeriod) {
          expect(forecastPeriod.windDirection).to.not.be.empty;
        });
      })
    }),
    it("/" + regionalOffice.code + "/" + randomLatitude + "," + randomLongtitude + " must be up to 3 characters", () => {
      cy.request("GET", `gridpoints/${regionalOffice.code}/${randomLatitude},${randomLongtitude}/forecast`).then((response) => {
        expect(response.status).to.eq(200);
        var forecastPeriods = response.body.properties.periods;
        forecastPeriods.forEach(function(forecastPeriod) {
          expect(forecastPeriod.windDirection).to.have.length.of.at.most(3);
        });
      })
    }),
    it("/" + regionalOffice.code + "/" + randomLatitude + "," + randomLongtitude + " must be upper case characters", () => {
      cy.request("GET", `gridpoints/${regionalOffice.code}/${randomLatitude},${randomLongtitude}/forecast`).then((response) => {
        expect(response.status).to.eq(200);
        var forecastPeriods = response.body.properties.periods;
        forecastPeriods.forEach(function(forecastPeriod) {
          expect(forecastPeriod.windDirection).to.match(/[A-Z]+/);
          expect(forecastPeriod.windDirection).to.not.match(/[a-z]+/);
        });
      })
    }),

    it("/" + regionalOffice.code + "/" + randomLatitude + "," + randomLongtitude + " it matches the wind direction characters", () => {
      cy.request("GET", `gridpoints/${regionalOffice.code}/${randomLatitude},${randomLongtitude}/forecast`).then((response) => {
        expect(response.status).to.eq(200);
        var forecastPeriods = response.body.properties.periods;
        forecastPeriods.forEach(function(forecastPeriod) {
          expect(forecastPeriod.windDirection).to.be.oneOf(['N', 'S', 'E', 'W', 'SW', 'SE', 'NE', 'NW', 'NNE', 'ENE', 'ESE', 'SSE', 'SSW', 'WSW', 'WNW', 'NNW']);
        });
      })
    })
  })     
})