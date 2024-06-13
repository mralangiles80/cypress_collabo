import moment from 'moment';

describe("Newsworthy Alerts If The Asserts Fail", () => {

  var NMlongtitudes = [];

  for (var i = 103; i <= 109; i++) { NMlongtitudes.push(i);  }
  const NMregionalOffice = 'ABQ';

  const d = new Date();
  let month = d.getMonth() + 1;

  var historicalTemperatureFinal = {
      count: 0,
      sum: 0,
      average: 0
  };

  var temperatureFinal = {
      count: 0,
      sum: 0,
      average: 0
  };

  context("Newsworthy events", () => {
    var currentDay = moment(d).format("YYYY-MM-DD");
    it("the current snowfall is NOT within normal range for this month - " + month + " - in texas", () => {
      cy.request("GET", `https://data.rcc-acis.org/StnData?sid=DALthr&sdate=2009-01-01&edate=` + currentDay + `&elems=10&output=json`).then((response) => {
        expect(response.status).to.eq(200);
        var historicalSnowFalls = response.body.data;
        historicalSnowFalls.forEach(function(historicalSnowFall) {
          var historicalDateData = moment(historicalSnowFall[0]).format("M");
            if (historicalSnowFall[1] !== 'T' && historicalSnowFall[1] !== 'M') {
              if (historicalDateData == month) {
                historicalTemperatureFinal.sum += JSON.parse(historicalSnowFall[1]);
                historicalTemperatureFinal.count++;
                historicalTemperatureFinal.average = historicalTemperatureFinal.sum/historicalTemperatureFinal.count;
              };
            };
        });
      });
      var historicalData = Object.values(historicalTemperatureFinal).map(h => h);
      var historicalMonthData = historicalData.count;

      cy.request({ url: `gridpoints/FWD/32,96`}).then((response) => {
        expect(response.status).to.eq(200);
        var forecastSnowFallAmounts = response.body.properties.snowfallAmount.values;
        forecastSnowFallAmounts.forEach(function(forecastSnowFallAmount) {
          var snowFallAmountValidTime = (forecastSnowFallAmount.validTime).replace(/\/.*/g, "");
          var dateData = moment(snowFallAmountValidTime).format("M");
          if (dateData == month) {
            temperatureFinal.sum += JSON.parse(forecastSnowFallAmount.value);
            temperatureFinal.count++;
            temperatureFinal.average = temperatureFinal.sum/temperatureFinal.count;
          };
        });
      });
      var forecastData = Object.values(temperatureFinal).map(h => h);
      var forecastMonthData = forecastData.count;
      
      function StandardDeviation(arr) {

          // Creating the mean with Array.reduce
          let mean = arr.reduce((acc, curr) => {
              return acc + curr
          }, 0) / arr.length;

          // Assigning (value - mean) ^ 2 to
          // every array item
          arr = arr.map((k) => {
              return (k - mean) ** 2
          });

          // Calculating the sum of updated array 
          let sum = arr.reduce((acc, curr) => acc + curr, 0);

          // Calculating the variance
          let variance = sum / arr.length

          // Returning the standard deviation
          return Math.sqrt(sum / arr.length)
      }
      var number = StandardDeviation([historicalMonthData,forecastMonthData]);
      expect(number < 0.9);
    }),
    it("there is NOT a hurricane due in florida in the next 48 hours", () => {
      cy.request({ 
        url: `/alerts/active/area/FL`}).then((response) => {
        var alerts = response.body.features;
        alerts.forEach(function(alert) {
          expect(alert.properties.event).to.not.contain("Hurricane Warning");
        });
      }) 
    }),
    it("iceAccumulation < 1inch in new mexico", () => {
      NMlongtitudes.forEach(function(NMlongtitude) {
        cy.request("GET", `gridpoints/${NMregionalOffice}/31,${NMlongtitude}`).then((response) => {
          expect(response.status).to.eq(200);
          var forecasticeAccumulations = response.body.properties.iceAccumulation.values;
          forecasticeAccumulations.forEach(function(forecasticeAccumulation) {
            expect(forecasticeAccumulation.value < 3);
          })
        })
      })
    })
  })
})