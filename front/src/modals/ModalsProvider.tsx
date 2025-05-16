import React, { memo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import classNames from 'classnames';
import useModalStore from '../store/modals.store';

const Modals: React.FC = () => {
  const { modals, closeModal } = useModalStore();

  useEffect(() => {
    if (modals.length > 0) {
      document.documentElement.style.overflowY = 'hidden';
    } else {
      document.documentElement.style.overflowY = 'unset';
    }
  }, [modals.length]);

  return (
    <AnimatePresence>
      {modals.map((modalInstance, index) => {
        const { component: ModalComponent, type, props } = modalInstance;
        return ModalComponent ? (
          <React.Suspense fallback={null} key={type + index}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="modal-wrapper-outer">
              <motion.div
                className={classNames('modal-wrapper')}
                onClick={props?.isCloseHidden ? () => {} : closeModal}
              />
              <ModalComponent closeModal={closeModal} type={index} {...modalInstance.props} />
            </motion.div>
          </React.Suspense>
        ) : null;
      })}
    </AnimatePresence>
  );
};

export default memo(Modals);
