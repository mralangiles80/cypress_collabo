describe("Weather API Alerts", () => {

  context("GET alert type content", () => {
    it("gets a list of alert types", () => {
      let expectedEventType = '911'
      cy.request("GET", `alerts/types`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response).to.have.property('headers')
        expect(response).to.have.property('duration')
        expect(response.body.eventTypes[0]).to.contains(expectedEventType);
      })
    })
  })
})