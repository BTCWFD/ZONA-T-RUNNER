using UnityEngine;
using UnityEditor;
using ZonaTRunner.Data;
using System.IO;

public class DJProfileBuilder
{
    [MenuItem("ZonaTRunner/Generate All 11 DJ Profiles")]
    public static void GenerateProfiles()
    {
        string folder = "Assets/_Project/Data/DJs";
        if (!Directory.Exists(folder))
        {
            Directory.CreateDirectory(folder);
        }

        CreateDJ("dj_fresar", "FRESAR", "Industrial Techno", 138f, new Color(1f, 0f, 0.33f), new Color(0.8f, 0f, 1f), "FRESAR15", "Club Octava - Chapinero");
        CreateDJ("dj_noctua", "NOCTUA", "Melodic & Prog", 124f, new Color(0f, 1f, 1f), new Color(0f, 0.6f, 1f), "NOCTUA2X1", "Terraza 85 - Calle 85");
        CreateDJ("dj_camilo", "CAMILO B2B", "Hardgroove", 142f, new Color(1f, 0.66f, 0f), new Color(1f, 0.2f, 0f), "GROOVE20", "Radio Estrella - Calle 64");
        CreateDJ("dj_valeria", "VALERIA NEON", "Acid & Minimal", 132f, new Color(0f, 1f, 0.4f), new Color(0.2f, 1f, 0.1f), "ACIDNIGHT", "Kaputt Club - Calle 72");
        CreateDJ("dj_bogota_allstars", "ZONA T COLECTIVO", "Underground House", 128f, new Color(0.7f, 0f, 1f), new Color(1f, 0f, 0.5f), "FESTZONAT", "Chamorro City Hall - Autonorte");
        CreateDJ("dj_letal", "LETAL", "Violin Techno", 130f, new Color(0.8f, 0f, 1f), new Color(0.5f, 0f, 1f), "LETAL20", "Club Bling Bling - Zona Rosa");
        CreateDJ("dj_nunez", "DJ NUÑEZ", "Tech House / Groove", 128f, new Color(1f, 0.46f, 0f), new Color(1f, 0.8f, 0f), "NUNEZ15", "Baum Club - Calle 33");
        CreateDJ("dj_tatan", "DJ TATAN", "Peak Time Techno", 134f, new Color(0f, 1f, 0.53f), new Color(0f, 0.8f, 0.3f), "TATANOCTAVA", "Club Octava - Chapinero");
        CreateDJ("dj_molecular", "DJ MOLECULAR", "Psy-Techno & Industrial", 136f, new Color(0f, 0.9f, 1f), new Color(0.1f, 0.3f, 1f), "MOLECULAR_VIP", "Radio Berlin - Chapinero");
        CreateDJ("dj_sthep", "DJ STHEP", "Melodic Techno & Vocal", 126f, new Color(1f, 0f, 0.5f), new Color(1f, 0.4f, 0.8f), "STHEP25", "Kaputt Club - Calle 72");
        CreateDJ("dj_camila_leuro", "CAMILA LEURO", "Deep Minimal & Hypnotic", 124f, new Color(0.66f, 0.33f, 0.97f), new Color(0.4f, 0f, 0.8f), "CAMILAVIP", "Vlak - Parque 93");

        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();
        Debug.Log("[ZONA T] Generated 11 DJ ScriptableObject Profiles!");
    }

    private static void CreateDJ(string id, string name, string genre, float bpm, Color primary, Color accent, string promoCode, string venue)
    {
        string path = $"Assets/_Project/Data/DJs/{id}.asset";
        var profile = AssetDatabase.LoadAssetAtPath<DJProfileData>(path);
        if (profile == null)
        {
            profile = ScriptableObject.CreateInstance<DJProfileData>();
            AssetDatabase.CreateAsset(profile, path);
        }

        profile.id = id;
        profile.djName = name;
        profile.genre = genre;
        profile.bpm = bpm;
        profile.primaryColor = primary;
        profile.accentColor = accent;
        profile.promoCode = promoCode;
        profile.activePromoTitle = $"{name} — Noche en {venue}";
        profile.bio = $"DJ Oficial de la Escena Electrónica de Bogotá en Zona T Runner. Ritmo base: {bpm} BPM.";

        EditorUtility.SetDirty(profile);
    }
}
