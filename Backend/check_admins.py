from database import engine
from sqlalchemy import text

def list_admins():
    with engine.connect() as connection:
        try:
            result = connection.execute(text("SELECT username, email, role FROM users WHERE role = 'admin'"))
            admins = result.fetchall()
            if not admins:
                print("No admins found in the database!")
            else:
                print("Admins found:")
                for admin in admins:
                    print(f"- {admin[0]} ({admin[1]})")
        except Exception as e:
            print(f"Error checking admins: {e}")

if __name__ == "__main__":
    list_admins()
