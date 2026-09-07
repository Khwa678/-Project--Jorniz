import type { JornizProfile, JornizUser, UserType } from "./types";

export interface SignedInAccount extends JornizUser {
  bio?: string;
  location?: string;
  hu_coins?: number;
  coins?: number;
}
export type AccountProfile = JornizProfile;
export type AccountType = UserType;
