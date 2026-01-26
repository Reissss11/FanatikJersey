from database import engine
from sqlalchemy import text

def fix_null_roles():
    with engine.connect() as connection:
        try:
            # Update null roles to 'user'
            connection.execute(text("UPDATE users SET role='user' WHERE role IS NULL"))
            connection.commit()
            print("Successfully updated NULL roles to 'user'.")
        except Exception as e:
            print(f"Error updating roles: {e}")

if __name__ == "__main__":
    fix_null_roles()
