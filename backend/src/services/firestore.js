import { getDb } from '../config/firebase.js';

export const db = () => getDb();

export const collectionRefs = {
  users: () => db().collection('users'),
  animals: () => db().collection('animals'),
  expenses: () => db().collection('expenses'),
  feed: () => db().collection('feed'),
  medicine: () => db().collection('medicine'),
  sales: () => db().collection('sales')
};
