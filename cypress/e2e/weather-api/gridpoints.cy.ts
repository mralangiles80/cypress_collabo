const regionalOffices = require('../../fixtures/regional-offices.json')
let latitudes = new Array();
let longtitudes = new Array();

describe("api.weather.gov Border API Tests", () => {

   const regionalOffice = regionalOffices[0]

   for (var i = regionalOffice.minLongtitude; i <= regionalOffice.maxLongtitude; i++) {
      longtitudes.push(i);
   }
   for (var i = regionalOffice.minLatitude; i <= regionalOffice.maxLatitude; i++) {
      latitudes.push(i);
   }
   const randomLatitude = latitudes[Math.floor(Math.random() * latitudes.length)];
   const randomLongtitude = longtitudes[Math.floor(Math.random() * longtitudes.length)];

   function hasDuplicates(array: Array<number>) {
     return (new Set(array)).size !== array.length;
   }

   const removeDuplicates = (arr: Array<number> = []) => {
     const map = new Map();
     arr.forEach((x) => map.set(JSON.stringify(x), x));
     arr = [...map.values()];
     return arr;
   };

   context("/gridpoints/{wfo}/{x},{y}/forecast", () => {
      it("gridpoints show non-duplicate coordinates for N, S, E, W", () => {
         cy.fixture('alerts/non-duplicate-coordinates').then(response => {
            cy.intercept({ method: 'GET', url: 'gridpoints/ABQ/24,105/forecast'}, response)
            var coordinates = response.geometry.coordinates;
            expect(coordinates[0].length).to.eq(removeDuplicates(coordinates[0]).length);
         })
      })
   }),
   context("api.weather.gov meets the expectations for the status of different regions in relation to US borders", () => {

   it("must 500 for Australia", () => {
         cy.request({
            url: `gridpoints/${regionalOffice.code}/25,133/forecast`,
            failOnStatusCode: false,
         }).then((response) => {
            expect(response.status).to.eq(500)
         }) // australia
      })

      it("api.weather.gov must 500 for the Mexican side of the US/Mexican border", () => {
         cy.request({
            url: `gridpoints/${regionalOffice.code}/32,116/forecast`,
            failOnStatusCode: false,
         }).then((response) => {
            expect(response.status).to.eq(500)
         }) // mexican border
      })

      it("api.weather.gov must 200 for somewhere in the American mid-west", () => {
         cy.request("GET", `gridpoints/${regionalOffice.code}/${randomLatitude},${randomLongtitude}/forecast`).then((response) => {
            expect(response.status).to.eq(200); // mid-west somewhere
         })
      })

      it("api.weather.gov must 200 for the US side of the US/Mexican border", () => {
         cy.request("GET", `gridpoints/${regionalOffice.code}/37,94/forecast`).then((response) => {
            expect(response.status).to.eq(200); // near the mexican border
         })
      })

      it("api.weather.gov must 200 for US territories", () => {
         cy.request("GET", `gridpoints/${regionalOffice.code}/18,66/forecast`).then((response) => {
            expect(response.status).to.eq(200); // puerto rico
         })
      })

      it("api.weather.gov latitude must meet a minimum", () => {
         cy.request({
            url: `gridpoints/${regionalOffice}/${randomLatitude},-1/forecast`,
            failOnStatusCode: false,
         }).then((response) => {
            expect(response.status).to.eq(404)
         })
      })

      it("api.weather.gov longitude must meet a minimum", () => {
         cy.request({
            url: `gridpoints/${regionalOffice}/-1,${randomLongtitude}/forecast`,
            failOnStatusCode: false,
         }).then((response) => {
            expect(response.status).to.eq(404)
         })
      })
   })

   context("api.weather.gov Temperature API Tests", () => {
   
      it("/" + regionalOffice.code + "/" + randomLatitude + "," + randomLongtitude + " must be a whole number", () => {
            cy.request("GET", `gridpoints/${regionalOffice.code}/${randomLatitude},${randomLongtitude}/forecast`).then((response) => {
               expect(response.status).to.eq(200);
               var forecastPeriods = response.body.properties.periods;
               forecastPeriods.forEach(function(forecastPeriod: Record<string, number>) {
                  expect(forecastPeriod.temperature % 1).to.equal(0)
               });
            })
         })

         it("/" + regionalOffice.code + "/" + randomLatitude + "," + randomLongtitude + " temperature must not be null", () => {
            cy.request("GET", `gridpoints/${regionalOffice.code}/${randomLatitude},${randomLongtitude}/forecast`).then((response) => {
               expect(response.status).to.eq(200);
               var forecastPeriods = response.body.properties.periods;
               forecastPeriods.forEach(function(forecastPeriod: Record<string, number>) {
                  expect(forecastPeriod.temperature.toString()).to.not.be.empty;
               });
            })
         })

         it("/" + regionalOffice.code + "/" + randomLatitude + "," + randomLongtitude + " temperature must meet a minimum", () => {
            cy.request("GET", `gridpoints/${regionalOffice.code}/${randomLatitude},${randomLongtitude}/forecast`).then((response) => {
               expect(response.status).to.eq(200);
               var forecastPeriods = response.body.properties.periods;
               forecastPeriods.forEach(function(forecastPeriod: Record<string, number>) {
                  expect(forecastPeriod.temperature).to.be.greaterThan(-100);
               });
            })
         }),
         it("/" + regionalOffice.code + "/" + randomLatitude + "," + randomLongtitude + " temperature must meet a maximum", () => {
            cy.request("GET", `gridpoints/${regionalOffice.code}/${randomLatitude},${randomLongtitude}/forecast`).then((response) => {
               expect(response.status).to.eq(200);
               var forecastPeriods = response.body.properties.periods;
               forecastPeriods.forEach(function(forecastPeriod: Record<string, number>) {
                  expect(forecastPeriod.temperature).to.be.lessThan(200);
               });
            })
         })
      })

   context("api.weather.gov Wind Direction API Tests", () => {

   it("/" + regionalOffice.code + "/" + randomLatitude + "," + randomLongtitude + " wind direction must be a string", () => {
         cy.request("GET", `gridpoints/${regionalOffice.code}/${randomLatitude},${randomLongtitude}/forecast`).then((response) => {
            expect(response.status).to.eq(200);
            var forecastPeriods = response.body.properties.periods;
            forecastPeriods.forEach(function(forecastPeriod: Record<string, number>) {
               expect(forecastPeriod.windDirection).to.be.a('string');
            });
         })
      })

      it("/" + regionalOffice.code + "/" + randomLatitude + "," + randomLongtitude + " wind direction must not be null", () => {
         cy.request("GET", `gridpoints/${regionalOffice.code}/${randomLatitude},${randomLongtitude}/forecast`).then((response) => {
            expect(response.status).to.eq(200);
            var forecastPeriods = response.body.properties.periods;
            forecastPeriods.forEach(function(forecastPeriod: Record<string, number>) {
               expect(forecastPeriod.windDirection).to.not.be.empty;
            });
         })
      })

      it("/" + regionalOffice.code + "/" + randomLatitude + "," + randomLongtitude + " must be up to 3 characters", () => {
         cy.request("GET", `gridpoints/${regionalOffice.code}/${randomLatitude},${randomLongtitude}/forecast`).then((response) => {
            expect(response.status).to.eq(200);
            var forecastPeriods = response.body.properties.periods;
            forecastPeriods.forEach(function(forecastPeriod: Record<string, number>) {
               expect(forecastPeriod.windDirection).to.have.length.of.at.most(3);
            });
         })
      })

      it("/" + regionalOffice.code + "/" + randomLatitude + "," + randomLongtitude + " must be upper case characters", () => {
         cy.request("GET", `gridpoints/${regionalOffice.code}/${randomLatitude},${randomLongtitude}/forecast`).then((response) => {
            expect(response.status).to.eq(200);
            var forecastPeriods = response.body.properties.periods;
            forecastPeriods.forEach(function(forecastPeriod: Record<string, number>) {
               expect(forecastPeriod.windDirection).to.match(/[A-Z]+/);
               expect(forecastPeriod.windDirection).to.not.match(/[a-z]+/);
            });
         })
      })

      it("/" + regionalOffice.code + "/" + randomLatitude + "," + randomLongtitude + " wind direction must match the wind direction characters", () => {
         cy.request("GET", `gridpoints/${regionalOffice.code}/${randomLatitude},${randomLongtitude}/forecast`).then((response) => {
            expect(response.status).to.eq(200);
            var forecastPeriods = response.body.properties.periods;
            forecastPeriods.forEach(function(forecastPeriod: Record<string, number>) {
               expect(forecastPeriod.windDirection).to.be.oneOf(['N', 'S', 'E', 'W', 'SW', 'SE', 'NE', 'NW', 'NNE', 'ENE', 'ESE', 'SSE', 'SSW', 'WSW', 'WNW', 'NNW']);
            });
         })
      })
   })
})