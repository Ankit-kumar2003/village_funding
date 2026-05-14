export default function Footer() {
  return (
    <footer className="bg-text text-background py-8 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-heading font-bold text-primary mb-4">VillageFund</h3>
          <p className="text-sm text-gray-400">
            Transparent community fundraising for Sundarpur, District Ambala, Haryana. Every rupee tracked.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="/about" className="hover:text-accent">About Us</a></li>
            <li><a href="/transparency" className="hover:text-accent">Transparency Report</a></li>
            <li><a href="/contact" className="hover:text-accent">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Developed By</h4>
          <p className="text-sm text-gray-400">
            Ankit<br/>
            B.Tech CSE 2026<br/>
            MM Engineering College, Mullana
          </p>
        </div>
      </div>
      <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t border-gray-700">
        &copy; {new Date().getFullYear()} VillageFund. All rights reserved.
      </div>
    </footer>
  );
}
