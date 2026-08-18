import { Router } from 'express';
import {
  listAnimals,
  getAnimal,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  animalSummary,
  recordBreeding,
  updateBreeding,
  deleteBreeding,
  recordBirth,
  recordPregnancyOutcome
} from '../controllers/animalController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/', listAnimals);
router.post('/', createAnimal);
router.get('/:id', getAnimal);
router.get('/:id/summary', animalSummary);
router.post('/:id/breeding', recordBreeding);
router.put('/:id/breeding/:breedingId', updateBreeding);
router.delete('/:id/breeding/:breedingId', deleteBreeding);
router.post('/:id/breeding/:breedingId/birth', recordBirth);
router.post('/:id/breeding/:breedingId/outcome', recordPregnancyOutcome);
router.put('/:id', updateAnimal);
router.delete('/:id', deleteAnimal);

export default router;
