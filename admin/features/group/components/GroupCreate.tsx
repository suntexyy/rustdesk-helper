"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import toast from "react-hot-toast";
import { schema } from "../schema/schema";

type FormValues = z.infer<typeof schema>;

export default function GroupCreate() {
  const queryClient = useQueryClient();
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", code: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await fetch("http://localhost:5000/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to create group");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      reset();
      toast.success("Group created successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Something went wrong");
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <h2 className="text-lg font-semibold">Create New Group</h2>
        <p className="text-sm text-muted-foreground">
          Add a group and share the code with your students.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              placeholder="Type Your Group Name"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Group Code — 6 slots via Controller */}
          <div className="space-y-2">
            <Label>Group Code</Label>
            <Controller
              name="code"
              control={control}
              render={({ field }) => {
                const slots = field.value
                  .split("")
                  .concat(Array(6).fill(""))
                  .slice(0, 6);

                const handleChange = (index: number, value: string) => {
                  const char = value.slice(-1).toUpperCase();
                  const newSlots = [...slots];
                  newSlots[index] = char;
                  field.onChange(newSlots.join(""));
                  if (char && index < 5) inputs.current[index + 1]?.focus();
                };

                const handleKeyDown = (
                  index: number,
                  e: React.KeyboardEvent<HTMLInputElement>,
                ) => {
                  if (e.key === "Backspace") {
                    const newSlots = [...slots];
                    if (slots[index]) {
                      newSlots[index] = "";
                      field.onChange(newSlots.join(""));
                    } else if (index > 0) {
                      newSlots[index - 1] = "";
                      field.onChange(newSlots.join(""));
                      inputs.current[index - 1]?.focus();
                    }
                  }
                };

                const handlePaste = (e: React.ClipboardEvent) => {
                  e.preventDefault();
                  const pasted = e.clipboardData
                    .getData("text")
                    .toUpperCase()
                    .slice(0, 6);
                  const newSlots = [...slots];
                  pasted.split("").forEach((char, i) => {
                    newSlots[i] = char;
                  });
                  field.onChange(newSlots.join(""));
                  inputs.current[Math.min(pasted.length, 5)]?.focus();
                };

                return (
                  <div className="flex gap-2">
                    {slots.map((slot: string, i: number) => (
                      <input
                        key={i}
                        ref={(el) => {
                          inputs.current[i] = el;
                        }}
                        value={slot}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        onPaste={handlePaste}
                        maxLength={2}
                        className={`w-11 h-13 rounded-lg text-xl font-mono font-bold text-center outline-none bg-zinc-50 text-zinc-950 transition-colors ${
                          slot
                            ? "border-2 border-zinc-900"
                            : "border-2 border-zinc-200"
                        }`}
                      />
                    ))}
                  </div>
                );
              }}
            />
            {errors.code && (
              <p className="text-sm text-red-500">{errors.code.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              This is the code students will use to join.
            </p>
          </div>

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full"
          >
            {mutation.isPending ? "Creating..." : "Create Group"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
