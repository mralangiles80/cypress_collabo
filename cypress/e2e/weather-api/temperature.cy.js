describe("Weather API Alerts", () => {

  const weatherBaseUrl = "https://api.weather.gov";

  context("GET temperature", () => {
    it("tests it is within normal bounds", () => {
      cy.request("GET", `${weatherBaseUrl}/gridpoints/TOP/31,82/forecast`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response).to.have.property('headers')
        expect(response).to.have.property('duration')
        cy.task("log", "response body: " + response.body.properties.periods[0].temperature);
        expect(response.body.properties.periods[0].temperature).to.be.greaterThan(-50);
        expect(response.body.properties.periods[0].temperature).to.be.lessThan(200);
      })
    }),
    it("tests it is not null", () => {
      cy.request("GET", `${weatherBaseUrl}/gridpoints/TOP/31,82/forecast`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response).to.have.property('headers')
        expect(response).to.have.property('duration')
        cy.task("log", "response body: " + response.body.properties.periods[0].temperature);
        cy.get(response.body.properties.periods[0].temperature).should('not.be.empty')
      })
    }),
    it("tests it is a number", () => {
      cy.request("GET", `${weatherBaseUrl}/gridpoints/TOP/31,82/forecast`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response).to.have.property('headers')
        expect(response).to.have.property('duration')
        cy.task("log", "response body: " + response.body.properties.periods[0].temperature);
        cy.get(response.body.properties.periods[0].temperature).invoke('text').should('match', /^[0-9]*$/);
      })
    })
  })
})