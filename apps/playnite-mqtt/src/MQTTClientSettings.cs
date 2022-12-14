using Playnite.SDK;
using Playnite.SDK.Data;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;

namespace MQTTClient
{
    public class MQTTClientSettings : ObservableObject
    {
        private string clientId = "Playnite";
        
        private string deviceId = "playnite";

        private string deviceName = "Desktop Playnite";

        private string serverAdress = "localhost";

        private bool useSecureConnection;

        private string homeAssistantTopic = "homeassistant";

        private int? port = 1883;

        private string username;

        private byte[] password;

        private bool publishCoverColors;

        private bool publishCover = true;

        private bool publishBackground = false;
        
        public string ClientId
        {
            get => clientId;
            set => SetValue(ref clientId, value);
        }
        
        public string DeviceName
        {
            get => deviceName;
            set => SetValue(ref deviceName, value);
        }

        public string DeviceId
        {
            get => deviceId;
            set => SetValue(ref deviceId, value);
        }

        public string ServerAddress
        {
            get => serverAdress;
            set => SetValue(ref serverAdress, value);
        }

        public string Username
        {
            get => username;
            set => SetValue(ref username, value);
        }
        
        public string HomeAssistantTopic
        {
            get => homeAssistantTopic;
            set => SetValue(ref homeAssistantTopic, value);
        }

        public byte[] Password
        {
            get => password;
            set => SetValue(ref password, value);
        }

        public int? Port
        {
            get => port;
            set => SetValue(ref port, value);
        }
        
        public bool UseSecureConnection
        {
            get => useSecureConnection;
            set => SetValue(ref useSecureConnection, value);
        }
        
        public bool PublishCoverColors
        {
            get => publishCoverColors;
            set => SetValue(ref publishCoverColors, value);
        }
        
        public bool PublishCover
        {
            get => publishCover;
            set => SetValue(ref publishCover, value);
        }
        
        public bool PublishBackground
        {
            get => publishBackground;
            set => SetValue(ref publishBackground, value);
        }
    }

    public class MQTTClientSettingsViewModel : ObservableObject, ISettings
    {
        private readonly MQTTClient plugin;

        private MQTTClientSettings settings;
        public MQTTClientSettings Settings
        {
            get => settings;
            set
            {
                settings = value;
                OnPropertyChanged();
            }
        }
        private MQTTClientSettings editingClone { get; set; }

        public MQTTClientSettingsViewModel(MQTTClient plugin)
        {
            // Injecting your plugin instance is required for Save/Load method because Playnite saves data to a location based on what plugin requested the operation.
            this.plugin = plugin;

            // Load saved settings.
            var savedSettings = plugin.LoadPluginSettings<MQTTClientSettings>();

            // LoadPluginSettings returns null if not saved data is available.
            if (savedSettings != null)
            {
                Settings = savedSettings;
            }
            else
            {
                Settings = new MQTTClientSettings();
            }
        }

        public void SavePassword(string password)
        {
            settings.Password = ProtectedData.Protect(Encoding.UTF8.GetBytes(password), plugin.Id.ToByteArray(), DataProtectionScope.CurrentUser);
        }

        #region Implementation of IEditableObject

        public void BeginEdit()
        {
            // Code executed when settings view is opened and user starts editing values.
            editingClone = Serialization.GetClone(Settings);
        }

        public void CancelEdit()
        {
            // Code executed when user decides to cancel any changes made since BeginEdit was called.
            // This method should revert any changes made to Option1 and Option2.
            Settings = editingClone;
        }

        public void EndEdit()
        {
            // Code executed when user decides to confirm changes made since BeginEdit was called.
            // This method should save settings made to Option1 and Option2.
            plugin.SavePluginSettings(Settings);
        }

        #endregion

        #region Implementation of ISettings

        public bool VerifySettings(out List<string> errors)
        {
            // Code execute when user decides to confirm changes made since BeginEdit was called.
            // Executed before EndEdit is called and EndEdit is not called if false is returned.
            // List of errors is presented to user if verification fails.
            errors = new List<string>();
            plugin.StartDisconnect().Wait();
            plugin.StartConnection();
            return true;
        }

        #endregion
    }
}