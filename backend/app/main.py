from fastapi import FastAPI, Path,Query, HTTPException
from app.routes.yt_route import router as ytRouter\

app = FastAPI()

app.include_router(ytRouter)

