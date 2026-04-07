const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendReminderEmail = async (to, taskText, time) => {
  try {
    await resend.emails.send({
      from: "PocketDesk <onboarding@resend.dev>", // default works
      to: [to],
      subject: "⏰ Task Reminder",
      html: `
        <h2>⏰ Time to Start Your Task</h2>
        <p><b>${taskText}</b></p>
        <p>Scheduled at: ${new Date(time).toLocaleString()}</p>
      `
    });
  } catch (err) {
    console.log("Email error:", err);
  }
};

module.exports = { sendReminderEmail };