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
      .returning();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(user[0])),
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
