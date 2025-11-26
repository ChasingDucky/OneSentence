/**
 * 测试数据种子脚本
 * 用于快速创建测试用户和消息
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

const testUsers = [
  {
    email: 'alice@test.com',
    password: 'password123',
    messages: [
      '今天天气真好，心情也很不错！',
      '希望明天会更好',
      '生活不易，且行且珍惜'
    ]
  },
  {
    email: 'bob@test.com',
    password: 'password123',
    messages: [
      '刚看完一部很棒的电影',
      '今天学会了一个新技能',
      '感恩身边的每一个人'
    ]
  },
  {
    email: 'charlie@test.com',
    password: 'password123',
    messages: [
      '深夜的城市格外安静',
      '做自己喜欢的事真好',
      '愿所有的美好如期而至'
    ]
  },
];

async function createUser(userData) {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email: userData.email,
      password: userData.password,
    });

    console.log(`✅ Created user: ${userData.email}`);
    return response.data.token;
  } catch (error) {
    if (error.response?.data?.error === 'User already exists') {
      // 用户已存在，尝试登录
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: userData.email,
        password: userData.password,
      });
      console.log(`ℹ️  User exists, logged in: ${userData.email}`);
      return loginResponse.data.token;
    }
    throw error;
  }
}

async function createMessage(token, text) {
  try {
    await axios.post(
      `${API_URL}/messages`,
      { text, language: 'zh' },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(`  📝 Posted message: "${text.substring(0, 30)}..."`);
  } catch (error) {
    if (error.response?.data?.error === 'You have already posted today') {
      console.log(`  ⏭️  Already posted today, skipping`);
    } else {
      throw error;
    }
  }
}

async function triggerPairing(token) {
  try {
    const response = await axios.post(
      `${API_URL}/admin/pairing/run`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(`\n🔄 Pairing completed:`, response.data.result);
  } catch (error) {
    console.error('❌ Failed to trigger pairing:', error.message);
  }
}

async function main() {
  console.log('🌱 Seeding test data...\n');

  try {
    let firstToken = null;

    // 创建用户并发布消息
    for (const user of testUsers) {
      const token = await createUser(user);
      if (!firstToken) firstToken = token;

      // 随机选择一条消息发布
      const randomMessage = user.messages[Math.floor(Math.random() * user.messages.length)];
      await createMessage(token, randomMessage);
      console.log('');
    }

    // 触发配对
    console.log('Triggering pairing...');
    await triggerPairing(firstToken);

    console.log('\n✅ Test data seeded successfully!');
    console.log('\nYou can now login with:');
    testUsers.forEach(user => {
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}\n`);
    });

  } catch (error) {
    console.error('\n❌ Error seeding data:', error.response?.data || error.message);
    process.exit(1);
  }
}

main();
