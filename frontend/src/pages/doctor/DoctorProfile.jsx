import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiCamera, FiEdit2, FiSave, FiX, FiCheck } from 'react-icons/fi';
import Sidebar from '../../components/Sidebar';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { Skeleton } from '../../components/Skeleton';

export default function DoctorProfile() {
  const { token, user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    consultation_fee: '',
    bio: ''
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/doctor/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      console.log('Fetched doctor profile:', data);
      if (data.status === 'success' && data.data) {
        setProfile(data.data);
        setFormData({
          name: data.data.User?.name || user?.name || '',
          email: data.data.User?.email || user?.email || '',
          phone: data.data.User?.phone || user?.phone || '',
          specialization: data.data.specialization || '',
          experience: data.data.experience !== undefined ? String(data.data.experience) : '0',
          consultation_fee: data.data.consultation_fee !== undefined ? String(data.data.consultation_fee) : '0',
          bio: data.data.bio || ''
        });
      } else {
        addToast(data.message || 'Failed to parse profile response', 'error');
      }
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      addToast('Failed to load profile details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/doctor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          specialization: formData.specialization,
          experience: parseInt(formData.experience, 10) || 0,
          consultation_fee: parseFloat(formData.consultation_fee) || 0,
          bio: formData.bio
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        addToast('Profile updated successfully', 'success');
        setIsEditing(false);
        fetchProfile();
      } else {
        addToast(data.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      addToast('Error updating profile information', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('avatar', file);

    try {
      addToast('Uploading image...', 'info');
      const res = await fetch('/api/doctor/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadData
      });
      const data = await res.json();
      if (data.status === 'success') {
        addToast('Profile photo updated successfully', 'success');
        fetchProfile();
      } else {
        addToast(data.message || 'Photo upload failed', 'error');
      }
    } catch (error) {
      addToast('Error uploading photo', 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-surface-50">
      <Sidebar />

      <main className="flex-1 overflow-auto medical-grid font-sans">
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-2xl font-black text-surface-900 font-display">
                My <span className="gradient-text">Profile</span>
              </h1>
              <p className="text-[10px] text-surface-400 mt-1 font-black uppercase tracking-widest leading-none">
                Manage your professional status and details visible to patients
              </p>
            </motion.div>
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl border border-surface-200 shadow-premium p-8 space-y-6">
              <div className="flex items-center gap-6">
                <Skeleton circle width="6rem" height="6rem" />
                <div className="space-y-2 flex-1">
                  <Skeleton width="40%" height="1.5rem" />
                  <Skeleton width="20%" height="0.75rem" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton height="3rem" />
                <Skeleton height="3rem" />
                <Skeleton height="3rem" />
                <Skeleton height="3rem" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Photo & Profile Card */}
              <div className="bg-white rounded-3xl border border-surface-200 shadow-premium p-6 flex flex-col items-center text-center h-fit">
                <div className="relative group mb-6">
                  <div className="w-32 h-32 rounded-3xl overflow-hidden bg-primary-50 border-4 border-white shadow-xl flex items-center justify-center relative">
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt="Profile Avatar" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <FiUser className="w-12 h-12 text-primary-300" />
                    )}
                  </div>
                  <label className="absolute bottom-2 right-2 w-10 h-10 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-lg transition-all hover:scale-105 active:scale-95">
                    <FiCamera className="w-5 h-5" />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handlePhotoUpload} 
                    />
                  </label>
                </div>

                <h3 className="text-lg font-black text-surface-900 uppercase">
                  Dr. {formData.name}
                </h3>
                <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mt-1">
                  {formData.specialization || 'General Practitioner'}
                </p>
                <p className="text-[10px] font-bold text-surface-400 mt-0.5">
                  {formData.experience || 0} Years Experience
                </p>

                <div className="w-full border-t border-surface-100 my-6 pt-6 space-y-3 text-left">
                  <div>
                    <span className="text-[8px] font-black text-surface-400 uppercase tracking-widest">Email Address</span>
                    <p className="text-xs font-bold text-surface-700">{formData.email}</p>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-surface-400 uppercase tracking-widest">Phone Number</span>
                    <p className="text-xs font-bold text-surface-700">{formData.phone}</p>
                  </div>
                </div>
              </div>

              {/* Editable Fields Form */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-surface-200 shadow-premium p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-100">
                  <h2 className="text-xs font-black uppercase tracking-widest text-surface-900">
                    Professional Information
                  </h2>
                  {!isEditing ? (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      icon={FiEdit2}
                      onClick={() => setIsEditing(true)}
                    >
                      EDIT INFO
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        icon={FiX}
                        onClick={() => {
                          setIsEditing(false);
                          // Reset form to loaded values
                          setFormData({
                            name: profile?.User?.name || '',
                            email: profile?.User?.email || '',
                            phone: profile?.User?.phone || '',
                            specialization: profile?.specialization || '',
                            experience: profile?.experience || '',
                            consultation_fee: profile?.consultation_fee || '',
                            bio: profile?.bio || ''
                          });
                        }}
                      >
                        CANCEL
                      </Button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-surface-400 tracking-widest uppercase mb-2">
                        Specialization
                      </label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-3 text-xs font-bold text-surface-800 disabled:opacity-60 focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
                        placeholder="e.g. Cardiologist, Dermatologist"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-surface-400 tracking-widest uppercase mb-2">
                        Experience (Years)
                      </label>
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-3 text-xs font-bold text-surface-800 disabled:opacity-60 focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
                        placeholder="e.g. 10"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-surface-400 tracking-widest uppercase mb-2">
                        Consultation Fee (INR)
                      </label>
                      <input
                        type="number"
                        name="consultation_fee"
                        value={formData.consultation_fee}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-3 text-xs font-bold text-surface-800 disabled:opacity-60 focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
                        placeholder="e.g. 500"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-surface-400 tracking-widest uppercase mb-2">
                      Professional Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows="4"
                      className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-3 text-xs font-bold text-surface-800 disabled:opacity-60 focus:outline-none focus:border-primary-500 focus:bg-white transition-all resize-none"
                      placeholder="Share details about your clinical practice, expertise, and philosophy of care..."
                    />
                  </div>

                  {isEditing && (
                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        variant="primary"
                        icon={FiSave}
                        disabled={saving}
                        className="shadow-lg shadow-primary-500/20"
                      >
                        {saving ? 'SAVING...' : 'SAVE CHANGES'}
                      </Button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
