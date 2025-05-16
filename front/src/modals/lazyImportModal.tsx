import React from 'react';
import { EModals } from '../interfaces/modals';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const modalCache = new Map<EModals, React.LazyExoticComponent<React.ComponentType<any>>>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const modalImportMap: Record<EModals, () => Promise<{ default: React.ComponentType<any> }>> = {
  [EModals.CLAIM_SUCCESS]: () => import('./ClaimSuccessModal'),
  [EModals.PARTICIPATE_SUCCESS]: () => import('./ParticipateSuccessModal'),
  [EModals.CONNECT_WALLET]: () => import('./ConnectWalletModal'),
  [EModals.CREATE_SALE]: () => import('./CreateSaleModal'),
  [EModals.CREATE_SALE_SUCCESS]: () => import('./CreateSaleSuccessModal'),
  [EModals.HOW_IT_WORKS]: () => import('./HowItWorksModal'),
  [EModals.EMPTY]: () => new Promise((resolve) => resolve({ default: () => null })),
};

export const lazyImportModal = (modalType: EModals) => {
  if (modalCache.has(modalType)) {
    return modalCache.get(modalType);
  }

  const importFunc = modalImportMap[modalType];
  if (!importFunc) return null;

  const LazyComponent = React.lazy(importFunc);
  modalCache.set(modalType, LazyComponent);
  return LazyComponent;
};
