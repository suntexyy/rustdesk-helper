"use client";

import { useState } from "react";
import { useContacts } from "../hooks/useContacts";
import { useUpdateContactStatus } from "../hooks/useUpdateContactStatus";
import { useBulkDeleteContacts } from "../hooks/useBulkDeleteContacts";
import { useBulkUpdateContactStatus } from "../hooks/useBulkUpdateContactStatus";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  MailOpen,
  Mail,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import toast from "react-hot-toast";
import { confirmToast } from "@/features/lib/toastConfirm";

export function ContactPage() {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // limit is 10 items per page
  const {
    data: contactsResponse,
    isLoading,
    error,
    page,
    setPage,
    limit,
    setLimit,
  } = useContacts(10);

  const { mutate: updateStatus } = useUpdateContactStatus();
  const { mutate: bulkDelete, isPending: isBulkDeleting } =
    useBulkDeleteContacts();
  const { mutate: bulkUpdate, isPending: isBulkUpdating } =
    useBulkUpdateContactStatus();

  if (isLoading)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading contacts...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        Error loading contacts.
      </div>
    );

  const contacts = contactsResponse?.data?.contacts || [];
  const totalContacts = contactsResponse?.data?.total || 0;
  const totalPages = contactsResponse?.data?.totalPages || 0;

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
      setSelectedIds([]); // clear selection on page change
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
      setSelectedIds([]); // clear selection on page change
    }
  };

  const handleRowClick = (contact: any) => {
    // If unread, mark it as read when clicked
    if (contact.status === "unread") {
      updateStatus({ id: contact._id, status: "read" });
    }
    router.push(`/dashboard/contact/${contact._id}`);
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(contacts.map((c: any) => c._id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((prevId) => prevId !== id));
    }
  };

  const handleBulkAction = (action: "delete" | "read" | "unread") => {
    if (selectedIds.length === 0) return;

    const performDelete = () => {
      bulkDelete(selectedIds, {
        onSuccess: () => {
          setSelectedIds([]);
          toast.success("Messages deleted");
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to delete messages");
        },
      });
    };

    if (action === "delete") {
      // ask for confirmation before deleting
      confirmToast(
        `Delete ${selectedIds.length} message${
          selectedIds.length > 1 ? "s" : ""
        }? This cannot be undone.`,
      ).then((ok) => {
        if (ok) performDelete();
      });
    } else {
      bulkUpdate(
        { ids: selectedIds, status: action },
        {
          onSuccess: () => {
            setSelectedIds([]);
            toast.success(
              `Marked ${selectedIds.length} message${
                selectedIds.length > 1 ? "s" : ""
              } as ${action}`,
            );
          },
          onError: (err: any) => {
            toast.error(err.message || "Failed to update status");
          },
        },
      );
    }
  };

  const isAllSelected =
    contacts.length > 0 && selectedIds.length === contacts.length;
  const hasSelection = selectedIds.length > 0;
  const isPending = isBulkDeleting || isBulkUpdating;

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Inbox</h1>
            <p className="text-sm text-muted-foreground">
              Manage incoming contact messages and keep your admin dashboard
              aligned with the categories section.
            </p>
          </div>
        </div>
        {hasSelection && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 flex-col md:flex-row">
            <span className="text-sm text-muted-foreground mr-2">
              {selectedIds.length} selected
            </span>
            <div className="flex items-center gap-2 sm:flex-row flex-col">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("read")}
                disabled={isPending}
              >
                <MailOpen className="h-4 w-4 mr-2" />
                Mark Read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("unread")}
                disabled={isPending}
              >
                <Mail className="h-4 w-4 mr-2" />
                Mark Unread
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleBulkAction("delete")}
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-md border mx-6 mb-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[40px] px-4">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={(checked) =>
                      toggleSelectAll(checked as boolean)
                    }
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="w-[200px]">Sender</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right w-[150px]">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No messages found.
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact) => (
                  <TableRow
                    key={contact._id}
                    onClick={() => handleRowClick(contact)}
                    className={`cursor-pointer transition-colors ${
                      contact.status === "unread"
                        ? "bg-white dark:bg-zinc-950 font-bold"
                        : "bg-zinc-50/50 dark:bg-zinc-900/50 text-muted-foreground"
                    }`}
                  >
                    <TableCell
                      className="px-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedIds.includes(contact._id)}
                        onCheckedChange={(checked) =>
                          toggleSelectOne(contact._id, checked as boolean)
                        }
                        aria-label={`Select ${contact.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium truncate max-w-[200px]">
                      {contact.name} {contact.lastName}
                    </TableCell>
                    <TableCell className="max-w-[400px]">
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={
                            contact.status === "unread"
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }
                        >
                          {contact.message}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md ${
                          contact.status === "unread"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400"
                            : contact.status === "replied"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        {contact.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {format(new Date(contact.createdAt), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Pagination Controls Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end px-6 pb-6 gap-2 flex-col md:flex-row">
          <div className="text-sm text-muted-foreground mr-4">
            Showing {(page - 1) * limit + 1} to{" "}
            {Math.min(page * limit, totalContacts)} of {totalContacts} contacts
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={page >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </Card>
  );
}
