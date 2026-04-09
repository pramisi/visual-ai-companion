from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import os
from dotenv import load_dotenv
import google.generativeai as genai
import json

load_dotenv()

app = FastAPI(title="Visual AI Companion API", version="1.0.0")

# CORS - Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://visual-ai-companion.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Google Gemini
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
gemini_model = None
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
    gemini_model = genai.GenerativeModel('gemini-flash-latest')

# ============================================================================
# MODELS
# ============================================================================

# Mind Map Models
class MindMapRequest(BaseModel):
    topic: str
    depth: str = "medium"
    mode: str = "roadmap"

class Node(BaseModel):
    id: str
    type: str
    data: Dict[str, Any]
    position: Dict[str, float]

class Edge(BaseModel):
    id: str
    source: str
    target: str
    animated: bool = True

class MindMapResponse(BaseModel):
    nodes: List[Node]
    edges: List[Edge]
    title: str

# Study Plan Models
class StudyPlanRequest(BaseModel):
    topic: str
    weeks: int = 4
    hours_per_day: int = 2
    difficulty: str = "intermediate"

class WeekPlan(BaseModel):
    week: int
    title: str
    topics: List[str]
    daily_hours: int
    goals: List[str]

class StudyPlanResponse(BaseModel):
    topic: str
    total_weeks: int
    daily_hours: int
    difficulty: str
    weeks: List[WeekPlan]
    estimated_total_hours: int

# Chat Models
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    mode: str = "chat"

class ChatResponse(BaseModel):
    message: str
    mode: str

# ============================================================================
# TEMPLATES
# ============================================================================

ROADMAP_TEMPLATES = {
    "machine learning": {
        "prerequisites": ["Python Programming", "Linear Algebra & Calculus", "Statistics & Probability"],
        "foundations": ["Supervised Learning Algorithms", "Unsupervised Learning", "Model Evaluation Metrics"],
        "intermediate": ["Neural Networks Basics", "Deep Learning Fundamentals", "CNNs & RNNs"],
        "advanced": ["Transformer Architecture", "GANs & Autoencoders", "Reinforcement Learning"],
        "tools": ["TensorFlow/Keras", "PyTorch", "Scikit-learn & Pandas"],
        "projects": ["Image Classification System", "NLP Sentiment Analyzer", "Recommendation Engine"]
    },
    "default": {
        "prerequisites": ["Basic Understanding", "Required Tools Setup", "Foundational Knowledge"],
        "foundations": ["Core Concepts", "Fundamental Principles", "Basic Techniques"],
        "intermediate": ["Advanced Concepts", "Best Practices", "Common Patterns"],
        "advanced": ["Expert Techniques", "Optimization", "Real-world Applications"],
        "tools": ["Development Environment", "Essential Libraries", "Testing Tools"],
        "projects": ["Beginner Project", "Intermediate Project", "Advanced Project"]
    }
}

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def generate_ai_deepdive(topic: str) -> dict:
    """Use AI to generate detailed concept breakdown"""
    if not GOOGLE_API_KEY:
        print("No API key - using fallback")
        return {
            "types": ["Type 1", "Type 2", "Type 3"],
            "formulas": ["Formula 1", "Formula 2", "Formula 3"],
            "examples": ["Example 1", "Example 2", "Example 3"],
            "usecases": ["Use Case 1", "Use Case 2", "Use Case 3"],
            "comparisons": ["Comparison 1", "Comparison 2"],
            "bestpractices": ["Best Practice 1", "Best Practice 2"]
        }
    
    prompt = f"""You are an expert technical educator. Create a comprehensive deep-dive analysis of: "{topic}"

Provide detailed, specific information in these 6 categories:

1. types: List 3-5 SPECIFIC types/variations with their actual names
2. formulas: Provide actual mathematical formulas or technical definitions
3. examples: Give concrete code examples or practical demonstrations
4. usecases: Explain when and why to use each type
5. comparisons: Compare different approaches
6. bestpractices: Provide actionable advice

CRITICAL: Be extremely specific and technical. Use real names, actual formulas, concrete examples.
CRITICAL: Keep each item under 45 characters. Be extremely concise.

Return ONLY valid JSON (no markdown, no explanations):
{{
  "types": ["Type 1", "Type 2", "Type 3"],
  "formulas": ["Formula 1", "Formula 2", "Formula 3"],
  "examples": ["Example 1", "Example 2", "Example 3"],
  "usecases": ["Use case 1", "Use case 2", "Use case 3"],
  "comparisons": ["Comparison 1", "Comparison 2"],
  "bestpractices": ["Practice 1", "Practice 2", "Practice 3"]
}}"""

    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Clean markdown
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            parts = response_text.split("```")
            for part in parts:
                if "{" in part and "}" in part:
                    response_text = part
                    break
        
        response_text = response_text.strip()
        deepdive = json.loads(response_text)
        
        required_keys = ["types", "formulas", "examples", "usecases", "comparisons", "bestpractices"]
        if all(key in deepdive for key in required_keys):
            print(f"✓ Deep dive generated for: {topic}")
            return deepdive
        else:
            raise ValueError("Invalid structure")
            
    except Exception as e:
        print(f"Deep dive generation failed: {e}")
        return {
            "types": ["Type 1", "Type 2", "Type 3"],
            "formulas": ["Formula 1", "Formula 2", "Formula 3"],
            "examples": ["Example 1", "Example 2", "Example 3"],
            "usecases": ["Use Case 1", "Use Case 2", "Use Case 3"],
            "comparisons": ["Comparison 1", "Comparison 2"],
            "bestpractices": ["Practice 1", "Practice 2", "Practice 3"]
        }

