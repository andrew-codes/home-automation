$__logger.Info("Starting script")
Add-Type -Path "C:\lib\M2Mqtt.4.3.0.0\lib\\net45\M2Mqtt.Net.dll"

$MqttClient = New-Object -Type uPLibrary.Networking.M2Mqtt.MqttClient -ArgumentList ($MQTT_HOST, $MQTT_PORT, $FALSE, $null, $null, [uPLibrary.Networking.M2Mqtt.MqttSslProtocols]::None)
$MqttClient.Connect([guid]::NewGuid(), $MQTT_USERNAME, $MQTT_PASSWORD)

function global:OnApplicationStarted()
{
    $__logger.Info("Starting app and connecting to MQTT")
    $MqttClient.Publish("/playnite/birth", [System.Text.Encoding]::UTF8.GetBytes(""), 2, 0)
}

function global:OnApplicationStopped()
{
}

function global:OnLibraryUpdated()
{
    PublishLibrary
}

function global:OnGameStarting()
{
    param(
        $game
    )

    $MqttClient.Publish("/playnite/game/starting", [System.Text.Encoding]::UTF8.GetBytes($game.Id.toString()), 2, 0)
}

function global:OnGameStarted()
{
    param(
        $game
    )
    $MqttClient.Publish("/playnite/game/started", [System.Text.Encoding]::UTF8.GetBytes($game.Id.toString()), 2, 0)
}

function global:OnGameStopped()
{
    param(
        $game,
        $elapsedSeconds
    )

    $MqttClient.Publish("/playnite/game/stopped", [System.Text.Encoding]::UTF8.GetBytes($game.Id.toString()), 2, 0)
}

function global:OnGameInstalled()
{
    param(
        $game
    )

    $MqttClient.Publish("/playnite/game/installed", [System.Text.Encoding]::UTF8.GetBytes($game.Id.toString()), 2, 0)
}

function global:OnGameUninstalled()
{
    param(
        $game
    )

    $MqttClient.Publish("/playnite/game/uninstalled", [System.Text.Encoding]::UTF8.GetBytes($game.Id.toString()), 2, 0)
}

function global:OnGameSelected()
{
    param(
        $selection
    )
}

function global:MQTTMsgReceived
{
    Param(
        [parameter(Mandatory=$true)]$mqtt
    )
    $msg = $([System.Text.Encoding]::ASCII.GetString($mqtt.Message))
    $__logger.Info("Topic: " + $mqtt.topic)
    if ($mqtt.topic -eq "/playnite/game/list/request") {
        PublishLibrary
    }
    if ($mqtt.topic -eq "/playnite/game/play/pc") {
        $gameId = [System.guid]::New($msg)
        $PlayniteApi.StartGame($gameId)        
    }

}

function global:PublishLibrary {
    $__logger.Info('Publishing library')
    $gamesPayload = $PlayniteApi.Database.Games | ConvertTo-Json -Compress
    $MqttClient.Publish("/playnite/game/list", [System.Text.Encoding]::UTF8.GetBytes($gamesPayload), 2, 0)
}

Register-ObjectEvent -inputObject $MqttClient -EventName MqttMsgPublishReceived -Action { MQTTMsgReceived $($args[1]) }
$MqttClient.subscribe("/playnite/game/list/request", 2)
$MqttClient.subscribe("/playnite/game/play/pc", 2)
