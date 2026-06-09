import { redirect } from "next/navigation";

export const metadata = {
  title: "דשבורד",
};

export default function LegacyDashboardRedirect() {
  redirect("/admin/dashboard");
}
