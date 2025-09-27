import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateRecapRequest {
  portfolio_id: string;
  custom_instructions?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { portfolio_id, custom_instructions }: GenerateRecapRequest = await req.json();

    console.log('Generating recap for portfolio:', portfolio_id);

    // Fetch portfolio data
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', portfolio_id)
      .single();

    if (portfolioError || !portfolio) {
      console.error('Portfolio fetch error:', portfolioError);
      return new Response(
        JSON.stringify({ error: 'Portfolio not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let portfolioContent = '';
    
    // If portfolio has a file, download and read it
    if (portfolio.file_path) {
      try {
        const { data: fileData, error: fileError } = await supabase.storage
          .from('portfolios')
          .download(portfolio.file_path);

        if (fileError) {
          console.error('File download error:', fileError);
        } else {
          portfolioContent = await fileData.text();
          console.log('Portfolio file content length:', portfolioContent.length);
        }
      } catch (error) {
        console.error('Error reading portfolio file:', error);
      }
    }

    // Prepare the prompt for AI generation
    const systemPrompt = `You are a financial analyst creating personalized portfolio recap emails. 
    Generate a comprehensive, professional email that analyzes the provided portfolio data and follows the specific instructions given.
    
    The email should include:
    - Market analysis relevant to the portfolio holdings
    - Performance insights and trends
    - Actionable recommendations
    - Professional yet accessible tone
    
    Format the output as a complete email with subject and body.`;

    const userPrompt = `
    Portfolio Name: ${portfolio.name}
    Portfolio Description: ${portfolio.description || 'No description provided'}
    
    Portfolio Content/Holdings:
    ${portfolioContent || 'No detailed portfolio file provided'}
    
    Email Instructions: ${custom_instructions || portfolio.email_instructions}
    Email Frequency: ${portfolio.email_frequency}
    
    Please generate a tailored portfolio recap email based on this information.`;

    // Call Lovable AI for content generation
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI API error:', await aiResponse.text());
      return new Response(
        JSON.stringify({ error: 'Failed to generate recap content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const generatedContent = aiData.choices[0].message.content;

    console.log('Generated content length:', generatedContent.length);

    // Parse the generated content to extract subject and body
    const lines = generatedContent.split('\n');
    let subject = `Portfolio Recap: ${portfolio.name}`;
    let content = generatedContent;

    // Try to extract subject from the generated content
    const subjectMatch = generatedContent.match(/Subject:\s*(.+)/i);
    if (subjectMatch) {
      subject = subjectMatch[1].trim();
      content = generatedContent.replace(/Subject:\s*.+\n?/i, '').trim();
    }

    // Store the generated recap in the database
    const { data: recap, error: recapError } = await supabase
      .from('email_recaps')
      .insert({
        portfolio_id: portfolio_id,
        subject: subject,
        content: content,
        sent_at: new Date().toISOString()
      })
      .select()
      .single();

    if (recapError) {
      console.error('Error storing recap:', recapError);
      return new Response(
        JSON.stringify({ error: 'Failed to store recap' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully generated and stored recap:', recap.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        recap_id: recap.id,
        subject: recap.subject,
        preview: content.substring(0, 200) + '...'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in generate-portfolio-recap function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);