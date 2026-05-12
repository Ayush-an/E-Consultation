import React from 'react';
import { motion } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';
import image1 from '../assets/landingpage/image.png';
import image2 from '../assets/landingpage/image2.jpg';
const steps = [
  {
    id: '1.',
    title: 'Registry',
    desc: 'Register and login to the platform.',
    position: 'left-top'
  },
  {
    id: '2.',
    title: 'Book an Appointment',
    desc: 'Book an appointmen as per doctor availability and time slot.',
    position: 'left-bottom'
  },
  {
    id: '3.',
    title: 'HD Consultation',
    desc: 'As per Booked time slot join the Consultat.',
    position: 'right-top'
  },
  {
    id: '4.',
    title: 'Digital Record',
    desc: 'Download prescriptions and reports.',
    position: 'right-bottom'
  }
];

export default function ProcessCapsule() {
  return (
    <div className="relative max-w-6xl mx-auto py-10 px-8">

      {/* Background Icons */}
      <FiPlus className="absolute top-10 left-10 text-primary-200 w-6 h-6" />
      <FiPlus className="absolute bottom-10 right-10 text-primary-200 w-8 h-8" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center">

        {/* LEFT SIDE */}
        <div className="space-y-20 md:text-right">
          {steps.filter(s => s.position.includes('left')).map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 }}
            >
              <h3 className="text-lg font-bold max-w-[210px] ml-auto text-primary-600 text-left">
                {step.id} {step.title}
              </h3>
              <p className="text-sm text-gray-500 max-w-[210px] ml-auto text-left">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CENTER CAPSULE */}
        <div className="relative flex justify-center">

          {/* Floating Plus */}
          <div className="absolute -top-6 -left-6 bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
            <FiPlus className="w-6 h-6" />
          </div>

          <div className="absolute -bottom-6 -right-6 bg-primary-400 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
            <FiPlus className="w-6 h-6" />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="w-64 h-[480px] rounded-full overflow-hidden flex flex-col shadow-2xl border-8 border-blue-200"
          >

            {/* TOP IMAGE */}
            <div className="h-1/2 relative">
              <img
                src={image1}   // 👉 import or define this
                alt="Medical Care"
                className="w-full h-full object-cover"
              />
              {/* <div className="absolute inset-0 bg-primary-400/60 flex items-center justify-center px-6 text-center text-white">
                <h3 className="text-xl font-bold leading-tight">
                  MODERN MEDICAL CARE
                </h3>
              </div> */}
            </div>

            {/* BOTTOM IMAGE */}
            <div className="h-1/2 relative">
              <img
                src={image2}  // 👉 import or define this
                alt="Medical System"
                className="w-full h-full object-cover"
              />
              {/* <div className="absolute inset-0 bg-primary-600/70 flex items-center justify-center px-6 text-center text-white">
                <p className="text-xs opacity-90">
                  Synchronized protocols ensuring integrity across all nodes.
                </p>
              </div> */}
            </div>

          </motion.div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-20">
          {steps.filter(s => s.position.includes('right')).map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 }}
            >
              <h3 className="text-lg font-bold text-primary-600 text-left">
                {step.id} {step.title}
              </h3>
              <p className="text-sm text-gray-500 max-w-[220px] text-left">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}