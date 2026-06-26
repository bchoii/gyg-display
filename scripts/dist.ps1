$Pem = "$PSScriptRoot\pem\LightsailDefaultKeyPair.pem"
$Domain = '54.254.236.248'

# clear local dist
Remove-Item -Path "$PSScriptRoot\..\dist" -Recurse -Force
New-Item -Path "$PSScriptRoot\..\dist" -ItemType Directory

# clear remote.
ssh -o "StrictHostKeyChecking no" -i $Pem ubuntu@$Domain "sudo rm -rf ./printer-host"

# full dist
xcopy ..\webapp\* "$PSScriptRoot\..\dist\webapp" /s /i /exclude:"$PSScriptRoot\dist.xcopy.exclude"
xcopy ..\printer-host\* "$PSScriptRoot\..\dist\printer-host" /s /i /exclude:"$PSScriptRoot\dist.xcopy.exclude"
xcopy ..\echo\* "$PSScriptRoot\..\dist\echo" /s /i /exclude:"$PSScriptRoot\dist.xcopy.exclude"
xcopy ..\caddy\* "$PSScriptRoot\..\dist\caddy" /s /i /exclude:"$PSScriptRoot\dist.xcopy.exclude"
xcopy ..\docker\* "$PSScriptRoot\..\dist\docker" /s /i /exclude:"$PSScriptRoot\dist.xcopy.exclude"
xcopy ..\srv\* "$PSScriptRoot\..\dist\srv" /s /i /exclude:"$PSScriptRoot\dist.xcopy.exclude"

# upload
scp -i $Pem -r "$PSScriptRoot\..\dist\*" ubuntu@${Domain}:/home/ubuntu

# docker down
# ssh -i $Pem ubuntu@$Domain "cd docker && docker compose down --remove-orphans"
# ssh -i $Pem ubuntu@$Domain "cd docker && docker compose down client --remove-orphans"
# ssh -i $Pem ubuntu@$Domain "cd docker && docker volume rm hello"

# clear diskspace
ssh -i $Pem ubuntu@$Domain "docker system prune -a -f --filter until=10m"
ssh -i $Pem ubuntu@$Domain "docker system prune -a -f --volumes"
ssh -i $Pem ubuntu@$Domain "docker image prune -a -f"
ssh -i $Pem ubuntu@$Domain "docker volume rm `$(docker volume ls -qf dangling=true)"

# docker up
ssh -i $Pem ubuntu@$Domain "cd docker && docker compose up webapp --detach --build --force-recreate"
# ssh -i $Pem ubuntu@$Domain "cd docker && docker compose up printer-host --detach --build --force-recreate"
# ssh -i $Pem ubuntu@$Domain "cd docker && docker compose up echo --detach --build --force-recreate"
# ssh -i $Pem ubuntu@$Domain "cd docker && docker compose up dozzle --detach --build --force-recreate"
# ssh -i $Pem ubuntu@$Domain "cd docker && docker compose up whoami --detach --build --force-recreate"
# ssh -i $Pem ubuntu@$Domain "cd docker && docker compose up caddy --detach --build --force-recreate"
ssh -i $Pem ubuntu@$Domain "docker exec -w /etc/caddy caddy caddy reload"

Start-Process chrome "--profile-directory=Default https://printer.$Domain.sslip.io"
# Start-Process chrome "--profile-directory=Default https://echo.$Domain.sslip.io"
Start-Process chrome "--profile-directory=Default https://dozzle.$Domain.sslip.io"
# Start-Process chrome "--profile-directory=Default https://whoami.$Domain.sslip.io"
# Start-Process chrome "--profile-directory=Default https://ip.$Domain.sslip.io"
# Start-Process chrome "--incognito http://$Domain"
