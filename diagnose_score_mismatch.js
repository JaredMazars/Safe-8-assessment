import database from './server/config/database.js';

async function checkLatestAssessmentData() {
  try {
    console.log('Checking latest assessment data sources...\n');
    
    // Get the absolute latest assessment
    const sql = `
      SELECT TOP 1 
        a.id,
        a.lead_id,
        a.assessment_type,
        a.overall_score,
        a.dimension_scores,
        a.completed_at
      FROM assessments a
      ORDER BY a.id DESC
    `;
    
    const assessments = await database.query(sql);
    const assessment = assessments[0];
    
    console.log('📊 Latest Assessment:');
    console.log(`   ID: ${assessment.id}`);
    console.log(`   User ID: ${assessment.lead_id}`);
    console.log(`   Type: ${assessment.assessment_type}`);
    console.log(`   Overall: ${assessment.overall_score}%`);
    console.log(`   Completed: ${assessment.completed_at}\n`);
    
    // What's saved in dimension_scores
    console.log('💾 SAVED IN DATABASE (dimension_scores column):');
    const savedScores = JSON.parse(assessment.dimension_scores);
    if (savedScores.length > 0) {
      savedScores.forEach(s => {
        console.log(`   ${s.pillar_name || s.dimension_name}: ${s.score}%`);
      });
    } else {
      console.log('   ⚠️ EMPTY ARRAY - This is the problem!');
    }
    
    // What the API would return
    console.log('\n🌐 API ENDPOINT TEST:');
    console.log(`   GET /api/assessment/current/${assessment.lead_id}/${assessment.assessment_type}`);
    console.log(`   Would return: ${savedScores.length} pillars\n`);
    
    // What's ACTUALLY in assessment_responses
    console.log('🔍 ACTUAL RESPONSES (assessment_responses table):');
    const responsesSql = `
      SELECT 
        aq.pillar_name,
        COUNT(*) as questions,
        AVG(CAST(ar.response_value AS FLOAT)) as avg_response
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
        console.log(`   ${r.pillar_name}: ${score}% (${r.questions} questions, avg ${r.avg_response.toFixed(2)}/5)`);
      });
      
      console.log('\n❗ PROBLEM IDENTIFIED:');
      console.log('   - dimension_scores in database has ' + savedScores.length + ' pillars');
      console.log('   - assessment_responses has ' + responsesData.length + ' pillars');
      console.log('   - Frontend API loads from dimension_scores (EMPTY)');
      console.log('   - PDF also loads from dimension_scores (EMPTY)');
      console.log('   - Frontend falls back to SIMULATED scores (FAKE)');
      console.log('   - PDF shows EMPTY because no fallback\n');
      
      console.log('✅ SOLUTION:');
      console.log('   Run backfill script to populate dimension_scores from assessment_responses');
      
    } else {
      console.log('   ⚠️ No responses found\n');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

checkLatestAssessmentData();
