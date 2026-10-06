"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardMenu } from "./dashboard-menu";

export function DashboardFrame({ children, navigation, topbar, mobileNavigation }: {
  children: ReactNode; navigation: ReactNode; topbar: ReactNode; mobileNavigation: ReactNode;
}) {
  const pathname = usePathname();
  if (pathname === "/dashboard/pagina-publica/preview") return <>{children}</>;
  return <main className="app-shell"><section className="app-main"><div className="app-topbar-area"><DashboardMenu>{navigation}</DashboardMenu>{topbar}</div>{children}</section>{mobileNavigation}</main>;
}
