$Pem = "$PSScriptRoot\pem\LightsailDefaultKeyPair.pem"
$Domain = '54.254.236.248'

(Get-Content "/Users/bchoi/.ssh/known_hosts" | Where-Object { $_ -NotMatch "^$Domain" }) | Set-Content "/Users/bchoi/.ssh/known_hosts"
ssh -o "StrictHostKeyChecking no" -i $Pem ubuntu@$Domain

<#
sudo apt update
sudo apt upgrade -y

# init docker
# https://docs.docker.com/engine/install/ubuntu/
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
rm get-docker.sh
sudo usermod -aG docker $USER
sudo reboot
exit

docker exec -it hono sh
docker exec -it drive sh
docker exec -it caddy sh
docker exec -it client sh
docker exec -it webapp sh
docker run -it webapp /bin/bash
ls
#>





