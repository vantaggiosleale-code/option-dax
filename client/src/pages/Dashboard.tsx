import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { TrendingUp, TrendingDown, Activity, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const { data: strategies, isLoading: loadingStrategies } = trpc.strategies.list.useQuery();
  const { data: portfolios, isLoading: loadingPortfolios } = trpc.portfolios.list.useQuery();
  const { data: alerts, isLoading: loadingAlerts } = trpc.alerts.list.useQuery();

  const activeStrategies = strategies?.filter((s) => s.status === "active") || [];
  const totalPortfolios = portfolios?.length || 0;
  const criticalAlerts = alerts?.filter((a) => a.severity === "critical" && a.isRead === 0) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Panoramica delle tue strategie e portafogli</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Strategie Attive</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loadingStrategies ? "..." : activeStrategies.length}</div>
              <p className="text-xs text-muted-foreground">
                {strategies?.length || 0} totali
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portafogli</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loadingPortfolios ? "..." : totalPortfolios}</div>
              <p className="text-xs text-muted-foreground">
                Gestione attiva
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alert Critici</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {loadingAlerts ? "..." : criticalAlerts.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Richiedono attenzione
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Calcolo in corso
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Alerts */}
        {criticalAlerts.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Alert Critici Recenti</CardTitle>
              <CardDescription>Notifiche che richiedono la tua attenzione</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {criticalAlerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-start gap-4 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{alert.alertType.replace(/_/g, " ").toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(alert.createdAt).toLocaleString("it-IT")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Strategie Recenti</CardTitle>
              <CardDescription>Le tue ultime strategie create</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingStrategies ? (
                <p className="text-sm text-muted-foreground">Caricamento...</p>
              ) : activeStrategies.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nessuna strategia attiva</p>
              ) : (
                <div className="space-y-2">
                  {activeStrategies.slice(0, 5).map((strategy) => (
                    <div key={strategy.id} className="flex justify-between items-center p-2 hover:bg-accent rounded">
                      <div>
                        <p className="font-medium text-sm">{strategy.name}</p>
                        <p className="text-xs text-muted-foreground">{strategy.strategyType}</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                        {strategy.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Portafogli</CardTitle>
              <CardDescription>I tuoi portafogli di trading</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPortfolios ? (
                <p className="text-sm text-muted-foreground">Caricamento...</p>
              ) : portfolios?.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nessun portafoglio creato</p>
              ) : (
                <div className="space-y-2">
                  {portfolios?.slice(0, 5).map((portfolio) => (
                    <div key={portfolio.id} className="flex justify-between items-center p-2 hover:bg-accent rounded">
                      <div>
                        <p className="font-medium text-sm">{portfolio.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Valore: {portfolio.totalValue || "N/A"}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          portfolio.riskLevel === "critical"
                            ? "bg-destructive/10 text-destructive"
                            : portfolio.riskLevel === "high"
                            ? "bg-yellow-500/10 text-yellow-600"
                            : "bg-green-500/10 text-green-600"
                        }`}
                      >
                        {portfolio.riskLevel}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
