import { Outlet} from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';

export default function StudentLayout() {


  return (
    <>
      <Navbar />
      <div className="workspace">
        <Sidebar role='student' />
      <main>
        <Outlet />
      </main>
      </div>
    </>
  );
}
