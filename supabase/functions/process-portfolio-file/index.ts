import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PortfolioHolding {
  symbol: string;
  name?: string;
  sector?: string;
}

// Mock security master data for validation
interface ProcessRequest {
  portfolio_id: string;
  file_path: string;
  column_mapping?: {
    nameColumn: number;
    tickerColumn: number;
  } | null;
}

// Mock security master data for validation
const SECURITY_MASTER = {
  'AAPL': { name: 'Apple Inc.', sector: 'Technology' },
  'GOOGL': { name: 'Alphabet Inc.', sector: 'Technology' },
  'MSFT': { name: 'Microsoft Corporation', sector: 'Technology' },
  'AMZN': { name: 'Amazon.com Inc.', sector: 'Consumer Discretionary' },
  'TSLA': { name: 'Tesla Inc.', sector: 'Consumer Discretionary' },
  'NVDA': { name: 'NVIDIA Corporation', sector: 'Technology' },
  'JPM': { name: 'JPMorgan Chase & Co.', sector: 'Financials' },
  'JNJ': { name: 'Johnson & Johnson', sector: 'Healthcare' },
  'V': { name: 'Visa Inc.', sector: 'Financials' },
  'PG': { name: 'Procter & Gamble Co.', sector: 'Consumer Staples' }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { portfolio_id, file_path, column_mapping } = await req.json() as ProcessRequest;

    if (!portfolio_id || !file_path) {
      throw new Error('Missing portfolio_id or file_path')
    }

    console.log(`Processing file: ${file_path} for portfolio: ${portfolio_id}`)

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('portfolios')
      .download(file_path)

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`)
    }

    // Convert file to text for processing
    const fileText = await fileData.text()
    console.log('File content length:', fileText.length)

    // Parse CSV data
    const lines = fileText.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    
    console.log('Headers found:', headers)

    // Use user-provided column mapping if available, otherwise auto-detect
    let symbolIndex: number;
    let nameIndex: number;
    
    if (column_mapping) {
      nameIndex = column_mapping.nameColumn;
      symbolIndex = column_mapping.tickerColumn;
      console.log(`Using user-provided column mapping: name=${nameIndex}, ticker=${symbolIndex}`);
    } else {
      // Find column indices by searching headers for keywords
      symbolIndex = headers.findIndex(h => h.includes('symbol') || h.includes('ticker'));
      nameIndex = headers.findIndex(h => h.includes('name') || h.includes('security'));
      console.log(`Auto-detected columns: name=${nameIndex}, ticker=${symbolIndex}`);
    }

    if (symbolIndex === -1) {
      throw new Error('Could not find symbol/ticker column in the uploaded file')
    }

    const holdings: PortfolioHolding[] = []

    // Process each data row - only extract name and ticker
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(cell => cell.trim())
      
      if (row.length < headers.length || !row[symbolIndex]) continue

      const symbol = row[symbolIndex].toUpperCase()
      const securityInfo = SECURITY_MASTER[symbol as keyof typeof SECURITY_MASTER]
      
      const holding: PortfolioHolding = {
        symbol,
        name: nameIndex >= 0 ? row[nameIndex] : securityInfo?.name,
        sector: securityInfo?.sector
      }

      holdings.push(holding)
    }

    console.log(`Parsed ${holdings.length} holdings`)

    // Validate and insert holdings into database - only name, ticker, and sector
    const holdingsToInsert = holdings.map(holding => ({
      portfolio_id,
      symbol: holding.symbol,
      name: holding.name,
      sector: holding.sector,
      validated: !!SECURITY_MASTER[holding.symbol as keyof typeof SECURITY_MASTER],
      validation_status: SECURITY_MASTER[holding.symbol as keyof typeof SECURITY_MASTER] 
        ? 'Valid' 
        : 'Unknown security - not found in master database'
    }))

    // Clear existing holdings for this portfolio
    const { error: deleteError } = await supabase
      .from('portfolio_holdings')
      .delete()
      .eq('portfolio_id', portfolio_id)

    if (deleteError) {
      console.error('Error deleting existing holdings:', deleteError)
    }

    // Insert new holdings
    const { error: insertError } = await supabase
      .from('portfolio_holdings')
      .insert(holdingsToInsert)

    if (insertError) {
      throw new Error(`Failed to insert holdings: ${insertError.message}`)
    }

    const validCount = holdingsToInsert.filter(h => h.validated).length
    const invalidCount = holdingsToInsert.length - validCount

    console.log(`Inserted ${holdingsToInsert.length} holdings (${validCount} valid, ${invalidCount} unvalidated)`)

    return new Response(
      JSON.stringify({
        success: true,
        holdings_processed: holdingsToInsert.length,
        valid_securities: validCount,
        invalid_securities: invalidCount,
        message: `Successfully processed ${holdingsToInsert.length} holdings. ${validCount} securities validated against master database.`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error processing portfolio file:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})