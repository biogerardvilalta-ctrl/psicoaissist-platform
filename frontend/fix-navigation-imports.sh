#!/bin/bash

# Script to fix all navigation imports to use i18n-aware versions

# Files that need useRouter from @/navigation and useSearchParams from next/navigation
FILES_WITH_BOTH=(
  "/home/ustec/dockers/lamp/www/psicoaissist-platform/frontend/src/app/[locale]/dashboard/sessions/new/page.tsx"
  "/home/ustec/dockers/lamp/www/psicoaissist-platform/frontend/src/app/[locale]/dashboard/sessions/page.tsx"
  "/home/ustec/dockers/lamp/www/psicoaissist-platform/frontend/src/app/[locale]/dashboard/sessions/[id]/page.tsx"
  "/home/ustec/dockers/lamp/www/psicoaissist-platform/frontend/src/app/[locale]/dashboard/clients/new/page.tsx"
  "/home/ustec/dockers/lamp/www/psicoaissist-platform/frontend/src/app/[locale]/dashboard/clients/[id]/page.tsx"
  "/home/ustec/dockers/lamp/www/psicoaissist-platform/frontend/src/app/[locale]/dashboard/clients/[id]/edit/page.tsx"
  "/home/ustec/dockers/lamp/www/psicoaissist-platform/frontend/src/app/[locale]/dashboard/compliance/page.tsx"
  "/home/ustec/dockers/lamp/www/psicoaissist-platform/frontend/src/app/[locale]/dashboard/settings/page.tsx"
  "/home/ustec/dockers/lamp/www/psicoaissist-platform/frontend/src/app/[locale]/dashboard/reports/new/page.tsx"
  "/home/ustec/dockers/lamp/www/psicoaissist-platform/frontend/src/app/[locale]/auth/login/page.tsx"
  "/home/ustec/dockers/lamp/www/psicoaissist-platform/frontend/src/app/[locale]/auth/register/page.tsx"
  "/home/ustec/dockers/lamp/www/psicoaissist-platform/frontend/src/app/[locale]/auth/verify-email/page.tsx"
  "/home/ustec/dockers/lamp/www/psicoaissist-platform/frontend/src/app/[locale]/auth/complete-profile/page.tsx"
  "/home/ustec/dockers/lamp/www/psicoaissist-platform/frontend/src/app/[locale]/legal/page.tsx"
)

# Files that need only useRouter from @/navigation
FILES_WITH_ROUTER_ONLY=(
  "/home/ustec/dockers/lamp/www/psicoaissist-platform/frontend/src/app/[locale]/dashboard/sessions/[id]/video/page.tsx"
  "/home/ustec/dockers/lamp/www/psicoaissist-platform/frontend/src/app/[locale]/dashboard/activity/page.tsx"
  "/home/ustec/dockers/lamp/www/psicoaissist-platform/frontend/src/app/[locale]/admin/page.tsx"
  "/home/ustec/dockers/lamp/www/psicoaissist-platform/frontend/src/app/[locale]/privacy/page.tsx"
)

# Files that need only useSearchParams from next/navigation (keep as is)
FILES_WITH_SEARCHPARAMS_ONLY=(
  "/home/ustec/dockers/lamp/www/psicoaissist-platform/frontend/src/app/[locale]/payment/success/page.tsx"
  "/home/ustec/dockers/lamp/www/psicoaissist-platform/frontend/src/app/[locale]/admin/users/page.tsx"
)

# Files with useParams (need special handling)
FILES_WITH_PARAMS=(
  "/home/ustec/dockers/lamp/www/psicoaissist-platform/frontend/src/app/[locale]/admin/users/[id]/page.tsx"
)

echo "Fixing files with both useRouter and useSearchParams..."
for file in "${FILES_WITH_BOTH[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    sed -i "s|import { useRouter, useSearchParams } from 'next/navigation';|import { useRouter } from '@/navigation';\nimport { useSearchParams } from 'next/navigation';|g" "$file"
    sed -i "s|import { useSearchParams, useRouter } from 'next/navigation';|import { useRouter } from '@/navigation';\nimport { useSearchParams } from 'next/navigation';|g" "$file"
  fi
done

echo "Fixing files with only useRouter..."
for file in "${FILES_WITH_ROUTER_ONLY[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    sed -i "s|import { useRouter } from 'next/navigation';|import { useRouter } from '@/navigation';|g" "$file"
  fi
done

echo "Files with only useSearchParams are already correct (no changes needed)"

echo "Fixing files with useParams and useRouter..."
for file in "${FILES_WITH_PARAMS[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    sed -i "s|import { useParams, useRouter } from 'next/navigation';|import { useRouter } from '@/navigation';\nimport { useParams } from 'next/navigation';|g" "$file"
  fi
done

echo "Done! All navigation imports have been fixed."
