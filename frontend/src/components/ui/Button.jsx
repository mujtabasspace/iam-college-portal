// src/components/ui/Button.jsx
import React from 'react';

export default function Button({
  children,
  onClick,
  disabled = false,
  type = 'button',
  variant = 'solid',
  className = ''
}) {
  const base = 'px-3 py-2 rounded-lg text-sm font-medium transition inline-flex items-center justify-center';
  const solid = 'bg-blue-600 text-white hover:opacity-95';
  const ghost = 'bg-transparent border border-slate-200 text-slate-800 hover:bg-slate-50';
  const danger = 'bg-rose-600 text-white hover:opacity-95';

  let style = solid;
  if (variant === 'ghost') style = ghost;
  if (variant === 'danger') style = danger;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${style} ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
}
