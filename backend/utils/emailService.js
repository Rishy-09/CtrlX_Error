import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

const transporter = nodemailer.createTransport({
    service: "gmail",   // can use other providers too like Outlook, SMTP, etc
    auth:{
        user: process.env.EMAIL_USER,    // my email
        pass: process.env.EMAIL_PASS ,    // app password (not the actual password)
    },
})

export const sendEmail = async (to, subject, text) => {
    try{
        await transporter.sendMail({
            from: `"Bug Tracker" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: text,
        })
        console.log(`Email sent to ${to}`)
    }
    catch(err){
        console.log("Email sending failed: ", err)
    }
}