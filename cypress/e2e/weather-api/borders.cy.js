describe("Border API Tests", () => {

  var latitudes = [];
  var longtitudes = [];

  for (var i = 70; i <= 90; i++) { longtitudes.push(i);  }
  for (var i = 30; i <= 50; i++) { latitudes.push(i);  }
  const regionalOffice = 'TOP';
  const randomLatitude = latitudes[Math.floor(Math.random() * latitudes.length)];
  const randomLongtitude = longtitudes[Math.floor(Math.random() * longtitudes.length)];
  context("meets the expectations for the status of different regions in relation to US borders", () => {
    it("must 500 for Australia", () => {
      cy.request({ 
        url: `gridpoints/${regionalOffice}/25,133/forecast`,
        failOnStatusCode:false,
      }).then((response) => {
            expect(response.status).to.eq(500)
      })  // australia
    }),
    it("must 500 for the Mexican side of the US/Mexican border", () => {
      cy.request({
        url: `gridpoints/${regionalOffice}/32,116/forecast`,
        failOnStatusCode:false,
      }).then((response) => {
            expect(response.status).to.eq(500)
      }) // mexican border
    }),
    it("must 200 for somewhere in the American mid-west", () => {
      cy.request("GET", `gridpoints/${regionalOffice}/${randomLatitude},${randomLongtitude}/forecast`).then((response) => {
        expect(response.status).to.eq(200); // mid-west somewhere
      })
    }),
    it("must 200 for the US side of the US/Mexican border", () => {
      cy.request("GET", `gridpoints/${regionalOffice}/37,94/forecast`).then((response) => {
        expect(response.status).to.eq(200); // near the mexican border
      })
    }),
    it("must 200 for US territories", () => {
      cy.request("GET", `gridpoints/${regionalOffice}/18,66/forecast`).then((response) => {
        expect(response.status).to.eq(200); // puerto rico
      })     
    })
  })     
})