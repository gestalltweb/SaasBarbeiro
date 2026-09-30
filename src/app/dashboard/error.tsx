"use client";

import { AlertTriangle } from "lucide-react";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="dashboard-body operational-page"><div className="error-state" role="alert"><AlertTriangle /><h1>Não foi possível carregar esta área</h1><p>A conexão pode ter oscilado. Tente novamente para buscar os dados atualizados.</p><button className="button" type="button" onClick={reset}>Tentar novamente</button></div></div>;
}
