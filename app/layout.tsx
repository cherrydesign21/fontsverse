import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider }      from "@/context/AuthContext";
import { NotifProvider }     from "@/context/NotifContext";
import { UserFontsProvider } from "@/context/UserFontsContext";
import { FontsProvider }     from "@/context/FontsContext";

export const metadata: Metadata = {
  title: "FontsVerse — The Open Font Platform",
  description: "Upload, host and integrate custom fonts into any framework. Free font hosting with Supabase storage.",
  openGraph: {
    title: "FontsVerse — The Open Font Platform",
    description: "Upload, host and integrate custom fonts into any framework.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <NotifProvider>
            <FontsProvider>
              <UserFontsProvider>
                {children}
              </UserFontsProvider>
            </FontsProvider>
          </NotifProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
