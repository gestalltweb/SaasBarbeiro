"use client";

import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";
import { useContext, type ButtonHTMLAttributes } from "react";
import { NavigationPending } from "./filter-form";

export function SubmitButton({ children, disabled, pendingLabel = "Enviando…", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { pendingLabel?: string }) {
  const status = useFormStatus();
  const navigating = useContext(NavigationPending);
  const pending = status.pending || navigating;
  return <button {...props} type="submit" disabled={disabled || pending} aria-busy={pending}>
    {pending ? <><LoaderCircle className="spin" size={16} aria-hidden="true" /> {pendingLabel}</> : children}
  </button>;
}
