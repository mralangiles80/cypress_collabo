describe("Weather API Temperature Tests", () => {

  const regionalOffice = 'TOP';
  const latitudes = [31, 32, 33];
  const longtitudes = [80, 81, 82];

  context("GET alert type content", () => {
    it("gets a forecast temperature from different locations within a regional office", () => {
      latitudes.forEach(function(latitude, index) {
        cy.request("GET", `gridpoints/${regionalOffice}/${latitude},${longtitudes[index]}/forecast`).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('properties');
          var forecastPeriods = response.body.properties.periods
          expect(forecastPeriods[0].temperature).to.equal(81);
          forecastPeriods.forEach(function(forecastPeriod) {
            expect(forecastPeriod.temperature % 1).to.equal(0) // integer
            expect(forecastPeriod.temperature).to.be.greaterThan(-100)
            expect(forecastPeriod.temperature).to.be.lessThan(200)       
          });
        })
      })
    })
  })
})