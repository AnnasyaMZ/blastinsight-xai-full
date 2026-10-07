import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("juri@dbest2026.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Prototype only — simulasi autentikasi
    navigate("/dashboard");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] font-sans text-[#F8FAFC]">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}
      <div className="pointer-events-none absolute inset-0">
        {/* Glow utama */}
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF7300]/10 blur-[140px]" />

        {/* Glow bawah */}
        <div className="absolute bottom-[-180px] left-1/2 h-[300px] w-[700px] -translate-x-1/2 rounded-full bg-[#FF7300]/5 blur-[130px]" />
      </div>

      {/* =====================================================
          TOP BAR
      ====================================================== */}
      <header className="relative z-10 flex h-16 items-center justify-between border-b border-[#1B1B1B] px-6 md:px-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-[13px] text-[#8A8A8A] transition hover:text-white"
        >
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>
          Kembali ke Beranda
        </button>

        <div className="flex items-center gap-2 rounded-full border border-[#272727] bg-[#111111] px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A3A3A3]">
            Research Prototype
          </span>
        </div>
      </header>

      {/* =====================================================
          CONTENT
      ====================================================== */}
      <main className="relative z-10 flex min-h-[calc(100vh-64px)] items-center justify-center px-5 py-10">
        <div className="w-full max-w-[430px]">
          {/* Card */}
          <div className="rounded-[20px] border border-[#242424] bg-[#101010]/95 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl md:p-8">
            {/* =================================================
                HEADER
            ================================================== */}
            <div className="mb-8 text-center">
              <div className="mb-6 flex justify-center">
                <img
                  src="/logo.png"
                  alt="BlastInsight-XAI"
                  className="h-11 w-auto object-contain"
                />
              </div>

              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#2B2B2B] bg-[#171717] px-3 py-1">
                <span className="material-symbols-outlined text-[14px] text-[#FF8A1F]">
                  shield
                </span>

                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#B0B0B0]">
                  Decision Support System
                </span>
              </div>

              <h1 className="text-[25px] font-bold tracking-[-0.02em] text-white">
                Portal Akses DSS
              </h1>

              <p className="mx-auto mt-2 max-w-[330px] text-[12.5px] leading-5 text-[#888888]">
                Masuk menggunakan kredensial akses untuk membuka prototype
                BlastInsight-XAI.
              </p>
            </div>

            {/* =================================================
                FORM
            ================================================== */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label className="mb-2 block text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#888888]">
                  Alamat Email
                </label>

                <div className="group relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-[#555555] transition group-focus-within:text-[#FF7300]">
                    mail
                  </span>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan alamat email"
                    required
                    className="
                      h-[48px]
                      w-full
                      rounded-xl
                      border
                      border-[#272727]
                      bg-[#050505]
                      pl-11
                      pr-4
                      text-[13px]
                      text-[#F8FAFC]
                      outline-none
                      transition-all
                      placeholder:text-[#444444]
                      hover:border-[#333333]
                      focus:border-[#FF7300]
                      focus:ring-2
                      focus:ring-[#FF7300]/10
                    "
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#888888]">
                  Kata Sandi
                </label>

                <div className="group relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-[#555555] transition group-focus-within:text-[#FF7300]">
                    lock
                  </span>

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    required
                    className="
                      h-[48px]
                      w-full
                      rounded-xl
                      border
                      border-[#272727]
                      bg-[#050505]
                      pl-11
                      pr-12
                      text-[13px]
                      text-[#F8FAFC]
                      outline-none
                      transition-all
                      placeholder:text-[#444444]
                      hover:border-[#333333]
                      focus:border-[#FF7300]
                      focus:ring-2
                      focus:ring-[#FF7300]/10
                    "
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#555555] transition hover:text-[#FF7300]"
                    aria-label={
                      showPassword
                        ? "Sembunyikan kata sandi"
                        : "Tampilkan kata sandi"
                    }
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="
                  mt-1
                  flex
                  h-[52px]
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#FF7300]
                  text-[14px]
                  font-bold
                  text-black
                  transition-all
                  duration-200
                  hover:bg-[#FF861F]
                  hover:shadow-[0_8px_28px_rgba(255,115,0,0.22)]
                  active:scale-[0.99]
                "
              >
                Masuk ke Dashboard

                <span className="material-symbols-outlined text-[20px]">
                  arrow_forward
                </span>
              </button>
            </form>

            {/* =================================================
                ACCESS INFO
            ================================================== */}
            <div className="mt-6 border-t border-[#1E1E1E] pt-5">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined mt-[1px] text-[16px] text-[#666666]">
                  info
                </span>

                <p className="text-[10.5px] leading-[17px] text-[#666666]">
                  Akses terbatas untuk kebutuhan demonstrasi dan evaluasi
                  prototype BlastInsight-XAI pada DBEST 2026.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-5 text-center">
            <p className="text-[10px] uppercase tracking-[0.12em] text-[#3F3F3F]">
              BlastInsight-XAI · Research Prototype
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}