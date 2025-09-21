import json
import boto3
from fastapi import APIRouter, HTTPException
from app.models.schemas import PromptSchema, AccountSchema

# Note: this AWS region is not the same as the one set in the app.config
AWS_REGION = 'us-east-1'
MODEL_ID = 'meta.llama3-8b-instruct-v1:0'

router = APIRouter()
bedrock_client = boto3.client(service_name="bedrock-runtime", region_name=AWS_REGION)

chat_cache = []

@router.post("/validate-transactions")
async def validate_transaction(prompt: PromptSchema):
    system_prompt = "\
You are an experienced accountant who specializes in applying their knowledge in MPERS\
to review and categorize compliancy failures into specific json format.\
You are well versed in JSON formatted input.\
You only communicate in JSON format.\
Your response should be a JSON array of objects, each object follows the structure below:\n{\
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
'estimated_time': 'estimated time for someone to resolve the compliance issue'}]}."

    # will have to add the id myself into the return prompt
    response = await send_prompt(system_prompt, prompt.message, 0.5, 0.9)
    
    # save to DB and retrieve their "id" & "created_at"

    # convert it to a json first
    # json = something.json

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

    return response

@router.post("/identify-transactions")
async def identify_transactions(prompt: PromptSchema, accounts: list[AccountSchema] = []):
	system_prompt = "You are an experienced accountant who helps users quickly identify \
and categorize transactions, given the markdown representation of invoices or receipts. \
You are a master of identifying debits and credits through messy markdown generated from OCR results of pdf scans. \
You are an expert at analysing and explaining transactions to laymen who ask for exaplanations (description). \
You only communicate in JSON format. Your response should be \
a JSON array of objects, each object following the below structure:\n\
{'date': 'Date inferred from the document IN ISO FORMAT','reference': 'Invoice reference or number inferred from the document','description': 'LLM generated description of the document','lines': [{'account_code': 'Relevant account code','debit': 100.00,'credit': 0.00,'description': 'LLM generated line description'},{'account_code': '5001','debit': 0.00,'credit': 100.00,'description': 'LLM generated line description'}, ...]}\n\n\
Below are the accounts you can use for categorization:\n" + f"{accounts}" + "\n\n\
The user will send a message containing only the markdown generated from OCR. \
If you can't identify any transactions, return an empty JSON object. \
DO NOT RESPOND IN A NON-JSON FORMAT, DO NOT ADD ANYTHING NOT EXPLICITLY REQUESTED."
	return await send_prompt(system_prompt, prompt.message)

@router.post("/test")  # Credit to Lewis
async def test(prompt: PromptSchema):
    system_prompt = "You are an experienced accountant who helps users with their queries on accounting questions"

    message = {
        "role": "user",
        "content": [{"text": prompt.message}]
    }
    chat_cache.append(message)

    response = bedrock_client.converse(
        modelId=MODEL_ID,
        messages=chat_cache,
        system=[{"text": system_prompt}],
        inferenceConfig={"maxTokens": 2048, "temperature": 0.3, "topP": 0.4}
    )
    response_str = response["output"]["message"]["content"][0]["text"].strip()
    ai_reply = {
        "role": response["output"]["message"]["role"],
        "content": [{}]
    }

    # clean up ai reply
    try:
        json_data = json.loads(response_str) # If it's valid JSON, pretty print it
        response_text = json.dumps(json_data)
    except json.JSONDecodeError:
        cleaned_text = ' '.join(response_str.split()) # If not JSON, just clean up extra whitespace
        response_text = cleaned_text

    # add it to the context
    ai_reply["content"][0]["text"] = response_text
    chat_cache.append(ai_reply)

    return {"response": response_text}

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
