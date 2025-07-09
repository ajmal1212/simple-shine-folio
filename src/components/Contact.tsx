
import { Mail, Github, Linkedin, Twitter } from "lucide-react";

const Contact = () => {
  const socialLinks = [
    {
      icon: Github,
      label: "GitHub",
      href: "https://github.com",
      color: "hover:text-gray-600"
    },
    {
      icon: Linkedin, 
      label: "LinkedIn",
      href: "https://linkedin.com",
      color: "hover:text-blue-600"
    },
    {
      icon: Twitter,
      label: "Twitter", 
      href: "https://twitter.com",
      color: "hover:text-blue-400"
    },
    {
      icon: Mail,
      label: "Email",
      href: "mailto:alex@example.com",
      color: "hover:text-red-500"
    }
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Let's Work Together
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            I'm always excited to take on new challenges and collaborate on 
            innovative projects. Let's create something amazing together!
          </p>
        </div>

        <div className="flex justify-center space-x-8 mb-12">
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-slate-400 ${link.color}`}
              aria-label={link.label}
            >
              <link.icon className="w-7 h-7 group-hover:scale-110 transition-transform duration-300" />
            </a>
          ))}
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-8 shadow-2xl">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to start a project?
          </h3>
          <p className="text-blue-100 mb-6 text-lg">
            Drop me a line and let's discuss your ideas
          </p>
          <a
            href="mailto:alex@example.com"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors duration-300 hover:scale-105 transform"
          >
            <Mail className="w-5 h-5 mr-2" />
            Get In Touch
          </a>
        </div>
      </div>

      <footer className="mt-20 pt-8 border-t border-slate-200 text-center">
        <p className="text-slate-500">
          © 2024 Alex Johnson. Crafted with passion and lots of coffee ☕
        </p>
      </footer>
    </section>
  );
};

export default Contact;
