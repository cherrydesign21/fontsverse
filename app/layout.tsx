import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider }      from "@/context/AuthContext";
import { NotifProvider }     from "@/context/NotifContext";
import { UserFontsProvider } from "@/context/UserFontsContext";
import { FontsProvider }     from "@/context/FontsContext";

export const metadata: Metadata = {
  metadataBase: new URL("https://fontsverse.vercel.app"),
  title: {
    default:  "FontsVerse — The Open Font Platform",
    template: "%s — FontsVerse",
  },
  description:
    "Upload, host, and integrate custom fonts into any framework. Free font hosting with embed code for HTML, CSS, React, Next.js, Vue, Angular, Flutter, and Android.",
  keywords: [
    "font hosting", "custom fonts", "web fonts", "font CDN",
    "typography", "Next.js fonts", "React fonts", "open source fonts",
    "font embed", "font upload",
  ],
  authors:  [{ name: "FontsVerse" }],
  creator:  "FontsVerse",
  openGraph: {
    title:       "FontsVerse — The Open Font Platform",
    description: "Upload, host, and integrate custom fonts into any framework — for free.",
    type:        "website",
    url:         "https://fontsverse.vercel.app",
    siteName:    "FontsVerse",
    locale:      "en_US",
  },
  twitter: {
    card:        "summary_large_image",
    title:       "FontsVerse — The Open Font Platform",
    description: "Upload, host, and integrate custom fonts into any framework — for free.",
  },
  robots: {
    index:  true,
    follow: true,
    googleBot: { index: true, follow: true },
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
