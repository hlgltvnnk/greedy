import React, { memo } from 'react';
import { ICloseModal } from '../../interfaces/modals';

const HowItWorksModal: React.FC<ICloseModal> = ({ closeModal }) => {
  return (
    <div className="modal flex items-center flex-col max-w-[360px] sm:max-w-[440px] md:max-w-[500px] lg:max-w-[540px] p-8 md:p-10 lg:p-14 max-h-[90%] overflow-y-auto">
      <button
        onClick={closeModal}
        className="absolute top-6 right-6 text-gray-400 hover:text-white transition">
        <img src="/images/close.png" alt="close" className="w-6 h-6" />
      </button>

      <img className="mb-9" src="/images/modals/how-it-works.svg" />

      <h3 className="mb-4 text-5xl font-semibold text-center">How it works</h3>
      <p className="mb-9 text-[#B7CFD7] text-center text-base/[140%] font-normal font-secondary">
        Claim more by waiting — if you dare.
      </p>
      <ul className="flex flex-col gap-9 w-full mb-9">
        <li className="flex flex-row gap-4">
          <span className="text-white text-[32px]/[100%] font-semibold w-9">1.</span>
          <div className="flex flex-col gap-2">
            <h4 className="text-white text-lg/[100%] font-semibold">Join the Sale</h4>
            <p className="text-secondary-text text-sm/[100%] font-normal">
              Stake your claim during the join phase.
            </p>
          </div>
        </li>
        <li className="flex flex-row gap-4">
          <span className="text-white text-[32px]/[100%] font-semibold w-9">2.</span>
          <div className="flex flex-col gap-2">
            <h4 className="text-white text-lg/[100%] font-semibold">Farming Begins</h4>
            <p className="text-secondary-text text-sm/[100%] font-normal">
              Once the timer starts, tokens start growing.
            </p>
          </div>
        </li>
        <li className="flex flex-row gap-4">
          <span className="text-white text-[32px]/[100%] font-semibold w-9">3.</span>
          <div className="flex flex-col gap-2">
            <h4 className="text-white text-lg/[100%] font-semibold">Choose Your Moment</h4>
            <p className="text-secondary-text text-sm/[100%] font-normal">
              Claim early and get a little — or wait and get more. But don’t wait too long — others
              might snatch it before you.
            </p>
          </div>
        </li>
      </ul>
      <button onClick={closeModal} className="primary-button w-full">
        Okay
      </button>
    </div>
  );
};

export default memo(HowItWorksModal);
