"use client";

import { useContact } from "../hooks/useContact";
import { useUpdateContactStatus } from "../hooks/useUpdateContactStatus";
import { useDeleteContact } from "../hooks/useDeleteContact";
import toast from "react-hot-toast";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContactStatus } from "../types/contactTypes";
import { confirmToast } from "@/features/lib/toastConfirm";

export function ContactDetailsPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: contactResponse, isLoading, error } = useContact(id);
  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateContactStatus();
  const { mutate: deleteContact, isPending: isDeleting } = useDeleteContact();

  if (isLoading)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading contact details...
      </div>
    );
  if (error || !contactResponse?.data?.contact)
    return (
      <div className="p-8 text-center text-red-500">
        Error loading contact details.
      </div>
    );

  const contact = contactResponse.data.contact;

  const handleStatusChange = (newStatus: string) => {
    updateStatus({ id: contact._id, status: newStatus as ContactStatus });
  };

  return (
    <div>
      <Button
        variant="ghost"
        onClick={() => router.push("/dashboard/contact")}
        className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Inbox
      </Button>

      <Card className="border shadow-sm">
        <CardHeader className="flex md:flex-row items-start justify-between pb-4 border-b flex-col gap-4">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold">
              {contact.name} {contact.lastName}
            </CardTitle>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <a
                href={`mailto:${contact.email}`}
                className="hover:underline text-blue-600 dark:text-blue-400"
              >
                {contact.email}
              </a>
              <span>•</span>
              <a href={`tel:${contact.phone}`} className="hover:underline">
                {contact.phone}
              </a>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 text-sm">
            <span className="text-muted-foreground whitespace-nowrap">
              {format(new Date(contact.createdAt), "PPP 'at' p")}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Status:
              </span>
              <Select
                value={contact.status}
                onValueChange={handleStatusChange}
                disabled={isUpdating || isDeleting}
              >
                <SelectTrigger className="h-8 w-[120px] text-xs font-medium">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="unread"
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400"
                  >
                    UNREAD
                  </SelectItem>
                  <SelectItem
                    value="read"
                    className="text-xs font-semibold text-zinc-600 dark:text-zinc-400"
                  >
                    READ
                  </SelectItem>
                  <SelectItem
                    value="replied"
                    className="text-xs font-semibold text-green-600 dark:text-green-400"
                  >
                    REPLIED
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={() => {
                confirmToast(
                  "Delete this message? This action cannot be undone.",
                ).then((ok) => {
                  if (!ok) return;
                  deleteContact(contact._id, {
                    onSuccess: () => {
                      toast.success("Message deleted");
                      router.push("/dashboard/contact");
                    },
                    onError: (err: any) => {
                      toast.error(err.message || "Failed to delete message");
                    },
                  });
                });
              }}
            >
              Delete
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="prose dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap leading-relaxed text-foreground/90 font-medium bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-lg border">
              {contact.message}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
