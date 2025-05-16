import { SaleItem, SaleItemCreated } from '../index';
import { ISale } from '../../interfaces/airdrops';
import { memo } from 'react';

interface ISaleSectionProps {
  title: string;
  sales: ISale[];
  emptyText: string;
  showCreated?: boolean;
}

const SaleSection: React.FC<ISaleSectionProps> = ({
  title,
  sales,
  emptyText,
  showCreated = false,
}) => {
  return (
    <div className="flex flex-col gap-3 mb-4">
      <h2 className="text-md font-semibold text-[#75A3B2]">{title}</h2>

      {sales.length > 0 ? (
        <div className="flex flex-col gap-4">
          {sales.map((sale) =>
            showCreated ? (
              <SaleItemCreated key={sale.id} sale={sale} />
            ) : (
              <SaleItem key={sale.id} sale={sale} />
            ),
          )}
        </div>
      ) : (
        <p className="no-items">{emptyText}</p>
      )}
    </div>
  );
};

export default memo(SaleSection);
