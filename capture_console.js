const axios = require('axios');
const fs = require('fs');

async function testAPI() {
  const BASE_URL = 'http://127.0.0.1:5004';
  try {
    console.log('1. Attempting login as Super Admin...');
    const loginRes = await axios.post(`${BASE_URL}/api/auth/super-admin/login`, {
      email: 'admin@hr.com',
      password: '123456',
    });

    if (!loginRes.data.success || !loginRes.data.token) {
      console.error('Login failed:', loginRes.data);
      return;
    }

    const token = loginRes.data.token;
    console.log('Login successful! Token acquired.');

    const headers = { Authorization: `Bearer ${token}` };

    console.log('\n2. Fetching /api/admin/leaves...');
    try {
      const leavesRes = await axios.get(`${BASE_URL}/api/admin/leaves`, { headers });
      console.log('Leaves API Status:', leavesRes.status);
      console.log('Leaves API Response Success:', leavesRes.data.success);
      console.log('Total leaves returned:', leavesRes.data.leaves?.length);
      if (leavesRes.data.leaves && leavesRes.data.leaves.length > 0) {
        console.log('Sample leave request:', JSON.stringify(leavesRes.data.leaves[0], null, 2));
      }
    } catch (err) {
      console.error('Failed to fetch leaves:', err.response?.status, err.response?.data || err.message);
    }

    console.log('\n3. Fetching /api/admin/leaves/balances...');
    try {
      const balancesRes = await axios.get(`${BASE_URL}/api/admin/leaves/balances`, { headers });
      console.log('Balances API Status:', balancesRes.status);
      console.log('Balances API Response Success:', balancesRes.data.success);
      console.log('Total balances returned:', balancesRes.data.balances?.length);
      if (balancesRes.data.balances && balancesRes.data.balances.length > 0) {
        console.log('Sample balance:', JSON.stringify(balancesRes.data.balances[0], null, 2));
      }
    } catch (err) {
      console.error('Failed to fetch balances:', err.response?.status, err.response?.data || err.message);
    }

    console.log('\n4. Fetching /api/admin/holidays...');
    try {
      const holidaysRes = await axios.get(`${BASE_URL}/api/admin/holidays`, { headers });
      console.log('Holidays API Status:', holidaysRes.status);
      console.log('Holidays API Response Success:', holidaysRes.data.success);
      console.log('Total holidays returned:', holidaysRes.data.holidays?.length);
      if (holidaysRes.data.holidays && holidaysRes.data.holidays.length > 0) {
        console.log('Sample holiday:', JSON.stringify(holidaysRes.data.holidays[0], null, 2));
      }
    } catch (err) {
      console.error('Failed to fetch holidays:', err.response?.status, err.response?.data || err.message);
    }

  } catch (error) {
    console.error('General error during test:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
  }
}

testAPI();
