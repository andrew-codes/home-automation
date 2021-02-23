Add-Type @"
  using System;
  using System.Runtime.InteropServices;
  public class Tricks {
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
}
"@

$gameWindow = [tricks]::GetForegroundWindow()
Get-Process | ? { $_.mainwindowhandle -eq $gameWindow } | Stop-Process