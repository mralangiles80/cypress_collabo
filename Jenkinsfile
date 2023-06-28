pipeline{

  agent any

  parameters{
    string(name: 'SPEC', defaultValue: "cypress/e2e/weather-api/weather1.cy.js", description: "Enter spec to run")
    choice(name: 'BROWSER', choices: ['chrome', 'edge', 'firefox'], description: 'Choose browser to run on')
  }

  stages{
    stage('Build and run tests'){
      steps{
        sh "docker run -v $PWD:/e2e -w /e2e cypress/included:12.15.0"
      }
    }
  }
}