import { redirect } from "next/navigation";

/** UI alias — clients and vendors share the same canonical record. */
export default function ClientsAliasPage() {
  redirect("/admin/os/vendors");
}
