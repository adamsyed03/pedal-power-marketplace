
  # Redesign ebike website

  This is a code bundle for Redesign ebike website. The original project is available at https://www.figma.com/design/KmHwAAYcEZ011ZSWDuTRlv/Redesign-ebike-website.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Payments

  The TEST harness uses Banca Intesa's merchant-specific hosted-payment contract: `storetype=3d_pay_hosting`, with neither `instalment` nor `CallbackURL`. Pogon posts only server-prepared non-card transaction fields; customers enter card details exclusively on the Banca Intesa / NestPay page. The signed hosted callback contains the final payment result, so Pogon does not send a second API Auth. Production is hard-disabled; see [the payment architecture notes](docs/payments/chip-card-architecture.md).
