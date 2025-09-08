// Azure OpenAI integration for menu analysis

interface MenuAnalysisRequest {
  menuItems: string[];
  userConditions?: string[];
  dietaryRestrictions?: string[];
}

interface DishAnalysis {
  dish: string;
  safetyScore: number; // 0-100, higher is safer
  riskLevel: 'low' | 'medium' | 'high';
  triggers: string[];
  recommendations: string;
  modifications?: string[];
}

interface MenuAnalysisResponse {
  analyses: DishAnalysis[];
  overallRecommendation: string;
  safestOptions: string[];
  riskiestOptions: string[];
}

export class AzureOpenAIService {
  private apiKey: string;
  private endpoint: string;
  private deploymentName: string = 'gpt-5'; // Correct deployment name
  private useMockData: boolean = true; // Always use mock data - OpenAI disabled

  constructor() {
    this.apiKey = Deno.env.get('AZURE_OPENAI_KEY') || '';
    this.endpoint = Deno.env.get('AZURE_OPENAI_ENDPOINT') || '';
    
    console.log('Azure OpenAI Configuration:');
    console.log('- OpenAI DISABLED - Using mock data only');
    console.log('- Has API Key:', !!this.apiKey);
    console.log('- Raw Endpoint:', this.endpoint);
    
    // Force mock mode - OpenAI is disabled
    this.useMockData = true;
    console.log('- Mock mode: ENABLED (OpenAI disabled by configuration)');
  }

  async analyzeMenu(request: MenuAnalysisRequest): Promise<any> {
    // Use mock data if endpoint is invalid or missing
    if (this.useMockData) {
      console.log('Using mock data for menu analysis');
      return this.getMockMenuAnalysis(request);
    }

    try {
      console.log('Starting menu analysis for:', request.menuItems.length, 'items');
      console.log('User conditions:', request.userConditions);
      console.log('Dietary restrictions:', request.dietaryRestrictions);
      
      const prompt = this.buildMenuAnalysisPrompt(request);
      const response = await this.callAzureOpenAI(prompt);
      const parsed = this.parseMenuAnalysisResponse(response);
      
      // Convert to the format expected by the frontend
      const result = {
        dishes: parsed.analyses.map(analysis => ({
          name: analysis.dish,
          safetyScore: Math.round(analysis.safetyScore / 10), // Convert 0-100 to 0-10 scale
          warnings: analysis.triggers,
          recommendations: analysis.recommendations,
          modifications: analysis.modifications || []
        })),
        overallRecommendation: parsed.overallRecommendation,
        safestOptions: parsed.safestOptions,
        riskiestOptions: parsed.riskiestOptions
      };
      
      console.log('Menu analysis completed successfully');
      return result;
    } catch (error) {
      console.error('Error analyzing menu, falling back to mock data:', error);
      // Fall back to mock data on any error
      return this.getMockMenuAnalysis(request);
    }
  }

