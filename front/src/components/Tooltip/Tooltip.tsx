import React from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

interface ITooltipProps {
  id: string;
  content: string;
}

const Tooltip: React.FC<ITooltipProps> = ({ id, content }) => (
  <ReactTooltip
    id={id}
    place="top"
    className="!bg-black !text-white !text-sm !rounded-xl !px-4 !py-3 !leading-snug !max-w-[300px] z-50 shadow-lg"
    arrowColor="black">
    {content}
  </ReactTooltip>
);

export default Tooltip;
