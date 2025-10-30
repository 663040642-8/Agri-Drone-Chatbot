import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private model;

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('❌ Missing GOOGLE_API_KEY in .env');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async askGemini(context: string, question: string): Promise<string> {
    const prompt = `
      คุณเป็นผู้ช่วยด้านโดรนเพื่อการเกษตร
      อ่าน Context ด้านล่างแล้วตอบคำถามผู้ใช้เป็นประโยคของคุณเอง
      ห้าม copy Context ตรง ๆ
      หาก Context ไม่เพียงพอ → "ขออภัย ไม่มีข้อมูลเพียงพอ"
      หากคำถามไม่เกี่ยวกับโดรนเกษตร → "ขออภัย ฉันเชี่ยวชาญโดรนเกษตรเท่านั้น"
      Context:
      ${context}
      คำถาม: ${question}
      ตอบเป็นประโยคใหม่ของคุณเอง:
    `;

    const result = await this.model.generateContent(prompt);
    return result.response.text() ?? 'ไม่สามารถสร้างคำตอบได้';
  }
}