"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCategories } from "../hooks/useCategories";
import { useDeleteCategory } from "../hooks/useDeleteCategory";

const CategoryPage = () => {
  const router = useRouter();
  const { data, isLoading, error } = useCategories();
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const categories = data?.data?.categories || [];

  const handleDeleteClick = (id: string, title: string) => {
    setSelectedCategory({ id, title });
    setDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedCategory) return;

    deleteCategory(selectedCategory.id, {
      onSuccess: () => {
        toast.success("Category deleted successfully.");
        setSelectedCategory(null);
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to delete category.");
        setSelectedCategory(null);
      },
    });

    setDeleteOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Categories</h1>
            <p className="text-sm text-muted-foreground">
              Manage category examples, colors and metadata for the admin
              dashboard.
            </p>
          </div>
          <Button onClick={() => router.push("/dashboard/categories/create")}>
            Create category
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading categories...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-destructive">
              Error loading categories.
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No categories available.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead>Category</TableHead>
                    <TableHead>Example</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category._id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {category.title}
                      </TableCell>
                      <TableCell className="max-w-[40ch] truncate">
                        {category.example}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-4 w-4 rounded-full border"
                            style={{ backgroundColor: category.color }}
                          />
                          <span>{category.color}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/dashboard/categories/${category._id}/edit`,
                              )
                            }
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleDeleteClick(category._id, category.title)
                            }
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setSelectedCategory(null);
          }
          setDeleteOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCategory
                ? `This will permanently delete “${selectedCategory.title}”.`
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <AlertDialogCancel
              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              type="button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="inline-flex h-9 items-center justify-center rounded-md bg-destructive px-4 text-sm font-medium text-white transition-colors hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
              type="button"
              onClick={handleConfirmDelete}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoryPage;
