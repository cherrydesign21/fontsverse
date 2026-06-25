import type { Metadata } from "next";
import SignupPageClient from "@/components/SignupPageClient";

export const metadata: Metadata = { title: "Create Account — FontsVerse" };

export default function SignupPage() {
  return <SignupPageClient />;
}
