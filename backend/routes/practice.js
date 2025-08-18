import express from 'express'
import {isAuthenticated, isStudent, isTeacher} from '../middleware/auth.js';
import { createPractice, getMyPractice, getStudentPracticeForTeacher } from '../controllers/practiceController.js';

const router = express.Router()

router.post('/', isAuthenticated, isStudent, createPractice)
router.get('/me', isAuthenticated, isStudent, getMyPractice)

router.get('/teacher/:studentId', isAuthenticated, isTeacher, getStudentPracticeForTeacher)

export default router