from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class League(Base):
    __tablename__ = "leagues"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    image_base64 = Column(String, nullable=True)
    
    teams = relationship("Team", back_populates="league", cascade="all, delete-orphan")

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    image_base64 = Column(String, nullable=True)
    league_id = Column(Integer, ForeignKey("leagues.id"))
    
    league = relationship("League", back_populates="teams")
    jerseys = relationship("Jersey", back_populates="team", cascade="all, delete-orphan")

class JerseyType(Base):
    __tablename__ = "jersey_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True) # e.g., "Fã", "Jogador"
    original_price = Column(Float)
    current_price = Column(Float)
    description = Column(String, nullable=True)
    
    jerseys = relationship("Jersey", back_populates="jersey_type")

class Jersey(Base):
    __tablename__ = "jerseys"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"))
    season = Column(String)
    main_color = Column(String)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    jersey_type_id = Column(Integer, ForeignKey("jersey_types.id"))
    jersey_type = relationship("JerseyType", back_populates="jerseys")
    
    team = relationship("Team", back_populates="jerseys")
    images = relationship("JerseyImage", back_populates="jersey", cascade="all, delete-orphan")

    @property
    def team_name(self):
        return self.team.name if self.team else None

class JerseyImage(Base):
    __tablename__ = "jersey_images"

    id = Column(Integer, primary_key=True, index=True)
    jersey_id = Column(Integer, ForeignKey("jerseys.id"))
    image_base64 = Column(String)
    is_main = Column(Boolean, default=False)
    
    jersey = relationship("Jersey", back_populates="images")
