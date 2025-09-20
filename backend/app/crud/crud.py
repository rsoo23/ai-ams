from typing import Optional
from sqlalchemy.orm import Session
from app.models.models import Account, JournalEntry, JournalEntryLine

class AccountCRUD:
    @staticmethod
    def create_account(db: Session, code: str, name: str, type: str, parent_id: Optional[int] = None):
        account = Account(code=code, name=name, type=type, parent_id=parent_id)
        db.add(account)
        db.commit()
        db.refresh(account)
        return account
    
    @staticmethod
    def get_account(db: Session, account_id: int):
        return db.query(Account).filter(Account.id == account_id).first()
    
    @staticmethod
    def get_accounts(db: Session, skip: int = 0, limit: int = 100):
        return db.query(Account).offset(skip).limit(limit).all()

class JournalEntryCRUD:
    @staticmethod
    def create_journal_entry(db: Session, date, reference: str = None, description: str = None):
        entry = JournalEntry(date=date, reference=reference, description=description)
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry
    
    @staticmethod
    def add_journal_line(db: Session, journal_entry_id: int, account_id: int, 
                        debit: float = 0.0, credit: float = 0.0, description: str = None):
        line = JournalEntryLine(
            journal_entry_id=journal_entry_id,
            account_id=account_id,
            debit=debit,
            credit=credit,
            description=description
        )
        db.add(line)
        db.commit()
        db.refresh(line)
        return line