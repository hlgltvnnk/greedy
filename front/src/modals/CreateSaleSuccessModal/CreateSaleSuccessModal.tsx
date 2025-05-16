import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ICreateSaleSuccessModal } from '../../interfaces/modals';

const CreateSaleSuccessModal: React.FC<ICreateSaleSuccessModal> = ({ closeModal, saleId }) => {
  const navigate = useNavigate();

  const onClick = () => {
    closeModal();
    navigate(`/sale/${saleId}`);
  };

  return (
    <div className="modal flex items-center justify-center flex-col max-w-[360px] md:max-w-[440px] lg:max-w-[500px] p-0">
      <div className="modal-shine" onClick={closeModal} />
      <div className="w-full flex flex-col items-center justify-center bg-[#142024] p-6 md:p-10 lg:p-16 rounded-2xl">
        <img className="mb-9" src="/images/modals/sale-create-success.svg" />
        <h3 className="mb-4 text-5xl font-semibold text-center">All Set!</h3>
        <p className="mb-9 text-[#B7CFD7] text-sm/[100%] font-normal font-secondary">
          Your sale has been successfully created.
        </p>
        <button onClick={onClick} className="primary-button w-full">
          Check It Out
        </button>
      </div>
    </div>
  );
};

export default memo(CreateSaleSuccessModal);
