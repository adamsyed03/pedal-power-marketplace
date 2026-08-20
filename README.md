
  # Redesign ebike website

  This is a code bundle for Redesign ebike website. The original project is available at https://www.figma.com/design/KmHwAAYcEZ011ZSWDuTRlv/Redesign-ebike-website.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Payments

  The TEST harness uses Banca Intesa's merchant-specific 3D POST contract: `storetype=3d_pay_hosting`, with neither `instalment` nor `CallbackURL`. The browser adds the card fields and posts directly to NestPay; Pogon servers never receive them. The backend retains the documented CC5 API Auth handling for returned 3D values. Production is hard-disabled; see [the payment architecture notes](docs/payments/chip-card-architecture.md).
