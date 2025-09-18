import sqlalchemy as sa
from sqlalchemy.orm import sessionmaker
from app.config import RDS_ENDPOINT, RDS_DB_NAME, RDS_USERNAME, RDS_PASSWORD

# engine = sa.create_engine(f'postgresql://{RDS_USERNAME}:{RDS_PASSWORD}@{RDS_ENDPOINT}/{RDS_DB_NAME}')
# Session = sessionmaker(bind=engine)

# def query_db(query_param: str) -> list:
#     """
#     Query RDS for users matching query_param (e.g., name search).
#     Example: SELECT * FROM users WHERE name ILIKE :param
#     Returns: List of dicts with user data.
#     """
#     with Session() as session:
#         # Placeholder: Assume 'users' table with columns id, name
#         result = session.execute(
#             sa.text("SELECT id, name FROM users WHERE name = :param"),
#             {"param": query_param}  # Exact match
#         )
#         return [{"id": row[0], "name": row[1]} for row in result.fetchall()]

def service_test():
	return ["data0", "data1", "data2"]