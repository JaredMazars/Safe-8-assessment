import database from './server/config/database.js';

async function checkLatestAssessment() {
  try {
    const sql = `
      SELECT TOP 1 
        id, lead_id, assessment_type, overall_score, 
        dimension_scores, insights
      FROM assessments 
      WHERE lead_id = 66
      ORDER BY id DESC
    `;
    
    const result = await database.query(sql);
    
    console.log('Query result:', result.recordset ? result.recordset.length : 0, 'rows\n');
    
    if (!result.recordset || result.recordset.length === 0) {
      console.log('❌ No assessments found for user 66');
      
      // Check what users have assessments
      const userSql = 'SELECT DISTINCT lead_id, COUNT(*) as count FROM assessments GROUP BY lead_id ORDER BY lead_id';
      const userResult = await database.query(userSql);
      console.log('\nUsers with assessments:');
      userResult.recordset.forEach(u => {
        console.log(`  User ${u.lead_id}: ${u.count} assessments`);
      });
      
      process.exit(0);
    }
    
    const assessment = result.recordset[0];
    
    console.log('📊 Latest Assessment for User 66:\n');
    console.log('ID:', assessment.id);
    console.log('Type:', assessment.assessment_type);
    console.log('Overall Score:', assessment.overall_score, '%\n');
    
    console.log('Dimension Scores (raw):');
    console.log('  Type:', typeof assessment.dimension_scores);
    console.log('  Length:', assessment.dimension_scores?.length || 0, 'characters\n');
    
    if (assessment.dimension_scores) {
      const parsed = JSON.parse(assessment.dimension_scores);
      console.log('✅ Parsed Dimension Scores:');
      console.log('  Count:', parsed.length, 'pillars\n');
      
      if (parsed.length > 0) {
        console.log('Pillar Details:');
        parsed.forEach((p, i) => {
          console.log(`  ${i + 1}. ${p.pillar_name} (${p.pillar_short_name}): ${p.score}%`);
        });
      } else {
        console.log('  ⚠️ EMPTY ARRAY - No pillar scores saved!');
      }
    } else {
      console.log('  ❌ NULL - No dimension_scores in database');
    }
    
    console.log('\nInsights:');
    if (assessment.insights) {
      const insights = JSON.parse(assessment.insights);
      console.log('  Keys:', Object.keys(insights).join(', '));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

checkLatestAssessment();
