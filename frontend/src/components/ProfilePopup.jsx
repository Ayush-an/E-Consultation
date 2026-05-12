import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCamera, FiUpload, FiUser, FiCheck, FiRefreshCw } from 'react-icons/fi';
import Button from './Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

export default function ProfilePopup({ isOpen, onClose, profileData, onAvatarUpdate }) {
  const { token, user } = useAuth();
  const { addToast } = useToast();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop camera stream on unmount or when camera is closed
  useEffect(() => {
    let stream = null;
    if (isCameraOpen && videoRef.current) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
            .then(s => {
                stream = s;
                videoRef.current.srcObject = s;
            })
            .catch(err => {
                console.error("Camera error:", err);
                addToast("Could not access camera", "error");
                setIsCameraOpen(false);
            });
    }
    return () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };
  }, [isCameraOpen]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
      setIsCameraOpen(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadAvatar(file);
    }
  };

  const uploadAvatar = async (fileOrBlob) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', fileOrBlob, 'avatar.jpg');

    try {
      const response = await fetch('/api/patients/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.status === 'success') {
        onAvatarUpdate(data.data.avatar_url);
        setCapturedImage(null);
        addToast("Profile picture updated", "success");
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      addToast(err.message || "Failed to upload image", "error");
    } finally {
      setUploading(false);
    }
  };

  const confirmCaptured = () => {
    if (capturedImage) {
      // Convert dataUrl to Blob
      fetch(capturedImage)
        .then(res => res.blob())
        .then(blob => uploadAvatar(blob));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-surface-900/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-surface-200 overflow-y-auto max-h-[90vh]"
          >
            {/* Header */}
            <div className="relative h-32 bg-gradient-to-br from-primary-600 to-primary-400">
               <button 
                 onClick={onClose}
                 className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors z-10"
               >
                 <FiX className="w-5 h-5" />
               </button>
            </div>

            {/* Profile Info */}
            <div className="px-8 pb-8 -mt-16 text-center">
               <div className="relative inline-block group">
                  <div className="w-32 h-32 rounded-[2rem] border-4 border-white bg-surface-100 shadow-xl overflow-hidden relative">
                    {profileData?.Patient?.avatar_url ? (
                      <img src={profileData.Patient.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-surface-300 bg-surface-50">
                        <FiUser className="w-12 h-12" />
                      </div>
                    )}
                    {uploading && (
                       <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                          <FiRefreshCw className="w-6 h-6 text-primary-600 animate-spin" />
                       </div>
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 p-2.5 bg-white text-primary-600 rounded-xl shadow-lg border border-surface-100 hover:scale-110 active:scale-95 transition-all"
                  >
                    <FiCamera className="w-4 h-4" />
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
               </div>

               <div className="mt-4">
                  <h2 className="text-xl font-black text-surface-900 uppercase tracking-tight">{profileData?.name || 'Patient'}</h2>
                  <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mt-1">Dedicated Patient Account</p>
               </div>

               <div className="mt-8 grid grid-cols-2 gap-3 text-left">
                  <div className="p-4 rounded-2xl bg-surface-50 border border-surface-100">
                     <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest mb-1">Age</p>
                     <p className="text-sm font-bold text-surface-900">{profileData?.Patient?.age || '--'} Years</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-surface-50 border border-surface-100">
                     <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest mb-1">Gender</p>
                     <p className="text-sm font-bold text-surface-900 uppercase tracking-wide">{profileData?.Patient?.gender || '--'}</p>
                  </div>
                  <div className="col-span-2 p-4 rounded-2xl bg-surface-50 border border-surface-100">
                     <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest mb-1">Contact Number</p>
                     <p className="text-sm font-bold text-surface-900 tracking-wider">{profileData?.phone || '--'}</p>
                  </div>
               </div>

               <div className="mt-8 flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 text-[11px] font-black" 
                    icon={FiCamera}
                    onClick={() => setIsCameraOpen(true)}
                  >
                    SNAP PHOTO
                  </Button>
                  <Button 
                    variant="primary" 
                    className="flex-1 text-[11px] font-black" 
                    icon={FiUpload}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    UPLOAD
                  </Button>
               </div>
            </div>

            {/* Camera Overlay */}
            <AnimatePresence>
               {isCameraOpen && (
                 <motion.div 
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="absolute inset-0 bg-black z-20 flex flex-col"
                 >
                    <div className="flex-1 flex items-center justify-center relative bg-surface-950">
                       <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                       <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none flex items-center justify-center">
                          <div className="w-64 h-64 border-2 border-dashed border-white/50 rounded-[4rem]" />
                       </div>
                    </div>
                    <div className="p-8 bg-black flex items-center justify-between gap-6">
                       <button onClick={() => setIsCameraOpen(false)} className="text-white/60 hover:text-white text-[11px] font-black uppercase tracking-widest">Cancel</button>
                       <button 
                         onClick={takePhoto}
                         className="w-16 h-16 bg-white rounded-full border-4 border-white/20 active:scale-90 transition-transform flex items-center justify-center"
                       >
                          <div className="w-12 h-12 border-2 border-black/10 rounded-full" />
                       </button>
                       <div className="w-12" /> {/* alignment spacer */}
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>

            {/* Captured Image Preview */}
            <AnimatePresence>
               {capturedImage && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white z-30 flex flex-col items-center justify-center p-8"
                  >
                     <div className="w-64 h-64 rounded-[3rem] overflow-hidden border-4 border-primary-100 shadow-2xl mb-10">
                        <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                     </div>
                     <h4 className="text-lg font-black text-surface-900 uppercase tracking-tight mb-2">Looks Good!</h4>
                     <p className="text-xs text-surface-500 font-bold mb-10">Use this as your professional profile picture?</p>
                     <div className="flex w-full gap-4">
                        <Button variant="outline" className="flex-1" onClick={() => setCapturedImage(null)}>RETAKE</Button>
                        <Button variant="primary" className="flex-1" icon={FiCheck} onClick={confirmCaptured} loading={uploading}>USE PHOTO</Button>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
            
            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
