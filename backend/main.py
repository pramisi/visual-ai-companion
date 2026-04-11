from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import os
from dotenv import load_dotenv
from groq import Groq
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

# Initialize Groq
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# ============================================================================
# MODELS
# ============================================================================

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
# TEMPLATES (fallback when no API key)
# ============================================================================

ROADMAP_TEMPLATES = {
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
# HELPER - Groq API call
# ============================================================================

def groq_chat(prompt: str, system: str = "You are a helpful assistant. Return only valid JSON.") -> str:
    """Call Groq API and return response text"""
    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=2000,
    )
    return response.choices[0].message.content.strip()

def clean_json_response(text: str) -> str:
    """Strip markdown code fences from JSON response"""
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0]
    elif "```" in text:
        parts = text.split("```")
        for part in parts:
            if "{" in part and "}" in part:
                return part.strip()
    return text.strip()

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def generate_ai_deepdive(topic: str) -> dict:
    if not groq_client:
        return {
            "types": ["Type 1", "Type 2", "Type 3"],
            "formulas": ["Formula 1", "Formula 2", "Formula 3"],
            "examples": ["Example 1", "Example 2", "Example 3"],
            "usecases": ["Use Case 1", "Use Case 2", "Use Case 3"],
            "comparisons": ["Comparison 1", "Comparison 2"],
            "bestpractices": ["Best Practice 1", "Best Practice 2"]
        }

    prompt = f"""Create a comprehensive deep-dive analysis of: "{topic}"

Return ONLY valid JSON with these exact keys (no markdown, no extra text):
{{
  "types": ["specific type 1", "specific type 2", "specific type 3"],
  "formulas": ["formula or definition 1", "formula 2", "formula 3"],
  "examples": ["concrete example 1", "example 2", "example 3"],
  "usecases": ["use case 1", "use case 2", "use case 3"],
  "comparisons": ["comparison 1", "comparison 2"],
  "bestpractices": ["practice 1", "practice 2", "practice 3"]
}}

Keep each item under 45 characters. Be specific and technical."""

    try:
        text = groq_chat(prompt)
        text = clean_json_response(text)
        result = json.loads(text)
        required_keys = ["types", "formulas", "examples", "usecases", "comparisons", "bestpractices"]
        if all(k in result for k in required_keys):
            return result
        raise ValueError("Missing keys")
    except Exception as e:
        print(f"Deep dive failed: {e}")
        return {
            "types": ["Type 1", "Type 2", "Type 3"],
            "formulas": ["Formula 1", "Formula 2", "Formula 3"],
            "examples": ["Example 1", "Example 2", "Example 3"],
            "usecases": ["Use Case 1", "Use Case 2", "Use Case 3"],
            "comparisons": ["Comparison 1", "Comparison 2"],
            "bestpractices": ["Practice 1", "Practice 2", "Practice 3"]
        }

def generate_ai_roadmap(topic: str) -> dict:
    if not groq_client:
        return ROADMAP_TEMPLATES["default"]

    prompt = f"""Create a learning roadmap for: "{topic}"

Return ONLY valid JSON (no markdown, no extra text):
{{
  "prerequisites": ["item1", "item2", "item3"],
  "foundations": ["item1", "item2", "item3"],
  "intermediate": ["item1", "item2", "item3"],
  "advanced": ["item1", "item2", "item3"],
  "tools": ["item1", "item2", "item3"],
  "projects": ["beginner project", "intermediate project", "advanced project"]
}}

Max 50 characters per item. Be specific and practical."""

    try:
        text = groq_chat(prompt)
        text = clean_json_response(text)
        result = json.loads(text)
        required_keys = ["prerequisites", "foundations", "intermediate", "advanced", "tools", "projects"]
        if all(k in result for k in required_keys):
            print(f"✓ Roadmap generated for: {topic}")
            return result
        raise ValueError("Missing keys")
    except Exception as e:
        print(f"AI roadmap failed: {e}")
        return ROADMAP_TEMPLATES["default"]

def get_roadmap_data(topic: str):
    topic_lower = topic.lower()
    for key in ROADMAP_TEMPLATES:
        if key in topic_lower and key != "default":
            return ROADMAP_TEMPLATES[key]
    return generate_ai_roadmap(topic)

# ============================================================================
# LAYOUT BUILDERS
# ============================================================================

def create_hierarchical_tree(topic: str, data: dict, branch_configs: list, mode: str):
    nodes = []
    edges = []
    node_id = 1

    nodes.append({
        "id": str(node_id),
        "type": "input",
        "data": {"label": f"🔍 {topic}"},
        "position": {"x": 600, "y": 0}
    })
    root_id = str(node_id)
    node_id += 1

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

            for idx, item in enumerate(data[key]):
                item_id = str(node_id)
                item_label = item if len(item) <= 45 else item[:42] + "..."
                nodes.append({
                    "id": item_id,
                    "type": "default",
                    "data": {"label": f"• {item_label}"},
                    "position": {"x": branch_x, "y": 300 + (idx * 120)}
                })
                edges.append({
                    "id": f"e{branch_id}-{item_id}",
                    "source": branch_id,
                    "target": item_id,
                    "animated": True
                })
                node_id += 1

            branch_index += 1

    return MindMapResponse(nodes=nodes, edges=edges, title=f"Deep Dive: {topic}")

