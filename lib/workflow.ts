import { Client as WorkflowClient } from "@upstash/workflow";
import config from "./config";
import emailjs from "@emailjs/nodejs";

export const workflowClient = new WorkflowClient({
  baseUrl: config.env.upstash.qstashUrl,
  token: config.env.upstash.qstashToken,
});

export const sendEmail = async ({
  email,
  subject,
  message,
}: {
  email: string;
  subject: string;
  message: string;
}) => {
  console.log("Sending mail");

  const response = await emailjs.send(
    config.env.emailjs.serviceId,
    config.env.emailjs.templateId,
    {
      email,
      subject,
      message,
    },
    { publicKey: config.env.emailjs.publicKey }
  );

  console.log(response);
};
