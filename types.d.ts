interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  rating: number;
  totalCopies: number;
  availableCopies: number;
  description: string;
  coverColor: string;
  coverUrl: string;
  videoUrl: string;
  summary: string;
  createdAt: Date;
  borrowDate?: Date;
  dueDate?: string;
  returnDate?: Date | null;
  receiptUrl?: string | null;
  status?: "BORROWED" | "RETURNED" | "PENDING";
}

interface BookCard
  extends Pick<
    Book,
    | "id"
    | "author"
    | "title"
    | "genre"
    | "coverColor"
    | "coverUrl"
    | "status"
    | "borrowDate"
    | "dueDate"
    | "returnDate"
    | "receiptUrl"
  > {}

interface User {
  status: "PENDING" | "APPROVED" | "REJECTED";
  role: "USER" | "ADMIN";
  id: string;
  fullName: string;
  email: string;
  universityId: number;
  password: string;
  universityCard: string;
  lastActivityDate: Date | null;
  createdAt: Date;
  avatar: string | null;
  borrowedBooks: number;
}

interface AuthCredentials {
  fullName: string;
  email: string;
  password: string;
  universityId: number;
  universityCard: string;
}

interface BookParams {
  title: string;
  author: string;
  genre: string;
  rating: number;
  totalCopies: number;
  description: string;
  coverColor: string;
  coverUrl: string;
  videoUrl: string;
  summary: string;
}

interface BorrowBookParams {
  bookId: string;
  userId: string;
}

interface BorrowRecord {
  id: string;
  bookId: string;
  userId: string;
  createdAt: Date;
  dueDate: Date | null;
  returnDate: Date | null;
  status: "BORROWED" | "RETURNED" | "PENDING";
  receiptUrl: string | null;
  user: User;
  book: Book;
}
