import { Feriado } from '../types';

/**
 * Base inicial oficial de Feriados Nacionais e Pontos Facultativos do Brasil
 * Abrangendo 2024, 2025, 2026 e 2027.
 * Novos feriados municipais ou estaduais podem ser adicionados dinamicamente
 * via interface ou sincronizados em tempo real pelo Firestore.
 */
export const FERIADOS_INICIAIS: Feriado[] = [
  // --- 2025 ---
  { id: '2025-01-01', data: '2025-01-01', nome: 'Confraternização Universal (Ano Novo)', tipo: 'NACIONAL', descricao: 'Início do Ano Civil' },
  { id: '2025-03-03', data: '2025-03-03', nome: 'Carnaval (Segunda-feira)', tipo: 'FACULTATIVO', descricao: 'Ponto facultativo de Carnaval' },
  { id: '2025-03-04', data: '2025-03-04', nome: 'Carnaval (Terça-feira)', tipo: 'FACULTATIVO', descricao: 'Carnaval' },
  { id: '2025-03-05', data: '2025-03-05', nome: 'Quarta-feira de Cinzas', tipo: 'FACULTATIVO', descricao: 'Até as 14h' },
  { id: '2025-04-18', data: '2025-04-18', nome: 'Sexta-feira Santa (Paixão de Cristo)', tipo: 'NACIONAL', descricao: 'Feriado Nacional Religioso' },
  { id: '2025-04-20', data: '2025-04-20', nome: 'Páscoa', tipo: 'NACIONAL', descricao: 'Domingo de Páscoa' },
  { id: '2025-04-21', data: '2025-04-21', nome: 'Tiradentes', tipo: 'NACIONAL', descricao: 'Homenagem a Joaquim José da Silva Xavier' },
  { id: '2025-05-01', data: '2025-05-01', nome: 'Dia do Trabalhador', tipo: 'NACIONAL', descricao: 'Dia Internacional dos Trabalhadores' },
  { id: '2025-06-19', data: '2025-06-19', nome: 'Corpus Christi', tipo: 'FACULTATIVO', descricao: 'Celebração religiosa tradicional' },
  { id: '2025-09-07', data: '2025-09-07', nome: 'Independência do Brasil', tipo: 'NACIONAL', descricao: 'Proclamação da Independência de 1822' },
  { id: '2025-10-12', data: '2025-10-12', nome: 'Nossa Senhora Aparecida', tipo: 'NACIONAL', descricao: 'Padroeira do Brasil' },
  { id: '2025-10-28', data: '2025-10-28', nome: 'Dia do Servidor Público', tipo: 'FACULTATIVO', descricao: 'Comemoração oficial' },
  { id: '2025-11-02', data: '2025-11-02', nome: 'Finados', tipo: 'NACIONAL', descricao: 'Dia de Todos os Santos e Finados' },
  { id: '2025-11-15', data: '2025-11-15', nome: 'Proclamação da República', tipo: 'NACIONAL', descricao: 'Marco republicano brasileiro' },
  { id: '2025-11-20', data: '2025-11-20', nome: 'Dia da Consciência Negra', tipo: 'NACIONAL', descricao: 'Feriado Nacional (Lei nº 14.759/2023)' },
  { id: '2025-12-24', data: '2025-12-24', nome: 'Véspera de Natal', tipo: 'FACULTATIVO', descricao: 'Ponto facultativo a partir das 14h' },
  { id: '2025-12-25', data: '2025-12-25', nome: 'Natal', tipo: 'NACIONAL', descricao: 'Celebração do Natal' },
  { id: '2025-12-31', data: '2025-12-31', nome: 'Véspera de Ano Novo', tipo: 'FACULTATIVO', descricao: 'Ponto facultativo a partir das 14h' },

  // --- 2026 ---
  { id: '2026-01-01', data: '2026-01-01', nome: 'Confraternização Universal (Ano Novo)', tipo: 'NACIONAL', descricao: 'Início do Ano Civil' },
  { id: '2026-02-16', data: '2026-02-16', nome: 'Carnaval (Segunda-feira)', tipo: 'FACULTATIVO', descricao: 'Ponto facultativo de Carnaval' },
  { id: '2026-02-17', data: '2026-02-17', nome: 'Carnaval (Terça-feira)', tipo: 'FACULTATIVO', descricao: 'Carnaval' },
  { id: '2026-02-18', data: '2026-02-18', nome: 'Quarta-feira de Cinzas', tipo: 'FACULTATIVO', descricao: 'Até as 14h' },
  { id: '2026-04-03', data: '2026-04-03', nome: 'Sexta-feira Santa (Paixão de Cristo)', tipo: 'NACIONAL', descricao: 'Feriado Nacional Religioso' },
  { id: '2026-04-05', data: '2026-04-05', nome: 'Páscoa', tipo: 'NACIONAL', descricao: 'Domingo de Páscoa' },
  { id: '2026-04-21', data: '2026-04-21', nome: 'Tiradentes', tipo: 'NACIONAL', descricao: 'Homenagem a Joaquim José da Silva Xavier' },
  { id: '2026-05-01', data: '2026-05-01', nome: 'Dia do Trabalhador', tipo: 'NACIONAL', descricao: 'Dia Internacional dos Trabalhadores' },
  { id: '2026-06-04', data: '2026-06-04', nome: 'Corpus Christi', tipo: 'FACULTATIVO', descricao: 'Celebração religiosa tradicional' },
  { id: '2026-09-07', data: '2026-09-07', nome: 'Independência do Brasil', tipo: 'NACIONAL', descricao: 'Proclamação da Independência de 1822' },
  { id: '2026-10-12', data: '2026-10-12', nome: 'Nossa Senhora Aparecida', tipo: 'NACIONAL', descricao: 'Padroeira do Brasil' },
  { id: '2026-10-28', data: '2026-10-28', nome: 'Dia do Servidor Público', tipo: 'FACULTATIVO', descricao: 'Comemoração oficial' },
  { id: '2026-11-02', data: '2026-11-02', nome: 'Finados', tipo: 'NACIONAL', descricao: 'Dia de Finados' },
  { id: '2026-11-15', data: '2026-11-15', nome: 'Proclamação da República', tipo: 'NACIONAL', descricao: 'Marco republicano brasileiro' },
  { id: '2026-11-20', data: '2026-11-20', nome: 'Dia da Consciência Negra', tipo: 'NACIONAL', descricao: 'Feriado Nacional (Lei nº 14.759/2023)' },
  { id: '2026-12-24', data: '2026-12-24', nome: 'Véspera de Natal', tipo: 'FACULTATIVO', descricao: 'Ponto facultativo a partir das 14h' },
  { id: '2026-12-25', data: '2026-12-25', nome: 'Natal', tipo: 'NACIONAL', descricao: 'Celebração do Natal' },
  { id: '2026-12-31', data: '2026-12-31', nome: 'Véspera de Ano Novo', tipo: 'FACULTATIVO', descricao: 'Ponto facultativo a partir das 14h' },

  // --- 2027 ---
  { id: '2027-01-01', data: '2027-01-01', nome: 'Confraternização Universal (Ano Novo)', tipo: 'NACIONAL', descricao: 'Início do Ano Civil' },
  { id: '2027-02-08', data: '2027-02-08', nome: 'Carnaval (Segunda-feira)', tipo: 'FACULTATIVO', descricao: 'Ponto facultativo de Carnaval' },
  { id: '2027-02-09', data: '2027-02-09', nome: 'Carnaval (Terça-feira)', tipo: 'FACULTATIVO', descricao: 'Carnaval' },
  { id: '2027-02-10', data: '2027-02-10', nome: 'Quarta-feira de Cinzas', tipo: 'FACULTATIVO', descricao: 'Até as 14h' },
  { id: '2027-03-26', data: '2027-03-26', nome: 'Sexta-feira Santa (Paixão de Cristo)', tipo: 'NACIONAL', descricao: 'Feriado Nacional Religioso' },
  { id: '2027-03-28', data: '2027-03-28', nome: 'Páscoa', tipo: 'NACIONAL', descricao: 'Domingo de Páscoa' },
  { id: '2027-04-21', data: '2027-04-21', nome: 'Tiradentes', tipo: 'NACIONAL', descricao: 'Homenagem a Joaquim José da Silva Xavier' },
  { id: '2027-05-01', data: '2027-05-01', nome: 'Dia do Trabalhador', tipo: 'NACIONAL', descricao: 'Dia Internacional dos Trabalhadores' },
  { id: '2027-05-27', data: '2027-05-27', nome: 'Corpus Christi', tipo: 'FACULTATIVO', descricao: 'Celebração religiosa tradicional' },
  { id: '2027-09-07', data: '2027-09-07', nome: 'Independência do Brasil', tipo: 'NACIONAL', descricao: 'Proclamação da Independência de 1822' },
  { id: '2027-10-12', data: '2027-10-12', nome: 'Nossa Senhora Aparecida', tipo: 'NACIONAL', descricao: 'Padroeira do Brasil' },
  { id: '2027-11-02', data: '2027-11-02', nome: 'Finados', tipo: 'NACIONAL', descricao: 'Dia de Finados' },
  { id: '2027-11-15', data: '2027-11-15', nome: 'Proclamação da República', tipo: 'NACIONAL', descricao: 'Marco republicano brasileiro' },
  { id: '2027-11-20', data: '2027-11-20', nome: 'Dia da Consciência Negra', tipo: 'NACIONAL', descricao: 'Feriado Nacional (Lei nº 14.759/2023)' },
  { id: '2027-12-25', data: '2027-12-25', nome: 'Natal', tipo: 'NACIONAL', descricao: 'Celebração do Natal' },

  // --- 2024 ---
  { id: '2024-01-01', data: '2024-01-01', nome: 'Confraternização Universal (Ano Novo)', tipo: 'NACIONAL', descricao: 'Início do Ano Civil' },
  { id: '2024-02-12', data: '2024-02-12', nome: 'Carnaval (Segunda-feira)', tipo: 'FACULTATIVO', descricao: 'Ponto facultativo de Carnaval' },
  { id: '2024-02-13', data: '2024-02-13', nome: 'Carnaval (Terça-feira)', tipo: 'FACULTATIVO', descricao: 'Carnaval' },
  { id: '2024-03-29', data: '2024-03-29', nome: 'Sexta-feira Santa (Paixão de Cristo)', tipo: 'NACIONAL', descricao: 'Feriado Nacional Religioso' },
  { id: '2024-04-21', data: '2024-04-21', nome: 'Tiradentes', tipo: 'NACIONAL', descricao: 'Homenagem a Tiradentes' },
  { id: '2024-05-01', data: '2024-05-01', nome: 'Dia do Trabalhador', tipo: 'NACIONAL', descricao: 'Dia Internacional dos Trabalhadores' },
  { id: '2024-05-30', data: '2024-05-30', nome: 'Corpus Christi', tipo: 'FACULTATIVO', descricao: 'Celebração de Corpus Christi' },
  { id: '2024-09-07', data: '2024-09-07', nome: 'Independência do Brasil', tipo: 'NACIONAL', descricao: 'Independência do Brasil' },
  { id: '2024-10-12', data: '2024-10-12', nome: 'Nossa Senhora Aparecida', tipo: 'NACIONAL', descricao: 'Padroeira do Brasil' },
  { id: '2024-11-02', data: '2024-11-02', nome: 'Finados', tipo: 'NACIONAL', descricao: 'Dia de Finados' },
  { id: '2024-11-15', data: '2024-11-15', nome: 'Proclamação da República', tipo: 'NACIONAL', descricao: 'Marco republicano' },
  { id: '2024-11-20', data: '2024-11-20', nome: 'Dia da Consciência Negra', tipo: 'NACIONAL', descricao: 'Feriado Nacional (Lei nº 14.759/2023)' },
  { id: '2024-12-25', data: '2024-12-25', nome: 'Natal', tipo: 'NACIONAL', descricao: 'Natal' }
];
