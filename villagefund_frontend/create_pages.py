import os

pages = ['Home', 'About', 'Contact', 'Gallery', 'Transparency', 'Campaigns', 'CampaignDetail', 'Leaderboard', 'Login', 'Register', 'Dashboard', 'Profile', 'ThankYou', 'Notifications']
admin_pages = ['AdminDashboard', 'UserManagement', 'AuditLog', 'ReserveManagement']

os.makedirs('src/pages', exist_ok=True)
os.makedirs('src/pages/admin', exist_ok=True)

for p in pages:
    with open(f'src/pages/{p}.jsx', 'w') as f:
        f.write(f'''export default function {p}() {{
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-heading font-bold text-primary mb-4">{p} Page</h1>
      <p className="text-gray-600">This is a placeholder for the {p} page.</p>
    </div>
  );
}}
''')

for p in admin_pages:
    with open(f'src/pages/admin/{p}.jsx', 'w') as f:
        f.write(f'''export default function {p}() {{
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-heading font-bold text-secondary mb-4">Admin: {p}</h1>
      <p className="text-gray-600">This is a placeholder for the Admin {p} page.</p>
    </div>
  );
}}
''')
