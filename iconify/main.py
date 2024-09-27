from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from icogen_core.src.api.icogen_api import ico_gen_router

app = FastAPI(title="Iconify API", description="API for generating icons", version="0.1",
              docs_url="/docs",
              redoc_url="/redoc",
              openapi_url="/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow access from all sources
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all request headers
)
app.include_router(ico_gen_router, tags=["ICOGen"])
