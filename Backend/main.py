from fastapi import FastAPI
from database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="FanatikJersey API")

@app.get("/")
def read_root():
    return {"message": "Welcome to FanatikJersey API"}

if __name__ == "__main__":
    import uvicorn
    import os
    
    port = int(os.getenv("PORT", 9000))
    uvicorn.run("main:app", host="127.0.0.1", port=port, reload=True)
