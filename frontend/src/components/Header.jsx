import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <div
      style={{
        padding: '12px 0px',
        backgroundColor: 'rgb(5, 150, 105)',
        textAlign: 'center',
        position: 'fixed',
        width: '100%',
        height: '120px',
        top: '0',
        left: '0',
        right: '0',
        zIndex: '999',
        color: 'white',
      }}
    >
      <div>
        <h1>DNA Floraison</h1>
        <p>Flowers for every occasion!</p>
        <div>
        </div>
      </div>
    </div>
  );
}
