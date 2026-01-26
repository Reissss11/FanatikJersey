from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- League Schemas ---
class LeagueBase(BaseModel):
    name: str

class LeagueCreate(LeagueBase):
    image_base64: Optional[str] = None

class LeagueResponse(LeagueBase):
    id: int
    image_base64: Optional[str] = None

    class Config:
        from_attributes = True

# --- Team Schemas ---
class TeamBase(BaseModel):
    name: str
    league_id: int

class TeamCreate(TeamBase):
    image_base64: Optional[str] = None

class TeamResponse(TeamBase):
    id: int
    image_base64: Optional[str] = None
    league_name: Optional[str] = None # Optional convenience field

    class Config:
        from_attributes = True

# --- Jersey Type Schemas ---
class JerseyTypeBase(BaseModel):
    name: str
    original_price: float
    current_price: float
    description: Optional[str] = None

class JerseyTypeCreate(JerseyTypeBase):
    pass

class JerseyTypeResponse(JerseyTypeBase):
    id: int
    
    class Config:
        from_attributes = True

# --- Jersey Schemas ---
class JerseyImageBase(BaseModel):
    image_base64: str
    is_main: bool = False

class JerseyImageResponse(JerseyImageBase):
    id: int
    jersey_id: int
    
    class Config:
        from_attributes = True

class JerseyBase(BaseModel):
    team_id: int
    season: str
    jersey_type_id: int
    main_color: str
    description: Optional[str] = None

class JerseyCreate(JerseyBase):
    images: List[JerseyImageBase] = []

class JerseyResponse(JerseyBase):
    id: int
    created_at: datetime
    images: List[JerseyImageResponse] = []
    team_name: Optional[str] = None 
    jersey_type: Optional[JerseyTypeResponse] = None
    
    class Config:
        from_attributes = True

class PaginatedJerseyResponse(BaseModel):
    data: List[JerseyResponse]
    total: int
    page: int
    total_pages: int

