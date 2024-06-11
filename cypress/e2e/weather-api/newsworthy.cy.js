import moment from 'moment';

describe("Newsworthy Alerts If The Asserts Fail", () => {

  var NMlongtitudes = [];

  for (var i = 103; i <= 109; i++) { NMlongtitudes.push(i);  }
  const NMregionalOffice = 'ABQ';

  const d = new Date();
  let month = d.getMonth() + 1;

  var HxAxis = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']; // contains months (representing as integer)
  HxAxis.push(month.toString());
  var HtemperatureFinal = {};
  HxAxis.forEach(month => {
    HtemperatureFinal[month] = {
      month,
      count: 0,
      sum: 0,
      average: 0
    }
  });

  var xAxis = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']; // contains months (representing as integer)
  var temperatureFinal = {};
  xAxis.forEach(month => {
    temperatureFinal[month] = {
      month,
      count: 0,
      sum: 0,
      average: 0
    }
  });

  context("Newsworthy events", () => {
    var currentDay = moment(d).format("YYYY-MM-DD");
    it("the current snowfall is NOT within normal (within 90th percentile?) range for this month in texas", () => {
      cy.request("GET", `https://data.rcc-acis.org/StnData?sid=DALthr&sdate=2009-01-01&edate=` + currentDay + `&elems=10&output=json`).then((response) => {
        expect(response.status).to.eq(200);
        var HsnowFalls = response.body.data;
        HsnowFalls.forEach(function(HsnowFall) {
          var HdateData = moment(HsnowFall[0]).format("M");
          HxAxis.forEach(function(value) {
            if (HsnowFall[1] !== 'T' && HsnowFall[1] !== 'M') {
              if (HdateData === value && HdateData == month) {
                HtemperatureFinal[value].sum += JSON.parse(HsnowFall[1]);
                HtemperatureFinal[value].count++;
                HtemperatureFinal[value].average = HtemperatureFinal[value].sum/HtemperatureFinal[value].count;
              };
            };
          });
        });
      });
      var historicalData = Object.values(HtemperatureFinal).map(h => h );
      var historicalMonthData = historicalData[parseInt(month)].count;
      cy.request({ url: `gridpoints/FWD/119,69`}).then((response) => {
        expect(response.status).to.eq(200);
        var forecastSnowFallAmounts = response.body.properties.snowfallAmount.values;
        forecastSnowFallAmounts.forEach(function(forecastSnowFallAmount) {
          var cleanString = (forecastSnowFallAmount.validTime).replace(/\/.*/g, "");
          var dateData = moment(cleanString).format("M");
          xAxis.forEach(function(value) {
          if (dateData === value && dateData == month) {
            temperatureFinal[value].sum += JSON.parse(forecastSnowFallAmount.value);
            temperatureFinal[value].count++;
            temperatureFinal[value].average = temperatureFinal[value].sum/temperatureFinal[value].count;
            }
          });
        });
      });
      var forecastData = Object.values(temperatureFinal).map(h => h );
      var forecastMonthData = forecastData[parseInt(month)].count;
      
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
    it("assert there is NOT a hurricane due in florida in the next 48 hours", () => {
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