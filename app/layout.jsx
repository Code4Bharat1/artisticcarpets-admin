import "@/styles/globals.css";

export const metadata = {
  title: "Artistic Carpets — Admin Console",
  description: "Management console for the Artistic Carpets platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
