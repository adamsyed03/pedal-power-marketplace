
  # Redesign ebike website

  This is a code bundle for Redesign ebike website. The original project is available at https://www.figma.com/design/KmHwAAYcEZ011ZSWDuTRlv/Redesign-ebike-website.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Payments

  The TEST harness implements the documented NestPay 3D+API sequence using `storetype=3d_pay`: the merchant-hosted card page posts to the NestPay TEST 3D gateway and the backend completes the payment with a CC5 API Auth using the returned `md`/`eci`/`xid`/`cavv`. Production is hard-disabled. A conflicting merchant-support instruction about Chip Card remains a live-execution gate; see [the payment architecture notes](docs/payments/chip-card-architecture.md).
