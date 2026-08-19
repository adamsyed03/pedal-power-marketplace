
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { Checkout } from "./app/components/Checkout.tsx";
  import { PaymentResult } from "./app/components/PaymentResult.tsx";
  import { CardPayment } from "./app/components/CardPayment.tsx";
  import { PurchaseTerms } from "./app/components/PurchaseTerms.tsx";
  import { BusinessInfo } from "./app/components/BusinessInfo.tsx";
  import "./styles/index.css";
  import { initAnalytics } from "./lib/analytics.ts";

  initAnalytics();
  const route = window.location.pathname.replace(/\/+$/, "");
  const page = route === "/checkout"
    ? <Checkout />
    : route === "/uslovi-kupovine"
    ? <PurchaseTerms />
    : route === "/informacije-o-trgovcu"
    ? <BusinessInfo />
    : route === "/payment/card"
    ? <CardPayment />
    : route === "/payment/success" || route === "/payment/failed"
    ? <PaymentResult />
    : <App />;
  createRoot(document.getElementById("root")!).render(page);
  
