import {
  bookSchema,
  signInSchema,
  signUpSchema,
  userUpdateSchema,
} from "@/lib/validations";

describe("lib/validations", () => {
  describe("signUpSchema", () => {
    const validPayload = {
      fullName: "Ada Lovelace",
      email: "ada@example.edu",
      universityId: "42",
      universityCard: "card-asset",
      password: "securePass",
    };

    it("accepts valid payloads and coerces numeric fields", () => {
      const result = signUpSchema.safeParse(validPayload);

      expect(result.success).toBe(true);
      expect(result.success && result.data.universityId).toBe(42);
    });

    it("flags multiple invalid fields with the correct paths", () => {
      const invalid = {
        ...validPayload,
        fullName: "Ed",
        email: "not-an-email",
        password: "short",
      };

      const result = signUpSchema.safeParse(invalid);

      expect(result.success).toBe(false);
      if (result.success) return;

      const errorPaths = result.error.issues.map((issue) => issue.path.join("."));

      expect(errorPaths).toEqual(
        expect.arrayContaining(["fullName", "email", "password"])
      );
    });
  });

  describe("signInSchema", () => {
    it("accepts valid credentials", () => {
      const result = signInSchema.safeParse({
        email: "reader@example.edu",
        password: "passphrase",
      });

      expect(result.success).toBe(true);
    });

    it("rejects malformed emails and short passwords", () => {
      const result = signInSchema.safeParse({
        email: "invalid-email",
        password: "short",
      });

      expect(result.success).toBe(false);
      if (result.success) return;

      const errorPaths = result.error.issues.map((issue) => issue.path.join("."));

      expect(errorPaths).toEqual(
        expect.arrayContaining(["email", "password"])
      );
    });
  });

  describe("bookSchema", () => {
    const validBook = {
      title: "  Clean Code  ",
      description: "  A practical guide to writing clean software.  ",
      author: "Robert Martin",
      genre: "Software",
      rating: "4.5",
      totalCopies: "15",
      coverUrl: "https://example.com/cover.png",
      coverColor: "#AABBCC",
      videoUrl: "https://example.com/preview.mp4",
      summary: "  Practical advice on crafting maintainable software.  ",
    };

    it("trims string fields and coerces numeric inputs", () => {
      const result = bookSchema.safeParse(validBook);

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.title).toBe("Clean Code");
      expect(result.data.description).toBe(
        "A practical guide to writing clean software."
      );
      expect(result.data.summary).toBe(
        "Practical advice on crafting maintainable software."
      );
      expect(result.data.rating).toBeCloseTo(4.5);
      expect(result.data.totalCopies).toBe(15);
    });

    it("rejects invalid hex colors, ratings, and copy counts", () => {
      const result = bookSchema.safeParse({
        ...validBook,
        coverColor: "#XYZXYZ",
        rating: 6,
        totalCopies: 0,
      });

      expect(result.success).toBe(false);
      if (result.success) return;

      const errorPaths = result.error.issues.map((issue) => issue.path.join("."));

      expect(errorPaths).toEqual(
        expect.arrayContaining(["coverColor", "rating", "totalCopies"])
      );
    });
  });

  describe("userUpdateSchema", () => {
    it("requires a non-empty avatar string", () => {
      const result = userUpdateSchema.safeParse({ avatar: "" });

      expect(result.success).toBe(false);
      if (result.success) return;

      const [issue] = result.error.issues;

      expect(issue.path.join(".")).toBe("avatar");
    });

    it("accepts valid avatar references", () => {
      const result = userUpdateSchema.safeParse({ avatar: "avatar.png" });

      expect(result.success).toBe(true);
    });
  });
});
