import glob, os, sys

# Find the PDF on Desktop
desktop = os.path.join(os.environ["USERPROFILE"], "Desktop")
pdfs = glob.glob(os.path.join(desktop, "*结构化知识库*.pdf"))
if not pdfs:
    pdfs = glob.glob(os.path.join(desktop, "*部编版*.pdf"))

if not pdfs:
    print("PDF not found")
    sys.exit(1)

pdf_path = pdfs[0]
print(f"Reading: {pdf_path}")

from PyPDF2 import PdfReader
reader = PdfReader(pdf_path)
print(f"Total pages: {len(reader.pages)}")

all_text = []
for i, page in enumerate(reader.pages):
    text = page.extract_text()
    if text:
        all_text.append(f"--- PAGE {i+1} ---\n{text}")

full = "\n".join(all_text)
out_path = r"D:\byfspace\byfspace\InSightory\pdf_content.txt"
with open(out_path, "w", encoding="utf-8") as f:
    f.write(full)
print(f"Extracted {len(full)} chars to {out_path}")
print(f"\n=== FIRST 5000 CHARS ===\n{full[:5000]}")
