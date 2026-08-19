export function resolveDeliveryFee(method, env = process.env) {
  if (method === 'pickup') return { exact: true, feeRsd: 0, source: 'pickup' };
  if (method !== 'courier') throw new Error('INVALID_DELIVERY_METHOD');
  const configured = env.COURIER_FIXED_FEE_RSD ?? '3500';
  const fee = Number(configured);
  if (!Number.isSafeInteger(fee) || fee < 0) throw new Error('INVALID_COURIER_FIXED_FEE');
  return { exact: true, feeRsd: fee, source: 'fixed_server_config' };
}

export function offeredInstallments(env = process.env) {
  const values = String(env.NESTPAY_INSTALLMENTS || '1,3,6,9,12').split(',').map(Number);
  const clean = [...new Set(values.filter((value) => Number.isSafeInteger(value) && value >= 1 && value <= 12))];
  if (!clean.includes(1)) clean.unshift(1);
  return clean;
}
