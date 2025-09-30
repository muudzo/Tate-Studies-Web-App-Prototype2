import { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Upload, FileText, Image, FileType, CheckCircle, Loader2, X, AlertCircle } from 'lucide-react';
import { uploadFile, processContent, extractTextFromFile } from '../utils/api';
import type { UserProgress } from '../utils/api';

interface UploadPageProps {
  onPageChange: (page: string) => void;
  userProgress: UserProgress;
  updateUserProgress: (progress: Partial<UserProgress>) => void;
  isBackendReady: boolean;
}

export function UploadPage({ onPageChange, userProgress, updateUserProgress, isBackendReady }: UploadPageProps) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [processingStage, setProcessingStage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const processedFiles = newFiles.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      type: getFileType(file.name),
      status: 'ready',
      file: file // Store the actual file object for upload
    }));
    setFiles(prev => [...prev, ...processedFiles]);
    setError(null); // Clear any previous errors
  };

  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'PDF';
      case 'txt': return 'Text';
      case 'doc':
      case 'docx': return 'Word Document';
      case 'ppt':
      case 'pptx': return 'PowerPoint';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'Image';
      default: return 'File';
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF':
      case 'Word Document': return FileText;
      case 'PowerPoint': return FileText;
      case 'Image': return Image;
      default: return FileType;
    }
  };

  const removeFile = (id: number) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const startUpload = async () => {
    if (!selectedSubject) {
      setError('Please select a subject before processing files');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      if (!isBackendReady) {
        // Demo mode - simulate processing
        setProcessingStage('Simulating file processing...');
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 300));
          setUploadProgress(i);
        }
        
        setFiles(prev => prev.map(file => ({ ...file, status: 'complete' })));
        
        // Award XP for demo upload
        updateUserProgress({
          xp: userProgress.xp + 50,
          lastUpdated: new Date().toISOString()
        });

        setTimeout(() => {
          setUploading(false);
          onPageChange('summaries');
        }, 1000);
        return;
      }

      // Real backend processing
      const totalFiles = files.length;
      let completedFiles = 0;

      for (const fileItem of files) {
        try {
          setProcessingStage(`Uploading ${fileItem.name}...`);
          
          // Upload file
          const uploadResult = await uploadFile(fileItem.file, userProgress.userId);
          setUploadProgress((completedFiles / totalFiles) * 30); // Upload progress: 0-30%

          // Extract text content
          setProcessingStage(`Extracting content from ${fileItem.name}...`);
          const textContent = await extractTextFromFile(fileItem.file);
          setUploadProgress((completedFiles / totalFiles) * 60); // Text extraction: 30-60%

          // Process with AI
          setProcessingStage(`AI processing ${fileItem.name}...`);
          const processResult = await processContent(textContent, selectedSubject, uploadResult.fileId);
          setUploadProgress((completedFiles / totalFiles) * 90); // AI processing: 60-90%

          // Mark file as complete
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { ...f, status: 'complete', summaryId: processResult.summaryId } : f
          ));

          completedFiles++;
          setUploadProgress((completedFiles / totalFiles) * 100);

        } catch (fileError) {
          console.error(`Error processing ${fileItem.name}:`, fileError);
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { ...f, status: 'error', error: fileError.message } : f
          ));
        }
      }

      // Award XP for successful upload
      const xpGained = files.length * 25; // 25 XP per file
      updateUserProgress({
        xp: userProgress.xp + xpGained,
        lastUpdated: new Date().toISOString()
      });

      setProcessingStage('Processing complete!');
      
      setTimeout(() => {
        setUploading(false);
        onPageChange('summaries');
      }, 1500);

    } catch (error) {
      console.error('Upload failed:', error);
      setError(error instanceof Error ? error.message : 'Upload failed. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex-1 p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold gradient-text">Upload Your Notes</h1>
          <p className="text-xl text-muted-foreground">
            Drag and drop your files, or click to browse
          </p>
        </div>

        {/* Subject Selection */}
        <div className="max-w-md">
          <label className="text-sm font-medium block mb-2">Select Subject</label>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="bg-background/50 border-border/50 focus:border-[--neon-blue]/50">
              <SelectValue placeholder="Choose your subject area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="management">Management</SelectItem>
              <SelectItem value="leadership">Leadership</SelectItem>
              <SelectItem value="ecommerce">E-Commerce</SelectItem>
              <SelectItem value="business">Business Strategy</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="general">General Studies</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Backend Status */}
        {!isBackendReady && (
          <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Demo Mode: AI processing will be simulated</span>
          </div>
        )}
        
        {isBackendReady && (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">🆓 Free Mode: Files will be processed with smart local analysis - no API costs!</span>
          </div>
        )}
      </div>

      {/* Upload Area */}
      <Card 
        className={`border-2 border-dashed transition-all duration-300 ${
          dragActive 
            ? 'border-[--neon-blue] bg-[--neon-blue]/5' 
            : 'border-border hover:border-[--neon-blue]/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-12 text-center">
          <div className="space-y-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[--neon-blue] to-[--neon-purple] rounded-full flex items-center justify-center animate-pulse-gentle">
              <Upload className="h-10 w-10 text-white" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Drop your files here</h3>
              <p className="text-muted-foreground">
                Supports PDF, TXT, DOC, DOCX, PPT, PPTX, and Image files up to 50MB each
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {['PDF', 'TXT', 'DOC', 'DOCX', 'PPT', 'PPTX', 'JPG', 'PNG'].map((type) => (
                <Badge key={type} variant="outline" className="border-[--neon-blue]/30">
                  {type}
                </Badge>
              ))}
            </div>

            <Button
              size="lg"
              onClick={() => document.getElementById('file-input')?.click()}
              className="bg-gradient-to-r from-[--neon-blue] to-[--neon-purple] hover:from-[--neon-blue]/80 hover:to-[--neon-purple]/80 text-white"
            >
              <Upload className="h-5 w-5 mr-2" />
              Choose Files
            </Button>
            
            <input
              id="file-input"
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.txt,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
              onChange={handleFileInput}
            />
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Files ({files.length})</CardTitle>
            <CardDescription>
              Review your files before processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {files.map((file) => {
              const Icon = getFileIcon(file.type);
              return (
                <div key={file.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[--neon-blue]/20 to-[--neon-purple]/20 rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-[--neon-blue]" />
                    </div>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {file.type} • {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {file.status === 'complete' && (
                      <CheckCircle className="h-5 w-5 text-[--neon-green]" />
                    )}
                    {file.status === 'error' && (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-red-500">{file.error || 'Error'}</span>
                      </div>
                    )}
                    {!uploading && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Upload Progress */}
      {uploading && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Processing your files...</h3>
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[--neon-blue]" />
                  <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                </div>
              </div>
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {processingStage || 'AI is extracting key information and generating summaries...'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {files.length > 0 && !uploading && (
        <div className="flex gap-4">
          <Button
            size="lg"
            onClick={startUpload}
            className="bg-gradient-to-r from-[--neon-blue] to-[--neon-purple] hover:from-[--neon-blue]/80 hover:to-[--neon-purple]/80 text-white"
          >
            <Upload className="h-5 w-5 mr-2" />
            Start Processing
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setFiles([])}
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}