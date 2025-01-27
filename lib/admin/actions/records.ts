"use server";

import { db } from "@/db/drizzle";
import { borrowRecords, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const changeRecordStatus = async (
  recordId: string,
  newStatus: "BORROWED" | "RETURNED"
) => {
  try {
    const newRecord = await db
      .update(borrowRecords)
      .set({
        status: newStatus,
        returnDate:
          newStatus === "RETURNED"
            ? new Date().toISOString().slice(0, 10)
            : null,
      })
      .where(eq(borrowRecords.id, recordId))
      .returning()
      .then((res) => res[0]);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newRecord)),
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "An error occurred while updating record status",
    };
  }
};

export const deleteRecord = async (recordId: string) => {
  try {
    await db.delete(borrowRecords).where(eq(borrowRecords.id, recordId));

    return {
      success: true,
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "An error occurred while deleting the record",
    };
  }
};
