
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Organization, User } from '@/lib/types';
import { Building, UserPlus, Users, Link as LinkIcon, Copy } from 'lucide-react';
import { nanoid } from 'nanoid';

const MOCK_USERS: User[] = [
    { id: 'user_1', name: 'Alice (Admin)', email: 'alice@example.com', role: 'admin', organizationId: 'org_123_abc'},
    { id: 'user_2', name: 'Bob', email: 'bob@example.com', role: 'member', organizationId: 'org_123_abc' },
];

export default function OrganizationTab() {
  const [organization, setOrganization] = useState<Organization | null>({
      id: 'org_123_abc',
      name: 'Happy Kids Daycare',
      ownerId: 'user_1',
      members: MOCK_USERS,
  });
  const [newOrgName, setNewOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateOrganization = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) {
        toast({ variant: 'destructive', title: 'Error', description: 'Organization name cannot be empty.' });
        return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
        const newOrg: Organization = {
            id: `org_${nanoid()}`,
            name: newOrgName.trim(),
            ownerId: 'user_current', // Should be current user's ID
            members: [],
        };
        setOrganization(newOrg);
        setNewOrgName('');
        setLoading(false);
        toast({ title: 'Success', description: 'Organization created successfully!' });
    }, 1000);
  };

  const inviteLink = organization ? `${window.location.origin}/signup/${organization.id}` : '';

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({ title: 'Copied!', description: 'Invite link copied to clipboard.'});
  };

  return (
    <div className="p-4 pb-24 space-y-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Organization</h1>
        <p className="text-muted-foreground">Manage your organization and members</p>
      </div>

      {!organization ? (
        <Card className="bg-card border-border shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-6 h-6 text-primary" />
                    Create an Organization
                </CardTitle>
                <CardDescription>
                    Create an organization to invite your team and share sleep tracking data.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleCreateOrganization} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="orgName">Organization Name</Label>
                        <Input
                            id="orgName"
                            placeholder="e.g., Happy Kids Daycare"
                            value={newOrgName}
                            onChange={(e) => setNewOrgName(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? 'Creating...' : 'Create Organization'}
                    </Button>
                </form>
            </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="bg-card border-border shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                 <Building className="w-6 h-6 text-primary" />
                 {organization.name}
              </CardTitle>
              <CardDescription>
                Manage your organization's settings and members.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-primary" />
                Invite Link
              </CardTitle>
              <CardDescription>
                Share this link with your childcare workers to have them join your organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                  <Input readOnly value={inviteLink} className="bg-muted" />
                  <Button variant="outline" onClick={copyInviteLink}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Members ({organization.members.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {organization.members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                    <div>
                      <p className="font-medium text-foreground">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                    <p className="text-sm font-semibold capitalize text-primary">{member.role}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
