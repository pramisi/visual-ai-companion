'use client';

import { useState, useEffect } from 'react';
import { 
  Brain, Target, Timer, TreePine, Sparkles,
  Play, Pause, RotateCcw, Plus, Download
} from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('mindmap');
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mindMapData, setMindMapData] = useState<any>(null);
  const [focusTime, setFocusTime] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [treeLevel, setTreeLevel] = useState(5);
  const [streakDays, setStreakDays] = useState(12);

  const tabs = [
    { id: 'mindmap', name: 'Mind Map', icon: Brain, color: 'purple' },
    { id: 'study', name: 'Study Plan', icon: Target, color: 'blue' },
    { id: 'focus', name: 'Focus Timer', icon: Timer, color: 'orange' },
    { id: 'growth', name: 'My Growth', icon: TreePine, color: 'green' },
  ];

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && focusTime > 0) {
      interval = setInterval(() => {
        setFocusTime((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, focusTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/generate-mindmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic,
          depth: 'medium'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate mind map');
      }
      
      const data = await response.json();
      setMindMapData(data);
      console.log('Mind map generated:', data);
      
    } catch (error) {
      console.error('Error generating mind map:', error);
      alert('Failed to generate mind map. Make sure backend is running!');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-white/5">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              VisualAI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              🔥 Streak: <span className="text-orange-400 font-bold">{streakDays} days</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center font-bold">
              {treeLevel}
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? `border-${tab.color}-500 text-white`
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Mind Map Tab */}
        {activeTab === 'mindmap' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">AI Mind Map Generator</h2>
              <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">What do you want to learn?</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Machine Learning, React Hooks, Quantum Physics..."
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 outline-none transition-all"
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!topic || isGenerating}
                  className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 font-semibold text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      Generate Mind Map
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Mind Map Preview */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 min-h-[400px] flex items-center justify-center">
              {isGenerating ? (
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">Creating your visual learning map...</p>
                </div>
              ) : mindMapData ? (
                <div className="w-full space-y-4">
                  <div className="text-2xl font-bold text-purple-400 text-center mb-4">{mindMapData.title}</div>
                  <div className="bg-black/20 rounded-lg p-4 max-h-96 overflow-auto">
                    <div className="text-sm space-y-2">
                      <div className="text-green-400 font-bold">✅ Mind Map Generated Successfully!</div>
                      <div className="text-gray-400">Nodes: {mindMapData.nodes?.length || 0}</div>
                      <div className="text-gray-400">Connections: {mindMapData.edges?.length || 0}</div>
                      <details className="mt-4">
                        <summary className="text-purple-400 cursor-pointer hover:text-purple-300">View Data (Click to expand)</summary>
                        <pre className="text-xs text-green-400 mt-2 overflow-auto">
                          {JSON.stringify(mindMapData, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </div>
                </div>
              ) : topic ? (
                <div className="text-center space-y-4">
                  <Brain className="w-16 h-16 text-purple-400 mx-auto" />
                  <p className="text-gray-400">Your interactive mind map will appear here</p>
                  <p className="text-sm text-gray-500">Click "Generate Mind Map" to create</p>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <Plus className="w-16 h-16 text-gray-600 mx-auto" />
                  <p className="text-gray-400">Enter a topic above to get started</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Study Plan Tab */}
        {activeTab === 'study' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold">Personalized Study Plan</h2>
            <div className="grid gap-4">
              {[1, 2, 3].map((week) => (
                <div key={week} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2">Week {week}</h3>
                      <p className="text-gray-400 mb-4">
                        {week === 1 ? 'Foundations & Core Concepts' : week === 2 ? 'Intermediate Topics' : 'Advanced Applications'}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {['Topic A', 'Topic B', 'Topic C'].map((topic, i) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm border border-blue-500/30">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-400">{week * 33}%</div>
                      <div className="text-sm text-gray-500">Complete</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Focus Timer Tab */}
        {activeTab === 'focus' && (
          <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center">Focus Session</h2>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/10 text-center">
              <div className="text-8xl font-bold mb-8 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                {formatTime(focusTime)}
              </div>

              <div className="flex justify-center gap-4 mb-8">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center hover:scale-110 transition-transform"
                >
                  {isTimerRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </button>
                <button
                  onClick={() => {
                    setFocusTime(25 * 60);
                    setIsTimerRunning(false);
                  }}
                  className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>
              </div>

              <div className="flex gap-4 justify-center">
                {[15, 25, 45].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      setFocusTime(mins * 60);
                      setIsTimerRunning(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Growth Tab */}
        {activeTab === 'growth' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold">Your Growth Journey</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
                <TreePine className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <div className="text-4xl font-bold text-green-400 mb-2">Level {treeLevel}</div>
                <div className="text-gray-400">Tree Stage: Sprouting</div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
                <div className="text-4xl font-bold text-orange-400 mb-2">{streakDays} Days</div>
                <div className="text-gray-400">Current Streak 🔥</div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">1,250</div>
                <div className="text-gray-400">Focus Minutes</div>
              </div>
            </div>

            {/* Tree Visualization */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/10 flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <div className="text-9xl mb-4">🌱</div>
                <p className="text-xl text-gray-400">Your learning tree is growing!</p>
                <p className="text-sm text-gray-500 mt-2">Keep your streak to reach the next stage</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}