
import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, ChevronRight, ArrowLeft, ShieldPlus } from 'lucide-react';
import { User } from '../types';

interface RegisterProps {
  onRegister: (user: User) => void;
  onBack: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onBack }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('PREENCHA TODOS OS CAMPOS');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email: email.toUpperCase(),
      password
    };

    const users = JSON.parse(localStorage.getItem('faturando_pro_users') || '[]');
    if (users.find((u: User) => u.email === newUser.email)) {
      setError('E-MAIL JÁ CADASTRADO');
      return;
    }

    users.push(newUser);
    localStorage.setItem('faturando_pro_users', JSON.stringify(users));
    onRegister(newUser);
  };

  return (
    <div className="p-10 h-full flex flex-col justify-center bg-black relative animate-in fade-in slide-in-from-right duration-500">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
      
      <button onClick={onBack} className="absolute top-12 left-8 w-12 h-12 rounded-2xl glass flex items-center justify-center text-zinc-500">
        <ArrowLeft size={24} />
      </button>

      <div className="mb-12 mt-8 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500">
          <ShieldPlus size={24} />
        </div>
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Novo <span className="text-cyan-500">Piloto.</span></h1>
          <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest mt-4 italic">Crie sua ID Operacional</p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleRegister}>
        <div className="space-y-3">
          <div className="glass p-5 rounded-[24px] flex items-center gap-4 focus-within:border-cyan-500/50 transition-all group">
            <UserIcon size={20} className="text-zinc-600 group-focus-within:text-cyan-500 transition-colors" />
            <input 
              type="text" 
              placeholder="NOME COMPLETO" 
              value={name}
              onChange={(e) => {setName(e.target.value); setError('');}}
              className="bg-transparent text-white w-full focus:outline-none placeholder:text-zinc-800 font-black text-xs uppercase tracking-widest"
            />
          </div>

          <div className="glass p-5 rounded-[24px] flex items-center gap-4 focus-within:border-cyan-500/50 transition-all group">
            <Mail size={20} className="text-zinc-600 group-focus-within:text-cyan-500 transition-colors" />
            <input 
              type="email" 
              placeholder="E-MAIL" 
              value={email}
              onChange={(e) => {setEmail(e.target.value); setError('');}}
              className="bg-transparent text-white w-full focus:outline-none placeholder:text-zinc-800 font-black text-xs uppercase tracking-widest"
            />
          </div>

          <div className="glass p-5 rounded-[24px] flex items-center gap-4 focus-within:border-cyan-500/50 transition-all group">
            <Lock size={20} className="text-zinc-600 group-focus-within:text-cyan-500 transition-colors" />
            <input 
              type="password" 
              placeholder="SENHA" 
              value={password}
              onChange={(e) => {setPassword(e.target.value); setError('');}}
              className="bg-transparent text-white w-full focus:outline-none placeholder:text-zinc-800 font-black text-xs uppercase tracking-widest"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-[10px] font-black text-center animate-bounce mt-4 tracking-widest uppercase">{error}</p>}

        <button 
          type="submit"
          className="w-full bg-cyan-500 text-black font-black py-7 rounded-[32px] flex items-center justify-center gap-4 text-sm shadow-[0_20px_40px_-10px_rgba(6,182,212,0.3)] uppercase tracking-[0.4em] mt-8 active:scale-95 transition-all"
        >
          CADASTRAR <ChevronRight size={20} />
        </button>
      </form>

      <p className="mt-8 text-center text-[9px] text-zinc-800 font-black uppercase tracking-[0.4em]">
        Ao prosseguir você aceita os protocolos pro.
      </p>
    </div>
  );
};

export default Register;
