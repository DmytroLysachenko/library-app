"use server";

import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/auth";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { authRatelimit } from "../ratelimit";
import { workflowClient } from "../workflow";
import config from "../config";

export const signInWithCredentials = async (
  params: Pick<AuthCredentials, "email" | "password">
) => {
  const { email, password } = params;

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, error: result.error };
    }
    return { success: true };
  } catch (error) {
    console.log(error, "Sign in error");
    return { success: false, error: "Sign in error" };
  }
};

export const signUp = async (params: AuthCredentials) => {
  const { fullName, email, password, universityId, universityCard } = params;

  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";

  const { success } = await authRatelimit.limit(ip);

  if (!success) return redirect("too-fast");

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0)
    return { success: false, error: "User already exists" };

  const hashedPassword = await hash(password, 10);

  try {
    await db.insert(users).values({
      fullName,
      email,
      universityId,
      password: hashedPassword,
      universityCard,
    });

    await workflowClient.trigger({
      url: `${config.env.baseUrl}/api/workflows/onboarding`,
      body: {
        email,
        fullName,
      },
      retries: 0,
    });

    await signInWithCredentials({ email, password });

    return { success: true };
  } catch (error) {
    console.log(error, "Signup error");
    return { success: false, error: "Signup error" };
  }
};

export const signOutAction = async () => {
  try {
    await signOut({ redirect: false });
    return { success: true };
  } catch (error) {
    console.log(error, "Signout error");
    return { success: false, error: "Signout error" };
  }
};

export const uploadAvatar = async (userId: string, avatarUrl: string) => {
  try {
    const updatedUser = await db
      .update(users)
      .set({ avatar: avatarUrl })
      .where(eq(users.id, userId))
      .returning();

    return { success: true, updatedUser };
  } catch (error) {
    console.log(error, "Avatar update error");
    return { success: false, error: "Avatar update error" };
  }
};
