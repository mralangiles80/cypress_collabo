pipeline{

  agent any

  parameters{
    string(name: 'SPEC', defaultValue: "cypress/e2e/**/**", description: "Enter spec to run")
    choice(name: 'BROWSER', choices: ['chrome', 'edge', 'firefox'], description: 'Choose browser to run on')
  }

  stages{
    stage('Build and run tests'){
      steps{
        sh "docker run -it -v $PWD:/e2e -w /e2e cypress/included:3.4.0 --browser ${BROWSER} --spec ${SPEC}"
      }
    }
  }
}