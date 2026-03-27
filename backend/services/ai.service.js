import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
const DEFAULT_PROVIDER_ORDER = ['openrouter', 'openai', 'anthropic', 'xai', 'gemini'];
const SHARED_SYSTEM_PROMPT = 'You are an expert coding assistant. Always respond in valid JSON with at least a "text" field. When asked to scaffold projects, include fileTree, buildCommand, and startCommand when possible.';

const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
    },
    systemInstruction: `
        You are an intelligent and expert-level AI assistant capable of generating highly accurate, clean, and optimized code in various programming languages including Python, C++, JavaScript, Java, and Shell. Follow best practices, ensure efficient logic, and include helpful comments when appropriate. Always prioritize readability, performance, and correctness.
        You are also an excellent code tracer. You can simulate and analyze code execution line by line, explaining how the code works and accurately predicting the output. Highlight potential bugs or edge cases when relevant.
        In addition, you are a skilled mathematician and high-precision calculator. Solve equations, analyze formulas, and perform symbolic or numerical calculations with speed and accuracy. Present solutions in a logical, step-by-step manner.
        You also have strong general knowledge across domains such as current events, general science, history, and technology. Provide fact-checked, up-to-date, and concise explanations when answering questions from these fields.
        You communicate like a thoughtful and intelligent human. Be clear, engaging, and context-aware. Adjust your tone slightly based on the user’s style—professional, casual, or technical. Use natural phrasing and be conversational when appropriate, while still being concise and helpful.
        When responding, always keep the user’s intent in mind. Focus on clarity, utility, and relevance in every answer.

        Examples: 
            <example>

            user: Create an express application

            response: {
              "text": "this is your fileTree structure of the express server",
              "fileTree": {
                "app.js": {
                  "file": {
                    "contents": "
                      const express = require('express');

                      const app = express();

                      app.get('/', (req, res) => {
                        res.send('Hello World!');
                      });

                      app.listen(3000, () => {
                        console.log('Server is running on port 3000');
                      });
                    "
                  }
                },
                "package.json": {
                  "file": {
                    "contents": "
                      {
                        \"name\": \"temp-server\",
                        \"version\": \"1.0.0\",
                        \"main\": \"index.js\",
                        \"scripts\": {
                          \"test\": \"echo \\\"Error: no test specified\\\" && exit 1\"
                        },
                        \"keywords\": [],
                        \"author\": \"\",
                        \"license\": \"ISC\",
                        \"description\": \"\",
                        \"dependencies\": {
                          \"express\": \"^4.21.2\"
                        }
                      }
                    "
                  }
                }
              },
              "buildCommand": {
                "mainItem": "npm",
                "commands": ["install"]
              },
              "startCommand": {
                "mainItem": "node",
                "commands": ["app.js"]
              }
            }
            </example>

            <example>
                user: Hello

                response: {
                  "text": "Hello, How can I help you today?"
                }
            </example>


        IMPORTANT : don't use file name like routes/index.js       
        `,
    
});

    const getProviderOrder = () => {
      const configured = (process.env.AI_FALLBACK_ORDER || '')
        .split(',')
        .map(item => item.trim().toLowerCase())
        .filter(Boolean);

      if (configured.length === 0) {
        return DEFAULT_PROVIDER_ORDER;
      }

      // Keep only known providers and preserve order.
      return configured.filter(name => DEFAULT_PROVIDER_ORDER.includes(name));
    };

    const isRetryableOrQuotaError = (error) => {
      const status = error?.status || error?.statusCode;
      const message = (error?.message || '').toLowerCase();

      if ([408, 409, 429, 500, 502, 503, 504].includes(status)) {
        return true;
      }

      return /quota|rate limit|too many requests|temporar|timeout|overloaded|unavailable/.test(message);
    };

    const extractTextFromOpenAIResponse = (data) => {
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content === 'string') {
        return content;
      }

      if (Array.isArray(content)) {
        return content
          .filter(part => part?.type === 'text')
          .map(part => part.text)
          .join('\n');
      }

      return '';
    };

    const extractTextFromAnthropicResponse = (data) => {
      const parts = data?.content;
      if (!Array.isArray(parts)) {
        return '';
      }

      return parts
        .filter(part => part?.type === 'text')
        .map(part => part.text)
        .join('\n');
    };

    const generateWithGemini = async (prompt) => {
      if (!process.env.GOOGLE_AI_KEY) {
        throw new Error('Gemini key is not configured (GOOGLE_AI_KEY).');
      }

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      return result.response.text();
    };

    const generateWithOpenAICompatible = async ({ providerName, baseUrl, apiKey, modelName, prompt }) => {
      if (!apiKey) {
        throw new Error(`${providerName} key is not configured.`);
      }

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          temperature: 0.4,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SHARED_SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data?.error?.message || `${providerName} request failed with status ${response.status}`);
        error.status = response.status;
        throw error;
      }

      const text = extractTextFromOpenAIResponse(data);
      if (!text) {
        throw new Error(`${providerName} returned an empty response.`);
      }

      return text;
    };

    const generateWithAnthropic = async (prompt) => {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error('Anthropic key is not configured (ANTHROPIC_API_KEY).');
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest',
          max_tokens: 4096,
          temperature: 0.4,
          system: SHARED_SYSTEM_PROMPT,
          messages: [
            { role: 'user', content: prompt },
          ],
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data?.error?.message || `Anthropic request failed with status ${response.status}`);
        error.status = response.status;
        throw error;
      }

      const text = extractTextFromAnthropicResponse(data);
      if (!text) {
        throw new Error('Anthropic returned an empty response.');
      }

      return text;
    };

    const generateWithOpenAI = async (prompt) => {
      return generateWithOpenAICompatible({
        providerName: 'OpenAI',
        baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
        apiKey: process.env.OPENAI_API_KEY,
        modelName: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
        prompt,
      });
    };

    const generateWithOpenRouter = async (prompt) => {
      return generateWithOpenAICompatible({
        providerName: 'OpenRouter',
        baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY,
        modelName: process.env.OPENROUTER_MODEL || 'openai/gpt-4.1-mini',
        prompt,
      });
    };

    const generateWithXai = async (prompt) => {
      return generateWithOpenAICompatible({
        providerName: 'xAI',
        baseUrl: process.env.XAI_BASE_URL || 'https://api.x.ai/v1',
        apiKey: process.env.XAI_API_KEY,
        modelName: process.env.XAI_MODEL || 'grok-2-latest',
        prompt,
      });
    };

    const generateWithProvider = async (provider, prompt) => {
      switch (provider) {
        case 'openrouter':
          return generateWithOpenRouter(prompt);
        case 'gemini':
          return generateWithGemini(prompt);
        case 'openai':
          return generateWithOpenAI(prompt);
        case 'anthropic':
          return generateWithAnthropic(prompt);
        case 'xai':
          return generateWithXai(prompt);
        default:
          throw new Error(`Unknown AI provider: ${provider}`);
      }
    };

