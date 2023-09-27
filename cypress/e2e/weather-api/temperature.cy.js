describe("Weather API Alerts", () => {

  var latitudes = [];

  for (var i = 30; i <= 46; i++) {
     latitudes.push(i);
  }

 var longtitudes = [];

  for (var i = 70; i <= 90; i++) {
     longtitudes.push(i);
  }

  const regionalOffice = 'TOP';

  const randomLatitude = latitudes[Math.floor(Math.random() * latitudes.length)];
  const randomLongtitude = longtitudes[Math.floor(Math.random() * longtitudes.length)];

  context("GET temperature", () => {
    it("tests it meets temperature rules", () => {
      cy.request("GET", `gridpoints/${regionalOffice}/${randomLatitude},${randomLongtitude}/forecast`).then((response) => {
      expect(response.status).to.eq(200);
      var forecastPeriods = response.body.properties.periods;
      forecastPeriods.forEach(function(forecastPeriod) {
        expect(forecastPeriod.temperature % 1).to.equal(0) // integer
        cy.get(forecastPeriod.temperature).should('not.be.empty');
        expect(forecastPeriod.temperature).to.be.greaterThan(-100); 
        expect(forecastPeriod.temperature).to.be.lessThan(200);
      });
    })
  })
 })     
})