def generate_ai_roadmap(topic: str) -> dict:
    """Use Google Gemini AI to generate a custom learning roadmap"""
    if not gemini_model:
        print("No API key - using fallback template")
        return ROADMAP_TEMPLATES.get("default")
    
    prompt = f"""Create a comprehensive learning roadmap for: "{topic}"

You are an expert curriculum designer. Generate a structured learning path with these 6 categories:

1. prerequisites: List 3-4 essential things learners must know BEFORE starting
2. foundations: List 3-4 core fundamental concepts to master FIRST
3. intermediate: List 3-4 intermediate level topics to learn NEXT
4. advanced: List 3-4 advanced/expert concepts for mastery
5. tools: List 3-4 essential tools, frameworks, or technologies
6. projects: List 3 hands-on projects (beginner, intermediate, advanced)

IMPORTANT: Return ONLY valid JSON (no markdown, no explanations):
{{
  "prerequisites": ["item1", "item2", "item3"],
  "foundations": ["item1", "item2", "item3"],
  "intermediate": ["item1", "item2", "item3"],
  "advanced": ["item1", "item2", "item3"],
  "tools": ["item1", "item2", "item3"],
  "projects": ["item1", "item2", "item3"]
}}

Be specific, practical, concise (max 50 characters per item)."""

    try:
        response = gemini_model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Clean markdown
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            parts = response_text.split("```")
            for part in parts:
                if "{" in part and "}" in part:
                    response_text = part
                    break
        
        response_text = response_text.strip()
        roadmap = json.loads(response_text)
        
        required_keys = ["prerequisites", "foundations", "intermediate", "advanced", "tools", "projects"]
        if all(key in roadmap for key in required_keys):
            print(f"✓ Successfully generated AI roadmap for: {topic}")
            return roadmap
        else:
            raise ValueError("Invalid structure")
            
    except Exception as e:
        print(f"AI roadmap generation failed: {e}")
        return ROADMAP_TEMPLATES.get("default")

def get_roadmap_data(topic: str):
    """Get roadmap data - try AI first, then templates"""
    topic_lower = topic.lower()
    for key in ROADMAP_TEMPLATES:
        if key in topic_lower and key != "default":
            print(f"Using cached template for: {key}")
            return ROADMAP_TEMPLATES[key]
    
    print(f"Generating AI roadmap for: {topic}")
    return generate_ai_roadmap(topic)

