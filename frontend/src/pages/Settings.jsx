import { useAuth } from '../context/AuthContext';
import { Card, SectionHeader } from '../components/ui';

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <SectionHeader title="Settings" subtitle="Account and connection details." />
      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-sm text-[#3a8a3a]">Signed in as</div>
            <div className="mt-2 font-medium text-[#001e00]">{user?.displayName || user?.email || 'Unknown'}</div>
          </div>
          <div>
            <div className="text-sm text-[#3a8a3a]">API Base URL</div>
            <div className="mt-2 font-medium text-[#001e00]">{import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
