import React, { memo } from 'react';
import { IParticipateSuccessModal } from '../../interfaces/modals';

const ParticipateSuccessModal: React.FC<IParticipateSuccessModal> = ({ closeModal }) => (
  <div className="modal flex items-center justify-center flex-col max-w-[360px] md:max-w-[440px] lg:max-w-[500px] p-0">
    <button
      onClick={closeModal}
      className="absolute top-6 right-6 text-gray-400 hover:text-white transition">
      <img src="/images/close.png" alt="close" className="w-6 h-6" />
    </button>
    <div className="modal-shine" onClick={closeModal} />
    <div className="flex flex-col items-center justify-center bg-[#142024] p-6 md:p-10 lg:p-16 rounded-2xl w-full">
      <img className="mb-9" src="/images/modals/participate-success.svg" />
      <h3 className="mb-4 text-5xl/[100%] font-semibold text-center">You're In!</h3>
      <p className="mb-9 text-[#B7CFD7] text-md font-normal font-secondary">
        You've successfully joined the sale.
      </p>
      <button onClick={closeModal} className="primary-button w-full">
        Let the Greed Begin
      </button>
    </div>
  </div>
);

export default memo(ParticipateSuccessModal);
