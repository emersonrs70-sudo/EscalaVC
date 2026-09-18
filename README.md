# 📅 EscalaCerta

**EscalaCerta** é um sistema completo e moderno de gerenciamento e escala de turnos para equipes. Desenvolvido com React, TypeScript e Tailwind CSS, ele permite gerenciar funcionários, planejar escalas de trabalho, visualizar folgas e turnos de forma intuitiva, além de registrar todas as atividades em um painel de auditoria seguro.

---

## 🚀 Funcionalidades Principais

- **Painel Geral (Dashboard):** Visualização rápida de métricas importantes, próximos turnos e atividades recentes da equipe.
- **Minhas Escalas:** Área dedicada para que cada usuário possa consultar seus turnos individuais e solicitar folgas ou trocas.
- **Visualização em Calendário:** Calendário interativo para acompanhamento visual de escalas mensais e semanais.
- **Gerenciamento de Equipes:** Cadastro de novos colaboradores, definição de cargos e acompanhamento de escalas por departamento.
- **Portal do Administrador:** Ferramentas avançadas para criação de turnos, aprovação de folgas, atribuição de escalas e visualização de registros de auditoria.
- **Customização de Perfil:** Upload e remoção instantânea de foto de perfil (com suporte adaptado para dispositivos móveis).

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animações:** [Motion (Framer Motion)](https://motion.dev/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Gráficos:** [Recharts](https://recharts.org/)
- **Build Tool:** [Vite](https://vite.dev/)

---

## 💻 Como Rodar o Projeto Localmente

Siga o passo a passo abaixo para clonar e executar o projeto em sua máquina local:

### 1. Clonar o Repositório
```bash
git clone <URL_DO_SEU_REPOSITORIO_GITHUB>
cd escalacerta
```

### 2. Instalar as Dependências
Utilize o seu gerenciador de pacotes de preferência (npm, yarn ou bun):
```bash
npm install
# ou
yarn install
# ou
bun install
```

### 3. Executar o Servidor de Desenvolvimento
Inicie o servidor local para visualizar o projeto no navegador:
```bash
npm run dev
# ou
yarn dev
# ou
bun dev
```
O projeto estará disponível em `http://localhost:3000` (ou na porta configurada pelo Vite).

### 4. Build para Produção
Para compilar o código otimizado para produção:
```bash
npm run build
```
Os arquivos estáticos compilados serão gerados na pasta `/dist`.

---

## ⚙️ Estrutura do Projeto

```text
├── src/
│   ├── App.tsx          # Componente principal e fluxo de navegação/estado
│   ├── main.tsx         # Ponto de entrada da aplicação React
│   ├── index.css        # Configurações de estilo e importações do Tailwind
│   ├── types.ts         # Definições de tipos e interfaces do TypeScript
│   ├── components/      # Componentes modulares (AdminPortal, CalendarView, Dashboard, etc.)
│   ├── data/            # Dados iniciais e estruturas base
│   └── utils/           # Funções utilitárias auxiliares
├── public/              # Ativos estáticos e recursos públicos
├── package.json         # Manifesto e dependências do projeto
└── vite.config.ts       # Configurações do compilador Vite
```

---

Desenvolvido com carinho para otimizar a organização de equipes! 🌟
