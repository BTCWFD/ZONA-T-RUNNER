using UnityEngine;

namespace ZonaTRunner.Data
{
    [CreateAssetMenu(fileName = "NewDJProfile", menuName = "ZonaTRunner/DJ Profile")]
    public class DJProfileData : ScriptableObject
    {
        [Header("Identity")]
        public string id;
        public string djName;
        public string bio;
        public string genre;

        [Header("Visuals")]
        public Color primaryColor = Color.cyan;
        public Color accentColor = Color.magenta;
        public GameObject characterPrefab;

        [Header("Audio & Rhythm")]
        public AudioClip musicTrack;
        public float bpm = 130f;
        public float beatOffset = 0f;

        [Header("Gameplay Modifiers")]
        public float speedMultiplier = 1.0f;
        public float coinMultiplier = 1.0f;

        [Header("In-Game Promotion / Native Ads")]
        public string activePromoTitle;
        public string promoCode;
        public string promoUrl;
    }
}
