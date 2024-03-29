import { createTransport } from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'

const transport = new SMTPTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
})

export default createTransport(transport)
