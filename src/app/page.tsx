import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Smile, Calendar, MessageCircle, Shield, Clock, CheckCircle } from "lucide-react";
import { DentalParallax } from "@/components/DentalParallax";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Dental Parallax Background Component */}
      <DentalParallax />
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="px-6 py-4 bg-white/80 backdrop-blur-sm shadow-sm relative z-20">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Smile className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">AgendaÁgil</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost">Como Funciona</Button>
              <Button variant="ghost">Preços</Button>
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Começar Grátis</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="px-6 py-20 text-center min-h-screen flex items-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Agenda inteligente para
              <span className="text-blue-600"> consultórios odontológicos</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Gerencie seus pacientes pelo WhatsApp. Sem apps, sem senhas, sem complicação. 
              Seus pacientes marcam consultas direto no WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3" asChild>
                <Link href="/auth/register">Começar Teste Grátis</Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Ver Demonstração
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-16 bg-white/70 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Como funciona o AgendaÁgil
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Três passos simples para revolucionar o atendimento do seu consultório
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6 text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">1. WhatsApp Integrado</h3>
                  <p className="text-gray-600">
                    Seus pacientes conversam direto no WhatsApp para marcar, remarcar ou cancelar consultas.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <Calendar className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">2. Agenda Inteligente</h3>
                  <p className="text-gray-600">
                    Dashboard profissional com calendário visual e gerenciamento completo de horários.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <CheckCircle className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">3. Automação Total</h3>
                  <p className="text-gray-600">
                    Lembretes automáticos, confirmações e reagendamentos sem intervenção manual.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="px-6 py-16 bg-gray-50/70 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Por que escolher o AgendaÁgil?
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Clock className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Economia de Tempo</h3>
                    <p className="text-gray-600">Reduza 90% do tempo gasto com agendamentos telefônicos</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Shield className="h-6 w-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Redução de No-Shows</h3>
                    <p className="text-gray-600">Lembretes automáticos diminuem faltas em até 70%</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Smile className="h-6 w-6 text-purple-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Pacientes Satisfeitos</h3>
                    <p className="text-gray-600">Interface familiar do WhatsApp aumenta satisfação</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Exemplo de Conversa</h3>
                  <div className="text-left space-y-2 text-sm">
                    <div className="bg-gray-100 p-2 rounded">
                      <strong>Paciente:</strong> Oi, gostaria de marcar uma consulta
                    </div>
                    <div className="bg-blue-100 p-2 rounded">
                      <strong>Bot:</strong> Olá! Tenho disponível:<br/>
                      • Amanhã 14:00<br/>
                      • Quinta 09:30<br/>
                      Qual prefere?
                    </div>
                    <div className="bg-gray-100 p-2 rounded">
                      <strong>Paciente:</strong> Quinta às 09:30
                    </div>
                    <div className="bg-blue-100 p-2 rounded">
                      <strong>Bot:</strong> ✅ Confirmado! Quinta 09:30 com Dr. Silva
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Parallax Demonstration Section */}
        <section className="px-6 py-20 min-h-screen flex items-center justify-center">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">
              Role para ver o efeito parallax em ação!
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Os elementos se movem de forma suave enquanto você navega pela página.
            </p>
            <div className="text-6xl animate-bounce">
              ⬇️
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-20 bg-blue-600/90 backdrop-blur-sm text-white text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Pronto para modernizar seu consultório?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Comece seu teste gratuito hoje mesmo. Sem cartão de crédito, sem compromisso.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
              asChild
            >
              <Link href="/auth/register">Começar Teste Grátis por 14 Dias</Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-12 bg-gray-900/90 backdrop-blur-sm text-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Smile className="h-6 w-6 text-blue-400" />
                  <span className="text-xl font-bold">AgendaÁgil</span>
                </div>
                <p className="text-gray-400">
                  A solução completa para agendamentos odontológicos via WhatsApp.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Produto</h4>
                <div className="space-y-2 text-gray-400">
                  <div>Funcionalidades</div>
                  <div>Preços</div>
                  <div>Demonstração</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Suporte</h4>
                <div className="space-y-2 text-gray-400">
                  <div>Central de Ajuda</div>
                  <div>Contato</div>
                  <div>WhatsApp</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Empresa</h4>
                <div className="space-y-2 text-gray-400">
                  <div>Sobre Nós</div>
                  <div>Blog</div>
                  <div>Política de Privacidade</div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 AgendaÁgil. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}