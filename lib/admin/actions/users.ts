"use server";

import { EmailTemplate } from "@/constants";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { eq } from "drizzle-orm";

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
      message: "An error occurred while deleting the book",
    };
  }
};

export const approveUser = async (userId: string) => {
  try {
    const userInfo = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then((res) => res[0]);

    if (!userInfo)
      return {
        success: false,
        message: "User not found",
      };

    const newUser = await db
      .update(users)
      .set({ status: "APPROVED" })
      .where(eq(users.id, userId))
      .returning()
      .then((res) => res[0]);

    await sendEmail({
      to: userInfo.email,
      subject: "Your account has been approved!",
      template: EmailTemplate.APPROVAL,
      data: {
        studentName: userInfo.fullName,
        loginUrl: "https://library-app-rust-five.vercel.app/sign-in",
      },
    });

    return {
      success: true,
      newUser: JSON.parse(JSON.stringify(newUser)),
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "An error occurred while deleting the book",
    };
  }
};

export const rejectUser = async (userId: string) => {
  try {
    const user = await db
      .update(users)
      .set({ status: "REJECTED" })
      .where(eq(users.id, userId))
      .returning()
      .then((res) => res[0]);

    return {
      success: true,
      newUser: JSON.parse(JSON.stringify(user)),
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "An error occurred while deleting the book",
    };
  }
};
