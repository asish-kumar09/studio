
"use client"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type LeaveRequest = {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
};

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([
    { id: '1', type: 'Medical', startDate: '2024-03-10', endDate: '2024-03-12', status: 'Approved', reason: 'Flu symptoms' },
    { id: '2', type: 'Personal', startDate: '2024-03-25', endDate: '2024-03-26', status: 'Pending', reason: 'Family event' },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleApply = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newLeave: LeaveRequest = {
      id: Math.random().toString(36).substr(2, 9),
      type: formData.get('type') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      status: 'Pending',
      reason: formData.get('reason') as string,
    };
    setLeaves([newLeave, ...leaves]);
    setIsDialogOpen(false);
    toast({
      title: "Leave Applied",
      description: "Your leave request has been submitted for approval.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">Leave Management</h1>
          <p className="text-muted-foreground">Apply for and track your leave requests.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-md">
              <Plus className="mr-2 h-4 w-4" /> Apply for Leave
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleApply}>
              <DialogHeader>
                <DialogTitle className="font-headline">Apply for Leave</DialogTitle>
                <DialogDescription>
                  Fill in the details for your leave request.
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
                <Button type="submit">Submit Request</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-blue-50/50 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Total Leaves
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">20 Days</div>
            <p className="text-xs text-muted-foreground">Annual allowance</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50/50 border-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8 Days</div>
            <p className="text-xs text-muted-foreground">40% of allowance</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50/50 border-orange-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 Days</div>
            <p className="text-xs text-muted-foreground">Available for use</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="font-headline">Recent Leave Requests</CardTitle>
          <CardDescription>A history of your leave applications.</CardDescription>
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
              {leaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell className="font-medium">{leave.type}</TableCell>
                  <TableCell>
                    {leave.startDate} to {leave.endDate}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{leave.reason}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        leave.status === 'Approved'
                          ? 'default'
                          : leave.status === 'Pending'
                          ? 'secondary'
                          : 'destructive'
                      }
                      className="gap-1"
                    >
                      {leave.status === 'Approved' && <CheckCircle2 className="h-3 w-3" />}
                      {leave.status === 'Pending' && <Clock className="h-3 w-3" />}
                      {leave.status === 'Rejected' && <XCircle className="h-3 w-3" />}
                      {leave.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {leaves.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No leave requests found.
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
