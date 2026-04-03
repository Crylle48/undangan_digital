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
  User
} from 'lucide-react';

// --- KOMPONEN ANIMASI ---
const FadeUp = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

// --- KOMPONEN COUNTDOWN ---
const Countdown = ({ targetDate }) => {
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

  const Item = ({ val, label }) => (
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
  const [messages, setMessages] = useState([]);
  const audioRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    attendance: '',
    message: ''
  });

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('rsvp')
      .select('name, message, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

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
  const [showCopyToast, setShowCopyToast] = useState(false);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      // Kita kasih offset dikit (misal -20) biar nggak terlalu nempel atas
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

  const handleRSVP = async (e) => {
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
      console.error("Error:", error.message);
      alert("Gagal terkirim, coba cek koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [petals, setPetals] = useState([]);
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
        const decodedName = decodeURIComponent(name); // Biar "Rizki%20Ganteng" jadi "Rizki Ganteng"
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
          }, 200); // Naik tiap 0.2 detik. Total ±2.5 detik buat full.

        }).catch(() => console.log("Autoplay blocked"));
      }
    }
  }, [isOpened]);

  const musicUrl = `https://yyfjsoryfmhlzxoktqdo.supabase.co/storage/v1/object/public/asset/Amin%20Paling%20Serius%20-%20%20Instrumental.mp3`;

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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
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
            className="fixed inset-0 z-50 flex flex-col items-center justify-between py-16 md:py-20 px-6 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url("https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop")'
            }}
          >
            <div className="text-center space-y-6 text-white">
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="uppercase tracking-[0.6em] text-[10px] font-medium opacity-80">The Wedding Of</motion.p>
              
              <motion.h1 initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8, duration: 1 }} className="text-3xl md:text-5xl font-bold tracking-[0.1em] flex items-center justify-center gap-4 uppercase">
                <span className="drop-shadow-lg">Rizki</span>
                <span className="text-2xl md:text-4xl font-light opacity-40 lowercase italic tracking-normal">&</span>
                <span className="drop-shadow-lg">Listiya</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-sm md:text-base font-light tracking-[0.4em] opacity-90">07 . 06 . 2026</motion.p>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="text-center text-white flex flex-col items-center w-full max-w-xs">
              <p className="text-xs mb-1 opacity-70 tracking-widest">
                Kepada Yth.
                <br />
                Bapak/Ibu/Saudara/i
              </p>
              <h2 className="text-xl md:text-2xl font-medium mb-8 border-b border-white/20 pb-2 w-full truncate px-4 tracking-wide">{guestName}</h2>
              <button onClick={() => setIsOpened(true)} className="w-full md:w-auto px-10 py-4 bg-white text-[#5C6B57] rounded-full font-bold shadow-xl hover:bg-[#8CA38D] hover:text-white transition-all duration-500 flex items-center justify-center gap-3 active:scale-95 group">
                <Heart size={18} className="group-hover:fill-current transition-colors" /> Buka Undangan
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: 'linear-gradient(rgba(250, 247, 242, 0.92), rgba(250, 247, 242, 0.88)), url("https://images.unsplash.com/photo-1510076857177-7470076d4098?q=80&w=2072&auto=format&fit=crop")'
        }}
      />

      {/* --- MAIN CONTENT CONTAINER --- */}
      <main className="relative z-10">
        
        {/* --- SECTION 2: WELCOME & COUNTDOWN --- */}
        <section id="main" className="min-h-screen flex items-center justify-center px-6 py-20 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
             {petals.map((p) => (
               <motion.div
                 key={p.id}
                 initial={{ y: -100, x: 0, rotate: 0 }}
                 animate={{ y: 1200, x: 40, rotate: 360 }}
                 transition={{ duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay }}
                 className="absolute text-[#8CA38D] opacity-20"
                 style={{ left: p.left }}
               >
                 <Heart size={p.size} fill="currentColor" />
               </motion.div>
             ))}
          </div>
          
          <div className="max-w-4xl mx-auto text-center w-full">
            <FadeUp>
              <h2 className="text-2xl md:text-4xl font-bold text-[#5C6B57] mb-4 flex items-center justify-center gap-4 uppercase tracking-[0.15em]">
                <span>Rizki</span>
                <span className="text-2xl md:text-4xl font-light opacity-20 lowercase italic tracking-normal">&</span>
                <span>Listiya</span>
              </h2>
              <p className="text-[#8CA38D] font-bold tracking-[0.4em] text-sm md:text-base mb-8">MINGGU, 07 JUNI 2026</p>
              <div className="w-12 h-[2px] bg-[#8CA38D]/30 mx-auto mb-12"></div>
              
              <p className="text-gray-600 leading-relaxed text-base md:text-lg max-w-xl mx-auto mb-16 px-4 font-normal tracking-wide">
                Menyatukan dua langkah dalam satu tujuan, menjalin doa dalam ikatan yang kekal.
              </p>

              <div className="bg-[#5C6B57]/95 backdrop-blur-md py-12 px-6 rounded-[50px] shadow-2xl mx-auto max-w-lg border border-white/10">
                 <p className="text-white uppercase tracking-[0.3em] text-[10px] mb-6 font-bold opacity-70">Counting Down</p>
                 <Countdown targetDate="2026-06-07T08:00:00" />
              </div>
            </FadeUp>
          </div>
        </section>

        {/* --- SECTION 3: QUOTE --- */}
        <section id="quote" className="py-20 md:py-32 text-center px-6">
          <FadeUp>
            <div className="max-w-3xl mx-auto bg-white/50 backdrop-blur-xl p-10 md:p-20 rounded-[60px] shadow-sm border border-white/60">
              <p className="text-lg md:text-2xl leading-relaxed text-gray-700 font-light mb-8 tracking-wide">
                "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang."
              </p>
              <div className="w-8 h-[1px] bg-gray-300 mx-auto mb-6"></div>
              <p className="font-bold text-[#5C6B57] tracking-[0.2em] text-xs uppercase italic">- QS. Ar-Rum 21 -</p>
            </div>
          </FadeUp>
        </section>

        {/* --- SECTION 4: PROFIL --- */}
        <section id="profile" className="py-20">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-20 md:gap-24 items-start">
              <FadeUp delay={0.2}>
                <div className="flex flex-col items-center text-center group">
                  <div className="relative mb-10">
                    <div className="absolute -inset-4 border border-[#8CA38D]/20 rounded-full scale-105 group-hover:scale-110 transition-transform duration-1000"></div>
                    <div className="w-56 h-72 md:w-72 md:h-96 overflow-hidden rounded-[100px] shadow-2xl relative z-10 border-8 border-white">
                      <img src="https://yyfjsoryfmhlzxoktqdo.supabase.co/storage/v1/object/public/asset/TestPria.jpeg" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Rizki" />
                    </div>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-[#5C6B57] mb-2 tracking-widest uppercase">Muhamad Rizki</h3>
                  <p className="text-gray-500 text-sm tracking-widest uppercase mb-4 opacity-70">Putra Bapak Soleh & Ibu Musriah</p>
                </div>
              </FadeUp>

              <FadeUp delay={0.4}>
                <div className="flex flex-col items-center text-center group">
                  <div className="relative mb-10">
                    <div className="absolute -inset-4 border border-[#8CA38D]/20 rounded-full scale-105 group-hover:scale-110 transition-transform duration-1000"></div>
                    <div className="w-56 h-72 md:w-72 md:h-96 overflow-hidden rounded-[100px] shadow-2xl relative z-10 border-8 border-white">
                      <img src="https://yyfjsoryfmhlzxoktqdo.supabase.co/storage/v1/object/public/asset/TestWanita.jpeg" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Listiya" />
                    </div>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-[#5C6B57] mb-2 tracking-widest uppercase">Listiyanti Apridar</h3>
                  <p className="text-gray-500 text-sm tracking-widest uppercase mb-4 opacity-70">Putri Bapak Sopian (Alm) & Ibu Saripah</p>
                </div>
              </FadeUp>
            </div>
          </div>
        </section>

        {/* --- SECTION 5: EVENT --- */}
        <section id="event" className="py-24 px-6 bg-[#5C6B57]/5">
          <div className="max-w-4xl mx-auto">
            <FadeUp>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-[#5C6B57] mb-4 tracking-[0.2em] uppercase">The Celebration</h2>
                <div className="w-12 h-1 bg-[#8CA38D] mx-auto opacity-50"></div>
              </div>
            </FadeUp>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-16">
              {[
                { title: "Akad Nikah", time: "10.00 - 11.00 WIB", desc: "Momen suci pengikatan janji" },
                { title: "Resepsi", time: "11.00 - 15.00 WIB", desc: "Perayaan sukacita bersama" }
              ].map((item, idx) => (
                <FadeUp key={idx} delay={idx * 0.2}>
                  <div className="bg-white/80 backdrop-blur-sm p-10 md:p-14 rounded-[60px] text-center shadow-xl border border-white hover:bg-[#5C6B57] hover:text-white transition-all duration-500 group">
                    <h3 className="text-2xl md:text-3xl font-bold mb-6 tracking-widest uppercase">{item.title}</h3>
                    <div className="space-y-4 text-sm md:text-base opacity-80 group-hover:opacity-100 transition-opacity">
                      <p className="flex items-center justify-center gap-3 font-medium tracking-wide"><Calendar size={18} /> Minggu, 7 Juni 2026</p>
                      <p className="flex items-center justify-center gap-3 font-medium tracking-wide"><Clock size={18} /> {item.time}</p>
                      <div className="h-[1px] w-8 bg-current mx-auto my-6 opacity-30"></div>
                      <p className="font-bold tracking-widest uppercase text-xs md:text-sm">{item.desc}</p>
                      <p className="font-medium">Rumah Mempelai Wanita</p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>

            <FadeUp>
              <div className="text-center">
                <a 
                  href="https://maps.app.goo.gl/jrD4djhANdcy2UVR6" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block w-full md:w-auto"
                >
                  <button className="w-full md:w-auto px-12 py-5 bg-[#5C6B57] text-white hover:bg-[#4A5546] transition-all rounded-full font-bold shadow-2xl flex items-center justify-center gap-3 mx-auto active:scale-95 uppercase tracking-widest text-xs">
                    <MapPin size={18}/> Buka Google Maps
                  </button>
                </a>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* --- SECTION 6: WEDDING GIFT --- */}
        <section id="gift" className="py-20 md:py-32 px-6 bg-[#5C6B57]/5">
          <div className="max-w-2xl mx-auto text-center">
            <FadeUp>
              <div className="mb-16">
                <motion.div
                  animate={{ 
                    y: [0, -15, 0], // Sumbu Y: Mulai di 0, naik ke -15px, balik ke 0
                  }}
                  transition={{ 
                    duration: 3, // Durasi satu putaran (naik-turun) 3 detik biar smooth
                    ease: "easeInOut", // Gerakan melambat di puncak dan dasar
                    repeat: Infinity, // Ulangi terus tanpa henti
                    repeatType: "loop" // Jenis perulangan putaran penuh
                  }}
                  className="mb-4" // Margin bawah pindah ke sini biar icon-nya bersih
                >
                  <Gift className="mx-auto text-[#8CA38D]" size={40} />
                </motion.div>
                <h2 className="text-3xl md:text-5xl font-bold text-[#5C6B57] mb-4 uppercase tracking-[0.2em]">Wedding Gift</h2>
                <p className="text-gray-500 text-xs md:text-sm tracking-widest uppercase opacity-70 font-bold px-4 leading-relaxed">
                  Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika memberi adalah ungkapan kasih Anda, kami menyediakan layanan kado digital.
                </p>
              </div>

              <div className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-100 relative overflow-hidden group transition-all hover:shadow-2xl">
                {/* WATERMARK LOGO SEABANK (Gantiin icon Gift) */}
                <div className="absolute top-0 right-1">
                  <img 
                    src="https://yyfjsoryfmhlzxoktqdo.supabase.co/storage/v1/object/public/asset/LogoSeaBank.png" 
                    alt="SeaBank Logo" 
                    className="w-32 h-32 object-contain" 
                  />
                </div>

                <div className="relative z-10">
                  {/* TEXT HEADER */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-2 h-2 rounded-full bg-[#8CA38D] animate-pulse"></div>
                    <p className="text-[#8CA38D] font-black tracking-[0.2em] text-[10px] uppercase">
                      SeaBank Indonesia
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-1">
                    <h4 className="text-2xl md:text-3xl font-bold text-[#5C6B57] tracking-[0.1em] mb-1">
                      9018 3789 0416
                    </h4>
                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-[0.2em] mb-8">
                      a.n Listiyanti Apridar
                    </p>
                  </div>

                  {/* BUTTON SALIN */}
                  <button 
                    onClick={() => copyToClipboard('901837890416')}
                    className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] bg-[#F2F5F2] text-[#5C6B57] px-8 py-4 rounded-full hover:bg-[#5C6B57] hover:text-white transition-all active:scale-90 shadow-sm"
                  >
                    <Copy size={14} /> Salin Nomor Rekening
                  </button>
                </div>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* --- SECTION 7: RSVP --- */}
        <section id="rsvp" className="py-24 md:py-32 px-6 bg-gradient-to-b from-transparent to-gray-50/50">
          <div className="max-w-xl mx-auto">
            <FadeUp>
              <div className="text-center mb-12">
                <div className="inline-block p-3 rounded-full bg-[#8CA38D]/10 text-[#8CA38D] mb-4">
                  <Send size={24} />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-[#5C6B57] mb-4 uppercase tracking-[0.1em]">BE OUR GUEST</h2>
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="h-[1px] w-8 bg-[#8CA38D]/30"></div>
                  <Heart size={12} className="text-[#8CA38D]" />
                  <div className="h-[1px] w-8 bg-[#8CA38D]/30"></div>
                </div>
                <p className="text-gray-500 text-[10px] md:text-xs tracking-[0.2em] uppercase font-semibold leading-relaxed">
                  Ukiran kenangan indah akan tercipta dengan kehadiran Anda.
                </p>
              </div>
      
              {/* FORM START */}
              <form onSubmit={handleRSVP} className="bg-white/80 backdrop-blur-sm p-8 md:p-14 rounded-[50px] space-y-10 shadow-[0_20px_50px_rgba(92,107,87,0.1)] border border-white relative overflow-hidden">
                
                {/* Aksen Elemen Estetik */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#8CA38D]/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#5C6B57]/5 rounded-full blur-3xl"></div>

                {/* INPUT NAMA */}
                <div className="relative group">
                  <input 
                    type="text" 
                    required
                    placeholder=" " 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="peer w-full bg-transparent border-b-2 border-gray-100 py-3 outline-none transition-all focus:border-[#8CA38D] text-[#5C6B57] font-medium placeholder-transparent" 
                  />
                  <label className="absolute left-0 -top-3.5 text-[10px] uppercase font-bold tracking-widest text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-300 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[#8CA38D] peer-focus:text-[10px] pointer-events-none">
                    Nama Lengkap
                  </label>
                </div>

                {/* SELECT KEHADIRAN */}
                <div className="relative group">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#8CA38D] mb-2 block">
                    Konfirmasi Kehadiran
                  </label>
                  <div className="relative">
                    <select 
                      required
                      value={formData.attendance}
                      onChange={(e) => setFormData({...formData, attendance: e.target.value})}
                      className="w-full bg-gray-50/50 border-none rounded-2xl px-6 py-4 outline-none appearance-none text-[#5C6B57] font-medium cursor-pointer focus:ring-2 focus:ring-[#8CA38D]/20 transition-all"
                    >
                      <option value="" disabled>Pilih Status Kehadiran</option>
                      <option value="Hadir">Saya Akan Hadir</option>
                      <option value="Ragu">Masih Ragu</option>
                      <option value="Tidak Hadir">Berhalangan Hadir</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                {/* TEXTAREA PESAN */}
                <div className="relative group">
                  <textarea 
                    placeholder=" " 
                    rows="4" 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="peer w-full bg-gray-50/50 border-none rounded-2xl px-6 py-4 outline-none transition-all focus:ring-2 focus:ring-[#8CA38D]/20 text-[#5C6B57] font-medium placeholder-transparent resize-none"
                  ></textarea>
                  <label className="absolute left-6 top-4 text-gray-300 transition-all peer-placeholder-shown:text-base peer-focus:-top-7 peer-focus:left-0 peer-focus:text-[#8CA38D] peer-focus:text-[10px] peer-focus:uppercase peer-focus:font-bold peer-focus:tracking-widest pointer-events-none">
                    Pesan Singkat & Doa
                  </label>
                  {/* Label cadangan pas value ada isinya */}
                  {formData.message && (
                    <span className="absolute -top-7 left-0 text-[10px] uppercase font-bold tracking-widest text-[#8CA38D]">Pesan Singkat & Doa</span>
                  )}
                </div>

                {/* BUTTON SUBMIT */}
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full overflow-hidden rounded-full bg-[#5C6B57] py-5 font-bold uppercase tracking-[0.2em] text-white shadow-xl transition-all hover:bg-[#4A5546] active:scale-[0.98] disabled:opacity-50"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3 text-[11px]">
                    {isSubmitting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    ) : (
                      <>
                        <Heart size={16} fill="currentColor" />
                        Kirim Konfirmasi
                      </>
                    )}
                  </span>
                </button>

              </form>
            </FadeUp>
          </div>
        </section>

        {/* --- SECTION 8: GUESTBOOK --- */}
        <section id="guestbook" className="py-20 px-6 bg-white/30 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto">
            <FadeUp>
              <div className="text-center mb-10">
                <MessageSquare className="mx-auto text-[#8CA38D] mb-4" size={32} />
                <h2 className="text-2xl md:text-3xl font-bold text-[#5C6B57] uppercase tracking-widest">Ucapan & Doa Restu</h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-2">Terima kasih atas doa tulus Anda</p>
              </div>

              {/* CONTAINER LIST PESAN */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {messages.length > 0 ? (
                  messages.map((item, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      className="bg-white/80 p-5 rounded-2xl shadow-sm border border-white/60"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-[#8CA38D]/20 flex items-center justify-center text-[#5C6B57]">
                          <User size={16} />
                        </div>
                        <h4 className="font-bold text-[#5C6B57] text-sm uppercase tracking-wide">{item.name}</h4>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed italic">"{item.message}"</p>
                      <p className="text-[9px] text-gray-400 mt-3 text-right uppercase tracking-tighter">
                        {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 text-xs italic">Belum ada ucapan...</p>
                )}
              </div>
            </FadeUp>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="py-25 bg-[#5C6B57] text-white text-center px-6 relative z-10">
          <FadeUp>
            <p className="mb-8 opacity-60 tracking-[0.4em] uppercase text-[10px] font-bold">See you there</p>
            
            <h2 className="text-3xl md:text-4xl font-mid mb-12 flex items-center justify-center gap-4 uppercase tracking-[0.15em]">
              <span>Rizki</span>
              <span className="text-xl md:text-3xl font-light opacity-30 lowercase italic tracking-normal">&</span>
              <span>Listiya</span>
            </h2>

            <div className="flex justify-center items-center gap-5 mb-16 opacity-20">
              <div className="h-[1px] w-20 bg-white"></div>
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <div className="h-[1px] w-20 bg-white"></div>
            </div>

            <p className="text-[9px] tracking-[0.5em] uppercase opacity-30 font-bold">Rizki Digital Invitation © 2026</p>
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
                className={`flex flex-col items-center justify-center min-w-[45px] h-10 rounded-2xl transition-all active:scale-90 ${isPlaying ? 'text-[#8CA38D]' : 'text-gray-400'}`}
              >
                <div className={isPlaying ? 'animate-spin-slow' : ''}>
                  {isPlaying ? <Music size={16} /> : <Pause size={16} />}
                </div>
                <span className="text-[7px] uppercase font-black mt-1">{isPlaying ? 'On' : 'Off'}</span>
              </button>

              <div className="w-[1px] h-6 bg-gray-200 mx-1" />

              {/* 6 MENU NAVIGASI */}
              {[
                { icon: <Heart size={16} />, label: "Home", target: "main" },
                { icon: <MessageSquare size={16} />, label: "Verse", target: "quote" },
                { icon: <User size={16} />, label: "Couple", target: "profile" }, // Bisa ganti icon User kalau mau
                { icon: <Calendar size={16} />, label: "Date", target: "event" },
                { icon: <Gift size={16} />, label: "Gift", target: "gift" },
                { icon: <Send size={16} />, label: "Rsvp", target: "rsvp" },
              ].map((menu, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToSection(menu.target)}
                  className="flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-xl text-[#5C6B57] hover:bg-[#8CA38D]/10 transition-all active:scale-90"
                >
                  <div className="group-hover:scale-110 transition-transform">{menu.icon}</div>
                  <span className="text-[8px] uppercase font-bold tracking-tighter">{menu.label}</span>
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
                  <Heart className="text-[#8CA38D]" fill="#8CA38D" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-[#5C6B57] mb-2 uppercase tracking-tighter text-center">Terima Kasih!</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-8 font-medium">
                  Pesan dan konfirmasi kehadiran sudah terkirim. Sampai bertemu di hari bahagia nanti!
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
              initial={{ opacity: 0, scale: 0.8, y: 20, x: '-50%' }}
              animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, scale: 0.8, y: -20, x: '-50%' }}
              className="fixed bottom-22 left-1/2 z-[100] bg-[#5C6B57] text-white px-8 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20"
            >
              <Copy size={14} className="animate-bounce" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                Nomor Rekening Berhasil Disalin!
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}