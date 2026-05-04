import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userProfile } from "@/data/mockData";

export default function AccountTab() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h2 className="text-xl font-bold mb-6">Account Details</h2>

      <form className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label
              htmlFor="firstname"
              className="text-xs font-bold text-gray-500 uppercase"
            >
              First Name *
            </Label>
            <Input
              id="firstname"
              defaultValue={userProfile.firstName}
              className="h-12 bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="lastname"
              className="text-xs font-bold text-gray-500 uppercase"
            >
              Last Name *
            </Label>
            <Input
              id="lastname"
              defaultValue={userProfile.lastName}
              className="h-12 bg-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="displayname"
            className="text-xs font-bold text-gray-500 uppercase"
          >
            Display Name *
          </Label>
          <Input
            id="displayname"
            defaultValue={userProfile.displayName}
            className="h-12 bg-white"
          />
          <p className="text-xs text-gray-400 italic">
            This will be how your name will be displayed in the account section
            and in reviews
          </p>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-xs font-bold text-gray-500 uppercase"
          >
            Email *
          </Label>
          <Input
            id="email"
            defaultValue={userProfile.email}
            className="h-12 bg-white"
          />
        </div>

        <div className="space-y-6 pt-4">
          <h3 className="text-lg font-bold">Password Change</h3>
          <div className="space-y-2">
            <Label
              htmlFor="oldpass"
              className="text-xs font-bold text-gray-500 uppercase"
            >
              Old Password
            </Label>
            <Input
              id="oldpass"
              type="password"
              placeholder="••••••••"
              className="h-12 bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="newpass"
              className="text-xs font-bold text-gray-500 uppercase"
            >
              New Password
            </Label>
            <Input
              id="newpass"
              type="password"
              placeholder="••••••••"
              className="h-12 bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="confirmpass"
              className="text-xs font-bold text-gray-500 uppercase"
            >
              Repeat New Password
            </Label>
            <Input
              id="confirmpass"
              type="password"
              placeholder="••••••••"
              className="h-12 bg-white"
            />
          </div>
        </div>

        <Button className="bg-black hover:bg-gray-800 text-white h-12 px-8 rounded-md mt-4 cursor-pointer">
          Save Changes
        </Button>
      </form>
    </div>
  );
}
