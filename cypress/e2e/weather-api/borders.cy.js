describe("Border API Tests", () => {

  var latitudes = [];
  var longtitudes = [];

  for (var i = 70; i <= 90; i++) { longtitudes.push(i);  }
  for (var i = 30; i <= 50; i++) { latitudes.push(i);  }
  const regionalOffice = 'TOP';
  const randomLatitude = latitudes[Math.floor(Math.random() * latitudes.length)];
  const randomLongtitude = longtitudes[Math.floor(Math.random() * longtitudes.length)];

  context("GET borders", () => {
    it("checks the status of different regions in relation to US borders", () => {
      cy.request({ 
        url: `gridpoints/${regionalOffice}/25,133/forecast`,
        failOnStatusCode:false,
      }).then((response) => {
            expect(response.status).to.eq(500)
      })  // australia
    }),
    it("checks the status of different regions in relation to US borders", () => {
      cy.request({
        url: `gridpoints/${regionalOffice}/32,116/forecast`,
        failOnStatusCode:false,
      }).then((response) => {
            expect(response.status).to.eq(500)
      }) // mexican border
    }),
    it("checks the status of different regions in relation to US borders", () => {
      cy.request("GET", `gridpoints/${regionalOffice}/${randomLatitude},${randomLongtitude}/forecast`).then((response) => {
        expect(response.status).to.eq(200); // mid-west somewhere
      })
    }),
    it("checks the status of different regions in relation to US borders", () => {
      cy.request("GET", `gridpoints/${regionalOffice}/37,94/forecast`).then((response) => {
        expect(response.status).to.eq(200); // near the mexican border
      })
    }),
    it("checks the status of different regions in relation to US borders", () => {
      cy.request("GET", `gridpoints/${regionalOffice}/18,66/forecast`).then((response) => {
        expect(response.status).to.eq(200); // puerto rico
      })     
    })
  })     
})