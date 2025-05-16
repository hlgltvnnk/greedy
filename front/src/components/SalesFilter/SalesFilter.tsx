import { memo } from 'react';
import { DropdownMenu } from '../DropdownMenu/DropdownMenu';
import { useAppStore } from '../../store/appStore';
import FilterIcon from '../../assets/filter.svg?react';
import { useWallet } from '@solana/wallet-adapter-react';

const SalesFilter = () => {
  const { connected } = useWallet();
  const showCreated = useAppStore((s) => s.showCreatedSales);
  const showParticipated = useAppStore((s) => s.showParticipatedSales);
  const toggleCreated = useAppStore((s) => s.toggleShowCreatedSales);
  const toggleParticipated = useAppStore((s) => s.toggleShowParticipatedSales);

  return (
    <DropdownMenu
      className={!connected ? 'opacity-40 pointer-events-none' : ''}
      labelClassName="w-[112px]! px-4 py-2 bg-[#385A66]"
      menuClassName="w-[292px]! px-4 top-12 right-0 left-auto p-0!"
      menuItemClassName="gap-2 justify-start"
      renderLabel={() => (
        <div className="flex items-center gap-2">
          <FilterIcon className="w-5 h-5" />
          <span>Filters</span>
        </div>
      )}
      items={[
        {
          label: "Sales I've Participated In",
          onClick: toggleParticipated,
          type: 'toggle',
          isChecked: showParticipated,
          color: 'white',
        },
        {
          label: "Sales I've Created",
          onClick: toggleCreated,
          type: 'toggle',
          isChecked: showCreated,
          color: 'white',
        },
      ]}
      showArrow={false}
    />
  );
};

export default memo(SalesFilter);
