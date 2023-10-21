describe("Temperature API Tests", () => {

  var latitudes = [];
  var longtitudes = [];

  for (var i = 70; i <= 90; i++) { longtitudes.push(i);  }
  for (var i = 30; i <= 50; i++) { latitudes.push(i);  }
  const regionalOffice = 'TOP';
  const randomLatitude = latitudes[Math.floor(Math.random() * latitudes.length)];
  const randomLongtitude = longtitudes[Math.floor(Math.random() * longtitudes.length)];

  context("tests it meets temperature rules", () => {
    it("must be a whole number", () => {
      cy.request("GET", `gridpoints/${regionalOffice}/${randomLatitude},${randomLongtitude}/forecast`).then((response) => {
        expect(response.status).to.eq(200);
        var forecastPeriods = response.body.properties.periods;
        forecastPeriods.forEach(function(forecastPeriod) {
          expect(forecastPeriod.temperature % 1).to.equal(0) // integer
        });
      })
    }),
    it("must not be null", () => {
      cy.request("GET", `gridpoints/${regionalOffice}/${randomLatitude},${randomLongtitude}/forecast`).then((response) => {
        expect(response.status).to.eq(200);
        var forecastPeriods = response.body.properties.periods;
        forecastPeriods.forEach(function(forecastPeriod) {
          cy.get(forecastPeriod.temperature).should('not.be.empty');
        });
      })
    }),
    it("must meet a minimum", () => {
      cy.request("GET", `gridpoints/${regionalOffice}/${randomLatitude},${randomLongtitude}/forecast`).then((response) => {
        expect(response.status).to.eq(200);
        var forecastPeriods = response.body.properties.periods;
        forecastPeriods.forEach(function(forecastPeriod) {
          expect(forecastPeriod.temperature).to.be.greaterThan(-100); 
        });
      })
    }),
    it("must meet a maximum", () => {
      cy.request("GET", `gridpoints/${regionalOffice}/${randomLatitude},${randomLongtitude}/forecast`).then((response) => {
        expect(response.status).to.eq(200);
        var forecastPeriods = response.body.properties.periods;
        forecastPeriods.forEach(function(forecastPeriod) {
          expect(forecastPeriod.temperature).to.be.lessThan(200);
        });
      })
    })
  })     
})