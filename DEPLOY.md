# 🚀 Deploy do AgendaÁgil

## 📋 Pré-requisitos
- Conta no GitHub
- Conta no Vercel
- Código versionado no Git

## 🎯 Deploy no Vercel (Recomendado)

### 1. Preparar Repositório Git
```bash
git add .
git commit -m "Preparar para deploy no Vercel"
git push origin main
```

### 2. Configurar Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em "Add New Project"
4. Selecione o repositório `agendaagil`
5. Configure as variáveis de ambiente

### 3. Variáveis de Ambiente no Vercel
**Navegue para:** Project Settings > Environment Variables

**Adicione:**
```
DATABASE_URL = (será fornecida pelo Vercel Postgres)
NEXTAUTH_URL = https://seu-projeto.vercel.app
NEXTAUTH_SECRET = (gere um secret aleatório)
JWT_SECRET = (gere um secret aleatório)
```

### 4. Configurar Banco de Dados
1. Na dashboard do Vercel, vá em "Storage"
2. Clique em "Create Database"
3. Escolha "Postgres"
4. Copie a `DATABASE_URL` para as variáveis de ambiente

### 5. Executar Migrações
Após o primeiro deploy:
```bash
# No terminal local, com DATABASE_URL de produção
npx prisma migrate deploy
npx prisma db seed
```

## 🔄 Acesso Multi-PC

Após o deploy:
- **URL da aplicação:** `https://seu-projeto.vercel.app`
- **Acesso:** Qualquer computador com internet
- **Banco:** Compartilhado entre todos os acessos
- **Sincronização:** Automática e em tempo real

## 💡 Dicas Importantes

1. **Backups:** Vercel Postgres faz backup automático
2. **SSL:** HTTPS automático no Vercel
3. **Performance:** CDN global incluído
4. **Monitoramento:** Dashboard de analytics incluído
5. **Domínio customizado:** Configurável nas configurações

## 🆘 Problemas Comuns

- **Build falha:** Verifique se todas as dependências estão no `package.json`
- **Banco não conecta:** Confirme a `DATABASE_URL` nas env vars
- **Prisma Client erro:** Execute `npm run postinstall` localmente primeiro