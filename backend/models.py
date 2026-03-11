"""
Pydantic models for Blindspot — all data structures used across the app.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class AgentType(str, Enum):
    SCOUT = "scout"
    VOC = "voc"
    JOBS = "jobs"
    ANALYZER = "analyzer"
    COORDINATOR = "coordinator"


class EvidenceSource(BaseModel):
    title: str
    url: str
    snippet: str


class TriangulationSignal(BaseModel):
    source: str  # "scout", "voc", "jobs"
    strength: float = Field(ge=0, le=1)  # 0-1
    label: str  # "Strong signal", "Moderate signal", "Weak signal"
    detail: str  # "0/14 competitors", "47 complaints", etc.


class GapCard(BaseModel):
    id: int
    title: str
    description: str
    confidence: float = Field(ge=0, le=10)
    opportunity_size: str  # "Small", "Medium", "Large"
    evidence: List[EvidenceSource] = []
    triangulation: List[TriangulationSignal] = []
    risk_flags: List[str] = []


class AgentResult(BaseModel):
    agent: str
    success: bool
    data: dict = {}
    error: Optional[str] = None


class StatsData(BaseModel):
    searches: int = 0
    scrapes: int = 0
    agents: int = 0
    duration_seconds: float = 0


class AnalyzeRequest(BaseModel):
    query: str


class AnalysisResponse(BaseModel):
    gaps: List[GapCard] = []
    stats: StatsData = StatsData()
    market_summary: str = ""
    companies_found: int = 0
    complaints_found: int = 0
    jobs_analyzed: int = 0
