
"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CircleHelp, Lightbulb, Bot } from 'lucide-react';
import type { AppSupportInput, AppSupportOutput } from '@/ai/flows/app-support-flow';
import { getAppSupportResponse } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const helpFormSchema = z.object({
  userQuestion: z.string().min(10, { message: "Please ask a more detailed question (at least 10 characters)." }),
});

type HelpFormData = z.infer<typeof helpFormSchema>;

export default function HelpPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [aiResponse, setAiResponse] = React.useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<HelpFormData>({
    resolver: zodResolver(helpFormSchema),
    defaultValues: {
      userQuestion: "",
    },
  });

  async function onSubmit(values: HelpFormData) {
    setIsLoading(true);
    setAiResponse(null);
    
    const inputForAi: AppSupportInput = {
        userQuestion: values.userQuestion,
    };

    const result = await getAppSupportResponse(inputForAi);

    setIsLoading(false);
    if (result.data?.answer) {
      setAiResponse(result.data.answer);
    } else if (result.error) {
      setAiResponse(null);
      toast({
        title: "Error Getting Help",
        description: result.error,
        variant: "destructive",
      });
    } else {
      setAiResponse("Sorry, I couldn't get an answer for that. Please try rephrasing your question.");
       toast({
        title: "No Answer Received",
        description: "The AI assistant didn't provide an answer. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <CircleHelp className="mr-3 h-8 w-8 text-primary" /> Help & Support
        </h1>
        <p className="text-muted-foreground mt-1">
          Have a question about DockWatch? Ask our AI assistant!
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Lightbulb className="mr-2 h-5 w-5 text-primary" />
            Ask a Question
          </CardTitle>
          <CardDescription>
            Describe what you need help with, and our AI assistant will try to guide you.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="userQuestion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="userQuestion">Your Question</FormLabel>
                    <FormControl>
                      <Textarea
                        id="userQuestion"
                        placeholder="e.g., How do I filter docks by availability? or What is the digital display for?"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting Answer...
                  </>
                ) : (
                  'Ask AI Assistant'
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {isLoading && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center text-primary">
              <Bot className="mr-2 h-5 w-5 animate-pulse" /> AI Assistant is Thinking...
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      )}

      {aiResponse && !isLoading && (
        <Card className="shadow-lg animate-in fade-in-50 duration-500">
          <CardHeader>
            <CardTitle className="text-xl flex items-center text-primary">
               <Bot className="mr-2 h-5 w-5" /> AI Assistant's Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-line">
              {aiResponse}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
