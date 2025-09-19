from fastapi import APIRouter

router = APIRouter()

@router.get("/test") # TEST ENDPOINT
async def test():
	return {"completions": "yada yada"}