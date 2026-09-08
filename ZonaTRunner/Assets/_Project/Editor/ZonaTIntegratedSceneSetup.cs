using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using ZonaTRunner.World;
using ZonaTRunner.Player;
using ZonaTRunner.Core;

public class ZonaTIntegratedSceneSetup
{
    [MenuItem("ZonaTRunner/Build Zona T Playable Game Scene")]
    public static void BuildScene()
    {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);

        // 1. Atmosphere & Lighting (Bogotá Cyberpunk Night)
        RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Flat;
        RenderSettings.ambientLight = new Color(0.08f, 0.06f, 0.14f);
        RenderSettings.fog = true;
        RenderSettings.fogMode = FogMode.ExponentialSquared;
        RenderSettings.fogDensity = 0.015f;
        RenderSettings.fogColor = new Color(0.05f, 0.03f, 0.09f);

        var sunObj = GameObject.Find("Directional Light");
        if (sunObj != null)
        {
            var sun = sunObj.GetComponent<Light>();
            sun.color = new Color(0.25f, 0.35f, 0.65f);
            sun.intensity = 0.35f;
            sun.transform.rotation = Quaternion.Euler(45f, -30f, 0f);
        }

        // 2. GameManager & State Setup
        GameObject gmObj = new GameObject("GameManager");
        var gm = gmObj.AddComponent<GameManager>();

        // 3. Player GameObject with Controller
        GameObject playerObj = new GameObject("Player");
        playerObj.tag = "Player";
        playerObj.transform.position = new Vector3(0f, 0f, 0f);

        var cc = playerObj.AddComponent<CharacterController>();
        cc.center = new Vector3(0f, 0.9f, 0f);
        cc.radius = 0.4f;
        cc.height = 1.8f;

        var pc = playerObj.AddComponent<PlayerController>();
        playerObj.AddComponent<SwipeInputHandler>();

        // Attach visual model (DJs Letal & Núñez)
        GameObject djsPrefab = AssetDatabase.LoadAssetAtPath<GameObject>("Assets/_Project/Characters/DJs_Letal_Nunez_Models.fbx");
        if (djsPrefab != null)
        {
            GameObject djsVisual = (GameObject)PrefabUtility.InstantiatePrefab(djsPrefab, playerObj.transform);
            djsVisual.name = "DJ_Visual_Model";
            djsVisual.transform.localPosition = Vector3.zero;
        }

        // 4. Map Segment Prefab Setup
        GameObject mapPrefab = AssetDatabase.LoadAssetAtPath<GameObject>("Assets/_Project/Prefabs/ZonaT_Bogota_Map.fbx");
        if (mapPrefab != null)
        {
            // Spawn initial stretches of Zona T street (0 to 320m)
            for (int i = 0; i < 4; i++)
            {
                GameObject seg = (GameObject)PrefabUtility.InstantiatePrefab(mapPrefab);
                seg.name = $"ZonaT_Segment_{i}";
                seg.transform.position = new Vector3(0f, 0f, i * 80f);
            }
        }

        // 5. TrackSpawner
        GameObject spawnerObj = new GameObject("TrackSpawner");
        var spawner = spawnerObj.AddComponent<TrackSpawner>();
        var spawnerSo = new SerializedObject(spawner);
        if (mapPrefab != null)
        {
            var prefabsProp = spawnerSo.FindProperty("trackSegmentPrefabs");
            prefabsProp.arraySize = 1;
            prefabsProp.GetArrayElementAtIndex(0).objectReferenceValue = mapPrefab;
        }
        spawnerSo.FindProperty("segmentLength").floatValue = 80f;
        spawnerSo.FindProperty("initialSegments").intValue = 4;
        spawnerSo.FindProperty("despawnDistance").floatValue = 120f;
        spawnerSo.FindProperty("playerTransform").objectReferenceValue = playerObj.transform;
        spawnerSo.ApplyModifiedProperties();

        // 6. Camera Follow
        var cam = Camera.main;
        if (cam != null)
        {
            cam.transform.position = new Vector3(0f, 4.2f, -6.5f);
            cam.transform.rotation = Quaternion.Euler(22f, 0f, 0f);
            cam.backgroundColor = new Color(0.04f, 0.02f, 0.08f);
            cam.clearFlags = CameraClearFlags.SolidColor;

            var follow = cam.gameObject.AddComponent<CameraFollow>();
            var followSo = new SerializedObject(follow);
            followSo.FindProperty("target").objectReferenceValue = playerObj.transform;
            followSo.FindProperty("offset").vector3Value = new Vector3(0f, 4.2f, -6.5f);
            followSo.ApplyModifiedProperties();
        }

        // Save Scene
        string scenePath = "Assets/_Project/Scenes/ZonaT_Playable_Scene.unity";
        EditorSceneManager.SaveScene(scene, scenePath);
        Debug.Log($"=== ZONA T PLAYABLE SCENE BUILT SUCCESSFULLY: {scenePath} ===");
    }
}
