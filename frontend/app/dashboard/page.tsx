'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  Brain, Target, Timer, TreePine, Sparkles,
  Play, Pause, RotateCcw, Plus, Download
} from 'lucide-react';

// Move this OUTSIDE the component
const MindMapFlow = dynamic(() => import('@/components/MindMapFlow'), {
  ssr: false,
});

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('mindmap');
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'deepdive'>('roadmap');
  const [mindMapData, setMindMapData] = useState<any>(null);
  const [focusTime, setFocusTime] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [treeLevel, setTreeLevel] = useState(5);
  const [streakDays, setStreakDays] = useState(12);
  const [studyPlanTopic, setStudyPlanTopic] = useState('');
const [studyPlanWeeks, setStudyPlanWeeks] = useState(4);
const [studyPlanHours, setStudyPlanHours] = useState(2);
const [studyPlan, setStudyPlan] = useState<any>(null);
const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

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
      const response = await fetch('https://visual-ai-companion.onrender.com/api/generate-mindmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
  topic: topic,
  depth: 'medium',
  mode: mapType  // Add this line
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
  const generateStudyPlan = async () => {
    if (!studyPlanTopic.trim()) return;
    
    setIsGeneratingPlan(true);
    
    try {
      const response = await fetch('https://visual-ai-companion.onrender.com/api/generate-study-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: studyPlanTopic,
          weeks: studyPlanWeeks,
          hours_per_day: studyPlanHours,
          difficulty: 'intermediate'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate study plan');
      }
      
      const data = await response.json();
      setStudyPlan(data);
      console.log('Study plan generated:', data);
      
    } catch (error) {
      console.error('Error generating study plan:', error);
      alert('Failed to generate study plan. Make sure backend is running!');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const toggleWeekCompletion = (weekIndex: number) => {
    if (!studyPlan) return;
    
    const updatedWeeks = [...studyPlan.weeks];
    updatedWeeks[weekIndex] = {
      ...updatedWeeks[weekIndex],
      completed: !updatedWeeks[weekIndex].completed
    };
    
    setStudyPlan({
      ...studyPlan,
      weeks: updatedWeeks
    });
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
                {/* Mode Selector */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Generation Mode</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMapType('roadmap')}
                      className={`flex-1 px-4 py-3 rounded-lg transition-all ${
                        mapType === 'roadmap'
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/10 text-gray-400 hover:bg-white/20'
                      }`}
                    >
                      🗺️ Learning Roadmap
                    </button>
                    <button
                      onClick={() => setMapType('deepdive')}
                      className={`flex-1 px-4 py-3 rounded-lg transition-all ${
                        mapType === 'deepdive'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-gray-400 hover:bg-white/20'
                      }`}
                    >
                      🔍 Concept Deep Dive
                    </button>
                  </div>
                </div>

                {/* Topic Input */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    {mapType === 'roadmap' 
                      ? 'What do you want to learn?' 
                      : 'Which concept do you want to explore?'}
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={
                      mapType === 'roadmap'
                        ? 'e.g., Machine Learning, React Hooks, Quantum Physics...'
                        : 'e.g., Activation Functions, Binary Search Tree, REST API...'
                    }
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 outline-none transition-all"
                  />
                  {mapType === 'deepdive' && (
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Get detailed breakdown with types, formulas, examples, and use cases
                    </p>
                  )}
                </div>

                {/* Generate Button */}
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
                      {mapType === 'roadmap' ? 'Generate Roadmap' : 'Deep Dive Analysis'}
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
                  <div className="space-y-2">
  <p className="text-gray-400">AI is generating your personalized roadmap...</p>
  <p className="text-sm text-gray-500">This may take 10-15 seconds</p>
</div>
                </div>
              ) : mindMapData ? (
                <div className="w-full space-y-4">
                  <div className="text-2xl font-bold text-purple-400 text-center mb-4">{mindMapData.title}</div>
                  <MindMapFlow nodes={mindMapData.nodes} edges={mindMapData.edges} />
                  <div className="text-center">
                    <p className="text-sm text-green-400">✅ Mind Map Generated Successfully!</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {mindMapData.nodes?.length || 0} nodes • {mindMapData.edges?.length || 0} connections
                    </p>
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
        {/* Study Plan Tab */}
        {activeTab === 'study' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold">AI Study Plan Generator</h2>

            {!studyPlan ? (
              // Generation Form
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">What do you want to learn?</label>
                    <input
                      type="text"
                      value={studyPlanTopic}
                      onChange={(e) => setStudyPlanTopic(e.target.value)}
                      placeholder="e.g., Data Structures, Spanish, Guitar..."
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Duration (weeks)</label>
                      <select
                        value={studyPlanWeeks}
                        onChange={(e) => setStudyPlanWeeks(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-blue-500 outline-none transition-all"
                      >
                        {[2, 4, 6, 8, 12].map(weeks => (
                          <option key={weeks} value={weeks}>{weeks} weeks</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Hours per day</label>
                      <select
                        value={studyPlanHours}
                        onChange={(e) => setStudyPlanHours(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-blue-500 outline-none transition-all"
                      >
                        {[1, 2, 3, 4, 5].map(hours => (
                          <option key={hours} value={hours}>{hours} hour{hours > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={generateStudyPlan}
                    disabled={!studyPlanTopic || isGeneratingPlan}
                    className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 font-semibold text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {isGeneratingPlan ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating Your Plan...
                      </>
                    ) : (
                      <>
                        <Target className="w-5 h-5" />
                        Generate Study Plan
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              // Generated Study Plan Display
              <div className="space-y-6">
                {/* Plan Header */}
                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{studyPlan.topic}</h3>
                      <div className="flex gap-4 text-sm text-gray-300">
                        <span>📅 {studyPlan.total_weeks} weeks</span>
                        <span>⏰ {studyPlan.daily_hours}h/day</span>
                        <span>📊 {studyPlan.estimated_total_hours}h total</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setStudyPlan(null)}
                      className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-sm"
                    >
                      New Plan
                    </button>
                  </div>
                </div>

                {/* Weekly Breakdown */}
                <div className="grid gap-4">
                  {studyPlan.weeks.map((week: any, index: number) => (
                    <div
                      key={index}
                      className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 border transition-all ${
                        week.completed
                          ? 'border-green-500/50 bg-green-500/10'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">{week.title}</h3>
                            {week.completed && <span className="text-green-400 text-sm">✓ Completed</span>}
                          </div>
                          <p className="text-sm text-gray-400">Week {week.week} • {week.daily_hours}h/day</p>
                        </div>
                        <button
                          onClick={() => toggleWeekCompletion(index)}
                          className={`px-4 py-2 rounded-lg transition-all ${
                            week.completed
                              ? 'bg-green-500 hover:bg-green-600'
                              : 'bg-white/10 hover:bg-white/20'
                          }`}
                        >
                          {week.completed ? 'Completed' : 'Mark Complete'}
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-semibold text-blue-400 mb-2">📚 Topics to Cover:</h4>
                          <div className="flex gap-2 flex-wrap">
                            {week.topics.map((topic: string, i: number) => (
                              <span
                                key={i}
                                className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm border border-blue-500/30"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>

                        {week.goals && week.goals.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-purple-400 mb-2">🎯 Goals:</h4>
                            <ul className="space-y-1">
                              {week.goals.map((goal: string, i: number) => (
                                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                  <span className="text-purple-400 mt-0.5">•</span>
                                  {goal}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress Summary */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-bold mb-3">Progress Overview</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400">
                        {studyPlan.weeks.filter((w: any) => w.completed).length}/{studyPlan.weeks.length}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">Weeks Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400">
                        {Math.round((studyPlan.weeks.filter((w: any) => w.completed).length / studyPlan.weeks.length) * 100)}%
                      </div>
                      <div className="text-sm text-gray-400 mt-1">Overall Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-400">
                        {studyPlan.weeks.filter((w: any) => w.completed).length * 7 * studyPlan.daily_hours}h
                      </div>
                      <div className="text-sm text-gray-400 mt-1">Hours Invested</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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