from fastapi import APIRouter, Query, HTTPException

router = APIRouter()

# @router.post("/query-db")
# async def query_database(query_param: str = Query(...)):
#     """
#     Query RDS database for users with an exact name match.
#     Example frontend call:
#         POST /api/v1/db/query-db?query_param=user123
#         Response: {"results": [{"id": 1, "name": "user123"}]}
#     """
#     from app.services.db import query_db
#     try:
#         results = query_db(query_param)  # Exact match on name
#         if not results:
#             raise HTTPException(status_code=404, detail="No users found")
#         return {"results": results}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/test") # TEST ENDPOINT
async def test():
    from app.services.db import service_test 
    return {"data": service_test()}