import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { TrendingUp, BarChart3, Shield, Bot, FileText, Bell } from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    window.location.href = "/dashboard";
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Option DAX
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Piattaforma professionale per la gestione, l'analisi e il monitoraggio di strategie complesse 
            di trading in opzioni sull'indice DAX
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <a href={getLoginUrl()}>Inizia Ora</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#features">Scopri di più</a>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Calcoli Black-Scholes</CardTitle>
              <CardDescription>
                Calcoli in tempo reale con Greeks completi (Delta, Gamma, Vega, Theta, Rho)
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Visualizzazioni Payoff</CardTitle>
              <CardDescription>
                Grafici interattivi per analizzare profitti e perdite delle tue strategie
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Analisi del Rischio</CardTitle>
              <CardDescription>
                Monitoraggio continuo del rischio di portafoglio con alert automatici
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Chatbot AI</CardTitle>
              <CardDescription>
                Assistente intelligente powered by Google Gemini per analisi e consigli
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Gestione Documenti</CardTitle>
              <CardDescription>
                Upload e gestione di report PDF, screenshot e documenti di strategia
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Notifiche in Tempo Reale</CardTitle>
              <CardDescription>
                Alert automatici quando vengono raggiunti livelli critici di rischio
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <Card className="bg-card border-border max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl">Pronto per iniziare?</CardTitle>
              <CardDescription className="text-lg">
                Accedi ora e inizia a gestire le tue strategie di trading in opzioni DAX
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" asChild>
                <a href={getLoginUrl()}>Accedi alla Piattaforma</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
