import json
import boto3
from app.models.models import PromptBody
from fastapi import APIRouter, HTTPException

# Note: this AWS region is not the same as the one set in the app.config
AWS_REGION = 'us-east-1'
MODEL_ID = 'meta.llama3-8b-instruct-v1:0'

router = APIRouter()
bedrock_client = boto3.client(service_name="bedrock-runtime", region_name=AWS_REGION)

chat_cache = {}

@router.post("/identify-transactions")
async def identify_transactions(prompt: PromptBody):
	system_prompt = "You are an experienced accountant who helps users quickly identify \
and categorize transactions, given the markdown representation of invoices or receipts. \
You are a master of identifying debits and credits through messy markdown generated from OCR results of pdf scans. \
You are an expert at analysing and explaining transactions to laymen who ask for exaplanations (description). \
You only communicate in JSON format. Your response should be \
a JSON array of objects, each object following the below structure:\n\
{'debit': float, 'credit': float, 'description': str}\n\n\
The user will send a message containing only the markdown generated from OCR. \
If you can't identify any transactions, return an empty JSON object. \
DO NOT RESPOND IN A NON-JSON FORMAT, DO NOT ADD ANYTHING NOT EXPLICITLY REQUESTED."
	return await send_prompt(system_prompt, prompt.message)

@router.post("/test")  # Credit to Lewis
async def test(prompt: PromptBody):
	system_prompt = "You're the type of person always steer the conversion towards \
pinapple on pizza. You always start each message with 'wassup big boiyo'. You always \
end each message with 'This is a test endpoint.'"
	return await send_prompt(system_prompt, prompt.message, 0.5, 0.9)

async def send_prompt(system_prompt: str, user_prompt: str, temperature: float = 0.3, top_p: float = 0.4, tokens: int = 2048):
	try:
		response = bedrock_client.converse(
			modelId=MODEL_ID,
			messages=[{"role": "user", "content": [{"text": user_prompt}]}],
			system=[{"text": system_prompt}],
			inferenceConfig={"maxTokens": tokens, "temperature": temperature, "topP": top_p}
		)
		response_str = response["output"]["message"]["content"][0]["text"].strip()

		try:
			json_data = json.loads(response_str) # If it's valid JSON, pretty print it
			return {"response": json.dumps(json_data)}
		except json.JSONDecodeError:
			cleaned_text = ' '.join(response_str.split()) # If not JSON, just clean up extra whitespace
			return {"response": cleaned_text}
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Error with bedrock-runtime ({MODEL_ID}). Reason: {e}")

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