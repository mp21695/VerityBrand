import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "cream" | "outline" | "outline-light" | "ghost";
type Size = "md" | "sm";

const base =
  "group/btn relative inline-flex select-none items-center justify-center gap-2.5 rounded-pill t-eyebrow whitespace-nowrap " +
  "transition-[background-color,color,border-color,transform,box-shadow] duration-(--duration-base) ease-(--ease-out-soft) " +
  "active:scale-[0.97] disabled:opacity-45 disabled:active:scale-100 focus-visible:outline-offset-4";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-green text-on-dark hover:bg-brand-green-dark shadow-[0_1px_0_rgb(255_255_255/0.08)_inset]",
  cream: "bg-on-dark text-text-primary hover:bg-surface",
  outline: "border border-text-primary/80 text-text-primary hover:bg-text-primary hover:text-on-dark",
  "outline-light": "border border-on-dark/50 text-on-dark hover:bg-on-dark hover:text-text-primary",
  ghost: "text-text-primary hover:bg-text-primary/[0.06]",
};

const sizes: Record<Size, string> = {
  md: "min-h-12 px-5 py-3.5",
  sm: "min-h-11 px-4 py-2.5 text-[0.75rem]",
};

/** Rolling label: current copy slides up, a duplicate slides in (reference hover). */
export function RollText({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-flex overflow-hidden">
      <span className="block transition-transform duration-(--duration-base) ease-(--ease-out-soft) group-hover/btn:-translate-y-full motion-reduce:transition-none">
        {children}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 block translate-y-full transition-transform duration-(--duration-base) ease-(--ease-out-soft) group-hover/btn:translate-y-0 motion-reduce:transition-none"
      >
        {children}
      </span>
    </span>
  );
}

function Dot({ variant }: { variant: Variant }) {
  return (
    <span
      aria-hidden
      className={`h-1.5 w-1.5 shrink-0 rounded-full bg-brand-pink transition-transform duration-(--duration-base) ease-(--ease-out-soft) group-hover/btn:scale-150 ${
        variant === "primary" ? "bg-brand-pink-soft" : ""
      }`}
    />
  );
}

type CommonProps = { variant?: Variant; size?: Size; dot?: boolean; className?: string; children: React.ReactNode };

export function ButtonLink({
  variant = "primary",
  size = "md",
  dot = true,
  className,
  children,
  ...rest
}: CommonProps & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link className={`${base} ${variants[variant]} ${sizes[size]} ${className ?? ""}`} {...rest}>
      {dot ? <Dot variant={variant} /> : null}
      <RollText>{children}</RollText>
    </Link>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  dot = false,
  className,
  children,
  ...rest
}: CommonProps & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className ?? ""}`} {...rest}>
      {dot ? <Dot variant={variant} /> : null}
      <RollText>{children}</RollText>
    </button>
  );
}
