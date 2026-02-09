import database from './server/config/database.js';

async function checkScoreSources() {
  try {
    console.log('Checking score sources for latest assessment...\n');
    
    // Get the latest assessment
    const sql = `
      SELECT TOP 1 
        a.id,
        a.lead_id,
        a.assessment_type,
        a.overall_score,
        a.dimension_scores,
        a.responses,
        a.insights
      FROM assessments a
      ORDER BY a.id DESC
    `;
    
    const assessments = await database.query(sql);
    const assessment = assessments[0];
    
    console.log('📊 Assessment ID:', assessment.id);
    console.log('Type:', assessment.assessment_type);
    console.log('Overall Score:', assessment.overall_score + '%\n');
    
    // Parse dimension_scores from database
    console.log('1️⃣ DIMENSION_SCORES (saved in database):');
    let dbScores = [];
    try {
      dbScores = JSON.parse(assessment.dimension_scores);
      if (dbScores.length > 0) {
        dbScores.forEach(s => {
          console.log(`   ${s.pillar || s.dimension || s.pillar_name}: ${s.score}%`);
        });
      } else {
        console.log('   ⚠️ EMPTY ARRAY');
      }
    } catch (e) {
      console.log('   ❌ Parse error:', e.message);
    }
    
    // Parse insights
    console.log('\n2️⃣ INSIGHTS (gap analysis source):');
    try {
      const insights = JSON.parse(assessment.insights);
      if (insights.improvement_areas) {
        console.log('   Improvement Areas:');
        insights.improvement_areas.forEach(area => {
          console.log(`   - ${area.area}: ${area.score}%`);
        });
      }
      if (insights.weighted_priorities) {
        console.log('   Weighted Priorities:');
        insights.weighted_priorities.forEach(p => {
          console.log(`   - ${p.area}: ${p.score}% (weight: ${p.weight}%)`);
        });
      }
    } catch (e) {
      console.log('   ❌ Parse error:', e.message);
    }
    
    // Check assessment_responses table
    console.log('\n3️⃣ ASSESSMENT_RESPONSES (raw question answers):');
    const responsesSql = `
      SELECT 
        aq.pillar_name,
        COUNT(*) as question_count,
        AVG(CAST(ar.response_value AS FLOAT)) as avg_response,
        MIN(ar.response_value) as min_val,
        MAX(ar.response_value) as max_val
      FROM assessment_responses ar
      JOIN assessment_questions aq ON ar.question_id = aq.id
      WHERE ar.lead_user_id = ? AND aq.assessment_type = ?
      GROUP BY aq.pillar_name
      ORDER BY aq.pillar_name
    `;
    
    const responses = await database.query(responsesSql, [assessment.lead_id, assessment.assessment_type]);
    const responsesData = responses.recordset || responses;
    
    if (responsesData && responsesData.length > 0) {
      responsesData.forEach(r => {
        const score = Math.round((r.avg_response / 5) * 100);
        console.log(`   ${r.pillar_name}: ${score}% (avg: ${r.avg_response.toFixed(2)}/5, questions: ${r.question_count})`);
      });
    } else {
      console.log('   ⚠️ No responses found');
    }
    
    // Parse responses JSON field
    console.log('\n4️⃣ RESPONSES JSON (stored with assessment):');
    try {
      const responsesObj = JSON.parse(assessment.responses);
      console.log('   Total questions answered:', Object.keys(responsesObj).length);
    } catch (e) {
      console.log('   ❌ Parse error:', e.message);
    }
    
    console.log('\n📌 RECOMMENDATION:');
    console.log('The assessment_responses table is the source of truth.');
    console.log('All displays (website, PDF, email) should calculate from this table.');
    
    process.exit(0);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

checkScoreSources();
