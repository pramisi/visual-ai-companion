'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Brain, Target, Timer, TreePine, Zap } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useCallback } from 'react';

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI Mind Maps",
      description: "Transform complex topics into visual flowcharts instantly",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Target,
      title: "Smart Study Plans",
      description: "Personalized learning paths that adapt to your pace",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Timer,
      title: "Focus Sessions",
      description: "AI-powered Pomodoro with adaptive timing",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: TreePine,
      title: "Growth System",
      description: "Watch your tree grow as you build consistency",
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white overflow-hidden relative">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl transition-transform duration-1000"
          style={{ 
            left: '10%', 
            top: '20%',
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        />
        <div 
          className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl transition-transform duration-1000"
          style={{ 
            right: '10%', 
            bottom: '20%',
            transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)`
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              VisualAI
            </span>
          </div>
          <button className="px-6 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all hover:scale-105">
            Sign In
          </button>
        </nav>

        {/* Hero Section */}
        <div className="container mx-auto px-6 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-4 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 backdrop-blur-sm animate-fade-in">
              <span className="text-sm text-purple-300 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                AI-Powered Learning Revolution
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight animate-slide-up">
              Transform Confusion into
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Crystal Clarity
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto animate-fade-in">
              Your visual-first AI companion that converts complex topics into beautiful
              flowcharts, builds adaptive study plans, and grows with your progress.
            </p>

            <div className="flex gap-4 justify-center flex-wrap animate-slide-up">
              <a href="/dashboard">
  <button className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 font-semibold text-lg shadow-2xl shadow-purple-500/50 hover:scale-105 transition-transform hover:shadow-purple-500/70">
    Start Learning Free
  </button>
</a>
              <button className="px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 font-semibold text-lg hover:scale-105 hover:bg-white/20 transition-all">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all h-full hover:-translate-y-2 duration-300">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { number: "10K+", label: "Active Learners" },
              { number: "50K+", label: "Mind Maps Created" },
              { number: "95%", label: "Success Rate" }
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center hover:scale-110 transition-transform duration-300"
              >
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-gray-400 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}