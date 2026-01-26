from database import engine, Base
from src.Models.Catalog import League, Team, Jersey, JerseyImage

def create_tables():
    print("Creating catalog tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")

if __name__ == "__main__":
    create_tables()
