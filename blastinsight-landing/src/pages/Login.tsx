import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  // Kredensial default untuk memudahkan Juri
  const [email, setEmail] = useState('juri@dbest2026.com');
  const [password, setPassword] = useState('admin123');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulasi autentikasi: Langsung arahkan ke Dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-card/60 backdrop-blur-xl border border-border/80 rounded-2xl p-8 relative z-10 shadow-[0_0_40px_rgba(0,0,0,0.5)] hover:border-accent/30 transition-colors duration-500">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="BlastInsight Logo" className="h-12 mx-auto mb-6 object-contain" />
          <h1 className="text-2xl font-bold text-white mb-2">Portal Akses DSS</h1>
          <p className="text-sm text-text-secondary">Silakan masuk menggunakan kredensial yang diberikan untuk Dewan Juri DBEST 2026.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Alamat Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-muted" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/50 border border-border/80 rounded-lg text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Kata Sandi</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-muted" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/50 border border-border/80 rounded-lg text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-accent to-[#E66800] text-black font-bold py-3 rounded-lg hover:shadow-[0_0_20px_rgba(255,115,0,0.4)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
          >
            Masuk ke Dashboard <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-muted">
          Access restricted to authorized blasting engineers and DBEST 2026 Committees.
        </div>
      </div>
    </div>
  );
}