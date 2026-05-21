import { ContactDetailsPage } from "@/features/contact/components/ContactDetailsPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ContactDetailsPage id={id} />;
}
