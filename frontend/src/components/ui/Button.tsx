import type { ButtonHTMLAttributes } from "react";
import { Slot } from "radix-ui";
import "./styles.css";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  size?: "small" | "medium";
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export function Button({ asChild = false, className = "", size = "medium", variant = "primary", type = "button", ...props }: ButtonProps) {
  const Component = asChild ? Slot.Root : "button";
  const classes = ["ui-button", `ui-button-${variant}`, `ui-button-${size}`, className].filter(Boolean).join(" ");

  return <Component className={classes} type={asChild ? undefined : type} {...props} />;
}
