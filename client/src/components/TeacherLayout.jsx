import { Outlet, Link, useNavigate, NavLink } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import axios from "../axios.js";
import Sidebar from "./Sidebar.jsx";

export default function TeacherLayout() {
  const navigate = useNavigate();


  return (
    <>
      <Navbar />
    <div className="workspace">
      <Sidebar />
      <main>
        <Outlet />
      </main>
    </div>
    </>
  );
}
