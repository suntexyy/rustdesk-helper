import CategoryEditPage from "@/features/category/components/CategoryEditPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <CategoryEditPage id={id} />;
}
