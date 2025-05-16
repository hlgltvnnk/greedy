import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'react-lottie-player';
import { useAppStore } from '../../store/appStore';
import loadingData from '../../assets/animations/loading.json';

const Loading = () => {
  const isLoading = useAppStore((s) => s.isLoading);

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
      document.body.style.cursor = 'wait';
    } else {
      document.body.style.overflow = '';
      document.body.style.cursor = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.cursor = '';
    };
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="loading fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 p-6">
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-background opacity-80 z-51 p-6" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center text-primary text-2xl font-bold z-52 p-6">
            <Lottie play animationData={loadingData} />
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center text-secondary-text text-[20px] font-bold mt-[100px] z-52">
            Almost Rich
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loading;
