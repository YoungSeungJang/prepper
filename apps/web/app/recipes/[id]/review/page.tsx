import { redirect } from "next/navigation";

export default async function ReviewRecipeRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/?category=pending&review=${encodeURIComponent(id)}`);
}
