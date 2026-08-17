import { collectionRefs, db } from './firestore.js';

export async function nextAnimalId(type) {
  const prefixes = { Cow: 'C', Goat: 'G', Sheep: 'S' };
  const prefix = prefixes[type] || 'A';
  const counterRef = db().collection('counters').doc(`animals-${prefix}`);
  const id = await db().runTransaction(async transaction => {
    const snap = await transaction.get(counterRef);
    const current = snap.exists ? Number(snap.data().nextSequence || 1) : 1;
    transaction.set(counterRef, { nextSequence: current + 1 }, { merge: true });
    return current;
  });

  return `${prefix}-${String(id).padStart(3, '0')}`;
}

export async function nextDocId(prefix) {
  const ref = db().collection('counters').doc(prefix);
  const id = await db().runTransaction(async transaction => {
    const snap = await transaction.get(ref);
    const current = snap.exists ? Number(snap.data().nextSequence || 1) : 1;
    transaction.set(ref, { nextSequence: current + 1 }, { merge: true });
    return current;
  });

  return `${prefix.toUpperCase()}-${String(id).padStart(4, '0')}`;
}
