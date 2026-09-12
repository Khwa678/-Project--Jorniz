export interface AccountTypeLabelProps {
  value: string;
}

export function formatAccountType(value: string) {
  return value
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

export function AccountTypeLabel({ value }: AccountTypeLabelProps) {
  return <p>{formatAccountType(value)}</p>;
}
