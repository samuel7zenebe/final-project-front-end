import { Link } from '@tanstack/react-router'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-20 border-t border-border px-4 pb-20 pt-16 text-muted-foreground">
      <div className="page-wrap grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2 text-sm font-bold text-foreground no-underline shadow-sm transition-all hover:bg-muted"
          >
            <span className="h-2 w-2 rounded-full bg-primary" />
            BlogMaster
          </Link>
          <p className="max-w-xs text-sm leading-relaxed">
            The ultimate platform for developers to share insights, tutorials, and stories from the cutting edge of technology.
          </p>
        </div>

        <div>
          <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-foreground">Platform</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><Link to="/" className="hover:text-primary transition">Home</Link></li>
            <li><Link to="/login" className="hover:text-primary transition">Sign In</Link></li>
            <li><Link to="/register" className="hover:text-primary transition">Register</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-foreground">Community</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><a href="#" className="hover:text-primary transition">Guidelines</a></li>
            <li><a href="#" className="hover:text-primary transition">Twitter</a></li>
            <li><a href="#" className="hover:text-primary transition">GitHub</a></li>
          </ul>
        </div>
      </div>

      <div className="page-wrap mt-16 flex flex-col items-center justify-between border-t border-border pt-8 text-[10px] font-bold uppercase tracking-widest sm:flex-row">
        <p className="m-0">
          &copy; {year} BlogMaster. All rights reserved.
        </p>
        <p className="m-0 text-primary">Built with TanStack Start & Tailwind CSS 4</p>
      </div>
    </footer>
  )
}
