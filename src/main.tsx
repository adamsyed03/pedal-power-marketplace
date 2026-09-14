
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { Checkout } from "./app/components/Checkout.tsx";
  import { PaymentResult } from "./app/components/PaymentResult.tsx";
  import { CardPayment } from "./app/components/CardPayment.tsx";
  import { PurchaseTerms } from "./app/components/PurchaseTerms.tsx";
  import { BusinessInfo } from "./app/components/BusinessInfo.tsx";
  import { CustomerPolicy } from "./app/components/CustomerPolicy.tsx";
  import "./styles/index.css";
  import { initAnalytics } from "./lib/analytics.ts";
  import { breadcrumbStructuredData, setPageMetadata } from "./lib/seo.ts";

  const route = window.location.pathname.replace(/\/+$/, "");
  const routeMetadata: Record<string, { title: string; description: string }> = {
    "/uslovi-kupovine": {
      title: "Uslovi kupovine i dostave | Pogon",
      description: "Uslovi kupovine Pogon električnih bicikala: cene, plaćanje, dostava, reklamacije, odustanak i povraćaj sredstava.",
    },
    "/informacije-o-trgovcu": {
      title: "Podaci o trgovcu | Pogon Mobility",
      description: "Zvanični podaci o trgovcu Pogon Mobility d.o.o, kontakt, sedište i informacije za kupce.",
    },
    "/kontakt": {
      title: "Kontakt i korisnička podrška | Pogon",
      description: "Kontaktirajte Pogon za pitanja o električnim biciklima, kupovini, test vožnji, porudžbini ili servisu.",
    },
    "/dostava": {
      title: "Dostava i preuzimanje | Pogon",
      description: "Informacije o kurirskoj dostavi Pogon električnih bicikala širom Srbije i ličnom preuzimanju iz skladišta u Beogradu uz potvrđen termin.",
    },
    "/reklamacije": {
      title: "Reklamacije | Pogon",
      description: "Kako da podnesete reklamaciju za Pogon proizvod, koje podatke da pošaljete i kako izgleda postupak rešavanja.",
    },
    "/povracaj-sredstava": {
      title: "Povraćaj sredstava | Pogon",
      description: "Informacije o odustanku od kupovine i povraćaju sredstava za Pogon porudžbine i kartična plaćanja.",
    },
    "/privatnost": {
      title: "Zaštita privatnosti | Pogon",
      description: "Saznajte koje podatke Pogon obrađuje, u koje svrhe, koliko ih čuva i kako možete ostvariti svoja prava.",
    },
    "/bezbednost-placanja": {
      title: "Bezbednost kartičnog plaćanja | Pogon",
      description: "Informacije o zaštiti podataka, valuti, konverziji i 3D Secure zaštiti pri kartičnom plaćanju na Pogon sajtu.",
    },
  };

  const privateRoute = route === "/checkout" || route.startsWith("/payment/") || new URLSearchParams(window.location.search).get("admin") === "1";

  if (privateRoute) {
    setPageMetadata({
      title: "Sigurna kupovina | Pogon",
      description: "Privatna stranica za obradu Pogon porudžbine.",
      path: route || "/",
      robots: "noindex, nofollow, noarchive",
      structuredData: null,
    });
  } else if (routeMetadata[route]) {
    const metadata = routeMetadata[route];
    setPageMetadata({
      ...metadata,
      path: route,
      structuredData: breadcrumbStructuredData(metadata.title, route),
    });
  } else if (route !== "" && route !== "/kviz") {
    setPageMetadata({
      title: "Stranica nije pronađena | Pogon",
      description: "Tražena stranica nije pronađena.",
      path: route,
      robots: "noindex, nofollow",
      structuredData: null,
    });
  }

  initAnalytics();
  const page = route === "/checkout"
    ? <Checkout />
    : route === "/uslovi-kupovine"
    ? <PurchaseTerms />
    : route === "/informacije-o-trgovcu"
    ? <BusinessInfo />
    : route === "/kontakt"
    ? <CustomerPolicy page="contact" />
    : route === "/dostava"
    ? <CustomerPolicy page="delivery" />
    : route === "/reklamacije"
    ? <CustomerPolicy page="complaints" />
    : route === "/povracaj-sredstava"
    ? <CustomerPolicy page="refunds" />
    : route === "/privatnost"
    ? <CustomerPolicy page="privacy" />
    : route === "/bezbednost-placanja"
    ? <CustomerPolicy page="security" />
    : route === "/payment/card"
    ? <CardPayment />
    : route === "/payment/success" || route === "/payment/failed"
    ? <PaymentResult />
    : <App />;
  createRoot(document.getElementById("root")!).render(page);
  
