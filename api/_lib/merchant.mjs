export const CANONICAL_MERCHANT = Object.freeze({
  legalName: 'POGON MOBILITY DOO',
  pib: '115472260',
  address: 'Temišvarska 25B, Beograd',
  email: 'pogonmobility@gmail.com',
  phone: '+381 63 15 05 003',
});

export function publicMerchantData(env = process.env) {
  return {
    legalName: env.MERCHANT_LEGAL_NAME || CANONICAL_MERCHANT.legalName,
    pib: env.MERCHANT_PIB || CANONICAL_MERCHANT.pib,
    address: env.MERCHANT_ADDRESS || CANONICAL_MERCHANT.address,
    email: CANONICAL_MERCHANT.email,
    phone: CANONICAL_MERCHANT.phone,
  };
}
