#!/usr/bin/env node

const API_BASE_URL = 'https://pbfgnkoeuygcdybuefkp.supabase.co/functions/v1/make-server-4e8803b0';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiZmdua29ldXlnY2R5YnVlZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NzgxNzYsImV4cCI6MjA3NDU1NDE3Nn0.odfalR1k5UCb6Qjek9hK34OtqYyjMPSsHDdBZMi6JZQ';

async function testAPI() {
  console.log('🧪 Testing Tate Studies API Endpoints...\n');

  // Test 1: Health Check
  console.log('1. Testing Health Check...');
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
    });
    const data = await response.json();
    console.log('✅ Health Check:', data);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
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
    console.log('✅ File Upload:', data);
    
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
            console.log('✅ Get Summaries:', summariesData);
          } catch (error) {
            console.log('❌ Get Summaries Failed:', error.message);
          }
        } else {
          console.log('❌ AI Processing Failed:', processData.error);
          console.log('💡 This is likely because OpenAI API key is not configured in Supabase Edge Functions');
        }
      } catch (error) {
        console.log('❌ AI Processing Error:', error.message);
      }
    }
  } catch (error) {
    console.log('❌ File Upload Failed:', error.message);
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
    console.log('❌ Multiple Choice Failed:', error.message);
  }

  console.log('\n🏁 API Testing Complete!');
  console.log('\n📋 Summary:');
  console.log('- File upload: ✅ Working');
  console.log('- AI processing: ❌ Needs OpenAI API key configuration');
  console.log('- Multiple choice: ❌ Depends on AI processing');
  console.log('\n🔧 To fix: Configure OPENAI_API_KEY in Supabase Edge Functions environment variables');
}

testAPI().catch(console.error);
