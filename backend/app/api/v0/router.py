from fastapi import APIRouter
from .endpoints.db_endpoints import router as db_router
from .endpoints.textract_endpoints import router as textract_router
from .endpoints.bedrock_endpoints import router as bedrock_router

router = APIRouter()
router.include_router(db_router, prefix="/db", tags=["Database"])
router.include_router(textract_router, prefix="/textract", tags=["Textract"])
router.include_router(bedrock_router, prefix="/bedrock", tags=["Bedrock"])