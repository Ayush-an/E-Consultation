import { Outlet } from 'react-router-dom';
import { FiUser, FiChevronDown, FiBell } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import ProfilePopup from '../components/ProfilePopup';
import PatientSidebar from '../components/PatientSidebar';

export default function PatientLayout() {
  const { user, token } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (token) {
        fetchProfile();
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/patients/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setProfileData(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const handleAvatarUpdate = (newUrl) => {
    setProfileData(prev => ({
      ...prev,
      Patient: {
        ...prev?.Patient,
        avatar_url: newUrl
      }
    }));
  };

  return (
    <div className="flex min-h-screen bg-surface-50 font-sans">
      <PatientSidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Dashboard Header */}
        <header className="h-20 bg-white border-b border-surface-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <div>
            <h2 className="text-sm font-black text-surface-900 uppercase tracking-widest font-display">
              Health Dashboard
            </h2>
            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-0.5">
              Welcome back, {user?.name || 'Patient'}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2.5 bg-surface-50 rounded-xl border border-surface-200 text-surface-500 hover:text-primary-600 transition-all">
              <FiBell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary-600 rounded-full border-2 border-white shadow-sm"></span>
            </button>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-black text-surface-900 uppercase tracking-tight leading-none">
                  {user?.name || 'Patient'}
                </p>
                <p className="text-[8px] font-black text-primary-600 tracking-widest uppercase mt-1">
                  Active Member
                </p>
              </div>

              <button 
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-2 p-1 bg-surface-50 rounded-2xl border border-surface-100 hover:border-primary-200 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-surface-200 overflow-hidden flex items-center justify-center shadow-sm">
                  {profileData?.Patient?.avatar_url ? (
                    <img src={profileData.Patient.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <FiUser className="w-5 h-5 text-surface-400" />
                  )}
                </div>
                <FiChevronDown className="w-4 h-4 text-surface-400 mr-1" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-8 relative overflow-y-auto">
          {/* Subtle Background Patterns */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
             <div className="absolute top-10 right-10 w-96 h-96 bg-primary-600/5 blur-[100px] rounded-full" />
             <div className="absolute bottom-10 left-10 w-96 h-96 bg-secondary-500/5 blur-[100px] rounded-full" />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto">
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
