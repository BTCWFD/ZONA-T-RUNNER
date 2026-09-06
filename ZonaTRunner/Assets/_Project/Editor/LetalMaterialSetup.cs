using UnityEngine;
using UnityEditor;
using UnityEngine.Rendering.Universal;

/// <summary>
/// Creates URP Lit materials for LETAL character:
/// - Black latex suit with high smoothness
/// - Neon purple violin with emission
/// - Skin material with warm tones
/// Run from menu: ZonaTRunner > Create LETAL Materials
/// </summary>
public class LetalMaterialSetup
{
    private const string MAT_PATH = "Assets/_Project/Characters/LETAL/Materials";
    private static readonly string SHADER_NAME = "Universal Render Pipeline/Lit";

    [MenuItem("ZonaTRunner/Create LETAL Materials")]
    public static void CreateMaterials()
    {
        // Ensure folder exists
        if (!AssetDatabase.IsValidFolder(MAT_PATH))
        {
            AssetDatabase.CreateFolder("Assets/_Project/Characters/LETAL", "Materials");
        }

        CreateLatexMaterial();
        CreateNeonViolinMaterial();
        CreateSkinMaterial();
        CreateCatEarMaterial();

        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();
        Debug.Log("[LETAL] All materials created successfully!");
    }

    private static void CreateLatexMaterial()
    {
        var mat = new Material(Shader.Find(SHADER_NAME));
        mat.name = "MAT_LETAL_Latex";

        // Black latex: very dark base, extremely high smoothness for reflections
        mat.SetColor("_BaseColor", new Color(0.02f, 0.02f, 0.03f, 1f));
        mat.SetFloat("_Smoothness", 0.95f);
        mat.SetFloat("_Metallic", 0.15f);

        // Subtle purple rim emission for neon club feel
        mat.EnableKeyword("_EMISSION");
        mat.SetColor("_EmissionColor", new Color(0.15f, 0.0f, 0.25f, 1f));
        mat.globalIlluminationFlags = MaterialGlobalIlluminationFlags.RealtimeEmissive;

        AssetDatabase.CreateAsset(mat, $"{MAT_PATH}/MAT_LETAL_Latex.mat");
        Debug.Log("[LETAL] Created: MAT_LETAL_Latex.mat");
    }

    private static void CreateNeonViolinMaterial()
    {
        var mat = new Material(Shader.Find(SHADER_NAME));
        mat.name = "MAT_Violin_Neon";

        // Translucent purple body
        mat.SetColor("_BaseColor", new Color(0.3f, 0.0f, 0.5f, 1f));
        mat.SetFloat("_Smoothness", 0.8f);
        mat.SetFloat("_Metallic", 0.0f);

        // Strong neon purple glow
        mat.EnableKeyword("_EMISSION");
        mat.SetColor("_EmissionColor", new Color(0.8f, 0.0f, 1.0f, 1f) * 3f);
        mat.globalIlluminationFlags = MaterialGlobalIlluminationFlags.RealtimeEmissive;

        AssetDatabase.CreateAsset(mat, $"{MAT_PATH}/MAT_Violin_Neon.mat");
        Debug.Log("[LETAL] Created: MAT_Violin_Neon.mat");
    }

    private static void CreateSkinMaterial()
    {
        var mat = new Material(Shader.Find(SHADER_NAME));
        mat.name = "MAT_LETAL_Skin";

        // Warm latina skin tone
        mat.SetColor("_BaseColor", new Color(0.82f, 0.64f, 0.52f, 1f));
        mat.SetFloat("_Smoothness", 0.35f);
        mat.SetFloat("_Metallic", 0.0f);

        AssetDatabase.CreateAsset(mat, $"{MAT_PATH}/MAT_LETAL_Skin.mat");
        Debug.Log("[LETAL] Created: MAT_LETAL_Skin.mat");
    }

    private static void CreateCatEarMaterial()
    {
        var mat = new Material(Shader.Find(SHADER_NAME));
        mat.name = "MAT_CatEars";

        // Matte black cat ears
        mat.SetColor("_BaseColor", new Color(0.03f, 0.03f, 0.03f, 1f));
        mat.SetFloat("_Smoothness", 0.25f);
        mat.SetFloat("_Metallic", 0.0f);

        AssetDatabase.CreateAsset(mat, $"{MAT_PATH}/MAT_CatEars.mat");
        Debug.Log("[LETAL] Created: MAT_CatEars.mat");
    }
}
