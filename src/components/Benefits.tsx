import { Button } from "@/components/ui/button";
import { useLanguage } from '../context/LanguageContext';

const benefits = [
  {
    title: "Health",
    description: "Imagine breathing air every day that seriously compromises your health — because that's already happening. Belgrade is among the most polluted capitals in Europe, with an average annual PM2.5 particle concentration of 23.3 µg/m³. These particles penetrate deep into the lungs and increase the risk of asthma, heart disease, and even premature death. Pogon offers a solution: a quiet, electric bike that doesn't pollute and helps us together clean the air we breathe.",
    source: "IQAir, 2023",
    image: "/health.jpg.png"
  },
  {
    title: "Time",
    description: "In Belgrade, we spend nearly 40 minutes in transport every day — often in chaos, nervousness, and traffic jams. That's more than 10 days a year lost in traffic. Instead of standing in queues, you could move easily, quickly, and directly through the city with the help of Pogon — an e-bike that takes you stress-free, whenever and wherever you want.",
    source: "Numbeo, 2023",
    image: "/time.jpg.jpg"
  },
  {
    title: "Economic Benefits",
    description: "From bread to fuel — everything is getting more expensive. Inflation in Serbia reached double-digit values in 2023, with prices of basic products and services jumping up to 20% in some sectors. Transport costs are becoming an increasingly larger part of the household budget. Pogon is the answer to daily wallet pressure: buy once, and ride without fuel, registration, service, or parking.",
    source: "Serbian Statistical Office, 2023",
    image: "/economy.jpg.png"
  }
];

export const Benefits = () => {
  const { t } = useLanguage();
  
  return (
    <section className="py-8 sm:py-16">
      {/* Main Title */}
      <div className="container mx-auto px-4 mb-8 sm:mb-16 text-center">
        <h2 className="text-[18px] sm:text-4xl font-bold mb-4">{t('benefits.title')}</h2>
        <p className="text-[14px] sm:text-xl text-gray-600 max-w-3xl mx-auto">
          {t('benefits.subtitle')}
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 gap-8 sm:gap-16">
        {benefits.map((benefit, index) => (
          <div
            key={benefit.title}
            className={`flex flex-col md:flex-row items-stretch ${
              index % 2 === 0 ? "" : "md:flex-row-reverse"
            }`}
          >
            {/* Image Section */}
            <div className="w-full md:w-1/2 h-[300px] sm:h-[500px] relative bg-gray-100 overflow-hidden">
              <img
                src={benefit.image}
                alt={benefit.title}
                className="w-full h-full object-contain scale-90"
              />
            </div>

            {/* Content Section */}
            <div className="w-full md:w-1/2 flex flex-col justify-center p-4 sm:p-8 md:p-16 bg-white">
              <h3 className="text-[16px] sm:text-3xl font-bold mb-3 sm:mb-6">{t(`benefits.${benefit.title.toLowerCase().replace(/\s+/g, '')}.title`)}</h3>
              <p className="text-[12px] sm:text-lg text-gray-600 mb-2 sm:mb-4">
                {t(`benefits.${benefit.title.toLowerCase().replace(/\s+/g, '')}.description`)}
              </p>
              <p className="text-[10px] sm:text-sm text-gray-500 italic">
                {t('benefits.source')} {benefit.source}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};