def create_hierarchical_tree(topic: str, data: dict, branch_configs: list, mode: str):
    """Create a top-down hierarchical tree layout"""
    nodes = []
    edges = []
    node_id = 1
    
    # Root node at top
    nodes.append({
        "id": str(node_id),
        "type": "input",
        "data": {"label": f"🔍 {topic}"},
        "position": {"x": 600, "y": 0}
    })
    root_id = str(node_id)
    node_id += 1
    
    # Calculate layout
    num_branches = len([k for k, _ in branch_configs if k in data])
    branch_width = 300
    total_width = num_branches * branch_width
    start_x = 600 - (total_width / 2) + (branch_width / 2)
    
    branch_index = 0
    
    for key, label in branch_configs:
        if key in data:
            branch_x = start_x + (branch_index * branch_width)
            branch_id = str(node_id)
            
            nodes.append({
                "id": branch_id,
                "type": "default",
                "data": {"label": label},
                "position": {"x": branch_x, "y": 150}
            })
            
            edges.append({
                "id": f"e{root_id}-{branch_id}",
                "source": root_id,
                "target": branch_id,
                "animated": True
            })
            node_id += 1
            
            items = data[key]
            for idx, item in enumerate(items):
                item_id = str(node_id)
                item_label = item if len(item) <= 45 else item[:42] + "..."
                item_y = 300 + (idx * 120)
                
                nodes.append({
                    "id": item_id,
                    "type": "default",
                    "data": {"label": f"• {item_label}"},
                    "position": {"x": branch_x, "y": item_y}
                })
                
                edges.append({
                    "id": f"e{branch_id}-{item_id}",
                    "source": branch_id,
                    "target": item_id,
                    "animated": True
                })
                
                node_id += 1
            
            branch_index += 1
    
    return MindMapResponse(
        nodes=nodes,
        edges=edges,
        title=f"Deep Dive Analysis: {topic}"
    )

