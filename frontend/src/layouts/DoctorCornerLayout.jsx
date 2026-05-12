import { Outlet } from 'react-router-dom';
import DoctorCornerNavbar from '../pages/doctorcorner/DoctorCornerNavbar';

export default function DoctorCornerLayout() {
  return (
    <div className="min-h-screen">
      <DoctorCornerNavbar />
      <main className="pt-1">
        <Outlet />
      </main>
    </div>
  );
}
