// src/components/homepage/educational-support-mode.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, BookMarked, Brain, Target, Users, BookOpen, ArrowRight } from 'lucide-react';
import { GuidelineQueryForm } from '@/components/guideline-retrieval/guideline-query-form';
import type { GuidelineRetrievalOutput } from '@/ai/schemas/guideline-retrieval-schemas';
import { useProMode } from '@/contexts/pro-mode-context';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Sample data for the new dashboard widgets
const dailyTopic = {
  title: "Topic of the Day: Myocardial Infarction",
  description: "Understand the pathophysiology, diagnosis, and management of acute myocardial infarction.",
  toolId: "theorycoach-generator",
  prefilledTopic: "Myocardial Infarction"
};

const quickQuiz = {
  question: "A 55-year-old male presents with crushing chest pain. Which of the following is the most crucial initial investigation?",
  options: ["Echocardiogram", "ECG", "Troponin I", "Chest X-ray"],
  answer: "ECG"
};

const communityHighlight = {
  topic: "Differential Diagnosis for Cough",
  author: "Dr. Jane Doe",
  type: "Note",
  toolId: "library",
};


export function EducationalSupportMode() {
  const [retrievalResult, setRetrievalResult] = useState<GuidelineRetrievalOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userRole } = useProMode();
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [isQuizAnswered, setIsQuizAnswered] = useState(false);

  const handleRetrievalComplete = (result: GuidelineRetrievalOutput | null, err?: string) => {
    setRetrievalResult(result);
    setError(err || null);
    setIsLoading(false);
  };
  
  const handleQuizSubmit = (option: string) => {
    setSelectedQuizOption(option);
    setIsQuizAnswered(true);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    }),
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      {/* Topic of the Day Widget */}
      <motion.div variants={cardVariants} custom={0}>
        <Card className="shadow-md rounded-xl h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <Target className="h-5 w-5"/> {dailyTopic.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">{dailyTopic.description}</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full rounded-lg">
                <Link href={`/medico/${dailyTopic.toolId}?topic=${encodeURIComponent(dailyTopic.prefilledTopic)}`}>Learn More <ArrowRight className="ml-2 h-4 w-4"/></Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Quick Knowledge Check Widget */}
      <motion.div variants={cardVariants} custom={1}>
        <Card className="shadow-md rounded-xl h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <Brain className="h-5 w-5"/> Quick Knowledge Check
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 flex-grow">
            <p className="text-sm font-semibold">{quickQuiz.question}</p>
            <div className="space-y-2">
              {quickQuiz.options.map((option) => (
                <Button
                  key={option}
                  variant={isQuizAnswered && selectedQuizOption === option ? (option === quickQuiz.answer ? 'default' : 'destructive') : 'outline'}
                  className="w-full justify-start text-left"
                  onClick={() => !isQuizAnswered && handleQuizSubmit(option)}
                  disabled={isQuizAnswered}
                >
                  {option}
                </Button>
              ))}
            </div>
            {isQuizAnswered && (
                <Alert className={selectedQuizOption === quickQuiz.answer ? "border-green-500 bg-green-500/10 text-green-700" : "border-destructive bg-destructive/10 text-destructive"}>
                    <AlertDescription className="text-xs">
                        {selectedQuizOption === quickQuiz.answer ? "Correct! An ECG is vital for immediate assessment of STEMI." : `Not quite. The correct answer is ECG.`}
                    </AlertDescription>
                </Alert>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Guideline Search Widget */}
       <motion.div variants={cardVariants} custom={2}>
        <Card className="shadow-md rounded-xl h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <BookMarked className="h-5 w-5"/> Guidelines & Literature
            </CardTitle>
             <CardDescription className="text-sm">
                Search for clinical guidelines or educational material.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
             <GuidelineQueryForm onRetrievalComplete={handleRetrievalComplete} setIsLoading={setIsLoading} isLoading={isLoading} />
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Community Highlight Widget */}
      <motion.div variants={cardVariants} custom={3}>
        <Card className="shadow-md rounded-xl h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <Users className="h-5 w-5"/> Community Highlight
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
             <div className="p-3 bg-muted/50 rounded-lg text-center">
                 <p className="font-semibold text-sm">{communityHighlight.topic}</p>
                 <p className="text-xs text-muted-foreground">A high-quality {communityHighlight.type} by {communityHighlight.author}</p>
             </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="secondary" className="w-full rounded-lg">
                <Link href={`/medico/${communityHighlight.toolId}`}>Go to Knowledge Hub <ArrowRight className="ml-2 h-4 w-4"/></Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

       {/* Display search results if any */}
      {retrievalResult && retrievalResult.results && !isLoading && !error && (
        <motion.div className="md:col-span-2 lg:col-span-3" variants={cardVariants} custom={4}>
            <Card className="shadow-lg rounded-xl">
                 <CardHeader>
                    <CardTitle className="text-lg">Search Results</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {retrievalResult.results.map((item, index) => (
                        <li key={index} className="pb-2 mb-2 border-b last:border-b-0">
                          <h4 className="font-medium text-sm text-foreground">{item.title}</h4>
                          {item.source && <p className="text-xs text-muted-foreground mb-1">Source: {item.source}</p>}
                          <p className="text-xs">{item.summary}</p>
                        </li>
                      ))}
                    </ul>
                 </CardContent>
            </Card>
        </motion.div>
      )}

    </motion.div>
  );
}
