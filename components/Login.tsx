
import React, { useState } from 'react';
import { Mail, Lock, ChevronRight, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onGoToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onGoToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('INSIRA AS CREDENCIAIS');
      return;
    }

    const users = JSON.parse(localStorage.getItem('faturando_pro_users') || '[]');
    const user = users.find((u: User) => u.email === email.toUpperCase() && u.password === password);

    if (user) {
      onLogin(user);
    } else {
      setError('ACESSO NEGADO: CREDENCIAIS INVÁLIDAS');
    }
  };

  return (
    <div className="p-10 h-full flex flex-col justify-center bg-black relative animate-in fade-in slide-in-from-left duration-500">
      <div className="absolute top-0 left-0 w-full scanner-line opacity-20"></div>
      
      <div className="mb-16 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">Acesso ao<br/><span className="text-cyan-500">Sistema.</span></h1>
          <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest mt-4">Inicialize suas credenciais pro</p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleLogin}>
        <div className="space-y-4">
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

        {error && <p className="text-red-500 text-[9px] font-black text-center mt-4 tracking-widest uppercase">{error}</p>}

        <button 
          type="submit"
          className="w-full bg-cyan-500 text-black font-black py-7 rounded-[32px] flex items-center justify-center gap-4 text-sm shadow-[0_20px_40px_-10px_rgba(6,182,212,0.3)] uppercase tracking-[0.4em] mt-12 active:scale-95 transition-all"
        >
          AUTENTICAR <ChevronRight size={20} />
        </button>
      </form>

      <div className="mt-16 text-center space-y-6">
        <button className="text-zinc-700 text-[10px] font-black uppercase tracking-widest hover:text-cyan-500 transition-colors">Recuperar acesso</button>
        <div className="flex items-center justify-center gap-2">
          <div className="h-[1px] w-8 bg-zinc-900"></div>
          <span className="text-zinc-800 text-[9px] font-black uppercase tracking-widest">Ou</span>
          <div className="h-[1px] w-8 bg-zinc-900"></div>
        </div>
        <button 
          onClick={onGoToRegister}
          className="text-white text-[10px] font-black uppercase tracking-widest hover:text-cyan-500 transition-colors"
        >
          Criar uma nova ID
        </button>
      </div>
    </div>
  );
};

export default Login;
