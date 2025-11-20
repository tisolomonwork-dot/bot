import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Wallet, BookText } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    title: 'Investments',
    description: 'View your trading dashboard.',
    href: '/investments',
    icon: <Wallet className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Journal',
    description: 'Log your trades and thoughts.',
    href: '/journal',
    icon: <BookText className="h-8 w-8 text-primary" />,
  }
];

export default function MenuPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">AetherMind Trading</h1>
        <p className="text-lg text-muted-foreground mt-2">Your AI-Powered Trading Co-Pilot</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl w-full">
        {menuItems.map((item) => (
          <Link href={item.href} key={item.title} className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl">
            <Card className={cn(
                "h-full transition-all duration-200 ease-in-out",
                "group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/20 group-hover:-translate-y-1",
                "group-active:scale-[0.98] group-active:border-primary/50"
            )}>
              <CardHeader className="flex-row items-center gap-4 space-y-0">
                {item.icon}
                <div>
                  <CardTitle>{item.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
