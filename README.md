# AgendaÁgil - Sistema de Agendamento Odontológico

Sistema completo de agendamento para consultórios odontológicos com integração WhatsApp.

## 🚀 Funcionalidades Implementadas

### ✅ Fase 1 - Estrutura Base e Landing Page
- ✅ **Landing Page Profissional**: Design moderno e responsivo com foco em consultórios odontológicos
- ✅ **Parallax Dental**: Elementos visuais que se movem conforme o scroll para criar um efeito envolvente
- ✅ **Sistema de Autenticação**: Páginas de login e registro com validação e UX otimizada
- ✅ **Design System**: Componentes consistentes usando shadcn/ui e Tailwind CSS

### ✅ Fase 2 - Dashboard e Calendário
- ✅ **Dashboard Principal**: Visão geral com estatísticas e consultas do dia
- ✅ **Calendário Interativo**: Visualização semanal/diária dos agendamentos com drag-and-drop
- ✅ **Gerenciamento de Consultas**: Modal para adicionar, editar e visualizar detalhes das consultas
- ✅ **Gestão Completa de Pacientes**: CRUD completo com histórico, busca e detalhes
- ✅ **Interface WhatsApp**: Chat completo com conversas, bot e respostas rápidas
- ✅ **Configurações Avançadas**: Todas as configurações do consultório e preferências

### ✅ Fase 3 - Banco de Dados
- ✅ **Prisma ORM**: Configuração completa com modelos para usuários, pacientes e consultas
- ✅ **PostgreSQL**: Banco de dados estruturado com relacionamentos otimizados
- ✅ **Schema Completo**: Modelos para User, Patient, Appointment com status e tipos

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 14**: Framework React com App Router
- **TypeScript**: Tipagem estática para maior confiabilidade
- **Tailwind CSS**: Estilização utilitária e responsiva
- **shadcn/ui**: Biblioteca de componentes acessíveis e customizáveis
- **Lucide React**: Ícones consistentes e modernos

### Backend & Database
- **Prisma ORM**: Mapeamento objeto-relacional type-safe
- **PostgreSQL**: Banco de dados robusto e escalável
- **Node.js**: Runtime JavaScript no servidor

### Development Tools
- **ESLint**: Análise de código e padronização
- **PostCSS**: Processamento CSS avançado

## 📁 Estrutura do Projeto

```
agendaagil-app/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── login/page.tsx       # Página de login
│   │   │   └── register/page.tsx    # Página de registro
│   │   ├── dashboard/
│   │   │   ├── calendar/page.tsx    # Calendário interativo
│   │   │   └── page.tsx            # Dashboard principal
│   │   ├── globals.css             # Estilos globais
│   │   ├── layout.tsx              # Layout principal
│   │   └── page.tsx               # Landing page
│   ├── components/
│   │   ├── ui/                    # Componentes shadcn/ui
│   │   ├── Calendar.tsx           # Calendário customizado
│   │   └── ParallaxDental.tsx     # Efeito parallax
│   └── lib/
│       └── prisma.ts             # Cliente Prisma
├── prisma/
│   └── schema.prisma             # Schema do banco de dados
├── public/                       # Arquivos públicos
└── package.json                 # Dependências do projeto
```

## 🚦 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

1. **Instale as dependências**
   ```bash
   npm install
   ```

2. **Configure o banco de dados**
   ```bash
   npx prisma generate
   npx prisma dev  # Para banco local
   ```

3. **Execute o projeto**
   ```bash
   npm run dev
   ```

4. **Acesse a aplicação**
   - Landing page: http://localhost:3000
   - Login: http://localhost:3000/auth/login
   - Registro: http://localhost:3000/auth/register
   - Dashboard: http://localhost:3000/dashboard
   - Calendário: http://localhost:3000/dashboard/calendar

## 📋 Rotas Disponíveis

### Públicas
- `/` - Landing page
- `/auth/login` - Página de login
- `/auth/register` - Página de registro

### Privadas (Dashboard)
- `/dashboard` - Dashboard principal com estatísticas
- `/dashboard/calendar` - Calendário interativo de consultas
- `/dashboard/patients` - Gestão completa de pacientes
- `/dashboard/whatsapp` - Interface de conversas WhatsApp
- `/dashboard/settings` - Configurações do consultório

## 🎨 Características de Design

### Landing Page
- **Header responsivo** com navegação limpa
- **Hero section** com CTA claro e benefícios destacados
- **Seções de funcionalidades** com ícones e descrições
- **Exemplo de conversa WhatsApp** para demonstrar o produto
- **Footer completo** com links organizados
- **Parallax suave** com elementos dentais

### Dashboard
- **Sidebar de navegação** intuitiva
- **Cards de estatísticas** com métricas importantes
- **Calendário visual** com cores por status
- **Modais informativos** para detalhes das consultas
- **Interface mobile-first** totalmente responsiva

## 🔮 Próximas Fases

### Fase 4 - Integração WhatsApp (Planejado)
- [ ] Integração com WhatsApp Business API
- [ ] Bot conversacional para agendamentos
- [ ] Sistema de notificações automáticas
- [ ] Webhook para receber mensagens

### Fase 5 - Funcionalidades Avançadas (Planejado)
- [ ] Sistema de relatórios e métricas
- [ ] Gestão de horários complexos (cirurgias)
- [ ] Sistema de lembretes inteligentes
- [ ] Backup e sincronização automática

## 💡 Diferenciais do Sistema

- **Interface Familiar**: Uso do WhatsApp elimina necessidade de apps
- **Visual Profissional**: Design específico para consultórios odontológicos
- **Calendário Intuitivo**: Drag-and-drop e visualização clara dos horários
- **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **Escalável**: Arquitetura preparada para múltiplos consultórios

---

**AgendaÁgil** - Transformando o agendamento odontológico com tecnologia moderna e UX excepcional.
