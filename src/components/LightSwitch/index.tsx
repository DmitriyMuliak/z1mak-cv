import styles from './styles.module.css';

type Props = { onClick: () => void; isOn: boolean };

export const LightSwitch: React.FC<Props> = ({ onClick, isOn }) => {
  const handleChange = () => {
    onClick();
  };

  return (
    <div className={styles.container}>
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
