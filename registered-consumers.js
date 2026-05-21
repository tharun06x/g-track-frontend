document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('consumersTableBody');
  const searchInput = document.getElementById('consumerSearch');

  if (!tbody) {
    return;
  }

  const auth = window.GTrackApi ? window.GTrackApi.readAuth() : null;
  if (!auth || auth.role !== 'distributor' || !auth.distributor_id || !auth.token) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="padding: 20px; text-align: center; color: var(--text-secondary);">
          Distributor access required to view consumers.
        </td>
      </tr>
    `;
    return;
  }

  let consumers = [];

  const renderRows = (rows) => {
    if (!rows.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="padding: 20px; text-align: center; color: var(--text-secondary);">
            No registered consumers found.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = rows
      .map((consumer) => {
        const statusPill = '<span class="pill bg-lime text-black" style="padding: 4px 12px; border-radius: 100px; font-weight: 600;">Active</span>';
        return `
          <tr style="border-bottom: 1px solid rgba(0,0,0,0.06);">
            <td style="padding: 14px 8px; font-weight: 600;">${consumer.consumer_no || '-'}</td>
            <td style="padding: 14px 8px;">${consumer.name || '-'}</td>
            <td style="padding: 14px 8px;">${consumer.phone_no || '-'}</td>
            <td style="padding: 14px 8px;">${consumer.district || '-'}</td>
            <td style="padding: 14px 8px;">${statusPill}</td>
          </tr>
        `;
      })
      .join('');
  };

  const applyFilter = () => {
    const term = (searchInput ? searchInput.value : '').trim().toLowerCase();
    if (!term) {
      renderRows(consumers);
      return;
    }
    const filtered = consumers.filter((consumer) => {
      return [consumer.name, consumer.consumer_no, consumer.phone_no, consumer.district]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
    renderRows(filtered);
  };

  window.GTrackApi.request(`/api/v1/distributors/${encodeURIComponent(auth.distributor_id)}/consumers`, {
    method: 'GET',
    token: auth.token,
  })
    .then((data) => {
      consumers = Array.isArray(data) ? data : [];
      renderRows(consumers);
    })
    .catch((error) => {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="padding: 20px; text-align: center; color: #ff7f7f;">
            ${error.message}
          </td>
        </tr>
      `;
    });

  if (searchInput) {
    searchInput.addEventListener('input', applyFilter);
  }
});
