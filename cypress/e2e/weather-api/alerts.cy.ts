import {
   queryParameters,
   negativeOffsets,
   positiveOffsets,
   invalidDateFormats,
   validLimitValues,
   invalidLimitValues,
   validZoneCodes,
   invalidZoneCodes,
   validEventCodes,
   invalidEventCodes,
   invalidAreaCodes
} from '../../fixtures/test-data.json';


interface WeatherAPIResponse {
  '@context': any;
  type: string;
  features: Feature[];
  title: string;
  updated: string;
  pagination: {
    next: string;
  };
}

interface Request {
   url: string;
   on: (response: any, responseBody: any) => void;
}

interface QueryParameter {
   parameter: string; 
   enumeration: {};
}

interface Response {
   status: number;
   body: ErrorResponse;
}

interface ErrorResponse {
   correlationId: string;
   title: string;
   detail: string;
   type: string;
   instance: string;
   status: number;
   parameterErrors: ParameterErrors[];
}

interface ParameterErrors {
   parameter: string;
   message: string;
}

interface Feature {
  id: string;
  type: string;
  geometry: null | {
    type: string;
    coordinates: number[][][];
  };
  properties: FeatureProperties;
}

interface FeatureProperties {
  '@id': string;
  '@type': string;
  id: string;
  areaDesc: string;
  geocode: {
    SAME: string[];
    UGC: string[];
  };
  affectedZones: string[];
  references: any[];
  sent: string;
  effective: string;
  onset: string;
  expires: string;
  ends: string | null;
  status: string;
  messageType: string;
  category: string;
  severity: string;
  certainty: string;
  urgency: string;
  event: string;
  sender: string;
  senderName: string;
  headline: string | null;
  description: string;
  instruction: string | null;
  response: string;
  parameters: {
    AWIPSidentifier: string[];
    WMOidentifier: string[];
    BLOCKCHANNEL: string[];
    [key: string]: any;
  };
}

function getLastWeekDates(startOffset: number, endOffset: number) {
  const dates = [];
  const now = new Date();
  
  for (let i = startOffset; i < endOffset; i++) {
    const date = new Date(now);
    date.setUTCDate(now.getUTCDate() - i);
    dates.push(date.toISOString().slice(0, 19) + 'Z');
  }
  
  return dates.reverse();
}

describe('Weather API Response Structure Validation', () => {

   
})

describe('Weather API Response Structure Validation', () => {
  let apiResponse: WeatherAPIResponse;

  before(() => {
    // Use a fixture instead of making an API call
    cy.fixture('alerts/alerts-example').then((response) => {
      apiResponse = response;
    });
  });

  it('should have the correct top-level structure', () => {
    expect(apiResponse).to.have.all.keys('@context', 'type', 'features', 'title', 'updated', 'pagination');
    expect(apiResponse.type).to.equal('FeatureCollection');
    expect(apiResponse.features).to.be.an('array');
    expect(apiResponse.title).to.be.a('string');
    expect(apiResponse.updated).to.be.a('string');
    expect(apiResponse.pagination).to.be.an('object').and.to.have.property('next').that.is.a('string');
  });

  it('should have valid features', () => {
    const sampleSize = Math.min(5, apiResponse.features.length);
    const sampleFeatures = apiResponse.features.slice(0, sampleSize);

    sampleFeatures.forEach((feature: Feature) => {
      expect(feature).to.have.all.keys('id', 'type', 'geometry', 'properties');
      expect(feature.type).to.equal('Feature');
      if (feature.geometry) {
        expect(feature.geometry.type).to.equal('Polygon');
        expect(feature.geometry.coordinates).to.be.an('array');
      }
    });
  });

  it('should have valid properties for each feature', () => {
    const sampleSize = Math.min(5, apiResponse.features.length);
    const sampleFeatures = apiResponse.features.slice(0, sampleSize);

    sampleFeatures.forEach((feature: Feature) => {
      const props = feature.properties;
      expect(props).to.include.all.keys(
        '@id', '@type', 'id', 'areaDesc', 'geocode', 'affectedZones', 'references',
        'sent', 'effective', 'onset', 'expires', 'ends', 'status', 'messageType',
        'category', 'severity', 'certainty', 'urgency', 'event', 'sender', 'senderName',
        'headline', 'description', 'instruction', 'response', 'parameters'
      );

      expect(props['@type']).to.equal('wx:Alert');
      expect(props.geocode).to.have.all.keys('SAME', 'UGC');
      expect(props.parameters).to.include.all.keys('AWIPSidentifier', 'WMOidentifier', 'BLOCKCHANNEL');
    });
  });
});

