from database import engine
from sqlalchemy import text

def add_reset_columns():
    with engine.connect() as connection:
        try:
            connection.execute(text("ALTER TABLE users ADD COLUMN reset_token VARCHAR"))
            connection.execute(text("ALTER TABLE users ADD COLUMN reset_token_expires TIMESTAMP"))
            connection.commit()
            print("Successfully added reset token columns.")
        except Exception as e:
            print(f"Error (columns might already exist): {e}")

if __name__ == "__main__":
    add_reset_columns()
