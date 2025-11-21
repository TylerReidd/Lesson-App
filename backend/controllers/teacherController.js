import User from "../models/User.js";

export async function linkStudentByEmail(req, res, next) {
  try {
    const { studentEmail } = req.body;
    if (!studentEmail) {
      return res.status(400).json({ message: "Student email is required" });
    }

    const email = String(studentEmail).trim().toLowerCase();
    const student = await User.findOne({ email, role: "student" });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const alreadyLinked =
      student.assignedTeacher &&
      String(student.assignedTeacher) === String(req.user.id);

    student.assignedTeacher = req.user.id;
    await student.save();

    res.json({
      message: alreadyLinked ? "Student already linked" : "Student linked successfully",
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        assignedTeacher: student.assignedTeacher,
      },
    });
  } catch (err) {
    next(err);
  }
}
