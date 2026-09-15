using System;
using System.Collections;
using System.IO;
using UnityEngine;
using UnityEngine.Networking;

namespace ZonaTRunner.Data
{
    /// <summary>
    /// Carga el roster desde StreamingAssets. El archivo lo copia ahi
    /// ContentSync (menu ZonaT o automaticamente al compilar) desde data/djs/roster.json,
    /// que es la fuente unica de verdad compartida con el web-runner.
    /// </summary>
    public class DJRosterLoader : MonoBehaviour
    {
        public const string RosterRelativePath = "data/djs/roster.json";

        public static DJRosterLoader Instance { get; private set; }
        public static event Action<DJRoster> OnRosterLoaded;

        public DJRoster Roster { get; private set; }
        public bool IsLoaded => Roster != null && Roster.djs != null && Roster.djs.Length > 0;

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            StartCoroutine(LoadRoster());
        }

        private IEnumerator LoadRoster()
        {
            string path = Path.Combine(Application.streamingAssetsPath, RosterRelativePath);
            string json = null;

            // En Android StreamingAssets vive dentro del APK: solo se lee via UnityWebRequest.
            if (path.Contains("://") || path.Contains(":///"))
            {
                using UnityWebRequest req = UnityWebRequest.Get(path);
                yield return req.SendWebRequest();
                if (req.result == UnityWebRequest.Result.Success) json = req.downloadHandler.text;
                else Debug.LogError($"[ZonaT] No se pudo leer el roster: {req.error} ({path})");
            }
            else if (File.Exists(path))
            {
                json = File.ReadAllText(path);
            }
            else
            {
                Debug.LogError($"[ZonaT] Falta el roster en {path}. Ejecuta ZonaT > Sincronizar contenido (data -> StreamingAssets).");
            }

            if (string.IsNullOrEmpty(json)) yield break;

            try { Roster = JsonUtility.FromJson<DJRoster>(json); }
            catch (Exception e) { Debug.LogError($"[ZonaT] Roster mal formado: {e.Message}"); yield break; }

            if (!IsLoaded) { Debug.LogError("[ZonaT] El roster se leyo pero llego vacio."); yield break; }

            Array.Sort(Roster.djs, (a, b) => a.sortOrder.CompareTo(b.sortOrder));
            Debug.Log($"[ZonaT] Roster v{Roster.version} cargado: {Roster.djs.Length} DJs.");
            OnRosterLoaded?.Invoke(Roster);
        }

        public DJEntry GetById(string id)
        {
            if (!IsLoaded) return null;
            foreach (var dj in Roster.djs) if (dj.id == id) return dj;
            return null;
        }

        /// <summary>Convierte un color hex del JSON a Color de Unity, con fallback explicito.</summary>
        public static Color ParseColor(string hex, Color fallback)
        {
            return ColorUtility.TryParseHtmlString(hex, out Color c) ? c : fallback;
        }

        /// <summary>Vuelca una entrada del roster sobre un ScriptableObject en runtime.</summary>
        public static void Apply(DJEntry src, DJProfileData dst)
        {
            if (src == null || dst == null) return;
            dst.id = src.id;
            dst.djName = src.name;
            dst.bio = src.bio;
            dst.genre = src.genre;
            dst.primaryColor = ParseColor(src.visualIdentity?.primaryColor, Color.cyan);
            dst.accentColor = ParseColor(src.visualIdentity?.accentColor, Color.magenta);
            if (src.music != null) dst.bpm = src.music.bpm;
            if (src.stats != null) dst.coinMultiplier = src.stats.coinMultiplier;
            if (src.promotions != null && src.promotions.Length > 0)
            {
                dst.activePromoTitle = src.promotions[0].title;
                dst.promoCode = src.promotions[0].code;
            }
        }
    }
}
