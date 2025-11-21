"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bot, User, CornerDownLeft, CircleDashed, Sparkles } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="flex flex-col h-full bg-transparent border-0 shadow-none">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 font-normal">
            <Sparkles className="h-4 w-4 text-muted-foreground"/>
            AetherMind Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden p-4">
        <ScrollArea className="flex-1 -mx-4 px-4">
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3',
                )}
              >
                <div className={cn("flex-shrink-0 p-1.5 rounded-full border", message.role === 'user' ? 'border-border' : 'border-primary/20')}>
                    {message.role === 'user' ? <User className="h-4 w-4 text-muted-foreground" /> : <Bot className="h-4 w-4 text-primary" />}
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-sm font-light leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
             {isAnswering && (
              <div className="flex items-start gap-3">
                 <div className="flex-shrink-0 p-1.5 rounded-full border border-primary/20">
                    <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 pt-2">
                    <CircleDashed className="h-4 w-4 animate-spin text-primary" />
                </div>
              </div>
            )}
            {messages.length === 0 && !isAnswering && (
                <div className="text-center text-xs text-muted-foreground py-8">
                    <p className="mb-4">Ask me anything about your portfolio or the market.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 justify-center">
                        {exampleQuestions.slice(0,3).map((q) => (
                            <Button key={q} variant="outline" size="sm" className="font-light text-xs h-auto py-1.5" onClick={() => handleAskExample(q)}>
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
                      className="pr-10 h-9 font-light"
                      disabled={isAnswering}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
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