def create_horizontal_roadmap(topic: str, data: dict, branch_configs: list, mode: str):
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

            sub_y = y_offset + 150
            for idx, item in enumerate(data[key]):
                item_id = str(node_id)
                row = idx // 2
                col = idx % 2
                item_label = item if len(item) <= 50 else item[:47] + "..."
                nodes.append({
                    "id": item_id,
                    "type": "default",
                    "data": {"label": f"• {item_label}"},
                    "position": {"x": 500 + x_offset + (col * 200) - 100, "y": sub_y + (row * 100)}
                })
                edges.append({
                    "id": f"e{branch_id}-{item_id}",
                    "source": branch_id,
                    "target": item_id,
                    "animated": True
                })
                node_id += 1

            max_sub_y = max(max_sub_y, sub_y + (len(data[key]) // 2) * 100)

    mastery_id = str(node_id)
    nodes.append({
        "id": mastery_id,
        "type": "output",
        "data": {"label": "🏆 Master Level"},
        "position": {"x": 500, "y": max_sub_y + 200}
    })
    for key in ["advanced", "projects"]:
        if key in branch_parent_ids:
            edges.append({
                "id": f"e{branch_parent_ids[key]}-{mastery_id}",
                "source": branch_parent_ids[key],
                "target": mastery_id,
                "animated": True
            })

    return MindMapResponse(nodes=nodes, edges=edges, title=f"Learning Roadmap: {topic}")

# ============================================================================
# API ROUTES
# ============================================================================

@app.get("/")
async def root():
    return {
        "message": "Visual AI Companion API",
        "version": "1.0.0",
        "status": "active",
        "ai": "Groq (llama-3.1-8b-instant)" if groq_client else "disabled"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/api/generate-mindmap", response_model=MindMapResponse)
async def generate_mindmap(request: MindMapRequest):
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
    try:
        topic = request.topic
        num_weeks = request.weeks
        daily_hours = request.hours_per_day

        if not groq_client:
            weeks_data = [
                WeekPlan(
                    week=w, title=f"Week {w}",
                    topics=[f"Topic {i}" for i in range(1, 4)],
                    daily_hours=daily_hours,
                    goals=[f"Goal {i}" for i in range(1, 3)]
                ) for w in range(1, num_weeks + 1)
            ]
            return StudyPlanResponse(
                topic=topic, total_weeks=num_weeks, daily_hours=daily_hours,
                difficulty=request.difficulty, weeks=weeks_data,
                estimated_total_hours=num_weeks * 7 * daily_hours
            )

        prompt = f"""Create a {num_weeks}-week study plan for: "{topic}"
Hours per day: {daily_hours}, Difficulty: {request.difficulty}

Return ONLY valid JSON (no markdown):
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

Each week must build on the previous. Be specific."""

        text = groq_chat(prompt)
        text = clean_json_response(text)
        plan_data = json.loads(text)

        weeks_list = [
            WeekPlan(
                week=w.get("week", i+1),
                title=w.get("title", f"Week {i+1}"),
                topics=w.get("topics", []),
                daily_hours=daily_hours,
                goals=w.get("goals", [])
            ) for i, w in enumerate(plan_data.get("weeks", []))
        ]

        return StudyPlanResponse(
            topic=topic, total_weeks=num_weeks, daily_hours=daily_hours,
            difficulty=request.difficulty, weeks=weeks_list,
            estimated_total_hours=num_weeks * 7 * daily_hours
        )

    except Exception as e:
        print(f"Study plan failed: {e}")
        weeks_data = [
            WeekPlan(
                week=w, title=f"Week {w}",
                topics=[f"Core Topic {i}" for i in range(1, 4)],
                daily_hours=request.hours_per_day,
                goals=[f"Master skill {i}" for i in range(1, 3)]
            ) for w in range(1, request.weeks + 1)
        ]
        return StudyPlanResponse(
            topic=request.topic, total_weeks=request.weeks,
            daily_hours=request.hours_per_day, difficulty=request.difficulty,
            weeks=weeks_data,
            estimated_total_hours=request.weeks * 7 * request.hours_per_day
        )

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        if not groq_client:
            return ChatResponse(
                message="AI chat is not available. Please add GROQ_API_KEY to your .env file.",
                mode=request.mode
            )

        user_message = request.messages[-1].content if request.messages else ""

        if request.mode == "notes":
            system = """You are a study assistant that creates concise, well-structured notes.
Extract key points, organize in bullet points, use clear language, highlight important terms.
Format with **bold** headings and bullet points."""

        elif request.mode == "explain":
            system = """You are a patient tutor who explains complex concepts simply.
Start with a simple analogy, break into digestible parts, use relatable examples.
End with a simple comprehension question."""

        else:
            system = """You are a helpful, friendly study companion for students.
Answer questions clearly, explain concepts, provide examples, give study tips.
Be concise and encouraging."""

        # Build conversation history (last 5 messages)
        messages = [{"role": "system", "content": system}]
        for msg in request.messages[-6:-1]:
            messages.append({
                "role": msg.role if msg.role in ["user", "assistant"] else "user",
                "content": msg.content
            })
        messages.append({"role": "user", "content": user_message})

        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.7,
            max_tokens=1000,
        )

        return ChatResponse(
            message=response.choices[0].message.content.strip(),
            mode=request.mode
        )

    except Exception as e:
        print(f"Chat error: {e}")
        return ChatResponse(
            message="Sorry, I encountered an error. Please try again.",
            mode=request.mode
        )

@app.get("/api/growth/{user_id}")
async def get_growth(user_id: str):
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
