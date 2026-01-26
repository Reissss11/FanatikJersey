from sqlalchemy.orm import Session, joinedload
from src.Models.Catalog import League, Team, Jersey, JerseyImage
from src.Schemas.CatalogSchema import LeagueCreate, TeamCreate, JerseyCreate
from fastapi import HTTPException, status

# --- Leagues ---
def create_league(db: Session, league: LeagueCreate):
    db_league = League(name=league.name, image_base64=league.image_base64)
    db.add(db_league)
    db.commit()
    db.refresh(db_league)
    return db_league

def get_leagues(db: Session):
    return db.query(League).all()

def delete_league(db: Session, league_id: int):
    league = db.query(League).filter(League.id == league_id).first()
    if not league:
        raise HTTPException(status_code=404, detail="Liga não encontrada")
    db.delete(league)
    db.commit()
    return {"message": "Liga eliminada com sucesso"}

# --- Teams ---
def create_team(db: Session, team: TeamCreate):
    # Verify league exists
    league = db.query(League).filter(League.id == team.league_id).first()
    if not league:
        raise HTTPException(status_code=404, detail="Liga não encontrada")

    db_team = Team(name=team.name, league_id=team.league_id, image_base64=team.image_base64)
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team

def get_teams(db: Session, league_id: int = None):
    query = db.query(Team)
    if league_id:
        query = query.filter(Team.league_id == league_id)
    return query.all()

def delete_team(db: Session, team_id: int):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Clube não encontrado")
    db.delete(team)
    db.commit()
    return {"message": "Clube eliminado com sucesso"}

# --- Jersey Types ---
from src.Models.Catalog import JerseyType
from src.Schemas.CatalogSchema import JerseyTypeCreate

def create_jersey_type(db: Session, type_data: JerseyTypeCreate):
    db_type = JerseyType(
        name=type_data.name,
        original_price=type_data.original_price,
        current_price=type_data.current_price,
        description=type_data.description
    )
    db.add(db_type)
    db.commit()
    db.refresh(db_type)
    return db_type

def get_jersey_types(db: Session):
    return db.query(JerseyType).all()

def update_jersey_type(db: Session, type_id: int, type_data: JerseyTypeCreate):
    db_type = db.query(JerseyType).filter(JerseyType.id == type_id).first()
    if not db_type:
        raise HTTPException(status_code=404, detail="Tipo de camisola não encontrado")
    
    db_type.name = type_data.name
    db_type.original_price = type_data.original_price
    db_type.current_price = type_data.current_price
    db_type.description = type_data.description
    
    db.commit()
    db.refresh(db_type)
    return db_type

def delete_jersey_type(db: Session, type_id: int):
    # Check if used? SQLAlchemy relationship might default set to null or cascade depending on setup.
    # Current setup doesn't specify cascade on FK side, but backref has. 
    # Safest is to prevent delete if used, or cascade delete jerseys.
    # Let's simple delete for now.
    db_type = db.query(JerseyType).filter(JerseyType.id == type_id).first()
    if not db_type:
        raise HTTPException(status_code=404, detail="Tipo não encontrado")
    db.delete(db_type)
    db.commit()
    return {"message": "Tipo eliminado"}

