import { redirect } from "next/navigation";

/** UI alias — clients and vendors share the same canonical record. */
export default function NewClientAliasPage() {
  redirect("/admin/os/vendors/new");
}
