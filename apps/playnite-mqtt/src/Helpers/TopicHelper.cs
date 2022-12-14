using MQTTnet.Client;

namespace MQTTClient.Helpers
{
    public class TopicHelper
    {
        private readonly IMqttClient client;

        private readonly MQTTClientSettingsViewModel settings;

        public TopicHelper(IMqttClient client, MQTTClientSettingsViewModel settings)
        {
            this.client = client;
            this.settings = settings;
        }

        public bool TryGetTopic(string subTopic,out string topicOut)
        {
            if (!client.IsConnected || string.IsNullOrEmpty(settings.Settings.DeviceId))
            {
                topicOut = null;
                return false;
            }
            
            if (!string.IsNullOrEmpty(subTopic))
            {
                topicOut = $"playnite/{settings.Settings.DeviceId}/{subTopic}";
                return true;
            }
            
            topicOut = null;
            return false;
        }
    }
}