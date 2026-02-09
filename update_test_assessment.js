import database from './server/config/database.js';

async function updateTestAssessment() {
  try {
    console.log('🔧 Updating assessment ID 40 with comprehensive test data...\n');

    // Complete dimension scores for all 8 pillars
    const dimensionScores = [
      { pillar_name: 'Strategy & Vision', pillar_short_name: 'Strategy', score: 45.5 },
      { pillar_name: 'Data Foundation', pillar_short_name: 'Data', score: 32.0 },
      { pillar_name: 'Technology & Infrastructure', pillar_short_name: 'Technology', score: 58.0 },
      { pillar_name: 'Talent & Culture', pillar_short_name: 'Talent', score: 25.5 },
      { pillar_name: 'Governance & Ethics', pillar_short_name: 'Governance', score: 41.0 },
      { pillar_name: 'Security & Compliance', pillar_short_name: 'Security', score: 67.0 },
      { pillar_name: 'Integration & Deployment', pillar_short_name: 'Integration', score: 38.5 },
      { pillar_name: 'Performance & Optimization', pillar_short_name: 'Performance', score: 52.0 }
    ];

    const insights = {
      gap_analysis: [
        'Data Foundation requires immediate attention with significant gaps in data quality and governance',
        'Talent & Culture shows critical gaps in AI skills and organizational readiness',
        'Governance framework needs strengthening to meet industry best practices',
        'Integration capabilities need development for seamless AI deployment'
      ],
      service_recommendations: [
        'AI Strategy & Roadmap Development - Recommended for scores below 60%',
        'Data Foundation & Governance Implementation',
        'AI Talent Development & Training Programs',
        'Security & Compliance Framework Enhancement'
      ]
    };

    const sql = `
      UPDATE assessments 
      SET 
        overall_score = @param1,
        dimension_scores = @param2,
        insights = @param3,
        completed_at = GETDATE()
      WHERE id = @param4;
      
      SELECT * FROM assessments WHERE id = @param4;
    `;

    const result = await database.query(sql, [
      44.9,
      JSON.stringify(dimensionScores),
      JSON.stringify(insights),
      40
    ]);

    console.log('✅ Assessment ID 40 updated successfully!\n');
    console.log('📋 Assessment Details:');
    console.log('   ID: 40');
    console.log('   User ID: 66');
    console.log('   Type: CORE');
    console.log('   Overall Score: 44.9%');
    console.log('   Assessment Category: AI Explorer\n');
    
    console.log('📊 Dimension Scores:');
    dimensionScores.forEach(d => {
      const status = d.score >= 80 ? '✅ Excellent' : d.score >= 60 ? '👍 Good' : '⚠️ Focus Area';
      console.log(`   ${d.pillar_short_name.padEnd(15)} ${d.score.toFixed(1)}%  ${status}`);
    });
    
    console.log('\n🔍 Gap Analysis:');
    console.log('   - Critical Gaps: 2 pillars (gap ≥ 40 points)');
    console.log('   - High Priority: 4 pillars (gap ≥ 20 points)');
    console.log('   - Moderate: 2 pillars (gap < 20 points)\n');
    
    console.log('📈 Performance Summary:');
    const excellent = dimensionScores.filter(d => d.score >= 80).length;
    const good = dimensionScores.filter(d => d.score >= 60 && d.score < 80).length;
    const focus = dimensionScores.filter(d => d.score < 60).length;
    console.log(`   Excellent Areas (≥80%): ${excellent}`);
    console.log(`   Good Performance (60-79%): ${good}`);
    console.log(`   Focus Areas (<60%): ${focus}\n`);
    
    console.log('🎯 View Enhanced PDF:');
    console.log(`   Direct URL: http://localhost:8080/api/lead/assessments/40/export-pdf`);
    console.log(`   Dashboard: http://localhost:5177/assessment-results?userId=66&assessmentId=40\n`);
    
    console.log('📄 Enhanced PDF includes:');
    console.log('   ✓ Page 1: Cover page with 44.9% score and AI Explorer category');
    console.log('   ✓ Page 2: Executive summary with all 8 pillar bar charts');
    console.log('   ✓ Page 3: Critical Gap Analysis with colored priority levels');
    console.log('   ✓ Page 3: Performance Summary (0 Excellent, 1 Good, 7 Focus Areas)');
    console.log('   ✓ Page 4: Recommended Services & Solutions cards');
    console.log('   ✓ Page 4: Expert guidance and next steps\n');
    
    console.log('🧪 Test Steps:');
    console.log('   1. Open: http://localhost:5177/assessment-results?userId=66&assessmentId=40');
    console.log('   2. Click "View PDF" button');
    console.log('   3. Verify all 4+ pages with complete data appear\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating assessment:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

updateTestAssessment();
