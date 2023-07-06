pipeline{

  agent any

  // parameters{
  //   string(name: 'SPEC', defaultValue: "cypress/e2e/weather-api/weather1.cy.js", description: "Enter spec to run")
  //   choice(name: 'BROWSER', choices: ['chrome', 'edge', 'firefox'], description: 'Choose browser to run on')
  // }

  stages{
    stage('Build and run tests'){
      steps{
        sh "docker build -t cypress-test-browser"
        sh "docker run -it cypress-test-browser -b chrome"
      }
    }
  }
}