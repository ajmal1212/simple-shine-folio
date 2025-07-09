
const About = () => {
  return (
    <section id="about" className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            About Me
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-lg text-slate-600 leading-relaxed">
              I'm a passionate developer with 5+ years of experience creating 
              digital solutions that bridge the gap between design and functionality. 
              I believe great software should be both beautiful and intuitive.
            </p>
            
            <p className="text-lg text-slate-600 leading-relaxed">
              When I'm not coding, you'll find me exploring new technologies, 
              contributing to open source projects, or enjoying a good cup of coffee 
              while sketching out ideas for the next big project.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Problem Solver
              </span>
              <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                Creative Thinker
              </span>
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Team Player
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="w-80 h-80 mx-auto bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-2xl shadow-2xl relative overflow-hidden">
              <div className="absolute inset-4 bg-white rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">AJ</span>
                  </div>
                  <p className="text-slate-600 text-sm">
                    Crafting digital experiences
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
