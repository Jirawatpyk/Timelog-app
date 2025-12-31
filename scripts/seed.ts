/**
 * TypeScript Seed Script for Timelog Development
 * Story: 1.5 Seed Data for Development
 *
 * Usage: npx tsx scripts/seed.ts
 *
 * This script:
 * - Creates test users via Supabase Admin API
 * - Seeds all master data (departments, clients, projects, jobs, services, tasks)
 * - Creates sample time entries
 * - Is IDEMPOTENT - safe to run multiple times
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// =============================================================================
// SEED DATA DEFINITIONS
// =============================================================================

const TEST_PASSWORD = 'test123456';

const departments = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Audio Production', active: true },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Video Production', active: true },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Localization', active: true },
];

const testUsers = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    email: 'staff@test.com',
    display_name: 'Test Staff',
    role: 'staff',
    department_id: '11111111-1111-1111-1111-111111111111',
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    email: 'manager@test.com',
    display_name: 'Test Manager',
    role: 'manager',
    department_id: '11111111-1111-1111-1111-111111111111',
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    email: 'admin@test.com',
    display_name: 'Test Admin',
    role: 'admin',
    department_id: '11111111-1111-1111-1111-111111111111',
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    email: 'superadmin@test.com',
    display_name: 'Test Super Admin',
    role: 'super_admin',
    department_id: '11111111-1111-1111-1111-111111111111',
  },
];

const managerDepartments = [
  { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', manager_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', department_id: '11111111-1111-1111-1111-111111111111' },
  { id: 'ffffffff-ffff-ffff-ffff-ffffffffffff', manager_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', department_id: '22222222-2222-2222-2222-222222222222' },
];

const clients = [
  { id: 'ca111111-1111-1111-1111-111111111111', name: 'บริษัท สยามมีเดีย จำกัด', active: true },
  { id: 'ca222222-2222-2222-2222-222222222222', name: 'บริษัท ไทยเอ็นเตอร์เทนเมนต์ จำกัด', active: true },
  { id: 'ca333333-3333-3333-3333-333333333333', name: 'บริษัท กรุงเทพโปรดักชั่น จำกัด', active: true },
  { id: 'ca444444-4444-4444-4444-444444444444', name: 'บริษัท แอนิเมชั่นสตูดิโอ จำกัด', active: true },
  { id: 'ca555555-5555-5555-5555-555555555555', name: 'บริษัท วอยซ์โอเวอร์ไทย จำกัด', active: true },
  { id: 'ca666666-6666-6666-6666-666666666666', name: 'บริษัท สตูดิโอมิกซ์ จำกัด', active: true },
  { id: 'ca777777-7777-7777-7777-777777777777', name: 'บริษัท ซับไตเติ้ลโปร จำกัด', active: true },
  { id: 'ca888888-8888-8888-8888-888888888888', name: 'บริษัท ดับบิ้งมาสเตอร์ จำกัด', active: true },
  { id: 'ca999999-9999-9999-9999-999999999999', name: 'บริษัท แปลภาษาไทย จำกัด', active: true },
  { id: 'ca000000-0000-0000-0000-000000000000', name: 'บริษัท โพสต์โปรดักชั่น จำกัด', active: true },
];

const services = [
  { id: '5e111111-1111-1111-1111-111111111111', name: 'Dubbing', active: true },
  { id: '5e222222-2222-2222-2222-222222222222', name: 'Subtitling', active: true },
  { id: '5e333333-3333-3333-3333-333333333333', name: 'QC', active: true },
  { id: '5e444444-4444-4444-4444-444444444444', name: 'Recording', active: true },
  { id: '5e555555-5555-5555-5555-555555555555', name: 'Mixing', active: true },
  { id: '5e666666-6666-6666-6666-666666666666', name: 'Translation', active: true },
  { id: '5e777777-7777-7777-7777-777777777777', name: 'Voice Over', active: true },
  { id: '5e888888-8888-8888-8888-888888888888', name: 'ADR', active: true },
];

const tasks = [
  { id: 'fa111111-1111-1111-1111-111111111111', name: 'Preparation', active: true },
  { id: 'fa222222-2222-2222-2222-222222222222', name: 'Production', active: true },
  { id: 'fa333333-3333-3333-3333-333333333333', name: 'Review', active: true },
  { id: 'fa444444-4444-4444-4444-444444444444', name: 'Revision', active: true },
  { id: 'fa555555-5555-5555-5555-555555555555', name: 'Delivery', active: true },
  { id: 'fa666666-6666-6666-6666-666666666666', name: 'Meeting', active: true },
  { id: 'fa777777-7777-7777-7777-777777777777', name: 'Admin', active: true },
  { id: 'fa888888-8888-8888-8888-888888888888', name: 'Training', active: true },
  { id: 'fa999999-9999-9999-9999-999999999999', name: 'Research', active: true },
  { id: 'fa000000-0000-0000-0000-000000000000', name: 'Support', active: true },
];

const projects = [
  { id: 'b1111111-1111-1111-1111-111111111111', client_id: 'ca111111-1111-1111-1111-111111111111', name: 'Netflix Series Q1', active: true },
  { id: 'b1111111-1111-1111-1111-222222222222', client_id: 'ca111111-1111-1111-1111-111111111111', name: 'Disney+ Movie Dub', active: true },
  { id: 'b2222222-2222-2222-2222-111111111111', client_id: 'ca222222-2222-2222-2222-222222222222', name: 'HBO Drama Series', active: true },
  { id: 'b2222222-2222-2222-2222-222222222222', client_id: 'ca222222-2222-2222-2222-222222222222', name: 'Amazon Prime Show', active: true },
  { id: 'b3333333-3333-3333-3333-111111111111', client_id: 'ca333333-3333-3333-3333-333333333333', name: 'Local Film Project', active: true },
  { id: 'b3333333-3333-3333-3333-222222222222', client_id: 'ca333333-3333-3333-3333-333333333333', name: 'TV Commercial Series', active: true },
  { id: 'b4444444-4444-4444-4444-111111111111', client_id: 'ca444444-4444-4444-4444-444444444444', name: 'Anime Season 1', active: true },
  { id: 'b4444444-4444-4444-4444-222222222222', client_id: 'ca444444-4444-4444-4444-444444444444', name: 'Animation Movie', active: true },
  { id: 'b5555555-5555-5555-5555-111111111111', client_id: 'ca555555-5555-5555-5555-555555555555', name: 'Documentary Series', active: true },
  { id: 'b5555555-5555-5555-5555-222222222222', client_id: 'ca555555-5555-5555-5555-555555555555', name: 'Corporate Video', active: true },
  { id: 'b6666666-6666-6666-6666-111111111111', client_id: 'ca666666-6666-6666-6666-666666666666', name: 'Feature Film Mix', active: true },
  { id: 'b6666666-6666-6666-6666-222222222222', client_id: 'ca666666-6666-6666-6666-666666666666', name: 'Music Album', active: true },
  { id: 'b7777777-7777-7777-7777-111111111111', client_id: 'ca777777-7777-7777-7777-777777777777', name: 'Korean Drama Sub', active: true },
  { id: 'b7777777-7777-7777-7777-222222222222', client_id: 'ca777777-7777-7777-7777-777777777777', name: 'Japanese Anime Sub', active: true },
  { id: 'b8888888-8888-8888-8888-111111111111', client_id: 'ca888888-8888-8888-8888-888888888888', name: 'Hollywood Blockbuster', active: true },
  { id: 'b8888888-8888-8888-8888-222222222222', client_id: 'ca888888-8888-8888-8888-888888888888', name: 'Cartoon Network Series', active: true },
  { id: 'b9999999-9999-9999-9999-111111111111', client_id: 'ca999999-9999-9999-9999-999999999999', name: 'Technical Manual', active: true },
  { id: 'b9999999-9999-9999-9999-222222222222', client_id: 'ca999999-9999-9999-9999-999999999999', name: 'Website Localization', active: true },
  { id: 'b0000000-0000-0000-0000-111111111111', client_id: 'ca000000-0000-0000-0000-000000000000', name: 'TV Series Post', active: true },
  { id: 'b0000000-0000-0000-0000-222222222222', client_id: 'ca000000-0000-0000-0000-000000000000', name: 'Ad Campaign Post', active: true },
];

// Generate 50 jobs
const jobs = [
  { id: 'd0000001-0000-0000-0000-000000000001', project_id: 'b1111111-1111-1111-1111-111111111111', name: 'Episode 1-5 Dubbing', job_no: 'JOB-2024-001', so_no: 'SO-2024-001', active: true },
  { id: 'd0000001-0000-0000-0000-000000000002', project_id: 'b1111111-1111-1111-1111-111111111111', name: 'Episode 6-10 Dubbing', job_no: 'JOB-2024-002', so_no: 'SO-2024-002', active: true },
  { id: 'd0000001-0000-0000-0000-000000000003', project_id: 'b1111111-1111-1111-1111-111111111111', name: 'Trailer Localization', job_no: 'JOB-2024-003', so_no: 'SO-2024-003', active: true },
  { id: 'd0000002-0000-0000-0000-000000000001', project_id: 'b1111111-1111-1111-1111-222222222222', name: 'Main Feature Dub', job_no: 'JOB-2024-004', so_no: 'SO-2024-004', active: true },
  { id: 'd0000002-0000-0000-0000-000000000002', project_id: 'b1111111-1111-1111-1111-222222222222', name: 'Bonus Content', job_no: 'JOB-2024-005', so_no: 'SO-2024-005', active: true },
  { id: 'd0000003-0000-0000-0000-000000000001', project_id: 'b2222222-2222-2222-2222-111111111111', name: 'Season 1 Episodes', job_no: 'JOB-2024-006', so_no: 'SO-2024-006', active: true },
  { id: 'd0000003-0000-0000-0000-000000000002', project_id: 'b2222222-2222-2222-2222-111111111111', name: 'Season 2 Episodes', job_no: 'JOB-2024-007', so_no: 'SO-2024-007', active: true },
  { id: 'd0000003-0000-0000-0000-000000000003', project_id: 'b2222222-2222-2222-2222-111111111111', name: 'Behind the Scenes', job_no: 'JOB-2024-008', so_no: 'SO-2024-008', active: true },
  { id: 'd0000004-0000-0000-0000-000000000001', project_id: 'b2222222-2222-2222-2222-222222222222', name: 'Full Series Dub', job_no: 'JOB-2024-009', so_no: 'SO-2024-009', active: true },
  { id: 'd0000004-0000-0000-0000-000000000002', project_id: 'b2222222-2222-2222-2222-222222222222', name: 'Promo Material', job_no: 'JOB-2024-010', so_no: 'SO-2024-010', active: true },
  { id: 'd0000005-0000-0000-0000-000000000001', project_id: 'b3333333-3333-3333-3333-111111111111', name: 'Dialogue Recording', job_no: 'JOB-2024-011', so_no: 'SO-2024-011', active: true },
  { id: 'd0000005-0000-0000-0000-000000000002', project_id: 'b3333333-3333-3333-3333-111111111111', name: 'Sound Effects', job_no: 'JOB-2024-012', so_no: 'SO-2024-012', active: true },
  { id: 'd0000005-0000-0000-0000-000000000003', project_id: 'b3333333-3333-3333-3333-111111111111', name: 'Final Mix', job_no: 'JOB-2024-013', so_no: 'SO-2024-013', active: true },
  { id: 'd0000006-0000-0000-0000-000000000001', project_id: 'b3333333-3333-3333-3333-222222222222', name: 'Voice Recording', job_no: 'JOB-2024-014', so_no: 'SO-2024-014', active: true },
  { id: 'd0000006-0000-0000-0000-000000000002', project_id: 'b3333333-3333-3333-3333-222222222222', name: 'Music Production', job_no: 'JOB-2024-015', so_no: 'SO-2024-015', active: true },
  { id: 'd0000007-0000-0000-0000-000000000001', project_id: 'b4444444-4444-4444-4444-111111111111', name: 'Episode 1-12 Dub', job_no: 'JOB-2024-016', so_no: 'SO-2024-016', active: true },
  { id: 'd0000007-0000-0000-0000-000000000002', project_id: 'b4444444-4444-4444-4444-111111111111', name: 'Opening/Ending Songs', job_no: 'JOB-2024-017', so_no: 'SO-2024-017', active: true },
  { id: 'd0000007-0000-0000-0000-000000000003', project_id: 'b4444444-4444-4444-4444-111111111111', name: 'OVA Special', job_no: 'JOB-2024-018', so_no: 'SO-2024-018', active: true },
  { id: 'd0000008-0000-0000-0000-000000000001', project_id: 'b4444444-4444-4444-4444-222222222222', name: 'Feature Film Dub', job_no: 'JOB-2024-019', so_no: 'SO-2024-019', active: true },
  { id: 'd0000008-0000-0000-0000-000000000002', project_id: 'b4444444-4444-4444-4444-222222222222', name: 'Theatrical Trailer', job_no: 'JOB-2024-020', so_no: 'SO-2024-020', active: true },
  { id: 'd0000009-0000-0000-0000-000000000001', project_id: 'b5555555-5555-5555-5555-111111111111', name: 'Episode 1-6 VO', job_no: 'JOB-2024-021', so_no: 'SO-2024-021', active: true },
  { id: 'd0000009-0000-0000-0000-000000000002', project_id: 'b5555555-5555-5555-5555-111111111111', name: 'Episode 7-12 VO', job_no: 'JOB-2024-022', so_no: 'SO-2024-022', active: true },
  { id: 'd0000009-0000-0000-0000-000000000003', project_id: 'b5555555-5555-5555-5555-111111111111', name: 'Promo Narration', job_no: 'JOB-2024-023', so_no: 'SO-2024-023', active: true },
  { id: 'd0000010-0000-0000-0000-000000000001', project_id: 'b5555555-5555-5555-5555-222222222222', name: 'Training Videos', job_no: 'JOB-2024-024', so_no: 'SO-2024-024', active: true },
  { id: 'd0000010-0000-0000-0000-000000000002', project_id: 'b5555555-5555-5555-5555-222222222222', name: 'Company Profile', job_no: 'JOB-2024-025', so_no: 'SO-2024-025', active: true },
  { id: 'd0000011-0000-0000-0000-000000000001', project_id: 'b6666666-6666-6666-6666-111111111111', name: 'Dialogue Pre-Mix', job_no: 'JOB-2024-026', so_no: 'SO-2024-026', active: true },
  { id: 'd0000011-0000-0000-0000-000000000002', project_id: 'b6666666-6666-6666-6666-111111111111', name: 'Effects Pre-Mix', job_no: 'JOB-2024-027', so_no: 'SO-2024-027', active: true },
  { id: 'd0000011-0000-0000-0000-000000000003', project_id: 'b6666666-6666-6666-6666-111111111111', name: 'Final 5.1 Mix', job_no: 'JOB-2024-028', so_no: 'SO-2024-028', active: true },
  { id: 'd0000012-0000-0000-0000-000000000001', project_id: 'b6666666-6666-6666-6666-222222222222', name: 'Tracking Sessions', job_no: 'JOB-2024-029', so_no: 'SO-2024-029', active: true },
  { id: 'd0000012-0000-0000-0000-000000000002', project_id: 'b6666666-6666-6666-6666-222222222222', name: 'Mastering', job_no: 'JOB-2024-030', so_no: 'SO-2024-030', active: true },
  { id: 'd0000013-0000-0000-0000-000000000001', project_id: 'b7777777-7777-7777-7777-111111111111', name: 'Episode 1-8 Subtitles', job_no: 'JOB-2024-031', so_no: 'SO-2024-031', active: true },
  { id: 'd0000013-0000-0000-0000-000000000002', project_id: 'b7777777-7777-7777-7777-111111111111', name: 'Episode 9-16 Subtitles', job_no: 'JOB-2024-032', so_no: 'SO-2024-032', active: true },
  { id: 'd0000013-0000-0000-0000-000000000003', project_id: 'b7777777-7777-7777-7777-111111111111', name: 'Special Episode', job_no: 'JOB-2024-033', so_no: 'SO-2024-033', active: true },
  { id: 'd0000014-0000-0000-0000-000000000001', project_id: 'b7777777-7777-7777-7777-222222222222', name: 'Season 1 Subtitles', job_no: 'JOB-2024-034', so_no: 'SO-2024-034', active: true },
  { id: 'd0000014-0000-0000-0000-000000000002', project_id: 'b7777777-7777-7777-7777-222222222222', name: 'Movie Subtitles', job_no: 'JOB-2024-035', so_no: 'SO-2024-035', active: true },
  { id: 'd0000015-0000-0000-0000-000000000001', project_id: 'b8888888-8888-8888-8888-111111111111', name: 'Main Feature Thai Dub', job_no: 'JOB-2024-036', so_no: 'SO-2024-036', active: true },
  { id: 'd0000015-0000-0000-0000-000000000002', project_id: 'b8888888-8888-8888-8888-111111111111', name: 'IMAX Version', job_no: 'JOB-2024-037', so_no: 'SO-2024-037', active: true },
  { id: 'd0000015-0000-0000-0000-000000000003', project_id: 'b8888888-8888-8888-8888-111111111111', name: 'Home Video Version', job_no: 'JOB-2024-038', so_no: 'SO-2024-038', active: true },
  { id: 'd0000016-0000-0000-0000-000000000001', project_id: 'b8888888-8888-8888-8888-222222222222', name: 'Season 1 Episodes', job_no: 'JOB-2024-039', so_no: 'SO-2024-039', active: true },
  { id: 'd0000016-0000-0000-0000-000000000002', project_id: 'b8888888-8888-8888-8888-222222222222', name: 'Season 2 Episodes', job_no: 'JOB-2024-040', so_no: 'SO-2024-040', active: true },
  { id: 'd0000017-0000-0000-0000-000000000001', project_id: 'b9999999-9999-9999-9999-111111111111', name: 'User Guide Translation', job_no: 'JOB-2024-041', so_no: 'SO-2024-041', active: true },
  { id: 'd0000017-0000-0000-0000-000000000002', project_id: 'b9999999-9999-9999-9999-111111111111', name: 'Safety Manual Translation', job_no: 'JOB-2024-042', so_no: 'SO-2024-042', active: true },
  { id: 'd0000018-0000-0000-0000-000000000001', project_id: 'b9999999-9999-9999-9999-222222222222', name: 'Main Website Pages', job_no: 'JOB-2024-043', so_no: 'SO-2024-043', active: true },
  { id: 'd0000018-0000-0000-0000-000000000002', project_id: 'b9999999-9999-9999-9999-222222222222', name: 'E-commerce Section', job_no: 'JOB-2024-044', so_no: 'SO-2024-044', active: true },
  { id: 'd0000018-0000-0000-0000-000000000003', project_id: 'b9999999-9999-9999-9999-222222222222', name: 'Mobile App Strings', job_no: 'JOB-2024-045', so_no: 'SO-2024-045', active: true },
  { id: 'd0000019-0000-0000-0000-000000000001', project_id: 'b0000000-0000-0000-0000-111111111111', name: 'Season 1 Post Production', job_no: 'JOB-2024-046', so_no: 'SO-2024-046', active: true },
  { id: 'd0000019-0000-0000-0000-000000000002', project_id: 'b0000000-0000-0000-0000-111111111111', name: 'Season 2 Post Production', job_no: 'JOB-2024-047', so_no: 'SO-2024-047', active: true },
  { id: 'd0000019-0000-0000-0000-000000000003', project_id: 'b0000000-0000-0000-0000-111111111111', name: 'Special Episode Post', job_no: 'JOB-2024-048', so_no: 'SO-2024-048', active: true },
  { id: 'd0000020-0000-0000-0000-000000000001', project_id: 'b0000000-0000-0000-0000-222222222222', name: 'TV Spots Post', job_no: 'JOB-2024-049', so_no: 'SO-2024-049', active: true },
  { id: 'd0000020-0000-0000-0000-000000000002', project_id: 'b0000000-0000-0000-0000-222222222222', name: 'Digital Ads Post', job_no: 'JOB-2024-050', so_no: 'SO-2024-050', active: true },
];

// =============================================================================
// SEED FUNCTIONS
// =============================================================================

async function seedDepartments() {
  console.log('Seeding departments...');
  const { error } = await supabase
    .from('departments')
    .upsert(departments, { onConflict: 'id' });
  if (error) throw new Error(`Failed to seed departments: ${error.message}`);
  console.log(`  ✓ ${departments.length} departments`);
}

async function seedAuthUsers() {
  console.log('Seeding auth users...');
  for (const user of testUsers) {
    // Check if user exists
    const { data: existingUser } = await supabase.auth.admin.getUserById(user.id);
    if (existingUser?.user) {
      console.log(`  - ${user.email} (already exists)`);
      continue;
    }

    // Create user
    const { error } = await supabase.auth.admin.createUser({
      id: user.id,
      email: user.email,
      email_confirm: true,
      password: TEST_PASSWORD,
      user_metadata: { display_name: user.display_name },
    });

    if (error && !error.message.includes('already been registered')) {
      throw new Error(`Failed to create auth user ${user.email}: ${error.message}`);
    }
    console.log(`  ✓ ${user.email}`);
  }
}

async function seedPublicUsers() {
  console.log('Seeding public users...');
  const { error } = await supabase
    .from('users')
    .upsert(testUsers, { onConflict: 'id' });
  if (error) throw new Error(`Failed to seed users: ${error.message}`);
  console.log(`  ✓ ${testUsers.length} users`);
}

async function seedManagerDepartments() {
  console.log('Seeding manager departments...');
  const { error } = await supabase
    .from('manager_departments')
    .upsert(managerDepartments, { onConflict: 'id' });
  if (error) throw new Error(`Failed to seed manager_departments: ${error.message}`);
  console.log(`  ✓ ${managerDepartments.length} manager-department assignments`);
}

async function seedClients() {
  console.log('Seeding clients...');
  const { error } = await supabase
    .from('clients')
    .upsert(clients, { onConflict: 'id' });
  if (error) throw new Error(`Failed to seed clients: ${error.message}`);
  console.log(`  ✓ ${clients.length} clients`);
}

async function seedServices() {
  console.log('Seeding services...');
  const { error } = await supabase
    .from('services')
    .upsert(services, { onConflict: 'id' });
  if (error) throw new Error(`Failed to seed services: ${error.message}`);
  console.log(`  ✓ ${services.length} services`);
}

async function seedTasks() {
  console.log('Seeding tasks...');
  const { error } = await supabase
    .from('tasks')
    .upsert(tasks, { onConflict: 'id' });
  if (error) throw new Error(`Failed to seed tasks: ${error.message}`);
  console.log(`  ✓ ${tasks.length} tasks`);
}

async function seedProjects() {
  console.log('Seeding projects...');
  const { error } = await supabase
    .from('projects')
    .upsert(projects, { onConflict: 'id' });
  if (error) throw new Error(`Failed to seed projects: ${error.message}`);
  console.log(`  ✓ ${projects.length} projects`);
}

async function seedJobs() {
  console.log('Seeding jobs...');
  const { error } = await supabase
    .from('jobs')
    .upsert(jobs, { onConflict: 'id' });
  if (error) throw new Error(`Failed to seed jobs: ${error.message}`);
  console.log(`  ✓ ${jobs.length} jobs`);
}

async function seedTimeEntries() {
  console.log('Seeding time entries...');
  const today = new Date();

  const timeEntries = [
    { id: 'ae000001-0000-0000-0000-000000000001', user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', job_id: 'd0000001-0000-0000-0000-000000000001', service_id: '5e111111-1111-1111-1111-111111111111', task_id: 'fa222222-2222-2222-2222-222222222222', duration_minutes: 240, entry_date: formatDate(today), notes: 'Dubbing session EP1-2', department_id: '11111111-1111-1111-1111-111111111111' },
    { id: 'ae000002-0000-0000-0000-000000000002', user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', job_id: 'd0000001-0000-0000-0000-000000000002', service_id: '5e333333-3333-3333-3333-333333333333', task_id: 'fa333333-3333-3333-3333-333333333333', duration_minutes: 120, entry_date: formatDate(today), notes: 'QC review session', department_id: '11111111-1111-1111-1111-111111111111' },
    { id: 'ae000003-0000-0000-0000-000000000003', user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', job_id: 'd0000002-0000-0000-0000-000000000001', service_id: '5e222222-2222-2222-2222-222222222222', task_id: 'fa111111-1111-1111-1111-111111111111', duration_minutes: 180, entry_date: formatDate(addDays(today, -1)), notes: 'Subtitling prep work', department_id: '11111111-1111-1111-1111-111111111111' },
    { id: 'ae000004-0000-0000-0000-000000000004', user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', job_id: 'd0000003-0000-0000-0000-000000000001', service_id: '5e111111-1111-1111-1111-111111111111', task_id: 'fa222222-2222-2222-2222-222222222222', duration_minutes: 300, entry_date: formatDate(addDays(today, -1)), notes: 'HBO series dubbing', department_id: '11111111-1111-1111-1111-111111111111' },
    { id: 'ae000005-0000-0000-0000-000000000005', user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', job_id: 'd0000004-0000-0000-0000-000000000001', service_id: '5e444444-4444-4444-4444-444444444444', task_id: 'fa222222-2222-2222-2222-222222222222', duration_minutes: 420, entry_date: formatDate(addDays(today, -2)), notes: 'Full day recording session', department_id: '11111111-1111-1111-1111-111111111111' },
    { id: 'ae000006-0000-0000-0000-000000000006', user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', job_id: 'd0000005-0000-0000-0000-000000000001', service_id: '5e555555-5555-5555-5555-555555555555', task_id: 'fa222222-2222-2222-2222-222222222222', duration_minutes: 360, entry_date: formatDate(addDays(today, -3)), notes: 'Audio mixing work', department_id: '11111111-1111-1111-1111-111111111111' },
    { id: 'ae000007-0000-0000-0000-000000000007', user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', job_id: 'd0000006-0000-0000-0000-000000000001', service_id: '5e777777-7777-7777-7777-777777777777', task_id: 'fa111111-1111-1111-1111-111111111111', duration_minutes: 90, entry_date: formatDate(addDays(today, -3)), notes: 'Voice over prep', department_id: '11111111-1111-1111-1111-111111111111' },
    { id: 'ae000008-0000-0000-0000-000000000008', user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', job_id: 'd0000007-0000-0000-0000-000000000001', service_id: '5e111111-1111-1111-1111-111111111111', task_id: 'fa222222-2222-2222-2222-222222222222', duration_minutes: 480, entry_date: formatDate(addDays(today, -4)), notes: 'Anime dubbing full day', department_id: '11111111-1111-1111-1111-111111111111' },
    { id: 'ae000009-0000-0000-0000-000000000009', user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', job_id: 'd0000008-0000-0000-0000-000000000001', service_id: '5e888888-8888-8888-8888-888888888888', task_id: 'fa222222-2222-2222-2222-222222222222', duration_minutes: 240, entry_date: formatDate(addDays(today, -5)), notes: 'ADR session', department_id: '11111111-1111-1111-1111-111111111111' },
    { id: 'ae000010-0000-0000-0000-000000000010', user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', job_id: 'd0000009-0000-0000-0000-000000000001', service_id: '5e666666-6666-6666-6666-666666666666', task_id: 'fa111111-1111-1111-1111-111111111111', duration_minutes: 150, entry_date: formatDate(addDays(today, -5)), notes: 'Translation review', department_id: '11111111-1111-1111-1111-111111111111' },
    { id: 'ae000011-0000-0000-0000-000000000011', user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', job_id: 'd0000010-0000-0000-0000-000000000001', service_id: '5e777777-7777-7777-7777-777777777777', task_id: 'fa222222-2222-2222-2222-222222222222', duration_minutes: 300, entry_date: formatDate(addDays(today, -6)), notes: 'Corporate VO recording', department_id: '11111111-1111-1111-1111-111111111111' },
    { id: 'ae000012-0000-0000-0000-000000000012', user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', job_id: 'd0000011-0000-0000-0000-000000000001', service_id: '5e555555-5555-5555-5555-555555555555', task_id: 'fa333333-3333-3333-3333-333333333333', duration_minutes: 240, entry_date: formatDate(addDays(today, -7)), notes: 'Mix review session', department_id: '11111111-1111-1111-1111-111111111111' },
    { id: 'ae000013-0000-0000-0000-000000000013', user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', job_id: 'd0000012-0000-0000-0000-000000000001', service_id: '5e555555-5555-5555-5555-555555555555', task_id: 'fa222222-2222-2222-2222-222222222222', duration_minutes: 180, entry_date: formatDate(addDays(today, -7)), notes: 'Album mixing', department_id: '11111111-1111-1111-1111-111111111111' },
    { id: 'ae000014-0000-0000-0000-000000000014', user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', job_id: 'd0000013-0000-0000-0000-000000000001', service_id: '5e222222-2222-2222-2222-222222222222', task_id: 'fa222222-2222-2222-2222-222222222222', duration_minutes: 360, entry_date: formatDate(addDays(today, -8)), notes: 'K-drama subtitling', department_id: '11111111-1111-1111-1111-111111111111' },
    { id: 'ae000015-0000-0000-0000-000000000015', user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', job_id: 'd0000014-0000-0000-0000-000000000001', service_id: '5e222222-2222-2222-2222-222222222222', task_id: 'fa222222-2222-2222-2222-222222222222', duration_minutes: 420, entry_date: formatDate(addDays(today, -9)), notes: 'Anime subtitling', department_id: '11111111-1111-1111-1111-111111111111' },
    { id: 'ae000016-0000-0000-0000-000000000016', user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', job_id: 'd0000015-0000-0000-0000-000000000001', service_id: '5e111111-1111-1111-1111-111111111111', task_id: 'fa222222-2222-2222-2222-222222222222', duration_minutes: 480, entry_date: formatDate(addDays(today, -10)), notes: 'Hollywood movie dubbing', department_id: '11111111-1111-1111-1111-111111111111' },
    { id: 'ae000017-0000-0000-0000-000000000017', user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', job_id: 'd0000016-0000-0000-0000-000000000001', service_id: '5e111111-1111-1111-1111-111111111111', task_id: 'fa444444-4444-4444-4444-444444444444', duration_minutes: 120, entry_date: formatDate(addDays(today, -11)), notes: 'Cartoon dubbing revision', department_id: '11111111-1111-1111-1111-111111111111' },
    { id: 'ae000018-0000-0000-0000-000000000018', user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', job_id: 'd0000017-0000-0000-0000-000000000001', service_id: '5e666666-6666-6666-6666-666666666666', task_id: 'fa222222-2222-2222-2222-222222222222', duration_minutes: 300, entry_date: formatDate(addDays(today, -12)), notes: 'Manual translation', department_id: '11111111-1111-1111-1111-111111111111' },
    { id: 'ae000019-0000-0000-0000-000000000019', user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', job_id: 'd0000018-0000-0000-0000-000000000001', service_id: '5e666666-6666-6666-6666-666666666666', task_id: 'fa222222-2222-2222-2222-222222222222', duration_minutes: 240, entry_date: formatDate(addDays(today, -13)), notes: 'Website localization', department_id: '11111111-1111-1111-1111-111111111111' },
    { id: 'ae000020-0000-0000-0000-000000000020', user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', job_id: 'd0000019-0000-0000-0000-000000000001', service_id: '5e333333-3333-3333-3333-333333333333', task_id: 'fa333333-3333-3333-3333-333333333333', duration_minutes: 180, entry_date: formatDate(addDays(today, -14)), notes: 'TV series QC', department_id: '11111111-1111-1111-1111-111111111111' },
  ];

  const { error } = await supabase
    .from('time_entries')
    .upsert(timeEntries, { onConflict: 'id' });
  if (error) throw new Error(`Failed to seed time_entries: ${error.message}`);
  console.log(`  ✓ ${timeEntries.length} time entries`);
}

async function seedRecentCombinations() {
  console.log('Seeding recent combinations...');
  const now = new Date();

  const recentCombinations = [
    { id: 'ec000001-0000-0000-0000-000000000001', user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', client_id: 'ca111111-1111-1111-1111-111111111111', project_id: 'b1111111-1111-1111-1111-111111111111', job_id: 'd0000001-0000-0000-0000-000000000001', service_id: '5e111111-1111-1111-1111-111111111111', task_id: 'fa222222-2222-2222-2222-222222222222', last_used_at: now.toISOString() },
    { id: 'ec000002-0000-0000-0000-000000000002', user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', client_id: 'ca111111-1111-1111-1111-111111111111', project_id: 'b1111111-1111-1111-1111-111111111111', job_id: 'd0000001-0000-0000-0000-000000000002', service_id: '5e333333-3333-3333-3333-333333333333', task_id: 'fa333333-3333-3333-3333-333333333333', last_used_at: addHours(now, -1).toISOString() },
    { id: 'ec000003-0000-0000-0000-000000000003', user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', client_id: 'ca111111-1111-1111-1111-111111111111', project_id: 'b1111111-1111-1111-1111-222222222222', job_id: 'd0000002-0000-0000-0000-000000000001', service_id: '5e222222-2222-2222-2222-222222222222', task_id: 'fa111111-1111-1111-1111-111111111111', last_used_at: addHours(now, -2).toISOString() },
    { id: 'ec000004-0000-0000-0000-000000000004', user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', client_id: 'ca222222-2222-2222-2222-222222222222', project_id: 'b2222222-2222-2222-2222-111111111111', job_id: 'd0000003-0000-0000-0000-000000000001', service_id: '5e111111-1111-1111-1111-111111111111', task_id: 'fa222222-2222-2222-2222-222222222222', last_used_at: addHours(now, -3).toISOString() },
    { id: 'ec000005-0000-0000-0000-000000000005', user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', client_id: 'ca222222-2222-2222-2222-222222222222', project_id: 'b2222222-2222-2222-2222-222222222222', job_id: 'd0000004-0000-0000-0000-000000000001', service_id: '5e444444-4444-4444-4444-444444444444', task_id: 'fa222222-2222-2222-2222-222222222222', last_used_at: addHours(now, -4).toISOString() },
  ];

  const { error } = await supabase
    .from('user_recent_combinations')
    .upsert(recentCombinations, { onConflict: 'id' });
  if (error) throw new Error(`Failed to seed user_recent_combinations: ${error.message}`);
  console.log(`  ✓ ${recentCombinations.length} recent combinations`);
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

// =============================================================================
// VERIFICATION
// =============================================================================

async function verifyCounts() {
  console.log('\n--- Verification ---');

  const tables = [
    'departments',
    'users',
    'clients',
    'projects',
    'jobs',
    'services',
    'tasks',
    'time_entries',
    'manager_departments',
    'user_recent_combinations',
  ];

  const expected: Record<string, number> = {
    departments: 3,
    users: 4,
    clients: 10,
    projects: 20,
    jobs: 50,
    services: 8,
    tasks: 10,
    time_entries: 20,
    manager_departments: 2,
    user_recent_combinations: 5,
  };

  let allPassed = true;
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`  ✗ ${table}: ERROR - ${error.message}`);
      allPassed = false;
      continue;
    }

    const pass = count !== null && count >= expected[table];
    const symbol = pass ? '✓' : '✗';
    console.log(`  ${symbol} ${table}: ${count} (expected: >= ${expected[table]})`);
    if (!pass) allPassed = false;
  }

  return allPassed;
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('===========================================');
  console.log('  Timelog Development Seed');
  console.log('===========================================\n');

  try {
    // Order matters due to foreign key constraints
    await seedDepartments();
    await seedAuthUsers();
    await seedPublicUsers();
    await seedManagerDepartments();
    await seedClients();
    await seedServices();
    await seedTasks();
    await seedProjects();
    await seedJobs();
    await seedTimeEntries();
    await seedRecentCombinations();

    const allPassed = await verifyCounts();

    console.log('\n===========================================');
    if (allPassed) {
      console.log('  Seed completed successfully!');
    } else {
      console.log('  Seed completed with warnings.');
    }
    console.log('===========================================\n');

    console.log('Test User Credentials:');
    console.log('| Email              | Password    | Role        |');
    console.log('|--------------------|-------------|-------------|');
    for (const user of testUsers) {
      console.log(`| ${user.email.padEnd(18)} | ${TEST_PASSWORD.padEnd(11)} | ${user.role.padEnd(11)} |`);
    }
    console.log('');

  } catch (error) {
    console.error('\n✗ Seed failed:', error);
    process.exit(1);
  }
}

main();
