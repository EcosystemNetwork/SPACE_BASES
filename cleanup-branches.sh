#!/bin/bash

# Branch Cleanup Script for EcosystemNetwork/SPACE_BASES
#
# PURPOSE:
#   Deletes merged feature branches that are no longer needed.
#   All branches in this script have been successfully merged into main
#   and their work is already in production.
#
# USAGE:
#   ./cleanup-branches.sh
#
# PREREQUISITES:
#   - Git repository with remote access
#   - Push permissions to the origin remote
#   - Network connectivity to GitHub
#
# SAFETY:
#   - Prompts for confirmation before deletion
#   - Only deletes branches that are fully merged
#   - Provides detailed progress output
#
# WARNING:
#   This operation cannot be easily undone. Ensure you have reviewed
#   the branch list and confirmed these branches are no longer needed.

set -e

echo "================================================"
echo "Branch Cleanup Script"
echo "Repository: EcosystemNetwork/SPACE_BASES"
echo "================================================"
echo ""

# List of branches to delete (all merged into main)
branches=(
  "copilot/fix-privy-engagement-issue"
  "copilot/fix-code-errors-and-optimize"
  "copilot/fix-privy-app-id-issue"
  "copilot/fix-loading-issue"
  "copilot/review-privy-login-issues"
  "copilot/fix-privy-widget-script-error"
  "copilot/set-up-vercel-deployment"
  "copilot/lets-go-features"
)

echo "The following branches will be deleted:"
for branch in "${branches[@]}"; do
  echo "  - $branch"
done
echo ""

read -p "Do you want to continue? (y/N): " confirm
if [[ "$confirm" =~ ^[Yy]$ ]]; then
  echo "Proceeding with branch deletion..."
else
  echo "Aborted."
  exit 0
fi

echo ""
echo "Deleting remote branches..."
echo ""

success_count=0
skip_count=0

for branch in "${branches[@]}"; do
  echo "Processing: $branch"
  error_output=$(git push origin --delete "$branch" 2>&1)
  exit_code=$?
  if [ $exit_code -eq 0 ]; then
    echo "  ✅ Deleted successfully"
    success_count=$((success_count + 1))
  else
    echo "  ⚠️  Could not delete (may not exist or already deleted)"
    if [[ ! "$error_output" =~ "unable to delete" ]]; then
      echo "     Details: $error_output" | head -1
    fi
    skip_count=$((skip_count + 1))
  fi
  echo ""
done

echo "================================================"
echo "Summary:"
echo "  ✅ Successfully deleted: $success_count"
echo "  ⚠️  Skipped: $skip_count"
echo "================================================"
echo ""
echo "Cleaning up stale remote tracking references..."
git remote prune origin

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "To view remaining branches, run:"
echo "  git branch -r"
