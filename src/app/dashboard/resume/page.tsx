
"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Wand2, FileText, Download } from 'lucide-react';
import { generateResumeContent } from '@/ai/flows/ai-resume-content-generation';
import { toast } from '@/hooks/use-toast';

type Experience = {
  id: string;
  title: string;
  company: string;
  duration: string;
  description: string;
};

export default function ResumeBuilderPage() {
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript', 'Tailwind CSS']);
  const [newSkill, setNewSkill] = useState('');
  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: '1',
      title: 'Full Stack Intern',
      company: 'TechCorp Solutions',
      duration: 'June 2023 - Aug 2023',
      description: 'Worked on building client-facing dashboards using Next.js and integrated them with Firebase.'
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
        description: "AI has polished your resume summary and experience points.",
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">Resume Builder</h1>
          <p className="text-muted-foreground">Create professional resumes with AI assistance.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
          <Button onClick={handleGenerate} disabled={isLoading || experiences.length === 0}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Generate with AI
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Side */}
        <div className="space-y-6 print:hidden">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-headline">Skills</CardTitle>
              <CardDescription>Add key technical and soft skills.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="e.g. Python, Leadership" 
                  value={newSkill} 
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button variant="secondary" onClick={addSkill} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <Badge key={skill} className="px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                    {skill}
                    <button className="ml-2 hover:text-destructive" onClick={() => removeSkill(skill)}>
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg font-headline">Work Experience</CardTitle>
                <CardDescription>List your internships and projects.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={addExperience}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {experiences.map((exp, idx) => (
                <div key={exp.id} className="space-y-3 p-4 border rounded-lg relative group">
                  <button 
                    className="absolute top-4 right-4 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeExperience(exp.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Title</Label>
                      <Input value={exp.title} onChange={(e) => updateExperience(exp.id, 'title', e.target.value)} placeholder="Job Title" />
                    </div>
                    <div className="space-y-1">
                      <Label>Company</Label>
                      <Input value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} placeholder="Company Name" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Duration</Label>
                    <Input value={exp.duration} onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)} placeholder="e.g., Jan 2023 - June 2023" />
                  </div>
                  <div className="space-y-1">
                    <Label>Original Description</Label>
                    <Textarea 
                      value={exp.description} 
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)} 
                      placeholder="What did you do? AI will polish this later." 
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Preview Side */}
        <div className="space-y-6">
          <Card className="min-h-[600px] shadow-lg print:shadow-none print:border-none">
            <CardHeader className="text-center border-b pb-8">
              <CardTitle className="text-3xl font-bold font-headline">Alex Johnson</CardTitle>
              <div className="flex justify-center gap-4 text-sm text-muted-foreground mt-2">
                <span>alex.j@university.edu</span>
                <span>•</span>
                <span>+1 234 567 890</span>
                <span>•</span>
                <span>LinkedIn.com/in/alexj</span>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-8">
              <section className="space-y-2">
                <h3 className="text-lg font-bold border-b pb-1 text-primary">PROFESSIONAL SUMMARY</h3>
                <p className="text-sm leading-relaxed">
                  {generatedContent ? generatedContent.summary : "Passionate Computer Science student with experience in full-stack development. Seeking to leverage skills in modern web technologies to contribute to innovative software solutions."}
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-lg font-bold border-b pb-1 text-primary">EXPERIENCE</h3>
                {generatedContent ? (
                  generatedContent.experienceBulletPoints.map((exp, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between font-bold text-sm">
                        <span>{exp.title}</span>
                        <span className="text-muted-foreground font-normal">{experiences[i]?.duration}</span>
                      </div>
                      <div className="text-sm italic">{exp.company}</div>
                      <ul className="list-disc ml-5 text-sm space-y-1 pt-1">
                        {exp.bulletPoints.map((bp: string, j: number) => (
                          <li key={j}>{bp}</li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  experiences.map((exp) => (
                    <div key={exp.id} className="space-y-1">
                      <div className="flex justify-between font-bold text-sm">
                        <span>{exp.title || "Position Title"}</span>
                        <span className="text-muted-foreground font-normal">{exp.duration || "Period"}</span>
                      </div>
                      <div className="text-sm italic">{exp.company || "Company Name"}</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {exp.description || "Enter details to see them here..."}
                      </p>
                    </div>
                  ))
                )}
              </section>

              <section className="space-y-2">
                <h3 className="text-lg font-bold border-b pb-1 text-primary">SKILLS</h3>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  {skills.map(s => (
                    <span key={s} className="font-medium">• {s}</span>
                  ))}
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
