"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bot, User, CornerDownLeft, CircleDashed } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { askAi } from '@/lib/actions';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const chatSchema = z.object({
  question: z.string().min(1, 'Please enter a question.'),
});

type ChatFormValues = z.infer<typeof chatSchema>;

type Message = {
  role: 'user' | 'ai';
  content: string;
};

const exampleQuestions = [
    "Should I reduce my BTC position?",
    "Is the market trending or ranging?",
    "What are the risks in my current ETH position?",
];

export function AiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const { toast } = useToast();

  const form = useForm<ChatFormValues>({
    resolver: zodResolver(chatSchema),
    defaultValues: { question: '' },
  });

  const handleAskExample = async (question: string) => {
    form.setValue('question', question);
    await handleSubmit({ question });
  }

  const handleSubmit: SubmitHandler<ChatFormValues> = async (data) => {
    if (isAnswering) return;
    setIsAnswering(true);
    form.reset();

    const userMessage: Message = { role: 'user', content: data.question };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await askAi(data.question);
      const aiMessage: Message = { role: 'ai', content: response.answer };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get a response from the AI.',
      });
    } finally {
      setIsAnswering(false);
    }
  };

  return (
    <Card className="flex flex-col h-[60vh]">
      <CardHeader>
        <CardTitle>Ask the AI</CardTitle>
        <CardDescription>Get instant answers to your trading questions.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3 rounded-lg p-3',
                  message.role === 'user' ? '' : 'bg-muted/50'
                )}
              >
                <div className={cn("p-1.5 rounded-full", message.role === 'user' ? 'bg-primary/20' : 'bg-primary/20')}>
                    {message.role === 'user' ? <User className="h-5 w-5 text-primary" /> : <Bot className="h-5 w-5 text-primary" />}
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
             {isAnswering && (
              <div className="flex items-start gap-3 rounded-lg p-3 bg-muted/50">
                <div className="p-1.5 rounded-full bg-primary/20">
                    <Bot className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 pt-1.5">
                    <CircleDashed className="h-5 w-5 animate-spin text-primary" />
                </div>
              </div>
            )}
            {messages.length === 0 && !isAnswering && (
                <div className="text-center text-sm text-muted-foreground p-8">
                    <p className="mb-4">No messages yet. Try asking a question, for example:</p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        {exampleQuestions.map((q) => (
                            <Button key={q} variant="outline" size="sm" onClick={() => handleAskExample(q)}>
                                {q}
                            </Button>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="relative">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Is ETH likely to break out this week?"
                      className="pr-12"
                      disabled={isAnswering}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              disabled={isAnswering}
            >
              <CornerDownLeft className="h-4 w-4" />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
