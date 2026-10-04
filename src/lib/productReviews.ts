import type { BikeKey, Localized } from './productDetails';

export type ProductReview = {
  name: string;
  city: string;
  rating: number;
  model?: BikeKey;
  text: Localized<string>;
  image?: { src: string; alt: Localized<string>; width: number; height: number };
};

export const productReviews: ProductReview[] = [
  {
    name: 'Vuk Rankovic', city: 'Beograd', rating: 5, model: 'glide',
    text: { sr: 'Ovaj Pogon model je totalno promenio moje gradske vožnje: tiho, snažno i pouzdano.', en: 'This Pogon model totally changed my city rides: quiet, powerful and reliable.', ru: 'Эта модель Pogon полностью изменила мои поездки по городу: тихая, мощная и надёжная.' },
    image: { src: '/vukglidereview.jpg', alt: { sr: 'Pogon Glide korisnika Vuka pored jezera u Beogradu', en: "Vuk's Pogon Glide by a lake in Belgrade", ru: 'Pogon Glide Вука у озера в Белграде' }, width: 1600, height: 901 },
  },
  { name: 'Andreas Spanoudis', city: 'Beograd', rating: 5, text: { sr: 'Brza dostava, sjajan osećaj na putu i odlična podrška. Preporučujem svima.', en: 'Fast delivery, great ride feel and excellent support. I recommend it to everyone.', ru: 'Быстрая доставка, отличные ощущения на дороге и прекрасная поддержка. Рекомендую всем.' } },
  { name: 'Ana Sunjka', city: 'Novi Sad', rating: 5, text: { sr: 'Savršeno uklopljen u gradski ritam, dobro drži put i baterija traje dugo.', en: 'Perfectly matched to the city rhythm, handles well and the battery lasts long.', ru: 'Идеально подходит для городского ритма, хорошо держит дорогу, а батареи хватает надолго.' } },
  { name: 'Aleksa Djuraskovic', city: 'Niš', rating: 5, text: { sr: 'Mekano ubrzanje, stabilnost i lep dizajn. Najbolja kupovina ove godine.', en: 'Smooth acceleration, stability and great design. Best purchase this year.', ru: 'Плавный разгон, устойчивость и красивый дизайн. Лучшая покупка этого года.' } },
  { name: 'Matija Ilic', city: 'Novi Sad', rating: 5, text: { sr: 'Vožnja je sada zabavna, bez gužvi i bez stresa. Pogon je odličan izbor.', en: 'Riding is fun now, without traffic lines or stress. Pogon is an excellent choice.', ru: 'Теперь поездки стали приятными: без пробок и стресса. Pogon — отличный выбор.' } },
  { name: 'Marko Jovanovic', city: 'Beograd', rating: 5, text: { sr: 'Odličan odnos cene i kvaliteta. Svaki dan sa osmehom idem na posao.', en: 'Great value for money. Now I go to work with a smile every day.', ru: 'Отличное соотношение цены и качества. Каждый день еду на работу с улыбкой.' } },
  { name: 'Matija Jovovic', city: 'Niš', rating: 4, text: { sr: 'Vozilo je veoma stabilno, samo bih voleo da ima još jedan mod vožnje.', en: 'The bike is very stable; I just wish it had one more riding mode.', ru: 'Велосипед очень устойчивый, хотелось бы только ещё один режим езды.' } },
  { name: 'Marija Antic', city: 'Novi Sad', rating: 4, text: { sr: 'Bicikl je odličan, samo je malo teži pri nošenju uz stepenice.', en: 'The bike is excellent, just a bit heavy when carrying it up stairs.', ru: 'Велосипед отличный, просто немного тяжеловат для переноски по лестнице.' } },
  { name: 'Elena Nikolaou', city: 'Beograd', rating: 4, text: { sr: 'Dizajn je fenomenalan, a komponente solidne. Jedino je sedište moglo biti mekše.', en: 'The design is phenomenal and the components are solid. Only the seat could be softer.', ru: 'Дизайн прекрасный, компоненты хорошие. Только сиденье могло бы быть мягче.' } },
  { name: 'Luka Maric', city: 'Zemun', rating: 4, text: { sr: 'Lagan za upravljanje i brz. Malo je težak za nošenje stepenicama.', en: 'Easy to handle and quick. A bit heavy to carry up stairs.', ru: 'Легко управляется и быстро едет. Немного тяжеловат для переноски по лестнице.' } },
];

export const productReviewAverage = productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length;

export const productRatings: Record<BikeKey, number> = {
  cargo: 4.8,
  core: 5,
  glide: 4.9,
};

export const formatProductRating = (rating: number) => Number.isInteger(rating) ? rating.toFixed(0) : rating.toFixed(1);
