describe("Weather API Alert Types", () => {

   let realEventType = '911'
   let mockEventType = 'Craziness'
   let url = '../fixtures/alert-types-stub.json'


   function hasDuplicates(array) {
     return (new Set(array)).size !== array.length;
   }

   const removeDuplicates = (arr = []) => {
     const map = new Map();
     arr.forEach((x) => map.set(JSON.stringify(x), x));
     arr = [...map.values()];
     return arr;
   };

   before(() => {
      cy.intercept({
         url: url
      }, {
         fixture: 'alert-types-stub.json'
      })
   })

   context("alerts/types gets a list of alert types and checks the first one", () => {

      it("gets the list from the real resource", () => {
         cy.request("GET", `alerts/types`).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.eventTypes[0]).to.contains(realEventType);
         })
      })

      it.skip("gets the list from the fixture mock", () => {
         cy.wrap(fetch(url))
            .then((rawResponse) => rawResponse.json())
            .then((body) => {
               expect(body.eventTypes[0]).to.eq(mockEventType)
            })
      })
   })
   context("alerts/point", () => {
      it("pretty prints the description", () => {
         cy.request("GET", `/alerts?point=38.09,-76.999999`).then((response) => {
            var forecastFeatures = response.body.features;
            forecastFeatures.forEach(function(forecastFeature) {
               var forecastFeatureDescription = forecastFeature.properties.description;
               if (forecastFeatureDescription.includes(" IN ")) {
                  expect(forecastFeatureDescription).to.contain("\n");
                  expect(forecastFeatureDescription).to.contain("");
                  expect(forecastFeatureDescription).to.contain("COUNTIES");
               } else if (forecastFeatureDescription.includes(" WATCH ")) {
                  expect(forecastFeatureDescription).to.contain(", ");
                  expect(forecastFeatureDescription).to.contain("REMAINS VALID UNTIL");
                  expect(forecastFeatureDescription).to.contain("FOR THE FOLLOWING AREAS");
                  expect(forecastFeatureDescription).to.contain("THIS WATCH INCLUDES");
                  expect(forecastFeatureDescription).to.contain("\n");
               }
            })
         })
      })
   })


   context("alerts/active", () => {

      it.skip("does not show results for multiple zones", () => {
         cy.request({
            url: `/alerts/active?zone=MDC033&zone=MDC031`,
            failOnStatusCode: false,
         }).then((response) => {
            expect(response.status).to.eq(400);
         })
      })

   })

   context("alerts", () => {

      var dateTimeValue = "2020-05-14T05:40:08Z"
      it.skip("shouldn't accept the same start and end time - " + dateTimeValue + " - as parameter values", () => {
         cy.request("GET", `/alerts?start=` + dateTimeValue + `&end= ` + dateTimeValue).then((response) => {
            expect(response.status).to.eq(400);
         })
      })

      var invalidQueryParameter = "response";
      it("shows the right information for invalid query parameter - " + invalidQueryParameter + " - error response", () => {
         cy.request({
            url: `/alerts?` + invalidQueryParameter + `=Avoid`,
            failOnStatusCode: false,
         }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property("correlationId");
            expect(response.body).to.have.property("parameterErrors");
            expect(response.body).to.have.property("title");
            expect(response.body).to.have.property("detail");
            expect(response.body.title).to.eq("Bad Request");
            expect(response.body.detail).to.eq("Bad Request");
            expect(response.body.parameterErrors[0]).to.have.property("parameter");
            expect(response.body.parameterErrors[0]).to.have.property("message");
            expect(response.body.parameterErrors[0].parameter).to.contain("query\." + invalidQueryParameter);
            expect(response.body.parameterErrors[0].message).to.contain("Query parameter \"" + invalidQueryParameter + "\" is not recognized");
         })
      })

      it("shows the right information for event query parameter regex pattern error response", () => {
         cy.request({
            url: `/alerts?event=&&`,
            failOnStatusCode: false,
         }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property("correlationId");
            expect(response.body).to.have.property("parameterErrors");
            expect(response.body).to.have.property("title");
            expect(response.body).to.have.property("detail");
            expect(response.body.title).to.eq("Bad Request");
            expect(response.body.detail).to.eq("Bad Request");
            expect(response.body.parameterErrors[0]).to.have.property("parameter");
            expect(response.body.parameterErrors[0]).to.have.property("message");
            expect(response.body.parameterErrors[0].message).to.contain("Does not match the regex pattern");
         })
      })

      it("each alert has its own unique link", () => {
         cy.request({ url:  `/alerts`,
            failOnStatusCode: false,
         }).then((response) => {
            expect(response.status).to.eq(200);
            let alerts = response.body.features;
            let alertIds = [];
            let count = 0;
            let linksToMatchRegex = /https:\/\/api\.weather\.gov\/alerts\/urn:oid:2\.49\.0\.1\.840\.0.*/;
            alerts.forEach(function(alert) {
               alertIds.push(alert.id);
               count++;
               expect(linksToMatchRegex.test(alert.id)).to.equal(true);
            });
            expect(hasDuplicates(alertIds).toString() === "false");
            expect(alertIds.length).to.eq(count);
         })
      })

      let queryParameters = ["urgency", "severity", "certainty", "status"];
      queryParameters.forEach(function(queryParameter) {

         it("config for " + queryParameter + " query parameter matches values in error message array", () => {
            cy.request({
               url: `/alerts?` + queryParameter,
               failOnStatusCode: false,
            }).then((response) => {
               var errorMessage = response.body.parameterErrors[0].message;
               var parsedErrorMessageValues = (errorMessage).replace(/Does not have a value in the enumeration/g, "");
               var errorMessageValues = JSON.parse(parsedErrorMessageValues);
               cy.task("log", errorMessageValues);
               errorMessageValues.forEach(function(errorMessageValue) {
                  cy.task("log", errorMessageValue);
                  cy.request({
                     url: `/alerts?` + queryParameter + `=` + errorMessageValue,
                     failOnStatusCode: false,
                  }).then((response) => {
                     expect(response.status).to.eq(200);

                  })
               })
            })
         })

         it("error message for incomplete request for valid query paramater - " + queryParameter + " - is correct", () => {
            cy.request({
               url: `/alerts?` + queryParameter,
               failOnStatusCode: false,
            }).then((response) => {
               var errorMessage = response.body.parameterErrors[0].message;
               expect(response.body).to.have.property("correlationId");
               expect(response.body).to.have.property("parameterErrors");
               expect(response.body).to.have.property("title");
               expect(response.body).to.have.property("detail");
               expect(response.body.title).to.eq("Bad Request");
               expect(response.body.detail).to.eq("Bad Request");
               expect(response.body.parameterErrors[0]).to.have.property("parameter");
               expect(response.body.parameterErrors[0]).to.have.property("message");
               expect(response.body.parameterErrors[0].parameter).to.contain("query\." + queryParameter + "[0]");
            })
         });
      });

      it("can use event type as query parameter", () => {
         cy.request("GET", `alerts?event=Flood%20Warning`).then((response) => {
            expect(response.status).to.eq(200);
         })
      })

      var searches = ["alerts/alerts", "alerts/alerts?severity=Severe", "alerts/alerts?severity=", "alerts/alerts?severity"]
      searches.forEach(function(search) {
         it.skip("uses the most correct error message for incorrectly formatted alert searches in the path: " + search, () => {
            cy.request({
               url: `` + search,
               failOnStatusCode: false,
            }).then((response) => {
               expect(response.status).to.eq(404);
            })
         })
      })

      var positiveOffsets = ["2020-05-14T05:40:08+00:00", "2020-05-14T05:40:08+00", "2020-05-14T05:40:08+00:00:00"]
      positiveOffsets.forEach(function(positiveOffset) {
         it("does not accept positive offset version " + positiveOffset, () => {
            cy.request({
               url: `/alerts?start=` + positiveOffset,
               failOnStatusCode: false,
            }).then((response) => {
               expect(response.status).to.eq(400);
            })
         })
      })

      var negativeOffsets = ["2020-05-14T05:40:08-00:00", "2020-05-14T05:40:08-00", "2020-05-14T05:40:08-00:00:00"]
      negativeOffsets.forEach(function(negativeOffset) {
         it.skip("does not accept negative offset version " + negativeOffset, () => {
            cy.request({
               url: `/alerts?start=` + negativeOffset,
               failOnStatusCode: false,
            }).then((response) => {
               expect(response.status).to.eq(400);
            })
         })
      })

      it("does accept miliseconds", () => {
         cy.request({
            url: `/alerts?start=2020-05-14T05:40:08.000Z`,
            failOnStatusCode: false,
         }).then((response) => {
            expect(response.status).to.eq(200);
         })
      })

      it("requires punctuation", () => {
         cy.request({
            url: `/alerts?start=20200514T054008Z`,
            failOnStatusCode: false,
         }).then((response) => {
            expect(response.status).to.eq(400);
         })
      })

      var incompleteDateFormats = ["2020-05-14", "2020-05-14T"]
      incompleteDateFormats.forEach(function(incompleteDateFormat) {
         it("requires the full date", () => {
            cy.request({
               url: `/alerts?start=` + incompleteDateFormat,
               failOnStatusCode: false,
            }).then((response) => {
               expect(response.status).to.eq(400);
            })
            cy.request({
               url: `/alerts?start=` + incompleteDateFormat,
               failOnStatusCode: false,
            }).then((response) => {
               expect(response.status).to.eq(400);
            })
         })
      })

      it.skip("requires YYYY-MM-DD", () => {
         // no error handling for YYYY-DD-MM
         cy.request({
            url: `/alerts?start=2020-14-05T05:40:08Z`,
            failOnStatusCode: false,
         }).then((response) => {
            expect(response.status).to.eq(400);
         })
         cy.request({
            url: `/alerts?start=2020-05-14T05:40:08Z`,
            failOnStatusCode: false,
         }).then((response) => {
            expect(response.status).to.eq(200);
         })
      })
   })
})