  private getMockMenuAnalysis(request: MenuAnalysisRequest): any {
    const mockAnalyses = request.menuItems.map((item, index) => {
      const itemName = typeof item === 'string' ? item : item.name || 'Unknown Dish';
      const itemLower = itemName.toLowerCase();
      
      // Enhanced logic for safety scoring based on ingredients and cooking methods
      let safetyScore = 7; // Default neutral score
      const warnings: string[] = [];
      const modifications: string[] = [];
      
      // High-risk ingredients and preparation methods
      if (itemLower.includes('fried') || itemLower.includes('deep fried') || itemLower.includes('battered')) {
        safetyScore = Math.max(3, safetyScore - 3);
        warnings.push('High fat content from frying');
        warnings.push('May cause bloating and digestive discomfort');
        modifications.push('Ask for grilled or baked instead');
        modifications.push('Request minimal oil preparation');
      }
      
      if (itemLower.includes('spicy') || itemLower.includes('jalapeño') || itemLower.includes('hot') || itemLower.includes('chili') || itemLower.includes('pepper')) {
        safetyScore = Math.max(4, safetyScore - 2);
        warnings.push('Spicy ingredients may irritate digestive system');
        modifications.push('Request mild seasoning');
        modifications.push('Ask for spice on the side');
      }
      
      if (itemLower.includes('dairy') || itemLower.includes('cheese') || itemLower.includes('cream') || itemLower.includes('butter') || itemLower.includes('milk')) {
        safetyScore = Math.max(4, safetyScore - 1);
        warnings.push('Contains dairy products');
        modifications.push('Ask for dairy-free alternative');
        modifications.push('Request light cheese or no cheese');
      }
      
      if (itemLower.includes('garlic') || itemLower.includes('onion')) {
        safetyScore = Math.max(5, safetyScore - 1);
        warnings.push('Contains FODMAP ingredients');
        modifications.push('Request minimal garlic and onion');
      }
      
      // Medium-risk items
      if (itemLower.includes('pizza') || itemLower.includes('burger') || itemLower.includes('sandwich')) {
        safetyScore = Math.max(5, safetyScore - 1);
        if (itemLower.includes('pizza')) {
          warnings.push('High fat and dairy content');
          modifications.push('Choose thin crust and light cheese');
        }
      }
      
      if (itemLower.includes('pasta') || itemLower.includes('spaghetti') || itemLower.includes('noodles')) {
        safetyScore = Math.max(6, safetyScore - 1);
        warnings.push('High carbohydrate content');
        modifications.push('Ask for whole wheat option if available');
        modifications.push('Request smaller portion size');
      }
      
      // Safe options that boost the score
      if (itemLower.includes('salad') || itemLower.includes('greens') || itemLower.includes('lettuce')) {
        safetyScore = Math.min(9, safetyScore + 2);
        modifications.push('Ask for dressing on the side');
      }
      
      if (itemLower.includes('grilled') || itemLower.includes('baked') || itemLower.includes('steamed') || itemLower.includes('roasted')) {
        safetyScore = Math.min(8, safetyScore + 1);
      }
      
      if (itemLower.includes('soup') || itemLower.includes('broth')) {
        safetyScore = Math.min(8, safetyScore + 1);
        modifications.push('Choose clear broth over cream-based');
      }
      
      if (itemLower.includes('chicken') || itemLower.includes('fish') || itemLower.includes('salmon')) {
        safetyScore = Math.min(8, safetyScore + 1);
        modifications.push('Ask for grilled preparation');
      }
      
      // Consider user conditions if provided
      if (request.userConditions && request.userConditions.length > 0) {
        const hasIBS = request.userConditions.some(c => c.toLowerCase().includes('ibs'));
        const hasGERD = request.userConditions.some(c => c.toLowerCase().includes('gerd') || c.toLowerCase().includes('reflux'));
        const hasLactose = request.userConditions.some(c => c.toLowerCase().includes('lactose'));
        
        if (hasIBS && (itemLower.includes('beans') || itemLower.includes('cabbage') || itemLower.includes('onion'))) {
          safetyScore = Math.max(3, safetyScore - 2);
          warnings.push('High FODMAP content - may trigger IBS symptoms');
        }
        
        if (hasGERD && (itemLower.includes('tomato') || itemLower.includes('citrus') || itemLower.includes('spicy'))) {
          safetyScore = Math.max(4, safetyScore - 2);
          warnings.push('Acidic ingredients may trigger GERD symptoms');
        }
        
        if (hasLactose && warnings.some(w => w.includes('dairy'))) {
          safetyScore = Math.max(3, safetyScore - 1);
          warnings.push('Not suitable for lactose intolerance');
        }
      }
      
      // Generate appropriate recommendations based on score
      let recommendations = '';
      if (safetyScore >= 8) {
        recommendations = `${itemName} appears to be a good choice for digestive health. Safety score: ${safetyScore}/10.`;
      } else if (safetyScore >= 6) {
        recommendations = `${itemName} is moderately safe. Safety score: ${safetyScore}/10. ${warnings.length > 0 ? 'Consider the suggested modifications.' : ''}`;
      } else {
        recommendations = `${itemName} may be challenging for sensitive digestion. Safety score: ${safetyScore}/10. ${warnings.length > 0 ? 'Exercise caution and consider modifications.' : ''}`;
      }
      
      // Add condition-specific advice
      if (request.userConditions && request.userConditions.length > 0) {
        recommendations += ` Based on your ${request.userConditions.join(', ').toLowerCase()} condition(s), this assessment considers your specific dietary needs.`;
      }
      
      return {
        name: itemName,
        safetyScore,
        warnings,
        recommendations,
        modifications: modifications.length > 0 ? modifications : ['No specific modifications needed']
      };
    });

    // Calculate overall insights
    const averageScore = mockAnalyses.reduce((sum, dish) => sum + dish.safetyScore, 0) / mockAnalyses.length;
    const safestOptions = mockAnalyses
      .filter(d => d.safetyScore >= 8)
      .sort((a, b) => b.safetyScore - a.safetyScore)
      .slice(0, 3)
      .map(d => d.name);
    
    const riskiestOptions = mockAnalyses
      .filter(d => d.safetyScore <= 5)
      .sort((a, b) => a.safetyScore - b.safetyScore)
      .slice(0, 3)
      .map(d => d.name);

    let overallRecommendation = '';
    if (averageScore >= 7) {
      overallRecommendation = `This menu has generally good options for digestive health. Focus on the items with higher safety scores and consider the suggested modifications.`;
    } else if (averageScore >= 5) {
      overallRecommendation = `This menu has mixed options. Choose carefully and pay attention to preparation methods and ingredients that may trigger symptoms.`;
    } else {
      overallRecommendation = `This menu may be challenging for sensitive digestion. Consider modifications or stick to the safest options available.`;
    }
    
    if (request.userConditions && request.userConditions.length > 0) {
      overallRecommendation += ` These recommendations are tailored for ${request.userConditions.join(', ').toLowerCase()}.`;
    }

    console.log('Generated mock analysis for', mockAnalyses.length, 'items with average safety score:', averageScore.toFixed(1));

    return {
      dishes: mockAnalyses,
      overallRecommendation,
      safestOptions: safestOptions.length > 0 ? safestOptions : ['No highly safe options found'],
      riskiestOptions: riskiestOptions.length > 0 ? riskiestOptions : ['No high-risk options identified']
    };
  }

