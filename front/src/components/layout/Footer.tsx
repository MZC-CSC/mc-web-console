export function Footer() {
  const currentYear = new Date().getFullYear();
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';

  return (
    <footer className="border-t bg-background">
      <div className="container flex h-16 items-center justify-between px-4 text-sm text-muted-foreground">
        <div>
          <p>© {currentYear} MC Web Console. All rights reserved.</p>
        </div>
        <div>
          <p>Version {appVersion}</p>
        </div>
      </div>
    </footer>
  );
}
