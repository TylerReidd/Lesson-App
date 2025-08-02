// controllers/userController.js
import User from '../models/User.js'

// PUT /api/auth/me/teacher
export async function linkTeacher(req, res, next) {
  try {
    if(req.user.assignedTeacher) {
      return res.status(400).json({message: "A teacher is already linked to your account."})
    }
    const { teacherEmail } = req.body;
    if (!teacherEmail) {
      return res.status(400).json({message: "Teacher email is required"})
    }

    const teacher = await User.findOne({ email: teacherEmail, role: 'teacher' });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const student = await User.findById(req.user.id);
    if(!student) {
      return res.status(404).json({message: "Student not found."})
    }

    student.assignedTeacher = teacher._id;
    await student.save()

    // return the new teacher ID so the client can refetch
    res.json({ assignedTeacher: student.assignedTeacher });
  } catch (err) {
    next(err);
  }
}
