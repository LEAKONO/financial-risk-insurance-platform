#!/bin/bash
find src/components -name "*.jsx" -type f | while read file; do
  component=$(basename "$file" .jsx)
  if [ "$component" != "index" ]; then
    sed -i "/^export { $component }$/d" "$file"
    sed -i "s/^export default $component$/export { $component }\nexport default $component/" "$file"
  fi
done
echo "All exports fixed!"
