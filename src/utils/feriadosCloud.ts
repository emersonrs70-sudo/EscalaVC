import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Feriado } from '../types';
import { FERIADOS_INICIAIS } from '../data/feriados';

const COLLECTION_NAME = 'feriados';

let hasCompletedInitialFeriadosSync = false;

/**
 * Escuta atualizações de feriados em tempo real do Firebase Firestore
 */
export function subscribeToFeriadosInCloud(
  onData: (feriados: Feriado[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const colRef = collection(db, COLLECTION_NAME);

  return onSnapshot(
    colRef,
    async (snapshot) => {
      // Se a coleção estiver vazia na primeira inicialização, migra a lista oficial inicial
      if (snapshot.empty && !hasCompletedInitialFeriadosSync) {
        hasCompletedInitialFeriadosSync = true;
        try {
          const localSaved = localStorage.getItem('escala_6x2_feriados');
          let seedData: Feriado[] = FERIADOS_INICIAIS;
          if (localSaved) {
            try {
              const parsed = JSON.parse(localSaved);
              if (Array.isArray(parsed) && parsed.length > 0) {
                seedData = parsed;
              }
            } catch {
              // fallback to FERIADOS_INICIAIS
            }
          }

          const batch = writeBatch(db);
          for (const item of seedData) {
            const cleanItem = Object.fromEntries(
              Object.entries(item).filter(([_, v]) => v !== undefined)
            );
            const docRef = doc(db, COLLECTION_NAME, item.id);
            batch.set(docRef, cleanItem);
          }
          await batch.commit();
          onData(seedData);
          return;
        } catch (seedErr) {
          console.error('Erro ao popular feriados iniciais no Firestore:', seedErr);
        }
      }

      hasCompletedInitialFeriadosSync = true;

      const list: Feriado[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Feriado;
        list.push({
          ...data,
          id: docSnap.id,
        });
      });

      // Se a lista estiver vazia por algum motivo, mantemos pelo menos os iniciais
      const finalList = list.length > 0 ? list : FERIADOS_INICIAIS;

      // Mantém backup no localStorage
      try {
        localStorage.setItem('escala_6x2_feriados', JSON.stringify(finalList));
      } catch {
        // ignore
      }
      onData(finalList);
    },
    (error) => {
      console.error('Erro ao escutar feriados no Firestore:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Salva ou atualiza um feriado na nuvem
 */
export async function saveFeriadoToCloud(feriado: Feriado): Promise<void> {
  const cleanItem = Object.fromEntries(
    Object.entries(feriado).filter(([_, v]) => v !== undefined)
  );
  const docRef = doc(db, COLLECTION_NAME, feriado.id);
  await setDoc(docRef, cleanItem, { merge: true });
}

/**
 * Deleta um feriado na nuvem
 */
export async function deleteFeriadoFromCloud(feriadoId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, feriadoId);
  await deleteDoc(docRef);
}

/**
 * Sincroniza em lote uma lista inteira de feriados (ex: ao importar feriados municipais de uma imagem)
 */
export async function syncBatchFeriadosToCloud(feriados: Feriado[]): Promise<void> {
  const batch = writeBatch(db);
  for (const item of feriados) {
    const cleanItem = Object.fromEntries(
      Object.entries(item).filter(([_, v]) => v !== undefined)
    );
    const docRef = doc(db, COLLECTION_NAME, item.id);
    batch.set(docRef, cleanItem, { merge: true });
  }
  await batch.commit();
}
