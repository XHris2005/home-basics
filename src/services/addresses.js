import { supabase } from './supabase';

export async function getUserAddresses() {
  const { data, error } = await supabase
    .from('user_addresses')
    .select('*')
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function addAddress(addressData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  if (addressData.is_default) {
    await supabase
      .from('user_addresses')
      .update({ is_default: false })
      .eq('user_id', user.id);
  }

  const { data, error } = await supabase
    .from('user_addresses')
    .insert([{ ...addressData, user_id: user.id }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAddress(id, addressData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  if (addressData.is_default) {
    await supabase
      .from('user_addresses')
      .update({ is_default: false })
      .eq('user_id', user.id);
  }

  const { data, error } = await supabase
    .from('user_addresses')
    .update(addressData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function setDefaultAddress(id) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  await supabase
    .from('user_addresses')
    .update({ is_default: false })
    .eq('user_id', user.id);

  const { data, error } = await supabase
    .from('user_addresses')
    .update({ is_default: true })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAddress(id) {
  const { error } = await supabase
    .from('user_addresses')
    .delete()
    .eq('id', id);
  if (error) throw error;
}