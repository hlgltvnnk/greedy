import { ISale } from './airdrops';

export enum EModals {
  CLAIM_SUCCESS = 'CLAIM_SUCCESS',
  PARTICIPATE_SUCCESS = 'PARTICIPATE_SUCCESS',
  CONNECT_WALLET = 'CONNECT_WALLET',
  CREATE_SALE = 'CREATE_SALE',
  CREATE_SALE_SUCCESS = 'CREATE_SALE_SUCCESS',
  HOW_IT_WORKS = 'HOW_IT_WORKS',
  EMPTY = 'EMPTY',
}

export interface ICloseModal extends React.PropsWithChildren {
  closeModal: () => void;
}

export interface IClaimSuccessModal extends ICloseModal {
  saleId?: string | null;
}

export interface IParticipateSuccessModal extends ICloseModal {
  saleId?: string | null;
}

export interface IConnectWalletModal extends ICloseModal {
  connectWallet: () => void;
}

export interface ICreateSaleModal extends ICloseModal {
  sale?: ISale;
  showConnectWallet: () => void;
  showSuccess: (saleId: string) => void;
}

export interface ICreateSaleSuccessModal extends ICloseModal {
  saleId?: string | null;
}

export type IModalsProps = {
  [EModals.CLAIM_SUCCESS]: IClaimSuccessModal;
  [EModals.PARTICIPATE_SUCCESS]: IParticipateSuccessModal;
  [EModals.CONNECT_WALLET]: IConnectWalletModal;
  [EModals.CREATE_SALE]: ICreateSaleModal;
  [EModals.CREATE_SALE_SUCCESS]: ICreateSaleSuccessModal;
  [EModals.HOW_IT_WORKS]: ICloseModal;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [EModals.EMPTY]: any;
};

export interface IModalInstance {
  type: EModals;
  props: IModalsProps[EModals];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.LazyExoticComponent<React.ComponentType<any>> | null;
}
