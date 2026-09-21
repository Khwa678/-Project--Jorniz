import { ACCOUNT_TYPE_OPTIONS } from "./constants";

export type AccountType = typeof ACCOUNT_TYPE_OPTIONS[number]["value"];
