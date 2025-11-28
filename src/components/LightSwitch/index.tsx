// import { Pointer } from 'lucide-react';
// import { cn } from '@/lib/utils';
import styles from './styles.module.css';

type Props = { onClick: () => void; isOn: boolean };

export const LightSwitch: React.FC<Props> = ({ onClick, isOn }) => {
  const handleChange = () => {
    onClick();
  };

  return (
    <div className={styles.container}>
      {/* <Pointer
        size="inherit"
        className={cn(
          'absolute z-10 w-[30%] bottom-[-4px] left-1/2 transform -translate-x-1/2 text-black pointer-events-none',
          // isOn && 'fill-orange-700',
        )}
      /> */}
      <label className={styles.btn}>
        <input
          className="sr-only"
          type="checkbox"
          checked={isOn}
          onChange={handleChange}
          aria-label="Toggle lights"
        />
        <span aria-hidden="true"></span>
      </label>
    </div>
  );
};
