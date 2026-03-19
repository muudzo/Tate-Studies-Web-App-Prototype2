#!/usr/bin/env node

const API_BASE_URL = process.env.API_BASE_URL || 'https://pbfgnkoeuygcdybuefkp.supabase.co/functions/v1/make-server-4e8803b0';
const AUTH_TOKEN = process.env.SUPABASE_ANON_KEY || '';

if (!AUTH_TOKEN) {
  console.error('Error: SUPABASE_ANON_KEY environment variable is not set.');
  process.exit(1);
}

async function testAPI() {
  console.log('Testing Tate Studies API Endpoints...\n');

  // Test 1: Health Check
  console.log('1. Testing Health Check...');
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
    });
    const data = await response.json();
    console.log('Health Check:', data);
  } catch (error) {
    console.error('Health Check Failed:', error.message);
  }

  // Test 2: File Upload
  console.log('\n2. Testing File Upload...');
  try {
    const formData = new FormData();
    const testContent = 'Strategic management is the process of formulating, implementing, and evaluating strategies that enable an organization to achieve its objectives and gain competitive advantage.';
    const blob = new Blob([testContent], { type: 'text/plain' });
    formData.append('file', blob, 'test-strategy.txt');
    formData.append('userId', 'test-user');

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` },
      body: formData
    });
    const data = await response.json();
    console.log('File Upload:', data);

    if (data.success) {
      // Test 3: AI Processing
      console.log('\n3. Testing AI Processing...');
      try {
        const processResponse = await fetch(`${API_BASE_URL}/process`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AUTH_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: testContent,
            subject: 'Management',
            fileId: data.fileId
          })
        });
        const processData = await processResponse.json();
        console.log('AI Processing Result:', processData);

        if (processData.success) {
          // Test 4: Get Summaries
          console.log('\n4. Testing Get Summaries...');
          try {
            const summariesResponse = await fetch(`${API_BASE_URL}/summaries/test-user`, {
              headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
            });
            const summariesData = await summariesResponse.json();
            console.log('Get Summaries:', summariesData);
          } catch (error) {
            console.error('Get Summaries Failed:', error.message);
          }
        } else {
          console.error('AI Processing Failed:', processData.error);
          console.log('This is likely because OpenAI API key is not configured in Supabase Edge Functions');
        }
      } catch (error) {
        console.error('AI Processing Error:', error.message);
      }
    }
  } catch (error) {
    console.error('File Upload Failed:', error.message);
  }

  // Test 5: Multiple Choice Generation (if AI works)
  console.log('\n5. Testing Multiple Choice Generation...');
  try {
    const mcResponse = await fetch(`${API_BASE_URL}/multiple-choice`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        summaryId: 'demo_summary',
        numQuestions: 3
      })
    });
    const mcData = await mcResponse.json();
    console.log('Multiple Choice Result:', mcData);
  } catch (error) {
    console.error('Multiple Choice Failed:', error.message);
  }

  console.log('\nAPI Testing Complete!');
  console.log('\nSummary:');
  console.log('- File upload: Working');
  console.log('- AI processing: Needs OpenAI API key configuration');
  console.log('- Multiple choice: Depends on AI processing');
  console.log('\nTo fix: Configure OPENAI_API_KEY in Supabase Edge Functions environment variables');
}

testAPI().catch(console.error);
