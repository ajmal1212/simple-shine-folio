
import { Code, Palette, Globe, Smartphone } from "lucide-react";

const Skills = () => {
  const skills = [
    {
      icon: Code,
      title: "Frontend Development",
      description: "React, TypeScript, Next.js, Tailwind CSS",
      color: "blue"
    },
    {
      icon: Globe,
      title: "Backend Development", 
      description: "Node.js, Python, PostgreSQL, API Design",
      color: "green"
    },
    {
      icon: Palette,
      title: "UI/UX Design",
      description: "Figma, Adobe Creative Suite, User Research",
      color: "purple"
    },
    {
      icon: Smartphone,
      title: "Mobile Development",
      description: "React Native, Flutter, iOS/Android",
      color: "pink"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
      green: "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700", 
      purple: "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
      pink: "from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <section className="py-20 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Skills & Expertise
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${getColorClasses(skill.color)} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <skill.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                {skill.title}
              </h3>
              
              <p className="text-slate-600 leading-relaxed">
                {skill.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
