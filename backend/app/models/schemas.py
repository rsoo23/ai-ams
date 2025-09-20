from pydantic import BaseModel

class PromptSchema(BaseModel):
	message: str

class AccountSchema(BaseModel):
    code: str
    name: str
    type: str