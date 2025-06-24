#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import readline from 'readline'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nMake sure these are set in your .env file or environment.')
  process.exit(1)
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Function to prompt for email
function promptEmail() {
  return new Promise((resolve) => {
    rl.question('Enter email address: ', (email) => {
      resolve(email.trim())
    })
  })
}

// Function to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

async function generateMagicLink() {
  try {
    // Check if email was provided as command line argument
    let email = process.argv[2]

    if (!email) {
      // Get email from user input if not provided as argument
      email = await promptEmail()
    } else {
      console.log(`Using email from argument: ${email}`)
    }

    if (!email) {
      console.error('❌ Email is required')
      rl.close()
      return
    }

    if (!isValidEmail(email)) {
      console.error('❌ Please enter a valid email address')
      rl.close()
      return
    }

    console.log(`\n🔄 Generating magic link for: ${email}`)

    // Create Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Generate magic link - try without any redirectTo first
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email
    })

    if (error) {
      console.error('❌ Error generating magic link:', error.message)
    } else {
      console.log('\n✅ Magic link generated successfully!')
      console.log('🔗 Magic link:', data.properties.action_link)
      console.log('\n📧 This link can be sent to the user for passwordless login.')
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
  } finally {
    rl.close()
  }
}

// Run the script
generateMagicLink()