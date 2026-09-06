"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/os/guard";
import { logActivity } from "@/lib/os/activity";
import { str } from "@/lib/os/form";
import {
  encryptSecret,
  decryptSecret,
  hasEncryptedSecret,
} from "@/lib/os/vault-crypto";
import { ProductCredential } from "@/models/os/ProductCredential";
import type { ActionState } from "@/actions/auth";

function revalidateCreds() {
  revalidatePath("/admin/os/credentials");
}

export async function createProductCredential(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("vault:credentials");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const productName = str(formData, "productName");
  if (!productName) return { error: "Product name is required" };

  const password = str(formData, "password");
  const enc = password ? encryptSecret(password) : null;

  const row = await ProductCredential.create({
    productName,
    category: str(formData, "category"),
    url: str(formData, "url"),
    username: str(formData, "username"),
    passwordCipher: enc?.cipher || "",
    passwordIv: enc?.iv || "",
    passwordTag: enc?.tag || "",
    notes: str(formData, "notes"),
    createdBy: gate.staff.email,
    updatedBy: gate.staff.email,
  });

  await logActivity({
    title: "Product credential saved",
    detail: productName,
    createdBy: gate.staff.email,
    entityType: "product_credential",
    entityId: String(row._id),
  });

  revalidateCreds();
  return { success: "Credential saved" };
}

export async function updateProductCredential(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("vault:credentials");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const row = await ProductCredential.findById(str(formData, "id"));
  if (!row || row.recordStatus !== "active") {
    return { error: "Credential not found" };
  }

  const productName = str(formData, "productName") || row.productName;
  row.productName = productName;
  row.category = str(formData, "category");
  row.url = str(formData, "url");
  row.username = str(formData, "username");
  row.notes = str(formData, "notes");

  const password = str(formData, "password");
  if (password) {
    const enc = encryptSecret(password);
    if (enc) {
      row.passwordCipher = enc.cipher;
      row.passwordIv = enc.iv;
      row.passwordTag = enc.tag;
    }
  }

  row.updatedBy = gate.staff.email;
  await row.save();

  revalidateCreds();
  return { success: "Credential updated" };
}

export async function archiveProductCredential(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("vault:credentials");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const row = await ProductCredential.findById(str(formData, "id"));
  if (!row || row.recordStatus !== "active") {
    return { error: "Credential not found" };
  }
  row.recordStatus = "archived";
  row.updatedBy = gate.staff.email;
  await row.save();

  revalidateCreds();
  return { success: "Credential deleted" };
}

export async function revealProductCredentialPassword(
  id: string
): Promise<{ password?: string; error?: string }> {
  const gate = await requireStaff("vault:credentials");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const row = await ProductCredential.findById(id).lean();
  if (!row || row.recordStatus !== "active") {
    return { error: "Credential not found" };
  }
  if (!hasEncryptedSecret({ cipher: row.passwordCipher })) {
    return { error: "No password saved" };
  }
  const password = decryptSecret({
    cipher: row.passwordCipher,
    iv: row.passwordIv,
    tag: row.passwordTag,
  });
  if (!password) return { error: "Could not decrypt password" };
  return { password };
}
