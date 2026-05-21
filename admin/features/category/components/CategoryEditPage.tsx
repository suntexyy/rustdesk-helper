"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCategory } from "../hooks/useCategory";
import { useUpdateCategory } from "../hooks/useUpdateCategory";

export default function CategoryEditPage({ id }: { id: string }) {
  const router = useRouter();
  const { data, isLoading, error } = useCategory(id);
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();

  const category = data?.data?.category;
  const [title, setTitle] = useState("");
  const [example, setExample] = useState("");
  const [color, setColor] = useState("#000000");

  useEffect(() => {
    if (category) {
      setTitle(category.title || "");
      setExample(category.example);
      setColor(category.color || "#000000");
    }
  }, [category]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    updateCategory(
      {
        id,
        payload: {
          title: title.trim(),
          example,
          color,
        },
      },
      {
        onSuccess: () => {
          toast.success("Category updated successfully.");
          router.push("/dashboard/categories");
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to update category.");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading category...
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading category data.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border shadow-sm">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Edit category</h1>
            <p className="text-sm text-muted-foreground">
              Update the category title, example, and color.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/categories")}
          >
            Back to categories
          </Button>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 flex flex-col justify-between">
                <Label htmlFor="category-title">Title</Label>
                <Input
                  id="category-title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Enter category title"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="category-color">Color</Label>
                  <span className="text-xs text-muted-foreground">
                    Choose a HEX value or use the picker
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-[1fr_auto] items-end">
                  <Input
                    id="category-color"
                    type="text"
                    value={color}
                    onChange={(event) => setColor(event.target.value)}
                    placeholder="#FF5733"
                  />
                  <input
                    type="color"
                    aria-label="Choose category color"
                    value={color}
                    onChange={(event) => setColor(event.target.value)}
                    className="h-12 w-12 rounded-md border border-input bg-background p-0"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-example">Example text</Label>
              <textarea
                id="category-example"
                className="min-h-35 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/50"
                value={example}
                onChange={(event) => setExample(event.target.value)}
                placeholder="Enter an example phrase for the category"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/categories")}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
