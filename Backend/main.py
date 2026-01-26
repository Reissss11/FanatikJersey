from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from src.Models.User import User
from src.Models.Catalog import Jersey # Ensure Jersey table is known
from src.Models.Cart import CartItem
from src.Models.Order import Order, OrderItem

Base.metadata.create_all(bind=engine)

from src.Routes import AuthRoutes, UserRoutes, ProfileRoutes, CatalogRoutes, CartRoutes, OrderRoutes

app = FastAPI(title="FanatikJersey API")

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(AuthRoutes.router, prefix="/auth", tags=["auth"])
app.include_router(UserRoutes.router, prefix="/users", tags=["users"])
app.include_router(ProfileRoutes.router, prefix="/profile", tags=["profile"])
app.include_router(CatalogRoutes.router, prefix="/catalog", tags=["catalog"])
app.include_router(CartRoutes.router, prefix="/cart", tags=["cart"])
app.include_router(OrderRoutes.router, prefix="/orders", tags=["orders"])

@app.get("/")
def read_root():
    return {"message": "Welcome to FanatikJersey API"}

if __name__ == "__main__":
    import uvicorn
    import os
    
    port = int(os.getenv("PORT", 9000))
    uvicorn.run("main:app", host="127.0.0.1", port=port, reload=True)
    # Force reload for schema updates (email fix)
