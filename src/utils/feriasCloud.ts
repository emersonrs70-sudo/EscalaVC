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
import { FeriasPeriodo } from '../types';
import { INITIAL_FERIAS, updateFeriasListStatus } from './ferias';

const COLLECTION_NAME = 'ferias';

/**
 * Escuta atualizações de férias em tempo real do Firebase Firestore
 */
export function subscribeToFeriasInCloud(
  onData: (ferias: FeriasPeriodo[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const colRef = collection(db, COLLECTION_NAME);

  return onSnapshot(
    colRef,
    async (snapshot) => {
      // Se a coleção estiver vazia pela primeira vez, faz a migração dos dados iniciais
      if (snapshot.empty) {
        try {
          const localSaved = localStorage.getItem('escala_6x2_ferias');
          let seedData: FeriasPeriodo[] = INITIAL_FERIAS;
          if (localSaved) {
            try {
              const parsed = JSON.parse(localSaved);
              if (Array.isArray(parsed) && parsed.length > 0) {
                seedData = parsed;
              }
            } catch {
              // fallback to INITIAL_FERIAS
            }
          }

          const batch = writeBatch(db);
          for (const item of seedData) {
            const docRef = doc(db, COLLECTION_NAME, item.id);
            batch.set(docRef, item);
          }
          await batch.commit();
          onData(updateFeriasListStatus(seedData));
          return;
        } catch (seedErr) {
          console.error('Erro ao popular dados iniciais de férias no Firestore:', seedErr);
        }
      }

      const list: FeriasPeriodo[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as FeriasPeriodo;
        list.push({
          ...data,
          id: docSnap.id,
        });
      });

      const updated = updateFeriasListStatus(list);
      // Mantém backup no localStorage para funcionamento offline caso a rede caia
      try {
        localStorage.setItem('escala_6x2_ferias', JSON.stringify(updated));
      } catch {
        // ignore
      }
      onData(updated);
    },
    (error) => {
      console.error('Erro ao escutar férias no Firestore:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Salva ou atualiza um registro de férias na nuvem
 */
export async function saveFeriasToCloud(ferias: FeriasPeriodo): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, ferias.id);
  await setDoc(docRef, ferias, { merge: true });
}

/**
 * Deleta um registro de férias na nuvem
 */
export async function deleteFeriasFromCloud(feriasId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, feriasId);
  await deleteDoc(docRef);
}

/**
 * Substitui toda a lista na nuvem (usado pelo modal ao adicionar/remover)
 */
export async function syncEntireFeriasListToCloud(list: FeriasPeriodo[]): Promise<void> {
  const currentDocs = await getDocs(collection(db, COLLECTION_NAME));
  const existingIds = new Set<string>();
  currentDocs.forEach((d) => existingIds.add(d.id));

  const targetIds = new Set(list.map((item) => item.id));
  const batch = writeBatch(db);

  // Deletar os que não estão mais na lista
  existingIds.forEach((id) => {
    if (!targetIds.has(id)) {
      batch.delete(doc(db, COLLECTION_NAME, id));
    }
  });

  // Gravar os novos/atualizados
  list.forEach((item) => {
    batch.set(doc(db, COLLECTION_NAME, item.id), item);
  });

  await batch.commit();

  try {
    localStorage.setItem('escala_6x2_ferias', JSON.stringify(list));
  } catch {
    // ignore
  }
}
