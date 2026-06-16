import { Droplet, Leaf } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-background text-on-background antialiased min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[716px] min-h-[500px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              alt="TraPhe Origins"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpelqkLixkTVdXdRSxWNFg4YpDq39i_IMhUMMFi_j4SUR-ysAVELEwnVknMohCHeYKY7s0Bu4P8PDRZBMTQS8RDJe_TuFsDrulRjfivI21UXV-DZFdUD4xsL-VA-DE5MKHwoKU688izf-DlnOmiICWBIMBpgVCdPSosknmtooSzZlAhwMXpaOD8QMmf0VdtyX4TlNjLUScB16j8i6_Y_uMmxO4-gI-kVGlfPZD8nQbXx87YJAF4hvkAG_NTF8IhWbC8Cf1TXsnAgo"
            />
            <div className="absolute inset-0 bg-espresso/40 mix-blend-multiply"></div>
          </div>
          <div className="relative z-10 text-center px-6 max-w-[800px] mx-auto text-on-primary">
            <h1 className="font-serif text-5xl lg:text-7xl mb-4">A Legacy in Every Drop</h1>
            <p className="font-serif text-2xl font-light opacity-90">
              Câu chuyện của TraPhe là câu chuyện về di sản cà phê Việt Nam.
            </p>
          </div>
        </section>

        {/* The Awakening */}
        <section className="py-20 px-6 max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 pr-0 md:pr-8">
              <h2 className="font-serif text-4xl lg:text-5xl text-roast">The Awakening</h2>
              <h3 className="font-serif text-2xl text-caramel">Cội Nguồn Cao Nguyên</h3>
              <div className="space-y-4 text-smoke text-base leading-relaxed">
                <p>
                  Hành trình của chúng tôi bắt đầu từ những đỉnh núi cao nguyên Việt Nam.
                  Ở đây, giữa vùng đất bazan màu mỡ và khí hậu ôn hòa,
                  cà phê không chỉ là cây trồng; nó là trái tim của sự sống.
                </p>
                <p>
                  Những người nông dân địa phương đã canh tác trên mảnh đất này qua nhiều thế hệ,
                  học cách lắng nghe ngôn ngữ tinh tế của các mùa. Tại TraPhe,
                  chúng tôi tôn vinh di sản này,
                  hợp tác trực tiếp với những nông dân nhỏ lẻ,
                  người hái từng trái cà phê bằng tay,
                  đảm bảo chỉ những hạt cà phê tốt nhất mới đến được với xưởng rang của chúng tôi.
                </p>
              </div>
            </div>
            <div className="relative h-[600px] rounded-t-[120px] rounded-b-xl overflow-hidden shadow-md shadow-espresso/10">
              <img
                alt="Coffee Cherries"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAap3-2YjnjvCNZdEC2Ijh9hATiZ5DtYJ6F8g39KhElQeolxHgn415d6rEfiOPCaTj9z_sBBsExnasZ2GP1ivehby8orAl-v1nzWjTIBZrHOZx7qzt0EDv1n2EebwXbMPpiIYq0UXEigoYapIYZyrZSstNI7cxmnRgOaVHf0M8Di1ivSrpJszigBYBXzUoW4Mb7Esd6zkmrD8FPE3CYay4y1MH5LypPZv-gmScq3GPNvUmA8AQWsv1DaTWH2cpNnyQVLg55t4-Kskg"
              />
            </div>
          </div>
        </section>

        {/* The Craft (Bento Grid) */}
        <section className="py-20 bg-foam px-6">
          <div className="max-w-[1280px] mx-auto">
            <div className="text-center mb-12 max-w-[600px] mx-auto">
              <h2 className="font-serif text-4xl lg:text-5xl text-roast mb-4">The Craft</h2>
              <p className="text-smoke text-base leading-relaxed">
                Chúng tôi tin rằng rang là một nghệ thuật, một sự cân bằng tinh tế giữa nhiệt, thời gian và trực giác
                khơi dậy linh hồn độc đáo của mỗi lá trà và mỗi hạt cà phê.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto md:h-[600px]">
              {/* Large Feature Card */}
              <div className="md:col-span-2 md:row-span-2 relative rounded-xl overflow-hidden group">
                <img
                  alt="Roasting Process"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZUtsrQnKU8nHKyX093fcp3G8PklyHGZryKdTJx0lanBhzg4W_a8rwIPRLhBBShzMSoOyAZOCkfTMXrwJdnEYmKVudEgwsFs2WsmbP4Pa9GgkupJttQTAy9lma0BAN1gIk_3A5-6SR60Rr4U8GAZB4VPfq1MLHdEOkp9dkbW0-voalBS_SLTcDlnKp6iOZes9OICYg58HFYux6eFpBkBM1W9BnWr5FJTrm1GJVTuG772XyaVUGjjnoMWtb9r7Cd2Tj1e5AQeOv8Zc"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 text-on-primary">
                  <h3 className="font-serif text-3xl mb-2">Traditional Fire Roasting</h3>
                  <p className="opacity-90 max-w-[400px]">
                    Những bậc thầy rang xây của chúng tôi dựa vào thị giác, thính giác và khứu giác,
                    tiếp nối các kỹ thuật được lưu truyền qua nhiều thập kỷ.
                  </p>
                </div>
              </div>

              {/* Small Top Card */}
              <div className="bg-parchment rounded-xl p-6 shadow-md shadow-espresso/5 flex flex-col justify-between">
                <Droplet className="text-caramel w-10 h-10 mb-4" />
                <div>
                  <h4 className="font-serif text-2xl text-roast mb-2">The Phin Filter</h4>
                  <p className="text-smoke text-sm">
                    Phương pháp pha chế chậm nhỏ giọt giúp chiết xuất hương vị sâu lắng, đậm đà, tôn vinh nét truyền thống Việt Nam.
                  </p>
                </div>
              </div>

              {/* Small Bottom Card */}
              <div className="bg-surface-container-high rounded-xl p-6 shadow-md shadow-espresso/5 flex flex-col justify-between">
                <Leaf className="text-caramel w-10 h-10 mb-4" />
                <div>
                  <h4 className="font-serif text-2xl text-roast mb-2">Curing Process</h4>
                  <p className="text-smoke text-sm">
                    Thời gian ủ nghỉ thong thả giúp các hương vị dậy mùi và ổn định trước khi pha chế.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
