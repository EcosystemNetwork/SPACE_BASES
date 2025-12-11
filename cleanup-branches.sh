#!/bin/bash

# Branch Cleanup Script for EcosystemNetwork/SPACE_BASES
# This script deletes merged feature branches that are no longer needed

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
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
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
  if git push origin --delete "$branch" 2>/dev/null; then
    echo "  ✅ Deleted successfully"
    ((success_count++))
  else
    echo "  ⚠️  Could not delete (may not exist or already deleted)"
    ((skip_count++))
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
