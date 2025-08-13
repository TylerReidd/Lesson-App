import { Outlet} from 'react-router-dom';
import Navbar from './Navbar.jsx';


export default function StudentLayout() {


  return (
    <div className="student-layout">
      {/* Top navigation bar */}
      <Navbar />

      {/* Main content area where nested routes render */}
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
