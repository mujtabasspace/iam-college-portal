// src/components/ui/Input.jsx
import React from 'react';
export default function Input(props){
  return (
    <input
      {...props}
      className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
    />
  );
}
