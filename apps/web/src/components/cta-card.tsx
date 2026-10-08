'use client';

import { Check, Copy } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function CtaCard() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText('npm install @deessejs/fp');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = 'npm install @deessejs/fp';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="bg-background">
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="mt-10">
          <Card>
            <CardHeader>
              <CardTitle>Ready to get started?</CardTitle>
              <CardDescription>
                Install the package and start building with functional programming patterns today.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link href="/docs">Read the docs</Link>
              </Button>
              <Button variant="outline" size="lg" onClick={handleCopy} className="font-mono">
                {copied ? (
                  <>
                    <Check />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy />
                    npm install @deessejs/fp
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
