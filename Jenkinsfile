pipeline{

  agent any

  parameters{
    string(name: 'SPEC', defaultValue: "cypress/e2e/**/**", description: "Enter spec to run")
    choice(name: 'BROWSER', choices: ['chrome', 'edge', 'firefox'], description: 'Choose browser to run on')
  }

  stages{
    stage('Build code'){
      steps{
        echo 'Building..'
      }
    }
    stage('Run tests'){
      steps{
        sh "npm i"
        sh "npx cypress run --browser ${BROWSER} --spec ${SPEC}"
      }
    }
  }
}