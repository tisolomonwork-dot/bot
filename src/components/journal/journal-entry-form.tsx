"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const journalSchema = z.object({
  entry: z.string().min(10, 'Entry must be at least 10 characters long.'),
});

type JournalFormValues = z.infer<typeof journalSchema>;

export function JournalEntryForm() {
  const { toast } = useToast();

  const form = useForm<JournalFormValues>({
    resolver: zodResolver(journalSchema),
    defaultValues: { entry: '' },
  });

  const onSubmit: SubmitHandler<JournalFormValues> = (data) => {
    // In a real app, you'd save this to a database.
    console.log('New journal entry:', data.entry);
    toast({
      title: 'Entry Saved',
      description: 'Your journal entry has been successfully saved.',
    });
    form.reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Journal Entry</CardTitle>
        <CardDescription>
          What's on your mind? Log a trade, a feeling, or an observation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="entry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Journal Entry</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="e.g., 'BTC is showing strong support at $68k. I'm considering a long position if it holds for the next 4 hours...'"
                      className="min-h-[200px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Entry'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
