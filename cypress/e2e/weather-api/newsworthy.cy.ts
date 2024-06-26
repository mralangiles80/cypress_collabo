import moment from 'moment';

describe("Newsworthy Alerts If The Asserts Fail", () => {

   let NMlongtitudes = new Array();

   for (var i = 103; i <= 109; i++) {
      NMlongtitudes.push(i);
   }
   const NMregionalOffice = 'ABQ';

   const d = new Date();
   const month = d.getMonth() + 1;
   const monthString = String(month);

   function StandardDeviation(arr: Array<number>) {

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
               historicalSnowFalls.forEach(function(historicalSnowFall: string) {
                  var historicalDateData = moment(historicalSnowFall[0]).format("M");
                  if (historicalSnowFall[1] !== 'T' && historicalSnowFall[1] !== 'M') {
                     if (historicalDateData === monthString) {
                        historicalTemperatureFinal.sum += JSON.parse(historicalSnowFall[1]);
                        historicalTemperatureFinal.count++;
                        historicalTemperatureFinal.average = historicalTemperatureFinal.sum / historicalTemperatureFinal.count;
                     };
                  };
               });
            });
            var historicalData = Object.values(historicalTemperatureFinal).map(h => h);
            var historicalMonthData = historicalData.filter(i => i === 2).length;;

            cy.request({
               url: `gridpoints/FWD/32,96`
            }).then((response) => {
               expect(response.status).to.eq(200);
               var forecastSnowFallAmounts = response.body.properties.snowfallAmount.values;
               forecastSnowFallAmounts.forEach(function(forecastSnowFallAmount: {value:string, validTime:string}) {
                  var snowFallAmountValidTime = (forecastSnowFallAmount.validTime).replace(/\/.*/g, "");
                  var dateData = moment(snowFallAmountValidTime).format("M");
                  if (dateData == monthString) {
                     temperatureFinal.sum += JSON.parse(forecastSnowFallAmount.value);
                     temperatureFinal.count++;
                     temperatureFinal.average = temperatureFinal.sum / temperatureFinal.count;
                  };
               });
            });
            var forecastData = Object.values(temperatureFinal).map(h => h);
            var forecastMonthData = forecastData.filter(i => i === 2).length;;
            var number = StandardDeviation([historicalMonthData, forecastMonthData]);
            expect(number < 0.9);
         }),
         it("there is NOT a hurricane due in florida in the next 48 hours", () => {
            cy.request({
               url: `/alerts/active/area/FL`
            }).then((response) => {
               var alerts = response.body.features;
               alerts.forEach(function(alert: any) {
                  expect(alert.properties.event).to.not.eq("Hurricane Warning");
               });
            })
         }),
         it("iceAccumulation < 1inch in new mexico", () => {
            NMlongtitudes.forEach(function(NMlongtitude: number) {
               cy.request("GET", `gridpoints/${NMregionalOffice}/31,${NMlongtitude}`).then((response) => {
                  expect(response.status).to.eq(200);
                  var forecasticeAccumulations = response.body.properties.iceAccumulation.values;
                  forecasticeAccumulations.forEach(function(forecasticeAccumulation: Record<string, string>) {
                     var iceAccumulationValue = Number(forecasticeAccumulation.value);
                     expect(iceAccumulationValue).to.be.lessThan(3);
                  })
               })
            })
         })
   })
})