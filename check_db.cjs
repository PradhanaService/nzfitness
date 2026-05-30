const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://azkobuoizdwicagpgnvu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6a29idW9pemR3aWNhZ3BnbnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNzEwMTYsImV4cCI6MjA5MTg0NzAxNn0.1KTIsUetq0uAzdSFkCNzoJ522eFk1pTxtdI0jSMJ5tw'
);

async function check() {
  try {
    const { data: plans, error: e1 } = await supabase.from('membership_plans').select('count');
    console.log('plans:', plans, 'error:', e1);
    
    const { data: mystery, error: e2 } = await supabase.from('mystery_popup_counter').select('*');
    console.log('mystery_popup_counter:', mystery, 'error:', e2);
  } catch (err) {
    console.error('Error:', err);
  }
}

check();
