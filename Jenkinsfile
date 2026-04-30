pipeline {
    agent any

    tools {
        nodejs 'node22'
    }

    environment {
        TIME_STAMP_FORMAT = "dd-MM-yyyy HH:mm:ss"
        NODE_ENV = 'production'
        GITHUB_PR_URL = 'https://github.com/lcaohoanq/bit-learning-fe/pull/'
        IMAGE_WEB = 'hoangclw/bitlearning-web'
        IMAGE_ADMIN = 'hoangclw/bitlearning-admin'
        REGISTRY_CREDENTIAL = 'lcaohoanq-dockerhub-credentials'
        REGISTRY_URL = 'https://index.docker.io/v1/'
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
                sh 'corepack enable && pnpm install --frozen-lockfile --prefer-offline'
            }
        }

        stage('Build Source') {
            when {
                branch 'develop'
            }

            steps {
                sh 'pnpm run build'
            }
        }

        stage('Build & Push Docker') {
            when {
                branch 'main'
            }

            steps {
                script {
                    // Build images (Gán version tag mặc định là BUILD_NUMBER)
                    // Context là '.' (root)
                    def webImg = docker.build("${IMAGE_WEB}:${env.BUILD_NUMBER}", "-f apps/web/Dockerfile.prod .")
                    def adminImg = docker.build("${IMAGE_ADMIN}:${env.BUILD_NUMBER}", "-f apps/admin/Dockerfile.prod .")

                    // Push images (Kèm credential)
                    docker.withRegistry(REGISTRY_URL, REGISTRY_CREDENTIAL) {

                        // Push tag version (vd: :35)
                        webImg.push()
                        adminImg.push()

                        // Push tag latest
                        webImg.push('latest')
                        adminImg.push('latest')
                    }
                }
            }
        }
    }

    post {
        success {
            script {
                if (env.CHANGE_ID) {
                    notifyDiscord("✅ [FE] Jenkins PR BUILD SUCCESS", 3066993)
                } else if (env.BRANCH_NAME == 'main') {
                    notifyReleaseDiscord("🚀 [FE] RELEASE DEPLOYED", 5763719)
                }
            }
        }
        failure {
            notifyDiscord("❌ [FE] Jenkins PR BUILD FAILED", 15158332)
        }
    }
}

/* =========================
   Discord Notification (PR)
   ========================= */
def notifyDiscord(title, color) {
    withCredentials([string(credentialsId: 'discord_webhook_capstone', variable: 'WEBHOOK')]) {
        script {
            def ts = new Date().format(
                env.TIME_STAMP_FORMAT,
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

/* =========================
   Discord Notification (RELEASE) - CẬP NHẬT 2 IMAGES
   ========================= */
def notifyReleaseDiscord(title, color) {
    withCredentials([string(credentialsId: 'discord_webhook_capstone', variable: 'WEBHOOK')]) {
        script {
            def ts = new Date().format(env.TIME_STAMP_FORMAT, TimeZone.getTimeZone('Asia/Ho_Chi_Minh'))

            // Link Docker Hub
            def webUrl = "https://hub.docker.com/r/${env.IMAGE_WEB}/tags"
            def adminUrl = "https://hub.docker.com/r/${env.IMAGE_ADMIN}/tags"

            def payload = groovy.json.JsonOutput.toJson([
                embeds: [[
                    title: title,
                    color: color,
                    fields: [
                        [name: "Job", value: env.JOB_NAME, inline: true],
                        [name: "Build", value: "#${env.BUILD_NUMBER}", inline: true],
                        [name: "Timestamp", value: ts, inline: false],
                        [name: "Jenkins URL", value: env.BUILD_URL, inline: false],
                        [name: "🐳 Web Image", value: "**${env.IMAGE_WEB}**\nTags: `latest`, `${env.BUILD_NUMBER}`\n[View on Hub](${webUrl})", inline: false],
                        [name: "🐳 Admin Image", value: "**${env.IMAGE_ADMIN}**\nTags: `latest`, `${env.BUILD_NUMBER}`\n[View on Hub](${adminUrl})", inline: false]
                    ],
                    footer: [text: "Jenkins CI - Release"],
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
