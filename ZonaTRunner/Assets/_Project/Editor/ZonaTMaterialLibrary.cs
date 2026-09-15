using System.Collections.Generic;
using UnityEditor;
using UnityEngine;

namespace ZonaTRunner.EditorTools
{
    /// <summary>
    /// Construye la biblioteca de materiales URP premium de ZONA T RUNNER
    /// (pista in-game, pista real-time). Un solo shader URP/Lit por material,
    /// con emisión para el neón, para que el look "premium" no cueste draw calls.
    ///
    /// Ejecutar: menú "ZonaT/Arte/Construir materiales URP premium".
    /// Los materiales quedan en Assets/_Project/05_Art/Materials/ y se pueden
    /// asignar a los prefabs del kit (blender_map/track_kit/).
    ///
    /// Presupuesto: estos materiales respetan los tiers de docs/QUALITY_TIERS.md.
    /// El neón NO usa luces reales (caras), usa emisión + Bloom del Volume URP.
    /// </summary>
    public static class ZonaTMaterialLibrary
    {
        private const string Dir = "Assets/_Project/05_Art/Materials";

        private struct Spec
        {
            public string name;
            public Color baseColor;
            public float metallic;
            public float smoothness;
            public Color emission;   // negro = sin emisión
            public float emissionIntensity;
        }

        [MenuItem("ZonaT/Arte/Construir materiales URP premium")]
        public static void Build()
        {
            EnsureDir(Dir);
            Shader lit = Shader.Find("Universal Render Pipeline/Lit");
            if (lit == null)
            {
                Debug.LogError("[ZonaT] No se encontró el shader URP/Lit. ¿Está URP instalado?");
                return;
            }

            var specs = new List<Spec>
            {
                // --- Superficie de pista ---
                new Spec { name="M_WetAsphalt", baseColor=Hex("0a0d12"), metallic=0.55f, smoothness=0.9f },
                new Spec { name="M_Concrete",   baseColor=Hex("2a2a2d"), metallic=0f,    smoothness=0.25f },
                new Spec { name="M_BogotaBrick", baseColor=Hex("6e2d1a"), metallic=0f,   smoothness=0.2f },
                new Spec { name="M_Sidewalk",   baseColor=Hex("1a1e24"), metallic=0f,    smoothness=0.35f },
                new Spec { name="M_DarkMetal",  baseColor=Hex("15171c"), metallic=0.9f,  smoothness=0.7f },
                new Spec { name="M_ClubGlass",  baseColor=Hex("05050c"), metallic=0.6f,  smoothness=0.95f },
                new Spec { name="M_Speaker",    baseColor=Hex("08080a"), metallic=0.1f,  smoothness=0.4f },
                // --- Neón / emisivos (color de acento por DJ) ---
                new Spec { name="M_Neon_Cyan",    baseColor=Hex("003133"), emission=Hex("00fff0"), emissionIntensity=6f },
                new Spec { name="M_Neon_Magenta", baseColor=Hex("330019"), emission=Hex("ff0080"), emissionIntensity=6f },
                new Spec { name="M_Neon_Violet",  baseColor=Hex("1a0033"), emission=Hex("cc00ff"), emissionIntensity=6f },
                new Spec { name="M_Neon_Amber",   baseColor=Hex("331500"), emission=Hex("ff7300"), emissionIntensity=6f },
                new Spec { name="M_Neon_Green",   baseColor=Hex("00331a"), emission=Hex("00ff88"), emissionIntensity=6f },
                new Spec { name="M_YellowLine",   baseColor=Hex("332600"), emission=Hex("ffbf00"), emissionIntensity=1.5f },
                new Spec { name="M_LEDScreen",    baseColor=Hex("330026"), emission=Hex("e600b3"), emissionIntensity=5f },
                new Spec { name="M_Token",        baseColor=Hex("332900"), metallic=0.9f, smoothness=0.8f, emission=Hex("ffbf00"), emissionIntensity=3f },
                new Spec { name="M_Hazard",       baseColor=Hex("f28c00"), metallic=0f, smoothness=0.5f, emission=Hex("e66600"), emissionIntensity=1.2f },
            };

            int n = 0;
            foreach (Spec s in specs)
            {
                var m = new Material(lit) { name = s.name };
                m.SetColor("_BaseColor", s.baseColor);
                m.SetFloat("_Metallic", s.metallic);
                m.SetFloat("_Smoothness", s.smoothness);

                bool emits = s.emission != default && s.emission != Color.black;
                if (emits)
                {
                    m.EnableKeyword("_EMISSION");
                    m.globalIlluminationFlags = MaterialGlobalIlluminationFlags.RealtimeEmissive;
                    m.SetColor("_EmissionColor", s.emission.linear * s.emissionIntensity);
                }

                string path = $"{Dir}/{s.name}.mat";
                var existing = AssetDatabase.LoadAssetAtPath<Material>(path);
                if (existing != null) { existing.CopyPropertiesFromMaterial(m); EditorUtility.SetDirty(existing); }
                else AssetDatabase.CreateAsset(m, path);
                n++;
            }

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log($"[ZonaT] {n} materiales URP premium creados/actualizados en {Dir}. " +
                      "Falta: activar Bloom en el Volume global (ver docs/PBR_PIPELINE.md).");
        }

        private static Color Hex(string hex)
        {
            ColorUtility.TryParseHtmlString("#" + hex, out Color c);
            return c;
        }

        private static void EnsureDir(string path)
        {
            string[] parts = path.Split('/');
            string cur = parts[0];
            for (int i = 1; i < parts.Length; i++)
            {
                string next = cur + "/" + parts[i];
                if (!AssetDatabase.IsValidFolder(next)) AssetDatabase.CreateFolder(cur, parts[i]);
                cur = next;
            }
        }
    }
}
