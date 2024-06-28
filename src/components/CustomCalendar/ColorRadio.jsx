import React from 'react';
import styles from './ColorRadio.module.css';
export default function ColorRadio({ color, handleColor, isTheme }) {
  return (
    <div className={`${styles.box} ${isTheme && styles.theme}`}>
      <div
        className={`${styles.pink} ${styles.color} ${
          color === 'pink' ? styles.selected : ''
        } ${isTheme && styles.themeColor}`}
        onClick={() => handleColor('pink')}
      ></div>
      <div
        className={`${styles.yellow} ${styles.color} ${
          color === 'yellow' ? styles.selected : ''
        } ${isTheme && styles.themeColor}`}
        onClick={() => handleColor('yellow')}
      ></div>
      <div
        className={`${styles.green} ${styles.color} ${
          color === 'green' ? styles.selected : ''
        } ${isTheme && styles.themeColor}`}
        onClick={() => handleColor('green')}
      ></div>
    </div>
  );
}
