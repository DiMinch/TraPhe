import { Target, Sparkles, Globe, ShieldCheck } from "lucide-react";

export default function MissionPage() {
  const values = [
    {
      icon: Target,
      title: "Sứ mệnh",
      desc: "Mang đến cho người Việt những ly trà và cà phê chất lượng cao, giá hợp lý, tạo nên thói quen thưởng thức lành mạnh mỗi ngày.",
    },
    {
      icon: Sparkles,
      title: "Tầm nhìn",
      desc: "Trở thành thương hiệu trà & cà phê hàng đầu Việt Nam, được yêu thích bởi chất lượng và trải nghiệm khách hàng.",
    },
    {
      icon: Globe,
      title: "Cam kết bền vững",
      desc: "Sử dụng nguyên liệu từ các nguồn có trách nhiệm, giảm thiểu rác thải nhựa và đồng hành cùng cộng đồng nông dân Việt.",
    },
    {
      icon: ShieldCheck,
      title: "An toàn thực phẩm",
      desc: "Tuân thủ nghiêm ngặt tiêu chuẩn ATTP, minh bạch trong nguồn gốc nguyên liệu và quy trình chế biến.",
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <section className="relative bg-gradient-to-br from-emerald-50 to-teal-50 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Sứ mệnh & Giá trị</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Tại TraPhe, chúng tôi không chỉ bán đồ uống — chúng tôi tạo nên trải nghiệm.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto py-20 px-6">
        <div className="grid md:grid-cols-2 gap-8">
          {values.map((v) => (
            <div key={v.title} className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 mb-4 bg-emerald-50 rounded-lg flex items-center justify-center">
                <v.icon className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{v.title}</h3>
              <p className="text-gray-600 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
