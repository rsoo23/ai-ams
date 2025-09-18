import boto3
import json
from app.config import AWS_REGION

# bedrock_client = boto3.client('bedrock-runtime', region_name=AWS_REGION)

# def invoke_llm(prompt: str) -> str:
#     """
#     Invoke AWS Bedrock LLM with a prompt.
#     Args:
#         prompt: Input text for the LLM.
#     Returns: Generated text from the LLM.
#     """
#     response = bedrock_client.invoke_model(
#         modelId='anthropic.claude-v2',
#         body=json.dumps({
#             "prompt": f"\n\nHuman: {prompt}\n\nAssistant: ",  # Claude prompt format
#             "temperature": 0.7
#         })
#     )
#     result = json.loads(response['body'].read())
#     return result.get('completion', '')

def service_test():
	return "anthropic.claude-v2, mock-model"