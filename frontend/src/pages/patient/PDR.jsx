import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiDownload, FiArrowLeft, FiUser, FiCheckCircle, FiPrinter, FiShield, FiActivity
} from 'react-icons/fi';
import { FaStethoscope } from 'react-icons/fa';
import { GiPill } from 'react-icons/gi';
import Button from '../../components/Button';
import { useToast } from '../../hooks/useToast';
import { mockPrescriptions, mockPatients } from '../../utils/mockData';

export default function PDR() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const prescription = location.state?.prescription || mockPrescriptions[0];
  const patient = location.state?.patient || mockPatients.find((p) => p.id === prescription.patientId) || mockPatients[0];

  const handleDownload = () => {
    addToast('Compiling secure clinical document...', 'info');
    setTimeout(() => {
      addToast('Document exported to local storage.', 'success');
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-surface-50 medical-grid py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Deck */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between print:hidden"
        >
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2.5 text-[9px] font-black text-surface-400 hover:text-primary-600 transition-all uppercase tracking-widest cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-white border border-surface-200 flex items-center justify-center group-hover:border-primary-500 group-hover:text-primary-600 transition-all">
              <FiArrowLeft className="w-3.5 h-3.5" />
            </div>
            Back to Portal
          </button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} icon={FiPrinter} className="px-4 border-surface-200">
              PRINT
            </Button>
            <Button variant="primary" size="sm" onClick={handleDownload} icon={FiDownload} className="px-5 shadow-float">
              EXPORT PDF
            </Button>
          </div>
        </motion.div>

        {/* PDR Document Chassis */}
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-3xl shadow-premium border border-surface-200 overflow-hidden print:shadow-none print:border-none print:rounded-none"
        >
          {/* Official Document Header */}
          <div className="bg-primary-600 p-8 sm:p-10 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 right-10 w-96 h-96 bg-white rounded-full blur-[100px]" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary-400 rounded-full blur-[80px]" />
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white/15 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center justify-center shrink-0">
                  <FiShield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black font-display tracking-tight leading-none mb-2">Diagnostic <span className="text-secondary-400">Response</span></h1>
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 bg-white/10 rounded-md text-[8px] font-black tracking-[0.2em] uppercase border border-white/10 text-white">Official EIR Record</span>
                    <span className="text-primary-100 text-[9px] font-bold opacity-60">Session Date: {prescription.date}</span>
                  </div>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[9px] text-primary-200 font-black tracking-widest uppercase mb-0.5">Reference Auth</p>
                <p className="text-lg font-black font-mono tracking-tighter opacity-90">REF-{prescription.id}</p>
                <div className="flex items-center sm:justify-end gap-1.5 mt-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary-400 animate-pulse" />
                  <span className="text-[8px] text-white/60 font-black tracking-widest uppercase">E-CONSULT VERIFIED</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10 space-y-10">
            {/* Identity Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-6 bg-surface-50 rounded-2xl border border-surface-100 relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                  <FiUser className="w-16 h-16 text-surface-900" />
                </div>
                <div className="relative">
                  <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-4">Patient Profile</p>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                    {[
                      { label: 'Patient Name', value: patient.name },
                      { label: 'Clinical Age', value: `${patient.age}Y` },
                      { label: 'Phenotype', value: patient.gender },
                      { label: 'Contact', value: patient.phone },
                    ].map((item) => (
                      <div key={item.label} className="flex flex-col">
                        <span className="text-[8px] text-surface-400 font-black uppercase tracking-widest mb-0.5">{item.label}</span>
                        <span className="text-xs font-black text-surface-900 uppercase truncate">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-surface-900 rounded-2xl border border-surface-800 text-white relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                  <FaStethoscope className="w-16 h-16 text-white" />
                </div>
                <div className="relative">
                  <p className="text-[10px] font-black text-secondary-400 uppercase tracking-[0.2em] mb-4">Clinical Auth</p>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                    {[
                      { label: 'Lead Physician', value: prescription.doctorName },
                      { label: 'Clinical Node', value: 'VIRTUAL-01' },
                      { label: 'Auth Status', value: 'DIGITALLY SIGNED' },
                      { label: 'Session ID', value: `RX-${prescription.id}` },
                    ].map((item) => (
                      <div key={item.label} className="flex flex-col">
                        <span className="text-[8px] text-surface-500 font-black uppercase tracking-widest mb-0.5">{item.label}</span>
                        <span className="text-xs font-black text-white uppercase truncate">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Systematic Diagnosis */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
                  <FiActivity className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-surface-900 font-display">Clinical Evaluation</h3>
                  <p className="text-[9px] text-surface-400 font-black uppercase tracking-widest">Formal Assessment Statement</p>
                </div>
              </div>
              <div className="p-6 bg-red-50/20 rounded-2xl border border-red-100/50">
                <p className="text-surface-900 font-black leading-relaxed whitespace-pre-wrap uppercase text-xs tracking-wide">{prescription.diagnosis}</p>
              </div>
            </div>

            {/* Pharmacological Protocol */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center border border-primary-500/20">
                  <GiPill className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-surface-900 font-display">Prescription Protocol</h3>
                  <p className="text-[9px] text-surface-400 font-black uppercase tracking-widest">Validated Medication Matrix</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-surface-50 border-b border-surface-100">
                        <th className="px-5 py-3 text-left text-[8px] font-black text-surface-400 uppercase tracking-[0.2em]">Compound</th>
                        <th className="px-5 py-3 text-left text-[8px] font-black text-surface-400 uppercase tracking-[0.2em]">Regimen</th>
                        <th className="px-5 py-3 text-left text-[8px] font-black text-surface-400 uppercase tracking-[0.2em]">Duration</th>
                        <th className="px-5 py-3 text-left text-[8px] font-black text-surface-400 uppercase tracking-[0.2em] hidden sm:table-cell">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100">
                      {prescription.medicines.map((med, i) => (
                        <tr key={i} className="hover:bg-surface-50/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <p className="text-[11px] font-black text-surface-900 uppercase tracking-tight">{med.name}</p>
                          </td>
                          <td className="px-5 py-3.5 text-[10px] font-black text-primary-600 uppercase tracking-tight">{med.dosage}</td>
                          <td className="px-5 py-3.5">
                            <span className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded-md text-[8px] font-black uppercase tracking-widest border border-primary-100">{med.duration}</span>
                          </td>
                          <td className="px-5 py-3.5 text-[9px] font-bold text-surface-500 hidden sm:table-cell uppercase leading-tight">{med.instructions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Additional Medical Directives */}
            {prescription.notes && (
              <div className="p-8 bg-amber-50/30 rounded-4xl border border-amber-100/50">
                <p className="text-[10px] text-amber-600 font-black tracking-widest uppercase mb-3">General Medical Directives</p>
                <p className="text-surface-700 font-bold leading-relaxed text-sm">{prescription.notes}</p>
              </div>
            )}

            {/* Document Verification Section */}
            <div className="mt-16 pt-10 border-t border-surface-100 flex flex-col sm:flex-row items-center justify-between gap-10">
              <div className="flex items-center gap-5 p-6 bg-secondary-50/50 rounded-2xl border border-secondary-100 max-w-sm">
                <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center shrink-0">
                  <FiCheckCircle className="w-6 h-6 text-secondary-600" />
                </div>
                <div>
                  <p className="text-xs font-black text-secondary-900 uppercase tracking-widest mb-1">Authenticated Document</p>
                  <p className="text-[10px] text-secondary-600 font-medium leading-tight">This clinical record is cryptographically signed and stored on the secure EHR network.</p>
                </div>
              </div>

              <div className="text-center sm:text-right">
                <div className="w-32 h-16 border-b-2 border-surface-200 mb-2 mx-auto sm:ml-auto opacity-40" />
                <p className="text-sm font-black text-surface-900 uppercase tracking-widest leading-none mb-1">{prescription.doctorName}</p>
                <p className="text-[9px] text-surface-400 font-black uppercase tracking-widest">AUTHORIZED SIGNATORY</p>
              </div>
            </div>
          </div>

          {/* Bottom Deck for Print Safety */}
          <div className="bg-surface-50 py-5 text-center border-t border-surface-100">
            <p className="text-[9px] text-surface-400 font-black uppercase tracking-[0.3em]">End of Diagnostic Report • Proprietary EHR Standard</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}



