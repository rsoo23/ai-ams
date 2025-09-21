from datetime import date
from pydantic import BaseModel

class PromptSchema(BaseModel):
	message: str

class AccountSchema(BaseModel):
    code: str
    name: str
    type: str

class JournalEntryLineSchema(BaseModel):
	account_code: int
	debit: float
	credit: float
	description: str

class JournalEntrySchema(BaseModel):
	date: date
	reference: str
	description: str
	lines: list[JournalEntryLineSchema]