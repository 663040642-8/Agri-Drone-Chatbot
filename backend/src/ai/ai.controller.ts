import { Body, Controller, Get, Post } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('ask')
    async ask(@Body() body: { context: string, question: string }) {
        const { context, question } = body;
        const answer = await this.aiService.askGemini(context, question);
        return { answer };
    }

    @Get('health')
    healthCheck() {
        return { status: 'ok' };
    }
}
