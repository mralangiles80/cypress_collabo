pipeline{

  agent any

  // parameters{
  //   string(name: 'SPEC', defaultValue: "cypress/e2e/weather-api/weather1.cy.js", description: "Enter spec to run")
  //   choice(name: 'BROWSER', choices: ['chrome', 'edge', 'firefox'], description: 'Choose browser to run on')
  // }

  stages{
    stage('Build container and run tests'){
      steps{
        sh "docker build . -t cypress-build"
        sh "docker run cypress-build npx cypress run -b chrome"
      }
    }
  }
}