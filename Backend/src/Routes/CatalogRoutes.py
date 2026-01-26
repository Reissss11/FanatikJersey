from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from src.Models.User import User
from src.Dependencies import get_current_user
from src.Schemas.CatalogSchema import (
    LeagueCreate, LeagueResponse, 
    TeamCreate, TeamResponse,
    JerseyCreate, JerseyResponse,
    JerseyTypeCreate, JerseyTypeResponse,
    PaginatedJerseyResponse
)
from src.Controllers.CatalogController import (
    create_league, get_leagues, delete_league,
    create_team, get_teams, delete_team,
    create_jersey, get_jerseys, delete_jersey, get_jersey_by_id, update_jersey,
    create_jersey_type, get_jersey_types, update_jersey_type, delete_jersey_type
)

router = APIRouter()

# Dependency to check for Admin role
def get_current_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores.")
    return current_user

# --- Jersey Types (Pricing) ---
@router.post("/types", response_model=JerseyTypeResponse)
def add_type(type_data: JerseyTypeCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return create_jersey_type(db, type_data)

@router.get("/types", response_model=List[JerseyTypeResponse])
def list_types(db: Session = Depends(get_db)):
    return get_jersey_types(db)

@router.put("/types/{type_id}", response_model=JerseyTypeResponse)
def modify_type(type_id: int, type_data: JerseyTypeCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return update_jersey_type(db, type_id, type_data)

@router.delete("/types/{type_id}")
def remove_type(type_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return delete_jersey_type(db, type_id)

# --- Leagues ---
@router.post("/leagues", response_model=LeagueResponse)
def add_league(league: LeagueCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return create_league(db, league)

@router.get("/leagues", response_model=List[LeagueResponse])
def list_leagues(db: Session = Depends(get_db)):
    return get_leagues(db)

@router.delete("/leagues/{league_id}")
def remove_league(league_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return delete_league(db, league_id)

# --- Teams ---
@router.post("/teams", response_model=TeamResponse)
def add_team(team: TeamCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return create_team(db, team)

@router.get("/teams", response_model=List[TeamResponse])
def list_teams(league_id: int = None, db: Session = Depends(get_db)):
    return get_teams(db, league_id)

@router.delete("/teams/{team_id}")
def remove_team(team_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return delete_team(db, team_id)

# --- Jerseys ---
@router.post("/jerseys", response_model=JerseyResponse)
def add_jersey(jersey: JerseyCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return create_jersey(db, jersey)

@router.get("/jerseys", response_model=PaginatedJerseyResponse)
def list_jerseys(
    team_id: int = None, 
    league_id: int = None,
    jersey_type_id: int = None,
    main_color: str = None,
    page: int = 1,
    limit: int = 20, 
    sort_by: str = None, 
    search: str = None, 
    db: Session = Depends(get_db)
):
    return get_jerseys(db, team_id, league_id, jersey_type_id, main_color, page, limit, sort_by, search)

@router.get("/jerseys/{jersey_id}", response_model=JerseyResponse)
def read_jersey(jersey_id: int, db: Session = Depends(get_db)):
    return get_jersey_by_id(db, jersey_id)

@router.put("/jerseys/{jersey_id}", response_model=JerseyResponse)
def modify_jersey(jersey_id: int, jersey: JerseyCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return update_jersey(db, jersey_id, jersey)

@router.delete("/jerseys/{jersey_id}")
def remove_jersey(jersey_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return delete_jersey(db, jersey_id)
