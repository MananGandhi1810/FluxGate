import { Resend } from "resend";

const resendEmail = process.env.RESEND_EMAIL;
const resendApiKey = process.env.RESEND_API_KEY;

const resend = new Resend(resendApiKey);

const sendEmail = async (to, subject, html) => {
    return await resend.emails.send({
        from: `FluxGate <${resendEmail}>`,
        to: [to],
        subject: subject,
        html: html,
    });
};

export default sendEmail;
