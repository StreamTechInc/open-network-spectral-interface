pipeline {
    agent any
    stages {
        stage('Install') {
            steps {
				retry(3) {
					echo 'Beginning install...'
					bat 'npm install'
					echo 'Done install...'
				}
			}
        }
        stage('Build') {
            steps {
                echo 'Beginning build...'
				bat 'npm run build'
				echo 'Done build...'
            }
        }
    }
}