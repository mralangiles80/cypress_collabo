describe("Example tests", () => {

  // this shows how to visit a webpage and intercept part of it (e.g. a triggered script) and stub out its response

  beforeEach(() => {
    cy.intercept({
      method: 'GET',
      url: '**/main.361f8d0d.js',
      }, 
      { statusCode: 500 }
      ).as('connectionError')
  })

  context("GET example response content from mock", () => {
    it("go to cypress help doc but a js response is 500", () => {

      cy.visit('https://docs.cypress.io/api/commands/session#Where-to-call-cyvisit')    

      cy.wait("@connectionError").then((intercept) => {
        cy.dumpLog('mocked response object', intercept)
        expect(intercept).to.not.eq(null)
        expect(intercept.request.resourceType).to.eq('script')
        expect(intercept.response.statusCode).to.eq(500)
        expect(intercept.response.url).to.eq('https://docs.cypress.io/assets/js/main.361f8d0d.js')
      })
    })
  })
})
