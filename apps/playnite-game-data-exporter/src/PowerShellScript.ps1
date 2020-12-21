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
    $MqttClient.Disconnect()
}

function global:OnLibraryUpdated()
{
    $global:PublishLibrary()
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

function global:MQTTMsgReceived
{
    Param(
        [parameter(Mandatory=$true)]$mqtt
    )
    $msg = $([System.Text.Encoding]::ASCII.GetString($mqtt.Message))
    $__logger.Info("Topic: " + $mqtt.topic)
    if ($mqtt.topic == "/playnite/game/list/request") {
        $global:PublishLibrary()
    }
}

function global:PublishLibrary {
    $__logger.Info('Publishing library')
    $gamesPayload = $PlayniteApi.Database.Games | ConvertTo-Json -Compress
    $MqttClient.Publish("/playnite/game/list", [System.Text.Encoding]::UTF8.GetBytes($gamesPayload), 2, 0)
}

Register-ObjectEvent -inputObject $MqttClient -EventName MqttMsgPublishReceived -Action { MQTTMsgReceived $($args[1]) }