def create_horizontal_roadmap(topic: str, data: dict, branch_configs: list, mode: str):
    """Create horizontal roadmap layout"""
    nodes = []
    edges = []
    node_id = 1
    
    nodes.append({
        "id": str(node_id),
        "type": "input",
        "data": {"label": f"🎯 {topic}"},
        "position": {"x": 500, "y": 0}
    })
    main_node_id = str(node_id)
    node_id += 1
    
    y_offset = 150
    branch_parent_ids = {}
    max_sub_y = y_offset
    
    for key, label, x_offset in branch_configs:
        if key in data:
            branch_id = str(node_id)
            nodes.append({
                "id": branch_id,
                "type": "default",
                "data": {"label": label},
                "position": {"x": 500 + x_offset, "y": y_offset}
            })
            branch_parent_ids[key] = branch_id
            
            edges.append({
                "id": f"e{main_node_id}-{branch_id}",
                "source": main_node_id,
                "target": branch_id,
                "animated": True
            })
            node_id += 1
            
            items = data[key]
            sub_y = y_offset + 150
            
            for idx, item in enumerate(items):
                item_id = str(node_id)
                row = idx // 2
                col = idx % 2
                sub_x_offset = x_offset + (col * 200) - 100
                sub_y_offset = sub_y + (row * 100)
                item_label = item if len(item) <= 50 else item[:47] + "..."
                
                nodes.append({
                    "id": item_id,
                    "type": "default",
                    "data": {"label": f"• {item_label}"},
                    "position": {"x": 500 + sub_x_offset, "y": sub_y_offset}
                })
                
                edges.append({
                    "id": f"e{branch_id}-{item_id}",
                    "source": branch_id,
                    "target": item_id,
                    "animated": True
                })
                
                node_id += 1
            
            max_sub_y = max(max_sub_y, sub_y + (len(items) // 2) * 100)
    
    mastery_id = str(node_id)
    nodes.append({
        "id": mastery_id,
        "type": "output",
        "data": {"label": "🏆 Master Level"},
        "position": {"x": 500, "y": max_sub_y + 200}
    })
    
    if "advanced" in branch_parent_ids:
        edges.append({
            "id": f"e{branch_parent_ids['advanced']}-{mastery_id}",
            "source": branch_parent_ids['advanced'],
            "target": mastery_id,
            "animated": True
        })
    if "projects" in branch_parent_ids:
        edges.append({
            "id": f"e{branch_parent_ids['projects']}-{mastery_id}",
            "source": branch_parent_ids['projects'],
            "target": mastery_id,
            "animated": True
        })
    
    return MindMapResponse(
        nodes=nodes,
        edges=edges,
        title=f"Complete Learning Roadmap: {topic}"
    )

# ============================================================================
# API ROUTES
# ============================================================================

@app.get("/")
async def root():
    ai_status = "enabled (Google Gemini)" if gemini_model else "disabled (no API key)"
    return {
        "message": "Visual AI Companion API",
        "version": "1.0.0",
        "status": "active",
        "ai_generation": ai_status
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/api/generate-mindmap", response_model=MindMapResponse)
async def generate_mindmap(request: MindMapRequest):
    """Generate AI-powered comprehensive roadmap or deep dive"""
    try:
        topic = request.topic
        mode = request.mode
        
        if mode == "deepdive":
            data = generate_ai_deepdive(topic)
            branch_configs = [
                ("types", "📋 Types & Variations"),
                ("formulas", "📐 Formulas & Definitions"),
                ("examples", "💡 Examples"),
                ("usecases", "🎯 Use Cases"),
                ("comparisons", "⚖️ Comparisons"),
                ("bestpractices", "✨ Best Practices")
            ]
            return create_hierarchical_tree(topic, data, branch_configs, mode)
        else:
            data = get_roadmap_data(topic)
            branch_configs = [
                ("prerequisites", "📚 Prerequisites", -400),
                ("foundations", "🏗️ Foundations", -200),
                ("intermediate", "🚀 Intermediate", 0),
                ("advanced", "⚡ Advanced", 200),
                ("tools", "🛠️ Tools & Tech", 400),
                ("projects", "💼 Projects", 600)
            ]
            return create_horizontal_roadmap(topic, data, branch_configs, mode)
        
    except Exception as e:
        print(f"Error in generate_mindmap: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-study-plan", response_model=StudyPlanResponse)
async def generate_study_plan(request: StudyPlanRequest):
    """Generate AI-powered study plan"""
    try:
        topic = request.topic
        num_weeks = request.weeks
        daily_hours = request.hours_per_day
        
        if not GOOGLE_API_KEY:
            weeks_data = [
                WeekPlan(
                    week=week,
                    title=f"Week {week}: {'Basics' if week <= 2 else 'Advanced'}",
                    topics=[f"Topic {i}" for i in range(1, 4)],
                    daily_hours=daily_hours,
                    goals=[f"Goal {i}" for i in range(1, 3)]
                ) for week in range(1, num_weeks + 1)
            ]
            
            return StudyPlanResponse(
                topic=topic,
                total_weeks=num_weeks,
                daily_hours=daily_hours,
                difficulty=request.difficulty,
                weeks=weeks_data,
                estimated_total_hours=num_weeks * 7 * daily_hours
            )
        
        prompt = f"""Create a detailed {num_weeks}-week study plan for: "{topic}"

Student details:
- Study time: {daily_hours} hours/day
- Difficulty level: {request.difficulty}

For each week, provide:
1. A descriptive title for that week
2. 3-4 specific topics to cover
3. 2-3 concrete learning goals

Return ONLY valid JSON:
{{
  "weeks": [
    {{
      "week": 1,
      "title": "Week title",
      "topics": ["Topic 1", "Topic 2", "Topic 3"],
      "goals": ["Goal 1", "Goal 2"]
    }}
  ]
}}

Be specific and progressive - each week should build on previous weeks."""

        model = genai.GenerativeModel('gemini-flash-latest')
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            parts = response_text.split("```")
            for part in parts:
                if "{" in part and "}" in part:
                    response_text = part
                    break
        
        response_text = response_text.strip()
        plan_data = json.loads(response_text)
        
        weeks_list = [
            WeekPlan(
                week=week_data.get("week", i+1),
                title=week_data.get("title", f"Week {i+1}"),
                topics=week_data.get("topics", []),
                daily_hours=daily_hours,
                goals=week_data.get("goals", [])
            ) for i, week_data in enumerate(plan_data.get("weeks", []))
        ]
        
        return StudyPlanResponse(
            topic=topic,
            total_weeks=num_weeks,
            daily_hours=daily_hours,
            difficulty=request.difficulty,
            weeks=weeks_list,
            estimated_total_hours=num_weeks * 7 * daily_hours
        )
        
    except Exception as e:
        print(f"Study plan generation failed: {e}")
        weeks_data = [
            WeekPlan(
                week=week,
                title=f"Week {week}: {'Foundation' if week <= 2 else 'Advanced Concepts'}",
                topics=[f"Core Topic {i}" for i in range(1, 4)],
                daily_hours=request.hours_per_day,
                goals=[f"Master skill {i}" for i in range(1, 3)]
            ) for week in range(1, request.weeks + 1)
        ]
        
        return StudyPlanResponse(
            topic=request.topic,
            total_weeks=request.weeks,
            daily_hours=request.hours_per_day,
            difficulty=request.difficulty,
            weeks=weeks_data,
            estimated_total_hours=request.weeks * 7 * request.hours_per_day
        )

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """AI-powered chat assistant for learning"""
    try:
        if not GOOGLE_API_KEY:
            return ChatResponse(
                message="AI chat is not available. Please configure API key.",
                mode=request.mode
            )
        
        user_message = request.messages[-1].content if request.messages else ""
        
        conversation = []
        for msg in request.messages[:-1]:
            conversation.append(f"{msg.role}: {msg.content}")
        
        conversation_context = "\n".join(conversation[-5:])
        
        if request.mode == "notes":
            system_prompt = """You are a study assistant that creates concise, well-structured notes.

When given a topic or text:
1. Extract key points
2. Organize in bullet points
3. Use clear, simple language
4. Highlight important terms
5. Keep it brief but comprehensive

Format your response with:
- Main headings with **bold**
- Bullet points for key concepts
- Brief explanations 
- Use plain text for formulas (avoid LaTeX $ symbols)"""

            prompt = f"{system_prompt}\n\nCreate study notes for:\n{user_message}"
            
        elif request.mode == "explain":
            system_prompt = """You are a patient tutor who explains complex concepts simply.

When explaining:
1. Start with a simple analogy
2. Break down into digestible parts
3. Use examples students can relate to
4. Avoid jargon or explain it clearly
5. Write formulas in plain text (e.g., "y = mx + b" instead of "$y = mx + b$")
6. Check understanding with a simple question at the end"""

            prompt = f"{system_prompt}\n\nExplain this concept:\n{user_message}"
            
        else:
            system_prompt = """You are a helpful study companion for students.

You help with:
- Answering questions clearly
- Explaining concepts
- Study tips and motivation
- Breaking down complex topics
- Providing examples

Be friendly, encouraging, and concise. Keep responses focused and helpful."""

            if conversation_context:
                prompt = f"{system_prompt}\n\nConversation so far:\n{conversation_context}\n\nStudent: {user_message}\n\nYour response:"
            else:
                prompt = f"{system_prompt}\n\nStudent: {user_message}\n\nYour response:"
        
        model = genai.GenerativeModel('gemini-flash-latest')
        response = model.generate_content(prompt)
        
        response_text = response.text.strip()
        
        return ChatResponse(
            message=response_text,
            mode=request.mode
        )
        
    except Exception as e:
        print(f"Chat error: {e}")
        return ChatResponse(
            message="Sorry, I encountered an error. Please try again.",
            mode=request.mode
        )

@app.post("/api/start-focus")
async def start_focus(task: str, minutes: int = 25):
    """Start a focus session"""
    return {
        "sessionId": f"session_{task.replace(' ', '_')}",
        "task": task,
        "minutes": minutes,
        "status": "active"
    }

@app.get("/api/growth/{user_id}")
async def get_growth(user_id: str):
    """Get user growth stats"""
    return {
        "userId": user_id,
        "level": 5,
        "streakDays": 12,
        "totalMinutes": 1250,
        "treeStage": "sprouting"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)