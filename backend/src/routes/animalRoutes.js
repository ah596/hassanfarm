import { Router } from 'express';
import {
  listAnimals,
  getAnimal,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  animalSummary,
  recordBreeding,
  recordBirth
} from '../controllers/animalController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/', listAnimals);
router.post('/', createAnimal);
router.get('/:id', getAnimal);
router.get('/:id/summary', animalSummary);
router.post('/:id/breeding', recordBreeding);
router.post('/:id/breeding/:breedingId/birth', recordBirth);
router.put('/:id', updateAnimal);
router.delete('/:id', deleteAnimal);

export default router;
