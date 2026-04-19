const express = require("express");
const router = express.Router();
const { Resend } = require("resend");
const { validateContact, errorResponse } = require("../middleware/validationMiddleware");

const resend = new Resend(process.env.RESEND_API_KEY);

router.post("/", validateContact, async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const htmlMessage = `
      <h3>New Contact Form Submission</h3>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Message:</b><br/>${message}</p>
    `;

    await resend.emails.send({
      from: "PocketDesk Contact <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL || "pocketdesk3@gmail.com",
      subject: "New Contact Message",
      reply_to: email,
      html: htmlMessage
    });

    res.status(200).json({ message: "Contact message sent successfully" });
  } catch (error) {
    console.error("Contact form error: ", error);
    errorResponse(res, 500, "Failed to send message");
  }
});

module.exports = router;
