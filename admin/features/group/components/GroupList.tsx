"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Trash2 } from "lucide-react";

export default function GroupList() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/groups");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`http://localhost:5000/api/groups/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };
  const groups = data?.data || [];

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <h2 className="text-lg font-semibold">All Groups</h2>
        <p className="text-sm text-muted-foreground">
          Click "Open" to monitor a group in real time.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading groups...
          </div>
        ) : groups.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No groups yet. Create one above.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((g: any) => (
                <TableRow key={g._id}>
                  <TableCell className="font-medium">{g.name}</TableCell>
                  <TableCell>
                    <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
                      {g.code}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      onClick={() => router.push(`/dashboard/group/${g.code}`)}
                    >
                      <Users className="size-4 mr-1" />
                      Open
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={deleteMutation.isPending}
                      onClick={() => handleDelete(g._id)}
                    >
                      <Trash2 className="size-4 mr-1" />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
