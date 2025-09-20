from sqlalchemy import Column, Integer, String, Float, DateTime, Date, ForeignKey, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from pydantic import BaseModel

Base = declarative_base()

# Enums for type safety
class IssueType(enum.Enum):
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"

class IssueSeverity(enum.Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class ActionType(enum.Enum):
    MANUAL_REVIEW = "manual_review"
    AUTO_CORRECT = "auto_correct"
    VERIFICATION_REQUIRED = "verification_required"
    APPROVAL_NEEDED = "approval_needed"

class Priority(enum.Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class Account(Base):
    __tablename__ = "accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(20), nullable=False)  # Asset, Liability, Equity, Revenue, Expense
    parent_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)
    
    # Relationships
    parent = relationship("Account", remote_side=[id], backref="children")
    journal_lines = relationship("JournalEntryLine", back_populates="account")

class JournalEntry(Base):
    __tablename__ = "journal_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)  # noqa: F811
    reference = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    lines = relationship("JournalEntryLine", back_populates="journal_entry", cascade="all, delete-orphan")

class JournalEntryLine(Base):
    __tablename__ = "journal_entry_lines"
    
    id = Column(Integer, primary_key=True, index=True)
    journal_entry_id = Column(Integer, ForeignKey("journal_entries.id"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    debit = Column(Float, default=0.0)
    credit = Column(Float, default=0.0)
    description = Column(Text, nullable=True)
    
    # Relationships
    journal_entry = relationship("JournalEntry", back_populates="lines")
    account = relationship("Account", back_populates="journal_lines")

class PromptBody(BaseModel):
	message: str


# General Ledger Models
class GeneralLedgerAccount(Base):
    __tablename__ = "general_ledger_accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(20), nullable=False)  # Asset, Liability, Equity, Revenue, Expense
    category = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    current_balance = Column(Float, default=0.0)
    
    # Relationships
    transactions = relationship("GeneralLedgerTransaction", back_populates="account", cascade="all, delete-orphan")


class GeneralLedgerTransaction(Base):
    __tablename__ = "general_ledger_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("general_ledger_accounts.id"), nullable=False)
    date = Column(Date, nullable=False, index=True)
    reference = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    journal_entry_id = Column(Integer, nullable=False)  # Reference to journal entry
    debit = Column(Float, default=0.0)
    credit = Column(Float, default=0.0)
    running_balance = Column(Float, nullable=False)
    posted_by = Column(String(100), nullable=False)
    posted_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    account = relationship("GeneralLedgerAccount", back_populates="transactions")


# Compliance and Validation Models
class ComplianceIssue(Base):
    __tablename__ = "compliance_issues"
    
    id = Column(String(50), primary_key=True)  # e.g., 'comp-001'
    journal_entry_id = Column(Integer, ForeignKey("journal_entries.id"), nullable=True)
    type = Column(String(20), nullable=False)  # error, warning, info
    category = Column(String(100), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(20), nullable=False)  # high, medium, low
    field = Column(String(100), nullable=True)
    value = Column(Text, nullable=True)
    expected = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    
    # Relationships
    actionable_steps = relationship("ActionableStep", back_populates="compliance_issue", cascade="all, delete-orphan")
    journal_entry = relationship("JournalEntry")


class ActionableStep(Base):
    __tablename__ = "actionable_steps"
    
    id = Column(String(50), primary_key=True)  # e.g., 'step-001-1'
    compliance_issue_id = Column(String(50), ForeignKey("compliance_issues.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    action_type = Column(String(30), nullable=False)  # manual_review, auto_correct, etc.
    priority = Column(String(20), nullable=False)  # high, medium, low
    estimated_time = Column(String(50), nullable=False)  # e.g., "5 minutes"
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    completed_by = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    compliance_issue = relationship("ComplianceIssue", back_populates="actionable_steps")