# --- Jerseys ---
def create_jersey(db: Session, jersey: JerseyCreate):
    # Verify team exists
    team = db.query(Team).filter(Team.id == jersey.team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Clube não encontrado")
    
    # Verify type exists
    j_type = db.query(JerseyType).filter(JerseyType.id == jersey.jersey_type_id).first()
    if not j_type:
         raise HTTPException(status_code=404, detail="Tipo de camisola inválido")

    # Create Jersey
    db_jersey = Jersey(
        team_id=jersey.team_id,
        season=jersey.season,
        jersey_type_id=jersey.jersey_type_id,
        main_color=jersey.main_color,
        description=jersey.description
    )
    db.add(db_jersey)
    db.commit()
    db.refresh(db_jersey)
    
    # Add Images
    for img in jersey.images:
        db_image = JerseyImage(
            jersey_id=db_jersey.id,
            image_base64=img.image_base64,
            is_main=img.is_main
        )
        db.add(db_image)
    
    db.commit()
    db.refresh(db_jersey)
    return db_jersey

from sqlalchemy.orm import Session, joinedload

# ... (imports)

def get_jerseys(db: Session, team_id: int = None, league_id: int = None, jersey_type_id: int = None, main_color: str = None, page: int = 1, limit: int = 20, sort_by: str = None, search: str = None):
    # Eager load relations
    query = db.query(Jersey).options(
        joinedload(Jersey.team),
        joinedload(Jersey.jersey_type),
        joinedload(Jersey.images)
    )
    
    # --- Filtering Logic ---
    
    # Search
    if search:
        search_term = f"%{search}%"
        query = query.join(Jersey.team).join(Jersey.jersey_type).filter(
            (Team.name.ilike(search_term)) | 
            (Jersey.description.ilike(search_term)) |
            (Jersey.season.ilike(search_term))
        )
    
    # Filters
    if team_id:
        query = query.filter(Jersey.team_id == team_id)
        
    if league_id:
        # Avoid duplicate join if search already joined Team
        # Though specialized logic is cleaner: just join if checks pass or exception handle?
        # Safest: if search is present, we already joined Team. If not, we might need to join.
        # But `joinedload` doesn't help with `filter`.
        # SQLAlchemy is usually smart about reducing duplicate joins on same path to aliases.
        # Let's explicitly join only if needed? Or simpler: Just join Team if not joined.
        # Actually simplest: Join Team always? No.
        # Let's rely on standard .join behavior.
        # If 'search' happened, we did `.join(Jersey.team)`.
        # If we do it again, it might fail or duplicate.
        # To be safe: checks. 
        # But actually, filter on `Team.league_id` implicitly requires `Team` in FROM clauses.
        # If we didn't search, we must join.
        if not search:
            query = query.join(Jersey.team)
        query = query.filter(Team.league_id == league_id)

    if jersey_type_id:
        query = query.filter(Jersey.jersey_type_id == jersey_type_id)

    if main_color:
        query = query.filter(Jersey.main_color == main_color)
    
    # --- Sorting ---
    if sort_by == 'newest':
        query = query.order_by(Jersey.created_at.desc())
    elif sort_by == 'price_asc':
        if not search: 
             query = query.join(Jersey.jersey_type)
        query = query.order_by(JerseyType.current_price.asc())
    elif sort_by == 'price_desc':
        if not search:
            query = query.join(Jersey.jersey_type)
        query = query.order_by(JerseyType.current_price.desc())
    
    # --- Pagination ---
    # Total count (before limit/offset)
    total_count = query.count()
    
    # Apply Limit/Offset
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)
    
    data = query.all()
    
    # Calculate total pages
    import math
    total_pages = math.ceil(total_count / limit) if limit > 0 else 1
    
    return {
        "data": data,
        "total": total_count,
        "page": page,
        "total_pages": total_pages
    }

def get_jersey_by_id(db: Session, jersey_id: int):
    jersey = db.query(Jersey).filter(Jersey.id == jersey_id).first()
    if not jersey:
        raise HTTPException(status_code=404, detail="Camisola não encontrada")
    return jersey

def update_jersey(db: Session, jersey_id: int, jersey_data: JerseyCreate):
    db_jersey = db.query(Jersey).filter(Jersey.id == jersey_id).first()
    if not db_jersey:
        raise HTTPException(status_code=404, detail="Camisola não encontrada")
    
    # Update Fields
    if jersey_data.team_id:
        db_jersey.team_id = jersey_data.team_id
    if jersey_data.season:
        db_jersey.season = jersey_data.season
    if jersey_data.jersey_type_id:
        db_jersey.jersey_type_id = jersey_data.jersey_type_id
    if jersey_data.main_color:
        db_jersey.main_color = jersey_data.main_color
    
    # Description is optional, so we update it directly (it can be None)
    db_jersey.description = jersey_data.description

    # Handle Images:
    # If images are provided, we replace/update. 
    # For simplicity in this iteration: If images list is provided and not empty, 
    # we wipe existing and add new. If empty/not provided, we keep existing?
    # The frontend usually sends the full state.
    # Let's assume full replacement of images if provided
    if jersey_data.images:
        # Delete old
        db.query(JerseyImage).filter(JerseyImage.jersey_id == jersey_id).delete()
        
        # Add new
        for img in jersey_data.images:
            db_image = JerseyImage(
                jersey_id=db_jersey.id,
                image_base64=img.image_base64,
                is_main=img.is_main
            )
            db.add(db_image)

    db.commit()
    db.refresh(db_jersey)
    return db_jersey

def delete_jersey(db: Session, jersey_id: int):
    jersey = db.query(Jersey).filter(Jersey.id == jersey_id).first()
    if not jersey:
        raise HTTPException(status_code=404, detail="Camisola não encontrada")
    db.delete(jersey)
    db.commit()
    return {"message": "Camisola eliminada com sucesso"}
