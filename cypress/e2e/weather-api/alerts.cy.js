describe("Weather API Alert Types", () => {

  let realEventType = '911'
  let mockEventType = 'Craziness'
  let url = 'https://api.weather.gov/alerts/types'

  before(() => {
    cy.intercept({ url: url },
      { fixture: 'alert-types-stub.json' }
    )
  })

  context("gets a list of alert types and checks the first one", () => {

    it("gets the list from the fixture mock", () => {
      cy.wrap(fetch(url))
        .then((rawResponse) => rawResponse.json())
        .then((body) => {
          expect(body.eventTypes[0]).to.eq(mockEventType)
      })
    })

    it("gets the list from the real resource", () => {
      cy.request("GET", `alerts/types`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.eventTypes[0]).to.contains(realEventType);
      })
    })
  })
})
