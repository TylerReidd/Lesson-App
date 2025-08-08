import { Outlet, Link, useNavigate, NavLink } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import axios from "../axios.js";

export default function TeacherLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <>
      <Navbar />
    <div className="student-layout">

      <main className="content-full">
        <Outlet /> {/* renders the current teacher page */}
      </main>
    </div>
    </>
  );
}
