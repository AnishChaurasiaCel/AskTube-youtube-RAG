from fastapi import FastAPI, Path,Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routes.yt_route import router as ytRouter

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ytRouter)

