import React from 'react';
import styles from './styles.module.css';

export const SphereLoader = () => {
  return (
    <div className={styles.loader}>
      <svg width={100} height={100} viewBox="0 0 100 100">
        <defs>
          <mask className={styles.clipping} id="sphere-loader-clipping-mask">
            <polygon points="0,0 100,0 100,100 0,100" fill="black" />
            <polygon points="25,25 75,25 50,75" fill="white" />
            <polygon points="50,25 75,75 25,75" fill="white" />
            <polygon points="35,35 65,35 50,65" fill="white" />
            <polygon points="35,35 65,35 50,65" fill="white" />
            <polygon points="35,35 65,35 50,65" fill="white" />
            <polygon points="35,35 65,35 50,65" fill="white" />
          </mask>
        </defs>
      </svg>
      <div className={styles.box} />
    </div>
  );
};
