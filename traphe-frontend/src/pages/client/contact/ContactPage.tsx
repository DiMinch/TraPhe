import { MapPin, Mail, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SubscribeSection from "@/components/common/subscribe/SubscribeSection";

export default function ContactPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gray-50 py-16 text-center px-6">
        <h1 className="text-4xl font-bold mb-4 tracking-tight">Contact Us</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          We love to hear from you. Whether you have a question about features,
          trials, pricing, need a demo, or anything else, our team is ready to
          answer all your questions.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white border border-gray-100 p-8 rounded-lg shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-black">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Our Store</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Quarter 6, Linh Trung Ward,
              <br />
              Thu Duc City, Ho Chi Minh City
            </p>
          </div>

          <div className="bg-white border border-gray-100 p-8 rounded-lg shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-black">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Contact Info</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Phone: +84 909 123 456
              <br />
              Email: support@viti.store
            </p>
          </div>

          <div className="bg-white border border-gray-100 p-8 rounded-lg shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-black">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Business Hours</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Mon - Fri: 08:00 - 22:00
              <br />
              Sat - Sun: 09:00 - 21:00
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Form Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your full name"
                    className="bg-gray-50 border-gray-200 focus-visible:ring-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@gmail.com"
                    className="bg-gray-50 border-gray-200 focus-visible:ring-black"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="How can we help you?"
                  className="bg-gray-50 border-gray-200 focus-visible:ring-black"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  className="min-h-[150px] bg-gray-50 border-gray-200 resize-none focus-visible:ring-black"
                />
              </div>

              <Button className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white px-8 py-6 rounded-md cursor-pointer transition-transform active:scale-95">
                Send Message <Send className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </div>

          {/* Map Section - Đã cập nhật src iframe */}
          <div className="h-full min-h-[450px] w-full bg-gray-100 rounded-xl overflow-hidden shadow-sm border border-gray-200">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.231240416692!2d106.80047917573673!3d10.870008889284565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527587e9ad5bf%3A0xafa66f9c8be3c91!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBDw7RuZyBuZ2jhu4cgVGjDtG5nIHRpbiAtIMSQSFFHIFRQLkhDTQ!5e0!3m2!1svi!2s!4v1705891234567!5m2!1svi!2s"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "450px" }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="University of Information Technology VNUHCM Location"
              className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-500"
            ></iframe>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl font-bold mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="cursor-pointer font-medium hover:no-underline">
                How do I track my order?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                You can track your order by clicking the tracking link in your
                shipping confirmation email, or by logging into your account and
                viewing your order history.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="cursor-pointer font-medium hover:no-underline">
                What is your return policy?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                We accept returns within 30 days of purchase. Items must be in
                their original condition and packaging. Please visit our Returns
                page for more details.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="cursor-pointer font-medium hover:no-underline">
                Do you offer international shipping?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Yes, we ship to most countries worldwide. Shipping costs and
                delivery times vary by location.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="cursor-pointer font-medium hover:no-underline">
                Are the laptops brand new?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Yes, all our products are 100% brand new, sealed, and come with
                a full manufacturer warranty unless explicitly stated as
                "Refurbished".
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <SubscribeSection />
    </div>
  );
}
