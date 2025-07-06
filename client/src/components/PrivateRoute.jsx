import { Navigate } from "react-router-dom";

export default function PrivateRoute({user, children, role}) {
  if(!user) return <Navigate to='/login'  replace /> 
  if (role && user.role !== role) return <Navigate to='/login' replace />
  return children
}