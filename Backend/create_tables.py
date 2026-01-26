from database import engine, Base
from src.Models.User import User
from src.Models.Address import Address
from src.Models.UserImage import UserImage

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully.")
