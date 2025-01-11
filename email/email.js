import SibApiV3Sdk from 'sib-api-v3-sdk'

const defaultClient = SibApiV3Sdk.ApiClient.instance

const apiKey = defaultClient.authentications['api-key']
apiKey.apiKey = process.env.EMAIL_API_KEY

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()

export default async function sendEmail(email, subject, text, html) {
    const sender = {
        email: process.env.EMAIL_ADDRESS,
        name: process.env.EMAIL_NAME
    }

    const receivers = [
        {
            email: email
        }
    ]

    let status = true

    try {
        await apiInstance.sendTransacEmail({
            sender,
            to: receivers,
            subject: subject,
            textContent: text,
            htmlContent: html
        }).then(function(data) {
            status = true
        }, function(error) {
            status = false
        })
    } catch (e) {
        status = false
    }

    return status
}