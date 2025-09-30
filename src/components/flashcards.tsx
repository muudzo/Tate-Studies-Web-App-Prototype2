import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { ChevronLeft, ChevronRight, RotateCcw, Zap, Trophy, Flame, Home, Brain, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { generateMultipleChoice, getMultipleChoiceQuestions } from '../utils/api';
import type { MultipleChoiceQuestion, QuestionSet } from '../utils/api';

interface FlashcardsProps {
  onPageChange: (page: string) => void;
  isBackendReady: boolean;
}

type StudyMode = 'flashcards' | 'multiple-choice';

export function Flashcards({ onPageChange, isBackendReady }: FlashcardsProps) {
  const [studyMode, setStudyMode] = useState<StudyMode>('flashcards');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyStreak, setStudyStreak] = useState(7);
  const [xpGained, setXpGained] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Multiple choice state
  const [questions, setQuestions] = useState<MultipleChoiceQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const flashcards = [
    {
      id: 1,
      front: "What is Strategic Management?",
      back: "The process of formulating, implementing, and evaluating strategies that enable an organization to achieve its objectives and gain competitive advantage."
    },
    {
      id: 2,
      front: "What are the components of SWOT Analysis?",
      back: "Strengths (internal capabilities), Weaknesses (internal limitations), Opportunities (external factors to exploit), and Threats (external risks)."
    },
    {
      id: 3,
      front: "Name the five forces in Porter's Five Forces Model.",
      back: "Threat of New Entrants, Bargaining Power of Suppliers, Bargaining Power of Buyers, Threat of Substitutes, and Competitive Rivalry."
    },
    {
      id: 4,
      front: "What is Cost Leadership Strategy?",
      back: "A competitive strategy focused on achieving the lowest costs in the industry while maintaining acceptable quality levels."
    },
    {
      id: 5,
      front: "What is Differentiation Strategy?",
      back: "A strategy that creates unique value propositions for customers through distinctive products, services, or brand positioning."
    },
    {
      id: 6,
      front: "What is a Focus Strategy?",
      back: "A competitive strategy that targets a specific, narrow segment of the market with specialized products or cost/differentiation advantages."
    },
    {
      id: 7,
      front: "What are Barriers to Entry?",
      back: "Obstacles that make it difficult for new companies to enter a particular market, such as high capital requirements, regulations, or brand loyalty."
    },
    {
      id: 8,
      front: "What is Competitive Advantage?",
      back: "A condition that puts a company in a favorable business position compared to rivals, enabling superior performance and market position."
    }
  ];

  // Mock multiple choice questions for demo
  const mockQuestions: MultipleChoiceQuestion[] = [
    {
      id: 'q1',
      question: 'Which of the following best describes strategic management?',
      options: {
        A: 'A short-term planning process focused on daily operations',
        B: 'The process of formulating, implementing, and evaluating strategies to achieve organizational objectives',
        C: 'A financial management technique for cost reduction',
        D: 'A marketing strategy for brand positioning'
      },
      correct: 'B',
      explanation: 'Strategic management is the comprehensive process of formulating, implementing, and evaluating strategies that enable an organization to achieve its long-term objectives and gain competitive advantage.',
      difficulty: 'medium',
      category: 'Strategic Management'
    },
    {
      id: 'q2',
      question: 'In SWOT analysis, which component represents internal factors that could hinder performance?',
      options: {
        A: 'Strengths',
        B: 'Weaknesses',
        C: 'Opportunities',
        D: 'Threats'
      },
      correct: 'B',
      explanation: 'Weaknesses in SWOT analysis represent internal limitations or factors that may hinder the organization\'s performance, such as limited resources, outdated technology, or poor management.',
      difficulty: 'easy',
      category: 'SWOT Analysis'
    },
    {
      id: 'q3',
      question: 'A company that achieves the lowest costs in its industry while maintaining acceptable quality is pursuing which strategy?',
      options: {
        A: 'Differentiation strategy',
        B: 'Cost leadership strategy',
        C: 'Focus strategy',
        D: 'Market penetration strategy'
      },
      correct: 'B',
      explanation: 'Cost leadership strategy focuses on achieving the lowest costs in the industry while maintaining acceptable quality levels, allowing the company to compete on price.',
      difficulty: 'medium',
      category: 'Competitive Strategy'
    },
    {
      id: 'q4',
      question: 'Which of Porter\'s Five Forces examines the intensity of competition among existing firms?',
      options: {
        A: 'Threat of New Entrants',
        B: 'Bargaining Power of Suppliers',
        C: 'Competitive Rivalry',
        D: 'Threat of Substitute Products'
      },
      correct: 'C',
      explanation: 'Competitive Rivalry is one of Porter\'s Five Forces that examines the intensity of competition among existing firms in the industry.',
      difficulty: 'medium',
      category: 'Porter\'s Five Forces'
    },
    {
      id: 'q5',
      question: 'What is the primary goal of a focus strategy?',
      options: {
        A: 'To serve the entire market with a single product',
        B: 'To target a specific, narrow segment of the market',
        C: 'To achieve the lowest costs industry-wide',
        D: 'To create unique value propositions for all customers'
      },
      correct: 'B',
      explanation: 'A focus strategy targets a specific, narrow segment of the market with specialized products or services, either through cost advantages or differentiation within that segment.',
      difficulty: 'hard',
      category: 'Competitive Strategy'
    }
  ];

  const currentCard = flashcards[currentCardIndex];
  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = studyMode === 'flashcards' 
    ? ((currentCardIndex + 1) / flashcards.length) * 100
    : ((currentQuestionIndex + 1) / questions.length) * 100;

  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
      setXpGained(prev => prev + 10);
    } else {
      setXpGained(prev => prev + 50);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer('');
      setShowResult(false);
    } else {
      setXpGained(prev => prev + (score * 20));
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer('');
      setShowResult(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const submitAnswer = () => {
    if (!selectedAnswer) return;
    
    setShowResult(true);
    if (selectedAnswer === currentQuestion.correct) {
      setScore(prev => prev + 1);
      setXpGained(prev => prev + 15);
    }
  };

  const generateQuestions = async () => {
    if (!isBackendReady) {
      // Use mock questions for demo
      setQuestions(mockQuestions);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Generate questions from a demo summary
      const response = await generateMultipleChoice('demo_summary', 5);
      if (response.success) {
        setQuestions(response.questions);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate questions');
      // Fallback to mock questions
      setQuestions(mockQuestions);
    } finally {
      setLoading(false);
    }
  };

  const resetStudy = () => {
    if (studyMode === 'flashcards') {
      setCurrentCardIndex(0);
      setIsFlipped(false);
    } else {
      setCurrentQuestionIndex(0);
      setSelectedAnswer('');
      setShowResult(false);
      setScore(0);
    }
    setXpGained(0);
    setShowConfetti(false);
  };

  const isCompleted = studyMode === 'flashcards' 
    ? currentCardIndex >= flashcards.length - 1 && isFlipped
    : currentQuestionIndex >= questions.length - 1 && showResult;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'hard': return 'text-red-500 bg-red-50 border-red-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="flex-1 p-8 space-y-8 animate-fade-in">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold gradient-text">Study Mode</h1>
          <p className="text-xl text-muted-foreground">Choose your preferred study method</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-gradient-to-r from-[--neon-green]/20 to-[--neon-blue]/20 px-4 py-2 rounded-full">
            <Flame className="h-5 w-5 text-[--neon-green]" />
            <span className="font-semibold">{studyStreak} day streak</span>
          </div>
          
          <div className="flex items-center gap-2 bg-gradient-to-r from-[--neon-purple]/20 to-[--neon-blue]/20 px-4 py-2 rounded-full">
            <Zap className="h-5 w-5 text-[--neon-purple]" />
            <span className="font-semibold">+{xpGained} XP</span>
          </div>
        </div>
      </div>

      {/* Study Mode Selection */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Choose Study Mode</CardTitle>
          <CardDescription>Select how you want to test your knowledge</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant={studyMode === 'flashcards' ? 'default' : 'outline'}
              onClick={() => setStudyMode('flashcards')}
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <Brain className="h-6 w-6" />
              <span className="font-semibold">Flashcards</span>
              <span className="text-xs text-muted-foreground">Traditional flip cards</span>
            </Button>
            
            <Button
              variant={studyMode === 'multiple-choice' ? 'default' : 'outline'}
              onClick={() => {
                setStudyMode('multiple-choice');
                if (questions.length === 0) {
                  generateQuestions();
                }
              }}
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <CheckCircle className="h-6 w-6" />
              <span className="font-semibold">Multiple Choice</span>
              <span className="text-xs text-muted-foreground">🆓 Free questions from your content</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {studyMode === 'flashcards' 
              ? `Card ${Math.min(currentCardIndex + 1, flashcards.length)} of ${flashcards.length}`
              : `Question ${Math.min(currentQuestionIndex + 1, questions.length)} of ${questions.length}`
            }
          </span>
          <span className="text-sm font-medium">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Study Content */}
      {studyMode === 'flashcards' ? (
        /* Flashcard Mode */
        <div className="flex justify-center">
          <div className="relative w-full max-w-2xl">
            <Card 
              className={`h-80 cursor-pointer transition-all duration-500 transform hover:scale-105 ${
                isFlipped ? 'rotate-y-180' : ''
              } ${showConfetti ? 'animate-confetti' : ''}`}
              onClick={flipCard}
              style={{ 
                transformStyle: 'preserve-3d',
                background: isFlipped 
                  ? 'linear-gradient(135deg, var(--neon-purple)/10, var(--neon-green)/10)' 
                  : 'linear-gradient(135deg, var(--neon-blue)/10, var(--neon-purple)/10)'
              }}
            >
              <CardContent className="h-full flex items-center justify-center p-8">
                <div 
                  className={`text-center space-y-4 transition-opacity duration-300 ${
                    isFlipped ? 'opacity-0' : 'opacity-100'
                  }`}
                  style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                >
                  <Badge variant="outline" className="border-[--neon-blue]/30">
                    Question
                  </Badge>
                  <h2 className="text-2xl font-semibold leading-relaxed">
                    {currentCard?.front}
                  </h2>
                  <p className="text-muted-foreground">Click to reveal answer</p>
                </div>
                
                <div 
                  className={`text-center space-y-4 absolute inset-8 flex flex-col justify-center transition-opacity duration-300 ${
                    isFlipped ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ 
                    transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)',
                    backfaceVisibility: 'hidden'
                  }}
                >
                  <Badge variant="outline" className="border-[--neon-green]/30 self-center">
                    Answer
                  </Badge>
                  <h2 className="text-xl font-medium leading-relaxed text-center">
                    {currentCard?.back}
                  </h2>
                  <p className="text-muted-foreground">Click for next question</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Multiple Choice Mode */
        <div className="flex justify-center">
          <div className="w-full max-w-3xl">
            {loading ? (
              <Card className="h-80 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[--neon-blue] mx-auto"></div>
                  <p className="text-muted-foreground">Generating AI questions...</p>
                </div>
              </Card>
            ) : error ? (
              <Card className="h-80 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                  <p className="text-red-500">{error}</p>
                  <Button onClick={generateQuestions} variant="outline">
                    Try Again
                  </Button>
                </div>
              </Card>
            ) : questions.length > 0 && currentQuestion ? (
              <Card className="min-h-96">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                        {currentQuestion.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        {currentQuestion.category}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Score: {score}/{questions.length}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">{currentQuestion.question}</h2>
                    
                    <RadioGroup
                      value={selectedAnswer}
                      onValueChange={handleAnswerSelect}
                      disabled={showResult}
                    >
                      {Object.entries(currentQuestion.options).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <RadioGroupItem value={key} id={key} />
                          <Label 
                            htmlFor={key} 
                            className={`flex-1 p-3 rounded-lg border cursor-pointer transition-colors ${
                              showResult 
                                ? key === currentQuestion.correct
                                  ? 'bg-green-50 border-green-200 text-green-800'
                                  : selectedAnswer === key
                                  ? 'bg-red-50 border-red-200 text-red-800'
                                  : 'bg-gray-50 border-gray-200'
                                : selectedAnswer === key
                                ? 'bg-[--neon-blue]/10 border-[--neon-blue]/30'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <span className="font-medium mr-2">{key}.</span>
                            {value}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {showResult && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {selectedAnswer === currentQuestion.correct ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className={`font-semibold ${
                          selectedAnswer === currentQuestion.correct ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {selectedAnswer === currentQuestion.correct ? 'Correct!' : 'Incorrect'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Explanation:</strong> {currentQuestion.explanation}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-center">
                    {!showResult ? (
                      <Button
                        onClick={submitAnswer}
                        disabled={!selectedAnswer}
                        className="bg-gradient-to-r from-[--neon-blue] to-[--neon-purple] hover:from-[--neon-blue]/80 hover:to-[--neon-purple]/80 text-white"
                      >
                        Submit Answer
                      </Button>
                    ) : (
                      <Button
                        onClick={nextQuestion}
                        disabled={currentQuestionIndex >= questions.length - 1}
                        className="bg-gradient-to-r from-[--neon-green] to-[--neon-blue] hover:from-[--neon-green]/80 hover:to-[--neon-blue]/80 text-white"
                      >
                        {currentQuestionIndex >= questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-80 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Brain className="h-12 w-12 text-[--neon-blue] mx-auto" />
                  <h3 className="text-lg font-semibold">No Questions Available</h3>
                  <p className="text-muted-foreground">Generate AI-powered questions to test your knowledge</p>
                  <Button onClick={generateQuestions}>
                    Generate Questions
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={studyMode === 'flashcards' ? prevCard : prevQuestion}
          disabled={studyMode === 'flashcards' ? currentCardIndex === 0 : currentQuestionIndex === 0}
          className="border-[--neon-blue]/30 hover:bg-[--neon-blue]/10"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        {studyMode === 'flashcards' && (
          <Button
            variant="outline"
            onClick={flipCard}
            className="border-[--neon-purple]/30 hover:bg-[--neon-purple]/10 px-8"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Flip Card
          </Button>
        )}
        
        <Button
          onClick={studyMode === 'flashcards' ? nextCard : nextQuestion}
          disabled={studyMode === 'flashcards' 
            ? currentCardIndex >= flashcards.length - 1 && isFlipped
            : currentQuestionIndex >= questions.length - 1 && showResult
          }
          className="bg-gradient-to-r from-[--neon-blue] to-[--neon-purple] hover:from-[--neon-blue]/80 hover:to-[--neon-purple]/80 text-white"
        >
          {studyMode === 'flashcards' 
            ? (currentCardIndex >= flashcards.length - 1 ? 'Complete!' : 'Next')
            : (currentQuestionIndex >= questions.length - 1 ? 'Complete!' : 'Next')
          }
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Completion Message */}
      {isCompleted && (
        <Card className="border-[--neon-green]/30 bg-gradient-to-r from-[--neon-green]/5 to-[--neon-blue]/5">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[--neon-green] to-[--neon-blue] rounded-full flex items-center justify-center">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold gradient-text">
              {studyMode === 'multiple-choice' ? `Quiz Complete! Score: ${score}/${questions.length}` : 'Deck Complete!'} 🎉
            </h3>
            <p className="text-muted-foreground">
              Great job! You've earned <span className="font-semibold text-[--neon-purple]">+{xpGained} XP</span> and maintained your study streak.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={resetStudy}
                variant="outline"
                className="border-[--neon-blue]/30 hover:bg-[--neon-blue]/10"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Study Again
              </Button>
              <Button
                onClick={() => onPageChange('dashboard')}
                className="bg-gradient-to-r from-[--neon-green] to-[--neon-blue] hover:from-[--neon-green]/80 hover:to-[--neon-blue]/80 text-white"
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Study Tips */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3">Study Tips 💡</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Try to answer before revealing the answer or submitting</li>
            <li>• Review questions you find difficult multiple times</li>
            <li>• Study regularly to maintain your streak</li>
            <li>• Focus on understanding concepts, not just memorization</li>
            {studyMode === 'multiple-choice' && (
              <li>• Read all options carefully before selecting your answer</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}