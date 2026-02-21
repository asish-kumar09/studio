"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CheckCircle2, Clock, MessageSquare, AlertCircle, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, where, orderBy, limit } from "firebase/firestore"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useUser();
  const db = useFirestore();

  // Fetch real data for stats
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

  const approvedCount = leaves?.filter(l => l.status === 'approved').length || 0;
  const pendingCount = leaves?.filter(l => l.status === 'pending').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline text-primary">Overview</h1>
        <p className="text-muted-foreground">Welcome back, {user?.email?.split('@')[0]}!</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Leave Status</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLeavesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : `${approvedCount} Approved`}</div>
            <p className="text-xs text-muted-foreground">Total approved requests</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLeavesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : `${pendingCount} Pending`}</div>
            <p className="text-xs text-muted-foreground">Awaiting admin review</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">AI Sessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isChatsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : recentChats?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Recent conversations</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">System Role</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active Student</div>
            <p className="text-xs text-muted-foreground">Verified academic account</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 border-primary/5">
          <CardHeader>
            <CardTitle className="font-headline">Recent Academic Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaves?.slice(0, 3).map((leave, i) => (
                <div key={i} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
                  <AlertCircle className={cn("h-5 w-5 mt-0.5", 
                    leave.status === "pending" ? "text-orange-500" : 
                    leave.status === "approved" ? "text-green-500" : "text-destructive")} />
                  <div>
                    <p className="text-sm font-medium">Leave {leave.status === 'approved' ? 'Approved' : leave.status === 'rejected' ? 'Rejected' : 'Request Sent'}</p>
                    <p className="text-xs text-muted-foreground">{leave.type} - {new Date(leave.applicationDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {(!leaves || leaves.length === 0) && (
                <p className="text-sm text-muted-foreground italic">No recent activity found.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="font-headline">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/dashboard/leaves">
                <Calendar className="mr-2 h-4 w-4" /> Apply for Leave
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/dashboard/chatbot">
                <MessageSquare className="mr-2 h-4 w-4" /> Ask AI Assistant
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/dashboard/resume">
                <FileText className="mr-2 h-4 w-4" /> Edit Resume
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
