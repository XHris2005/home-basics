export async function createOrder(orderData) {
  const { data, error } = await supabase
    .from('orders')
    .insert([{
      user_id:          orderData.user_id,
      items:            orderData.items,
      subtotal:         orderData.subtotal,
      shipping_fee:     orderData.shipping_fee,
      total_amount:     orderData.total_amount,
      payment_ref:      orderData.payment_ref,
      payment_status:   orderData.payment_status,
      delivery_method:  orderData.delivery_method,
      delivery_address: orderData.delivery_address,
      status:           orderData.status || 'pending',
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}
export async function getUserOrders(userId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}