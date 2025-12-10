import React, { useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function Register(){
  const [form,setForm]=useState({name:'',email:'',password:'',role:'student'});
  const [msg,setMsg]=useState(null);
  const nav = useNavigate();
  const submit = async e => {
    e.preventDefault();
    setMsg(null);
    try{
      await api.post('/auth/register', form);
      setMsg({ type:'success', text:'Registered. Please login.'});
      setTimeout(()=> nav('/login'), 1000);
    }catch(e){
      setMsg({ type:'error', text: e?.response?.data?.message || 'Failed' });
    }
  };
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">Create an account</h2>
      {msg && <div className={msg.type==='error' ? 'bg-red-50 text-red-700 p-3 rounded mb-3' : 'bg-green-50 text-green-600 p-3 rounded mb-3'}>{msg.text}</div>}
      <form onSubmit={submit} className="space-y-3">
        <input placeholder="Full name" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full border px-3 py-2 rounded"/>
        <input placeholder="Email" type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full border px-3 py-2 rounded"/>
        <input placeholder="Password" type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="w-full border px-3 py-2 rounded"/>
        <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} className="w-full border px-3 py-2 rounded">
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
        </select>
        <button className="w-full bg-accent text-white px-4 py-2 rounded">Register</button>
      </form>
    </div>
  );
}
