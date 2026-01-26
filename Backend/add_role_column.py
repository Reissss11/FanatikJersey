from database import engine
from sqlalchemy import text

def add_role_column():
    with engine.connect() as connection:
        try:
            # Check if column exists is hard in generic SQL without inspecting, 
            # but we can just try to add it and ignore error if it exists or check for specific error.
            # However, for SQLite/Postgres 'ALTER TABLE' is standard.
            # Let's try to add it.
            
            # Using text() for execution
            # Note: For SQLite, adding column with default is supported.
            connection.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'user'"))
            connection.commit()
            print("Successfully added 'role' column.")
        except Exception as e:
            print(f"Error (column might already exist): {e}")

if __name__ == "__main__":
    add_role_column()
