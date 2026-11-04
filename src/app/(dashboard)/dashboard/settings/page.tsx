import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormSkeleton } from "@/features/auth/components/form-skeleton";
import { signOut } from "@/features/auth/actions";
import { AppearanceSettings } from "@/features/profile/components/appearance-settings";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { getProfile } from "@/features/profile/queries";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Manage your profile and preferences." />
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>How you appear across the app.</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<FormSkeleton />}>
                <ProfileSection />
              </Suspense>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Session</CardTitle>
              <CardDescription>Sign out of this browser.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={signOut}>
                <Button type="submit" variant="outline">
                  Sign out
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appearance">
          <AppearanceSettings />
        </TabsContent>
      </Tabs>
    </>
  );
}

async function ProfileSection() {
  const profile = await getProfile("/dashboard/settings");
  return <ProfileForm email={profile.email} displayName={profile.displayName} />;
}
