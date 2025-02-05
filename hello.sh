#!/bin/bash

OLD_HASH=5dc0468f4e440b16f926163d97a22d091fff4b14
NEW_HASH=80926ed1dc9910cc0bb2720f18cc2215871a4738

# Get the list of changed files
CHANGED_FILES=$(git diff --name-only $OLD_HASH $NEW_HASH)

# Initialize variables to track changes
SERVICE1_CHANGED=false
SERVICE2_CHANGED=false
SERVICE3_CHANGED=false
WEB_CHANGED=false

# Check which services have changed
for file in $CHANGED_FILES; do
  if [[ $file == services/service1/* ]]; then
    SERVICE1_CHANGED=true
  elif [[ $file == services/service2/* ]]; then
    SERVICE2_CHANGED=true
  elif [[ $file == services/service3/* ]]; then
    SERVICE3_CHANGED=true
  elif [[ $file == web/* ]]; then
    WEB_CHANGED=true
  fi
done

# Output the results
echo "Service 1 changed: $SERVICE1_CHANGED"
echo "Service 2 changed: $SERVICE2_CHANGED"
echo "Service 3 changed: $SERVICE3_CHANGED"
echo "Web project changed: $WEB_CHANGED"