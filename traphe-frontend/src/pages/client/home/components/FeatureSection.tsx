import { features } from "@/data/mockData";

const FeatureCard = ({ feature }: { feature: (typeof features)[0] }) => {
  const Icon = feature.icon;
  return (
    <div className="bg-gray-100 py-8 px-6 flex flex-col items-start gap-4 rounded-sm">
      <Icon className="w-8 h-8 text-black stroke-1" />
      <div>
        <h4 className="font-medium text-base mb-1">{feature.title}</h4>
        <p className="text-sm text-gray-500">{feature.description}</p>
      </div>
    </div>
  );
};

export default function FeatureSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, idx) => (
          <FeatureCard key={idx} feature={feature} />
        ))}
      </div>
    </section>
  );
}
