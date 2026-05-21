"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCategory } from "../hooks/useCreateCategory";

export default function CategoryCreatePage() {
  const router = useRouter();
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();

  const [title, setTitle] = useState("");
  const [example, setExample] = useState("");
  const [color, setColor] = useState("#FF5733");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    createCategory(
      {
        title: title.trim(),
        example: example.trim(),
        color,
      },
      {
        onSuccess: () => {
          toast.success("Category created successfully.");
          router.push("/dashboard/categories");
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to create category.");
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      <Card className="border shadow-sm">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Create new category</h1>
            <p className="text-sm text-muted-foreground">
              Add a new category with title, example and color.
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
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Enter category title"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="category-color">Color</Label>
                  <span className="text-xs text-muted-foreground">
                    Choose a color or paste a value
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
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating…" : "Create category"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
