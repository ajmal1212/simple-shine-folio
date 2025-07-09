
import { ArrowDown } from "lucide-react";

const Hero = () => {
  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-6 relative">
      <div className="text-center max-w-4xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-slate-800 mb-4 leading-tight">
            Alex Johnson
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl md:text-2xl text-slate-600 font-light">
            Full Stack Developer & UI/UX Designer
          </p>
        </div>
        
        <p className="text-lg text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
          I create beautiful, functional digital experiences that solve real problems 
          and delight users through thoughtful design and clean code.
        </p>

        <button
          onClick={scrollToAbout}
          className="group flex items-center justify-center w-12 h-12 mx-auto border-2 border-slate-300 rounded-full hover:border-blue-500 hover:bg-blue-500 transition-all duration-300 hover:scale-110"
        >
          <ArrowDown className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors duration-300" />
        </button>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-pulse"></div>
      <div className="absolute bottom-40 right-16 w-3 h-3 bg-purple-400 rounded-full opacity-40 animate-pulse delay-1000"></div>
      <div className="absolute top-1/3 right-8 w-1 h-1 bg-blue-300 rounded-full opacity-80 animate-pulse delay-500"></div>
    </section>
  );
};

export default Hero;
