"use server";

import { eq } from "drizzle-orm";

import { EmailTemplate } from "@/constants";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import config from "@/lib/config";
import { sendEmail } from "@/lib/email";

export const changeUserRole = async (
  userId: string,
  newRole: "ADMIN" | "USER"
) => {
  try {
    const user = await db
      .update(users)
      .set({ role: newRole })
      .where(eq(users.id, userId))
      .returning()
      .then((res) => res[0]);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(user)),
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "An error occurred while changing the user role",
    };
  }
};

export const deleteUser = async (userId: string) => {
  try {
    await db.delete(users).where(eq(users.id, userId));

    return {
      success: true,
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "An error occurred while deleting the user",
    };
  }
};

export const approveUser = async (userId: string) => {
  try {
    const [userInfo, newUser] = await Promise.all([
      db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
        .then((res) => res[0]),
      db
        .update(users)
        .set({ status: "APPROVED" })
        .where(eq(users.id, userId))
        .returning()
        .then((res) => res[0]),
    ]);

    await sendEmail({
      to: userInfo.email,
      subject: "Your account has been approved!",
      template: EmailTemplate.APPROVAL,
      data: {
        studentName: userInfo.fullName,
        loginUrl: `${config.env.baseUrl}/sign-in`,
      },
    });

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newUser)),
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "An error occurred while approving the user",
    };
  }
};

export const rejectUser = async (userId: string) => {
  try {
    const [userInfo, newUser] = await Promise.all([
      db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
        .then((res) => res[0]),
      db
        .update(users)
        .set({ status: "REJECTED" })
        .where(eq(users.id, userId))
        .returning()
        .then((res) => res[0]),
    ]);

    await sendEmail({
      to: userInfo.email,
      subject: "Your account has been Rejected!",
      template: EmailTemplate.REJECTION,
      data: {
        studentName: userInfo.fullName,
      },
    });

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newUser)),
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "An error occurred while rejecting the user",
    };
  }
};
