from fastapi import FastAPI
from mangum import Mangum
from app.api.v0.router import router as api_router

app = FastAPI(title="ai-ams-backend")

app.include_router(api_router, prefix="/v0")

handler = Mangum(app)