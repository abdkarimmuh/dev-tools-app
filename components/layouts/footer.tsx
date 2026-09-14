export function Footer() {
  return (
    <footer className="mt-auto border-t px-6 py-4 text-center text-xs">
      <span className="text-muted-foreground">
        © {new Date().getFullYear()} created by{" "}
      </span>
      <a
        href="https://abdkarim.com"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-foreground font-bold underline-offset-4 hover:underline"
      >
        Muhammad Abdul Karim
      </a>
      <span className="text-muted-foreground"> powered by </span>
      <a
        href="https://kotakkode.com"
        target="_blank"
        rel="noopener noreferrer"
        className="font-bold text-emerald-700 underline-offset-4 hover:text-emerald-800 hover:underline"
      >
        kotakkode.com
      </a>
    </footer>
  );
}
