from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Visual AI Companion API", version="1.0.0")

# CORS - Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class MindMapRequest(BaseModel):
    topic: str
    depth: str = "medium"

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

# Routes
@app.get("/")
async def root():
    return {
        "message": "Visual AI Companion API",
        "version": "1.0.0",
        "status": "active"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/api/generate-mindmap", response_model=MindMapResponse)
async def generate_mindmap(request: MindMapRequest):
    """Generate AI-powered mind map"""
    try:
        # For now, return a template structure
        # We'll add real AI generation next
        
        topic = request.topic
        
        # Generate nodes with smart positioning
        nodes = [
            {
                "id": "1",
                "type": "input",
                "data": {"label": f"📚 {topic}"},
                "position": {"x": 400, "y": 0}
            },
            {
                "id": "2",
                "type": "default",
                "data": {"label": "🎯 Core Concepts"},
                "position": {"x": 200, "y": 120}
            },
            {
                "id": "3",
                "type": "default",
                "data": {"label": "💡 Key Principles"},
                "position": {"x": 600, "y": 120}
            },
            {
                "id": "4",
                "type": "default",
                "data": {"label": "🔬 Applications"},
                "position": {"x": 100, "y": 240}
            },
            {
                "id": "5",
                "type": "default",
                "data": {"label": "📖 Resources"},
                "position": {"x": 400, "y": 240}
            },
            {
                "id": "6",
                "type": "default",
                "data": {"label": "🚀 Practice Projects"},
                "position": {"x": 700, "y": 240}
            },
            {
                "id": "7",
                "type": "output",
                "data": {"label": "🏆 Mastery"},
                "position": {"x": 400, "y": 360}
            }
        ]
        
        # Connect nodes
        edges = [
            {"id": "e1-2", "source": "1", "target": "2", "animated": True},
            {"id": "e1-3", "source": "1", "target": "3", "animated": True},
            {"id": "e2-4", "source": "2", "target": "4", "animated": True},
            {"id": "e2-5", "source": "2", "target": "5", "animated": True},
            {"id": "e3-5", "source": "3", "target": "5", "animated": True},
            {"id": "e3-6", "source": "3", "target": "6", "animated": True},
            {"id": "e4-7", "source": "4", "target": "7", "animated": True},
            {"id": "e5-7", "source": "5", "target": "7", "animated": True},
            {"id": "e6-7", "source": "6", "target": "7", "animated": True}
        ]
        
        return MindMapResponse(
            nodes=nodes,
            edges=edges,
            title=f"Learning Map: {topic}"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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