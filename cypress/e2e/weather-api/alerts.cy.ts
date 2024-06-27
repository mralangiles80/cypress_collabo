import {
   queryParameters,
   negativeOffsets,
   positiveOffsets,
   incompleteDateFormats,
   validLimitValues,
   invalidLimitValues,
   validZoneCodes,
   invalidZoneCodes,
   validEventCodes,
   invalidEventCodes
} from '../../fixtures/test-data.json';

describe("Weather API Alert Types", () => {

   let realEventType = '911'
   let mockEventType = 'Craziness'

   function hasDuplicates(array: Array<any>) {
     return (new Set(array)).size !== array.length;
   }

   const removeDuplicates = (arr: Array<any> = []) => {
     const map = new Map();
     arr.forEach((x) => map.set(JSON.stringify(x), x));
     arr = [...map.values()];
     return arr;
   };

   context("alerts/types gets a list of alert types and checks the first one", () => {

      it("gets the list from the real resource", () => {
         cy.request("GET", `alerts/types`).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.eventTypes[0]).to.contains(realEventType);
         })
      })

      it("gets the list from the fixture mock", () => {
         cy.fixture('alerts/types-stub').then(response => {
            cy.intercept('alerts/types', response)
            expect(response.eventTypes[0]).to.contains(mockEventType);
         })
      })

      it('503 error returns the correct response', () => {
         cy.intercept({
               url: 'alerts/types',
            }, {
               statusCode: 503
            }),
            (request: any) => {
               request.on('response', (response: any) => {
                  expect(response.status).to.eq(503);
                  expect(response).to.have.property("correlationId");
                  expect(response).to.have.property("title");
                  expect(response.title).to.eq("Service Unavailable")
                  expect(response).to.have.property("detail");
                  expect(response).to.have.property("type");
                  expect(response.type).to.eq("https://api.weather.gov/problems/ServiceUnavailable")
                  expect(response).to.have.property("instance");
             })
         }  
      })

      it('500 error returns the correct response', () => {
         cy.intercept({
               url: 'alerts/types',
            }, {
               statusCode: 500
            }),
            (request: any) => {
               request.on('response', (response: any) => {
                  expect(response.status).to.eq(500);
                  expect(response).to.have.property("correlationId");
                  expect(response).to.have.property("title");
                  expect(response.title).to.eq("Service Unavailable")
                  expect(response).to.have.property("detail");
                  expect(response).to.have.property("type");
                  expect(response.type).to.eq("https://api.weather.gov/problems/ServiceUnavailable")
                  expect(response).to.have.property("instance");
             })
         }  
      })

   })



   context("alerts/point", () => {

      it("error message for invalid coordinates", () => {
         cy.fixture('alerts/point-out-of-bounds').then(response => {
            cy.intercept('/alerts?point=38.09,-43.999999', response)
            expect(response.status).to.eq(400);
            expect(response).to.have.property("correlationId");
            expect(response).to.have.property("type");
            expect(response).to.have.property("title");
            expect(response).to.have.property("detail");
            expect(response).to.have.property("instance");
            expect(response.title).to.eq("Invalid Parameter");
         })
      });

      it("error message for upstream data receipt issue", () => {
         cy.fixture('alerts/point-out-of-bounds').then(response => {
            cy.intercept({ method: 'GET', url: '/alerts?point=38.09,-43.999999'}, response)
            expect(response.status).to.eq(400);
            expect(response).to.have.property("correlationId");
            expect(response).to.have.property("type");
            expect(response).to.have.property("title");
            expect(response).to.have.property("detail");
            expect(response).to.have.property("instance");
            expect(response.title).to.eq("Invalid Parameter");
         })
      });

      it('503 error returns the correct response', () => {
         cy.intercept({
               method: 'GET', url: 'alerts?point=38.09,-43.999999'}, {
               statusCode: 503
            }),
            (request: any) => {
               request.on('response', (response: any) => {
                  expect(response.status).to.eq(503);
                  expect(response).to.have.property("correlationId");
                  expect(response).to.have.property("title");
                  expect(response.title).to.eq("Service Unavailable");
                  expect(response).to.have.property("detail");
                  expect(response).to.have.property("type");
                  expect(response.type).to.eq("https://api.weather.gov/problems/ServiceUnavailable");
                  expect(response).to.have.property("instance");
            })
         }  
      })

      it('500 error returns the correct response', () => {
      cy.intercept({ method: 'GET', url: '/alerts?point=38.09,-43.999999/'}, {
               statusCode: 500
            }),
            (request: any) => {
               request.on('response', (response: any) => { 
                  expect(response.status).to.eq(500) 
                  expect(response).to.have.property("correlationId");
                  expect(response).to.have.property("title");
                  expect(response.title).to.eq("Service Unavailable");
                  expect(response).to.have.property("detail");
                  expect(response).to.have.property("type");
                  expect(response.type).to.eq("https://api.weather.gov/problems/ServiceUnavailable");
                  expect(response).to.have.property("instance");
            })
         }  
      })

      it("pretty prints the alert description", () => {
         cy.fixture('alerts/point').then(response => {
            cy.intercept({ method: 'GET', url: '/alerts?point=38.09,-76.999999'}, response)
            var forecastFeatures = response.features;
            forecastFeatures.forEach(function(forecastFeature: any) {
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

      it('503 error returns the correct response', () => {
         cy.intercept({
               method: 'GET',
               url: 'alerts/active',
            }, {
               statusCode: 503
            }),
            (request: any) => {
               request.on('response', (response: any) => {
                  expect(response.status).to.eq(503);
                  expect(response).to.have.property("correlationId");
                  expect(response).to.have.property("title");
                  expect(response.title).to.eq("Service Unavailable")
                  expect(response).to.have.property("detail");
                  expect(response).to.have.property("type");
                  expect(response.type).to.eq("https://api.weather.gov/problems/ServiceUnavailable")
                  expect(response).to.have.property("instance");
             })
         }  
      })

      it('500 error returns the correct response', () => {
         cy.intercept({
               url: 'alerts/active',
            }, {
               statusCode: 500
            }),
            (request: any) => {
               request.on('response', (response: any) => {
                  expect(response.status).to.eq(500);
                  expect(response).to.have.property("correlationId");
                  expect(response).to.have.property("title");
                  expect(response.title).to.eq("Service Unavailable")
                  expect(response).to.have.property("detail");
                  expect(response).to.have.property("type");
                  expect(response.type).to.eq("https://api.weather.gov/problems/ServiceUnavailable")
                  expect(response).to.have.property("instance");
         })
         }  
      })

      queryParameters.forEach((item: any) => {
      let queryParameter = item.parameter;
         it("config for " + queryParameter + " query parameter matches values in error message array", () => {
            cy.request({
               url: `/alerts/active?` + queryParameter,
               failOnStatusCode: false,
            }).then((response: any) => {
               var errorMessage = response.body.parameterErrors[0].message;
               var parsedErrorMessageValues = (errorMessage).replace(/Does not have a value in the enumeration/g, "");
               var errorMessageValues = JSON.parse(parsedErrorMessageValues);
               errorMessageValues.forEach(function(errorMessageValue: any) {
                  cy.request({
                     url: `/alerts?` + queryParameter + `=` + errorMessageValue,
                     failOnStatusCode: false,
                  }).then((response) => {
                     expect(response.status).to.eq(200);
                  })
               })
            })
         })

         it("error message for invalid request for valid query paramater - " + queryParameter + " - is correct", () => {
            cy.fixture('alerts/invalid-request-valid-query-parameter-' + queryParameter).then(response => {
               cy.intercept({ method: 'GET', url: '/alerts/active?' + queryParameter}, response)
                  expect(response).to.have.property("correlationId");
                  expect(response).to.have.property("parameterErrors");
                  expect(response).to.have.property("title");
                  expect(response).to.have.property("detail");
                  expect(response.title).to.eq("Bad Request");
                  expect(response.detail).to.eq("Bad Request");
                  expect(response.parameterErrors[0]).to.have.property("message");
                  var errorMessage = response.parameterErrors[0].message;
                  var parsedErrorMessageValues = String(errorMessage).replace(/Does not have a value in the enumeration/g, "");
                  var errorMessageValues = JSON.parse(parsedErrorMessageValues);
                  expect(String(item.enumeration)).to.eq(String(errorMessageValues));
                  expect(response.parameterErrors[0].parameter).to.contain("query\." + queryParameter + "[0]");
                  })
            })
         })

      it("does not show results for multiple zones", () => {
         cy.fixture('alerts/multiple-zones-invalid-request').then(response => {
            cy.intercept({ method: 'GET', url: '/alerts?zone=MDC031&zone=MDC029'}, response)
               expect(response).to.have.property("correlationId");
               expect(response).to.have.property("parameterErrors");
               expect(response).to.have.property("title");
               expect(response).to.have.property("detail");
               expect(response.title).to.eq("Bad Request");
               expect(response.detail).to.eq("Bad Request");
               expect(response.parameterErrors[0]).to.have.property("message");
               expect(response.parameterErrors[0].message).to.contain("Failed to match exactly one schema");
               })
         })
      

      it("alerts/active/active?zone= schema", () => {
         cy.request({
            url: `/alerts/active?zone=MDC031`,
            failOnStatusCode: false,
         }).then((response: any) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property("@context");
            expect(response.body).to.have.property("title");
            expect(response.body).to.have.property("updated");
            var context = response.body["@context"][1];
            expect(context).to.have.property("@version");
            expect(context).to.have.property("@vocab");
            expect(context).to.have.property("wx");
            expect(response.body).to.have.property("type");
            expect(response.body).to.have.property("features");
            var features = response.body.features[0];
            expect(features).to.have.property("id");
            expect(features).to.have.property("type");
            expect(features).to.have.property("geometry");
            expect(features).to.have.property("properties");
            var properties = response.body.features[0].properties;
            expect(properties).to.have.property("@id");
            expect(properties).to.have.property("@type");
            expect(properties).to.have.property("id");
            expect(properties).to.have.property("areaDesc");
            expect(properties).to.have.property("geocode");
            expect(properties.geocode).to.have.property("SAME");
            expect(properties.geocode).to.have.property("UGC");
            expect(properties).to.have.property("affectedZones");
            expect(properties).to.have.property("references");
            expect(properties).to.have.property("sent");
            expect(properties).to.have.property("effective");
            expect(properties).to.have.property("onset");
            expect(properties).to.have.property("expires");
            expect(properties).to.have.property("ends");
            expect(properties).to.have.property("status");
            expect(properties).to.have.property("messageType");
            expect(properties).to.have.property("category");
            expect(properties).to.have.property("severity");
            expect(properties).to.have.property("certainty");
            expect(properties).to.have.property("urgency");
            expect(properties).to.have.property("references");
            expect(properties).to.have.property("event");
            expect(properties).to.have.property("sender");
            expect(properties).to.have.property("senderName");
            expect(properties).to.have.property("headline");
            expect(properties).to.have.property("description");
            expect(properties).to.have.property("instruction");
            expect(properties).to.have.property("response");
            expect(properties).to.have.property("parameters");
            expect(properties.parameters).to.have.property("AWIPSidentifier");
            expect(properties.parameters).to.have.property("WMOidentifier");
            expect(properties.parameters).to.have.property("BLOCKCHANNEL");
         })
      })
   })

   context("alerts", () => {

      it('503 error returns the correct response', () => {
         cy.intercept({
            method: 'GET',
            url: 'alerts',
         }, {
            statusCode: 503
         }),
         (request: any) => {
            request.on('response', (response: any) => {
               expect(response.status).to.eq(503);
               expect(response).to.have.property("correlationId");
               expect(response).to.have.property("title");
               expect(response.title).to.eq("Service Unavailable")
               expect(response).to.have.property("detail");
               expect(response).to.have.property("type");
               expect(response.type).to.eq("https://api.weather.gov/problems/ServiceUnavailable")
               expect(response).to.have.property("instance");
            })
         }  
      })

      it('500 error returns the correct response', () => {
         cy.intercept({
               method: 'GET',
               url: 'alerts',
            }, {
               statusCode: 500
            }),
            (request: any) => {
               request.on('response', (response: any) => {
                  expect(response.status).to.eq(500);
                  expect(response).to.have.property("correlationId");
                  expect(response).to.have.property("title");
                  expect(response.title).to.eq("Service Unavailable")
                  expect(response).to.have.property("detail");
                  expect(response).to.have.property("type");
                  expect(response.type).to.eq("https://api.weather.gov/problems/ServiceUnavailable")
                  expect(response).to.have.property("instance");
             })
         }  
      })

      var dateTimeValue = "2020-05-14T05:40:08Z"
      it("shouldn't accept the same start and end time - " + dateTimeValue + " - as parameter values", () => {
         cy.fixture('alerts/same-start-end-invalid-request').then(response => {
            cy.intercept({ method: 'GET', url: '/alerts?start=' + dateTimeValue + '&end=' + dateTimeValue}, response)
               expect(response.status).to.eq(400);
         })
      })

      var invalidQueryParameter = "response";
      it("shows the right information for invalid query parameter - " + invalidQueryParameter + " - error response", () => {
         cy.request({
            url: `/alerts?` + invalidQueryParameter + `=Avoid`,
            failOnStatusCode: false,
         }).then((response: any) => {
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
         }).then((response: any) => {
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
         cy.request({
            url: `/alerts`,
            failOnStatusCode: false,
         }).then((response) => {
            expect(response.status).to.eq(200);
            let alerts = response.body.features;
            let alertIds = new Array();
            let count = 0;
            let linksToMatchRegex = /https:\/\/api\.weather\.gov\/alerts\/urn:oid:2\.49\.0\.1\.840\.0.*/;
            alerts.forEach(function(alert: any) {
               alertIds.push(alert.id);
               count++;
               expect(linksToMatchRegex.test(alert.id)).to.equal(true);
            });
            expect(hasDuplicates(alertIds).toString() === "false");
            expect(alertIds.length).to.eq(count);
         })
      })

      invalidZoneCodes.forEach((invalidZoneCode: any) => {
         it("does not accept invalid zone " + invalidZoneCode, () => {
            cy.request({
               url: `/alerts?zone=` + invalidZoneCode,
               failOnStatusCode: false,
            }).then((response) => {
               expect(response.status).to.eq(400);
            })
         })
      })

      validZoneCodes.forEach((validZoneCode: any) => {
         it("does accept valid zone " + validZoneCode, () => {
            cy.request({
               url: `/alerts?zone=` + validZoneCode,
               failOnStatusCode: false,
            }).then((response) => {
               expect(response.status).to.eq(200);
            })
         })
      })

      invalidEventCodes.forEach((invalidEventCode: any) => {
         it("does not accept invalid event " + invalidEventCode, () => {
            cy.request({
               url: `/alerts?event=` + invalidEventCode,
               failOnStatusCode: false,
            }).then((response) => {
               expect(response.status).to.eq(400);
            })
         })
      })

      validEventCodes.forEach((validEventCode: any) => {
         it("does accept valid event " + validEventCode, () => {
            cy.request({
               url: `/alerts?event=` + validEventCode,
               failOnStatusCode: false,
            }).then((response) => {
               expect(response.status).to.eq(200);
            })
         })
      })

      negativeOffsets.forEach((item: any) => {
         var negativeOffset = item.offset;
         var number = item.number;
         it("does not accept negative offset version " + negativeOffset, () => {
         cy.fixture('alerts/negative-offset-' + number).then(response => {
            cy.intercept({ method: 'GET', url: '/alerts?start=' + negativeOffset}, response)
               expect(response.status).to.eq(400);
            })
         })
      })

      positiveOffsets.forEach((positiveOffset: any) => {
         it("does not accept positive offset version " + positiveOffset, () => {
            cy.request({
               url: `/alerts?start=` + positiveOffset,
               failOnStatusCode: false,
            }).then((response) => {
               expect(response.status).to.eq(400);
            })
         })
      })

      validLimitValues.forEach((validLimitValue: any) => {
         it("number of alerts matches requested limit: " + validLimitValue, () => {
            cy.request({
               url: `/alerts?limit=` + validLimitValue,
               failOnStatusCode: false,
            }).then((response) => {
               var number = response.body.features.length;
               expect(response.status).to.eq(200);
               expect(number).to.eq(validLimitValue);
            })
         })
      })

      invalidLimitValues.forEach((item: any) => {
         it("uses the most correct error message for incorrectly formatted alert searches in the path: /alerts?limit=" + item.number, () => {
            cy.request({
               url: `/alerts?limit=` + item.number,
               failOnStatusCode: false,
            }).then((response) => {
               expect(response.status).to.eq(400);
               expect(response.body.parameterErrors[0].message).to.eq("Must have a " + item.text + " value of " + item.value);
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

      incompleteDateFormats.forEach((incompleteDateFormat: any) => {
         it("requires the full date and does not accept " + incompleteDateFormat, () => {
            cy.request({
               url: `/alerts?start=` + incompleteDateFormat,
               failOnStatusCode: false,
            }).then((response) => {
               expect(response.status).to.eq(400);
            })
         })
      })
   })
})