import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UserPage() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage your users here</CardDescription>
        </CardHeader>
        <CardContent>
          <p>User page content goes here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
