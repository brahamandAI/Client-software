// AI Service for OpenAI Integration
// Handles photo analysis and description generation

interface PhotoAnalysisResult {
  issueType: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  confidence: number;
  suggestions: string[];
}

interface DescriptionResult {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

class AIService {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
  }

  // Analyze photo and detect issues
  async analyzePhoto(imageBase64: string, amenityType: string = 'General'): Promise<PhotoAnalysisResult> {
    try {
      console.log('🔍 AI Service: Starting photo analysis...');
      console.log('Image size:', imageBase64.length);
      console.log('Amenity type:', amenityType);
      
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this railway station ${amenityType} amenity photo and provide:
                  1. Issue type (water leak, broken seat, lighting issue, clean/working, etc.)
                  2. Severity level (low, medium, high)
                  3. Detailed description of what you see
                  4. Confidence level (0-100)
                  5. Maintenance suggestions
                  
                  Respond in JSON format:
                  {
                    "issueType": "string",
                    "severity": "low|medium|high",
                    "description": "string",
                    "confidence": number,
                    "suggestions": ["string1", "string2"]
                  }`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`,
                    detail: 'high'
                  }
                }
              ]
            }
          ],
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenAI API Error:', response.status, errorData);
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse JSON response - handle markdown code blocks
      let jsonContent = content;
      if (content.includes('```json')) {
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          jsonContent = jsonMatch[1];
        }
      } else if (content.includes('```')) {
        const jsonMatch = content.match(/```\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          jsonContent = jsonMatch[1];
        }
      }
      
      let result;
      try {
        result = JSON.parse(jsonContent);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Content:', jsonContent);
        // Fallback parsing
        result = {
          issueType: 'Analysis Failed',
          severity: 'low',
          description: 'Unable to parse AI response. Please try again.',
          confidence: 0,
          suggestions: ['Please try uploading the photo again', 'Ensure good lighting and clear view']
        };
      }
      
      return {
        issueType: result.issueType || 'Unknown',
        severity: result.severity || 'low',
        description: result.description || 'No description available',
        confidence: result.confidence || 0,
        suggestions: result.suggestions || []
      };
    } catch (error) {
      console.error('Photo analysis error:', error);
      return {
        issueType: 'Analysis Failed',
        severity: 'low',
        description: 'Unable to analyze photo. Please check your API key and try again.',
        confidence: 0,
        suggestions: ['Please try uploading the photo again', 'Ensure good lighting and clear view']
      };
    }
  }

  // Generate smart description from photo analysis
  async generateDescription(analysis: PhotoAnalysisResult, amenityType: string): Promise<DescriptionResult> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: `Based on this railway station amenity analysis, generate a professional issue report:

              Amenity Type: ${amenityType}
              Issue Type: ${analysis.issueType}
              Severity: ${analysis.severity}
              Description: ${analysis.description}
              Confidence: ${analysis.confidence}%

              Generate:
              1. A clear, professional title
              2. A detailed description for the issue report
              3. Appropriate priority level
              4. Category for classification

              Respond in JSON format:
              {
                "title": "string",
                "description": "string", 
                "priority": "low|medium|high",
                "category": "string"
              }`
            }
          ],
          max_tokens: 300
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenAI API Error:', response.status, errorData);
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse JSON response - handle markdown code blocks
      let jsonContent = content;
      if (content.includes('```json')) {
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          jsonContent = jsonMatch[1];
        }
      } else if (content.includes('```')) {
        const jsonMatch = content.match(/```\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          jsonContent = jsonMatch[1];
        }
      }
      
      let result;
      try {
        result = JSON.parse(jsonContent);
      } catch (parseError) {
        console.error('Description JSON Parse Error:', parseError);
        console.error('Content:', jsonContent);
        // Fallback parsing
        result = {
          title: `${analysis.issueType} - ${amenityType}`,
          description: analysis.description,
          priority: analysis.severity,
          category: 'General'
        };
      }
      
      return {
        title: result.title || 'Issue Report',
        description: result.description || analysis.description,
        priority: result.priority || analysis.severity,
        category: result.category || 'General'
      };
    } catch (error) {
      console.error('Description generation error:', error);
      return {
        title: `${analysis.issueType} - ${amenityType}`,
        description: analysis.description,
        priority: analysis.severity,
        category: 'General'
      };
    }
  }

  // Check if API key is configured
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }
}

export const aiService = new AIService();
export type { PhotoAnalysisResult, DescriptionResult };

