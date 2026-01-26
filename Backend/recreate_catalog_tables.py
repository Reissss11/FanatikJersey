from database import engine, Base
from src.Models.Catalog import League, Team, Jersey, JerseyImage, JerseyType

def recreate_tables():
    print("Dropping catalog tables...")
    # Order matters due to foreign keys
    JerseyImage.__table__.drop(engine, checkfirst=True)
    Jersey.__table__.drop(engine, checkfirst=True)
    JerseyType.__table__.drop(engine, checkfirst=True)
    Team.__table__.drop(engine, checkfirst=True)
    League.__table__.drop(engine, checkfirst=True)
    
    print("Recreating tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")

if __name__ == "__main__":
    recreate_tables()
