import { EmailTemplate } from "@/constants";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { serve } from "@upstash/workflow/nextjs";
import { eq } from "drizzle-orm";

type UserState = "non-active" | "active";

type InitialData = {
  email: string;
  fullName: string;
};

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const THREE_DAYS_IN_MS = 3 * ONE_DAY_IN_MS;
const THIRTY_DAYS_IN_MS = 30 * ONE_DAY_IN_MS;

const getUserState = async (email: string): Promise<UserState> => {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user.length === 0) return "non-active";

  const lastActivityDate = new Date(user[0].lastActivityDate!);

  const now = new Date();

  const timeDifference = now.getTime() - lastActivityDate.getTime();

  if (timeDifference > THREE_DAYS_IN_MS && timeDifference <= THIRTY_DAYS_IN_MS)
    return "non-active";

  return "active";
};

export const { POST } = serve<InitialData>(async (context) => {
  const { email, fullName } = context.requestPayload;

  await context.run("new-signup", async () => {
    return await sendEmail({
      to: email,
      template: EmailTemplate.WELCOME,
      subject: "Welcome to LibraryView!",
      data: {
        studentName: fullName,
        loginUrl: "https://library-app-rust-five.vercel.app/sign-in",
      },
    });
  });

  await context.sleep("wait-for-3-days", 60 * 60 * 24 * 3);

  while (true) {
    const state = await context.run("check-user-state", async () => {
      return await getUserState(email);
    });

    if (state === "non-active") {
      await context.run("send-email-non-active", async () => {
        return await sendEmail({
          to: email,
          template: EmailTemplate.INACTIVITY_REMINDER,
          subject: "Are you there?",
          data: {
            studentName: fullName.split(" ")[0],
            exploreUrl: "https://library-app-rust-five.vercel.app",
          },
        });
      });
    } else if (state === "active") {
      await context.run("send-email-active", async () => {
        return await sendEmail({
          to: email,
          template: EmailTemplate.CHECK_IN_REMINDER,
          subject: "Are you there?",
          data: {
            studentName: fullName.split(" ")[0],
            loginUrl: "https://library-app-rust-five.vercel.app/sign-in",
          },
        });
      });
    }

    await context.sleep("wait-for-1-month", 60 * 60 * 24 * 30);
  }
});
