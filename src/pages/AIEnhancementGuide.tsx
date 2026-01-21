import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function AIEnhancementGuide() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-4xl font-bold mb-4">AI Enhancement Guide</h1>
        <p className="text-xl text-muted-foreground mb-8">Master the Gnexus AI suite to accelerate your design and development workflow.</p>

        <div className="grid md:grid-cols-2 gap-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <span className="p-2 bg-primary/10 rounded-lg text-primary">01</span>
              Multimodal Power
            </h2>
            <p className="text-muted-foreground">
              Our latest update introduces <strong>Vision and Video</strong> capabilities.
              Upload images for text extraction or captioning, and analyze videos for summaries and anomalies.
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>Upload Images (PNG, JPG, PDF)</li>
              <li>Upload Videos (MP4, WebM)</li>
              <li>Base64 processing for privacy</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <span className="p-2 bg-accent/10 rounded-lg text-accent">02</span>
              33+ AI Tools
            </h2>
            <p className="text-muted-foreground">
              Access specialized tools across 6 key categories:
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-card p-2 rounded-lg border border-border">Media & Vision</div>
              <div className="bg-card p-2 rounded-lg border border-border">Code & Engineering</div>
              <div className="bg-card p-2 rounded-lg border border-border">Business & Legal</div>
              <div className="bg-card p-2 rounded-lg border border-border">Content & Social</div>
              <div className="bg-card p-2 rounded-lg border border-border">Lifestyle & Personal</div>
              <div className="bg-card p-2 rounded-lg border border-border">Creative & Utility</div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <span className="p-2 bg-warning/10 rounded-lg text-warning">03</span>
              Flux Pro Imaging
            </h2>
            <p className="text-muted-foreground">
              Generate state-of-the-art visuals using the <strong>Flux Pro</strong> integration.
              Ideal for brand assets, concept art, and high-fidelity mockups.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <span className="p-2 bg-primary/10 rounded-lg text-primary">04</span>
              Workflow Context
            </h2>
            <p className="text-muted-foreground">
              All tools share your **Project Context**. If you've defined your project name
              and platform, the AI will use that information to tailor its outputs.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
