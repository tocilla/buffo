# Daytona Cost Optimization & File Persistence TODO

## Problem Statement
- Daytona instances remain running indefinitely after agent tasks complete
- This leads to unnecessary compute costs
- However, destroying instances breaks file links and loses user-generated files
- Need to balance cost optimization with user experience

## Current Architecture Issues
- 1 Project = 1 Daytona Instance (persistent until manually cleaned)
- Files (PDFs, Excel, scripts, uploads) stored only in sandbox filesystem
- No automatic cleanup mechanism
- Broken file links when sandboxes are archived/destroyed
- **CRITICAL**: `deleteProject` is almost never called - users can only delete threads through UI
- **CRITICAL**: When users "delete" conversations, only threads are deleted, projects and Daytona sandboxes remain running forever
- **CRITICAL**: No UI interface exists for users to delete projects/sandboxes

## Missing UI Functionality
- **Project deletion**: Users cannot delete projects through the interface
- **Sandbox management**: No way for users to stop/start their own sandboxes
- **Cost visibility**: Users don't see their running sandbox costs
- **Project ID source**: `getProject(projectId)` gets project data, but project IDs come from:
  - URL params in `/projects/[projectId]/thread/[threadId]` routes
  - Thread data (`thread.project_id` field)
  - Project listings from `getProjects()` or `getThreads()`

## Proposed Solutions

### 🎯 Solution 1: File Backup + Automatic Cleanup (Recommended)

**Implementation Plan:**
1. **Before destroying sandbox:**
   - Scan `/workspace` directory for all user files
   - Upload files to S3/cloud storage with project-specific path structure
   - Store file metadata in database (original paths, S3 keys, file types, timestamps)

2. **Automatic cleanup workflow:**
   - Schedule daily cleanup job for sandboxes older than 24-48 hours
   - Before archiving: trigger file backup process
   - Archive/destroy sandbox after successful backup
   - Update project status to indicate "files archived"

3. **Workspace restoration:**
   - When user returns to project, detect if sandbox is destroyed
   - Create new Daytona instance
   - Download and restore files from S3 to original paths
   - User can continue working seamlessly

**Files to create/modify:**
- `backend/services/file_backup.py` - S3 backup/restore logic
- `backend/utils/scripts/cleanup_with_backup.py` - Enhanced cleanup script
- `backend/sandbox/restoration.py` - Workspace restoration logic
- Database migration for file metadata table

---

### 🎯 Solution 2: Hibernate/Wake Pattern

