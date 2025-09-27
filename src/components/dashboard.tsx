import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Upload, FileText, Image, Brain, Zap, TrendingUp, Calendar, Clock } from 'lucide-react';
import { getUserSummaries } from '../utils/api';
import type { UserProgress } from '../utils/api';

interface DashboardProps {
  onPageChange: (page: string) => void;
  userProgress: UserProgress;
  updateUserProgress: (progress: Partial<UserProgress>) => void;
  isBackendReady: boolean;
}

export function Dashboard({ onPageChange, userProgress, updateUserProgress, isBackendReady }: DashboardProps) {
  const [recentSummaries, setRecentSummaries] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load user summaries
  useEffect(() => {
    const loadSummaries = async () => {
      if (!isBackendReady) return; // Skip loading in demo mode
      
      try {
        setLoading(true);
        const response = await getUserSummaries(userProgress.userId);
        if (response.success) {
          setRecentSummaries(response.summaries.slice(0, 3)); // Show latest 3
        }
      } catch (error) {
        console.error('Failed to load summaries:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSummaries();
  }, [isBackendReady, userProgress.userId]);

  const mockRecentUploads = [
    {
      id: 1,
      title: "Strategic Management Framework",
      type: "PDF",
      date: "2 hours ago",
      tags: ["Management", "Strategy", "Planning"],
      processed: true
    },
    {
      id: 2,
      title: "Leadership Styles & Theory",
      type: "Image",
      date: "1 day ago",
      tags: ["Leadership", "Management", "Theory"],
      processed: true
    },
    {
      id: 3,
      title: "E-commerce Business Models",
      type: "Text",
      date: "2 days ago",
      tags: ["E-commerce", "Business", "Digital"],
      processed: true
    }
  ];

  // Format data for display
  const formatUploadData = (data: any) => {
    if (isBackendReady && data.value) {
      // Real backend data
      const summary = data.value;
      return {
        id: summary.id,
        title: summary.subject ? `${summary.subject} Notes` : 'Study Notes',
        type: 'Summary',
        date: new Date(summary.processedAt).toLocaleDateString(),
        tags: [summary.subject || 'General'],
        processed: true
      };
    } else {
      // Mock data or fallback
      return data;
    }
  };

  const displayData = isBackendReady 
    ? recentSummaries.map(formatUploadData)
    : mockRecentUploads;

  const stats = [
    { label: "Study Streak", value: userProgress.streak, unit: "days", icon: TrendingUp, color: "text-[--neon-green]" },
    { label: "Total Notes", value: displayData.length, unit: "files", icon: FileText, color: "text-[--neon-blue]" },
    { label: "XP Points", value: userProgress.xp, unit: "pts", icon: Zap, color: "text-[--neon-purple]" }
  ];

  return (
    <div className="flex-1 p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold gradient-text">Welcome back to Tate Studies</h1>
        <p className="text-xl text-muted-foreground">Turn notes into knowledge.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-border/50 bg-gradient-to-br from-card to-accent/20 hover:scale-105 transition-transform duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value}
                <span className="text-sm font-normal text-muted-foreground ml-1">{stat.unit}</span>
              </div>
              {stat.label === "Study Streak" && (
                <Progress value={(userProgress.streak / 10) * 100} className="mt-2" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Action */}
      <Card className="border-2 border-dashed border-[--neon-blue]/30 bg-gradient-to-br from-[--neon-blue]/5 to-[--neon-purple]/5 hover:border-[--neon-blue]/50 transition-all duration-300">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[--neon-blue] to-[--neon-purple] rounded-full flex items-center justify-center animate-pulse-gentle">
              <Upload className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Ready to learn something new?</h3>
              <p className="text-muted-foreground">Upload your notes and let AI do the heavy lifting</p>
            </div>
            <Button
              size="lg"
              onClick={() => onPageChange('upload')}
              className="bg-gradient-to-r from-[--neon-blue] to-[--neon-purple] hover:from-[--neon-blue]/80 hover:to-[--neon-purple]/80 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload Notes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Uploads */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recent Uploads</h2>
          <Button variant="ghost" onClick={() => onPageChange('summaries')}>
            View All
          </Button>
        </div>
        
        <div className="grid gap-4">
          {displayData.length > 0 ? displayData.map((upload) => (
            <Card 
              key={upload.id} 
              className="border-border/50 hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => onPageChange('summaries')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[--neon-blue]/20 to-[--neon-purple]/20 rounded-lg flex items-center justify-center">
                      {(upload.type === 'PDF' || upload.type === 'Summary') && <FileText className="h-6 w-6 text-[--neon-blue]" />}
                      {upload.type === 'Image' && <Image className="h-6 w-6 text-[--neon-purple]" />}
                      {upload.type === 'Text' && <FileText className="h-6 w-6 text-[--neon-green]" />}
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-[--neon-blue] transition-colors">
                        {upload.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {upload.date}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-wrap gap-1">
                      {upload.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {upload.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{upload.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                    {upload.processed && (
                      <div className="flex items-center gap-1 text-[--neon-green]">
                        <Brain className="h-4 w-4" />
                        <span className="text-xs">Processed</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <Card className="border-dashed border-border/50">
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-lg flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-muted-foreground">No uploads yet</h3>
                    <p className="text-sm text-muted-foreground">Start by uploading your first notes</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => onPageChange('upload')}
                    className="mt-4"
                  >
                    Upload Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}