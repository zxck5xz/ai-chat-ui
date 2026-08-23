import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { SYSTEM_PROMPT, MODEL_CONFIG } from '@/lib/ai';

const MOCK_SOURCES = [
  {
    id: 'src-1',
    title: 'Getting Started with React 19',
    url: 'https://react.dev/learn',
    snippet: 'React 19 introduces new features like Server Components and Actions for building modern web applications.',
    score: 0.95,
  },
  {
    id: 'src-2',
    title: 'Vercel AI SDK Documentation',
    url: 'https://sdk.vercel.ai/docs',
    snippet: 'The Vercel AI SDK provides a unified interface for streaming AI responses in Next.js applications.',
    score: 0.88,
  },
];

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

    const response = result.toTextStreamResponse();

    // Append sources as a custom event at the end
    const encoder = new TextEncoder();
    const sourcesStream = new ReadableStream({
      start(controller) {
        // Send sources as JSON after the main stream
        const sourcesData = `\n\n[SOURCES]${JSON.stringify(MOCK_SOURCES)}[/SOURCES]`;
        controller.enqueue(encoder.encode(sourcesData));
        controller.close();
      },
    });

    // Combine streams
    const combinedStream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        }
        controller.close();
      },
    });

    return new Response(combinedStream, {
      headers: response.headers,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
