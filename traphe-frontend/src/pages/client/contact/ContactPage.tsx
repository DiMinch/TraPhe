import { useState } from "react";
import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import SubscribeSection from "@/components/common/subscribe/SubscribeSection";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    toast.success("Cảm ơn bạn đã gửi tin nhắn. TraPhe sẽ liên hệ lại với bạn sớm nhất!");
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <div className="bg-[#FBF5EC] min-h-screen pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#5C3317] mb-4">
            Liên hệ
          </h1>
          <p className="text-[#8C7B6E] max-w-2xl mx-auto text-base md:text-lg">
            Chúng tôi luôn lắng nghe. Hãy gửi tin nhắn cho TraPhe nếu bạn cần hỗ trợ,
            có câu hỏi về sản phẩm, hoặc quan tâm đến việc hợp tác kinh doanh.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 mb-20">
          {/* Contact Info Panel (Left) */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="bg-[#EFE5D3] rounded-2xl p-8 shadow-md border border-[#D4C9BC]/30">
              <h2 className="font-serif text-2xl font-bold text-[#5C3317] mb-6">
                Thông tin liên hệ
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#F5EAD8] rounded-xl flex items-center justify-center text-[#C89A6E] shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#4A3F35] mb-1 text-base">
                      Hotline
                    </h3>
                    <p className="text-[#8C7B6E] font-medium">1800 1234 (Miễn phí cước)</p>
                    <p className="text-[#8C7B6E] text-xs mt-0.5">
                      Thứ 2 - Chủ Nhật: 8:00 - 22:00
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#F5EAD8] rounded-xl flex items-center justify-center text-[#C89A6E] shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#4A3F35] mb-1 text-base">
                      Email hỗ trợ
                    </h3>
                    <p className="text-[#8C7B6E] font-medium">support@traphe.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#F5EAD8] rounded-xl flex items-center justify-center text-[#C89A6E] shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#4A3F35] mb-1 text-base">
                      Trụ sở chính
                    </h3>
                    <p className="text-[#8C7B6E] font-medium leading-relaxed">
                      123 Đường Cà Phê, Quận 1, TP. Hồ Chí Minh
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-[#D4C9BC]/50 shadow-sm">
              <h2 className="font-serif text-2xl font-bold text-[#5C3317] mb-4">
                Hợp tác &amp; Doanh nghiệp
              </h2>
              <p className="text-[#8C7B6E] mb-6 leading-relaxed">
                Bạn đang tìm kiếm nguồn cung cấp cà phê chất lượng cao cho quán, văn
                phòng hoặc đối tác quà tặng? Hãy kết nối với đội ngũ bán sỉ của chúng
                tôi.
              </p>
              <a
                className="inline-flex items-center gap-2 text-[#A0622A] hover:text-[#5C3317] font-semibold transition-colors cursor-pointer group"
                href="mailto:wholesale@traphe.com"
              >
                Liên hệ bộ phận bán sỉ
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>

          {/* Contact Form (Right) */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl p-8 lg:p-10 shadow-md border border-[#D4C9BC]/30"
            >
              <h2 className="font-serif text-2xl font-bold text-[#5C3317] mb-8">
                Gửi tin nhắn
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <Label
                    className="block font-medium text-[#4A3F35] text-sm"
                    htmlFor="name"
                  >
                    Họ và tên
                  </Label>
                  <Input
                    className="w-full h-12 bg-transparent border-[1.5px] border-[#D4C9BC] rounded-xl px-4 text-[#1A1410] focus-visible:ring-1 focus-visible:ring-[#5C3317] focus-visible:border-[#5C3317] transition-colors"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    className="block font-medium text-[#4A3F35] text-sm"
                    htmlFor="email"
                  >
                    Email
                  </Label>
                  <Input
                    className="w-full h-12 bg-transparent border-[1.5px] border-[#D4C9BC] rounded-xl px-4 text-[#1A1410] focus-visible:ring-1 focus-visible:ring-[#5C3317] focus-visible:border-[#5C3317] transition-colors"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    type="email"
                  />
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <Label
                  className="block font-medium text-[#4A3F35] text-sm"
                  htmlFor="subject"
                >
                  Chủ đề
                </Label>
                <select
                  className="w-full h-12 bg-transparent border-[1.5px] border-[#D4C9BC] rounded-xl px-4 text-[#1A1410] focus:ring-1 focus:ring-[#5C3317] focus:border-[#5C3317] transition-colors appearance-none outline-none cursor-pointer"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  <option value="">Chọn chủ đề</option>
                  <option value="support">Hỗ trợ đơn hàng</option>
                  <option value="product">Thông tin sản phẩm</option>
                  <option value="feedback">Góp ý</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className="space-y-2 mb-8">
                <Label
                  className="block font-medium text-[#4A3F35] text-sm"
                  htmlFor="message"
                >
                  Nội dung
                </Label>
                <Textarea
                  className="w-full bg-transparent border-[1.5px] border-[#D4C9BC] rounded-xl p-4 text-[#1A1410] focus-visible:ring-1 focus-visible:ring-[#5C3317] focus-visible:border-[#5C3317] transition-colors resize-none"
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hãy viết chi tiết yêu cầu của bạn ở đây..."
                  rows={5}
                />
              </div>

              <Button
                type="submit"
                className="w-full md:w-auto px-8 py-6 bg-[#5C3317] hover:bg-[#2C1A0E] text-white rounded-full font-serif text-[15px] font-semibold transition-colors shadow-sm cursor-pointer"
              >
                Gửi tin nhắn
              </Button>
            </form>
          </div>
        </div>
      </div>
      <SubscribeSection />
    </div>
  );
}
