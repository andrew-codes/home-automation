Add-Type -Path "C:\lib\M2Mqtt.4.3.0.0\lib\net45\M2Mqtt.Net.dll"
. secrets.ps1

$MqttClient = [uPLibrary.Networking.M2Mqtt.MqttClient]($MQTT_HOST)

function global:OnApplicationStarted()
{
    $MqttClient.Connect([guid]::NewGuid(), $MQTT_USERNAME, $MQTT_PASSWORD)
    $MqttClient.Publish("/playnite/birth", [System.Text.Encoding]::UTF8.GetBytes(""), 2, 0)
}

function global:OnApplicationStopped()
{
    $MqttClient.Disconnect()
}

function global:OnLibraryUpdated()
{
    $gamesPayload = $PlayniteApi.Database.Games | ConvertTo-Json -Compress
    $PlayniteApi.Dialogs.ShowMessage($gamesPayload)
    $MqttClient.Publish("/playnite/game/list", [System.Text.Encoding]::UTF8.GetBytes($gamesPayload), 2, 0)
}

function global:OnGameStarting()
{
    param(
        $game
    )
}

function global:OnGameStarted()
{
    param(
        $game
    )
}

function global:OnGameStopped()
{
    param(
        $game,
        $elapsedSeconds
    )
}

function global:OnGameInstalled()
{
    param(
        $game
    )     
}

function global:OnGameUninstalled()
{
    param(
        $game
    )    
}

function global:OnGameSelected()
{
    param(
        $selection
    )    
}