using System;
using UnityEngine;

namespace ZonaTRunner.Data
{
    /// <summary>
    /// Modelo de deserializacion de data/djs/roster.json — la fuente unica de verdad
    /// del roster, compartida con el prototipo web. Las clases reflejan el schema
    /// (data/djs/dj_schema.json) uno a uno porque JsonUtility no soporta diccionarios.
    /// No editar DJs aqui ni en el inspector: editarlos en el JSON.
    /// </summary>
    [Serializable]
    public class DJRoster
    {
        public string version;
        public string updatedAt;
        public DJEntry[] djs;
    }

    [Serializable]
    public class DJEntry
    {
        public string id;
        public string name;
        public string slug;
        public string bio;
        public string genre;
        public string tier;
        public int unlockCost;
        public int sortOrder;

        public DJCharacter character;
        public DJVisualIdentity visualIdentity;
        public DJWorld world;
        public DJMusic music;
        public DJStats stats;
        public string[] residencies;
        public DJPromotion[] promotions;
        public DJSocialLinks socialLinks;
        public DJMetadata metadata;

        public bool IsPlayable => tier == "free" || tier == "unlockable";
    }

    [Serializable] public class DJCharacter
    {
        public string prefab;
        public string displayName;
        public string avatar;
        public bool isFemale;
    }

    [Serializable] public class DJVisualIdentity
    {
        public string primaryColor;
        public string accentColor;
        public string particleColor;
    }

    [Serializable] public class DJWorld
    {
        public string themeId;
        public string fogColor;
        public string groundColor;
        public string ambientLight;
        public string weatherEffect;
    }

    [Serializable] public class DJMusicStems
    {
        public string drums;
        public string bass;
        public string synth;
        public string vocals;
    }

    [Serializable] public class DJMusic
    {
        public float bpm;
        public string mainTrack;
        public DJMusicStems stems;
        public float intensity;
        public float synthFreq;
    }

    [Serializable] public class DJStats
    {
        public float laneSwitchSpeed = 1f;
        public float jumpForce = 1f;
        public float slideSpeed = 1f;
        public float coinMultiplier = 1f;
        public float scoreMultiplier = 1f;
        public string specialAbility;
        public string abilityName;
        public string abilityDescription;
    }

    [Serializable] public class DJPromotion
    {
        public string promoId;
        public string title;
        public string code;
        public string discount;
        public string venue;
        public bool active;
    }

    [Serializable] public class DJSocialLinks
    {
        public string instagram;
        public string soundcloud;
        public string spotify;
    }

    [Serializable] public class DJMetadata
    {
        public string version;
        public string realName;
        public string status;
        public string source;
    }
}
