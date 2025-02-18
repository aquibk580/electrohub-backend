export interface UserPayload {
  id: string;
  email: string;
  userType: "user" | "seller";
}

export interface AdminPayload {
  id: string;
  email: string;
  name: string;
}
