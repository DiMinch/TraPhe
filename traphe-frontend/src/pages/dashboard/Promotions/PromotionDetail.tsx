import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Edit,
  Trash2,
  BellIcon,
  ChevronRight,
  Calendar,
  Save,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useState } from "react";
import { CURRENT_USER } from "@/constants/user";

export default function PromotionDetailPage() {
  const navigate = useNavigate();
  const { promotionCode } = useParams();
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // Save logic here
    console.log("Saving changes...");
    setIsEditing(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Promotion Detail</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button
              onClick={() => navigate("/promotions")}
              className="hover:text-indigo-900"
            >
              Promotion List
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="font-medium">{promotionCode}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Welcome {CURRENT_USER.role} {CURRENT_USER.name}
          </span>
          <Button variant="outline" size="icon">
            <BellIcon />
          </Button>
          <Button variant="outline" size="sm">
            CN
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mb-6">
        {isEditing ? (
          <Button
            className="bg-indigo-900 hover:bg-indigo-800 text-white"
            onClick={handleSave}
          >
            <Save className="mr-2" />
            Save
          </Button>
        ) : (
          <Button
            className="bg-indigo-900 hover:bg-indigo-800 text-white"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="mr-2" />
            Edit
          </Button>
        )}
        <Button className="bg-red-600 hover:bg-red-700 text-white">
          <Trash2 className="mr-2" />
          Delete
        </Button>
      </div>

      {/* Main Card */}
      <Card className="shadow-md">
        <CardContent className="p-6 space-y-8">
          {/* General Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">General</h2>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  defaultValue="Mùa hè IT 2025"
                  className="bg-white"
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  defaultValue="SUMMER2025"
                  className="bg-white"
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  defaultValue="10"
                  className="bg-white"
                  type="number"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <div className="relative">
                  <Input
                    id="start-date"
                    defaultValue="23/11/2024"
                    className="bg-white"
                    disabled={!isEditing}
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <div className="relative">
                  <Input
                    id="end-date"
                    defaultValue="23/12/2024"
                    className="bg-white"
                    disabled={!isEditing}
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue="active" disabled={!isEditing}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Rule and Scope Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Rule and Scope</h2>
            <div className="grid grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select defaultValue="percentage" disabled={!isEditing}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="PERCENTAGE" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">PERCENTAGE</SelectItem>
                    <SelectItem value="fixed">FIXED AMOUNT</SelectItem>
                    <SelectItem value="bogo">BOGO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Value (optional)</Label>
                <Input
                  id="value"
                  defaultValue="10%"
                  className="bg-white"
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-discount">Max Discount Amount</Label>
                <Input
                  id="max-discount"
                  defaultValue="$ 1000"
                  className="bg-white"
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label>Scope</Label>
                <RadioGroup
                  defaultValue="order"
                  className="flex items-center gap-6 mt-2"
                  disabled={!isEditing}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="order" id="order" />
                    <Label
                      htmlFor="order"
                      className="font-normal cursor-pointer"
                    >
                      Order
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="product" id="product" />
                    <Label
                      htmlFor="product"
                      className="font-normal cursor-pointer"
                    >
                      Product
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* Conditions Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Conditions</h2>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="customer-tiers">
                  Applicable Customer Tiers
                </Label>
                <Select defaultValue="gold-platinum" disabled={!isEditing}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="GOLD, PLATINUM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gold-platinum">
                      GOLD, PLATINUM
                    </SelectItem>
                    <SelectItem value="gold">GOLD</SelectItem>
                    <SelectItem value="platinum">PLATINUM</SelectItem>
                    <SelectItem value="silver">SILVER</SelectItem>
                    <SelectItem value="all">All Tiers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="categories">Promoted Categories</Label>
                <Select defaultValue="laptop" disabled={!isEditing}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Laptop" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="laptop">Laptop</SelectItem>
                    <SelectItem value="mouse">Mouse</SelectItem>
                    <SelectItem value="keyboard">Keyboard</SelectItem>
                    <SelectItem value="monitor">Monitor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-order">Min Order Value</Label>
                <Input
                  id="min-order"
                  defaultValue="$ 1000"
                  className="bg-white"
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
