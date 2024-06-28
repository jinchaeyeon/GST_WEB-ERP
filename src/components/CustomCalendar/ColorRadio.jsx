import React from 'react';
import styles from './ColorRadio.module.css';
export default function ColorRadio({ color, handleColor, isTheme }) {
  return (
    <div className={`${styles.box} ${isTheme && styles.theme}`}>
      <div
        className={`${styles.blue} ${styles.color} ${
          color === 'blue' ? styles.selected : ''
        } ${isTheme && styles.themeColor}`}
        onClick={() => handleColor('blue')}
      ></div>
    </div>
  );
}
