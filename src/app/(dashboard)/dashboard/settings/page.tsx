import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/page-header";
import { AppearanceSettings } from "@/features/profile/components/appearance-settings";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>How you appear across the app.</CardDescription>
            </CardHeader>
            <CardContent className="grid max-w-md gap-4">
              <Alert>
                <AlertDescription>
                  Profile editing turns on once you are signed in. These fields are disabled until
                  then.
                </AlertDescription>
              </Alert>
              <FormField label="Display name">
                <Input disabled placeholder="Your name" />
              </FormField>
              <FormField label="Email">
                <Input disabled type="email" placeholder="you@example.com" />
              </FormField>
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
