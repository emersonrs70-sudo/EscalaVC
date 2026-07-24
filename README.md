# Escala 6x2 - Sistema de Gestão de Turnos Contínuos

Aplicação web interativa para consulta e gestão da escala de trabalho **6x2** (6 dias trabalhados por 2 dias de folga) para 4 turmas operacionais (**Turma A, B, C e D**).

## 🚀 Funcionalidades Principal

- **Calendário Mensal Interativo**: Visualização gráfica de turnos (Manhã, Tarde, Noite e Folga) para qualquer mês e ano.
- **Visualização Responsiva (PC & Mobile)**:
  - **Telas Grandes / PC**: Layout expandido em dashboard com resumo operacional das 4 turmas em tempo real ao lado do calendário ampliado.
  - **Dispositivos Móveis**: Interface compacta, leve e de fácil navegação ao toque.
- **Gestão de Equipes Editáveis**:
  - Adição, edição e remoção de colaboradores.
  - Alteração rápida de turmas para remanejamento de operadores.
  - Persistência de dados local no navegador (`localStorage`).
- **Detalhamento do Dia**: Clique em qualquer dia para ver quem está em qual turno no exato horário.
- **Alternância de Tema (Modo Escuro / Claro)**.
- **Notificações e Lembretes de Turno**.

## 🛠️ Tecnologias Utilizadas

- **React 18** com **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Lucide React** (Ícones)

## 📦 Como Rodar Localmente

1. Clone o repositório:
   ```bash
   git clone <URL_DO_SEU_REPOSITORIO>
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.
