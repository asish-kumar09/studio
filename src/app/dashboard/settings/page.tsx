
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Save, Loader2, ShieldCheck, BadgeCheck } from "lucide-react"
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { toast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const profileSchema = z.object({
  firstName: z.string().min(2, "First name is required."),
  lastName: z.string().min(2, "Last name is required."),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function SettingsPage() {
  const { user } = useUser()
  const db = useFirestore()
  
  const userRef = useMemoFirebase(() => {
    if (!user) return null
    return doc(db, 'userProfiles', user.uid)
  }, [db, user])

  const { data: profile, isLoading: isProfileLoading } = useDoc(userRef)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
    },
  })

  useEffect(() => {
    if (profile) {
      form.reset({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
      })
    }
  }, [profile, form])

  const onSave = async (values: ProfileFormValues) => {
    if (!user || !userRef) return
    
    setIsSaving(true)
    try {
      await updateDoc(userRef, {
        firstName: values.firstName,
        lastName: values.lastName,
      })
      toast({
        title: "Profile Updated",
        description: "Your settings have been saved successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "An error occurred while saving your changes.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h1 className="text-3xl font-bold font-headline text-primary">Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile information and account preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_250px]">
        <div className="space-y-6">
          <Card className="border-primary/5 shadow-sm">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSave)}>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                  <CardDescription>Update your name and profile details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="email" value={user?.email || ""} disabled className="pl-9 bg-muted/50" />
                    </div>
                    <p className="text-[10px] text-muted-foreground italic">Email address cannot be changed for academic verification purposes.</p>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-6">
                  <Button type="submit" disabled={isSaving} className="shadow-md">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>

          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-lg text-destructive">Advanced Actions</CardTitle>
              <CardDescription>Security and account management.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Requesting an account deletion will remove all your data including chat history and resumes.</p>
              <Button variant="destructive">Delete Account</Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-primary/5 shadow-sm">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4 border-4 border-primary/10 shadow-lg">
                <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/150/150`} />
                <AvatarFallback>{profile?.firstName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-lg">{profile?.firstName} {profile?.lastName}</h3>
              <p className="text-xs text-muted-foreground mb-4 uppercase font-bold tracking-widest">{profile?.role === 'admin' ? 'System Administrator' : 'Academic Student'}</p>
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-lg border border-primary/5">
                  <span className="flex items-center gap-1.5 font-medium"><BadgeCheck className="h-3.5 w-3.5 text-green-500" /> Verified</span>
                  <span className="text-green-600 font-bold">YES</span>
                </div>
                <div className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-lg border border-primary/5">
                  <span className="flex items-center gap-1.5 font-medium"><ShieldCheck className="h-3.5 w-3.5 text-blue-500" /> Security</span>
                  <span className="text-blue-600 font-bold">HIGH</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
