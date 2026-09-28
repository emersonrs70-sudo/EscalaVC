import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Colaborador } from '../types';
import { COLABORADORES } from '../data/equipes';

const COLLECTION_NAME = 'colaboradores';

/**
 * Escuta atualizações de colaboradores/equipes em tempo real do Firebase Firestore
 */
export function subscribeToColaboradoresInCloud(
  onData: (colaboradores: Colaborador[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const colRef = collection(db, COLLECTION_NAME);

  return onSnapshot(
    colRef,
    async (snapshot) => {
      // Se a coleção estiver vazia no primeiro carregamento, faz o seed com a equipe padrão ou localStorage
      if (snapshot.empty) {
        try {
          const localSaved = localStorage.getItem('escala_6x2_colaboradores');
          let seedData: Colaborador[] = COLABORADORES;
          if (localSaved) {
            try {
              const parsed = JSON.parse(localSaved);
              if (Array.isArray(parsed) && parsed.length > 0) {
                seedData = parsed;
              }
            } catch {
              // fallback to COLABORADORES
            }
          }

          const batch = writeBatch(db);
          for (const item of seedData) {
            const docRef = doc(db, COLLECTION_NAME, item.id);
            batch.set(docRef, item);
          }
          await batch.commit();
          onData(seedData);
          return;
        } catch (seedErr) {
          console.error('Erro ao popular equipe inicial no Firestore:', seedErr);
        }
      }

      const list: Colaborador[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Colaborador;
        list.push({
          ...data,
          id: docSnap.id,
        });
      });

      // Backup offline no localStorage
      try {
        localStorage.setItem('escala_6x2_colaboradores', JSON.stringify(list));
      } catch {
        // ignore
      }

      onData(list);
    },
    (error) => {
      console.error('Erro ao escutar colaboradores no Firestore:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Salva ou atualiza um colaborador na nuvem
 */
export async function saveColaboradorToCloud(colaborador: Colaborador): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, colaborador.id);
  await setDoc(docRef, colaborador, { merge: true });
}

/**
 * Deleta um colaborador na nuvem
 */
export async function deleteColaboradorFromCloud(colaboradorId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, colaboradorId);
  await deleteDoc(docRef);
}

/**
 * Sincroniza a lista inteira de colaboradores na nuvem (usado ao resetar ou reordenar equipes)
 */
export async function syncEntireColaboradoresListToCloud(list: Colaborador[]): Promise<void> {
  const currentDocs = await getDocs(collection(db, COLLECTION_NAME));
  const existingIds = new Set<string>();
  currentDocs.forEach((d) => existingIds.add(d.id));

  const targetIds = new Set(list.map((item) => item.id));
  const batch = writeBatch(db);

  // Deletar os que não existem mais
  existingIds.forEach((id) => {
    if (!targetIds.has(id)) {
      batch.delete(doc(db, COLLECTION_NAME, id));
    }
  });

  // Gravar novos/atualizados
  list.forEach((item) => {
    batch.set(doc(db, COLLECTION_NAME, item.id), item);
  });

  await batch.commit();

  try {
    localStorage.setItem('escala_6x2_colaboradores', JSON.stringify(list));
  } catch {
    // ignore
  }
}
