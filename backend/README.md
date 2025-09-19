## To install prerequisites
pip install -r requirements.txt

## To run API locally
uvicorn app.main:app --reload

## To run API through EC2
uvicorn app.main:app --host 0.0.0.0 --port 8000