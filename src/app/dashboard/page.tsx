
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar, CheckCircle2, Clock, MessageSquare, AlertCircle, FileText, Loader2, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, where, orderBy, limit } from "firebase/firestore"
import Link from "next/link"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from "recharts"

export default function DashboardPage() {
  const { user } = useUser();
  const db = useFirestore();

  const leavesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'leaveApplications'), where('studentId', '==', user.uid));
  }, [db, user]);

  const { data: leaves, isLoading: isLeavesLoading } = useCollection(leavesQuery);

  const chatsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'userProfiles', user.uid, 'chatSessions'), orderBy('startTime', 'desc'), limit(5));
  }, [db, user]);

  const { data: recentChats, isLoading: isChatsLoading } = useCollection(chatsQuery);

  const approvedCount = leaves?.filter(l => l.status === 'approved')?.length || 0;
  const pendingCount = leaves?.filter(l => l.status === 'pending')?.length || 0;
  const rejectedCount = leaves?.filter(l => l.status === 'rejected')?.length || 0;

  const chartData = [
    { name: 'Approved', value: approvedCount, fill: 'hsl(var(--primary))' },
    { name: 'Pending', value: pendingCount, fill: 'hsl(var(--accent))' },
    { name: 'Rejected', value: rejectedCount, fill: 'hsl(var(--destructive))' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">Overview</h1>
          <p className="text-muted-foreground text-sm">Track your academic progress and AI interactions.</p>
        </div>
        <Button asChild size="sm" className="hidden sm:flex">
          <Link href="/dashboard/settings">Complete Profile</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-all border-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Approved Leaves</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLeavesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : approvedCount}</div>
            <p className="text-xs text-muted-foreground">Successfully processed</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all border-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Awaiting Review</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLeavesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : pendingCount}</div>
            <p className="text-xs text-muted-foreground">Action required by Admin</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all border-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">AI Assistance</CardTitle>
            <MessageSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isChatsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : recentChats?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active chat sessions</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all border-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Optimal</div>
            <p className="text-xs text-muted-foreground">Real-time sync active</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-primary/5">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Leave Status Analytics</CardTitle>
            <CardDescription>Breakdown of your application outcomes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full flex items-center justify-center">
              {leaves && leaves.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} hide />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center space-y-2">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">No data available yet.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/5">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button asChild className="w-full justify-start hover:bg-primary/5" variant="outline">
              <Link href="/dashboard/leaves">
                <Calendar className="mr-2 h-4 w-4 text-primary" /> Apply for Leave
              </Link>
            </Button>
            <Button asChild className="w-full justify-start hover:bg-primary/5" variant="outline">
              <Link href="/dashboard/chatbot">
                <MessageSquare className="mr-2 h-4 w-4 text-primary" /> Intelligent Help
              </Link>
            </Button>
            <Button asChild className="w-full justify-start hover:bg-primary/5" variant="outline">
              <Link href="/dashboard/resume">
                <FileText className="mr-2 h-4 w-4 text-primary" /> AI Resume Polish
              </Link>
            </Button>
            <div className="pt-4 mt-4 border-t space-y-3">
              <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Recent Activity</p>
              {leaves?.slice(0, 2).map((l, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="truncate max-w-[120px] font-medium">{l.type} Request</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full font-bold",
                    l.status === 'approved' ? "bg-green-100 text-green-700" :
                    l.status === 'pending' ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"
                  )}>
                    {l.status}
                  </span>
                </div>
              ))}
              {(!leaves || leaves.length === 0) && (
                <p className="text-xs italic text-muted-foreground">Start by applying for a leave.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
