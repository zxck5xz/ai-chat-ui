import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { SYSTEM_PROMPT, MODEL_CONFIG } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: openai(MODEL_CONFIG.model),
      system: SYSTEM_PROMPT,
      messages,
      temperature: MODEL_CONFIG.temperature,
      onFinish: async () => {
        console.log('Stream completed');
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
