import { motion } from 'framer-motion';

export const Skeleton = ({ className, height, width, circle }) => {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className={`bg-surface-200 animate-pulse ${className}`}
      style={{
        height: height || '1rem',
        width: width || '100%',
        borderRadius: circle ? '50%' : '0.75rem',
      }}
    />
  );
};

export const SkeletonCard = () => (
  <div className="p-5 bg-white rounded-3xl border border-surface-100 space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton circle width="3rem" height="3rem" />
      <div className="flex-1 space-y-2">
        <Skeleton width="60%" height="0.75rem" />
        <Skeleton width="40%" height="0.5rem" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton height="0.5rem" />
      <Skeleton height="0.5rem" />
      <Skeleton width="80%" height="0.5rem" />
    </div>
  </div>
);
