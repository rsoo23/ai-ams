import os
import io
import pymupdf
import tempfile
import pytesseract
import pymupdf4llm
from PIL import Image
from fastapi import APIRouter, UploadFile, HTTPException

router = APIRouter()

@router.post("/extract-text")
async def extract_text_from_pdf(file: UploadFile):
	try:
		file_content = await file.read()
		with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tf:
			tf.write(file_content)
			tf_path = tf.name

		doc_content = pymupdf4llm.to_markdown(tf_path)
		if not doc_content.strip():
			doc = pymupdf.open(tf_path)
			extracted_text = []
			for page in doc:
				image_list = page.get_images(full=True)
				for img_index, img in enumerate(image_list):
					xref = img[0]
					base_image = doc.extract_image(xref)
					image_bytes = base_image["image"]

					image = Image.open(io.BytesIO(image_bytes))
					text = pytesseract.image_to_string(image)
					if text.strip():
						extracted_text.append(f"### Page {page.number + 1}, Image {img_index + 1}\n\n{text.strip()}\n")
			doc.close()
			doc_content = "\n".join(extracted_text) if extracted_text else "" 
		os.unlink(tf_path)

		return {
			"data": doc_content.strip()
		}
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Error during text extraction: {str(e)}")

@router.get("/test") # TEST ENDPOINT
async def test():
	return {"text": "Sample extracted text from Textract."}