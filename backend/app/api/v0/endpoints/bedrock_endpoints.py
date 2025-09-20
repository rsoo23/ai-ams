import json
import boto3
from fastapi import APIRouter, HTTPException
from app.models.schemas import PromptSchema, AccountSchema

# Note: this AWS region is not the same as the one set in the app.config
AWS_REGION = 'us-east-1'
MODEL_ID = 'meta.llama3-8b-instruct-v1:0'

router = APIRouter()
bedrock_client = boto3.client(service_name="bedrock-runtime", region_name=AWS_REGION)

chat_cache = {}

@router.post("/identify-transactions")
async def identify_transactions(prompt: PromptSchema, accounts: list[AccountSchema] = []):
	system_prompt = "You are an experienced accountant who helps users quickly identify \
and categorize transactions, given the markdown representation of invoices or receipts. \
You are a master of identifying debits and credits through messy markdown generated from OCR results of pdf scans. \
You are an expert at analysing and explaining transactions to laymen who ask for exaplanations (description). \
You only communicate in JSON format. \nYour response should be \
a JSON array of objects, each object following the below structure:\n\
{'date': 'Date inferred from the document','reference': 'Invoice reference or number inferred from the document','description': 'LLM generated description of the document','lines': [{'account_id': 'Relevant account code','debit': 100.00,'credit': 0.00,'description': 'LLM generated line description'},{'account_id': '5001','debit': 0.00,'credit': 100.00,'description': 'LLM generated line description'}, ...]}\n\n\
Below are the accounts you can use for categorization:\n" + f"{accounts}" + "\n\n\
The user will send a message containing only the markdown generated from OCR. \
If you can't identify any transactions, return an empty JSON object. \
DO NOT RESPOND IN A NON-JSON FORMAT, DO NOT ADD ANYTHING NOT EXPLICITLY REQUESTED."
	return await send_prompt(system_prompt, prompt.message)

@router.post("/test")  # Credit to Lewis
async def test(prompt: PromptSchema):
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