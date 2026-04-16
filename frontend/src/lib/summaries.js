import { getDbConnection } from "@/app/action";

export async function getSummaries(userId: string) {
  const db = await getDbConnection();
  const summaries = await db
    .collection("pdf_summaries")
    .find({ user_id: userId })
    .sort({ created_at: -1 })
    .toArray();

  return summaries.map(s => ({
    ...s,
    id: s._id.toString()
  }));
}
