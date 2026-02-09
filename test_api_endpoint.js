import api from './src/services/api.js';

async function testAPI() {
  try {
    console.log('Testing API endpoint...\n');
    
    const userId = 66;
    const assessmentType = 'CORE';
    
    console.log(`📡 GET /api/assessment/current/${userId}/${assessmentType}\n`);
    
    const response = await api.get(`/api/assessment/current/${userId}/${assessmentType}`);
    
    console.log('✅ Response received:');
    console.log('   Success:', response.data.success);
    
    if (response.data.data) {
      console.log('   Assessment ID:', response.data.data.assessment_id);
      console.log('   Overall Score:', response.data.data.overall_score + '%');
      console.log('   Dimension Scores:', response.data.data.dimension_scores.length, 'pillars\n');
      
      console.log('📊 Pillar Scores:');
      response.data.data.dimension_scores.forEach(pillar => {
        console.log(`   ${pillar.pillar_name}: ${pillar.score}%`);
      });
    } else {
      console.log('   ⚠️ No data in response');
      console.log('   Response:', JSON.stringify(response.data, null, 2));
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    process.exit(1);
  }
}

testAPI();
