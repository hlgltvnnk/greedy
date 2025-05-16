import { lazyImportModal } from '../modals/lazyImportModal';
import { EModals, IModalInstance, IModalsProps } from '../interfaces/modals';
import { create } from 'zustand';

export type ModalProps<T extends EModals> = Omit<IModalsProps[T], 'closeModal'>;

interface ModalStore {
  modals: IModalInstance[];
  showModal: <T extends EModals>(type: T, props?: ModalProps<T>) => void;
  closeModal: () => void;
  closeModalByType: (type: EModals) => void;
  clearModals: () => void;
}

const useModalStore = create<ModalStore>((set) => ({
  modals: [],

  showModal: <T extends EModals>(type: T, props?: ModalProps<T>) => {
    const ModalComponent = lazyImportModal(type);
    if (ModalComponent) {
      set((state) => {
        const filteredModals = state.modals.filter((modal) => modal.type !== type);

        const newModal = { type, props, component: ModalComponent };

        return {
          modals: [...filteredModals, newModal],
        };
      });
    }
  },

  closeModal: () => {
    set((state) => {
      const modalsCopy = [...state.modals];
      modalsCopy.pop();
      return { modals: modalsCopy };
    });
  },

  closeModalByType: (type: EModals) => {
    set((state) => {
      const modalsCopy = [...state.modals];
      const filteredModals = modalsCopy.filter((modal) => modal.type !== type);
      return { modals: filteredModals };
    });
  },

  clearModals: () => {
    set({ modals: [] });
  },
}));

export default useModalStore;
