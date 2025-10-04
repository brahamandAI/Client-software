'use client';

import React, { useState } from 'react';
import { 
  SparklesIcon, 
  PhotoIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

interface PhotoAnalysisProps {
  onAnalysisComplete: (analysis: any) => void;
  amenityType: string;
  disabled?: boolean;
}

export default function PhotoAnalysis({ onAnalysisComplete, amenityType, disabled = false }: PhotoAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const analyzePhoto = async (photo: File) => {
    if (disabled) return;

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('image', photo);
      formData.append('amenityType', amenityType);

      const response = await fetch('/api/ai/analyze-photo', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setAnalysis(result);
        onAnalysisComplete(result);
        toast.success('AI analysis completed!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'AI analysis failed');
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      toast.error('Failed to analyze photo');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      analyzePhoto(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">
          <PhotoIcon className="h-4 w-4 inline mr-1" />
          Upload Photo for AI Analysis
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled || isAnalyzing}
          className="w-full p-2 border border-gray-300 rounded-md disabled:opacity-50"
        />
      </div>

      {/* Analysis Status */}
      {isAnalyzing && (
        <div className="p-4 bg-railway-lightOrange/20 border border-railway-orange/30 rounded-lg">
          <div className="flex items-center gap-2 text-railway-orange">
            <SparklesIcon className="h-5 w-5 animate-spin" />
            <span className="font-medium">AI is analyzing your photo...</span>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && !isAnalyzing && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700 mb-3">
            <CheckCircleIcon className="h-5 w-5" />
            <span className="font-medium">AI Analysis Complete</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Issue Type:</strong> {analysis.analysis.issueType}</p>
              <p><strong>Severity:</strong> 
                <Badge className={`ml-2 ${
                  analysis.analysis.severity === 'high' ? 'bg-red-100 text-red-800' :
                  analysis.analysis.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {analysis.analysis.severity.toUpperCase()}
                </Badge>
              </p>
              <p><strong>Confidence:</strong> {analysis.analysis.confidence}%</p>
            </div>
            <div>
              <p><strong>AI Suggestions:</strong></p>
              <ul className="list-disc list-inside text-xs text-gray-600 mt-1">
                {analysis.analysis.suggestions.map((suggestion: string, index: number) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-3 p-3 bg-white border border-green-200 rounded">
            <p className="text-sm"><strong>AI Generated Description:</strong></p>
            <p className="text-sm text-gray-700 mt-1">{analysis.description.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
