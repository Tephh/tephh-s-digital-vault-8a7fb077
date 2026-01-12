import React from 'react';
import { Code, Brain, Gamepad2, GraduationCap, Coffee, Music, Crown, Terminal } from 'lucide-react';

const AboutMeSection: React.FC = () => {
  const interests = [
    { icon: GraduationCap, label: 'Civil Engineering Student', color: 'text-blue-500' },
    { icon: Brain, label: 'AI Research Enthusiast', color: 'text-purple-500' },
    { icon: Code, label: 'Coding Hobbyist', color: 'text-green-500' },
    { icon: Gamepad2, label: 'MLBB Gamer', color: 'text-orange-500' },
    { icon: Crown, label: 'Chess Player', color: 'text-amber-500' },
    { icon: Coffee, label: 'Matcha Lover', color: 'text-emerald-500' },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Meet the <span className="text-gradient-gold">Developer</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A glimpse into who's behind Tephh Shop
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* About Card */}
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl">
                👨‍💻
              </div>
              <div>
                <h3 className="text-xl font-bold">Sin SokTephh</h3>
                <p className="text-muted-foreground text-sm">@tephh | @putephh</p>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              Hi! I'm a <strong className="text-foreground">Civil Engineering student</strong> with a passion for technology. 
              When I'm not studying structures and materials, I'm diving into <strong className="text-foreground">AI research</strong> and 
              <strong className="text-foreground"> coding projects</strong>. Science subjects fascinate me, and programming has become 
              one of my favorite hobbies!
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {interests.map((interest, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                  <interest.icon className={`w-4 h-4 ${interest.color}`} />
                  <span className="text-xs font-medium">{interest.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Terminal Style Card */}
          <div className="glass-card overflow-hidden">
            <div className="bg-secondary/80 px-4 py-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-xs text-muted-foreground ml-2">tephh@shop ~ </span>
            </div>
            <div className="p-4 font-mono text-sm space-y-2 bg-background/50">
              <div className="flex">
                <span className="text-green-500">$</span>
                <span className="ml-2 text-muted-foreground">whoami</span>
              </div>
              <p className="text-foreground pl-4">Sin SokTephh - Developer & Student</p>
              
              <div className="flex mt-4">
                <span className="text-green-500">$</span>
                <span className="ml-2 text-muted-foreground">cat hobbies.txt</span>
              </div>
              <div className="pl-4 space-y-1">
                <p className="text-blue-400"># Coding & AI Research</p>
                <p className="text-purple-400"># Science & Engineering</p>
                <p className="text-orange-400"># Gaming (MLBB - Selena Main)</p>
                <p className="text-amber-400"># Chess Enthusiast ♟️</p>
                <p className="text-emerald-400"># Matcha Addict 🍵</p>
              </div>

              <div className="flex mt-4">
                <span className="text-green-500">$</span>
                <span className="ml-2 text-muted-foreground">echo $MLBB_ID</span>
              </div>
              <p className="text-foreground pl-4">378414666 (Feel free to play together!)</p>

              <div className="flex mt-4">
                <span className="text-green-500">$</span>
                <span className="ml-2 text-muted-foreground">echo "Let's play chess sometime! 🎮"</span>
              </div>
              <p className="text-accent pl-4 animate-pulse">Let's play chess sometime! 🎮</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutMeSection;
