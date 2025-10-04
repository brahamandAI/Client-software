# Stop if any error
$ErrorActionPreference = "Stop"

Write-Host "Step 1: Cleaning Flutter and Gradle caches..."
flutter clean

# Delete Gradle cache
$gradleCache = "$env:USERPROFILE\.gradle\caches"
if (Test-Path $gradleCache) {
    Remove-Item $gradleCache -Recurse -Force
    Write-Host "Gradle cache deleted."
} else {
    Write-Host "No Gradle cache found."
}

# Clean Android Gradle build
cd .\android
.\gradlew clean
cd ..

Write-Host "Step 2: Getting Flutter dependencies..."
flutter pub get

Write-Host "Step 3: Building APK (Release)..."
flutter build apk --release

Write-Host "✅ Build complete! APK generated in build\app\outputs\flutter-apk\"
