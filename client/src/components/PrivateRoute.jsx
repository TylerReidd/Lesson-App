import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../AuthContext";

export default function PrivateRoute({ children, role}) {
  const {user, loading} = useContext(AuthContext)

  if (loading) {
    return null
  }

  if (!user) {
    return <Navigate to='/login' replace />
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} replace />
  }

  return children
}