import docx
import pdfplumber

def extract_text(file_path: str) -> str:
    if file_path.endswith('.pdf'):
        try:
            text = ""
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            return text
        except Exception as e:
            return f"Error extracting PDF text: {str(e)}"

    elif file_path.endswith('.docx'):
        try:
            doc = docx.Document(file_path)
            full_text = []
            for para in doc.paragraphs:
                full_text.append(para.text)
            return '\n'.join(full_text)
        except Exception as e:
            return f"Error extracting DOCX text: {str(e)}"
            
    return "Unsupported file format for text extraction. Note: uploaded file must be saved to disk or loaded in memory correctly."
