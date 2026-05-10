import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageContainer, PageHeader } from "@/components/layout/PageLayout";
import { Users } from "lucide-react";

export default function UserPage() {
  return (
    <PageContainer>
      <PageHeader
        title="User Management"
        subtitle="Manage your users and access control"
      />
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-slate-800">User Directory</CardTitle>
              <CardDescription className="text-slate-500">
                Manage your users here
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-slate-600">User page content goes here.</p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
