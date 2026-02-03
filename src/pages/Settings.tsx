import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TargetSettings } from '@/components/admin/TargetSettings';
import { useAuth } from '@/hooks/useAuth';

export default function Settings() {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    // Redirect non-admin users
    if (!isAdmin) {
        navigate('/');
        return null;
    }

    return (
        <div className="min-h-screen dashboard-gradient p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/')}
                        className="rounded-full"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <SettingsIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Settings</h1>
                            <p className="text-sm text-muted-foreground">Manage your dashboard configuration</p>
                        </div>
                    </div>
                </div>

                {/* Target Settings */}
                <TargetSettings />
            </div>
        </div>
    );
}
