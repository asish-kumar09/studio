"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"
import { ShieldAlert, Users, Calendar, CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react"
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, query, orderBy, doc, limit } from "firebase/firestore"
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

const activityData = [
  { name: "Mon", queries: 40 },
  { name: "Tue", queries: 30 },
  { name: "Wed", queries: 20 },
  { name: "Thu", queries: 50 },
  { name: "Fri", queries: 45 },
  { name: "Sat", queries: 10 },
  { name: "Sun", queries: 15 },
]

type LeaveRequest = {
  id: string;
  studentId: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  applicationDate: string;
};

export default function AdminDashboardPage() {
  const { user } = useUser();
  const db = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'userProfiles', user.uid);
  }, [db, user]);

  // Check roles_admin existence to align with security rules
  const adminRoleRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'roles_admin', user.uid);
  }, [db, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userProfileRef);
  const { data: adminRoleDoc, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);
  
  // Explicitly check for admin role. If profile is loading or role is not admin, this is false.
  // We also verify the roles_admin existence for production consistency.
  const isAuthorized = profile?.role === 'admin' || !!adminRoleDoc;

  // These queries will only ever execute if authorization is strictly confirmed.
  const leavesQuery = useMemoFirebase(() => {
    if (!isAuthorized) return null;
    return query(
      collection(db, 'leaveApplications'), 
      orderBy('applicationDate', 'desc'),
      limit(50)
    );
  }, [db, isAuthorized]);

  const studentsQuery = useMemoFirebase(() => {
    if (!isAuthorized) return null;
    return query(collection(db, 'userProfiles'), limit(100));
  }, [db, isAuthorized]);

  const { data: leaves, isLoading: isLeavesLoading } = useCollection<LeaveRequest>(leavesQuery);
  const { data: students, isLoading: isStudentsLoading } = useCollection(studentsQuery);

  const handleStatusUpdate = (leaveId: string, status: 'approved' | 'rejected') => {
    const leaveRef = doc(db, 'leaveApplications', leaveId);
    updateDocumentNonBlocking(leaveRef, { status });
    toast({
      title: `Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      description: `Leave request has been updated to ${status}.`,
    });
  };

  if (isProfileLoading || isAdminRoleLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="bg-destructive/10 p-6 rounded-full">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-headline">Access Denied</h2>
          <p className="text-muted-foreground max-w-md">
            This area is restricted to system administrators. If you believe this is an error, please ensure you are logged into an admin account.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">Return to Overview</Link>
        </Button>
      </div>
    );
  }

  const pendingCount = (leaves || []).filter(l => l.status === 'pending').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center gap-2">
            <ShieldAlert className="h-8 w-8" /> Admin Portal
          </h1>
          <p className="text-muted-foreground">Manage students, approvals, and system analytics.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isStudentsLoading ? '...' : (students || []).length}</div>
            <p className="text-xs text-muted-foreground">Registered in system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLeavesLoading ? '...' : pendingCount}</div>
            <p className="text-xs text-muted-foreground">Action required soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.9%</div>
            <p className="text-xs text-muted-foreground">Real-time sync active</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">AI Chat Activity</CardTitle>
            <CardDescription>Number of student queries resolved per day.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip />
                  <Bar dataKey="queries" radius={[4, 4, 0, 0]}>
                    {activityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 3 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.4)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline">Recent Requests</CardTitle>
              <CardDescription>Review and process student leave requests.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLeavesLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : (leaves || []).length > 0 ? (
                  leaves!.slice(0, 5).map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.type}</TableCell>
                      <TableCell className="text-xs">{req.startDate} to {req.endDate}</TableCell>
                      <TableCell>
                        <Badge variant={req.status === 'approved' ? 'default' : req.status === 'pending' ? 'secondary' : 'destructive'} className="capitalize">
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {req.status === 'pending' ? (
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500" onClick={() => handleStatusUpdate(req.id, 'approved')}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleStatusUpdate(req.id, 'rejected')}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Processed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      No requests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}