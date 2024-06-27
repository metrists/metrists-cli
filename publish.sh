#!/bin/bash

# Function to display usage
usage() {
  echo "Usage: $0 {patch|minor|major}"
  exit 1
}

# Check if a parameter is provided
if [ -z "$1" ]; then
  usage
fi

VERSION_TYPE=$1

# Check if the parameter is valid
if [[ "$VERSION_TYPE" != "patch" && "$VERSION_TYPE" != "minor" && "$VERSION_TYPE" != "major" ]]; then
  usage
fi

mkdir -p themes

# Clone the theme in the themes/ directory
git clone git@github.com:metrists/metrists-theme-next.git themes/metrists-theme-next

rm -rf themes/metrists-theme-next/.git

# Build the project
npm run build

# Copy the raw files in the build
cp -R themes dist

# Update the version using npm
# npm version $VERSION_TYPE

# # Get the new version
# NEW_VERSION=$(npm pkg get version | tr -d '"')

# # Push the changes to github
# git push

# # Tag the commit with the version name and push it
# git tag v$NEW_VERSION
# git push origin v$NEW_VERSION

# # Publish the package
# npm publish
