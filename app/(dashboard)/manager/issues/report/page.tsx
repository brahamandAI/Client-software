'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  SparklesIcon, 
  PhotoIcon, 
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface StationAmenity {
  _id: string;
  amenityTypeId: {
    _id: string;
    name: string;
    description: string;
  };
  locationDescription: string;
  status: string;
}

export default function ReportIssuePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [amenities, setAmenities] = useState<StationAmenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    amenityId: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    photos: [] as File[]
  });

  // AI Analysis state
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'StationManager') {
      router.push('/login');
      return;
    }
    fetchAmenities();
  }, [session, status, router]);

  const fetchAmenities = async () => {
    try {
      const response = await fetch(`/api/stations/${session?.user?.stationId}/amenities`);
      if (response.ok) {
        const data = await response.json();
        setAmenities(data);
      }
    } catch (error) {
      console.error('Error fetching amenities:', error);
    } finally {
      setLoading(false);
    }
  };

  // AI Photo Analysis Function
  const analyzePhoto = async (photo: File) => {
    if (!aiEnabled) {
      toast.error('Please enable AI Analysis first');
      return;
    }
    
    if (!formData.amenityId) {
      toast.error('Please select an amenity first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const selectedAmenity = amenities.find(a => a._id === formData.amenityId);
      const amenityType = selectedAmenity?.amenityTypeId.name || 'Amenity';

      console.log('🔍 Starting AI analysis for:', amenityType);

      const formDataForAI = new FormData();
      formDataForAI.append('image', photo);
      formDataForAI.append('amenityType', amenityType);

      const response = await fetch('/api/ai/analyze-photo', {
        method: 'POST',
        body: formDataForAI,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ AI Analysis Result:', result);
        setAiAnalysis(result);

        // Auto-fill form with AI suggestions
        setFormData(prev => ({
          ...prev,
          description: result.description.description,
          priority: result.description.priority
        }));

        toast.success('AI analysis completed! Form auto-filled with suggestions.');
      } else {
        const error = await response.json();
        console.error('❌ AI Analysis Error:', error);
        toast.error(error.error || 'AI analysis failed');
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      toast.error('Failed to analyze photo');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('amenityId', formData.amenityId);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('priority', formData.priority);
      formDataToSend.append('reportedBy', session?.user?.name || 'Manager');
      
      // Add photos
      formData.photos.forEach((photo, index) => {
        formDataToSend.append('photos', photo);
      });

      const response = await fetch('/api/issues', {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        alert('Issue reported successfully!');
        router.push('/manager/issues');
      } else {
        const error = await response.json();
        alert(`Error reporting issue: ${error.error}`);
      }
    } catch (error) {
      console.error('Error reporting issue:', error);
      alert('Error reporting issue');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData({
        ...formData,
        photos: files
      });

      // Trigger AI analysis for the first photo if AI is enabled
      if (files.length > 0 && aiEnabled) {
        analyzePhoto(files[0]);
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (status === 'loading' || loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Report New Issue</h1>
          <p className="text-gray-600 mt-1">Report an issue with station amenities</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/manager/issues')}>
          Back to Issues
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Issue Details</h2>
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-railway-orange" />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
                className="rounded"
              />
              AI Analysis
            </label>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Select Amenity</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-md"
              value={formData.amenityId}
              onChange={(e) => setFormData({...formData, amenityId: e.target.value})}
              required
            >
              <option value="">Choose an amenity...</option>
              {amenities.map(amenity => (
                <option key={amenity._id} value={amenity._id}>
                  {amenity.amenityTypeId?.name || 'Amenity'} - {amenity.locationDescription}
                  {amenity.status !== 'ok' && ` (${amenity.status.replace('_', ' ')})`}
                </option>
              ))}
            </select>
            {amenities.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">No amenities available. Add amenities first.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Issue Description</label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md h-32"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe the issue in detail. What's wrong? When did you notice it? Any specific symptoms?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Priority Level</label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'low', label: 'Low', description: 'Minor issue, can wait' },
                { value: 'medium', label: 'Medium', description: 'Moderate impact' },
                { value: 'high', label: 'High', description: 'Urgent, needs immediate attention' }
              ].map(priority => (
                <div
                  key={priority.value}
                  className={`p-4 border rounded-md cursor-pointer transition-colors ${
                    formData.priority === priority.value
                      ? 'border-railway-orange bg-railway-lightOrange/20'
                      : 'border-gray-300 hover:border-railway-orange/50'
                  }`}
                  onClick={() => setFormData({...formData, priority: priority.value as any})}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="radio"
                      name="priority"
                      value={priority.value}
                      checked={formData.priority === priority.value}
                      onChange={() => setFormData({...formData, priority: priority.value as any})}
                      className="text-railway-orange"
                    />
                    <Badge className={getPriorityColor(priority.value)}>
                      {priority.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{priority.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Photos (Optional)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <p className="text-sm text-gray-500 mt-1">
              Upload photos to help describe the issue. Multiple photos can be selected.
              {aiEnabled && (
                <span className="text-railway-orange font-medium"> AI will automatically analyze the first photo.</span>
              )}
            </p>
            {formData.photos.length > 0 && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium">Selected Photos:</p>
                  {aiEnabled && formData.photos.length > 0 && (
                    <Button
                      type="button"
                      onClick={() => analyzePhoto(formData.photos[0])}
                      disabled={isAnalyzing || !formData.amenityId}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <SparklesIcon className="h-4 w-4" />
                      {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newPhotos = formData.photos.filter((_, i) => i !== index);
                          setFormData({...formData, photos: newPhotos});
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Analysis Loading */}
          {isAnalyzing && (
            <div className="p-4 bg-gradient-to-r from-railway-lightOrange/20 to-railway-cream/20 border border-railway-orange/30 rounded-lg">
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-railway-orange animate-spin" />
                <span className="text-railway-darkOrange font-medium">AI is analyzing your photo...</span>
              </div>
            </div>
          )}

          {/* AI Analysis Results */}
          {aiAnalysis && !isAnalyzing && (
            <div className="p-4 bg-gradient-to-r from-railway-lightOrange/10 to-railway-cream/10 border border-railway-orange/20 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-railway-orange">AI Analysis Complete</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Issue Type:</p>
                  <p className="text-sm text-gray-900">{aiAnalysis.analysis.issueType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Severity:</p>
                  <Badge className={`${
                    aiAnalysis.analysis.severity === 'high' ? 'bg-red-100 text-red-800' :
                    aiAnalysis.analysis.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {aiAnalysis.analysis.severity.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Confidence:</p>
                  <p className="text-sm text-gray-900">{aiAnalysis.analysis.confidence}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">AI Suggestions:</p>
                  <ul className="text-sm text-gray-600 list-disc list-inside">
                    {aiAnalysis.analysis.suggestions.map((suggestion: string, index: number) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-3 bg-white border border-railway-orange/20 rounded">
                <p className="text-sm font-medium text-gray-700 mb-1">AI Generated Description:</p>
                <p className="text-sm text-gray-900">{aiAnalysis.description.description}</p>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={submitting || !formData.amenityId}>
              {submitting ? 'Reporting Issue...' : 'Report Issue'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/manager/issues')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