**Implementation Plan:**
1. **Sandbox hibernation:**
   - Stop (don't destroy) sandbox after 24 hours of inactivity
   - Keep sandbox in "stopped" state (cheaper than running, but NOT free)
   - **IMPORTANT**: Stopped instances still incur storage, disk, and infrastructure costs
   - Files remain intact in stopped sandbox

2. **Auto-wake on access:**
   - Detect when user returns to project
   - Automatically start the stopped sandbox
   - User experience: slight delay on first access

3. **Periodic full cleanup:**
   - Archive sandboxes stopped for >7 days
   - Implement file backup before final archival

**Benefits:**
- Significantly lower cost than keeping running (no compute charges)
- Faster restoration than full backup/restore
- Files preserved during hibernation period

**Cost Reality Check:**
- **Running**: Full compute + storage costs
- **Stopped**: Storage + infrastructure costs only (still 20-40% of running cost)
- **Destroyed**: Zero cost but files lost without backup

---

### 🎯 Solution 3: Smart Activity Detection

**Implementation Plan:**
1. **Activity monitoring:**
   - Track last agent run completion time
   - Monitor file system changes in `/workspace`
   - Detect user interactions (VNC access, file downloads)

2. **Graduated shutdown:**
   - Mark sandbox for cleanup after 2 hours of inactivity
   - Send user notification email before cleanup
   - Grace period for user to extend sandbox lifetime

3. **File preservation:**
   - Always backup files before any cleanup
   - Provide download links for critical files
   - Store file manifests for easy restoration

---

### 🎯 Solution 4: Project-Level File Management

**Implementation Plan:**
1. **Persistent file storage:**
   - Create dedicated S3 bucket per project
   - Sync `/workspace` to S3 in real-time or on file changes
   - Use S3 as primary storage, sandbox as temporary workspace

2. **Stateless sandboxes:**
   - Treat sandboxes as ephemeral compute environments
   - Always restore files from S3 when creating new sandbox
   - Destroy sandboxes immediately after agent run completion

3. **File versioning:**
   - Keep version history of important files
   - Allow users to restore previous versions
   - Implement file conflict resolution

---

## 🛠 Implementation Priority

### Phase 1 (Immediate - 1-2 weeks)
- [ ] Implement basic file scanning and S3 backup
- [ ] Create enhanced cleanup script with backup
- [ ] Add file metadata table to database
- [ ] Test backup/restore workflow

### Phase 2 (Short-term - 2-4 weeks)
- [ ] Implement automatic restoration on project access
- [ ] Add user notifications for sandbox cleanup
- [ ] Create file download/preview endpoints
- [ ] Monitor cost savings and user experience

### Phase 3 (Medium-term - 1-2 months)
- [ ] Implement hibernation patterns
- [ ] Add real-time file syncing
- [ ] Create file versioning system
- [ ] Advanced activity detection

## 📋 Technical Requirements

### Database Schema Changes
```sql
-- File metadata table
CREATE TABLE project_files (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(project_id),
    original_path TEXT NOT NULL,
    s3_key TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT,
    content_type TEXT,
    checksum TEXT,
    created_at TIMESTAMP,
    last_modified TIMESTAMP,
    is_user_uploaded BOOLEAN DEFAULT FALSE
);

-- Sandbox lifecycle tracking
ALTER TABLE projects ADD COLUMN sandbox_status TEXT DEFAULT 'active';
ALTER TABLE projects ADD COLUMN last_activity_at TIMESTAMP;
ALTER TABLE projects ADD COLUMN files_backup_status TEXT DEFAULT 'none';
```

### S3 Storage Structure
```
/project-files/
  /{project_id}/
    /workspace/
      /{original_file_path}
    /metadata/
      /file_manifest.json
    /versions/
      /{timestamp}/
```

### Configuration
- S3 bucket for file storage
- Cleanup schedule configuration
- File size limits and retention policies
- Cost monitoring and alerting

## 🔍 Monitoring & Metrics

### Cost Tracking
- [ ] Monitor Daytona instance hours before/after optimization
- [ ] Track S3 storage costs vs compute savings
- [ ] Calculate ROI of optimization efforts

### User Experience
- [ ] Measure file restoration success rate
- [ ] Track user satisfaction with file persistence
- [ ] Monitor workspace recreation times

### System Health
- [ ] Backup success/failure rates
- [ ] Storage usage trends
- [ ] Cleanup job performance

## 🚨 Risk Mitigation

### Data Loss Prevention
- [ ] Multi-region S3 replication for critical files
- [ ] Backup validation and integrity checks
- [ ] Rollback procedures for failed cleanups

### User Communication
- [ ] Clear notifications about file preservation
- [ ] Documentation on file persistence behavior
- [ ] Support procedures for file recovery

### Gradual Rollout
- [ ] Test with internal projects first
- [ ] Opt-in beta for selected users
- [ ] Gradual increase in cleanup aggressiveness

## 📊 Success Metrics

### Cost Optimization
- **Target:** 60-80% reduction in Daytona compute costs
- **Measure:** Monthly instance hours before vs after

### User Experience
- **Target:** <30 seconds workspace restoration time
- **Target:** 99.9% file preservation success rate
- **Measure:** User satisfaction surveys

### System Reliability
- **Target:** 99.95% backup success rate
- **Target:** Zero data loss incidents
- **Measure:** Automated monitoring and alerts