$headers = @{
    "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicG14YmlidXV3Y3FiaGhzamxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNTI5NTQsImV4cCI6MjA4NzgyODk1NH0.kqPGLAwsdHO3ISiNeMk9_xFHNPstUg4FHmmmeCWhSns"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFicG14YmlidXV3Y3FiaGhzamxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNTI5NTQsImV4cCI6MjA4NzgyODk1NH0.kqPGLAwsdHO3ISiNeMk9_xFHNPstUg4FHmmmeCWhSns"
}
try {
    $response = Invoke-RestMethod -Uri "https://abpmxbibuuwcqbhhsjlo.supabase.co/rest/v1/activities?select=id,title,additional_fields,status" -Headers $headers
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: $_"
}
