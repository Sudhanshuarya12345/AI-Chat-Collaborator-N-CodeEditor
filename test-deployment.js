// Test script to verify deployment configuration
import dotenv from 'dotenv';
import { generateResult } from './backend/services/ai.service.js';

dotenv.config();

console.log('Testing deployment configuration...');
console.log('Environment variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('- GOOGLE_AI_KEY:', process.env.GOOGLE_AI_KEY ? 'Set' : 'Not set');

// Test AI service
async function testAI() {
    try {
        console.log('\nTesting AI service...');
        const result = await generateResult('create an express server');
        console.log('AI Response:', result);
        
        // Try to parse the response
        const parsed = JSON.parse(result);
        console.log('Parsed response:', parsed);
        
        if (parsed.fileTree) {
            console.log('✅ File tree found in response');
            console.log('Files:', Object.keys(parsed.fileTree));
        } else {
            console.log('❌ No file tree in response');
        }
    } catch (error) {
        console.error('❌ AI test failed:', error);
    }
}

testAI(); 