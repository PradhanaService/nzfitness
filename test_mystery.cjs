const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://azkobuoizdwicagpgnvu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6a29idW9pemR3aWNhZ3BnbnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNzEwMTYsImV4cCI6MjA5MTg0NzAxNn0.1KTIsUetq0uAzdSFkCNzoJ522eFk1pTxtdI0jSMJ5tw'
);

async function runTest() {
  console.log('\n======================================================');
  console.log('   Simulating 10 Consecutive Requests to the Portal   ');
  console.log('======================================================\n');
  
  // 1. Fetch current state of database
  const { data: beforeState, error: beforeError } = await supabase
    .from('mystery_popup_counter')
    .select('*')
    .eq('id', 1)
    .single();
    
  if (beforeError) {
    console.error('Error: Could not retrieve database state.', beforeError.message);
    console.log('\n👉 IMPORTANT: Please execute the SQL migration script (supabase/mystery_popup_counter.sql) in your Supabase SQL Editor first, then run this test again!\n');
    return;
  }
  
  console.log('Initial Database State:');
  console.log(`- Current Batch Counter: ${beforeState.batch_counter}`);
  console.log(`- Active Winning Slots : [${beforeState.win_pos_1}, ${beforeState.win_pos_2}]`);
  console.log('\n--- Simulating 10 requests ---\n');
  
  let totalPopups = 0;
  
  for (let i = 1; i <= 10; i++) {
    const { data, error } = await supabase.rpc('increment_and_check_mystery_popup');
    if (error) {
      console.error(`Request ${i} error:`, error.message);
      continue;
    }
    
    const showPopup = data.showPopup;
    if (showPopup) totalPopups++;
    
    console.log(`Request ${i.toString().padStart(2, ' ')} -> ${showPopup ? '✅ POPUP SHOWN' : '❌ No popup'}`);
  }
  
  // 2. Fetch state after running 10 requests to show reset and new random slots
  const { data: afterState, error: afterError } = await supabase
    .from('mystery_popup_counter')
    .select('*')
    .eq('id', 1)
    .single();
    
  if (!afterError) {
    console.log('\nFinal Database State (After 10 Requests):');
    console.log(`- Current Batch Counter: ${afterState.batch_counter} (Should reset to 0/1)`);
    console.log(`- New Winning Slots generated for Next Batch: [${afterState.win_pos_1}, ${afterState.win_pos_2}]`);
  }
  
  console.log('\n======================================================');
  console.log(`Result: Exactly ${totalPopups} out of 10 users received the popup!`);
  console.log('======================================================\n');
}

runTest();
