import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Download, Gamepad2, FileText, Brain, Lightbulb, Users, Calendar, Tag, Edit, Save, X, Trash2 } from 'lucide-react';
import { getSummary, updateSummary, deleteSummary } from '../utils/api';
import type { Summary } from '../utils/api';

interface SummaryViewProps {
  onPageChange: (page: string) => void;
  isBackendReady: boolean;
}

export function SummaryView({ onPageChange, isBackendReady }: SummaryViewProps) {
  const [selectedNote, setSelectedNote] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    keyNames: [] as Array<{ term: string; description: string }>,
    keyDefinitions: [] as Array<{ term: string; description: string }>,
    importantPoints: [] as Array<{ term: string; description: string }>,
    studyTips: [] as Array<{ term: string; description: string }>
  });
  const [error, setError] = useState<string | null>(null);

  // Load a sample summary for demo purposes
  useEffect(() => {
    if (!isBackendReady) {
      // Use mock data for demo
      setSelectedNote({
        id: 'demo_summary',
        subject: 'Strategic Management',
        processedAt: new Date().toISOString(),
        keyNames: [
          { term: "SWOT Analysis", description: "Framework for analyzing Strengths, Weaknesses, Opportunities, and Threats" },
          { term: "Porter's Five Forces", description: "Model analyzing competitive forces in an industry" },
          { term: "Cost Leadership", description: "Strategy focused on achieving lowest costs in the industry" },
          { term: "Differentiation", description: "Strategy creating unique value propositions for customers" },
          { term: "KPIs", description: "Key Performance Indicators used to measure strategic success" }
        ],
        keyDefinitions: [
          { term: "Strategic Management", description: "The process of formulating, implementing, and evaluating strategies that enable an organization to achieve its objectives and gain competitive advantage." },
          { term: "Competitive Advantage", description: "A condition or circumstance that puts a company in a favorable or superior business position compared to its rivals." },
          { term: "Environmental Analysis", description: "The systematic examination of external factors that may impact an organization's strategic decisions and performance." },
          { term: "Barriers to Entry", description: "Obstacles that make it difficult for new companies to enter a particular market or industry." },
          { term: "Focus Strategy", description: "A competitive strategy that targets a specific, narrow segment of the market with specialized products or services." }
        ],
        importantPoints: [
          { term: "Strategic Process", description: "Strategic management is an ongoing process that requires continuous monitoring and adjustment" },
          { term: "Competitive Advantage", description: "Sustainable competitive advantage comes from aligning internal capabilities with external opportunities" },
          { term: "Analysis Frameworks", description: "SWOT and Porter's Five Forces are essential frameworks for strategic analysis" },
          { term: "Implementation", description: "Successful strategy implementation requires organizational alignment and strong leadership" },
          { term: "Strategy Types", description: "Different competitive strategies (cost leadership, differentiation, focus) suit different market conditions" }
        ],
        studyTips: [
          { term: "Practice Analysis", description: "Regularly practice SWOT and Porter's Five Forces analysis on real companies" },
          { term: "Case Studies", description: "Study successful strategic implementations in different industries" },
          { term: "Framework Application", description: "Apply strategic frameworks to current business news and market changes" }
        ]
      });
    }
  }, [isBackendReady]);

  const handleEdit = () => {
    if (selectedNote) {
      setEditData({
        keyNames: [...selectedNote.keyNames],
        keyDefinitions: [...selectedNote.keyDefinitions],
        importantPoints: [...selectedNote.importantPoints],
        studyTips: [...selectedNote.studyTips]
      });
      setEditing(true);
    }
  };

  const handleSave = async () => {
    if (!selectedNote) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (isBackendReady) {
        await updateSummary(selectedNote.id, editData);
      }
      
      // Update local state
      setSelectedNote(prev => prev ? { ...prev, ...editData } : null);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update summary');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setError(null);
  };

  const handleDelete = async () => {
    if (!selectedNote) return;
    
    if (confirm('Are you sure you want to delete this summary?')) {
      try {
        setLoading(true);
        if (isBackendReady) {
          await deleteSummary(selectedNote.id);
        }
        setSelectedNote(null);
        onPageChange('dashboard');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete summary');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExport = (format: string) => {
    // Simulate file download
    const element = document.createElement('a');
    const file = new Blob([`Tate Studies Summary - ${selectedNote?.subject}\n\nGenerated on ${selectedNote?.processedAt}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${selectedNote?.subject}_summary.${format.toLowerCase()}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const updateEditItem = (section: keyof typeof editData, index: number, field: 'term' | 'description', value: string) => {
    setEditData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addEditItem = (section: keyof typeof editData) => {
    setEditData(prev => ({
      ...prev,
      [section]: [...prev[section], { term: '', description: '' }]
    }));
  };

  const removeEditItem = (section: keyof typeof editData, index: number) => {
    setEditData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  if (!selectedNote) {
    return (
      <div className="flex-1 p-8 text-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">No Summary Selected</h2>
          <p className="text-muted-foreground">Please select a summary to view its details.</p>
          <Button onClick={() => onPageChange('dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const originalContent = `Strategic Management and Competitive Advantage

Introduction to Strategic Management
Strategic management is the process of formulating, implementing, and evaluating strategies that enable an organization to achieve its objectives. It involves analyzing the competitive environment, setting strategic direction, and coordinating resources to gain sustainable competitive advantage.

Strategic Management Process
The strategic management process consists of several interconnected phases:
1. Environmental Analysis - Examining external opportunities and threats
2. Internal Analysis - Assessing organizational strengths and weaknesses
3. Strategy Formulation - Developing strategic alternatives and selecting the best approach
4. Strategy Implementation - Executing the chosen strategy through organizational structure and processes
5. Strategy Evaluation - Monitoring performance and making necessary adjustments

SWOT Analysis Framework:
- Strengths: Internal capabilities that provide competitive advantage
- Weaknesses: Internal limitations that may hinder performance
- Opportunities: External factors that the organization can exploit
- Threats: External factors that could negatively impact the organization

Porter's Five Forces Model:
Michael Porter identified five competitive forces that shape industry structure:
1. Threat of New Entrants: Barriers to entry and potential for new competitors
2. Bargaining Power of Suppliers: Supplier concentration and switching costs
3. Bargaining Power of Buyers: Customer concentration and price sensitivity
4. Threat of Substitute Products: Alternative solutions and customer switching likelihood
5. Competitive Rivalry: Intensity of competition among existing firms

Generic Competitive Strategies:
Porter also outlined three generic strategies for competitive advantage:
- Cost Leadership: Achieving the lowest costs in the industry
- Differentiation: Creating unique value propositions for customers
- Focus Strategy: Targeting specific market segments with cost or differentiation advantages

Strategic Implementation:
Successful strategy implementation requires:
- Organizational structure aligned with strategy
- Appropriate resource allocation
- Performance management systems
- Corporate culture that supports strategic objectives
- Effective leadership and change management

Key Performance Indicators (KPIs) for strategic success include market share growth, profitability metrics, customer satisfaction scores, and operational efficiency measures.`;

  const tags = ["Management", "Strategy", "Porter", "SWOT", "Competitive Advantage"];

  return (
    <div className="flex-1 flex animate-fade-in">
      {/* Original Notes Panel */}
      <div className="w-1/2 p-8 border-r border-border">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Original Notes</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{new Date(selectedNote.processedAt).toLocaleDateString()}</span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[--neon-blue]" />
                {selectedNote.subject} Notes
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="border-[--neon-blue]/30">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4 text-sm leading-relaxed">
                  {originalContent.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-foreground/90">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Summary Panel */}
      <div className="w-1/2 p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold gradient-text">AI Summary</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Brain className="h-4 w-4 text-[--neon-purple]" />
                <span>Processed with AI intelligence</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              {!editing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleEdit}
                    className="border-[--neon-blue]/30 hover:bg-[--neon-blue]/10"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExport('PDF')}
                    className="border-[--neon-blue]/30 hover:bg-[--neon-blue]/10"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button
                    onClick={() => onPageChange('flashcards')}
                    className="bg-gradient-to-r from-[--neon-green] to-[--neon-blue] hover:from-[--neon-green]/80 hover:to-[--neon-blue]/80 text-white"
                  >
                    <Gamepad2 className="h-4 w-4 mr-2" />
                    Generate Flashcards
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-[--neon-green] hover:bg-[--neon-green]/80 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Key Names */}
            <Card className="border-[--neon-blue]/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[--neon-blue]">
                  <Users className="h-5 w-5" />
                  Key Names & Concepts
                </CardTitle>
                <CardDescription>
                  Important terms and concepts identified in your notes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <div className="space-y-3">
                    {editData.keyNames.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={item.term}
                          onChange={(e) => updateEditItem('keyNames', index, 'term', e.target.value)}
                          placeholder="Term"
                          className="flex-1"
                        />
                        <Input
                          value={item.description}
                          onChange={(e) => updateEditItem('keyNames', index, 'description', e.target.value)}
                          placeholder="Description"
                          className="flex-2"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEditItem('keyNames', index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addEditItem('keyNames')}
                    >
                      Add Item
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.keyNames.map((item, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-[--neon-blue]/20 transition-colors px-3 py-1"
                        title={item.description}
                      >
                        {item.term}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Definitions */}
            <Card className="border-[--neon-purple]/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[--neon-purple]">
                  <FileText className="h-5 w-5" />
                  Definitions
                </CardTitle>
                <CardDescription>
                  Key terms and their meanings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <div className="space-y-3">
                    {editData.keyDefinitions.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <Input
                          value={item.term}
                          onChange={(e) => updateEditItem('keyDefinitions', index, 'term', e.target.value)}
                          placeholder="Term"
                        />
                        <Textarea
                          value={item.description}
                          onChange={(e) => updateEditItem('keyDefinitions', index, 'description', e.target.value)}
                          placeholder="Definition"
                          rows={2}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEditItem('keyDefinitions', index)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addEditItem('keyDefinitions')}
                    >
                      Add Definition
                    </Button>
                  </div>
                ) : (
                  <Accordion type="multiple" className="w-full">
                    {selectedNote.keyDefinitions.map((def, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left hover:text-[--neon-purple]">
                          {def.term}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {def.description}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>

            {/* Important Points */}
            <Card className="border-[--neon-green]/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[--neon-green]">
                  <Lightbulb className="h-5 w-5" />
                  Important Points
                </CardTitle>
                <CardDescription>
                  Key insights and takeaways
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <div className="space-y-3">
                    {editData.importantPoints.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <Input
                          value={item.term}
                          onChange={(e) => updateEditItem('importantPoints', index, 'term', e.target.value)}
                          placeholder="Point Title"
                        />
                        <Textarea
                          value={item.description}
                          onChange={(e) => updateEditItem('importantPoints', index, 'description', e.target.value)}
                          placeholder="Description"
                          rows={2}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEditItem('importantPoints', index)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addEditItem('importantPoints')}
                    >
                      Add Point
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedNote.importantPoints.map((point, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-[--neon-green]/5 rounded-lg border border-[--neon-green]/20">
                        <div className="w-2 h-2 bg-[--neon-green] rounded-full mt-2 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{point.term}</p>
                          <p className="text-sm text-muted-foreground">{point.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Study Tips */}
            <Card className="border-[--neon-yellow]/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[--neon-yellow]">
                  <Brain className="h-5 w-5" />
                  Study Tips
                </CardTitle>
                <CardDescription>
                  Practical study suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <div className="space-y-3">
                    {editData.studyTips.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <Input
                          value={item.term}
                          onChange={(e) => updateEditItem('studyTips', index, 'term', e.target.value)}
                          placeholder="Tip Title"
                        />
                        <Textarea
                          value={item.description}
                          onChange={(e) => updateEditItem('studyTips', index, 'description', e.target.value)}
                          placeholder="Description"
                          rows={2}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEditItem('studyTips', index)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addEditItem('studyTips')}
                    >
                      Add Tip
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedNote.studyTips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-[--neon-yellow]/5 rounded-lg border border-[--neon-yellow]/20">
                        <div className="w-2 h-2 bg-[--neon-yellow] rounded-full mt-2 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{tip.term}</p>
                          <p className="text-sm text-muted-foreground">{tip.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
                <CardDescription>
                  Save your summary in different formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleExport('MD')}
                    className="flex-1"
                  >
                    Markdown
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExport('TXT')}
                    className="flex-1"
                  >
                    Text File
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}