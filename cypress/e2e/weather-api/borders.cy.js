const regionalOffices = require('../../fixtures/regional-offices.json')
var latitudes = [];
var longtitudes = [];

describe("Border API Tests", () => {

  const regionalOffice = regionalOffices[0]

  for (var i = regionalOffice.minLongtitude; i <= regionalOffice.maxLongtitude; i++) { longtitudes.push(i);  }
  for (var i = regionalOffice.minLatitude; i <= regionalOffice.maxLatitude; i++) { latitudes.push(i);  }
  const randomLatitude = latitudes[Math.floor(Math.random() * latitudes.length)];
  const randomLongtitude = longtitudes[Math.floor(Math.random() * longtitudes.length)];
  context("meets the expectations for the status of different regions in relation to US borders", () => {
    it("must 500 for Australia", () => {
      cy.request({ 
        url: `gridpoints/${regionalOffice.code}/25,133/forecast`,
        failOnStatusCode:false,
      }).then((response) => {
            expect(response.status).to.eq(500)
      })  // australia
    }),
    it("must 500 for the Mexican side of the US/Mexican border", () => {
      cy.request({
        url: `gridpoints/${regionalOffice.code}/32,116/forecast`,
        failOnStatusCode:false,
      }).then((response) => {
            expect(response.status).to.eq(500)
      }) // mexican border
    }),
    it("must 200 for somewhere in the American mid-west", () => {
      cy.request("GET", `gridpoints/${regionalOffice.code}/${randomLatitude},${randomLongtitude}/forecast`).then((response) => {
        expect(response.status).to.eq(200); // mid-west somewhere
      })
    }),
    it("must 200 for the US side of the US/Mexican border", () => {
      cy.request("GET", `gridpoints/${regionalOffice.code}/37,94/forecast`).then((response) => {
        expect(response.status).to.eq(200); // near the mexican border
      })
    }),
    it("must 200 for US territories", () => {
      cy.request("GET", `gridpoints/${regionalOffice.code}/18,66/forecast`).then((response) => {
        expect(response.status).to.eq(200); // puerto rico
      })     
    }),
    it("latitude must meet a minimum", () => {
      cy.request({
        url: `gridpoints/${regionalOffice}/${randomLatitude},-1/forecast`,
        failOnStatusCode:false,
      }).then((response) => {
        expect(response.status).to.eq(404)
      })
    }),
    it("longitude must meet a minimum", () => {
           cy.request({
        url: `gridpoints/${regionalOffice}/-1,${randomLongtitude}/forecast`,
        failOnStatusCode:false,
      }).then((response) => {
        expect(response.status).to.eq(404)
      })
    })
  })     
})