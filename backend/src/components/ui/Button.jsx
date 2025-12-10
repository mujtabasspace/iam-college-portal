// src/components/ui/Button.jsx
import React from 'react';
export default function Button({ children, onClick, disabled, type='button', variant='solid' }){
  const base = 'px-4 py-2 rounded-lg text-sm font-medium transition';
  const solid = 'bg-accent text-white shadow hover:opacity-95';
  const ghost = 'bg-transparent border border-slate-200 text-primary hover:bg-slate-50';
  const classes = `${base} ${variant==='ghost' ? ghost : solid} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