  private buildMenuAnalysisPrompt(request: MenuAnalysisRequest): string {
    const conditions = request.userConditions?.join(', ') || 'general digestive sensitivity';
    const restrictions = request.dietaryRestrictions?.join(', ') || 'none';
    
    return `You are a digestive health expert analyzing restaurant menu items for someone with ${conditions}. 
    
Dietary restrictions: ${restrictions}

Please analyze each of these menu items and provide a JSON response with the following structure:

{
  "analyses": [
    {
      "dish": "dish name",
      "safetyScore": 85,
      "riskLevel": "low",
      "triggers": ["potential trigger ingredients"],
      "recommendations": "why this dish is safe/risky and recommendations",
      "modifications": ["suggested modifications to make it safer"]
    }
  ],
  "overallRecommendation": "general advice for this menu",
  "safestOptions": ["top 3 safest dishes"],
  "riskiestOptions": ["top 3 riskiest dishes"]
}

Menu items to analyze:
${request.menuItems.map((item, index) => `${index + 1}. ${item}`).join('\n')}

Important guidelines:
- Safety score: 0-100 (higher = safer for digestive health)
- Consider common triggers: dairy, gluten, spicy foods, high fat, beans, cruciferous vegetables, artificial sweeteners
- Risk levels: low (80-100), medium (50-79), high (0-49)
- Be specific about ingredients that might cause issues
- Suggest realistic modifications when possible
- Focus on digestive health implications`;
  }

