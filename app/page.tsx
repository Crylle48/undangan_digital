"use client";

import { supabase } from '../lib/supabase';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Clock,
  Heart,
  Music,
  Pause,
  Send,
  Copy,
  Gift,
  MessageSquare,
  ChevronDown,
  User,
  Mail,
  Home,
  Check
} from "lucide-react";

// --- KOMPONEN ANIMASI ---
interface FadeUpProps {
  children: React.ReactNode;
  delay?: number;
}

const FadeUp = ({ children, delay = 0 }: FadeUpProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -50px 0px" }}
      transition={{ 
        duration: 0.8, 
        delay: delay, 
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      {children}
    </motion.div>
  );
};

// --- KOMPONEN COUNTDOWN ---
interface CountdownProps {
  targetDate: string;
}

const Countdown = ({ targetDate }: CountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;
      
      if (distance < 0) {
        clearInterval(timer);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  interface ItemProps {
    val: number | string; // Bisa angka, bisa string kalau lu kasih padding nol
    label: string;
  }

  const Item = ({ val, label }: ItemProps) => (
    <div className="flex flex-col items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-2 md:p-3 min-w-[65px] md:min-w-[75px]">
      <span className="text-xl md:text-2xl font-bold text-white">{val}</span>
      <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-white/80">{label}</span>
    </div>
  );

  return (
    <div className="flex gap-2 md:gap-3 justify-center mt-6 md:mt-8 px-2">
      <Item val={timeLeft.days} label="Hari" />
      <Item val={timeLeft.hours} label="Jam" />
      <Item val={timeLeft.minutes} label="Menit" />
      <Item val={timeLeft.seconds} label="Detik" />
    </div>
  );
};

export default function App() {
  const [isOpened, setIsOpened] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [guestName, setGuestName] = useState("Tamu Kehormatan");
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    attendance: '',
    message: ''
  });

  interface GuestMessage {
    name: string;
    message: string;
    created_at: string;
  }

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('rsvp')
      .select('name, message, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setMessages(data);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showMusicToast, setShowMusicToast] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 20;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleRSVP = async (e: React.FormEvent) => {
    if (e) e.preventDefault(); 
    
    if (!formData.name || !formData.attendance) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000); 
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('rsvp')
        .insert([
          { 
            name: formData.name, 
            attendance: formData.attendance, 
            message: formData.message 
          }
        ]);

      if (error) throw error;

      setShowModal(true); 
      setFormData({ name: guestName, attendance: '', message: '' }); 
      fetchMessages();
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error:", error.message);
      } else {
        console.error("Error:", error);
      }
      alert("Gagal terkirim, coba cek koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  interface Petal {
    id: number;
    left: string;
    duration: number;
    delay: number;
    size: number;
  }

  const [petals, setPetals] = useState<Petal[]>([]);
  useEffect(() => {
    const newPetals = [...Array(12)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 5,
      size: Math.random() * 10 + 15
    }));
    setPetals(newPetals);
  }, []);
   
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const name = params.get('to');
      if (name) {
        const decodedName = decodeURIComponent(name);
        setGuestName(decodedName);
        setFormData(prev => ({ ...prev, name: decodedName }));
      }
    }
  }, []);

  useEffect(() => {
    if (!isOpened) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      window.scrollTo(0, 0);
      
    const audio = audioRef.current;
      if (audio) {
        audio.volume = 0;
        
        audio.play().then(() => {
          setIsPlaying(true);
          
          let vol = 0;
          const fadeIn = setInterval(() => {
            if (vol < 0.6) {
              vol += 0.05;
              audio.volume = Number(vol.toFixed(2));
            } else {
              clearInterval(fadeIn);
            }
          }, 200);

        }).catch(() => console.log("Autoplay blocked"));
      }
    }
  }, [isOpened]);

  const musicUrl = `https://yyfjsoryfmhlzxoktqdo.supabase.co/storage/v1/object/public/asset/Music/Sal%20Priadi%20&%20Nadin%20Amizah%20-%20Amin%20Paling%20Serius.mp3`;

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Gagal play:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const copyToClipboard = (text: string) => {
    // Cek apakah API navigator.clipboard tersedia
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          handleSuccess();
        })
        .catch(() => {
          copyFallback(text);
        });
    } else {
      // Fallback buat browser jadul atau non-HTTPS
      copyFallback(text);
    }
  };

  const handleSuccess = () => {
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  };

  const copyFallback = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      handleSuccess();
    } catch (err) {
      console.error("Gagal salin rek: ", err);
    }
    document.body.removeChild(textArea);
  };

  const popupmusic = (text: string) => {
    setIsPlaying(true);
    setShowMusicToast(true);
    setTimeout(() => {
      setShowMusicToast(false);
    }, 12000);
  };

  return (
    <div className="min-h-screen text-[#4A4A4A] font-sans selection:bg-[#8CA38D] selection:text-white overflow-x-hidden relative">
      <audio ref={audioRef} loop src={musicUrl} preload="auto" />

      {/* --- SECTION 1: COVER --- */}
      <AnimatePresence>
        {!isOpened && (
          <motion.div
            key="cover"
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1] }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-between py-12 md:py-20 px-6 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url("https://yyfjsoryfmhlzxoktqdo.supabase.co/storage/v1/object/public/asset/Background/Background1.png")',
            }}
          >
            <div className="absolute inset-0 backdrop-blur-[2px] -z-10" />

            {/* Upper Content - Reduced Spacing */}
            <div className="text-center space-y-4 md:space-y-6 text-white mt-4">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="uppercase tracking-[0.3em] md:tracking-[0.6em] text-[9px] md:text-[10px] font-medium opacity-80"
              >
                The Wedding Of
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
                className="font-serif flex flex-col items-center justify-center gap-1 md:gap-6 uppercase"
              >
                {/* Mobile: Smaller font, tighter tracking */}
                <span className="text-2xl md:text-4xl font-light tracking-[0.15em] md:tracking-[0.2em] drop-shadow-md">
                  Rizki
                </span>
                <span className="text-xl md:text-4xl font-serif italic lowercase opacity-60 my-0 md:my-0">
                  &
                </span>
                <span className="text-2xl md:text-4xl font-light tracking-[0.15em] md:tracking-[0.2em] drop-shadow-md">
                  Listiya
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-xs md:text-base font-light tracking-[0.4em] md:tracking-[0.6em] opacity-90"
              >
                07 . 06 . 2026
              </motion.p>
            </div>

            {/* Bottom Content - Compact Guest Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="text-center text-white flex flex-col items-center w-full max-w-[280px] md:max-w-xs mb-4"
            >
              <p className="text-[10px] md:text-xs mb-1 opacity-70 tracking-widest uppercase">
                Kepada Yth.
              </p>
              <h2 className="text-lg md:text-2xl font-medium mt-1 mb-4 w-full truncate px-2 tracking-wide border-b border-white/20 pb-2">
                {guestName}
              </h2>

              <button
                onClick={() => {
                  setIsOpened(true);
                  popupmusic(
                    "Playing : Sal Priadi & Nadin Amizah - Amin Paling Serius",
                  );
                }}
                className="w-full md:w-auto px-8 py-3.5 md:px-10 md:py-4 bg-white text-[#5C6B57] rounded-lg md:rounded-xl font-bold shadow-xl hover:bg-[#8CA38D] hover:text-white transition-all duration-500 flex items-center justify-center gap-3 active:scale-95 group text-sm md:text-base"
              >
                <Mail
                  size={16}
                  className="group-hover:scale-110 transition-transform"
                />
                Buka Undangan
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage:
            'linear-gradient(rgba(250, 247, 242, 0.92), rgba(250, 247, 242, 0.88)), url("https://yyfjsoryfmhlzxoktqdo.supabase.co/storage/v1/object/public/asset/Background/BackgroundUtama.jfif")',
        }}
      />

      {/* --- MAIN CONTENT CONTAINER --- */}
      {isOpened && (
        <main className="relative z-10">
          <div className="absolute inset-0 pointer-events-none">
            {petals.map((p) => (
              <motion.div
                key={p.id}
                initial={{ y: -100, x: 0, rotate: 0, opacity: 0 }}
                animate={{
                  y: "110vh",
                  x: [0, 40, -40, 0],
                  rotate: 360,
                  opacity: [0, 0.8, 0.8, 0],
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  ease: "linear",
                  delay: p.delay,
                  times: [0, 0.1, 0.9, 1],
                }}
                className="absolute z-10 pointer-events-none"
                style={{ left: p.left }}
              >
                {/* BENTUK KELOPAK BUNGA */}
                <div
                  style={{
                    width: p.size,
                    height: p.size + 4,
                    backgroundColor: "#8CA38D",
                    borderRadius: "80% 10% 80% 10%",
                    display: "block",
                    boxShadow: "0 0 10px rgba(252, 228, 236, 0.5)",
                    transform: `rotate(${p.id * 45}deg)`,
                  }}
                  className="opacity-60 blur-[0.3px]"
                />
              </motion.div>
            ))}
          </div>

          {/* --- SECTION 2: WELCOME & COUNTDOWN --- */}
          <section
            id="main"
            className="min-h-screen flex items-center justify-center px-6 py-12 md:py-20 relative overflow-hidden"
          >
            <div className="relative mt-[-70px] md:mt-[-80px] text-center w-full">
              <FadeUp>
                {/* Name Heading: Smaller on mobile, no huge gaps */}
                <h2 className="font-serif flex flex-col md:flex-row items-center justify-center gap-1 md:gap-6 uppercase">
                  <span className="text-3xl md:text-5xl font-bold tracking-[0.15em] md:tracking-[0.2em] drop-shadow-md">
                    Rizki
                  </span>
                  <span className="text-xl md:text-3xl font-serif italic lowercase opacity-60 my-1 md:my-0">
                    &
                  </span>
                  <span className="text-3xl md:text-5xl font-bold tracking-[0.15em] md:tracking-[0.2em] drop-shadow-md">
                    Listiya
                  </span>
                </h2>

                <p className="text-[#8CA38D] font-bold tracking-[0.2em] md:tracking-[0.4em] text-xs md:text-base mt-3 mb-2">
                  MINGGU, 07 JUNI 2026
                </p>

                {/* Line Decor: Adjusted width for mobile */}
                <div className="w-24 md:w-50 h-[1.5px] bg-[#8CA38D]/30 mx-auto mb-8 md:mb-12"></div>

                {/* Quote: Reduced margin bottom drastically */}
                <p className="text-gray-600 leading-relaxed text-sm md:text-lg max-w-sm md:max-w-md mx-auto mb-12 md:mb-20 px-4 font-normal tracking-wide">
                  Menyatukan dua langkah dalam satu tujuan, menjalin doa dalam
                  ikatan yang kekal.
                </p>

                {/* Countdown Box: Adjusted border radius and padding */}
                <div className="bg-[#828E75]/65 backdrop-blur-md py-6 px-4 md:py-8 md:px-6 rounded-[30px] md:rounded-[50px] shadow-2xl mx-auto max-w-[320px] md:max-w-lg border border-white/10">
                  <p className="text-white uppercase tracking-[0.2em] md:tracking-[0.3em] text-[9px] md:text-[10px] mb-4 md:mb-6 font-bold opacity-70">
                    Counting Down
                  </p>
                  <Countdown targetDate="2026-06-07T08:00:00" />
                </div>
              </FadeUp>
            </div>
          </section>

          {/* --- SECTION 3: QUOTE --- */}
          <section
            id="quote"
            className="py-12 md:py-32 text-center px-4 md:px-6 relative overflow-hidden"
          >
            <div className="max-w-xl md:max-w-3xl mx-4 md:mx-auto relative group">
              
              {/* Background Card - Animasi muncul paling awal */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 rounded-[40px] md:rounded-[60px] shadow-sm border border-white/60 overflow-hidden z-10"
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url('https://yyfjsoryfmhlzxoktqdo.supabase.co/storage/v1/object/public/asset/Background/Kertas.jpeg')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              </motion.div>

              {/* Bunga - Muncul dari samping dengan delay agak telat */}
              <motion.div 
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                whileInView={{ opacity: 0.9, x: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
                className="absolute right-[-40px] bottom-[-0px] md:-right-16 md:-bottom-0 z-20 w-48 h-48 md:w-96 md:h-96 pointer-events-none"
              >
                <img
                  src="https://yyfjsoryfmhlzxoktqdo.supabase.co/storage/v1/object/public/asset/Bunga/Bunga%20Petikan%20Surah.png"
                  alt="Bunga Sudut"
                  className="w-full h-full object-contain object-right-bottom"
                />
              </motion.div>

              {/* Konten Teks - Staggered Effect */}
              <div className="relative z-30 p-8 md:p-20 flex flex-col items-center">
                
                {/* Isi Ayat */}
                <motion.p 
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="text-sm md:text-2xl leading-relaxed md:leading-loose text-black/80 font-normal mb-6 tracking-wide italic"
                >
                  "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir"
                </motion.p>

                {/* Garis Pembatas */}
                <motion.div 
                  initial={{ opacity: 0, width: 0 }}
                  whileInView={{ opacity: 0.4, width: "3rem" }} // w-12 = 3rem
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="h-[1px] bg-[#5C6B57] mx-auto mb-4"
                ></motion.div>

                {/* Sumber Ayat */}
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 0.9, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="font-bold text-black/90 tracking-[0.2em] text-[10px] md:text-xs uppercase"
                >
                  - QS. Ar-Rum 21 -
                </motion.p>
              </div>
            </div>
          </section>

          {/* --- SECTION 4: PROFIL --- */}
          <section
            id="profile"
            className="py-16 md:py-20 bg-transparent overflow-x-hidden"
          >
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-2xl md:text-5xl font-light text-[#5C6B57] mb-3 tracking-[0.3em] md:tracking-[0.4em] uppercase font-sans">
                Meet The Couple
              </h2>
              <div className="w-10 h-[2px] bg-[#8CA38D] mx-auto opacity-40"></div>
            </div>

            <div className="max-w-5xl mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-start">
                
                {/* Mempelai Pria */}
                <motion.div
                  initial={{ opacity: 0, x: -50, scale: 0.9 }}
                  whileInView={isOpened ? { opacity: 1, x: 0, scale: 1 } : {}}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center text-center group"
                >
                  <div className="relative mb-6 md:mb-10 cursor-pointer">
                    <div className="absolute -inset-4 md:-inset-6 border-[1.5px] border-dashed border-[#8CA38D]/30 rounded-full rotate-[25deg]"></div>
                    <div className="w-48 h-64 md:w-72 md:h-96 overflow-hidden rounded-[80px] md:rounded-[100px] shadow-lg relative z-10 border-4 md:border-8 border-white transition-all duration-700 group-hover:-translate-y-2">
                      <img
                        src="https://yyfjsoryfmhlzxoktqdo.supabase.co/storage/v1/object/public/asset/Mempelai/Foto%20Perkenalan%20Pria.png"
                        className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
                        alt="Rizki"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <motion.h3 
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={isOpened ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                      className="text-3xl md:text-5xl font-medium text-[#5C6B57] tracking-normal capitalize font-serif"
                    >
                      Muhamad Rizki
                    </motion.h3>
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={isOpened ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                      className="text-gray-500 text-[9px] md:text-sm font-serif italic tracking-[0.1em] md:tracking-widest uppercase opacity-80 max-w-[250px] leading-relaxed text-center"
                    >
                      Putra Bungsu Bapak Soleh & Ibu Musriah
                    </motion.p>
                  </div>
                </motion.div>

                {/* Mempelai Wanita */}
                <motion.div
                  initial={{ opacity: 0, x: 50, scale: 0.9 }}
                  whileInView={isOpened ? { opacity: 1, x: 0, scale: 1 } : {}}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center text-center group"
                >
                  <div className="relative mb-6 md:mb-10 cursor-pointer">
                    <div className="absolute -inset-4 md:-inset-6 border-[1.5px] border-dashed border-[#8CA38D]/30 rounded-full rotate-[25deg]"></div>
                    <div className="w-48 h-64 md:w-72 md:h-96 overflow-hidden rounded-[80px] md:rounded-[100px] shadow-lg relative z-10 border-4 md:border-8 border-white transition-all duration-700 group-hover:-translate-y-2">
                      <img
                        src="https://yyfjsoryfmhlzxoktqdo.supabase.co/storage/v1/object/public/asset/Mempelai/Foto%20Kecil%20Wanita.png"
                        className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
                        alt="Listiya"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 flex flex-col items-center justify-center">
                    <motion.h3 
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={isOpened ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
                      className="text-3xl md:text-5xl font-medium text-[#5C6B57] tracking-normal capitalize font-serif"
                    >
                      Listiyanti Apridar
                    </motion.h3>
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={isOpened ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
                      className="text-gray-500 text-[10px] md:text-sm font-serif italic tracking-[0.1em] md:tracking-widest uppercase opacity-80 max-w-[250px] leading-relaxed text-center"
                    >
                      Putri Bungsu Bapak Sopian (Alm) & Ibu Saripah
                    </motion.p>
                  </div>
                </motion.div>
                
              </div>
            </div>
          </section>

          {/* --- SECTION 5: EVENT --- */}
          <section
            id="event"
            className="py-16 md:py-24 px-4 md:px-6 bg-transparent overflow-x-hidden" // Pake bg-transparent biar nyambung
          >
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10 md:mb-16">
                <motion.h2 
                  initial={{ opacity: 0, letterSpacing: "0.1em" }}
                  whileInView={isOpened ? { opacity: 1, letterSpacing: "0.3em" } : {}}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="text-2xl md:text-5xl font-light text-[#5C6B57] mb-3 uppercase font-sans"
                >
                  The Celebration
                </motion.h2>
                <div className="w-10 h-[2px] bg-[#8CA38D] mx-auto opacity-40"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mb-12">
                {[
                  {
                    title: "Akad Nikah",
                    time: "11.00 - 12.00",
                    desc: "Momen suci pengikatan janji",
                    location: "Masjid Al Hidayah",
                  },
                  {
                    title: "Resepsi",
                    time: "12.00 - Selesai",
                    desc: "Perayaan sukacita bersama",
                    location: "Rumah Mempelai Wanita",
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={isOpened ? { opacity: 1, y: 0 } : {}}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 1, 
                      delay: idx * 0.3, // Stagger effect
                      ease: [0.22, 1, 0.36, 1] 
                    }}
                    className="bg-white/40 backdrop-blur-md p-8 md:p-14 rounded-[40px] md:rounded-[60px] text-center shadow-sm border border-white/50 hover:bg-[#5C6B57] hover:text-white transition-all duration-700 group cursor-default"
                  >
                    <h3 className="text-xl md:text-3xl font-medium mb-4 md:mb-6 tracking-widest uppercase font-serif">
                      {item.title}
                    </h3>
                    <div className="space-y-3 md:space-y-4 text-xs md:text-base opacity-90 group-hover:opacity-100">
                      <p className="flex items-center justify-center gap-2 font-medium tracking-wide">
                        <Calendar size={16} className="md:w-[18px]" /> Minggu, 7 Juni 2026
                      </p>
                      <p className="flex items-center justify-center gap-2 font-medium tracking-wide">
                        <Clock size={16} className="md:w-[18px]" /> {item.time}
                      </p>
                      <div className="h-[1px] w-6 bg-current mx-auto my-4 md:my-6 opacity-30"></div>
                      <p className="font-light tracking-[0.15em] uppercase text-[10px] md:text-sm italic opacity-70 group-hover:opacity-100">
                        {item.desc}
                      </p>
                      <p className="font-semibold text-[11px] md:text-base mt-2">
                        {item.location}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={isOpened ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.8, duration: 1 }}
                className="text-center"
              >
                <a
                  href="https://maps.app.goo.gl/DjtT9p9MdbSh4VUA9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <button className="px-10 py-4 bg-[#5C6B57] text-white hover:bg-[#4A5546] transition-all rounded-full font-medium shadow-lg flex items-center justify-center gap-3 active:scale-95 uppercase tracking-[0.2em] text-[10px]">
                    <MapPin size={16} className="animate-bounce" />
                    <span>Buka Google Maps</span>
                  </button>
                </a>
              </motion.div>
            </div>
          </section>

          {/* --- SECTION 6: WEDDING GIFT --- */}
          <section id="gift" className="py-16 md:py-24 px-6 bg-transparent overflow-x-hidden">
            <div className="max-w-xl mx-auto text-center">
              
              {/* Header Section */}
              <div className="mb-12 md:mb-16">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={isOpened ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 1 }}
                >
                  <Gift className="mx-auto text-[#8CA38D] mb-4 opacity-60" size={28} />
                </motion.div>
                
                <motion.h2 
                  initial={{ opacity: 0, letterSpacing: "0.1em" }}
                  whileInView={isOpened ? { opacity: 1, letterSpacing: "0.3em" } : {}}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="text-2xl md:text-5xl font-light text-[#5C6B57] mb-3 uppercase font-sans"
                >
                  Wedding Gift
                </motion.h2>
                <div className="w-10 h-[2px] bg-[#8CA38D] mx-auto opacity-30"></div>
                
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={isOpened ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="mt-8 text-gray-500 text-[10px] md:text-xs tracking-[0.15em] uppercase font-serif italic opacity-80 px-4 leading-relaxed"
                >
                  Doa restu Anda merupakan karunia yang sangat berarti bagi kami. 
                  Namun jika memberi adalah ungkapan kasih Anda, kami menyediakan layanan kado digital.
                </motion.p>
              </div>

              {/* Card Rekening */}
              <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={isOpened ? { opacity: 1, y: 0, scale: 1 } : {}}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white/40 backdrop-blur-md p-8 md:p-12 rounded-[40px] md:rounded-[60px] shadow-sm border border-white/60 relative overflow-hidden group hover:shadow-xl transition-all duration-700"
              >
                {/* LOGO SEABANK - Solid (Gak Transparan) */}
                <div className="absolute top-1 right-0 md:top-8 md:right-8 select-none pointer-events-none">
                  <img
                    src="https://yyfjsoryfmhlzxoktqdo.supabase.co/storage/v1/object/public/asset/LogoSeaBank.png"
                    alt="SeaBank Logo"
                    className="w-18 h-18 md:w-24 md:h-24 object-contain" 
                  />
                </div>

                <div className="relative z-10">
                  {/* TEXT HEADER - Pojok Kiri */}
                  <div className="flex items-center justify-start gap-2 mb-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8CA38D]"></div>
                    <p className="text-[#5C6B57] font-black tracking-[0.2em] text-[10px] uppercase font-sans">
                      SeaBank Indonesia
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-1">
                    <h4 className="text-2xl md:text-4xl font-medium text-[#5C6B57] tracking-wider mb-2 font-serif">
                      9018 3789 0416
                    </h4>
                    <p className="text-gray-500 text-[10px] md:text-sm font-light uppercase tracking-[0.3em] mb-8 font-sans">
                      a.n Listiyanti Apridar
                    </p>
                  </div>

                  {/* BUTTON SALIN */}
                  <button
                    onClick={() => copyToClipboard("901837890416")}
                    className="w-full md:w-auto flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] bg-[#5C6B57] text-white px-8 py-4 rounded-full hover:bg-[#4A5546] transition-all active:scale-95 shadow-lg shadow-[#5C6B57]/20"
                  >
                    <Copy size={14} /> 
                    <span>Salin Rekening</span>
                  </button>
                </div>
              </motion.div>
              
            </div>
          </section>

          {/* --- SECTION 7: RSVP --- */}
          <section
            id="rsvp"
            className="py-16 md:py-32 px-4 md:px-6 bg-transparent overflow-x-hidden"
          >
            <div className="max-w-xl mx-auto">
              <div className="text-center mb-10 md:mb-14">
                {/* Icon dengan Animasi Floating */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-block p-3 rounded-full bg-[#8CA38D]/10 text-[#8CA38D] mb-4"
                >
                  <Send size={22} />
                </motion.div>

                <motion.h2 
                  initial={{ opacity: 0, letterSpacing: "0.1em" }}
                  whileInView={isOpened ? { opacity: 1, letterSpacing: "0.3em" } : {}}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="text-2xl md:text-5xl font-light text-[#5C6B57] mb-3 uppercase font-sans"
                >
                  Be Our Guest
                </motion.h2>

                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="h-[1px] w-8 bg-[#8CA38D]/30"></div>
                  <Heart size={12} className="text-[#8CA38D]" />
                  <div className="h-[1px] w-8 bg-[#8CA38D]/30"></div>
                </div>

                <motion.p 
                  initial={{ opacity: 0 }}
                  whileInView={isOpened ? { opacity: 0.7 } : {}}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="text-gray-500 text-[10px] md:text-xs tracking-[0.2em] uppercase font-serif italic leading-relaxed px-4"
                >
                  Ukiran kenangan indah akan tercipta dengan kehadiran Anda.
                </motion.p>
              </div>

              {/* FORM START - Glassmorphism style */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={isOpened ? { opacity: 1, y: 0 } : {}}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <form
                  onSubmit={handleRSVP}
                  className="bg-white/40 backdrop-blur-md p-8 md:p-14 rounded-[40px] md:rounded-[60px] space-y-8 shadow-sm border border-white/60 relative overflow-hidden"
                >
                  {/* Decorative Blur */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#8CA38D]/10 rounded-full blur-3xl"></div>

                  {/* INPUT NAMA */}
                  <div className="relative group">
                    <input
                      type="text"
                      required
                      placeholder=" "
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="peer w-full bg-transparent border-b border-[#5C6B57]/20 py-3 outline-none transition-all focus:border-[#8CA38D] text-[#5C6B57] text-sm md:text-base font-medium placeholder-transparent"
                    />
                    <label className="absolute left-0 -top-4 text-[9px] uppercase font-bold tracking-[0.2em] text-[#8CA38D] transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-4 peer-focus:text-[#8CA38D] peer-focus:text-[9px] pointer-events-none">
                      Nama Lengkap
                    </label>
                  </div>

                  {/* SELECT KEHADIRAN */}
                  <div className="relative space-y-2">
                    <label className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#8CA38D] block ml-1">
                      Konfirmasi Kehadiran
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={formData.attendance}
                        onChange={(e) => setFormData({ ...formData, attendance: e.target.value })}
                        className="w-full bg-white/50 border border-white/20 rounded-2xl px-5 py-4 outline-none appearance-none text-[#5C6B57] text-sm font-medium cursor-pointer focus:ring-2 focus:ring-[#8CA38D]/10 transition-all"
                      >
                        <option value="" disabled>Pilih Status Kehadiran</option>
                        <option value="Hadir">Saya Akan Hadir</option>
                        <option value="Ragu">Masih Ragu</option>
                        <option value="Tidak Hadir">Berhalangan Hadir</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8CA38D]" />
                    </div>
                  </div>

                  {/* TEXTAREA PESAN */}
                  <div className="relative group">
                    <textarea
                      placeholder=" "
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="peer w-full bg-white/50 border border-white/20 rounded-2xl px-5 py-4 outline-none transition-all focus:ring-2 focus:ring-[#8CA38D]/10 text-[#5C6B57] text-sm font-medium placeholder-transparent resize-none"
                    ></textarea>
                    <label className="absolute left-5 top-4 text-gray-400 text-sm transition-all peer-placeholder-shown:text-sm peer-focus:-top-7 peer-focus:left-1 peer-focus:text-[#8CA38D] peer-focus:text-[9px] peer-focus:uppercase peer-focus:font-bold peer-focus:tracking-[0.2em] pointer-events-none">
                      Pesan Singkat & Doa
                    </label>
                  </div>

                  {/* BUTTON SUBMIT */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full relative overflow-hidden rounded-full bg-[#5C6B57] py-5 font-bold uppercase tracking-[0.3em] text-white shadow-lg shadow-[#5C6B57]/20 transition-all hover:bg-[#4A5546] active:scale-[0.98] disabled:opacity-50"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3 text-[10px] md:text-[11px]">
                      {isSubmitting ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                      ) : (
                        <>
                          <Heart size={14} fill="currentColor" className="animate-pulse" />
                          Kirim Konfirmasi
                        </>
                      )}
                    </span>
                  </button>
                </form>
              </motion.div>
            </div>
          </section>

          {/* --- SECTION 8: GUESTBOOK --- */}
          <section
            id="guestbook"
            className="py-16 md:py-24 px-4 md:px-6 bg-white/40 backdrop-blur-md overflow-x-hidden"
          >
            <div className="max-w-xl mx-auto">
              <FadeUp>
                <div className="text-center mb-10">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <MessageSquare
                      className="mx-auto text-[#8CA38D] mb-4 opacity-70"
                      size={32}
                    />
                  </motion.div>
                  
                  <h2 className="text-2xl md:text-4xl font-light text-[#5C6B57] uppercase tracking-[0.2em] font-sans">
                    Ucapan & Doa Restu
                  </h2>
                  <div className="w-8 h-[1px] bg-[#8CA38D] mx-auto mt-4 opacity-40"></div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-4 px-4 font-serif italic">
                    Terima kasih atas doa tulus Anda
                  </p>
                </div>

                {/* CONTAINER LIST PESAN */}
                <div className="space-y-4 max-h-[400px] md:max-h-[550px] overflow-y-auto pr-2 custom-scrollbar scroll-smooth">
                  {messages.length > 0 ? (
                    messages.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.6,
                          delay: idx * 0.1,
                        }}
                        className="bg-white/60 backdrop-blur-sm p-5 md:p-6 rounded-[24px] shadow-sm border border-white/80 group hover:bg-white/80 transition-colors duration-300"
                      >
                        <div className="flex items-start gap-4 mb-3">
                          <div className="shrink-0 w-8 h-8 rounded-full bg-[#8CA38D]/20 flex items-center justify-center text-[#5C6B57]">
                            <User size={16} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-[#5C6B57] text-[11px] md:text-xs uppercase tracking-[0.1em] mb-1">
                              {item.name}
                            </h4>
                            <div className="relative">
                              <p className="text-gray-600 text-[13px] md:text-sm leading-relaxed pr-2">
                                "{item.message}"
                              </p>
                            </div>
                            <p className="text-[8px] text-gray-400 mt-3 text-right uppercase tracking-[0.15em] font-sans">
                              {new Date(item.created_at).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-16 text-center bg-white/20 rounded-[30px] border border-dashed border-white/50">
                      <p className="text-gray-400 text-[11px] uppercase tracking-[0.2em] italic">
                        Belum ada ucapan...
                      </p>
                    </div>
                  )}
                </div>
              </FadeUp>
            </div>
          </section>

          {/* --- FOOTER --- */}
          <footer className="py-12 bg-[#5C6B57] text-white text-center px-6 relative z-10">
            <FadeUp>
              {/* Jarak antar elemen gw persingkat semua */}
              <div className="mb-6">
                <p className="mb-4 opacity-50 tracking-[0.4em] uppercase text-[9px] font-bold">
                  See you there
                </p>

                <h2 className="text-xl md:text-3xl font-medium mb-8 flex items-center justify-center gap-3 uppercase tracking-[0.15em]">
                  <span>Rizki</span>
                  <span className="text-base md:text-xl font-light opacity-30 lowercase italic tracking-normal">
                    &
                  </span>
                  <span>Listiya</span>
                </h2>
              </div>

              {/* Divider dikecilin biar box-nya gak kerasa penuh */}
              <div className="flex justify-center items-center gap-4 mb-8 opacity-20">
                <div className="h-[1px] w-10 bg-white"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="h-[1px] w-10 bg-white"></div>
              </div>

              <p className="text-[8px] tracking-[0.4em] uppercase opacity-30 font-bold">
                Rizki Digital Invitation © 2026
              </p>

              <div className="h-10 w-full"></div>
            </FadeUp>
          </footer>

          <AnimatePresence>
            {isOpened && (
              <motion.div
                initial={{ y: 100, x: "-50%", opacity: 0 }}
                animate={{ y: 0, x: "-50%", opacity: 1 }}
                style={{ left: "50%" }} // Pakai inline style biar gak didepak Tailwind
                className="fixed bottom-6 z-[50] flex items-center justify-between bg-white/80 backdrop-blur-2xl border border-white/40 px-2 py-2 rounded-[30px] shadow-2xl w-[92%] max-w-[480px]"
              >
                {/* TOMBOL MUSIK */}
                <button
                  onClick={toggleMusic}
                  className={`flex flex-col items-center justify-center min-w-[45px] h-10 rounded-2xl transition-all active:scale-90 ${isPlaying ? "text-[#8CA38D]" : "text-gray-400"}`}
                >
                  <div className={isPlaying ? "animate-spin-slow" : ""}>
                    {isPlaying ? <Music size={16} /> : <Pause size={16} />}
                  </div>
                  <span className="text-[7px] uppercase font-black mt-1">
                    {isPlaying ? "On" : "Off"}
                  </span>
                </button>

                <div className="w-[1px] h-6 bg-gray-200 mx-1" />

                {/* 6 MENU NAVIGASI */}
                {[
                  { icon: <Home size={16} />, target: "main" },
                  { icon: <MessageSquare size={16} />, target: "quote" },
                  { icon: <User size={16} />, target: "profile" },
                  { icon: <Calendar size={16} />, target: "event" },
                  { icon: <Gift size={16} />, target: "gift" },
                  { icon: <Send size={16} />, target: "rsvp" },
                ].map((menu, idx) => (
                  <button
                    key={idx}
                    onClick={() => scrollToSection(menu.target)}
                    className="flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-xl text-[#5C6B57] hover:bg-[#8CA38D]/10 transition-all active:scale-90"
                  >
                    <div className="group-hover:scale-110 transition-transform">
                      {menu.icon}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showModal && (
              <div className="fixed inset-0 z-[999] flex items-center justify-center px-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowModal(false)}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="relative bg-white rounded-[40px] p-10 shadow-2xl max-w-sm w-full text-center border border-[#8CA38D]/20"
                >
                  <div className="w-20 h-20 bg-[#F2F5F2] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart
                      className="text-[#8CA38D]"
                      fill="#8CA38D"
                      size={32}
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-[#5C6B57] mb-2 uppercase tracking-tighter text-center">
                    Terima Kasih!
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-8 font-medium">
                    Pesan dan konfirmasi kehadiran sudah terkirim. Sampai
                    bertemu di hari bahagia nanti!
                  </p>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full py-4 bg-[#8CA38D] text-white rounded-2xl font-bold hover:bg-[#7A8F7B] transition-all active:scale-95 shadow-lg shadow-[#8CA38D]/30 uppercase tracking-widest text-[10px]"
                  >
                    Tutup
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showCopyToast && (
              <motion.div
                initial={{ opacity: 0, y: 30, x: "-50%", scale: 0.9 }}
                animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                exit={{ opacity: 0, y: 20, x: "-50%", scale: 0.9 }}
                // Glassmorphism effect biar makin mewah
                className="fixed bottom-22 left-1/2 z-[100] bg-[#5C6B57]/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-[0_20px_50px_rgba(92,107,87,0.3)] flex items-center gap-3 border border-white/10"
              >
                <div className="bg-white/20 p-1.5 rounded-full">
                  <Check size={12} className="text-white" />
                </div>
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                  Nomor Rekening Disalin
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showMusicToast && (
              <motion.div
                key="music-popup"
                initial={{ opacity: 0, scale: 0.8, y: 20, x: "-50%" }}
                animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, scale: 0.8, y: -20, x: "-50%" }}
                className="fixed bottom-22 left-1/2 z-[100] bg-[#5C6B57] text-white px-3 py-0 rounded-xl shadow-2xl flex items-center gap-3 border border-white/20 ring-1 ring-black/10 overflow-hidden w-[280px]"
              >
                <div className="flex items-center justify-center p-0">
                  <Music
                    size={14}
                    className="animate-spin-slow flex-shrink-0"
                  />
                </div>

                <div className="flex-1 overflow-hidden relative h-10 flex items-center px-0">
                  <motion.div
                    animate={{ x: [240, -400] }}
                    transition={{
                      duration: 12,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="whitespace-nowrap"
                  >
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em]">
                      Playing : Sal Priadi & Nadin Amizah - Amin Paling Serius
                    </span>
                  </motion.div>
                  <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-[#5C6B57] to-transparent z-10" />
                  <div className="absolute inset-y-0 right-0 w-2 bg-gradient-to-l from-[#5C6B57] to-transparent z-10" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      )}
    </div>
  );
}