// ---

// SPECIAL INSTRUCTION — FULL-STACK PROJECT GENERATOR:
// When the user asks you to build a project (e.g., “Build an Express server”, “Create a Next.js app”, “Generate a React + Node full stack app”), respond with a complete project scaffold using this format:

// 1. Start with a clean, visually structured **file/folder tree** like this:
// 📁 project-name/
// ├── README.md
// ├── package.json
// ├── .env.example
// ├── server.js
// └── routes/
//     └── projectroute.js
//     └── userroute.js
//     └── adminroute.js
//     └── authroute.js
//     └── errorroute.js
//     Above given are example, make accordingly to the user's requirements and your understanding about the project.
// ├── controllers/

// 2. Then list each file’s full content in labeled and syntax-highlighted code blocks like this:
// ### 📄 server.js
// \`\`\`js
// const express = require('express');
// // ... full file content
// \`\`\`

// ### 📄 package.json
// \`\`\`json
// {
//   "name": "express-server",
//   ...
// }
// \`\`\`

// Additional Guidelines:
// - Never return project responses in JSON format with nested content.
// - Do NOT use keys like "file tree" or "content". Only return human-readable file trees and full code blocks.
// - Always use the correct language for syntax highlighting: \`\`\`js, \`\`\`json, \`\`\`env, \`\`\`markdown, etc.
// - Avoid unnecessary explanations unless asked.
// - For full-stack apps, clearly separate \`client/\` and \`server/\` folders.
// - Always include: README.md, .env.example, and package.json (with useful scripts and dependencies).
// - Use clean, professional code structure for each framework:
//   - **Express**: server.js, routes/, middleware/, .env, morgan, dotenv
//   - **Next.js**: app/pages structure, API routes, Tailwind (if needed)
//   - **React**: components/, hooks/, context/, sample fetch from backend
//   - **Full-stack**: Combine both with clear folder separation and integration logic
// Do not explain the code unless the user explicitly asks for it.


export const generateResult = async (prompt) => {
  console.log(`Generating content for prompt: ${prompt}`);

  const providers = getProviderOrder();
  const failures = [];

  for (const provider of providers) {
    try {
      const responseText = await generateWithProvider(provider, prompt);
      console.log(`AI response generated via provider: ${provider}`);
      return responseText;
    } catch (error) {
      const message = error?.message || 'Unknown error';
      failures.push({ provider, message });
      console.warn(`Provider ${provider} failed: ${message}`);

      // Keep trying other providers for transient/quota errors or missing key/setup.
      if (isRetryableOrQuotaError(error) || /not configured|empty response|unknown ai provider/i.test(message.toLowerCase())) {
        continue;
      }

      // Even for non-retryable errors, continue if we still have providers left.
    }
  }

  const details = failures
    .map(item => `${item.provider}: ${item.message}`)
    .join(' | ');

  const aggregateError = new Error(`All AI providers failed. ${details}`);
  aggregateError.code = 'ALL_AI_PROVIDERS_FAILED';
  aggregateError.failures = failures;
  throw aggregateError;
}
