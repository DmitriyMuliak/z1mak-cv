import styles from './styles.module.css';

export const TwoLineCircle = () => {
  return (
    <div className={styles.loader}>
      <div className={styles.face}>
        <div className={styles.circle} />
      </div>
      <div className={styles.face}>
        <div className={styles.circle} />
      </div>
    </div>
  );
};
