import User from '../models/User.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export async function signup (req, res) {
  try {
    const { name, email, password, role } = req.body;
    if(!name || !email || !password) {
      return req.status(400).json({message: 'Name, email, and password are required'})
    }
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await new User({ name, email, password: hashed, role }).save();
    const payload = {id: user._id, role: userrole, assignedTeacher: user.assignedTeacher}
    const token  = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '1d'});
    res.cookie('token', token, {httpOnly: true}).status(201).json({
      id: user._id, name: user.name, email: user.email, assignedTeacher: user.assignedTeacher
    })

    res
      .cookie('token', token, {
        httpOnly: true,
        secure:true,
        sameSite: 'none',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        message: 'User created successfully',
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};

export async function login (req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (!(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: 'Invalid credentials' });

    if(!process.env.JWT_SECRET) {
      console.error("Missing JWT secret")
      return res.status(500).json({message: "server misconfig"})
    } 
    const token = jwt.sign(
      {id: user._id, role: user.role},
      process.env.JWT_SECRET,
      {expiresIn: '1d'}
    )
    res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: 'Login successful',
        user: { id: user._id, name: user.name, email: user.email, role: user.role, assignedTeacher: user.assignedTeacher }
      });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// clear the cookie on logout
export async function logout (req, res)  {
  res
    .clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    })
    .status(200)
    .json({ message: 'Logged out successfully' });
};

// return the logged-in user (req.user set by middleware)
export async function me  (req, res, next) {
  try {
    if (!req.user)
    return res.status(401).json({message: "not authenticated"})
  
    const user = await User.findById(req.user.id)
    .select('-password')
    .lean()
    res.json({user})
  } catch(err) {
      next(err)
  }
}; 

export async function linkTeacher(req, res, next) {
  try {
    const { teacherEmail } = req.body;
    if (!teacherEmail) {
      return res.status(400).json({ message: 'Teacher email is required.' });
    }
    const teacher = await User.findOne({ email: teacherEmail, role: 'teacher' });
    if (!teacher) {
      return res.status(404).json({ message: 'No teacher found with that email.' });
    }

    // UPDATE the student record in the DB
    await User.findByIdAndUpdate(req.user.id, {
      assignedTeacher: teacher._id
    });

    // Optionally, fetch back the updated user:
    const updated = await User.findById(req.user.id).select('-password');
    res.json({ user: updated });
  } catch (err) {
    next(err);
  }
}




export async function getUserByEmail(req, res, next) {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Student not found' });
    res.json({ _id: user._id, email: user.email, name: user.name });
  } catch (err) {
    next(err);
  }
}