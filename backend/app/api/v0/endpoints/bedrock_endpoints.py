from fastapi import APIRouter, Body, HTTPException

router = APIRouter()

# @router.post("/generate")
# async def generate_text(prompt: str = Body(...)):
#     """
#     Send a prompt to AWS Bedrock LLM and get a response.
#     Example frontend call:
#         POST /api/v1/bedrock/generate
#         Body: {"prompt": "Summarize this..."}
#         Response: {"completion": "Summary here...", "model_id": "anthropic.claude-v2"}
#     """
#     from app.services.bedrock import invoke_llm
#     try:
#         completion = invoke_llm(prompt)
#         if not completion:
#             raise HTTPException(status_code=500, detail="LLM failed to generate response")
#         return {"completion": completion, "model_id": "anthropic.claude-v2"}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Bedrock error: {str(e)}")

@router.get("/test") # TEST ENDPOINT
async def test():
    from app.services.bedrock import service_test
    return service_test()