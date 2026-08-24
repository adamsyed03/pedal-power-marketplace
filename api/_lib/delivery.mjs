export function resolveDeliveryFee(method, env = process.env) {
  if (method === 'pickup') return { exact: true, feeRsd: 0, source: 'pickup' };
  if (method !== 'courier') throw new Error('INVALID_DELIVERY_METHOD');
  const configured = env.COURIER_FIXED_FEE_RSD ?? '3900';
  const fee = Number(configured);
  if (!Number.isSafeInteger(fee) || fee < 0) throw new Error('INVALID_COURIER_FIXED_FEE');
  return { exact: true, feeRsd: fee, source: 'fixed_server_config' };
}

export function offeredInstallments() {
  // The merchant-specific hosted 3D request must omit instalment. Until the
  // bank documents how hosted instalments are selected and bound to the API
  // authorization, accept only ordinary one-payment orders.
  return [1];
}
