#!/usr/bin/env python3
"""
Demo Data Import Script for Buffo

This script fetches demo thread data from suna.so's Supabase instance and generates
a SQL migration file that can be applied to your local Supabase database.

The script will:
1. Fetch all demo threads, messages, projects, and agent_runs from suna.so
2. Create a demo account in your local database
3. Generate proper SQL INSERT statements with correct foreign key relationships
4. Create a migration file that can be applied with `supabase db push`

Usage:
    python scripts/import_demo_data.py
"""

import asyncio
import aiohttp
import json
import os
import sys
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional
import argparse

# Demo thread IDs from the frontend
DEMO_THREAD_IDS = [
    '2fbf0552-87d6-4d12-be25-d54f435bc493',
    'a172382b-aa77-42a2-a3e1-46f32a0f9c37',
    'd9e39c94-4f6f-4b5a-b1a0-b681bfe0dee8',
    '23f7d904-eb66-4a9c-9247-b9704ddfd233',
    'bf6a819b-6af5-4ef7-b861-16e5261ceeb0',
    '6830cc6d-3fbd-492a-93f8-510a5f48ce50',
    'a106ef9f-ed97-46ee-8e51-7bfaf2ac3c29',
    'a01744fc-6b33-434c-9d4e-67d7e820297c',
    '59be8603-3225-4c15-a948-ab976e5912f6',
    '8442cc76-ac8b-438c-b539-4b93909a2218',
    'f04c871c-6bf5-4464-8e9c-5351c9cf5a60',
    '53bcd4c7-40d6-4293-9f69-e2638ddcfad8',
]

# Suna.so Supabase configuration
SUNA_SUPABASE_URL = "https://jbriwassebxdwoieikga.supabase.co"
SUNA_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impicml3YXNzZWJ4ZHdvaWVpa2dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTMzMjYsImV4cCI6MjA1OTk2OTMyNn0.1iYSZAYGOc0B0-64KzLKwMA3dYNn0enQteikh9_VnDc"

