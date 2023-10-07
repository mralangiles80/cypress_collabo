describe("Wind Direction API Tests", () => {

  var latitudes = [];
  var longtitudes = [];

  for (var i = 70; i <= 90; i++) { longtitudes.push(i);  }
  for (var i = 30; i <= 50; i++) { latitudes.push(i);  }
  const regionalOffice = 'TOP';
  const randomLatitude = latitudes[Math.floor(Math.random() * latitudes.length)];
  const randomLongtitude = longtitudes[Math.floor(Math.random() * longtitudes.length)];

  context("GET wind direction", () => {
    it("meets expectations for wind directions", () => {
      cy.request("GET", `gridpoints/${regionalOffice}/${randomLatitude},${randomLongtitude}/forecast`).then((response) => {
        expect(response.status).to.eq(200);
        var forecastPeriods = response.body.properties.periods;
        forecastPeriods.forEach(function(forecastPeriod) {
          expect(forecastPeriod.windDirection).to.be.a('string');
          expect(forecastPeriod.windDirection).to.not.be.empty;
          expect(forecastPeriod.windDirection).to.have.length.of.at.most(3);
          expect(forecastPeriod.windDirection).to.match(/[A-Z]+/);
          expect(forecastPeriod.windDirection).to.be.oneOf(['N', 'S', 'E', 'W', 'SW', 'SE', 'NE', 'NW', 'NNE', 'ENE', 'ESE', 'SSE', 'SSW', 'WSW', 'WNW', 'NNW']);
        });
      })
    })
  })     
})