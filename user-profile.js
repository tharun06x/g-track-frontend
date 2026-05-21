// user-profile.js - Profile API Integration
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const auth = window.GTrackApi.readAuth();
    if (!auth || !auth.token) {
      window.location.href = 'index.html';
      return;
    }

    const me = await window.GTrackApi.request('/api/v1/distributors/me', {
      method: 'GET',
      token: auth.token
    });

    document.getElementById('profile-welcome').textContent = `Welcome ${me.company_name || me.name}`;
    document.getElementById('profile-id').textContent = me.distributor_id || me.id || '--';
    document.getElementById('profile-email').textContent = me.email || '--';
    document.getElementById('profile-phone').textContent = me.phone_no || '--';
    document.getElementById('profile-address').textContent = me.address || '--';
    document.getElementById('profile-state').textContent = me.state || '--';
    document.getElementById('profile-district').textContent = me.district || '--';

  } catch (err) {
    console.error('Failed to load user profile data', err);
    document.getElementById('profile-welcome').textContent = `Welcome`;
  }
});
