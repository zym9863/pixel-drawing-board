import type { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: ReactNode;
  active?: boolean;
  tone?: "default" | "danger";
}

export function IconButton({
  label,
  icon,
  active = false,
  tone = "default",
  className = "",
  ...buttonProps
}: IconButtonProps) {
  const classes = ["icon-button", active ? "is-active" : "", tone === "danger" ? "is-danger" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      data-tooltip={label}
      className={classes}
      {...buttonProps}
    >
      {icon}
    </button>
  );
}
