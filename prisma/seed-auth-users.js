const { loadEnvConfig } = require('@next/env');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
loadEnvConfig(process.cwd(), true);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase configuration env variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const defaultUsers = [
  {
    id: "e415ef40-8452-4752-9426-302ef35b5463",
    email: "admin@industrymirror.id",
    password: "Password123!",
    role: "admin",
    fullName: "System Administrator"
  },
  {
    id: "a0799863-71cc-4ea2-abff-5c4250275883",
    email: "dean@uid.ac.id",
    password: "Password123!",
    role: "university",
    fullName: "Dekan FEB UI"
  }
];

async function main() {
  console.log("Seeding default authentication users in Supabase Auth...");

  for (const user of defaultUsers) {
    console.log(`Checking/Creating user: ${user.email} (${user.role})...`);

    // Delete existing user if present to prevent duplicate key errors
    try {
      const { data: listData } = await supabase.auth.admin.listUsers();
      const existing = listData?.users.find(u => u.email === user.email);
      if (existing) {
        console.log(`User ${user.email} already exists in Auth. Deleting for fresh seed...`);
        await supabase.auth.admin.deleteUser(existing.id);
      }
    } catch (e) {
      console.log("Error checking/deleting existing auth user:", e.message);
    }

    // Create user with specific UUID and auto-confirmed email
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      id: user.id,
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        role: user.role,
        full_name: user.fullName
      }
    });

    if (authError) {
      console.error(`Failed to create ${user.email}:`, authError.message);
    } else {
      console.log(`Successfully created auth user: ${authUser.user.email} with ID: ${authUser.user.id}`);
    }
  }

  console.log("Authentication user seeding completed!");
}

main()
  .catch(e => {
    console.error("Unhandled error:", e);
    process.exit(1);
  });
