import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SubscribeSection() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-medium mb-4">Join Our Newsletter</h2>
        <p className="text-gray-500 mb-8">
          Sign up for deals, new products and promotions
        </p>

        <form className="max-w-md mx-auto flex items-end gap-0 border-b border-gray-300 pb-2">
          <div className="flex items-center gap-3 w-full">
            <span className="text-gray-400">✉</span>
            <Input
              type="email"
              placeholder="Email address"
              className="border-none shadow-none focus-visible:ring-0 px-0 bg-transparent"
            />
          </div>
          <Button
            type="submit"
            variant="ghost"
            className="text-gray-500 font-medium hover:bg-transparent hover:text-black p-0 h-auto"
          >
            Signup
          </Button>
        </form>
      </div>
    </section>
  );
}
