from fastapi import APIRouter, Body, HTTPException

router = APIRouter()

@router.get("/test") # TEST ENDPOINT
async def test():
    return {"completions": "yada yada"}