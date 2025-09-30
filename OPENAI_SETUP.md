# OpenAI API Key Configuration

## Your API Key
```
YOUR_OPENAI_API_KEY_HERE
```

## How to Configure in Supabase

### Method 1: Supabase Dashboard (Recommended)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `pbfgnkoeuygcdybuefkp`
3. Go to **Settings** → **Edge Functions**
4. Click **Add Environment Variable**
5. Add:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `YOUR_OPENAI_API_KEY_HERE`
6. Click **Save**
7. The function will automatically redeploy

### Method 2: Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref pbfgnkoeuygcdybuefkp

# Set environment variable
supabase secrets set OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE

# Deploy the function
supabase functions deploy make-server-4e8803b0
```

## Testing the Configuration

After setting up the API key, test it:

```bash
# Test AI processing
curl -X POST "https://pbfgnkoeuygcdybuefkp.supabase.co/functions/v1/make-server-4e8803b0/process" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiZmdua29ldXlnY2R5YnVlZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NzgxNzYsImV4cCI6MjA3NDU1NDE3Nn0.odfalR1k5UCb6Qjek9hK34OtqYyjMPSsHDdBZMi6JZQ" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Strategic management is the process of formulating, implementing, and evaluating strategies that enable an organization to achieve its objectives and gain competitive advantage.",
    "subject": "Management",
    "fileId": "test"
  }'
```

## ⚠️ Important: Billing Required

Your OpenAI API key is valid but has **exceeded its quota**. To use AI features:

1. **Add Payment Method**: Go to [OpenAI Billing](https://platform.openai.com/account/billing)
2. **Add Credits**: Add at least $5-10 to your account
3. **Wait 5-10 minutes** for billing to activate
4. **Test again** using the test script

## Expected Results

Once billing is set up, you should see:
- ✅ AI-generated summaries with intelligent analysis
- ✅ Dynamic multiple choice questions
- ✅ Enhanced study experience
- ✅ No more "fallback mode" messages

## Troubleshooting

### If AI still doesn't work:
1. Check the API key is correctly set in Supabase
2. Verify the key is active in OpenAI dashboard
3. Check Supabase function logs for errors
4. Ensure the function has been redeployed

### Check Function Logs:
1. Go to Supabase Dashboard
2. Navigate to **Edge Functions**
3. Click on `make-server-4e8803b0`
4. Check the **Logs** tab for any errors

## Security Note

⚠️ **Important**: This API key has access to your OpenAI account. Keep it secure and don't share it publicly. You can regenerate it anytime from the OpenAI dashboard if needed.
