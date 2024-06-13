describe("Weather API Alert Types", () => {

  let realEventType = '911'
  let mockEventType = 'Craziness'
  let url = 'https://api.weather.gov/alerts/types'

  function hasDuplicates(array) {
    return (new Set(array)).size !== array.length;
  }

  before(() => {
    cy.intercept({ url: url },
      { fixture: 'alert-types-stub.json' }
    )
  })

  context("gets a list of alert types and checks the first one", () => {

    it.only("/gridpoints/{wfo}/{x},{y}/forecast schema must be", () => {
      cy.request("GET", `gridpoints/ABQ/24,106/forecast`).then((response) => {
        expect(response.status).to.eq(200);
        var count = 0;
        var forecastPeriods = response.body.properties.periods;
        forecastPeriods.forEach(function(forecastPeriod) {
        count++;
        expect(forecastPeriod).to.have.property("number");
        expect(forecastPeriod).to.have.property("name");
        expect(forecastPeriod).to.have.property("startTime");
        expect(forecastPeriod).to.have.property("endTime");
        expect(forecastPeriod).to.have.property("temperature");
        expect(forecastPeriod).to.have.property("temperatureUnit");
        expect(forecastPeriod).to.have.property("temperatureUnit");
        expect(forecastPeriod).to.have.property("temperatureTrend");
        expect(forecastPeriod).to.have.property("probabilityOfPrecipitation");
        expect(forecastPeriod.probabilityOfPrecipitation).to.have.property("unitCode");
        expect(forecastPeriod.probabilityOfPrecipitation).to.have.property("value");
        expect(forecastPeriod).to.have.property("dewpoint");
        expect(forecastPeriod.dewpoint).to.have.property("unitCode");
        expect(forecastPeriod.dewpoint).to.have.property("value");
        expect(forecastPeriod).to.have.property("relativeHumidity");
        expect(forecastPeriod.relativeHumidity).to.have.property("unitCode");
        expect(forecastPeriod.relativeHumidity).to.have.property("value");
        expect(forecastPeriod).to.have.property("windSpeed");
        expect(forecastPeriod).to.have.property("windDirection");
        expect(forecastPeriod).to.have.property("icon");
        expect(forecastPeriod.icon).to.contain("day");
        expect(forecastPeriod.icon).to.contain("night");
        expect(forecastPeriod).to.have.property("shortForecast");
        expect(forecastPeriod).to.have.property("detailedForecast");
        });
        expect(count == 14);
      })
    }),

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

    it("pretty prints the description", () => {
      cy.request("GET", `/alerts?point=38.09,-76.999999`).then((response) => {
      var forecastFeatures = response.body.features;
      forecastFeatures.forEach(function(forecastFeature) {
        var forecastFeatureDescription = forecastFeature.properties.description;
        if(forecastFeatureDescription.includes(" IN ")){
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
      });
      });
    })

    var dateTimeValue = "2020-05-14T05:40:08Z"
    it("shouldn't accept the same start and end time - " + dateTimeValue + " - as parameter values", () => {
      cy.request("GET", `/alerts?start=` + dateTimeValue + `&end= ` + dateTimeValue).then((response) => {
        expect(response.status).to.eq(400);
      })
    })

    var invalidQueryParameter = "response";
    it("shows the right information for invalid query parameter - " + invalidQueryParameter + " - error response", () => {
      cy.request({ url: `/alerts?` + invalidQueryParameter + `=Avoid`, failOnStatusCode: false,}).then((response) => {
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
      cy.request({ url: `/alerts?event=&&`, failOnStatusCode: false,}).then((response) => {
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
      cy.request("GET", `/alerts`).then((response) => {
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
      expect(count === alertIds.length);
      })
    })
    
    let queryParameters = ["urgency", "severity", "certainty", "status"];
    queryParameters.forEach(function(queryParameter) {

    it("config for " + queryParameter + " query parameter matches values in error message array", () => {
         cy.request({ url: `https://api.weather.gov/alerts?` + queryParameter, failOnStatusCode: false,}).then((response) => {
          var errorMessage = response.body.parameterErrors[0].message;
          var parsedErrorMessageValues = (errorMessage).replace(/Does not have a value in the enumeration/g, "");
          var errorMessageValues = JSON.parse(parsedErrorMessageValues);
          cy.task("log", errorMessageValues);
          errorMessageValues.forEach(function(errorMessageValue) {
          cy.task("log", errorMessageValue);
          cy.request({ url: `https://api.weather.gov/alerts?` + queryParameter + `=` + errorMessageValue , failOnStatusCode: false,}).then((response) => {
            expect(response.status).to.eq(200);
              })
          });
        })
      })

    it("error message for incomplete request for valid query manager " + queryParameter + " is correct", () => {
         cy.request({ url: `https://api.weather.gov/alerts?` + queryParameter, failOnStatusCode: false,}).then((response) => {
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
      cy.request("GET", `https://api.weather.gov/alerts?event=Flood%20Warning`).then((response) => {
        expect(response.status).to.eq(200);
      })
    })

    var searches = ["alerts/alerts", "alerts/alerts?severity=Severe", "alerts/alerts?severity=", "alerts/alerts?severity"]
    searches.forEach(function(search) {
    it("uses the most correct error message for incorrectly formatted alert searches in the path: " + search, () => {
        cy.request({ url: `https://api.weather.gov/` + search, failOnStatusCode: false,}).then((response) => {
          expect(response.status).to.eq(404);
        })
      })
    })

    it("does not accept positive offsets", () => {
      cy.request({ url: `/alerts?start=2020-05-14T05:40:08+00:00`, failOnStatusCode: false,}).then((response) => {
        expect(response.status).to.eq(400);
      })
      cy.request({ url: `/alerts?start=2020-05-14T05:40:08+00`, failOnStatusCode: false,}).then((response) => {
        expect(response.status).to.eq(400);
      })
      cy.request({ url: `/alerts?start=2020-05-14T05:40:08+00:00:00`, failOnStatusCode: false,}).then((response) => {
        expect(response.status).to.eq(400);
      })
    })

    it("does not accept negative offsets", () => {
      cy.request({ url:`/alerts?start=2020-05-14T05:40:08-00:00`, failOnStatusCode: false,}).then((response) => {
        expect(response.status).to.eq(400);
      })
      // unhandled case
      cy.request({ url:`/alerts?start=2020-05-14T05:40:08-00:00:00`, failOnStatusCode: false,}).then((response) => {
        expect(response.status).to.eq(400);
      })
      cy.request({ url:`/alerts?start=2020-05-14T05:40:08-00`, failOnStatusCode: false,}).then((response) => {
        expect(response.status).to.eq(400);
      })
    })

    it("does accept miliseconds", () => {
      cy.request({ url:`/alerts?start=2020-05-14T05:40:08.000Z`, failOnStatusCode: false,}).then((response) => {
        expect(response.status).to.eq(200);
      })
    })

    it("requires punctuation", () => {
      cy.request({ url: `/alerts?start=20200514T054008Z`, failOnStatusCode: false,}).then((response) => {
        expect(response.status).to.eq(400);
      })
    })

    it("requires the full date", () => {
      cy.request({ url: `/alerts?start=2020-05-14`, failOnStatusCode: false,}).then((response) => {
        expect(response.status).to.eq(400);
      })
      cy.request({ url: `/alerts?start=2020-05-14T`, failOnStatusCode: false,}).then((response) => {
        expect(response.status).to.eq(400);
      })
    })

    it("does not show results for multiple zones", () => {
      cy.request({ url: `/alerts/active?zone=MDC033&zone=MDC031`, failOnStatusCode: false,}).then((response) => {
        expect(response.status).to.eq(400);
      })
    })

    it("title for zone alerts follows proper naming structure", () => {
      cy.request({ url: `/alerts/active?zone=MDC031`, failOnStatusCode: false,}).then((response) => {
        expect(response.status).to.eq(200);
        let alerts = response.body.features[0].properties;
        expect(response.body.title).to.contain("Current watches, warnings, and advisories for " + alerts.areaDesc);
      })
    })

    it("requires YYYY-MM-DD", () => {
      // no error handling for YYYY-DD-MM
      cy.request({ url: `/alerts?start=2020-14-05T05:40:08Z`, failOnStatusCode: false,}).then((response) => {
        expect(response.status).to.eq(400);
      })
      cy.request({ url: `/alerts?start=2020-05-14T05:40:08Z`, failOnStatusCode: false,}).then((response) => {
        expect(response.status).to.eq(200);
      })
    })
  })
})