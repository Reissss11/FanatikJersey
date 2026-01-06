from fastapi import FastAPI
from database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="FanatikJersey API")

@app.get("/")
def read_root():
    return {"message": "Welcome to FanatikJersey API"}
