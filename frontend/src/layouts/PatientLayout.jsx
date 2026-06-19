import { Outlet } from 'react-router-dom';
import { FiUser, FiChevronDown, FiBell, FiMenu } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import ProfilePopup from '../components/ProfilePopup';
import PatientSidebar from '../components/PatientSidebar';

export default function PatientLayout() {
  const { user, token } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (token) fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/patients/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.status === 'success') setProfileData(data.data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const handleAvatarUpdate = (newUrl) => {
    setProfileData((prev) => ({
      ...prev,
      Patient: { ...prev?.Patient, avatar_url: newUrl },
    }));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PatientSidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 lg:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base font-semibold text-gray-800">My Health</h2>
              <p className="text-xs text-gray-500">Welcome, {user?.name?.split(' ')[0] || 'Patient'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
              <FiBell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border border-white" />
            </button>

            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                {profileData?.Patient?.avatar_url ? (
                  <img src={profileData.Patient.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <FiUser className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                {user?.name || 'Patient'}
              </span>
              <FiChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <ProfilePopup
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profileData={profileData}
        onAvatarUpdate={handleAvatarUpdate}
      />
    </div>
  );
}
