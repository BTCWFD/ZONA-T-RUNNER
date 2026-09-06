using UnityEngine;
using UnityEditor;
using System.IO;

/// <summary>
/// Editor utility to configure LETAL FBX import settings
/// as a Humanoid rig ready for Unity Mecanim.
/// Run from menu: ZonaTRunner > Setup LETAL Character
/// </summary>
public class LetalCharacterImporter : AssetPostprocessor
{
    private const string LETAL_PATH = "Assets/_Project/Characters/LETAL";

    void OnPreprocessModel()
    {
        // Only apply to FBX files inside LETAL folder
        if (!assetPath.Contains(LETAL_PATH)) return;
        if (!assetPath.EndsWith(".fbx")) return;

        ModelImporter importer = (ModelImporter)assetImporter;

        // --- Rig settings ---
        importer.animationType = ModelImporterAnimationType.Human;
        importer.avatarSetup   = ModelImporterAvatarSetup.CreateFromThisModel;
        importer.optimizeGameObjects = true;

        // --- Mesh settings ---
        importer.meshCompression      = ModelImporterMeshCompression.Low;
        importer.isReadable           = false;
        importer.importBlendShapes    = true;
        importer.importVisibility     = true;
        importer.importCameras        = false;
        importer.importLights         = false;
        importer.generateSecondaryUV  = true;   // needed for lightmaps

        // --- Material settings ---
        importer.materialImportMode = ModelImporterMaterialImportMode.ImportViaMaterialDescription;
        importer.materialLocation   = ModelImporterMaterialLocation.InPrefab;

        Debug.Log($"[LETAL Importer] Configured Humanoid rig for: {assetPath}");
    }

    void OnPreprocessAnimation()
    {
        if (!assetPath.Contains(LETAL_PATH)) return;
        if (!assetPath.Contains("/Animations/")) return;

        ModelImporter importer = (ModelImporter)assetImporter;
        importer.animationType          = ModelImporterAnimationType.Human;
        importer.avatarSetup            = ModelImporterAvatarSetup.CopyFromOther;
        importer.sourceAvatar           = AssetDatabase.LoadAssetAtPath<Avatar>(
            $"{LETAL_PATH}/LETAL_Base.fbx");

        Debug.Log($"[LETAL Importer] Configured animation: {assetPath}");
    }
}
