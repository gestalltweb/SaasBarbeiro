"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function DashboardFrame({ children, navigation, topbar, mobileNavigation }: {
  children: ReactNode; navigation: ReactNode; topbar: ReactNode; mobileNavigation: ReactNode;
}) {
  const pathname = usePathname();
  if (pathname === "/dashboard/pagina-publica/preview") return <>{children}</>;
  return <main className="app-shell">{navigation}<section className="app-main">{topbar}{children}</section>{mobileNavigation}</main>;
}
