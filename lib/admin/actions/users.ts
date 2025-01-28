"use server";

import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
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
    const user = await db
      .update(users)
      .set({ status: "APPROVED" })
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