describe('Query Parameter Tests', () => {
  queryParameters.forEach((item: QueryParameter) => {
    const queryParameter = item.parameter;

      it(`config for ${queryParameter} query parameter matches values in error message array`, () => {
         cy.request({
            url: `/alerts/active?${queryParameter}`,
            failOnStatusCode: false,
         }).then((response: {body: ErrorResponse}) => {
            const errorMessage = response.body.parameterErrors[0].message;
            const parsedErrorMessageValues = (errorMessage).replace(/Does not have a value in the enumeration/g, "");
            const errorMessageValues = JSON.parse(parsedErrorMessageValues);
            const requests = errorMessageValues.map((errorMessageValue: string) =>
                cy.request({
                  url: `/alerts?${queryParameter}=${errorMessageValue}`,
                  failOnStatusCode: false,
                }).then((response) => {
                   expect(response.status).to.eq(200);
                })
              );
            });
            
         })
      

    it(`error message for invalid request for valid query parameter - ${queryParameter} - is correct`, () => {
      cy.fixture(`alerts/invalid-request-valid-query-parameter-${queryParameter}`).then((response) => {
        cy.intercept({ method: 'GET', url: `/alerts/active?${queryParameter}` }, response);

        // Perform all assertions in a single pass
        expect(response).to.include.keys('correlationId', 'parameterErrors', 'title', 'detail');
        expect(response.title).to.eq('Bad Request');
        expect(response.detail).to.eq('Bad Request');
        expect(response.parameterErrors[0]).to.have.property('message');

        const errorMessage = response.parameterErrors[0].message;
        const errorMessageValues = JSON.parse(
          String(errorMessage).replace(/Does not have a value in the enumeration/g, '')
        );

        expect(String(item.enumeration)).to.eq(String(errorMessageValues));
        expect(response.parameterErrors[0].parameter).to.contain(`query.${queryParameter}[0]`);
      });
    });
  });
});


