"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Wand2, Download, Mail, Phone, Link as LinkIcon } from 'lucide-react';
import { generateResumeContent } from '@/ai/flows/ai-resume-content-generation';
import { toast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';

type Experience = {
  id: string;
  title: string;
  company: string;
  duration: string;
  description: string;
};

export default function ResumeBuilderPage() {
  const { user } = useUser();
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript', 'Next.js', 'Firebase', 'Tailwind CSS']);
  const [newSkill, setNewSkill] = useState('');
  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: '1',
      title: 'Full Stack Intern',
      company: 'TechCorp Solutions',
      duration: 'June 2023 - Aug 2023',
      description: 'Built real-time dashboards using Next.js and Firebase. Optimized database queries for high scalability.'
    }
  ]);
  const [generatedContent, setGeneratedContent] = useState<{
    summary: string;
    experienceBulletPoints: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const addExperience = () => {
    setExperiences([...experiences, {
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      company: '',
      duration: '',
      description: ''
    }]);
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setExperiences(experiences.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
  };

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const result = await generateResumeContent({
        skills,
        experiences: experiences.map(({ title, company, duration, description }) => ({
          title,
          company,
          duration,
          description
        }))
      });
      setGeneratedContent(result);
      toast({
        title: "Content Generated!",
        description: "AI has polished your resume for maximum impact.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Something went wrong while generating content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">Resume Builder</h1>
          <p className="text-muted-foreground">AI-powered professional resume tailoring.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()} className="border-primary/20 text-primary hover:bg-primary/5">
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
          <Button onClick={handleGenerate} disabled={isLoading || experiences.length === 0} className="shadow-lg">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Polish with AI
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Side - Hidden during print */}
        <div className="space-y-6 print:hidden">
          <Card className="border-primary/5 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-headline">Key Skills</CardTitle>
              <CardDescription>Technical and professional competencies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="e.g. Leadership, Python" 
                  value={newSkill} 
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button variant="secondary" onClick={addSkill} size="icon" className="shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <Badge key={skill} className="px-3 py-1 bg-primary/5 text-primary border-primary/10 hover:bg-primary/15 transition-colors">
                    {skill}
                    <button className="ml-2 hover:text-destructive" onClick={() => removeSkill(skill)}>
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/5 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg font-headline">Experience History</CardTitle>
                <CardDescription>Detail your professional journey.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={addExperience} className="text-primary">
                <Plus className="h-4 w-4 mr-1" /> Add Entry
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {experiences.map((exp) => (
                <div key={exp.id} className="space-y-3 p-4 border border-dashed rounded-lg relative group bg-muted/20">
                  <button 
                    className="absolute top-4 right-4 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeExperience(exp.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Role Title</Label>
                      <Input value={exp.title} onChange={(e) => updateExperience(exp.id, 'title', e.target.value)} placeholder="e.g. Software Engineer" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Organization</Label>
                      <Input value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} placeholder="Company Name" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Duration</Label>
                    <Input value={exp.duration} onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)} placeholder="e.g., Aug 2022 - Present" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Raw Description</Label>
                    <Textarea 
                      value={exp.description} 
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)} 
                      placeholder="List achievements or responsibilities. AI will polish this." 
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Professional Preview Side - Styled for PDF */}
        <div className="space-y-6 lg:sticky lg:top-6">
          <Card className="min-h-[842px] w-full shadow-2xl print:shadow-none print:border-none print:p-0 print:m-0 bg-white">
            <CardHeader className="text-center border-b-2 border-primary/20 pb-8 space-y-2">
              <CardTitle className="text-4xl font-bold font-headline uppercase tracking-tight text-slate-900">
                {user?.email?.split('@')[0].toUpperCase()} Student
              </CardTitle>
              <div className="flex justify-center flex-wrap gap-4 text-xs font-medium text-slate-600">
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {user?.email}</span>
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> +1 000 000 000</span>
                <span className="flex items-center gap-1"><LinkIcon className="h-3 w-3" /> linkedin.com/in/student</span>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-10 px-10">
              <section className="space-y-3">
                <h3 className="text-sm font-black tracking-widest text-primary uppercase border-b border-slate-200 pb-1">Professional Profile</h3>
                <p className="text-sm leading-relaxed text-slate-700 italic">
                  {generatedContent ? generatedContent.summary : "Dedicated student with a strong background in collaborative environments and technical problem-solving. Proven ability to adapt to new technologies and deliver results under tight deadlines."}
                </p>
              </section>

              <section className="space-y-6">
                <h3 className="text-sm font-black tracking-widest text-primary uppercase border-b border-slate-200 pb-1">Professional Experience</h3>
                {generatedContent ? (
                  generatedContent.experienceBulletPoints.map((exp, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-slate-900">{exp.title}</span>
                        <span className="text-xs font-bold text-slate-500 uppercase">{experiences[i]?.duration}</span>
                      </div>
                      <div className="text-xs font-black text-slate-400 uppercase tracking-tighter">{exp.company}</div>
                      <ul className="list-disc ml-4 text-sm space-y-1.5 text-slate-700 pt-1">
                        {exp.bulletPoints.map((bp: string, j: number) => (
                          <li key={j} className="pl-1 leading-snug">{bp}</li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  experiences.map((exp) => (
                    <div key={exp.id} className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-slate-900">{exp.title || "Position Title"}</span>
                        <span className="text-xs font-bold text-slate-500 uppercase">{exp.duration || "Period"}</span>
                      </div>
                      <div className="text-xs font-black text-slate-400 uppercase tracking-tighter">{exp.company || "Organization Name"}</div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {exp.description || "Describe your impact and key achievements in this role..."}
                      </p>
                    </div>
                  ))
                )}
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-black tracking-widest text-primary uppercase border-b border-slate-200 pb-1">Technical Expertise</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm text-slate-700">
                  {skills.map(s => (
                    <div key={s} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                      <span className="font-medium">{s}</span>
                    </div>
                  ))}
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          nav, header, .sidebar, button, [role="alert"] {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .shadow-2xl, .shadow-lg, .shadow-sm {
            box-shadow: none !important;
          }
          .border {
            border: none !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
