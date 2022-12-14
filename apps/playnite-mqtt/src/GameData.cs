

using ColorThiefDotNet;
using Playnite.SDK.Models;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
// ReSharper disable MemberCanBePrivate.Global
// ReSharper disable NotAccessedField.Global

namespace MQTTClient
{
    public readonly struct GameData
    {
        public readonly string Name;

        public readonly string Description;

        public readonly string Id;

        public readonly bool Hidden;

        public readonly List<string> Platforms;

        public readonly List<string> Categories;

        public readonly List<string> Tags;

        public readonly string Source;

        public readonly bool Favorite;

        public readonly string CoverImage;

        public readonly ObservableCollection<Link> Links;

        public readonly List<string> Features;

        public readonly List<string> Genres;

        public readonly double Hue;
        
        public readonly double Saturation;

        public readonly double Brightness;

        public readonly Game RawData;

        public GameData(Game game, Color color)
        {
            RawData = game;
            Name = game.Name;
            Id = game.GameId;
            Description = game.Description;
            Hidden = game.Hidden;
            Platforms = game.Platforms?.Select(p => p.Name).ToList();
            Categories = game.Categories?.Select(c => c.Name).ToList();
            Tags = game.Tags?.Select(t => t.Name).ToList();
            Source = game.Source?.Name;
            Favorite = game.Favorite;
            CoverImage = game.CoverImage;
            Links = game.Links;
            Features = game.Features?.Select(f => f.Name).ToList();
            Genres = game.Genres?.Select(f => f.Name).ToList();
            var hsl = color.ToHsl();
            Hue = Math.Round(hsl.H * 100.0) / 100.0;
            Saturation = Math.Round(hsl.S * 100.0) / 100.0;
            Brightness = Math.Round(hsl.L * 100.0) / 100.0;
        }
    }
}