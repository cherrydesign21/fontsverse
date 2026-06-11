// Font type (legacy - use DBFont from supabase.ts for DB data)
export interface Font {
  id: number;
  name: string;
  category: string;
  bg: string;
  color: string;
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  letterSpacing: string;
  textTransform?: string;
  downloads: number;
  isPublic: boolean;
  slug: string;
}

export const FRAMEWORKS = [
  { id: "html",    label: "HTML",    icon: "🌐" },
  { id: "css",     label: "CSS",     icon: "🎨" },
  { id: "react",   label: "React",   icon: "⚛️" },
  { id: "nextjs",  label: "Next.js", icon: "▲"  },
  { id: "vue",     label: "Vue",     icon: "💚" },
  { id: "angular", label: "Angular", icon: "🔺" },
  { id: "flutter", label: "Flutter", icon: "🐦" },
  { id: "android", label: "Android", icon: "🤖" },
];

export function getSnippet(fw: string, fontName: string): string {
  const slug = fontName.toLowerCase().replace(/ /g, "-");
  const base = `https://fontsverse.app/fonts/${slug}`;
  const map: Record<string, string> = {
    html:    `<link rel="stylesheet" href="${base}/stylesheet.css">\n\n<style>\n  body {\n    font-family: '${fontName}', sans-serif;\n  }\n</style>`,
    css:     `@import url('${base}/stylesheet.css');\n\n.my-element {\n  font-family: '${fontName}', sans-serif;\n  font-weight: 400;\n}`,
    react:   `// npm install @fontsverse/react\nimport '@fontsverse/react/dist/${slug}.css';\n\nexport default function App() {\n  return (\n    <p style={{ fontFamily: "'${fontName}'" }}>Hello World</p>\n  );\n}`,
    nextjs:  `// app/layout.tsx\nimport { FontsVerse } from '@fontsverse/next';\n\nconst font = FontsVerse({ family: '${fontName}', weight: ['400','700'] });\n\nexport default function Layout({ children }) {\n  return (\n    <html>\n      <body className={font.className}>{children}</body>\n    </html>\n  );\n}`,
    vue:     `// main.js\nimport '${base}/stylesheet.css'\n\n// Component.vue\n<template>\n  <p :style="{ fontFamily: '${fontName}' }">Hello World</p>\n</template>`,
    angular: `// angular.json → styles:\n"styles": ["${base}/stylesheet.css"]\n\n// component.ts\n@Component({\n  styles: [\`.text { font-family: '${fontName}', sans-serif; }\`]\n})\nexport class AppComponent {}`,
    flutter: `# pubspec.yaml\ndependencies:\n  fontsverse_flutter: ^1.0.0\n\n# main.dart\nimport 'package:fontsverse_flutter/fontsverse_flutter.dart';\n\nText(\n  'Hello World',\n  style: FontsVerse.textStyle(\n    fontFamily: '${fontName}',\n    fontSize: 24,\n  ),\n)`,
    android: `// build.gradle (app)\nimplementation 'app.fontsverse:android:1.0.0'\n\n// res/font/${slug.replace(/-/g,"_")}.xml\n<font-family\n  app:fontProviderAuthority="app.fontsverse.provider"\n  app:fontQuery="${fontName}" />\n\n// MainActivity.kt\nFontsVerse.loadFont(this, "${fontName}", R.id.textView)`,
  };
  return map[fw] ?? "";
}
