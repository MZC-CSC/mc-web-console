/**
 * Footer Component
 */

export function Footer() {
  return (
    <footer className="border-t bg-background py-4">
      <div className="container flex items-center justify-between text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} M-CMP. All rights reserved.</p>
        <p>MC-Web-Console v2.0.0</p>
      </div>
    </footer>
  );
}
