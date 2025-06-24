# Scripts

This directory contains utility scripts for the Buffo project.

## Demo Data Import Script

The `import_demo_data.py` script fetches demo thread data from suna.so's Supabase instance and generates a SQL migration file for importing into your local database.

### Prerequisites

1. Install Python dependencies:
   ```bash
   pip install -r scripts/requirements.txt
   ```

2. Have your local Supabase instance running and accessible

### Usage

#### Interactive Mode (Recommended)
```bash
python scripts/import_demo_data.py
```
The script will prompt you for:
- Your local Supabase URL (e.g., `http://localhost:54321` or `https://your-project.supabase.co`)
- Your local Supabase service role key

#### Command Line Arguments
```bash
python scripts/import_demo_data.py --url "http://localhost:54321" --key "your-service-role-key"
```

#### Environment Variables
```bash
python scripts/import_demo_data.py --auto
```
This mode uses environment variables:
- `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### What the Script Does

1. **Fetches Data**: Downloads all demo threads, messages, projects, and agent runs from suna.so
2. **Creates Demo Account**: Generates a demo user and account in your local database
3. **Generates Migration**: Creates a SQL migration file with proper INSERT statements
4. **Handles Relationships**: Ensures all foreign key relationships are maintained

### Applying the Migration

After running the script, apply the generated migration:

```bash
cd backend
supabase db push
```

### Demo Threads Imported

The script imports these demo thread IDs:
- `2fbf0552-87d6-4d12-be25-d54f435bc493`
- `a172382b-aa77-42a2-a3e1-46f32a0f9c37`
- `d9e39c94-4f6f-4b5a-b1a0-b681bfe0dee8`
- `23f7d904-eb66-4a9c-9247-b9704ddfd233`
- `bf6a819b-6af5-4ef7-b861-16e5261ceeb0`
- `6830cc6d-3fbd-492a-93f8-510a5f48ce50`
- `a106ef9f-ed97-46ee-8e51-7bfaf2ac3c29`
- `a01744fc-6b33-434c-9d4e-67d7e820297c`
- `59be8603-3225-4c15-a948-ab976e5912f6`
- `8442cc76-ac8b-438c-b539-4b93909a2218`
- `f04c871c-6bf5-4464-8e9c-5351c9cf5a60`
- `53bcd4c7-40d6-4293-9f69-e2638ddcfad8`

### Benefits

- **Clean Solution**: No need for API routing or fallback logic
- **Local Data**: Demo threads exist in your local database
- **Performance**: No external API calls during normal operation
- **Consistency**: Same data structure as production
- **Offline**: Works without internet connection after import

# Supabase Magic Link Generator

Script to generate Supabase magic links from the command line.

## Prerequisites

Make sure you have the following environment variables set in your `.env` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

⚠️ **Important**: The `SUPABASE_SERVICE_ROLE_KEY` should be your **service role key**, not the anon key, as it has admin privileges to generate magic links.

## Setup
```bash
cd scripts
npm install
```

## Usage

### Interactive mode (prompts for email):
```bash
npm run generate
# or
node generate-magic-link.js
```

### Command line argument (provide email directly):
```bash
node generate-magic-link.js curtis@timeless.nyc
# or
npm run generate curtis@timeless.nyc
```

## How it works

1. The script prompts you to enter an email address
2. It validates the email format
3. It connects to Supabase using your service role key
4. It generates a magic link for the specified email
5. It displays the magic link that can be sent to the user

## Example Output

```
Enter email address: user@example.com

🔄 Generating magic link for: user@example.com

✅ Magic link generated successfully!
🔗 Magic link: https://your-project.supabase.co/auth/v1/verify?token=...&type=magiclink&redirect_to=...

📧 This link can be sent to the user for passwordless login.
```

## Security Notes

- Keep your service role key secure and never commit it to version control
- Magic links are single-use and expire after a certain time
- Only generate magic links for users you trust