using MQTTClient.Helpers;
using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Protocol;
using Newtonsoft.Json;
using Playnite.SDK;
using Playnite.SDK.Events;
using Playnite.SDK.Models;
using Playnite.SDK.Plugins;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Controls;

namespace MQTTClient
{
    public class MQTTClient : GenericPlugin
    {
        private static readonly ILogger logger = LogManager.GetLogger();

        private readonly List<MainMenuItem> mainMenuItems;

        private readonly List<SidebarItem> sidebarItems;

        private readonly SidebarItem progressSidebar;

        private readonly IMqttClient client;

        private readonly MQTTClientSettingsViewModel settings;

        private readonly TopicHelper topicHelper;

        private readonly ObjectSerializer serializer;

        private readonly JsonSerializerOptions jsonOptions;

        public MQTTClient(IPlayniteAPI api) : base(api)
        {
            jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            };
            serializer = new ObjectSerializer();
            settings = new MQTTClientSettingsViewModel(this);
            Properties = new GenericPluginProperties
            {
                HasSettings = true
            };

            client = new MqttFactory().CreateMqttClient();
            topicHelper = new TopicHelper(client, settings);
            progressSidebar = new SidebarItem
            {
                Visible = true,
                Title = "MQTT",
                Icon = Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location), "Resources", "icon.png"),
                Activated = SideButtonActivated
            };
            sidebarItems = new List<SidebarItem>
            {
                progressSidebar
            };
            mainMenuItems = new List<MainMenuItem>
            {
                new MainMenuItem
                {
                    Description = "Reconnect", MenuSection = "@MQTT Client", Action = ReconnectMenuAction
                },
                new MainMenuItem
                {
                    Description = "Disconnect", MenuSection = "@MQTT Client", Action = DisconnectMenuAction
                }
            };
        }

        public Task StartDisconnect(bool notify = false)
        {
            var task = Task.CompletedTask;

            if (client.IsConnected)
            {
                if (topicHelper.TryGetTopic(Topics.ConnectionSubTopic, out var connectionTopic) &&
                    topicHelper.TryGetTopic(Topics.SelectedGameStatusSubTopic, out var selectedGameStatusTopic))
                {
                    task = client.PublishStringAsync(connectionTopic, "offline", retain: true)
                        .ContinueWith(async t => await client.PublishStringAsync(selectedGameStatusTopic, "offline", retain: true));
                }

                task = task.ContinueWith(async r => await client.DisconnectAsync())
                    .ContinueWith(
                        t =>
                        {
                            if (notify && !client.IsConnected)
                            {
                                PlayniteApi.Dialogs.ShowMessage("MQTT Disconnected");
                            }
                        });
            }

            return task;
        }

        public GlobalProgressResult StartConnection(bool notifyCompletion = false)
        {
            if (client.IsConnected)
            {
                PlayniteApi.Notifications.Add(
                    new NotificationMessage(Guid.NewGuid().ToString(), "Connection to MQTT underway", NotificationType.Error));
                throw new Exception("Connection to MQTT underway");
            }

            return PlayniteApi.Dialogs.ActivateGlobalProgress(
                args =>
                {
                    args.CurrentProgressValue = -1;
                    var optionsUnBuilt = new MqttClientOptionsBuilder().WithClientId(settings.Settings.ClientId)
                        .WithTcpServer(settings.Settings.ServerAddress, settings.Settings.Port)
                        .WithCredentials(settings.Settings.Username, LoadPassword())
                        .WithCleanSession();

                    if (settings.Settings.UseSecureConnection)
                    {
                        optionsUnBuilt = optionsUnBuilt.WithTls();
                    }

                    var options = optionsUnBuilt.Build();

                    client.ConnectAsync(options, args.CancelToken)
                        .ContinueWith(
                            t =>
                            {
                                if (t.Exception != null)
                                {
                                    PlayniteApi.Dialogs.ShowErrorMessage(
                                        $"MQTT: {string.Join(",", t.Exception.InnerExceptions.Select(i => i.Message))}",
                                        "MQTT Error");
                                }
                                else
                                {
                                    if (notifyCompletion && client.IsConnected)
                                    {
                                        PlayniteApi.Dialogs.ShowMessage("MQTT Connected");
                                    }
                                }
                            },
                            args.CancelToken)
                        .Wait(args.CancelToken);
                },
                new GlobalProgressOptions($"Connection to MQTT ({settings.Settings.ServerAddress}:{settings.Settings.Port}) and initial publishing of library.", true));
        }

        private string LoadPassword()
        {
            if (settings.Settings.Password == null)
            {
                return "";
            }

            return Encoding.UTF8.GetString(ProtectedData.Unprotect(settings.Settings.Password, Id.ToByteArray(), DataProtectionScope.CurrentUser));
        }

        private void SideButtonActivated()
        {
            if (client.IsConnected)
            {
                StartDisconnect(true);
            }
            else
            {
                StartConnection(true);
            }
        }

        private async Task ClientOnConnectedAsync(EventArgs eventArgs)
        {
            logger.Debug("MQTT client connected");
            progressSidebar.ProgressValue = 100;

            if (topicHelper.TryGetTopic(Topics.ConnectionSubTopic, out var connectionTopic))
            {
                await client.PublishStringAsync(connectionTopic, "online", retain: true);
            }

            await PublishGames(PlayniteApi.Database.Games);
            PlayniteApi.Database.Games.ItemCollectionChanged += Games_ItemCollectionChanged;
            PlayniteApi.Database.Games.ItemUpdated += Games_ItemUpdated;
        }

        private void DisconnectMenuAction(MainMenuItemActionArgs obj)
        {
            StartDisconnect().ContinueWith(t => PlayniteApi.Dialogs.ShowMessage("MQTT Disconnected Successfully")).Wait(TimeSpan.FromSeconds(3));
        }

        private void ReconnectMenuAction(MainMenuItemActionArgs obj)
        {
            StartDisconnect().ContinueWith(r => StartConnection(true)).Wait();
        }

        private Task ClientOnDisconnectedAsync(EventArgs eventArgs)
        {
            PlayniteApi.Database.Games.ItemCollectionChanged -= Games_ItemCollectionChanged;
            PlayniteApi.Database.Games.ItemUpdated -= Games_ItemUpdated;
            progressSidebar.ProgressValue = -1;
            return Task.CompletedTask;
        }

        private async Task<MqttClientPublishResult> PublishFileAsync(
            string topic,
            string filePath = null,
            MqttQualityOfServiceLevel qualityOfServiceLevel = MqttQualityOfServiceLevel.AtMostOnce,
            bool retain = false,
            CancellationToken cancellationToken = default)
        {
            if (!string.IsNullOrEmpty(filePath))
            {
                var fullPath = PlayniteApi.Database.GetFullFilePath(filePath);
                var assetId = filePath.Split('\\').Last();
                if (File.Exists(fullPath))
                {
                    using (var fileStream = File.OpenRead(fullPath))
                    {
                        var result = new byte[fileStream.Length];
                        await fileStream.ReadAsync(result, 0, result.Length, cancellationToken);
                        return await client.PublishBinaryAsync(
                            $"{topic}/{assetId}",
                            result,
                            retain: retain,
                            qualityOfServiceLevel: qualityOfServiceLevel,
                            cancellationToken: cancellationToken);
                    }
                }
            }

            return await client.PublishBinaryAsync(
                topic,
                retain: retain,
                qualityOfServiceLevel: qualityOfServiceLevel,
                cancellationToken: cancellationToken);
        }


        private async Task PublishGames(IEnumerable<Game> games, bool isUpdate = false)
        {
            await client.PublishStringAsync($"playnite/library/refreshing", "", retain: false, qualityOfServiceLevel: MqttQualityOfServiceLevel.AtLeastOnce);
            if (!games.Any())
            {
                return;
            }

            logger.Info("Publishing game library.");
            var topicPart = $"playnite/{Topics.LibrarySubTopic}";
            if (isUpdate)
            {
                logger.Debug("Publishing as updates.");
                topicPart = $"{topicPart}/update";
            }

            logger.Info($"Publishing {games.Count()} games.");
            await client.PublishStringAsync($"{topicPart}/games/attributes", serializer.Serialize(games), retain: false, qualityOfServiceLevel: MqttQualityOfServiceLevel.AtLeastOnce);

            var platforms = games.Where(game => game.Platforms != null).SelectMany(game => game.Platforms).Distinct();
            logger.Info($"Publishing {platforms.Count()} platforms.");
            await client.PublishStringAsync($"{topicPart}/platforms/attributes", serializer.Serialize(platforms), retain: false, qualityOfServiceLevel: MqttQualityOfServiceLevel.AtLeastOnce);

            foreach (var game in games)
            {
                await PublishFileAsync($"{topicPart}/game/{game.Id}/attributes/asset", game.CoverImage, MqttQualityOfServiceLevel.AtLeastOnce, false);
                await PublishFileAsync($"{topicPart}/game/{game.Id}/attributes/asset", game.BackgroundImage, MqttQualityOfServiceLevel.AtLeastOnce, false);
            }
            foreach (var platform in platforms)
            {
                await PublishFileAsync($"{topicPart}/platform/{platform.Id}/attributes/asset", platform.Cover, MqttQualityOfServiceLevel.AtLeastOnce, false);
                await PublishFileAsync($"{topicPart}/platform/{platform.Id}/attributes/asset", platform.Background, MqttQualityOfServiceLevel.AtLeastOnce, false);
                await PublishFileAsync($"{topicPart}/platform/{platform.Id}/attributes/asset", platform.Icon, MqttQualityOfServiceLevel.AtLeastOnce, false);
            }
            await client.PublishStringAsync($"playnite/library/refreshed", "", retain: false, qualityOfServiceLevel: MqttQualityOfServiceLevel.AtLeastOnce);
        }

        private void Games_ItemUpdated(object sender, ItemUpdatedEventArgs<Game> e)
        {
            logger.Debug($"{e.UpdatedItems.Count()} updated games to be published.");
            var games = e.UpdatedItems.Where(shouldPublishPropertyUpdate).Select(game => game.NewData);
            Task.Run(async () => await PublishGames(games, true)).Wait(CancellationToken.None);
        }

        private bool shouldPublishPropertyUpdate(ItemUpdateEvent<Game> arg)
        {
            return true;
        }

        private void Games_ItemCollectionChanged(object sender, ItemCollectionChangedEventArgs<Game> e)
        {
            logger.Debug($"{e.AddedItems.Count()} added games to be published.");
            Task.Run(async () => await PublishGames(e.AddedItems, true)).Wait(CancellationToken.None);
        }

        #region Overrides of Plugin

        public override Guid Id { get; } = Guid.Parse("6d116e57-cebb-4ef0-a1ed-030a8aa6a7e7");

        public override void OnLibraryUpdated(OnLibraryUpdatedEventArgs args)
        {
        }

        public override void Dispose()
        {
            client.Dispose();
            base.Dispose();
        }

        public override void OnGameInstalled(OnGameInstalledEventArgs args)
        {

            var payload = new { Id = args.Game.Id, state = "installed" };
            Task.Run(
                async () => await client.PublishStringAsync($"playnite/{Topics.LibrarySubTopic}/game/state", System.Text.Json.JsonSerializer.Serialize(payload, jsonOptions), retain: false, qualityOfServiceLevel: MqttQualityOfServiceLevel.AtLeastOnce));
        }

        public override void OnGameStarted(OnGameStartedEventArgs args)
        {
            var payload = new { Id = args.Game.Id, state = "started" };
            Task.Run(
                async () => await client.PublishStringAsync($"playnite/{Topics.LibrarySubTopic}/game/state", System.Text.Json.JsonSerializer.Serialize(payload, jsonOptions), retain: false, qualityOfServiceLevel: MqttQualityOfServiceLevel.AtLeastOnce));
        }

        public override void OnGameStarting(OnGameStartingEventArgs args)
        {
            var payload = new { Id = args.Game.Id, state = "starting" };
            Task.Run(
                async () => await client.PublishStringAsync($"playnite/{Topics.LibrarySubTopic}/game/state", System.Text.Json.JsonSerializer.Serialize(payload, jsonOptions), retain: false, qualityOfServiceLevel: MqttQualityOfServiceLevel.AtLeastOnce));
        }

        public override void OnGameStopped(OnGameStoppedEventArgs args)
        {
            var payload = new { Id = args.Game.Id, state = "stopped" };
            Task.Run(
                async () => await client.PublishStringAsync($"playnite/{Topics.LibrarySubTopic}/game/state", System.Text.Json.JsonSerializer.Serialize(payload, jsonOptions), retain: false, qualityOfServiceLevel: MqttQualityOfServiceLevel.AtLeastOnce));
        }

        public override void OnGameUninstalled(OnGameUninstalledEventArgs args)
        {
            var payload = new { Id = args.Game.Id, state = "uninstalled" };
            Task.Run(
                async () => await client.PublishStringAsync($"playnite/{Topics.LibrarySubTopic}/game/state", System.Text.Json.JsonSerializer.Serialize(payload, jsonOptions), retain: false, qualityOfServiceLevel: MqttQualityOfServiceLevel.AtLeastOnce));
        }

        public override void OnApplicationStarted(OnApplicationStartedEventArgs args)
        {
            client.ConnectedAsync += ClientOnConnectedAsync;
            client.DisconnectedAsync += ClientOnDisconnectedAsync;
            StartConnection();
        }

        public override void OnApplicationStopped(OnApplicationStoppedEventArgs args)
        {
            client.ConnectedAsync -= ClientOnConnectedAsync;
            client.DisconnectedAsync -= ClientOnDisconnectedAsync;
            StartDisconnect();
        }

        public override IEnumerable<SidebarItem> GetSidebarItems()
        {
            return sidebarItems;
        }

        public override IEnumerable<MainMenuItem> GetMainMenuItems(GetMainMenuItemsArgs args)
        {
            return mainMenuItems;
        }

        public override ISettings GetSettings(bool firstRunSettings)
        {
            return settings;
        }

        public override UserControl GetSettingsView(bool firstRunSettings)
        {
            return new MQTTClientSettingsView();
        }

        #endregion
    }
}