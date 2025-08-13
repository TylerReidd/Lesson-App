import User from '../models/User.js'

export async function teacherHasStudent(req,res,next ) {
  try {
    const {studentId} = req.params;
    const student = await User.findById(studentId).select('assignedTeacher role');
    if (!student || student.role !== 'student') {
      return res.status(404).json({message: 'Student not found'})
    }
    if(String(student.assignedTeacher) !== String(req.user.id)) {
      return res.status(403).json({message: 'Not your student'})
    }
    next()
  } catch (e) {next(e)}
}