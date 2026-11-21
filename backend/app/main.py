import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api import health, prediction, analytics, dataset
from app.services.model_loader import ModelLoader
from app.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("NEUROSCAN AI Backend starting up...")
    ModelLoader.initialize()
    yield
    logger.info("Shutting down...")

app = FastAPI(
    title="NEUROSCAN AI API",
    description="Parkinson's Disease Drawing Classification API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(prediction.router, prefix="/api", tags=["Prediction"])
app.include_router(analytics.router, prefix="/api", tags=["Analytics"])
app.include_router(dataset.router, prefix="/api", tags=["Dataset"])

@app.get("/")
def root():
    return {"message": "NEUROSCAN AI API", "version": "1.0.0", "status": "online"}
