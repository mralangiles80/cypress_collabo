const regionalOffices = require('../../fixtures/regional-offices.json')
let latitudes = new Array();
let longtitudes = new Array();

describe('Weather API Gridpoints Response Structure Validation', () => {
  it('gridpoints should have the correct structure and data types', () => {
    cy.fixture('gridpoints/gridpoints-example').then(response => {
        cy.intercept('gridpoints/ABQ/24,105/forecast', response)
        const data = response;

        // Top-level structure validation
        expect(data).to.have.property('@context');
        expect(data).to.have.property('type');
        expect(data).to.have.property('geometry');
        expect(data).to.have.property('properties');

        // Geometry validation
        expect(data.geometry).to.have.property('type');
        expect(data.geometry).to.have.property('coordinates');
        expect(data.geometry.coordinates[0]).to.be.an('array');

        // Properties validation
        const props = data.properties;
        expect(props).to.have.property('units');
        expect(props).to.have.property('forecastGenerator');
        expect(props).to.have.property('generatedAt');
        expect(props).to.have.property('updateTime');
        expect(props).to.have.property('validTimes');
        expect(props).to.have.property('elevation');
        expect(props).to.have.property('periods');

        // Elevation validation
        expect(props.elevation).to.have.property('unitCode');
        expect(props.elevation).to.have.property('value');
        expect(props.elevation.value).to.be.a('number');

        // Periods validation
        expect(props.periods).to.be.an('array');
        expect(props.periods.length).to.be.greaterThan(0);

        // Validate first period structure
        const firstPeriod = props.periods[0];
        expect(firstPeriod).to.have.property('number');
        expect(firstPeriod).to.have.property('name');
        expect(firstPeriod).to.have.property('startTime');
        expect(firstPeriod).to.have.property('endTime');
        expect(firstPeriod).to.have.property('isDaytime');
        expect(firstPeriod).to.have.property('temperature');
        expect(firstPeriod).to.have.property('temperatureUnit');
        expect(firstPeriod).to.have.property('probabilityOfPrecipitation');
        expect(firstPeriod).to.have.property('windSpeed');
        expect(firstPeriod).to.have.property('windDirection');
        expect(firstPeriod).to.have.property('icon');
        expect(firstPeriod).to.have.property('shortForecast');
        expect(firstPeriod).to.have.property('detailedForecast');

        // Validate probability of precipitation
        expect(firstPeriod.probabilityOfPrecipitation).to.have.property('unitCode');
        expect(firstPeriod.probabilityOfPrecipitation).to.have.property('value');

        // Type checks for specific fields
        expect(firstPeriod.number).to.be.a('number');
        expect(firstPeriod.isDaytime).to.be.a('boolean');
        expect(firstPeriod.temperature).to.be.a('number');
        if (firstPeriod.probabilityOfPrecipitation.value != null) {
           expect(firstPeriod.probabilityOfPrecipitation.value).to.be.a('number');
        }


        // Additional checks
        expect(firstPeriod.temperatureUnit).to.be.oneOf(['F', 'C']);
        expect(firstPeriod.windDirection).to.match(/^[NESW]+$/);
        expect(firstPeriod.icon).to.include('https://api.weather.gov/icons/');
      });
  });
});

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

       it('should handle missing coordinates', () => {
          cy.request({
            method: 'GET',
            url: `gridpoints/${regionalOffice.code}/,/forecast`,
            failOnStatusCode: false
          }).then((response) => {
            expect(response.status).to.equal(404);
          });
        });

      it('should handle coordinates with excessive precision', () => {
        cy.fixture('gridpoints/gridpoints-example').then(response => {
           cy.intercept('gridpoints/${regionalOffice.code}/18.7128000000001,66.0060000000001/forecast', response)
            expect(response.properties).to.exist;
       });
     });


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