# Headers for suna.so Supabase requests
SUNA_HEADERS = {
    'apikey': SUNA_API_KEY,
    'Authorization': f'Bearer {SUNA_API_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

class DemoDataImporter:
    def __init__(self, local_supabase_url: str, local_service_role_key: str):
        self.local_supabase_url = local_supabase_url.rstrip('/')
        self.local_service_role_key = local_service_role_key
        self.demo_account_id = str(uuid.uuid4())
        self.demo_user_id = str(uuid.uuid4())

        # Data storage
        self.threads_data = {}
        self.messages_data = {}
        self.projects_data = {}
        self.agent_runs_data = {}

    async def fetch_suna_data(self, session: aiohttp.ClientSession, endpoint: str, params: Dict[str, str] = None) -> List[Dict]:
        """Fetch data from suna.so Supabase"""
        url = f"{SUNA_SUPABASE_URL}/rest/v1/{endpoint}"

        try:
            async with session.get(url, headers=SUNA_HEADERS, params=params) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    print(f"Error fetching {endpoint}: {response.status} - {await response.text()}")
                    return []
        except Exception as e:
            print(f"Exception fetching {endpoint}: {e}")
            return []

    async def fetch_all_demo_data(self):
        """Fetch all demo data from suna.so"""
        print("Fetching demo data from suna.so...")

        async with aiohttp.ClientSession() as session:
            # Fetch threads
            print("Fetching threads...")
            for thread_id in DEMO_THREAD_IDS:
                threads = await self.fetch_suna_data(session, "threads", {"thread_id": f"eq.{thread_id}"})
                for thread in threads:
                    self.threads_data[thread['thread_id']] = thread
                    print(f"  ✓ Thread {thread_id}")

            # Fetch messages for all threads
            print("Fetching messages...")
            for thread_id in self.threads_data.keys():
                messages = await self.fetch_suna_data(session, "messages", {
                    "thread_id": f"eq.{thread_id}",
                    "order": "created_at.asc"
                })
                self.messages_data[thread_id] = messages
                print(f"  ✓ {len(messages)} messages for thread {thread_id}")

            # Fetch projects
            print("Fetching projects...")
            project_ids = set()
            for thread in self.threads_data.values():
                if thread.get('project_id'):
                    project_ids.add(thread['project_id'])

            for project_id in project_ids:
                projects = await self.fetch_suna_data(session, "projects", {"project_id": f"eq.{project_id}"})
                for project in projects:
                    self.projects_data[project['project_id']] = project
                    print(f"  ✓ Project {project_id}")

            # Fetch agent runs
            print("Fetching agent runs...")
            for thread_id in self.threads_data.keys():
                agent_runs = await self.fetch_suna_data(session, "agent_runs", {
                    "thread_id": f"eq.{thread_id}",
                    "order": "created_at.asc"
                })
                if agent_runs:
                    self.agent_runs_data[thread_id] = agent_runs
                    print(f"  ✓ {len(agent_runs)} agent runs for thread {thread_id}")

        print(f"\nFetched:")
        print(f"  - {len(self.threads_data)} threads")
        print(f"  - {sum(len(msgs) for msgs in self.messages_data.values())} messages")
        print(f"  - {len(self.projects_data)} projects")
        print(f"  - {sum(len(runs) for runs in self.agent_runs_data.values())} agent runs")

    def escape_sql_string(self, value: Any) -> str:
        """Escape a value for SQL insertion"""
        if value is None:
            return 'NULL'
        elif isinstance(value, bool):
            return 'TRUE' if value else 'FALSE'
        elif isinstance(value, (int, float)):
            return str(value)
        elif isinstance(value, str):
            # Escape single quotes and backslashes
            escaped = value.replace("'", "''").replace("\\", "\\\\")
            return f"'{escaped}'"
        elif isinstance(value, (dict, list)):
            # Convert to JSON string and escape
            json_str = json.dumps(value, ensure_ascii=False)
            escaped = json_str.replace("'", "''").replace("\\", "\\\\")
            return f"'{escaped}'"
        else:
            # Convert to string and escape
            str_value = str(value)
            escaped = str_value.replace("'", "''").replace("\\", "\\\\")
            return f"'{escaped}'"

    def generate_migration_sql(self) -> str:
        """Generate the complete SQL migration"""
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")

        sql_parts = []

        # Header comment
        sql_parts.append(f"""-- Demo Data Migration
-- Generated on {datetime.now().isoformat()}
-- Imports demo threads, messages, projects, and agent runs from suna.so

-- This migration creates:
-- 1. A demo user account
-- 2. A demo basejump account
-- 3. All demo projects, threads, messages, and agent runs
""")

        # Create demo user in auth.users (if not exists)
        sql_parts.append(f"""
-- Create demo user (if not exists)
INSERT INTO auth.users (
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES (
    '{self.demo_user_id}',
    'demo@buffo.ai',
    NOW(),
    NOW(),
    NOW(),
    '{{"provider": "email", "providers": ["email"]}}',
    '{{"name": "Demo User"}}',
    FALSE,
    'authenticated'
) ON CONFLICT (id) DO NOTHING;
""")

        # Create demo account in basejump.accounts
        sql_parts.append(f"""
-- Create demo account
INSERT INTO basejump.accounts (
    id,
    primary_owner_user_id,
    name,
    slug,
    personal_account,
    created_at,
    updated_at,
    created_by,
    updated_by,
    private_metadata,
    public_metadata
) VALUES (
    '{self.demo_account_id}',
    '{self.demo_user_id}',
    'Demo Account',
    'demo-account',
    FALSE,
    NOW(),
    NOW(),
    '{self.demo_user_id}',
    '{self.demo_user_id}',
    '{{}}',
    '{{}}'
) ON CONFLICT (id) DO NOTHING;
""")

        # Create account_user relationship
        sql_parts.append(f"""
-- Add demo user to demo account
INSERT INTO basejump.account_user (
    user_id,
    account_id,
    account_role
) VALUES (
    '{self.demo_user_id}',
    '{self.demo_account_id}',
    'owner'
) ON CONFLICT (user_id, account_id) DO NOTHING;
""")

        # Insert projects
        if self.projects_data:
            sql_parts.append("\n-- Insert demo projects")
            for project in self.projects_data.values():
                sql_parts.append(f"""INSERT INTO projects (
    project_id,
    name,
    description,
    account_id,
    sandbox,
    is_public,
    created_at,
    updated_at
) VALUES (
    '{project['project_id']}',
    {self.escape_sql_string(project.get('name', 'Demo Project'))},
    {self.escape_sql_string(project.get('description'))},
    '{self.demo_account_id}',
    {self.escape_sql_string(project.get('sandbox', {}))},
    TRUE,
    {self.escape_sql_string(project.get('created_at', 'NOW()'))},
    {self.escape_sql_string(project.get('updated_at', 'NOW()'))}
) ON CONFLICT (project_id) DO NOTHING;""")

        # Insert threads
        if self.threads_data:
            sql_parts.append("\n-- Insert demo threads")
            for thread in self.threads_data.values():
                sql_parts.append(f"""INSERT INTO threads (
    thread_id,
    account_id,
    project_id,
    is_public,
    created_at,
    updated_at
) VALUES (
    '{thread['thread_id']}',
    '{self.demo_account_id}',
    {self.escape_sql_string(thread.get('project_id'))},
    TRUE,
    {self.escape_sql_string(thread.get('created_at', 'NOW()'))},
    {self.escape_sql_string(thread.get('updated_at', 'NOW()'))}
) ON CONFLICT (thread_id) DO NOTHING;""")

        # Insert messages
        if self.messages_data:
            sql_parts.append("\n-- Insert demo messages")
            for thread_id, messages in self.messages_data.items():
                for message in messages:
                    sql_parts.append(f"""INSERT INTO messages (
    message_id,
    thread_id,
    type,
    is_llm_message,
    content,
    metadata,
    created_at,
    updated_at
) VALUES (
    '{message['message_id']}',
    '{message['thread_id']}',
    {self.escape_sql_string(message.get('type', 'user'))},
    {self.escape_sql_string(message.get('is_llm_message', True))},
    {self.escape_sql_string(message.get('content', {}))},
    {self.escape_sql_string(message.get('metadata', {}))},
    {self.escape_sql_string(message.get('created_at', 'NOW()'))},
    {self.escape_sql_string(message.get('updated_at', 'NOW()'))}
) ON CONFLICT (message_id) DO NOTHING;""")

        # Insert agent runs
        if self.agent_runs_data:
            sql_parts.append("\n-- Insert demo agent runs")
            for thread_id, agent_runs in self.agent_runs_data.items():
                for run in agent_runs:
                    sql_parts.append(f"""INSERT INTO agent_runs (
    id,
    thread_id,
    status,
    started_at,
    completed_at,
    responses,
    error,
    created_at,
    updated_at
) VALUES (
    '{run['id']}',
    '{run['thread_id']}',
    {self.escape_sql_string(run.get('status', 'completed'))},
    {self.escape_sql_string(run.get('started_at', 'NOW()'))},
    {self.escape_sql_string(run.get('completed_at'))},
    {self.escape_sql_string(run.get('responses', []))},
    {self.escape_sql_string(run.get('error'))},
    {self.escape_sql_string(run.get('created_at', 'NOW()'))},
    {self.escape_sql_string(run.get('updated_at', 'NOW()'))}
) ON CONFLICT (id) DO NOTHING;""")

        return '\n'.join(sql_parts)

    async def test_local_connection(self):
        """Test connection to local Supabase"""
        print("Testing connection to local Supabase...")

        headers = {
            'apikey': self.local_service_role_key,
            'Authorization': f'Bearer {self.local_service_role_key}',
            'Content-Type': 'application/json'
        }

        try:
            async with aiohttp.ClientSession() as session:
                # Try different endpoints to test connection
                test_endpoints = [
                    "/rest/v1/",  # Basic REST endpoint
                    "/rest/v1/accounts",  # Basejump accounts table
                    "/rest/v1/projects",  # Our projects table
                ]

                for endpoint in test_endpoints:
                    url = f"{self.local_supabase_url}{endpoint}"
                    try:
                        async with session.get(url, headers=headers, params={"limit": "1"}) as response:
                            if response.status in [200, 404]:  # 404 is OK if table doesn't exist yet
                                print("✓ Successfully connected to local Supabase")
                                return True
                            elif response.status == 401:
                                print(f"✗ Authentication failed: Invalid service role key")
                                return False
                    except Exception as e:
                        continue  # Try next endpoint

                print(f"✗ Failed to connect to local Supabase")
                return False
        except Exception as e:
            print(f"✗ Exception connecting to local Supabase: {e}")
            return False

    async def run(self):
        """Run the complete import process"""
        print("=== Demo Data Import Script ===\n")

        # Test local connection first
        if not await self.test_local_connection():
            print("Please check your local Supabase credentials and try again.")
            return False

        # Fetch data from suna.so
        await self.fetch_all_demo_data()

        # Generate migration SQL
        print("\nGenerating migration SQL...")
        migration_sql = self.generate_migration_sql()

        # Create migrations directory if it doesn't exist
        migrations_dir = "backend/supabase/migrations"
        os.makedirs(migrations_dir, exist_ok=True)

        # Write migration file
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        migration_file = f"{migrations_dir}/{timestamp}_demo_data_import.sql"

        with open(migration_file, 'w', encoding='utf-8') as f:
            f.write(migration_sql)

        print(f"✓ Migration file created: {migration_file}")
        print(f"\nTo apply the migration, run:")
        print(f"  cd backend && supabase db push")
        print(f"\nThis will import {len(self.threads_data)} demo threads with all their data.")

        return True

def get_user_input():
    """Get Supabase credentials from user"""
    print("This script will import demo data from suna.so into your local Supabase database.")
    print("You'll need your local Supabase credentials.\n")

    # Get local Supabase URL
    while True:
        supabase_url = input("Enter your local Supabase URL (e.g., http://localhost:54321 or https://your-project.supabase.co): ").strip()
        if supabase_url:
            # Ensure proper format
            if not supabase_url.startswith(('http://', 'https://')):
                supabase_url = f"http://{supabase_url}"
            break
        print("Please enter a valid Supabase URL.")

    # Get service role key
    while True:
        service_role_key = input("Enter your local Supabase service role key: ").strip()
        if service_role_key:
            break
        print("Please enter a valid service role key.")

    return supabase_url, service_role_key

async def main():
    parser = argparse.ArgumentParser(description="Import demo data from suna.so to local Supabase")
    parser.add_argument("--url", help="Local Supabase URL")
    parser.add_argument("--key", help="Local Supabase service role key")
    parser.add_argument("--auto", action="store_true", help="Use environment variables without prompting")

    args = parser.parse_args()

    if args.auto:
        # Try to get from environment variables
        supabase_url = os.getenv('SUPABASE_URL') or os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        service_role_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

        if not supabase_url or not service_role_key:
            print("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required with --auto flag")
            sys.exit(1)
    elif args.url and args.key:
        supabase_url = args.url
        service_role_key = args.key
    else:
        supabase_url, service_role_key = get_user_input()

    # Create importer and run
    importer = DemoDataImporter(supabase_url, service_role_key)
    success = await importer.run()

    if success:
        print("\n✓ Demo data import completed successfully!")
    else:
        print("\n✗ Demo data import failed.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())