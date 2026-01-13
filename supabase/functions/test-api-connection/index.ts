import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestResult {
  success: boolean;
  status: number;
  message: string;
  latency: number;
  details?: Record<string, unknown>;
}

async function testSportmonksApi(apiKey: string): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(
      `https://api.sportmonks.com/v3/core/countries?api_token=${apiKey}&per_page=1`
    );
    
    const latency = Date.now() - startTime;
    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        status: response.status,
        message: `Connected successfully. Found ${data.data?.length || 0} countries.`,
        latency,
        details: {
          rate_limit_remaining: data.rate_limit?.remaining,
          subscription: data.subscription?.meta?.trial_ends_at ? 'Trial' : 'Active',
        },
      };
    } else {
      return {
        success: false,
        status: response.status,
        message: data.message || 'API request failed',
        latency,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      status: 0,
      message: `Connection error: ${errorMessage}`,
      latency: Date.now() - startTime,
    };
  }
}

async function testGenericApi(apiKey: string, testUrl?: string): Promise<TestResult> {
  const startTime = Date.now();
  
  if (!testUrl) {
    return {
      success: false,
      status: 400,
      message: 'No test URL provided for this API type',
      latency: 0,
    };
  }
  
  try {
    const url = testUrl.includes('{{API_KEY}}') 
      ? testUrl.replace('{{API_KEY}}', apiKey)
      : testUrl;
      
    const response = await fetch(url, {
      headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {},
    });
    
    const latency = Date.now() - startTime;
    
    return {
      success: response.ok,
      status: response.status,
      message: response.ok ? 'Connection successful' : `Failed with status ${response.status}`,
      latency,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      status: 0,
      message: `Connection error: ${errorMessage}`,
      latency: Date.now() - startTime,
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { apiName, apiKey, testUrl } = await req.json();
    
    console.log(`Testing API connection for: ${apiName}`);
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          status: 400,
          message: 'API key is required',
          latency: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result: TestResult;

    switch (apiName?.toLowerCase()) {
      case 'sportmonks':
        result = await testSportmonksApi(apiKey);
        break;
        
      // Add more API-specific tests here
      // case 'football-data':
      //   result = await testFootballDataApi(apiKey);
      //   break;
        
      default:
        result = await testGenericApi(apiKey, testUrl);
    }

    console.log(`Test result for ${apiName}:`, result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in test-api-connection:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({
        success: false,
        status: 500,
        message: `Server error: ${errorMessage}`,
        latency: 0,
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});