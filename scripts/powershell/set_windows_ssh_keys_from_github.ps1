# DO the following in powerhsell if not already done:
# Set-ExecutionPolicy RemoteSigned

$GitHubUserName=""
(Invoke-WebRequest "https://github.com/$GitHubUserName.keys").Content | Out-File -FilePath "$env:userprofile\.ssh\authorized_keys"

# NOTE: edit the path in this command if needed
$sshFiles=Get-ChildItem -Path "$env:userprofile\.ssh\authorized_keys" -Force

$sshFiles | % {
  $key = $_
  & icacls $key /c /t /inheritance:d
  & icacls $key /c /t /grant  "${echo $env:username}":F
  & icacls $key /c /t /remove Administrator "Authenticated Users" BUILTIN\Administrators BUILTIN Everyone System Users
}

# Verify:
$sshFiles | % {
  icacls $_
}