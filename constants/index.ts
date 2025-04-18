export const navigationLinks = [
  {
    href: "/library",
    label: "Library",
  },

  {
    img: "/icons/user.svg",
    selectedImg: "/icons/user-fill.svg",
    href: "/my-profile",
    label: "My Profile",
  },
];

export const adminSideBarLinks = [
  {
    img: "/icons/admin/home.svg",
    route: "/admin",
    text: "Home",
  },
  {
    img: "/icons/admin/users.svg",
    route: "/admin/users",
    text: "All Users",
  },
  {
    img: "/icons/admin/book.svg",
    route: "/admin/books",
    text: "All Books",
  },
  {
    img: "/icons/admin/info.svg",
    route: "/admin/borrow-requests",
    text: "Borrow Requests",
  },
  {
    img: "/icons/admin/bookmark.svg",
    route: "/admin/borrow-records",
    text: "Borrow Records",
  },
  {
    img: "/icons/admin/user.svg",
    route: "/admin/account-requests",
    text: "Account Requests",
  },
];

export const FIELD_NAMES = {
  fullName: "Full name",
  email: "Email",
  universityId: "University ID Number",
  password: "Password",
  universityCard: "Upload University ID Card",
};

export const FIELD_TYPES = {
  fullname: "text",
  email: "email",
  universityId: "number",
  password: "password",
};

export const userSideBookSorts = [
  {
    value: "oldest",
    title: "Oldest",
  },
  {
    value: "newest",
    title: "Newest",
  },
  {
    value: "available",
    title: "Available",
  },
  {
    value: "highestRated",
    title: "Highest Rated",
  },
];

export const userRoles = [
  {
    value: "user",
    label: "User",
    bgColor: "bg-[#FDF2FA]",
    textColor: "text-[#C11574]",
  },
  {
    value: "admin",
    label: "Admin",
    bgColor: "bg-[#ECFDF3]",
    textColor: "text-[#027A48]",
  },
];

export const borrowStatuses = [
  {
    value: "overdue",
    label: "Overdue",
    bgColor: "bg-[#FFF1F3]",
    textColor: "text-[#C01048]",
  },
  {
    value: "borrowed",
    label: "Borrowed",
    bgColor: "bg-[#F9F5FF]",
    textColor: "text-[#6941C6]",
  },
  {
    value: "returned",
    label: "Returned",
    bgColor: "bg-[#F0F9FF]",
    textColor: "text-[#026AA2]",
  },
];

export enum EmailTemplate {
  WELCOME = "WELCOME",
  APPROVAL = "APPROVAL",
  REJECTION = "REJECTION",
  BORROW_CONFIRMATION = "BORROW_CONFIRMATION",
  DUE_REMINDER = "DUE_REMINDER",
  RETURN_CONFIRMATION = "RETURN_CONFIRMATION",
  INACTIVITY_REMINDER = "INACTIVITY_REMINDER",
  MILESTONE_CONGRATS = "MILESTONE_CONGRATS",
  RECEIPT_GENERATED = "RECEIPT_GENERATED",
  CHECK_IN_REMINDER = "CHECK_IN_REMINDER",
  RECEIPT = "RECEIPT",
}

export const alphabeticalSortOptions = [
  {
    value: "desc",
    title: "Z to A",
  },
  {
    value: "asc",
    title: "A to Z",
  },
];
export const dateSortOptions = [
  {
    value: "desc",
    title: "Recent to Oldest",
  },
  {
    value: "asc",
    title: "Oldest to Recent",
  },
];

export const requestStatusSortOptions = [
  {
    value: "pending",
    title: "Pending",
  },
  {
    value: "borrowed",
    title: "Borrowed",
  },
];

export const userStatusSortOptions = [
  {
    value: "approved",
    title: "Approved",
  },
  {
    value: "rejected",
    title: "Rejected",
  },
  {
    value: "pending",
    title: "Pending",
  },
];

export const RECEIPT_VALIDITY_DAYS = 1;

export const PER_PAGE_LIMITS = {
  searchPage: 12,
  adminBooks: 6,
  adminBorrowRecords: 6,
  adminUsers: 8,
};
