// lib/remote-config.ts
"use server"
import { dashboardRemoteConfig } from "@/lib/firebase-admin";

export async function getAutoInviteEnabled(): Promise<boolean> {
  const template = await dashboardRemoteConfig.getTemplate();
  const autoInviteParam = template.parameters["auto_invite_enabled"];

  // Fix for the TypeScript error
  if (!autoInviteParam || !autoInviteParam.defaultValue) {
    return false;
  }

  // Type assertion to handle the Firebase Admin SDK type mismatch
  const defaultValue = autoInviteParam.defaultValue as { value?: string };
  return defaultValue.value === "true";
}

export async function setAutoInviteEnabled(enabled: boolean) {
    console.log(enabled)
  const template = await dashboardRemoteConfig.getTemplate();
  console.log(template)
  template.parameters["auto_invite_enabled"] = {
    defaultValue: { value: enabled ? "true" : "false" }
  };
  await dashboardRemoteConfig.validateTemplate(template);
  await dashboardRemoteConfig.publishTemplate(template);
}
