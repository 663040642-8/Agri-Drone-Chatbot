# Stage 1: Build & Install Dependencies
FROM python:3.11-slim AS builder

# ตั้งค่าให้ Python ไม่สร้าง Cache และรันในโหมดที่ไม่ interactive
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /install

# คัดลอกเฉพาะไฟล์ที่จำเป็นสำหรับการติดตั้ง
COPY requirements.txt .

# ติดตั้ง Dependencies ทั้งหมด
# 💡 ตรวจสอบให้แน่ใจว่า requirements.txt ไม่มี sentence-transformers
RUN pip install --no-cache-dir -r requirements.txt

# =======================================================
# Stage 2: Production Image (Image สุดท้ายที่ใช้ Deploy)
# =======================================================
FROM python:3.11-slim

WORKDIR /app

# คัดลอก Dependencies ที่ติดตั้งแล้วจาก Stage 1
COPY --from=builder /usr/local/lib/python3.11/site-packages/ /usr/local/lib/python3.11/site-packages/

# คัดลอกโค้ดแอปพลิเคชัน
COPY . .

EXPOSE 8000

# 💡 กำหนด Port และรัน Start Command
ENV PORT=8000
CMD ["uvicorn", "vector_search:app", "--host", "0.0.0.0", "--port", "8000"]