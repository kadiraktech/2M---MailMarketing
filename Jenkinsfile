pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    DOTNET_CLI_TELEMETRY_OPTOUT = '1'
    APP_BASE_URL = 'http://localhost:4200'
    ADMIN_EMAIL = 'admin@mailmarketing.local'
    ADMIN_PASSWORD = 'Admin123!'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Backend Restore + Build') {
      steps {
        powershell '''
          dotnet restore backend/MailMarketing.sln
          dotnet build backend/MailMarketing.sln --no-restore
        '''
      }
    }

    stage('Frontend Install + Build') {
      steps {
        dir('frontend/mail-marketing-ui') {
          powershell '''
            npm install
            npm run build
          '''
        }
      }
    }

    stage('Start App Stack For UI Tests') {
      steps {
        powershell '''
          docker compose up -d postgres redis rabbitmq backend frontend
        '''
      }
    }

    stage('Wait For App Readiness') {
      steps {
        powershell '''
          $ErrorActionPreference = 'Stop'

          function Wait-Http($url, $timeoutSec) {
            $sw = [Diagnostics.Stopwatch]::StartNew()
            while ($sw.Elapsed.TotalSeconds -lt $timeoutSec) {
              try {
                $res = Invoke-WebRequest -UseBasicParsing $url -TimeoutSec 5
                if ($res.StatusCode -ge 200 -and $res.StatusCode -lt 500) {
                  return
                }
              } catch {
                Start-Sleep -Seconds 2
              }
            }
            throw "Timeout waiting for $url"
          }

          Wait-Http 'http://localhost:4200' 180
          Wait-Http 'http://localhost:5000/swagger' 180
        '''
      }
    }

    stage('Selenium UI Tests') {
      steps {
        powershell '''
          mvn -q test -f frontend/mail-marketing-ui/tests/selenium/java/pom.xml
        '''
      }
    }

    stage('SonarQube Analysis') {
      steps {
        powershell '''
          if ([string]::IsNullOrWhiteSpace($env:SONAR_TOKEN)) {
            throw 'SONAR_TOKEN is required for SonarQube analysis stage.'
          }

          docker compose up -d sonarqube
          ./scripts/sonar-analysis.ps1
        '''
      }
    }

    stage('Archive Artifacts') {
      steps {
        archiveArtifacts artifacts: 'frontend/mail-marketing-ui/dist/**', allowEmptyArchive: true
        archiveArtifacts artifacts: 'backend/**/bin/**', allowEmptyArchive: true
        archiveArtifacts artifacts: 'frontend/mail-marketing-ui/tests/selenium/java/target/**', allowEmptyArchive: true
      }
    }
  }

  post {
    always {
      junit testResults: 'frontend/mail-marketing-ui/tests/selenium/java/target/surefire-reports/*.xml', allowEmptyResults: true
      powershell 'docker compose ps'
    }
    cleanup {
      powershell 'docker compose down'
    }
  }
}
