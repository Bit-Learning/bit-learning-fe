pipeline {
    agent any

    tools {
        nodejs 'node22'
    }

    environment {
        NODE_ENV = 'production'
        GITHUB_PR_URL = 'https://github.com/lcaohoanq/bit-learning-fe/pull/'
    }

    stages {
        stage('Checkout PR') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: env.CHANGE_BRANCH ?: 'develop']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/lcaohoanq/bit-learning-fe.git',
                        credentialsId: 'lcaohoanq-github-pat'
                    ]]
                ])
            }
        }

        stage('Setup Node & PNPM') {
            steps {
                sh '''
                  node -v
                  corepack enable
                  pnpm -v
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'pnpm install --frozen-lockfile --prefer-offline'
            }
        }

        stage('Build') {
            steps {
                sh 'pnpm run build'
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh '''
                  echo "🚀 Deploying FE to production..."
                  # rsync / docker / vercel / nginx / whatever here
                '''
            }
        }
    }

    post {
        success {
            script {
                if (env.CHANGE_ID) {
                    notifyDiscord(
                        "✅ [FE] Jenkins PR BUILD SUCCESS",
                        3066993
                    )
                } else if (env.BRANCH_NAME == 'main') {
                    notifyDiscord(
                        "🚀 [FE] RELEASE DEPLOYED",
                        5763719
                    )
                }
            }
        }

        failure {
            notifyDiscord(
                "❌ [FE] Jenkins PR BUILD FAILED",
                15158332
            )
        }
    }
}

/* =========================
   Discord Notification
   ========================= */
def notifyDiscord(title, color) {
    withCredentials([string(credentialsId: 'discord_webhook_capstone', variable: 'WEBHOOK')]) {
        script {
            def ts = new Date().format(
                "yyyy-MM-dd HH:mm:ss",
                TimeZone.getTimeZone('Asia/Ho_Chi_Minh')
            )

            def payload = groovy.json.JsonOutput.toJson([
                embeds: [[
                    title: title,
                    color: color,
                    fields: [
                        [name: "Job", value: env.JOB_NAME, inline: true],
                        [name: "Source", value: env.CHANGE_BRANCH ?: 'N/A', inline: true],
                        [name: "Target", value: env.CHANGE_TARGET ?: 'main', inline: true],
                        [name: "PR", value: "#${env.CHANGE_ID}" ?: 'N/A', inline: false],
                        [name: "Build", value: "#${env.BUILD_NUMBER}", inline: false],
                        [name: "Timestamp", value: ts, inline: false],
                        [name: "URL", value: env.BUILD_URL, inline: false],
                        [name: "GitHub", value: "${env.GITHUB_PR_URL}${env.CHANGE_ID ?: ''}", inline: false]
                    ],
                    footer: [
                        text: "Jenkins CI"
                    ],
                    timestamp: new Date().format("yyyy-MM-dd'T'HH:mm:ssXXX")
                ]]
            ])

            sh """
            curl -s -X POST \
              -H "Content-Type: application/json" \
              -d '${payload}' \
              $WEBHOOK
            """
        }
    }
}

