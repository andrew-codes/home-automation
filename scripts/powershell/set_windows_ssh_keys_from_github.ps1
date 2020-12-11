# DO the following in powerhsell if not already done:
# Set-ExecutionPolicy RemoteSigned

$GitHubUserName=""

# ====================
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
(Invoke-WebRequest "https://github.com/$GitHubUserName.keys").Content | Out-File -FilePath "C:\ProgramData\ssh\administrators_authorized_keys"
$acl = Get-Acl C:\ProgramData\ssh\administrators_authorized_keys
$acl.SetAccessRuleProtection($true, $false)
$administratorsRule = New-Object system.security.accesscontrol.filesystemaccessrule("Administrators","FullControl","Allow")
$systemRule = New-Object system.security.accesscontrol.filesystemaccessrule("SYSTEM","FullControl","Allow")
$acl.SetAccessRule($administratorsRule)
$acl.SetAccessRule($systemRule)
$acl | Set-Acl