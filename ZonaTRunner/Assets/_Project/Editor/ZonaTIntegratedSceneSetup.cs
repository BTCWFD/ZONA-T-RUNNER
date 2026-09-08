using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using ZonaTRunner.World;
using ZonaTRunner.Player;
using ZonaTRunner.Core;

public class ZonaTIntegratedSceneSetup
{
    [MenuItem("ZonaTRunner/Build Zona T Integrated Scene")]
    public static void BuildScene()
    {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);

        // 1. Atmosphere & Lighting
        RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Flat;
        RenderSettings.ambientLight = new Color(0.05f, 0.08f, 0.12f);
        RenderSettings.fog = true;
        RenderSettings.fogMode = FogMode.ExponentialSquared;
        RenderSettings.fogDensity = 0.012f;
        RenderSettings.fogColor = new Color(0.04f, 0.03f, 0.08f);

        var sunObj = GameObject.Find("Directional Light");
        if (sunObj != null)
        {
            var sun = sunObj.GetComponent<Light>();
            sun.color = new Color(0.2f, 0.35f, 0.55f);
            sun.intensity = 0.4f;
            sun.transform.rotation = Quaternion.Euler(50f, -30f, 0f);
        }

        // 2. Instantiate Blender Zona T 3D Map
        GameObject mapPrefab = AssetDatabase.LoadAssetAtPath<GameObject>("Assets/_Project/Prefabs/ZonaT_Bogota_Map.fbx");
        GameObject mapInstance = null;
        if (mapPrefab != null)
        {
            mapInstance = (GameObject)PrefabUtility.InstantiatePrefab(mapPrefab);
            mapInstance.name = "ZonaT_Bogota_Map_Segment_0";
            mapInstance.transform.position = Vector3.zero;
        }
        else
        {
            Debug.LogWarning("[ZonaT] Map FBX not found at Assets/_Project/Prefabs/ZonaT_Bogota_Map.fbx");
        }

        // 3. Instantiate Characters Models from Blender
        GameObject djsPrefab = AssetDatabase.LoadAssetAtPath<GameObject>("Assets/_Project/Characters/DJs_Letal_Nunez_Models.fbx");
        if (djsPrefab != null)
        {
            GameObject djsInstance = (GameObject)PrefabUtility.InstantiatePrefab(djsPrefab);
            djsInstance.name = "Characters_DJs_Letal_Nunez";
            djsInstance.transform.position = new Vector3(0f, 0f, 2f);
        }

        // 4. Track Spawner Setup
        GameObject spawnerObj = new GameObject("TrackSpawner");
        var spawner = spawnerObj.AddComponent<TrackSpawner>();

        // 5. Main Camera Follow
        var cam = Camera.main;
        if (cam != null)
        {
            cam.transform.position = new Vector3(0f, 4.2f, -6.5f);
            cam.transform.rotation = Quaternion.Euler(22f, 0f, 0f);
            cam.backgroundColor = new Color(0.03f, 0.02f, 0.06f);
            cam.clearFlags = CameraClearFlags.SolidColor;
        }

        string scenePath = "Assets/_Project/Scenes/ZonaT_Playable_Scene.unity";
        System.IO.Directory.CreateDirectory("Assets/_Project/Scenes");
        EditorSceneManager.SaveScene(scene, scenePath);
        Debug.Log($"[ZonaT] Scene successfully created and saved at: {scenePath}");
    }
}
