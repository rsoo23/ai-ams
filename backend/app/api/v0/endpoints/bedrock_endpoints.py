import json
import boto3
from fastapi import APIRouter, HTTPException
from app.models.schemas import PromptSchema, AccountSchema

# Note: this AWS region is not the same as the one set in the app.config
AWS_REGION = 'us-east-1'
MODEL_ID = 'meta.llama3-8b-instruct-v1:0'

router = APIRouter()
bedrock_client = boto3.client(service_name="bedrock-runtime", region_name=AWS_REGION)

chat_cache = []  # simple in-memory cache for chat history

def estimate_tokens(messages: list[dict]):
	"""
	Rough estimate of token usage based on message text length.
	Uses ~4 chars per token heuristic.
	"""
	total_chars = sum(len(msg["content"][0]["text"]) for msg in messages)
	return total_chars // 4

@router.post("/validate-transactions")
async def validate_transaction(prompt: PromptSchema):
	system_prompt = "STRICTLY FOLLOW THESE DIRECTIVES:\n\
You are an experienced accountant who specializes in applying their knowledge in MPERS \
to review and categorize compliancy failures when given a JSON representation of transactions. \
You have years of experience in the Malaysian accounting market, so you will validate based on your experience. \
You thoroughly read through the details in every transaction given to you, and if something does not make sense, you raise it. \
You deeply appreciate compliant documents, and will not hesitate to point out anything wrong. \
You will never wrongly raise compliancy issues when given a perfectly compliant document. \
Your response should be a JSON array of objects, each object strictly follows the structure below:\n{\
'journal_entry_id': 'index of the compliance issue found in the input json',\
'type': 'will only be the words \'error\', \'warning\', or \'info\' based on the severity of the compliance issue found',\
'category': 'will be based on MPERS on how to categorize compliance issues',\
'title': 'title of the compliance issue found',\
'description': 'explanation of why the value found is not compliant with MPERS',\
'field': 'key value pair from the input json found to be not compliant with MPERS',\
'value': 'value found in the json to be non-compliant with MPERS, this should be a string value',\
'expected': 'expected value to be compliant with MPERS, this should be a string value',\
'actionable_steps':[{\
'title': 'title of the actionable steps that can be taken to resolve the compliance issue',\
'description': 'explaining the step to resolve the compliance issue',\
'action_type': 'action name that the user has to take to resolve the compliance issue',\
'estimated_time': 'estimated time for someone to resolve the compliance issue'}]}. \
DO NOT HALLUCINATE IF NO COMPLIANCE ERRORS ARE FOUND. DO NOT RESPOND IN A NON-JSON FORMAT, DO NOT ADD ANYTHING NOT EXPLICITLY REQUESTED."

	# save to DB and retrieve their "id" & "created_at"

	# need to add to each compliance_issue ["id", "created_at"]
	# need to add to each actionable_steps ["id", "created_at", "compliance_issue_id"]
	"""
	for i in compliance_issues:
		json[i]["id"] = i.id
		json[i]["created_at"] = i.created_at
		for j in actionble_steps:
			json[i]["actionable_steps"][j.id]["compliance_issue_id"] = i.id
			json[i]["actionable_steps"][j.id]["id"] = j.id
			json[i]["actionable_steps"][j.id]["created_at"] = j.created_at
	"""
	return await send_prompt(system_prompt, prompt.message)

@router.post("/identify-transactions")
async def identify_transactions(prompt: PromptSchema, accounts: list[AccountSchema] = []):
	system_prompt = "STRICTLY FOLLOW THESE DIRECTIVES:\n\
You are an experienced accountant who helps users thoroughly identify \
and categorize transactions, given the markdown representation of invoices or receipts. \
You are a master of identifying debits and credits through messy markdown generated from OCR results of pdf scans. \
You are an expert at analysing and explaining transactions to laymen who ask for exaplanations (description). \
You are the best in the world at cross-checking and identifying correct Account Types and Codes for transactions.\
You only communicate in JSON format. Given the markdown content, you should generate double-entry journal entries. \
Your response should be a JSON array of objects, each object following the below structure:\n\
{'date': 'Date inferred from the document IN ISO FORMAT','reference': 'Invoice reference or number inferred from the document','description': 'LLM generated description of the document','lines': [{'account_code': 'Relevant account code','debit': 100.00,'credit': 0.00,'description': 'LLM generated line description'}, ...]}\n\n\
Below are the accounts found in our company database, which you can use for categorization:\n" + f"{accounts}" + "\n\n\
The user will send a message containing only the markdown generated from OCR. \
If you can't identify any transactions, return an empty JSON object. \
DO NOT HALLUCINATE. DO NOT RESPOND IN A NON-JSON FORMAT, DO NOT ADD ANYTHING NOT EXPLICITLY REQUESTED."
	return await send_prompt(system_prompt, prompt.message)

@router.post("/chat")  # Credit to Lewis
async def chat(prompt: PromptSchema):
	system_prompt = "STRICTLY FOLLOW THESE DIRECTIVES:\n\
You are an experienced CFO of 20 years with deep expertise in financial management and accountancy \
who specializes in applying their knowledge in MPERS and providing strategic financial insights to improve business \
operations and compliance. As a CFO, you understand the broader business implications of accounting compliance issues\
and can recommend actionable steps that align with business objectives while maintaining regulatory compliance.\
You have deep knowledge of how MPERS standards impact financial reporting, cash flow management,\
and strategic decision-making processes. Be straight to the point, do not add filler, time is of the essence. \
You absolutely hate when someone goes off-topic when you are focused on the task given. But even with your infinite knowledge, \
you stay humble and keep conversations short and to the point. Interactions with you are in chat form, your responses are stored, \
small details do not matter unless requested. \
DO NOT HALLUCINATE. DO NOT ADD ANYTHING NOT EXPLICITLY REQUESTED."

	result = await send_prompt(system_prompt, prompt.message, chat_history=chat_cache)
	chat_cache.append({"role": "user", "content": [{"text": prompt.message}]}) # Maintain chat history
	chat_cache.append({"role": "assistant", "content": [{"text": result["response"]}]})

	return result

async def send_prompt(
		system_prompt: str,
		user_prompt: str,
		temperature: float = 0.3,
		top_p: float = 0.4,
		tokens: int = 2048,
		chat_history=None
	):
	messages = chat_history[:] if chat_history else []
	messages.append({"role": "user", "content": [{"text": user_prompt}]})

	# prune oldest messages until under budget
	while estimate_tokens(messages) > tokens:
		if len(messages) > 1:  # don't drop the latest prompt
			messages.pop(0)
		else:
			break

	try:
		response = bedrock_client.converse(
			modelId=MODEL_ID,
			messages=messages,
			system=[{"text": system_prompt}],
			inferenceConfig={"maxTokens": tokens, "temperature": temperature, "topP": top_p}
		)
		response_str = response["output"]["message"]["content"][0]["text"].strip()

		try:
			json_data = json.loads(response_str)
			response_text = json.dumps(json_data)
		except json.JSONDecodeError:
			response_text = ' '.join(response_str.split())

		return {"response": response_text}
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Error with bedrock-runtime ({MODEL_ID}). Reason: {e}")
