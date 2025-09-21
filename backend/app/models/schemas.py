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

class ValidateOutputActionableSchema(BaseModel):
    # id: str
    # compliance_issue: str
    title: str
    description: str
    action_type: str
    estimated_time: str
    # created_at: str

class ValidateIssueOutputSchema(BaseModel):
    # id: str
    journal_entry_id: str
    type: str
    category: str
    title: str
    description: str
    field: str
    value: str
    expected: str
    actionable_steps: list[ValidateOutputActionableSchema]
    # created_at: str