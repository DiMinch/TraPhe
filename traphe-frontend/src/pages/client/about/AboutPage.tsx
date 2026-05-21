import { Coffee, Heart, Users, Leaf } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-amber-50 to-orange-50 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Về TraPhe</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Hành trình mang hương vị trà và cà phê Việt Nam đến gần hơn với mọi người.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-5xl mx-auto py-20 px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Câu chuyện thương hiệu</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                TraPhe ra đời từ niềm đam mê với những ly trà và cà phê chất lượng.
                Chúng tôi tin rằng mỗi tách đồ uống không chỉ là thức uống, mà còn
                là trải nghiệm — kết nối con người với nhau.
              </p>
              <p>
                Với nguyên liệu được chọn lọc kỹ càng từ các vùng trồng nổi tiếng
                của Việt Nam, TraPhe cam kết mang đến sản phẩm tự nhiên, an toàn
                và đậm đà hương vị.
              </p>
            </div>
          </div>
          <div className="bg-amber-50 rounded-2xl p-12 flex items-center justify-center">
            <Coffee className="w-32 h-32 text-amber-600 opacity-30" />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Giá trị cốt lõi</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Heart, title: "Chất lượng", desc: "Nguyên liệu tự nhiên, quy trình chuẩn" },
              { icon: Users, title: "Cộng đồng", desc: "Kết nối con người qua từng tách trà" },
              { icon: Leaf, title: "Bền vững", desc: "Phát triển hài hoà với thiên nhiên" },
            ].map((v) => (
              <div key={v.title} className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
                <div className="w-14 h-14 mx-auto mb-4 bg-amber-50 rounded-full flex items-center justify-center">
                  <v.icon className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
