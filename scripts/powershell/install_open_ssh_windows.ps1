# DO the following in powerhsell if not already done:
# Set-ExecutionPolicy RemoteSigned

Install-Module -Force OpenSSHUtils -Scope AllUsers

# By default the ssh-agent service is disabled. Allow it to be manually started for the next step to work.
Get-Service -Name ssh-agent | Set-Service -StartupType Automatic

# Start the ssh-agent service to preserve the server keys
Start-Service ssh-agent

# Now start the sshd service
Start-Service sshd