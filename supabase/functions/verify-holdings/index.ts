// Portfolio holdings verification edge function
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VerifyRequest {
  portfolio_id: string;
  file_path: string;
}

// Placeholder verification script content
const verifyHoldingsScript = `
# verifyHoldings.py
# Placeholder Python script for portfolio holdings verification

import csv
import json
from typing import Dict, List, Any

def verify_portfolio_holdings(file_content: str) -> Dict[str, Any]:
    """
    Verify portfolio holdings from uploaded file content.
    
    Args:
        file_content: Raw CSV/Excel file content
        
    Returns:
        Dict containing verification results
    """
    
    # Placeholder verification logic
    verification_results = {
        "status": "verified",
        "total_holdings": 0,
        "verified_holdings": 0,
        "unverified_holdings": 0,
        "warnings": [],
        "errors": []
    }
    
    try:
        # Parse CSV content (placeholder)
        lines = file_content.strip().split('\\n')
        headers = lines[0].split(',') if lines else []
        
        verification_results["total_holdings"] = len(lines) - 1  # Exclude header
        verification_results["verified_holdings"] = len(lines) - 1
        
        # Add placeholder validation warnings
        if len(lines) < 2:
            verification_results["warnings"].append("No holdings found in file")
            verification_results["status"] = "warning"
        
        return verification_results
        
    except Exception as e:
        verification_results["status"] = "error"
        verification_results["errors"].append(f"Failed to parse file: {str(e)}")
        return verification_results

def main():
    """Main verification function"""
    print("Portfolio holdings verification complete")

if __name__ == "__main__":
    main()
`;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { portfolio_id, file_path }: VerifyRequest = await req.json();

    console.log(`Starting verification for portfolio ${portfolio_id}, file: ${file_path}`);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('portfolios')
      .download(file_path);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Get file content as text
    const fileContent = await fileData.text();
    console.log(`File content length: ${fileContent.length} characters`);

    // Simulate Python script execution with placeholder logic
    const verificationResults = {
      status: "verified",
      total_holdings: 0,
      verified_holdings: 0,
      unverified_holdings: 0,
      warnings: [] as string[],
      errors: [] as string[],
      script_output: verifyHoldingsScript
    };

    try {
      // Parse CSV content for basic validation
      const lines = fileContent.trim().split('\n');
      const headers = lines[0]?.split(',') || [];
      
      verificationResults.total_holdings = Math.max(0, lines.length - 1);
      verificationResults.verified_holdings = Math.max(0, lines.length - 1);
      
      // Basic validation
      if (lines.length < 2) {
        verificationResults.warnings.push("No holdings found in file");
        verificationResults.status = "warning";
      }
      
      if (!headers.some(h => h.toLowerCase().includes('symbol'))) {
        verificationResults.warnings.push("No symbol column detected");
      }
      
    } catch (parseError: any) {
      verificationResults.status = "error";
      verificationResults.errors.push(`Failed to parse file: ${parseError.message}`);
    }

    console.log(`Verification complete: ${verificationResults.total_holdings} holdings processed`);

    return new Response(
      JSON.stringify({
        success: true,
        verification_results: verificationResults,
        message: 'Portfolio verification completed'
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error: any) {
    console.error('Verification error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});