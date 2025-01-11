const subject = "Verify Your Email Address"

const text = (code) => `Hi there!

Thank you for registration.

To complete your registration, please use the following verification code:

Verification Code: ${code}

If you did not request this email, please ignore it.

Cheers

---

This is an automated message, please do not reply.
`

const html = (code) => `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Verify Your Email Address</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #334155;
            background-color: #f4f4f4;
            padding: 20px;
        }
        .container {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .code {
            font-size: 1.2em;
            font-weight: bold;
            background-color: #f9f9f9;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            padding: 10px;
            text-align: center;
            margin: 20px 0;
            color: #2174ea;
        }
        .footer {
            text-align: center;
            font-size: 0.9em;
            color: #888;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Verify Your Email Address</h1>
        </div>
        <p>Hi there,</p>
        <p>Thank you for registration.</p>
        <p>To complete your registration, please use the following verification code:</p>
        <div class="code">${code}</div>
        <p>If you did not request this email, please ignore it.</p>
        <p>Cheers!</p>
        <div class="footer">
            <p>This is an automated message, please do not reply.</p>
        </div>
    </div>
</body>
</html>
`

export default { subject, text, html }