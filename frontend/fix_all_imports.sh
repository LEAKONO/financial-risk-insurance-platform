#!/bin/bash

echo "Fixing imports in all JS/JSX files..."

find src -type f \( -name "*.js" -o -name "*.jsx" \) | while read file; do
    # Get the relative path depth
    dir=$(dirname "$file")
    rel_to_src="${dir#src/}"
    
    # Count how many levels deep
    depth=$(echo "$rel_to_src" | tr -cd '/' | wc -c)
    
    # Determine the correct relative path to services/api
    if [[ $depth -ge 2 ]]; then
        # For deep components (like admin components), need ../../../services/api
        correct_path=$(printf '../%.0s' $(seq 1 $((depth))))"services/api"
    else
        # For shallow components, need ../../services/api
        correct_path="../../services/api"
    fi
    
    # Fix the import in the file
    sed -i "s/from ['\"][^'\"]*services\/api['\"]/from '$correct_path'/g" "$file"
    sed -i "s/from ['\"][^'\"]*services\/api\.js['\"]/from '$correct_path'/g" "$file"
    
    echo "Fixed $file to use '$correct_path'"
done

echo "Done!"
