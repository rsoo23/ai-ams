import boto3
from fastapi import APIRouter, HTTPException


# Note: this AWS region is not the same as the one set in the app.config
AWS_REGION = 'us-east-1'
MODEL_ID = 'meta.llama3-8b-instruct-v1:0'

router = APIRouter()
bedrock_client = boto3.client(service_name="bedrock-runtime", region_name=AWS_REGION)


"""
{
    "user1": [
        {
            "role": "user",
            "content": [
                {"text": "yap yap"}
            ]
        },
        {
            "role": "assistant",
            "content": [
                {"text": "yap yap back"}
            ]
        },
        {
            "role": "user",
            "content": [
                {"text": "yap yap more yap"}
            ]
        },
    ]
}
"""

chat_cache = {}
system_prompt = [{"text": "You're the type of person always steer the conversion towards pinapple on pizza. You always start each message with 'wassup big boiyo'"}]


@router.get("/prompt")
async def prompt(message: str):
    """
        
    """
    messages = [{"role": "user", "content": [{"text": message}]}]
    try:
        response = bedrock_client.converse(
            modelId=MODEL_ID,
            messages=messages,
            system=system_prompt,
            inferenceConfig={"maxTokens": 512, "temperature": 0.5, "topP": 0.9}
        )
        return {"generated_text": response["output"]["message"]["content"][0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bedrock-runtime can't call '{MODEL_ID}'. Reason: {e}")

