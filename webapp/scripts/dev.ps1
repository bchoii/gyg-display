netstat -ano | % {$a = $_ -split ' {3,}'; New-Object 'PSObject' -Property @{Original=$_;Fields=$a}} | ? {$_.Fields[3] -match 'LISTENING'} | ? {$_.Fields[1] -match ':5173$'} | % {taskkill /F /PID $_.Fields[4] }
Start-Process chrome "--profile-directory=Default http://localhost:5173"
# Set-Location $PSScriptRoot/..
npm run dev
