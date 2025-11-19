"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const settingsSchema = z.object({
  bybitApiKey: z.string().optional(),
  bybitApiSecret: z.string().optional(),
  geminiApiKey: z.string().optional(),
  geminiApiSecret: z.string().optional(),
  baseCurrency: z.enum(["USD", "USDT", "GHS", "NGN"]),
  riskPreference: z.enum(["conservative", "normal", "aggressive"]),
  aiTone: z.enum(["short", "detailed", "strict"]),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function SettingsForm() {
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      baseCurrency: "USD",
      riskPreference: "normal",
      aiTone: "detailed",
    },
  });

  function onSubmit(data: SettingsFormValues) {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated.",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>API Connections</CardTitle>
            <CardDescription>
              Connect your Bybit and Gemini accounts. Your keys are stored securely.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="bybitApiKey"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Bybit API Key</FormLabel>
                    <FormControl>
                        <Input placeholder="Bybit API Key" {...field} />
                    </FormControl>
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="bybitApiSecret"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Bybit API Secret</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder="Bybit API Secret" {...field} />
                    </FormControl>
                    </FormItem>
                )}
                />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="geminiApiKey"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Gemini API Key</FormLabel>
                    <FormControl>
                        <Input placeholder="Gemini API Key" {...field} />
                    </FormControl>
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="geminiApiSecret"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Gemini API Secret</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder="Gemini API Secret" {...field} />
                    </FormControl>
                    </FormItem>
                )}
                />
            </div>
            <Separator />
             <CardTitle>Preferences</CardTitle>
            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="baseCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="USDT">USDT</SelectItem>
                        <SelectItem value="GHS">GHS</SelectItem>
                        <SelectItem value="NGN">NGN</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="riskPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk Preference</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select risk level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="conservative">Conservative</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="aggressive">Aggressive</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="aiTone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI Tone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select AI tone" />
                        </Trigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="short">Short & Concise</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                        <SelectItem value="strict">Strict & Formal</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit">Save Changes</Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
