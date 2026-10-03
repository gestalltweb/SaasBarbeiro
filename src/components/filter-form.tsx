"use client";

import { createContext, useTransition, type FormHTMLAttributes } from "react";
import { usePathname, useRouter } from "next/navigation";
import { filterFormUrl } from "@/lib/filter-form-url";

export const NavigationPending = createContext(false);

export function FilterForm({ children, action, ...props }: FormHTMLAttributes<HTMLFormElement> & { action?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  return <NavigationPending.Provider value={pending}><form {...props} action={action} method="get" aria-busy={pending} onSubmit={event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const destination = action || pathname;
    startTransition(() => router.push(filterFormUrl(destination, data)));
  }}>{children}</form></NavigationPending.Provider>;
}
