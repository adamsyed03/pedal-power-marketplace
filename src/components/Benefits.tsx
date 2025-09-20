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
        <section className="py-12 sm:py-16">
          {/* Main Title */}
          <div className="container mx-auto px-6 sm:px-4 mb-8 sm:mb-16 text-center">
            <h2 className="text-2xl sm:text-4xl font-bold mb-4 leading-tight">{t('benefits.title')}</h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('benefits.subtitle')}
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 gap-8 sm:gap-16">
            {benefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className={`flex flex-col lg:flex-row items-stretch ${
                  index % 2 === 0 ? "" : "lg:flex-row-reverse"
                }`}
              >
                {/* Image Section */}
                <div className="w-full lg:w-1/2 h-[250px] sm:h-[400px] lg:h-[500px] relative bg-gray-100 overflow-hidden">
                  <img
                    src={benefit.image}
                    alt={benefit.title}
                    className="w-full h-full object-contain scale-90"
                  />
                </div>

                {/* Content Section */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 sm:p-8 lg:p-16 bg-white">
                  <h3 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6 leading-tight">{t(`benefits.${benefit.title.toLowerCase().replace(/\s+/g, '')}.title`)}</h3>
                  <p className="text-sm sm:text-lg text-gray-600 mb-4 sm:mb-4 leading-relaxed">
                    {t(`benefits.${benefit.title.toLowerCase().replace(/\s+/g, '')}.description`)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 italic">
                    {t('benefits.source')} {benefit.source}
                  </p>
                </div>
              </div>
            ))}
          </div>
    </section>
  );
};