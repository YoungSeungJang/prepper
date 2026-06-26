import { redirect } from "next/navigation";

export default async function RecipeDetailRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/?recipe=${encodeURIComponent(id)}`);
}