  private async callAzureOpenAI(prompt: string): Promise<string> {
    // Use a more compatible API version for legacy endpoints
    const apiVersion = this.endpoint.includes('.cognitiveservices.') ? '2024-02-15-preview' : '2025-04-01-preview';
    const url = `${this.endpoint}/openai/deployments/${this.deploymentName}/chat/completions?api-version=${apiVersion}`;
    
    console.log('Making Azure OpenAI request to:', url);
    console.log('Using API version:', apiVersion);
    console.log('Endpoint breakdown:');
    console.log('- Base endpoint:', this.endpoint);
    console.log('- Deployment:', this.deploymentName);
    console.log('- Full URL:', url);
    
    // Test DNS resolution first
    console.log('Testing endpoint reachability...');
    try {
      const testResponse = await fetch(this.endpoint, { method: 'HEAD' });
      console.log('Endpoint test status:', testResponse.status);
    } catch (dnsError) {
      console.error('DNS/Network test failed:', dnsError.message);
      throw new Error(`Network connectivity issue: ${dnsError.message}`);
    }
    
    console.log('Request body size:', JSON.stringify({
      messages: [
        {
          role: 'system',
          content: 'You are a digestive health expert who analyzes restaurant menus. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.3,
      response_format: { type: 'json_object' }
    }).length, 'characters');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a digestive health expert who analyzes restaurant menus. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
        response_format: { type: 'json_object' }
      }),
    });

    console.log('Azure OpenAI response status:', response.status);
    console.log('Azure OpenAI response headers:', Object.fromEntries(response.headers));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI error response:', errorText);
      throw new Error(`Azure OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Azure OpenAI response data keys:', Object.keys(data));
    console.log('Azure OpenAI response choices length:', data.choices?.length);
    
    const content = data.choices[0]?.message?.content || '';
    console.log('Azure OpenAI response content length:', content.length);
    
    return content;
  }

  private parseMenuAnalysisResponse(responseText: string): MenuAnalysisResponse {
    try {
      const parsed = JSON.parse(responseText);
      
      // Validate the response structure
      if (!parsed.analyses || !Array.isArray(parsed.analyses)) {
        throw new Error('Invalid response structure');
      }

      // Ensure all required fields are present and valid
      parsed.analyses.forEach((analysis: any) => {
        if (!analysis.dish || typeof analysis.safetyScore !== 'number') {
          throw new Error('Invalid analysis structure');
        }
        
        // Clamp safety score to 0-100
        analysis.safetyScore = Math.max(0, Math.min(100, analysis.safetyScore));
        
        // Ensure arrays exist
        analysis.triggers = analysis.triggers || [];
        analysis.modifications = analysis.modifications || [];
      });

      return {
        analyses: parsed.analyses,
        overallRecommendation: parsed.overallRecommendation || 'No specific recommendations available.',
        safestOptions: parsed.safestOptions || [],
        riskiestOptions: parsed.riskiestOptions || []
      };
    } catch (error) {
      console.error('Error parsing menu analysis response:', error);
      throw new Error('Failed to parse menu analysis');
    }
  }

  async analyzeSingleDish(dishName: string, userConditions?: string[]): Promise<any> {
    try {
      console.log('Starting single dish analysis for:', dishName);
      console.log('User conditions:', userConditions);
      
      const request: MenuAnalysisRequest = {
        menuItems: [dishName],
        userConditions
      };
      
      const response = await this.analyzeMenu(request);
      
      // Return the first dish analysis in the format expected by frontend
      const dishAnalysis = response.dishes[0];
      return {
        safetyScore: dishAnalysis.safetyScore,
        warnings: dishAnalysis.warnings,
        recommendations: dishAnalysis.recommendations,
        modifications: dishAnalysis.modifications
      };
    } catch (error) {
      console.error('Error analyzing single dish:', error);
      throw new Error(`Failed to analyze dish: ${error.message}`);
    }
  }
}

export const azureOpenAIService = new AzureOpenAIService();