using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

public class FixURP
{
    [MenuItem("ZonaTRunner/1. SOLUCIONAR PANTALLA ROSADA")]
    public static void ApplyURP()
    {
        string path = "Assets/UniversalRenderPipelineAsset.asset";
        var pipelineAsset = AssetDatabase.LoadAssetAtPath<UniversalRenderPipelineAsset>(path);
        
        if (pipelineAsset == null)
        {
            // Create URP Asset if it doesn't exist
            pipelineAsset = ScriptableObject.CreateInstance<UniversalRenderPipelineAsset>();
            AssetDatabase.CreateAsset(pipelineAsset, path);
            AssetDatabase.SaveAssets();
        }

        // Assign to Graphics Settings
        GraphicsSettings.defaultRenderPipeline = pipelineAsset;
        QualitySettings.renderPipeline = pipelineAsset;
        
        Debug.Log("[ZONA T] ¡Pantalla rosada solucionada! URP asignado correctamente.");
    }
}
