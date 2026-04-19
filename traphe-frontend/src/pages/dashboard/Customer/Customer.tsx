import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CustomerPage() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
          <CardDescription>Manage your customers here</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Customer page content goes here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