describe("Weather API Alert Types", () => {

   let realEventType = '911'
   let mockEventType = 'Craziness'

   function hasDuplicates(array: Array<number>) {
     return (new Set(array)).size !== array.length;
   }

   const removeDuplicates = (arr: Array<number> = []) => {
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
            (request: Request) => {
               request.on('response', (response: ErrorResponse) => {
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
            (request: Request) => {
               request.on('response', (response: ErrorResponse) => {
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

      it("error message for upstream data receipt issue", () => {
         cy.fixture('alerts/503-error').then(response => {
            cy.intercept({ method: 'GET', url: '/alerts?point=38.09,-43.999999'}, response)
            expect(response.status).to.eq(503);
            expect(response).to.have.property("correlationId");
            expect(response).to.have.property("type");
            expect(response).to.have.property("title");
            expect(response).to.have.property("detail");
            expect(response).to.have.property("instance");
            expect(response.title).to.eq("Service Unavailable");
            expect(response.type).to.eq("https://api.weather.gov/problems/ServiceUnavailable");
            expect(response.detail).to.eq("An upstream data source is temporarily unavailable. Please try again later. If this error continues, please contact support at nco.ops@noaa.gov.");
         })
      });

      it('503 error returns the correct response', () => {
         cy.intercept({
               method: 'GET', url: 'alerts?point=38.09,-43.999999'}, {
               statusCode: 503
            }),
            (request: Request) => {
               request.on('response', (response: ErrorResponse) => {
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
            (request: Request) => {
               request.on('response', (response: ErrorResponse) => { 
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

      it("pretty prints the alert description if exists", () => {
         cy.fixture('alerts/alert-description').then(response => {
            cy.intercept({ method: 'GET', url: '/alerts?point=38.09,-76.999999'}, response)
            var forecastFeatures = response.features;
            forecastFeatures.forEach(function(forecastFeature: Feature) {
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
            (request: Request) => {
               request.on('response', (response: ErrorResponse) => {
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
            (request: Request) => {
               request.on('response', (response: ErrorResponse) => {
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
   })

   context("alerts", () => {

      invalidDateFormats.forEach((invalidDateFormat: string) => {
         it(`requires the valid dateTime format and does not accept ${invalidDateFormat}`, () => {
            cy.request({
               url: `/alerts?start=${invalidDateFormat}`,
               failOnStatusCode: false,
            }).then((response) => {
        expect(response.status, `Failed for format: ${invalidDateFormat}`).to.eq(400);
            })
         })
      })

      it('503 error returns the correct response', () => {
         cy.intercept({
            method: 'GET',
            url: 'alerts',
         }, {
            statusCode: 503
         }),
         (request: Request) => {
            request.on('response', (response: ErrorResponse) => {
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
            (request: Request) => {
               request.on('response', (response: ErrorResponse) => {
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

      var dateTimeValue = "2020-05-14T05:40:08Z";
      it(`shouldn't accept the same start and end time - ${dateTimeValue} - as parameter values`, () => {
         cy.fixture('alerts/same-start-end-invalid-request').then(response => {
            cy.intercept({ method: 'GET', url: `/alerts?start=${dateTimeValue}&end=${dateTimeValue}`}, response)
               expect(response.status).to.eq(400);
         })
      })

      it(`should accept only start time - ${dateTimeValue} - as parameter values`, () => {
            cy.request({ method: 'GET', url: `/alerts?start=${dateTimeValue}&end=${dateTimeValue}`}).then((response) => {
               expect(response.status).to.eq(200);
            })
      })

      var startDateTimeValue = "2020-05-21T05:40:08Z";
      var endDateTimeValue = "2020-05-14T05:40:08Z";
      it(`shouldn't accept the end time before start time - ${dateTimeValue} - as parameter values`, () => {
         cy.fixture('alerts/end-date-before-start-date').then(response => {
            cy.intercept({ method: 'GET', url: `/alerts?start=${startDateTimeValue}&end=${endDateTimeValue}`}, response)
               expect(response.status).to.eq(400);
            })
      })

      it(`should accept only end time - ${dateTimeValue} - as parameter values`, () => {
            cy.request({ method: 'GET', url: `/alerts?start=${dateTimeValue}&end=${dateTimeValue}`}).then((response) => {
               expect(response.status).to.eq(200);
            })
      })

      const startAlertDates = getLastWeekDates(1, 8);
      startAlertDates.forEach((startAlertDate: string) => {
         it(`alerts start from valid dateTime ${startAlertDate}: /alerts?start=${startAlertDate}`, () => {
            cy.request({
               url: `/alerts?start=${startAlertDate}`,
               failOnStatusCode: false,
            }).then((response) => {
               expect(response.status).to.eq(200);
               expect(response.body.features.length).to.eq(500);
            })
         })
      })

      const endAlertDates = getLastWeekDates(0, 7);
      endAlertDates.forEach((endAlertDate: string) => {
         it(`alerts exist until valid dateTime ${endAlertDate}: /alerts?end=${endAlertDate}`, () => {
            cy.request({
               url: `/alerts?end=${endAlertDate}`,
               failOnStatusCode: false,
            }).then((response) => {
               expect(response.status).to.eq(200);
               expect(response.body.features.length).to.eq(500);
            })
         })
      })

      const outOfScopeAlertDates = getLastWeekDates(8, 15);
      outOfScopeAlertDates.forEach((outOfScopeAlertDate: string) => {
         it(`alerts before dateTime ${outOfScopeAlertDate} no longer exist: /alerts?start=${outOfScopeAlertDate}`, () => {
            cy.request({
               url: `/alerts?end=${outOfScopeAlertDate}`,
               failOnStatusCode: false,
            }).then((response) => {
               expect(response.status).to.eq(200);
               expect(response.body.features.length).to.eq(0);
            })
         })
      })

      var invalidQueryParameter = "response";
      it(`shows the right information for invalid query parameter - ${invalidQueryParameter} - error response`, () => {
         cy.request({
            url: `/alerts?${invalidQueryParameter}=Avoid`,
            failOnStatusCode: false,
         }).then((response: Response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property("correlationId");
            expect(response.body).to.have.property("parameterErrors");
            expect(response.body).to.have.property("title");
            expect(response.body).to.have.property("detail");
            expect(response.body.title).to.eq("Bad Request");
            expect(response.body.detail).to.eq("Bad Request");
            expect(response.body.parameterErrors[0]).to.have.property("parameter");
            expect(response.body.parameterErrors[0]).to.have.property("message");
            expect(response.body.parameterErrors[0].parameter).to.contain(`query\.${invalidQueryParameter}`);
            expect(response.body.parameterErrors[0].message).to.contain(`Query parameter \"${invalidQueryParameter}\" is not recognized`);
         })
      })

      it("shows the right information for event query parameter regex pattern error response", () => {
         cy.request({
            url: `/alerts?event=&&`,
            failOnStatusCode: false,
         }).then((response: Response) => {
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
            alerts.forEach(function(alert: {id: string}) {
               alertIds.push(alert.id);
               count++;
               expect(linksToMatchRegex.test(alert.id)).to.equal(true);
            });
            expect(hasDuplicates(alertIds).toString() === "false");
            expect(alertIds.length).to.eq(count);
         })
      })

      invalidZoneCodes.forEach((invalidZoneCode: string) => {
         it(`does not accept invalid zone ${invalidZoneCode}`, () => {
            cy.request({
               url: `/alerts?zone=${invalidZoneCode}`,
               failOnStatusCode: false,
            }).then((response) => {
               expect(response.status).to.eq(400);
            })
         })
      })

      validZoneCodes.forEach((validZoneCode: string) => {
         it(`does accept valid zone ${validZoneCode}`, () => {
            cy.request({
               url: `/alerts?zone=${validZoneCode}`,
               failOnStatusCode: false,
            }).then((response) => {
               expect(response.status).to.eq(200);
            })
         })
      })

      invalidEventCodes.forEach((invalidEventCode: string) => {
         it(`does not accept invalid event ${invalidEventCode}`, () => {
            cy.request({
               url: `/alerts?event=${invalidEventCode}`,
               failOnStatusCode: false,
            }).then((response) => {
               expect(response.status).to.eq(400);
            })
         })
      })

      validEventCodes.forEach((validEventCode: string) => {
         it(`does accept valid event ${validEventCode}`, () => {
            cy.request({
               url: `/alerts?event=${validEventCode}`,
               failOnStatusCode: false,
            }).then((response) => {
               expect(response.status).to.eq(200);
            })
         })
      })

      invalidAreaCodes.forEach((invalidAreaCode: string) => {
         it(`does not accept invalid area ${invalidAreaCode}`, () => {
            cy.request({
               url: `/alerts?area=${invalidAreaCode}`,
               failOnStatusCode: false,
            }).then((response) => {
               expect(response.status).to.eq(400);
            })
         })
      })

      negativeOffsets.forEach((item: {offset: string, number: number}) => {
         var negativeOffset = item.offset;
         var number = item.number;
         it(`does not accept negative offset version ${negativeOffset}`, () => {
         cy.fixture(`alerts/negative-offset-${number}`).then(response => {
            cy.intercept({ method: 'GET', url: `/alerts?start=${negativeOffset}`}, response)
               expect(response.status).to.eq(400);
            })
         })
      })

      positiveOffsets.forEach((positiveOffset: string) => {
         it(`does not accept positive offset version ${positiveOffset}`, () => {
            cy.request({
               url: `/alerts?start=${positiveOffset}`,
               failOnStatusCode: false,
            }).then((response) => {
               expect(response.status).to.eq(400);
            })
         })
      })

      validLimitValues.forEach((validLimitValue: number) => {
         it(`number of alerts matches requested limit: ${validLimitValue}`, () => {
            cy.request({
               url: `/alerts?limit=${validLimitValue}`,
               failOnStatusCode: false,
            }).then((response) => {
               var number = response.body.features.length;
               expect(response.status).to.eq(200);
               expect(number).to.eq(validLimitValue);
            })
         })
      })

      invalidLimitValues.forEach((item: {number: number, text: string, value: number}) => {
         it(`uses the most correct error message for incorrectly formatted alert searches in the path: /alerts?limit=${item.number}`, () => {
            cy.request({
               url: `/alerts?limit=${item.number}`,
               failOnStatusCode: false,
            }).then((response) => {
               expect(response.status).to.eq(400);
               expect(response.body.parameterErrors[0].message).to.eq(`Must have a ${item.text} value of ${item.value}`);
            })
         })
      })

      it(`does accept miliseconds`, () => {
         cy.request({
            url: `/alerts?start=2020-05-14T05:40:08.000Z`,
            failOnStatusCode: false,
         }).then((response) => {
            expect(response.status).to.eq(200);
         })
      })

      it(`requires punctuation`, () => {
         cy.request({
            url: `/alerts?start=20200514T054008Z`,
            failOnStatusCode: false,
         }).then((response) => {
            expect(response.status).to.eq(400);
         })
      })
   })
})