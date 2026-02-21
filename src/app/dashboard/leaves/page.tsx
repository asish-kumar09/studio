"use client"

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Calendar, Clock, CheckCircle2, XCircle, Loader2, BellRing } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

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

export default function LeavesPage() {
  const db = useFirestore();
  const { user } = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const prevStatuses = useRef<Record<string, string>>({});

  // Memoized query for current user's leaves
  const leavesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, 'leaveApplications'),
      where('studentId', '==', user.uid),
      orderBy('applicationDate', 'desc')
    );
  }, [db, user]);

  const { data: leaves, isLoading } = useCollection<LeaveRequest>(leavesQuery);

  // Automated Notifications Effect
  useEffect(() => {
    if (!leaves) return;

    leaves.forEach(leave => {
      const prevStatus = prevStatuses.current[leave.id];
      if (prevStatus && prevStatus !== leave.status) {
        toast({
          title: `Status Update!`,
          description: (
            <div className="flex items-center gap-2">
              <BellRing className="h-4 w-4 text-primary" />
              <span>Your {leave.type} request is now <strong className="capitalize">{leave.status}</strong>.</span>
            </div>
          ),
          variant: leave.status === 'rejected' ? 'destructive' : 'default',
        });
      }
      prevStatuses.current[leave.id] = leave.status;
    });
  }, [leaves]);

  const handleApply = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const leaveData = {
      studentId: user.uid,
      type: formData.get('type') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      status: 'pending',
      reason: formData.get('reason') as string,
      applicationDate: new Date().toISOString(),
    };

    addDocumentNonBlocking(collection(db, 'leaveApplications'), leaveData);
    
    setIsDialogOpen(false);
    toast({
      title: "Leave Applied",
      description: "Your leave request has been submitted for approval.",
    });
  };

  const usedDays = leaves?.filter(l => l.status === 'approved')?.length || 0;
  const pendingDays = leaves?.filter(l => l.status === 'pending')?.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">Leave Management</h1>
          <p className="text-muted-foreground">Apply for and track your leave requests in real-time.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-md bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Apply for Leave
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleApply}>
              <DialogHeader>
                <DialogTitle className="font-headline text-primary">Apply for Leave</DialogTitle>
                <DialogDescription>
                  Enter your details. Administrators will receive your request immediately.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Leave Type</Label>
                  <Input id="type" name="type" placeholder="e.g., Medical, Personal" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">From</Label>
                    <Input id="startDate" name="startDate" type="date" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">To</Label>
                    <Input id="endDate" name="endDate" type="date" required />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea id="reason" name="reason" placeholder="Briefly explain the reason for leave" required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full sm:w-auto">Submit Request</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/10 hover:bg-primary/10 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaves?.length || 0} Requests</div>
            <p className="text-xs text-muted-foreground">Cumulative applications</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/10 hover:bg-green-500/10 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usedDays} Approved</div>
            <p className="text-xs text-muted-foreground">Processed successfully</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-500/5 border-orange-500/10 hover:bg-orange-500/10 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingDays} Pending</div>
            <p className="text-xs text-muted-foreground">Under active review</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-primary/5">
        <CardHeader>
          <CardTitle className="font-headline">Recent Leave Requests</CardTitle>
          <CardDescription>A live feed of your leave statuses.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : leaves && leaves.length > 0 ? (
                leaves.map((leave) => (
                  <TableRow key={leave.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{leave.type}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">{leave.reason}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          leave.status === 'approved'
                            ? 'default'
                            : leave.status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                        }
                        className="gap-1 capitalize"
                      >
                        {leave.status === 'approved' && <CheckCircle2 className="h-3 w-3" />}
                        {leave.status === 'pending' && <Clock className="h-3 w-3" />}
                        {leave.status === 'rejected' && <XCircle className="h-3 w-3" />}
                        {leave.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">
                    No leave requests submitted yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
